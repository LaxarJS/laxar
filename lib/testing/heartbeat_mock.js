/**
 * Copyright 2016 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */

/**
 * Allows to create mock implementations of {@link Heartbeat}, compatible to the "axHeartbeat" injection.
 *
 * @module heartbeat_mock
 */

 /**
  * Creates a mock for the "axHeartbeat" injection of a widget.
  *
  * @return {HeartbeatMock}
  *    a fresh mock instance
  */
export function create() {
   let beforeNext = [];
   let next = [];
   let afterNext = [];

   /**
    * A mock version of {@link Heartbeat}, with additional methods.
    *
    * Offers spied-upon version of the usual axHeartbeat methods, as well as a `flush` method for synchronous
    * scheduling of heartbeat events, and a `reset` methods to clear all listeners.
    *
    * @name HeartbeatMock
    * @constructor
    * @extends Heartbeat
    */
   const mock = {
      onBeforeNext( f ) {
         beforeNext.push( f );
      },
      onNext( f ) {
         next.push( f );
      },
      onAfterNext( f ) {
         afterNext.push( f );
      },

      /**
       * Reset the internal state of the mock, clearing all `onBeforeNext`, `onNext` and `onAfterNext`
       * callbacks.
       *
       * @memberof HeartbeatMock
       */
      reset() {
         beforeNext = [];
         next = [];
         afterNext = [];
      },

      /**
       * If any `onNext` callbacks have been schedules, synchronously runs all scheduled `onBeforeNext`,
       * `onNext` and `onAfterNext` callbacks, clearing the corresponding queues in the process.
       *
       * @memberof HeartbeatMock
       */
      flush() {
         if( next.length === 0 ) { return; }
         [ beforeNext, next, afterNext ].forEach( queue => {
            while( queue.length ) { queue.shift()(); }
         } );
      }
   };

   spyOn( mock, 'onNext' ).and.callThrough();
   spyOn( mock, 'onAfterNext' ).and.callThrough();
   spyOn( mock, 'onBeforeNext' ).and.callThrough();

   return mock;
}
