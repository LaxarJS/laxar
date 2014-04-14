/**
 * Copyright 2014 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
define( [
   '../string'
], function( string ) {
   'use strict';

   describe( 'String utilities', function() {

      describe( 'endsWith( String, String[, Boolean] )', function() {

         it( 'returns true if the first argument ends with the second argument', function() {
            expect( string.endsWith( 'Hallo Hans', 'Hans' ) ).toBe( true );
            expect( string.endsWith( 'http://person-searches', '-searches' ) ).toBe( true );
            expect( string.endsWith( 'anything', '' ) ).toBe( true );
            expect( string.endsWith( 'anything', 'anything' ) ).toBe( true );
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'returns false if the first argument does not end with the second argument', function() {
            expect( string.endsWith( 'Hallo Hans', 'Hans ' ) ).toBe( false );
            expect( string.endsWith( 'http://person-searches ', '-searches' ) ).toBe( false );
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'returns true if the first argument ends with the second argument', function() {
            expect( string.endsWith( 'Hallo Hans', 'hans', true ) ).toBe( true );
            expect( string.endsWith( 'http://person-searches', '-sEarches', true ) ).toBe( true );
            expect( string.endsWith( 'anything', '', true ) ).toBe( true );
            expect( string.endsWith( 'anyThing', 'anythiNg', true ) ).toBe( true );
         } );

      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      describe( 'upperCaseToCamelCase( String[, Boolean] )', function() {

         it( 'converts an upper-case underscore separated string into the respective camel-case representation', function() {
            expect( string.upperCaseToCamelCase( 'GREAT_ID' ) ).toEqual( 'greatId' );
            expect( string.upperCaseToCamelCase( '_A_' ) ).toEqual( '_A_' );
            expect( string.upperCaseToCamelCase( 'A_A_' ) ).toEqual( 'aA_' );
            expect( string.upperCaseToCamelCase( 'A_A__a' ) ).toEqual( 'aA_A' );
            expect( string.upperCaseToCamelCase( 'AB_CD__DE_' ) ).toEqual( 'abCd_De_' );
            expect( string.upperCaseToCamelCase( 'A___A' ) ).toEqual( 'a__A' );
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'can remove all underscores', function() {
            expect( string.upperCaseToCamelCase( 'GREAT_ID', true ) ).toEqual( 'greatId' );
            expect( string.upperCaseToCamelCase( '_A_', true ) ).toEqual( 'a' );
            expect( string.upperCaseToCamelCase( 'A_A_', true ) ).toEqual( 'aA' );
            expect( string.upperCaseToCamelCase( 'A_A__a', true ) ).toEqual( 'aAA' );
            expect( string.upperCaseToCamelCase( 'AB_CD__DE_', true ) ).toEqual( 'abCdDe' );
            expect( string.upperCaseToCamelCase( 'A___A', true ) ).toEqual( 'aA' );
         } );

      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      describe( 'removeUnderscoresFromCamelCase( String )', function() {

         it( 'removes all underscores in camel case strings combined by underscores', function() {
            expect( string.removeUnderscoresFromCamelCase( 'x_y' ) ).toEqual( 'xY' );
            expect( string.removeUnderscoresFromCamelCase( 'myComponent__id0' ) ).toEqual( 'myComponentId0' );
            expect( string.removeUnderscoresFromCamelCase( '__myComponent__id0__' ) ).toEqual( 'myComponentId0' );
            expect( string.removeUnderscoresFromCamelCase( 'accordion_widget__id0' ) ).toEqual( 'accordionWidgetId0' );
         } );

      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      describe( 'capitalize( String )', function() {

         it( 'returns any value that is not a string as it is', function() {
            expect( string.capitalize( 123 ) ).toBe( 123 );
            expect( string.capitalize( null ) ).toBe( null );
            expect( string.capitalize( undefined ) ).toBe( undefined );
            expect( string.capitalize( {} ) ).toEqual( {} );
            expect( string.capitalize( [] ) ).toEqual( [] );
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'returns an empty string as it is', function() {
            expect( string.capitalize( '' ) ).toEqual( '' );
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'returns a string with lower case first letter capitalized', function() {
            expect( string.capitalize( 'hello' ) ).toEqual( 'Hello' );
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'returns a string with upper case first letter capitalized', function() {
            expect( string.capitalize( 'Hello' ) ).toEqual( 'Hello' );
         } );

      } );

   } );

} );