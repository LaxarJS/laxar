/**
 * Copyright 2016 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
import * as object from '../utilities/object';

export function create( log, storage ) {

   const api = {
      started,
      resumedOrStarted
   };

   let idCounter = 0;
   const store = storage.getSessionStorage( 'timer' );

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function started( optionalOptions ) {
      const timer = new Timer( optionalOptions );
      timer.start();
      return timer;
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function resumedOrStarted( optionalOptions ) {
      const timer = new Timer( optionalOptions );
      if( !restoreIfPersistent( timer ) ) {
         timer.start();
      }
      return timer;
   }

   function Timer( optionalOptions ) {
      this.options = object.options( optionalOptions, {
         label: 'timer' + idCounter++,
         persistenceKey: null
      } );
      this.startTime = null;
      this.stopTime = null;
      this.splitTimes = [];
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   Timer.prototype.getData = function() {
      return {
         label: this.options.label,
         startTime: this.startTime,
         stopTime: this.stopTime,
         splitTimes: object.deepClone( this.splitTimes )
      };
   };

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   Timer.prototype.start = function() {
      this.startTime = now();

      saveIfPersistent( this );
   };

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   Timer.prototype.splitTime = function( optionalLabel ) {
      this.splitTimes.push( {
         time: now(),
         label: optionalLabel || 'split' + this.splitTimes.length
      } );

      saveIfPersistent( this );
   };

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   Timer.prototype.stop = function() {
      this.stopTime = now();

      removeIfPersistent( this );
   };

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   Timer.prototype.stopAndLog = function( optionalLabel ) {
      this.stop();

      const startTime = this.startTime;
      const endTime = now();
      const label = optionalLabel || 'Timer Stopped';
      this.splitTimes.push( { label, time: endTime } );

      const message = [];
      message.push( 'Timer "', this.options.label, '": ' );
      message.push( 'start at ', new Date( startTime ).toISOString(), ' (client), ' );
      message.push( label, ' after ', ( endTime - startTime ).toFixed( 0 ), 'ms ' );
      message.push( '(checkpoints: ' );
      const intervals = [];
      this.splitTimes.reduce( function( from, data ) {
         intervals.push( '"' + data.label + '"=' + ( data.time - from ).toFixed( 0 ) + 'ms' );
         return data.time;
      }, startTime );
      message.push( intervals.join( ', ' ), ')' );
      log.info( message.join( '' ) );
   };

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function now() {
      // cannot use window.performance, because timings need to be valid across pages:
      return new Date().getTime();
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function saveIfPersistent( timer ) {
      if( timer.options.persistenceKey ) {
         store.setItem( timer.options.persistenceKey, {
            options: timer.options,
            startTime: timer.startTime,
            stopTime: timer.stopTime,
            splitTimes: timer.splitTimes
         } );
      }
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function restoreIfPersistent( timer ) {
      if( timer.options.persistenceKey ) {
         const data = store.getItem( timer.options.persistenceKey );
         if( data ) {
            timer.options = data.options;
            timer.startTime = data.startTime;
            timer.stopTime = data.stopTime;
            timer.splitTimes = data.splitTimes;
            return true;
         }
      }

      return false;
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function removeIfPersistent( timer ) {
      if( timer.options.persistenceKey ) {
         store.removeItem( timer.options.persistenceKey );
      }
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   return api;
}
