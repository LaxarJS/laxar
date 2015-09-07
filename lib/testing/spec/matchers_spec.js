/**
 * Copyright 2015 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
define( [
   '../../utilities/object',
   '../matchers'
], function( object, matchers ) {
   'use strict';

   describe( 'addMatchers( spec )', function() {

      var mySpec;

      beforeEach( function() {
         mySpec = {
            addMatchers: function( matchers ) {
               mySpec = object.extend( mySpec, matchers );
            }
         };

         matchers.addTo( mySpec );
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      describe( 'adds a toContainAllOf() matcher that', function() {

         beforeEach( function() {
            mySpec.actual = [ 'a', 'b', 'c' ];
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'returns true if all expected values are contained within the actual list of values', function() {
            expect( mySpec.toContainAllOf( [ 'a', 'b' ] ) ).toBe( true );
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'returns false if any expected value is missing in the actual list of values', function() {
            expect( mySpec.toContainAllOf( [ 'a', 'x' ] ) ).toBe( false );
         } );

      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      describe( 'adds a toMatch() matcher that', function() {
         beforeEach( function() {
            mySpec.actual = {
               a: 'A',
               b: [ 3, 5, 9, { x: 'u' } ],
               c: {},
               d: { x: [ 7, 4, 'hello' ] }
            };
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'returns true if the actual object matches the expected object', function() {
            expect( mySpec.toMatch( matchers.ANY ) ).toBe( true );
            expect( mySpec.toMatch( {} ) ).toBe( false );
            expect( mySpec.toMatch( { a: matchers.ANY } ) ).toBe( false );

            expect( mySpec.toMatch( {
               a: matchers.ANY,
               b: matchers.ANY,
               c: matchers.ANY
            } ) ).toBe( false );

            expect( mySpec.toMatch( {
               a: matchers.ANY,
               b: matchers.ANY,
               c: matchers.ANY,
               d: matchers.ANY
            } ) ).toBe( true );

            expect( mySpec.toMatch( {
               a: 'B',
               b: matchers.ANY,
               c: matchers.ANY,
               d: matchers.ANY
            } ) ).toBe( false );

            expect( mySpec.toMatch( {
               a: 'A',
               b: [ 3, 5, 9, matchers.ANY ],
               c: {},
               d: matchers.ANY
            } ) ).toBe( true );

            expect( mySpec.toMatch( {
               a: 'A',
               b: [ 3, 5, 9, { x: 'u' } ],
               c: {},
               d: matchers.ANY
            } ) ).toBe( true );

            expect( mySpec.toMatch( {
               a: 'A',
               b: [ 3, 5, 9, { x: matchers.ANY } ],
               c: {},
               d: { x: [ 7, 4, 'hello' ] }
            } ) ).toBe( true );
         } );
      } );
   } );

} );
