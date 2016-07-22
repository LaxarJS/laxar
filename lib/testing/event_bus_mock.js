/**
 * Copyright 2016 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
import { create as createEventBus } from '../event_bus/event_bus';
import { create as createConfigurationMock } from './configuration_mock';
import { create as createLogMock } from './log_mock';

export function create() {
   const nextTick = cb => setTimeout( cb, 0 );
   const eventBus = createEventBus( createConfigurationMock(), createLogMock(), nextTick, setTimeout );

   spyOn( eventBus, 'addInspector' ).and.callThrough();
   spyOn( eventBus, 'subscribe' ).and.callThrough();
   spyOn( eventBus, 'publish' ).and.callThrough();
   spyOn( eventBus, 'publishAndGatherReplies' ).and.callThrough();
   spyOn( eventBus, 'unsubscribe' ).and.callThrough();

   return eventBus;
}
