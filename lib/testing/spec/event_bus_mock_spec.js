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
      eventBusMock = createEventBusMock( { nextTick: f => { window.setTimeout( f, 0 ); } } );
      eventBusMock.subscribe( 'myEvent', subscriberSpy );
      eventBusMock.publish( 'myEvent' );

      expect( subscriberSpy ).not.toHaveBeenCalled();

      jasmine.clock().tick( 0 );

      expect( subscriberSpy ).toHaveBeenCalled();
   } );

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   it( 'allows to use a custom error handler', () => {
      const errorHandlerSpy = jasmine.createSpy( 'errorHandler' );
      eventBusMock = createEventBusMock( { errorHandler: errorHandlerSpy } );
      eventBusMock.subscribe( 'myEvent', () => { throw new Error( 'error' ); } );
      eventBusMock.publish( 'myEvent' );
      eventBusMock.flush();

      expect( errorHandlerSpy ).toHaveBeenCalled();
   } );
} );
