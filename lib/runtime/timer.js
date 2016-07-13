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
      this.options_ = object.options( optionalOptions, {
         label: `timer${idCounter++}`,
         persistenceKey: null
      } );
      this.startTime_ = null;
      this.stopTime_ = null;
      this.splitTimes_ = [];
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   Timer.prototype.getData = function() {
      return {
         label: this.options_.label,
         startTime: this.startTime_,
         stopTime: this.stopTime_,
         splitTimes: object.deepClone( this.splitTimes_ )
      };
   };

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   Timer.prototype.start = function() {
      this.startTime_ = now();

      saveIfPersistent( this );
   };

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   Timer.prototype.splitTime = function( optionalLabel ) {
      this.splitTimes_.push( {
         time: now(),
         label: optionalLabel || `split${this.splitTimes_.length}`
      } );

      saveIfPersistent( this );
   };

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   Timer.prototype.stop = function() {
      this.stopTime_ = now();

      removeIfPersistent( this );
   };

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   Timer.prototype.stopAndLog = function( optionalLabel ) {
      this.stop();

      const startTime = this.startTime_;
      const endTime = now();
      const label = optionalLabel || 'Timer Stopped';
      this.splitTimes_.push( { label, time: endTime } );

      const message = [];
      message.push( 'Timer "', this.options_.label, '": ' );
      message.push( 'start at ', new Date( startTime ).toISOString(), ' (client), ' );
      message.push( label, ' after ', ( endTime - startTime ).toFixed( 0 ), 'ms ' );
      message.push( '(checkpoints: ' );
      const intervals = [];
      this.splitTimes_.reduce( ( from, data ) => {
         intervals.push( `"${data.label}"=${( data.time - from ).toFixed( 0 )}ms` );
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
      if( timer.options_.persistenceKey ) {
         store.setItem( timer.options_.persistenceKey, {
            options: timer.options_,
            startTime: timer.startTime_,
            stopTime: timer.stopTime_,
            splitTimes: timer.splitTimes_
         } );
      }
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function restoreIfPersistent( timer ) {
      if( timer.options_.persistenceKey ) {
         const data = store.getItem( timer.options_.persistenceKey );
         if( data ) {
            timer.options_ = data.options;
            timer.startTime_ = data.startTime;
            timer.stopTime_ = data.stopTime;
            timer.splitTimes_ = data.splitTimes;
            return true;
         }
      }

      return false;
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function removeIfPersistent( timer ) {
      if( timer.options_.persistenceKey ) {
         store.removeItem( timer.options_.persistenceKey );
      }
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   return api;
}
