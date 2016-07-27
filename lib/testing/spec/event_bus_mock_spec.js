/**
 * Copyright 2016 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
import { create as createEventBusMock } from '../event_bus_mock';

describe( 'An eventBus mock', () => {

   let eventBusMock;
   let subscriberSpy;

   beforeEach( () => {
      jasmine.clock().install();
      eventBusMock = createEventBusMock();
      subscriberSpy = jasmine.createSpy( 'subscriber' );
   } );
   afterEach( () => jasmine.clock().uninstall() );

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   it( 'spies on all event bus methods', () => {
      expect( () => {
         eventBusMock.subscribe.calls.reset();
         eventBusMock.unsubscribe.calls.reset();
         eventBusMock.publish.calls.reset();
         eventBusMock.publishAndGatherReplies.calls.reset();
      } ).not.toThrow();
   } );

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   it( 'uses the browsers setTimeout function for asynchronous behavior', () => {
      eventBusMock.subscribe( 'myEvent', subscriberSpy );
      eventBusMock.publish( 'myEvent' );

      expect( subscriberSpy ).not.toHaveBeenCalled();

      jasmine.clock().tick( 0 );

      expect( subscriberSpy ).toHaveBeenCalled();
   } );

} );
