/**
 * Copyright 2014 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
define( [
    '../array'
], function( arrayUtilities ) {
   'use strict';

   describe( 'Array utilities', function() {

      describe( 'remove( Array, Object )', function() {

         it( 'removes an item when called with an array which contains that item', function() {
            var array = [ 1 ];
            arrayUtilities.remove( array, 1 );
            expect( array.length ).toBe( 0 );
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'removes only the first item when called with an array which contains that item multiple times', function() {
            var array = [ 1, 2, 1 ];
            arrayUtilities.remove( array, 1 );
            expect( array ).toEqual( [ 2, 1 ] );
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'returns false when called on an empty array', function() {
            expect ( arrayUtilities.remove( [], 'dontcare' ) ).toBe( false );
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'returns true when called with an array which contains that item', function() {
            expect( arrayUtilities.remove( [ 1 ], 1 ) ).toBe( true );
         } );

      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      describe( 'removeAll( Array, Object )', function() {

         it( 'removes an item when called with an array which contains that item', function() {
            var array = [ 1 ];
            arrayUtilities.remove( array, 1 );
            expect( array.length ).toBe( 0 );
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'removes all occurrences of an item when called with an array which contains that item multiple times', function() {
            var array = [ 1, 2, 1 ];
            arrayUtilities.removeAll( array, 1 );
            expect( array ).toEqual( [ 2 ] );
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'returns false when called on an empty array', function() {
            expect ( arrayUtilities.removeAll( [], 'dontcare' ) ).toBe( false );
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'returns true when called with an array which contains that item', function() {
            expect( arrayUtilities.removeAll( [ 1 ], 1 ) ).toBe( true );
         } );

      } );

   } );

} );