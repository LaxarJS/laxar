/**
 * Copyright 2016 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
import { create as createHeartbeatMock } from '../heartbeat_mock';

describe( 'PortalMocks mockHeartbeat', () => {

   var mockHeartbeat_;

   var beforeNextSpy_;
   var nextSpy_;
   var afterNextSpy_;

   beforeEach( () => {
      beforeNextSpy_ = jasmine.createSpy( 'beforeNext spy' );
      nextSpy_ = jasmine.createSpy( 'next spy' );
      afterNextSpy_ = jasmine.createSpy( 'afterNext spy' );
      mockHeartbeat_ = createHeartbeatMock();
   } );

   ////////////////////////////////////////////////////////////////////////////////////////////////////////

   it( 'spies on the offered "onBeforeNext", "onNext" and "onAfterNext" methods', () => {
      expect( () => {
         mockHeartbeat_.onBeforeNext.calls.reset();
         mockHeartbeat_.onNext.calls.reset();
         mockHeartbeat_.onAfterNext.calls.reset();
      } ).not.toThrow();
   } );

   ////////////////////////////////////////////////////////////////////////////////////////////////////////

   it( 'offers an "onNext" method whose callbacks are triggered on tick', () => {
      mockHeartbeat_.onNext( nextSpy_ );
      expect( nextSpy_ ).not.toHaveBeenCalled();
      mockHeartbeat_.flush();
      expect( nextSpy_ ).toHaveBeenCalled();
   } );

   ////////////////////////////////////////////////////////////////////////////////////////////////////////

   it( 'offers an "onBeforeNext" method whose callbacks are triggered on tick-after-onNext', () => {
      nextSpy_ = jasmine.createSpy( 'next spy' ).and.callFake( () => {
         expect( beforeNextSpy_ ).toHaveBeenCalled();
      } );

      mockHeartbeat_.onBeforeNext( beforeNextSpy_ );
      expect( beforeNextSpy_ ).not.toHaveBeenCalled();
      mockHeartbeat_.flush();
      mockHeartbeat_.onNext( nextSpy_ );
      expect( beforeNextSpy_ ).not.toHaveBeenCalled();
      mockHeartbeat_.flush();
      expect( nextSpy_ ).toHaveBeenCalled();
   } );

   ////////////////////////////////////////////////////////////////////////////////////////////////////////

   it( 'offers an "onAfterNext" method whose callbacks are triggered on tick-after-onNext', () => {
      nextSpy_ = jasmine.createSpy( 'next spy' ).and.callFake( () => {
         expect( beforeNextSpy_ ).not.toHaveBeenCalled();
      } );

      mockHeartbeat_.onAfterNext( afterNextSpy_ );
      expect( afterNextSpy_ ).not.toHaveBeenCalled();
      mockHeartbeat_.flush();
      mockHeartbeat_.onNext( nextSpy_ );
      expect( afterNextSpy_ ).not.toHaveBeenCalled();
      mockHeartbeat_.flush();
      expect( nextSpy_ ).toHaveBeenCalled();
      expect( afterNextSpy_ ).toHaveBeenCalled();
   } );

   ////////////////////////////////////////////////////////////////////////////////////////////////////////

   it( 'executes each callback exactly once', () => {
      mockHeartbeat_.onBeforeNext( beforeNextSpy_ );
      mockHeartbeat_.onAfterNext( afterNextSpy_ );
      mockHeartbeat_.onNext( nextSpy_ );
      mockHeartbeat_.flush();
      mockHeartbeat_.onNext( nextSpy_ );
      mockHeartbeat_.flush();
      mockHeartbeat_.onNext( nextSpy_ );
      mockHeartbeat_.flush();
      expect( nextSpy_.calls.count() ).toEqual( 3 );
      expect( beforeNextSpy_.calls.count() ).toEqual( 1 );
      expect( afterNextSpy_.calls.count() ).toEqual( 1 );
   } );

   ////////////////////////////////////////////////////////////////////////////////////////////////////////

   it( 'offers a "_reset" method for testing to clear all callbacks', () => {
      mockHeartbeat_.onBeforeNext( beforeNextSpy_ );
      mockHeartbeat_.onAfterNext( afterNextSpy_ );
      mockHeartbeat_.reset();
      mockHeartbeat_.onNext( nextSpy_ );
      mockHeartbeat_.flush();
      expect( beforeNextSpy_ ).not.toHaveBeenCalled();
      expect( nextSpy_ ).toHaveBeenCalled();
      expect( afterNextSpy_ ).not.toHaveBeenCalled();

      nextSpy_.calls.reset();
      mockHeartbeat_.onNext( nextSpy_ );
      mockHeartbeat_.reset();
      mockHeartbeat_.flush();
      expect( nextSpy_ ).not.toHaveBeenCalled();
   } );

} );
