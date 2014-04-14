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

} );