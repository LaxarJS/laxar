/**
 * Copyright 2016 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
import { create as createEventBus } from '../event_bus/event_bus';
import { create as createBrowserMock } from './browser_mock';

export function create() {
   const eventBus = createEventBus( cb => setTimeout( cb, 0 ), setTimeout, createBrowserMock() );

   spyOn( eventBus, 'subscribe' ).and.callThrough();
   spyOn( eventBus, 'publish' ).and.callThrough();
   spyOn( eventBus, 'publishAndGatherReplies' ).and.callThrough();
   spyOn( eventBus, 'unsubscribe' ).and.callThrough();

   return eventBus;
}
