/**
 * Copyright 2016 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
import { init as initEventBus, create as createEventBus } from '../event_bus/event_bus';

export function create( q ) {
   initEventBus( q, cb => setTimeout( cb, 0 ), setTimeout );
   const eventBus = createEventBus();

   spyOn( eventBus, 'subscribe' ).and.callThrough();
   spyOn( eventBus, 'publish' ).and.callThrough();
   spyOn( eventBus, 'publishAndGatherReplies' ).and.callThrough();

   return eventBus;
}