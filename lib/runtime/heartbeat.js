/**
 * Copyright 2016 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */

export function create( customNextTick ) {

   const nextTick = customNextTick || ( f => { Promise.resolve().then( f ); } );

   const heartbeatListeners = [];
   const nextQueue = [];
   const beforeQueue = [];
   const afterQueue = [];

   let beatRequested = false;

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

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
    * Schedules a function for the next heartbeat. If no heartbeat was triggered yet, it will be
    * requested now.
    *
    * @param {Function} func
    *    a function to schedule for the next tick
    *
    * @memberOf axHeartbeat
    */
   function onNext( func ) {
      if( !beatRequested ) {
         beatRequested = true;
         nextTick( () => {
            while( beforeQueue.length ) { beforeQueue.shift()(); }
            while( nextQueue.length ) { nextQueue.shift()(); }
            Promise.resolve().then( () => {
               heartbeatListeners.forEach( listener => listener() );
               // Ensure that no further event bus deliveries were scheduled
               if( !nextQueue.length ) {
                  while( afterQueue.length ) { afterQueue.shift()(); }
               }
            } );
            beatRequested = false;
         } );
      }
      nextQueue.push( func );
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   /**
    * Schedules a function to be called before the next heartbeat occurs. Note that `func` may never be
    * called, if there is no next heartbeat.
    *
    * @param {Function} func
    *    a function to call before the next heartbeat
    *
    * @memberOf axHeartbeat
    */
   function onBeforeNext( func ) {
      beforeQueue.push( func );
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   /**
    * Schedules a function to be called after the next heartbeat occured. Note that `func` may never be
    * called, if there is no next heartbeat.
    *
    * @param {Function} func
    *    a function to call after the next heartbeat
    *
    * @memberOf axHeartbeat
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
