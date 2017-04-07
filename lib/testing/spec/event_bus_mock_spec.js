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

   it( 'spies on the unsubscribe function returned by subscribe-calls', () => {
      expect( () => {
         eventBusMock.subscribe( 'topic', () => {} ).calls.reset();
         eventBusMock.subscribe.calls.mostRecent().returnValue.calls.reset();
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

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   it( 'reports subscriber errors to console.error by default', () => {
      spyOn( window.console, 'error' );
      eventBusMock = createEventBusMock();
      let e;
      eventBusMock.subscribe( 'myEvent', () => {
         e = new Error( 'error' );
         throw e;
      } );
      eventBusMock.publish( 'myEvent' );
      eventBusMock.flush();

      expect( window.console.error ).toHaveBeenCalledWith( jasmine.any( String ), jasmine.any( Object ) );
      expect( window.console.error.calls.mostRecent().args[ 1 ][ 'Exception' ] ).toEqual( e );
   } );

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   it( 'allows to synchronously flush pending events', () => {
      const spyA = jasmine.createSpy( 'A' );
      const spyB = jasmine.createSpy( 'B' );
      const spyC = jasmine.createSpy( 'C' );

      eventBusMock.subscribe( 'eventA', () => {
         spyA();
         eventBusMock.publish( 'eventB', {} ).then( () => {
            eventBusMock.publish( 'eventC', {} );
         } );
      } );
      eventBusMock.subscribe( 'eventB', spyB );
      eventBusMock.subscribe( 'eventC', spyC );
      eventBusMock.publish( 'eventA' );
      eventBusMock.flush();

      expect( spyB ).toHaveBeenCalled();
      expect( spyC ).not.toHaveBeenCalled();
   } );

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   it( 'allows to asynchronously drain events until none are left', done => {
      const spyA = jasmine.createSpy( 'A' );
      const spyB = jasmine.createSpy( 'B' );
      const spyC = jasmine.createSpy( 'C' );

      eventBusMock.subscribe( 'eventA', () => {
         spyA();
         eventBusMock.publish( 'eventB', {} ).then( () => {
            eventBusMock.publish( 'eventC', {} );
         } );
      } );
      eventBusMock.subscribe( 'eventB', spyB );
      eventBusMock.subscribe( 'eventC', spyC );
      eventBusMock.publish( 'eventA' );
      const awaitDrain = eventBusMock.drainAsync();

      expect( spyB ).not.toHaveBeenCalled();
      awaitDrain.then( () => {
         expect( spyB ).toHaveBeenCalled();
         expect( spyC ).toHaveBeenCalled();
         done();
      } );
   } );

} );
