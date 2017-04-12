/**
 * Copyright 2016 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */

/**
 * Allows to create mock implementations of {@link EventBus}, compatible to the "axEventBus" and
 * "axGlobalEventBus" injections.
 *
 * @module event_bus_mock
 */

import assert from '../utilities/assert';
import { create as createEventBus } from '../runtime/event_bus';
import { create as createConfigurationMock } from './configuration_mock';

/**
 * Creates a mock {@link EventBus}, compatible to the "axEventBus" injection of a widget.
 *
 * If no custom tick-scheduler function is passed through the options, the returned event bus has a method
 * `flush`, to synchronously deliver all pending as well as synchronously added events. It also has a method
 * drainAsync` to asynchronously run event handlers to completion, including additional asynchronously
 * published events.
 *
 * @param {Object} [options]
 *    additional options
 * @param {Object} [options.nextTick]
 *    an alternative callback for scheduling the next event bus cycle (such as window.setTimeout)
 * @param {Object} [options.errorHandler]
 *    an alternative error handler, e.g. to inspect error conditions during test. By default, exceptions
 *    thrown by subscribers to the mock will be reported using `window.console.error`
 *
 * @return {EventBusMock}
 *    a fresh mock instance
 */
export function create( { nextTick, errorHandler } = {} ) {

   const config = createConfigurationMock( { eventBusTimeoutMs: 1000 } );
   const waiting = [];
   const fallbackTick = f => { waiting.push( f ); };

   /**
    * A mock version of {@link EventBus}.
    *
    * Offers spied-upon version of the usual axEventBus methods, including a spy on the unsubscribe-callback
    * returned by `subscribe`. Also has as a `flush` method for synchronous scheduling of events, and a
    * `drainAsync` to asynchronously run event handlers to completion.
    *
    *
    * @name EventBusMock
    * @constructor
    * @extends EventBus
    */
   const eventBus = createEventBus(
      config,
      nextTick || fallbackTick,
      setTimeout,
      errorHandler || (( ...args ) => {
         if( window.console && window.console.error ) {
            window.console.error( ...args );
         }
      })
   );

   /**
    * Flushes all pending events and runs their subscriber callbacks.
    * If new events are published synchronously from subscriber callbacks, these will also be processed.
    *
    * This operation happens synchronously, so asynchronously triggered events (e.g. those published from a
    * then handler) may not be processed.
    *
    * @memberof EventBusMock
    */
   eventBus.flush = () => {
      assert.state( !nextTick, 'eventBusMock.flush cannot be used with a custom nextTick' );
      while( waiting.length ) {
         waiting.shift()();
      }
   };

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   /**
    * Asynchronously flushes pending events and runs their subscriber callbacks.
    * If new events are published synchronously from subscriber callbacks, these will also be processed.
    * Additionally, if new events are published asynchronously but immediately (i.e. right after a call to
    * Promise.resolve), they will be processed as well.
    *
    * This operation happens *asynchronously*, so callers need to wait on the returned promise in order to
    * observe the effects.
    *
    * @memberof EventBusMock
    *
    * @return {Promise}
    *    a promise that is resolved when all events have been processed, and no more have been scheduled
    */
   eventBus.drainAsync = () => {
      assert.state( !nextTick, 'eventBusMock.drainAsync cannot be used with a custom nextTick' );
      return Promise.resolve()
         .then( () => {
            if( waiting.length ) {
               eventBus.flush();
               return eventBus.drainAsync();
            }
            return null;
         } );
   };

   spyOn( eventBus, 'addInspector' ).and.callThrough();
   const origSubscribe = eventBus.subscribe.bind( eventBus );
   spyOn( eventBus, 'subscribe' ).and.callFake( ( ...args ) => {
      const unsubscribe = origSubscribe( ...args );
      return jasmine.createSpy( 'unsubscribe' ).and.callFake( unsubscribe );
   } );
   spyOn( eventBus, 'publish' ).and.callThrough();
   spyOn( eventBus, 'publishAndGatherReplies' ).and.callThrough();

   return eventBus;
}
