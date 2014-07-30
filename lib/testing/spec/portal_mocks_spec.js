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

} );