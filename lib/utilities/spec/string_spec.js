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

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      describe( 'format( String[, Array][, Object] )', function() {

         it( 'uses the default formatter for non string values', function() {
            expect( string.format( null ) ).toEqual( 'null' );
            expect( string.format( 123 ) ).toEqual( '123' );
            expect( string.format( false ) ).toEqual( 'false' );
            expect( string.format( { a: 12 }  ) ).toEqual( '[object Object]' );
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'replaces all indexed placeholders in a string and keeps placeholders with missing values', function() {
            expect( string.format( 'Hello [0], how do you like [1]?', [ 'Peter', 'Cheeseburgers' ] ) )
               .toEqual( 'Hello Peter, how do you like Cheeseburgers?' );

            expect( string.format( 'Hello [0], how do you like [1]?', [ 'Peter' ] ) )
               .toEqual( 'Hello Peter, how do you like [1]?' );
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'replaces all existing named placeholders in a string and keeps placeholders with missing values', function() {
            expect( string.format( 'Hello [name], how do you like [thing]?', {
               name: 'Hans',
               thing: 'Steaks'
            } ) ).toEqual( 'Hello Hans, how do you like Steaks?' );

            expect( string.format( 'Hello [name], how do you like [thing]?', {
               name: 'Hans'
            } ) ).toEqual( 'Hello Hans, how do you like [thing]?' );
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'replaces all existing indexed or named placeholders in a string and keeps placeholders with missing values', function() {
            expect( string.format( 'Hello [name] and [partner], how do you like [0]?', [ 'Pizza' ], {
               name: 'Hans',
               partner: 'Roswita'
            } ) ).toEqual( 'Hello Hans and Roswita, how do you like Pizza?' );

            expect( string.format( 'Hello [name] and [partner], how do you like [0]?', {
               name: 'Hans'
            } ) ).toEqual( 'Hello Hans and [partner], how do you like [0]?' );

            expect( string.format( '[0] [does not] [1]', [ 'This', 'works!' ], {
               'does not': 'really'
            } ) ).toEqual( 'This really works!' );
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'ignores placeholders escaped with a backslash', function() {
            expect( string.format( 'Hello [name] and \\[partner], how do you like \\\\[0]?', [ 'Pizza' ], {
               name: 'Hans'
            } ) ).toEqual( 'Hello Hans and [partner], how do you like \\Pizza?' );

            expect( string.format( 'This is version \\[[version]]', {
               version: '1.1.2'
            } ) ).toEqual( 'This is version [1.1.2]' );
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'throws an error if a placeholder is unterminated', function() {
            expect( function() { string.format( 'Bogus [0' ); } )
               .toThrow( 'Unterminated placeholder at index 6 of string: "Bogus [0".' );
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'throws an error if an escape sequence is unterminated', function() {
            expect( function() { string.format( 'Bogus \\' ); } )
               .toThrow( 'Unterminated escaping sequence at index 6 of string: "Bogus \\".' );
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         describe( 'by default supports type specifier', function() {

            it( '%s for strings', function() {
               expect( string.format( 'Hello [name:%s], here you have [amount:%s] dollars', {
                  name: 'Hans',
                  amount: {
                     toString: function() { return '3,45'; }
                  }
               } ) ).toEqual( 'Hello Hans, here you have 3,45 dollars' );
            } );

            //////////////////////////////////////////////////////////////////////////////////////////////////

            it( '%d / %i for decimals / integers', function() {
               expect( string.format( '[0:%d] + [1:%i] = [2:%d]',[ 1.2, 2.1, 3.4 ] ) ).toEqual( '1 + 2 = 3' );
            } );

            //////////////////////////////////////////////////////////////////////////////////////////////////

            it( '%f for floating point numbers', function() {
               expect( string.format( '[0:%f]',[ 1.2343 ] ) ).toEqual( '1.2343' );
               expect( string.format( '[0:%.2f]',[ 1.2343 ] ) ).toEqual( '1.23' );
            } );

            //////////////////////////////////////////////////////////////////////////////////////////////////

            it( '%o for object types', function() {
               expect( string.format( 'User: [0:%o]', [ { user: 'Peter' } ] ) )
                  .toEqual( 'User: {"user":"Peter"}' );
               expect( string.format( 'Items: [0:%o]', [ [ 'beer', 'wine', 'chips' ] ] ) )
                  .toEqual( 'Items: ["beer","wine","chips"]' );
            } );

            //////////////////////////////////////////////////////////////////////////////////////////////////

            it( 'and throws an error if an invalid specifier is used', function() {
               expect( function() { string.format( 'Unknown [0:%]', [ 1 ] ); } )
                  .toThrow( 'Invalid format specifier "%" at index 11 of string: "Unknown [0:%]".' );
               expect( function() { string.format( 'Unknown [0:hi]', [ 1 ] ); } )
                  .toThrow( 'Invalid format specifier "hi" at index 11 of string: "Unknown [0:hi]".' );
            } );

            //////////////////////////////////////////////////////////////////////////////////////////////////

            it( 'and throws an error if an unknown specifier is used', function() {
               expect( function() { string.format( 'Unknown [0:%x]', [ 1 ] ); } )
                  .toThrow( 'Unknown format specifier "x" at index 11 of string: "Unknown [0:%x]" ' +
                     '(Known specifiers are: %s, %d, %i, %f, %o).' );
            } );

         } );

      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      describe( 'createFormatter( Object )', function() {

         var format;

         beforeEach( function() {
            format = string.createFormatter( {
               'm': function( value ) {
                  return value.amount + ' ' + value.currency;
               },
               'p': function( value, subSpecifier ) {
                  return Math.pow( value, parseInt( subSpecifier, 10 ) );
               }
            } );
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'creates a format function using the given type formatters', function() {
            expect( format( 'You owe me [0:%m].', [ { amount: 12, currency: 'EUR' } ] ) )
               .toEqual( 'You owe me 12 EUR.' );
            expect( format( '[0]^3 = [0:%3p]', [ 2 ] ) )
               .toEqual( '2^3 = 8' );
         } );

         //////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'creates a format function that throws an error if an unknown specifier is used', function() {
            expect( function() { format( 'Unknown [0:%x]', [ 1 ] ); } )
               .toThrow( 'Unknown format specifier "x" at index 11 of string: "Unknown [0:%x]" ' +
                  '(Known specifiers are: %m, %p).' );
         } );

      } );

   } );

} );
