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
         eventBusMock.addInspector.calls.reset();
         eventBusMock.subscribe.calls.reset();
         eventBusMock.publish.calls.reset();
         eventBusMock.publishAndGatherReplies.calls.reset();
      } ).not.toThrow();
   } );

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   it( 'allows to use the browser\'s `setTimeout` function for asynchronous behavior', () => {
      eventBusMock = createEventBusMock( f => { window.setTimeout( f ); } );
      eventBusMock.subscribe( 'myEvent', subscriberSpy );
      eventBusMock.publish( 'myEvent' );

      expect( subscriberSpy ).not.toHaveBeenCalled();

      jasmine.clock().tick( 0 );

      expect( subscriberSpy ).toHaveBeenCalled();
   } );

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   it( 'offers a `flush` method for asynchronous behavior', () => {
      eventBusMock = createEventBusMock();
      eventBusMock.subscribe( 'myEvent', subscriberSpy );
      eventBusMock.publish( 'myEvent' );

      expect( subscriberSpy ).not.toHaveBeenCalled();

      eventBusMock.flush();

      expect( subscriberSpy ).toHaveBeenCalled();
   } );
} );
