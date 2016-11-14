/**
 * Copyright 2016 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
/**
 * Scheduler for tasks that possibly synchronously trigger creation of new tasks, that need some common work
 * to be done before or after all of these tasks (and all tasks scheduled in the meantime) are finished.
 *
 * @module heartbeat
 */

export function create( customNextTick, customTimeout ) {

   const nextTick = customNextTick || ( f => { Promise.resolve().then( f ); } );
   const timeout = customTimeout || ( f => { setTimeout( f, 0 ); } );

   const heartbeatListeners = [];
   const nextQueue = [];
   const beforeQueue = [];
   const afterQueue = [];

   let beatRequested = false;

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

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   return {
      registerHeartbeatListener,
      onBeforeNext,
      onNext,
      onAfterNext
   };
}
