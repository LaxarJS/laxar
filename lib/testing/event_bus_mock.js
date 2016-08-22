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
import { create as createLogMock } from './log_mock';

/**
 * Creates a mock {@link EventBus}, compatible to the "axEventBus" injection of a widget.
 *
 * If no custom tick-scheduler function is passed through the options, the returned event bus has a method
 * `flush`, to synchronously deliver all pending events, until no events are left.
 *
 * @param {Object} [options]
 *    additional options
 * @param {Object} [options.nextTick]
 *    an alternative callback for scheduling the next event bus cycle (such as window.setTimeout)
 * @param {Object} [options.errorHandler]
 *    an alternative error handler, e.g. to inspect error conditions during test
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
    * Offers spied-upon version of the usual axHeartbeat methods, as well as a `flush` method for synchronous
    * scheduling of heartbeat events, and a `reset` methods to clear all listeners.
    *
    * @name EventBusMock
    * @constructor
    * @extends EventBus
    */
   const eventBus = createEventBus(
      config,
      createLogMock(),
      nextTick || fallbackTick,
      setTimeout,
      errorHandler
   );

   /**
    * @memberof {EventBusMock}
    */
   eventBus.flush = () => {
      assert.state( !nextTick, 'eventBusMock.flush cannot be used with a custom nextTick' );
      while( waiting.length ) {
         waiting.shift()();
      }
   };

   spyOn( eventBus, 'addInspector' ).and.callThrough();
   spyOn( eventBus, 'subscribe' ).and.callThrough();
   spyOn( eventBus, 'publish' ).and.callThrough();
   spyOn( eventBus, 'publishAndGatherReplies' ).and.callThrough();

   return eventBus;
}
