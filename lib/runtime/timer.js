/**
 * Copyright 2016 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
import { deepClone } from '../utilities/object';

export function create( log ) {

   const api = {
      started
   };

   let idCounter = 0;

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function started( optionalOptions ) {
      const timer = new Timer( optionalOptions );
      timer.start();
      return timer;
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function Timer( optionalOptions ) {
      this.options_ = {
         label: `timer${idCounter++}`,
         ...optionalOptions
      };
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
         splitTimes: deepClone( this.splitTimes_ )
      };
   };

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   Timer.prototype.start = function() {
      this.startTime_ = Date.now();
   };

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   Timer.prototype.splitTime = function( optionalLabel ) {
      this.splitTimes_.push( {
         time: Date.now(),
         label: optionalLabel || `split${this.splitTimes_.length}`
      } );
   };

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   Timer.prototype.stop = function() {
      this.stopTime_ = Date.now();
   };

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   Timer.prototype.stopAndLog = function( optionalLabel ) {
      this.stop();

      const startTime = this.startTime_;
      const endTime = Date.now();
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

   return api;
}
