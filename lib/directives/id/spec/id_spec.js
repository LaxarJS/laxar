/**
 * Copyright 2014 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
define( [
   '../id',
   'angular',
   '../../../testing/portal_mocks',
   'angular-mocks'
], function( axIdModule, ng, portalMocks, ngMocks ) {
   'use strict';

   var PREFIX = 'ID_PREFIX_';
   var scope;
   var compile;
   var $dom;

   beforeEach( function() {
      ngMocks.module( axIdModule.name );

      ngMocks.inject( function( $rootScope, $compile ) {
         scope = $rootScope.$new();
         compile = $compile;
      } );

      scope.id = jasmine.createSpy( 'id' ).andCallFake( function( localId ) {
         return PREFIX + localId;
      } );
      scope.myLocalId = 'localId';
   } );

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   describe( 'An id directive', function() {

      describe( 'with local id provided', function() {

         beforeEach( function() {
            $dom = compile( '<div ax-id="myLocalId"></div>' )( scope );
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'calls the id method on the scope with the local id expression evaluated', function() {
            expect( scope.id ).toHaveBeenCalledWith( 'localId' );
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'sets the result of calling scope.id as id attribute', function() {
            expect( $dom[0].id ).toEqual( PREFIX + 'localId' );
         } );

      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      describe( 'with local id omitted', function() {

         it( 'throws an exception', function() {
            expect( function() {
               compile( '<div ax-id></div>' )( scope );
            } ).toThrow( 'Assertion error: State does not hold. Details: directive axId needs a non-empty local id, e.g. ax-id="\'myLocalId\'".' );
         } );

      } );

   } );

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   describe( 'A for directive', function() {

      describe( 'with local id provided', function() {

         beforeEach( function() {
            $dom = compile( '<div ax-for="myLocalId"></div>' )( scope );
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'calls the id method on the scope with the local id expression evaluated', function() {
            expect( scope.id ).toHaveBeenCalledWith( 'localId' );
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'sets the result of calling scope.id as for attribute', function() {
            expect( $dom.attr( 'for' ) ).toEqual( PREFIX + 'localId' );
         } );

      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      describe( 'with local id omitted', function() {

         it( 'throws an exception', function() {
            expect( function() {
               compile( '<div ax-for></div>' )( scope );
            } ).toThrow( 'Assertion error: State does not hold. Details: directive axFor needs a non-empty local id, e.g. ax-for="\'myLocalId\'".' );
         } );

      } );

   } );

} );
