/**
 * Copyright 2014 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
define( [
   '../portal_mocks'
], function( portalMocks ) {
   'use strict';

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   describe( 'PortalMocks mockQ', function() {

      var deferred;

      beforeEach( function() {
         jasmine.Clock.useMock();

         deferred = portalMocks.mockQ().defer();
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'can create deferred objects', function() {
         expect( deferred.promise ).toBeDefined();
         expect( deferred.resolve ).toBeDefined();
         expect( deferred.reject ).toBeDefined();
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'adheres to the commonjs promise proposal', function() {
         expect( deferred.promise.then ).toBeDefined();
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'resolves when jasmine clock is ticked', function() {
         var mySpy = jasmine.createSpy();
         deferred.promise.then( mySpy );
         deferred.resolve();
         expect( mySpy ).not.toHaveBeenCalled();

         jasmine.Clock.tick( 0 );
         expect( mySpy ).toHaveBeenCalled();
      } );

   } );
   
   ///////////////////////////////////////////////////////////////////////////////////////////////////////////
      
   describe( 'PortalMocks mockTick', function() {

      var tickMock;
      var callback;

      beforeEach( function() {
         jasmine.Clock.useMock();

         callback =  jasmine.createSpy();
         spyOn( window, 'setTimeout' ).andCallThrough();
         tickMock = portalMocks.mockTick();
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'creates a function delegating to window.setTimeout', function() {
         tickMock( callback );
         tickMock( callback, 234 );
         
         expect( window.setTimeout ).toHaveBeenCalledWith( callback, 0 );
         expect( window.setTimeout ).toHaveBeenCalledWith( callback, 234 );
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'provides a spy that is called when next tick fires', function() {
         expect( tickMock.spy ).toBeDefined();
         expect( tickMock.spy ).not.toHaveBeenCalled();

         tickMock( callback );
         jasmine.Clock.tick( 0 );
         expect( tickMock.spy ).toHaveBeenCalled();
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'works well with a jasmine mocked clock', function() {
         tickMock( callback, 100 );
         jasmine.Clock.tick( 100 );
         expect( callback ).toHaveBeenCalled();
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'provides a cancel method to cancel the timeout (jira ATP-6707)', function() {
         var timeoutRef = tickMock( callback, 100 );

         tickMock.cancel( timeoutRef );
         jasmine.Clock.tick( 100 );
         expect( callback ).not.toHaveBeenCalled();
      } );
      
   } );

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   describe( 'PortalMocks mockFileResourceProvider', function() {

      var mockFiles_ = {
         'some/file.json': { a: { json: 'file' } },
         'some/file.html': '<h1>a mock html</h1>'
      };
      var mockFileResourceProvider_;

      beforeEach( function() {
         jasmine.Clock.useMock();
         mockFileResourceProvider_ = portalMocks.mockFileResourceProvider( mockFiles_ );
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'spies on the offered "isAvailable" and "provide" methods', function() {
         expect( function() {
            mockFileResourceProvider_.isAvailable.reset();
            mockFileResourceProvider_.provide.reset();
         } ).not.toThrow();
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'offers an "isAvailable" method based on the mock entries', function() {
         var spyForExisting = jasmine.createSpy( 'spyForExisting' );
         mockFileResourceProvider_.isAvailable( 'some/file.json' ).then( spyForExisting );
         jasmine.Clock.tick( 0 );
         expect( spyForExisting ).toHaveBeenCalledWith( true );

         var spyForMissing = jasmine.createSpy( 'spyForMissing' );
         mockFileResourceProvider_.isAvailable( 'any/missing.json' ).then( spyForMissing );
         jasmine.Clock.tick( 0 );
         expect( spyForMissing ).toHaveBeenCalledWith( false );
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'offers a "provide" method based on the mock entries', function() {
         var spyForMissing = jasmine.createSpy( 'spyForMissing' );
         var spyForMissingReject = jasmine.createSpy( 'spyForMissingReject' );
         mockFileResourceProvider_.provide( 'any/missing' ).then( spyForMissing, spyForMissingReject );
         jasmine.Clock.tick( 0 );
         expect( spyForMissing ).not.toHaveBeenCalled();
         expect( spyForMissingReject ).toHaveBeenCalled();

         var spyForJson = jasmine.createSpy( 'spyForJson' );
         mockFileResourceProvider_.provide( 'some/file.json' ).then( spyForJson );
         jasmine.Clock.tick( 0 );
         expect( spyForJson ).toHaveBeenCalledWith( mockFiles_[ 'some/file.json' ] );

         var spyForHtml = jasmine.createSpy( 'spyForHtml' );
         mockFileResourceProvider_.provide( 'some/file.html' ).then( spyForHtml );
         jasmine.Clock.tick( 0 );
         expect( spyForHtml ).toHaveBeenCalledWith( mockFiles_[ 'some/file.html' ] );
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'hands out fresh copies of provided json objects', function() {
         var spyForJson1 = jasmine.createSpy( 'spyForJson1' ).andCallFake( function tamper( json ) {
            expect( json ).toEqual( mockFiles_[ 'some/file.json' ] );
            json.manipulation = 'manipulation';
         } );
         mockFileResourceProvider_.provide( 'some/file.json' ).then( spyForJson1 );
         jasmine.Clock.tick( 0 );
         expect( spyForJson1 ).toHaveBeenCalled();

         var spyForJson2 = jasmine.createSpy( 'spyForJson2' );
         mockFileResourceProvider_.provide( 'some/file.json' ).then( spyForJson2 );
         jasmine.Clock.tick( 0 );
         expect( spyForJson2 ).toHaveBeenCalledWith( mockFiles_[ 'some/file.json' ] );
      } );

   } );

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   describe( 'PortalMocks mockHeartbeat', function() {

      var mockHeartbeat_;

      var beforeNextSpy_;
      var nextSpy_;
      var afterNextSpy_;

      beforeEach( function() {
         jasmine.Clock.useMock();
         beforeNextSpy_ = jasmine.createSpy( 'beforeNext spy' );
         nextSpy_ = jasmine.createSpy( 'next spy' );
         afterNextSpy_ = jasmine.createSpy( 'afterNext spy' );
         mockHeartbeat_ = portalMocks.mockHeartbeat();
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'spies on the offered "onBeforeNext", "onNext" and "onAfterNext" methods', function() {
         expect( function() {
            mockHeartbeat_.onBeforeNext.reset();
            mockHeartbeat_.onNext.reset();
            mockHeartbeat_.onAfterNext.reset();
         } ).not.toThrow();
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'offers an "onNext" method whose callbacks are triggered on tick', function() {
         mockHeartbeat_.onNext( nextSpy_ );
         expect( nextSpy_ ).not.toHaveBeenCalled();
         jasmine.Clock.tick( 0 );
         expect( nextSpy_ ).toHaveBeenCalled();
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'offers an "onBeforeNext" method whose callbacks are triggered on tick-after-onNext', function() {
         nextSpy_ = jasmine.createSpy( 'next spy' ).andCallFake( function() {
            expect( beforeNextSpy_ ).toHaveBeenCalled();
         } );

         mockHeartbeat_.onBeforeNext( beforeNextSpy_ );
         expect( beforeNextSpy_ ).not.toHaveBeenCalled();
         jasmine.Clock.tick( 0 );
         mockHeartbeat_.onNext( nextSpy_ );
         expect( beforeNextSpy_ ).not.toHaveBeenCalled();
         jasmine.Clock.tick( 0 );
         expect( nextSpy_ ).toHaveBeenCalled();
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'offers an "onAfterNext" method whose callbacks are triggered on tick-after-onNext', function() {
         nextSpy_ = jasmine.createSpy( 'next spy' ).andCallFake( function() {
            expect( beforeNextSpy_ ).not.toHaveBeenCalled();
         } );

         mockHeartbeat_.onAfterNext( afterNextSpy_ );
         expect( afterNextSpy_ ).not.toHaveBeenCalled();
         jasmine.Clock.tick( 0 );
         mockHeartbeat_.onNext( nextSpy_ );
         expect( afterNextSpy_ ).not.toHaveBeenCalled();
         jasmine.Clock.tick( 0 );
         expect( nextSpy_ ).toHaveBeenCalled();
         expect( afterNextSpy_ ).toHaveBeenCalled();
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'executes each callback exactly once', function() {
         mockHeartbeat_.onBeforeNext( beforeNextSpy_ );
         mockHeartbeat_.onAfterNext( afterNextSpy_ );
         mockHeartbeat_.onNext( nextSpy_ );
         jasmine.Clock.tick( 0 );
         mockHeartbeat_.onNext( nextSpy_ );
         jasmine.Clock.tick( 0 );
         mockHeartbeat_.onNext( nextSpy_ );
         jasmine.Clock.tick( 0 );
         expect( nextSpy_.calls.length ).toEqual( 3 );
         expect( beforeNextSpy_.calls.length ).toEqual( 1 );
         expect( afterNextSpy_.calls.length ).toEqual( 1 );
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'offers a "_reset" method for testing to clear all callbacks', function() {
         mockHeartbeat_.onBeforeNext( beforeNextSpy_ );
         mockHeartbeat_.onAfterNext( afterNextSpy_ );
         mockHeartbeat_._reset();
         mockHeartbeat_.onNext( nextSpy_ );
         jasmine.Clock.tick( 0 );
         expect( beforeNextSpy_ ).not.toHaveBeenCalled();
         expect( nextSpy_ ).toHaveBeenCalled();
         expect( afterNextSpy_ ).not.toHaveBeenCalled();

         nextSpy_.reset();
         mockHeartbeat_.onNext( nextSpy_ );
         mockHeartbeat_._reset();
         jasmine.Clock.tick( 0 );
         expect( nextSpy_ ).not.toHaveBeenCalled();
      } );

   } );

} );