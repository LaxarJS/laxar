/**
 * Copyright 2016 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
import { create as createHeartbeatMock } from '../heartbeat_mock';

describe( 'PortalMocks mockHeartbeat', () => {

   let mockHeartbeat;

   let beforeNextSpy;
   let nextSpy;
   let afterNextSpy;

   beforeEach( () => {
      beforeNextSpy = jasmine.createSpy( 'beforeNext spy' );
      nextSpy = jasmine.createSpy( 'next spy' );
      afterNextSpy = jasmine.createSpy( 'afterNext spy' );
      mockHeartbeat = createHeartbeatMock();
   } );

   ////////////////////////////////////////////////////////////////////////////////////////////////////////

   it( 'spies on the offered "onBeforeNext", "onNext" and "onAfterNext" methods', () => {
      expect( () => {
         mockHeartbeat.onBeforeNext.calls.reset();
         mockHeartbeat.onNext.calls.reset();
         mockHeartbeat.onAfterNext.calls.reset();
      } ).not.toThrow();
   } );

   ////////////////////////////////////////////////////////////////////////////////////////////////////////

   it( 'offers an "onNext" method whose callbacks are triggered on tick', () => {
      mockHeartbeat.onNext( nextSpy );
      expect( nextSpy ).not.toHaveBeenCalled();
      mockHeartbeat.flush();
      expect( nextSpy ).toHaveBeenCalled();
   } );

   ////////////////////////////////////////////////////////////////////////////////////////////////////////

   it( 'offers an "onBeforeNext" method whose callbacks are triggered on tick-after-onNext', () => {
      nextSpy = jasmine.createSpy( 'next spy' ).and.callFake( () => {
         expect( beforeNextSpy ).toHaveBeenCalled();
      } );

      mockHeartbeat.onBeforeNext( beforeNextSpy );
      expect( beforeNextSpy ).not.toHaveBeenCalled();
      mockHeartbeat.flush();
      mockHeartbeat.onNext( nextSpy );
      expect( beforeNextSpy ).not.toHaveBeenCalled();
      mockHeartbeat.flush();
      expect( nextSpy ).toHaveBeenCalled();
   } );

   ////////////////////////////////////////////////////////////////////////////////////////////////////////

   it( 'offers an "onAfterNext" method whose callbacks are triggered on tick-after-onNext', () => {
      nextSpy = jasmine.createSpy( 'next spy' ).and.callFake( () => {
         expect( beforeNextSpy ).not.toHaveBeenCalled();
      } );

      mockHeartbeat.onAfterNext( afterNextSpy );
      expect( afterNextSpy ).not.toHaveBeenCalled();
      mockHeartbeat.flush();
      mockHeartbeat.onNext( nextSpy );
      expect( afterNextSpy ).not.toHaveBeenCalled();
      mockHeartbeat.flush();
      expect( nextSpy ).toHaveBeenCalled();
      expect( afterNextSpy ).toHaveBeenCalled();
   } );

   ////////////////////////////////////////////////////////////////////////////////////////////////////////

   it( 'executes each callback exactly once', () => {
      mockHeartbeat.onBeforeNext( beforeNextSpy );
      mockHeartbeat.onAfterNext( afterNextSpy );
      mockHeartbeat.onNext( nextSpy );
      mockHeartbeat.flush();
      mockHeartbeat.onNext( nextSpy );
      mockHeartbeat.flush();
      mockHeartbeat.onNext( nextSpy );
      mockHeartbeat.flush();
      expect( nextSpy.calls.count() ).toEqual( 3 );
      expect( beforeNextSpy.calls.count() ).toEqual( 1 );
      expect( afterNextSpy.calls.count() ).toEqual( 1 );
   } );

   ////////////////////////////////////////////////////////////////////////////////////////////////////////

   it( 'offers a "_reset" method for testing to clear all callbacks', () => {
      mockHeartbeat.onBeforeNext( beforeNextSpy );
      mockHeartbeat.onAfterNext( afterNextSpy );
      mockHeartbeat.reset();
      mockHeartbeat.onNext( nextSpy );
      mockHeartbeat.flush();
      expect( beforeNextSpy ).not.toHaveBeenCalled();
      expect( nextSpy ).toHaveBeenCalled();
      expect( afterNextSpy ).not.toHaveBeenCalled();

      nextSpy.calls.reset();
      mockHeartbeat.onNext( nextSpy );
      mockHeartbeat.reset();
      mockHeartbeat.flush();
      expect( nextSpy ).not.toHaveBeenCalled();
   } );

} );
