/**
 * Copyright 2016 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
define( [
   '../jquery_mock'
], function( $ ) {
   'use strict';

   describe( 'A jquery mock', function() {

      var orig;

      beforeEach( function() {
         orig = {
            height: $( '#myElement' ).height(),
            width: $( '#myElement' ).width(),
            scrollTop: $( document.body ).scrollTop(),
            scrollLeft: $( document.body ).scrollLeft()
         };
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      afterEach( function() {
         $.mockReset();
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      describe( 'mocks methods with constant result', function() {

         beforeEach( function() {
            $.mockResult( 'height', '#myElement', 12 );
            $.mockResult( 'scrollTop', document.body, 200 );
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'for a given selector', function() {
            expect( $( '#myElement' ).height() ).toEqual( 12 );
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'for a given DOM element', function() {
            expect( $( document.body ).scrollTop() ).toEqual( 200 );
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'allows resetting the mocked method to their original versions', function() {
            expect( $( '#myElement' ).height() ).not.toEqual( orig.height );
            expect( $( document.body ).scrollTop() ).not.toEqual( orig.scrollTop );

            $.mockReset();

            expect( $( '#myElement' ).height() ).toEqual( orig.height );
            expect( $( document.body ).scrollTop() ).toEqual( orig.scrollTop );
         } );

      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      describe( 'mocks methods with other methods', function() {

         var widthSpy;
         var scrollLeftSpy;
         var widthResult;
         var scrollLeftResult;

         beforeEach( function() {
            widthSpy = jasmine.createSpy( 'widthSpy' ).andReturn( 666 );
            scrollLeftSpy = jasmine.createSpy( 'scrollLeftSpy' ).andReturn( 7 );

            $.mockMethod( 'width', '#myElement', widthSpy );
            $.mockMethod( 'scrollLeft', document.body, scrollLeftSpy );

            widthResult = $( '#myElement' ).width( 500 );
            scrollLeftResult = $( document.body ).scrollLeft( 8 );
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'for a given selector', function() {
            expect( widthSpy ).toHaveBeenCalledWith( 500 );
            expect( widthResult ).toEqual( 666 );
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'for a given DOM element', function() {
            expect( scrollLeftSpy ).toHaveBeenCalledWith( 8 );
            expect( scrollLeftResult ).toEqual( 7 );
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'allows resetting the mocked method to their original versions', function() {
            expect( $( '#myElement' ).width() ).not.toEqual( orig.width );
            expect( $( document.body ).scrollLeft() ).not.toEqual( orig.scrollLeft );

            $.mockReset();

            expect( $( '#myElement' ).width() ).toEqual( orig.width );
            expect( $( document.body ).scrollLeft() ).toEqual( orig.scrollLeft );
         } );

      } );

   } );

} );
