/**
 * Copyright 2014 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
define( [
   '../utilities/object',
   '../logging/log',
], function( object, log ) {
   'use strict';

   var idCounter = 0;

   function Timer( label ) {
      this.label_ = label;
      this.startTime_ = null;
      this.stopTime_ = null;
      this.splitTimes_ = [];
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   Timer.prototype.save = function() {
      return {
         label: this.label_,
         startTime: this.startTime_,
         stopTime: this.stopTime_,
         splitTimes: object.deepClone( this.splitTimes_ )
      };
   };

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   Timer.prototype.start = function() {
      this.startTime_ = now();
   };

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   Timer.prototype.splitTime = function( optionalLabel ) {
      this.splitTimes_.push( {
         time: now(),
         label: optionalLabel || 'split' + this.splitTimes_.length
      } );
   };

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   Timer.prototype.stop = function() {
      this.stopTime_ = now();
   };

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   Timer.prototype.stopAndLog = function( optionalLabel ) {
      this.stop();

      var startTime = this.startTime_;
      var endTime = now();
      var label = optionalLabel || 'Timer Stopped';
      this.splitTimes_.push( { label: label, time: endTime } );

      var message = [];
      message.push( 'Timer "', this.label_, '": ' );
      message.push( 'start at ', new Date( startTime ).toISOString(), ' (client), ' );
      message.push( label, ' after ', ( endTime - startTime ).toFixed( 0 ), 'ms ' );
      message.push( '(checkpoints: ' );
      var intervals = [];
      this.splitTimes_.reduce( function( from, data ) {
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

   return {
      startedTimer: function( optionalLabel ) {
         var timer = new Timer( optionalLabel || 'timer' + idCounter++ );
         timer.start();
         return timer;
      },
      resume: function( timerData ) {
         var t = new Timer( timerData.label );
         t.startTime_ = timerData.startTime;
         t.stopTime_ = timerData.stopTime;
         t.splitTimes_ = timerData.splitTimes;
         return t;
      }
   };

} );
