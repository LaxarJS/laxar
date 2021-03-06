/**
 * Copyright 2016 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
/**
 * Module providing the Heartbeat factory.
 *
 * To use the Heartbeat service in a widget, request the {@link widget_services#axHeartbeat axHeartbeat}
 * injection.
 *
 * @module heartbeat
 */

// Workaround: The angular adapter ties Promise resolution to $rootScope.$digest.
// However, for application performance and ease of testing, we avoid this coupling here.
// We just want to asynchronously execute a callback as quickly as possible.
const NativePromise = window.Promise;

 /**
  * Creates a heartbeat backed by the given scheduler.
  *
  * @param {Function} [customNextTick]
  *    a function that takes a callback, and will asynchronously execute that callback as soon as possible,
  *    but asynchronously (that is, after the calling execution stack has finished running).
  *    If omitted, the callback is scheduled using `Promise.resolve().then( ... )`.
  * @param {Function} [customTimeout]
  *    an optional replacement for `window.setTimeout`, used to run coalesced callbacks in a second stage
  *    after the immediately scheduled operation.
  *    This is intended for callbacks that rely on render state (e.g. the angular visibility service).
  *
  * @return {Heartbeat}
  *    a heartbeat instance
  *
  * @private
  */
export function create( customNextTick, customTimeout ) {

   // "as-soon-as-possible", preferably before rendering
   const nextTick = customNextTick || ( f => { NativePromise.resolve().then( f ); } );
   // "as-soon-as-possible", but after rendering of any previous nextTick changes
   const timeout = customTimeout || ( f => { setTimeout( f, 0 ); } );

   const heartbeatListeners = [];
   const nextQueue = [];
   const beforeQueue = [];
   const afterQueue = [];

   let beatRequested = false;

   /**
    * Scheduler for tasks that possibly synchronously trigger creation of new tasks, that need some common
    * work to be done before or after all of these tasks (and all tasks scheduled in the meantime) are
    * finished.
    *
    * An example would be model-manipulating operations in an application using AngularJS, that need to run
    * `$rootScope.$apply` after all operations are done, but only *once*.
    *
    * @name Heartbeat
    * @constructor
    */
   return {
      registerHeartbeatListener,
      onBeforeNext,
      onNext,
      onAfterNext
   };

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   /**
    * Registers a listener, that is called whenever a heartbeat occurs.
    * It is called after the before and next queues were processed, but before working off the after queue has
    * started.
    * In contrast to the `on*` methods, listeners are not removed after a tick, but will be called again each
    * time a heartbeat occurs.
    * Instead this method returns a function to manually remove the listener again.
    *
    * @param  {Function} listener
    *    the listener to register
    *
    * @return {Function}
    *    a function to remove the listener again
    *
    * @memberof Heartbeat
    */
   function registerHeartbeatListener( listener ) {
      heartbeatListeners.push( listener );

      return () => {
         let index;
         while( ( index = heartbeatListeners.indexOf( listener ) ) !== -1 ) {
            heartbeatListeners.splice( index, 1 );
         }
      };
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   /**
    * Schedules a function for the next heartbeat.
    * If no heartbeat was triggered yet, it will be requested now.
    *
    * @param {Function} func
    *    a function to schedule for the next tick
    *
    * @memberof Heartbeat
    */
   function onNext( func ) {
      if( !beatRequested ) {
         beatRequested = true;
         nextTick( () => {
            while( beforeQueue.length ) { beforeQueue.shift()(); }
            while( nextQueue.length ) { nextQueue.shift()(); }
            heartbeatListeners.forEach( listener => listener() );
            if( afterQueue.length ) {
               // run after-queue once all directly resolvable promises are through.
               timeout( () => {
                  // Ensure that no further event bus deliveries were scheduled
                  if( !beatRequested ) {
                     while( afterQueue.length ) { afterQueue.shift()(); }
                  }
               } );
            }
            beatRequested = false;
         } );
      }
      nextQueue.push( func );
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   /**
    * Schedules a function to be called before the next heartbeat occurs.
    * Note that `func` may never be called, if there is no next heartbeat since calling this function won't
    * trigger a new heartbeat.
    *
    * @param {Function} func
    *    a function to call before the next heartbeat
    *
    * @memberof Heartbeat
    */
   function onBeforeNext( func ) {
      beforeQueue.push( func );
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   /**
    * Schedules a function to be called after the next heartbeat occured.
    * Note that `func` may never be called, if there is no next heartbeat since calling this function won't
    * trigger a new heartbeat.
    *
    * @param {Function} func
    *    a function to call after the next heartbeat
    *
    * @memberof Heartbeat
    */
   function onAfterNext( func ) {
      afterQueue.push( func );
   }

}
