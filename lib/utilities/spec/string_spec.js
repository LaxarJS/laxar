/**
 * Copyright 2015 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
import * as string from '../string';

describe( 'String utilities', () => {

   describe( 'format( String[, Array][, Object] )', () => {

      it( 'uses the default formatter for non string values', () => {
         expect( string.format( null ) ).toEqual( 'null' );
         expect( string.format( 123 ) ).toEqual( '123' );
         expect( string.format( false ) ).toEqual( 'false' );
         expect( string.format( { a: 12 }  ) ).toEqual( '[object Object]' );
      } );

      /////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'replaces all indexed placeholders in a string and keeps placeholders with missing values', () => {
         expect( string.format( 'Hello [0], how do you like [1]?', [ 'Peter', 'Cheeseburgers' ] ) )
            .toEqual( 'Hello Peter, how do you like Cheeseburgers?' );

         expect( string.format( 'Hello [0], how do you like [1]?', [ 'Peter' ] ) )
            .toEqual( 'Hello Peter, how do you like [1]?' );
      } );

      /////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'replaces all existing named placeholders in a string and keeps placeholders with missing values', () => {
         expect( string.format( 'Hello [name], how do you like [thing]?', {
            name: 'Hans',
            thing: 'Steaks'
         } ) ).toEqual( 'Hello Hans, how do you like Steaks?' );

         expect( string.format( 'Hello [name], how do you like [thing]?', {
            name: 'Hans'
         } ) ).toEqual( 'Hello Hans, how do you like [thing]?' );
      } );

      /////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'replaces all existing indexed or named placeholders in a string and keeps placeholders with missing values', () => {
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

      it( 'ignores placeholders escaped with a backslash', () => {
         expect( string.format( 'Hello [name] and \\[partner], how do you like \\\\[0]?', [ 'Pizza' ], {
            name: 'Hans'
         } ) ).toEqual( 'Hello Hans and [partner], how do you like \\Pizza?' );

         expect( string.format( 'This is version \\[[version]]', {
            version: '1.1.2'
         } ) ).toEqual( 'This is version [1.1.2]' );
      } );

      /////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'throws an error if a placeholder is unterminated', () => {
         expect( () => { string.format( 'Bogus [0' ); } )
            .toThrow( new Error( 'Unterminated placeholder at index 6 of string: "Bogus [0".' ) );
      } );

      /////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'throws an error if an escape sequence is unterminated', () => {
         expect( () => { string.format( 'Bogus \\' ); } )
            .toThrow( new Error( 'Unterminated escaping sequence at index 6 of string: "Bogus \\".' ) );
      } );

      /////////////////////////////////////////////////////////////////////////////////////////////////////

      describe( 'by default supports type specifier', () => {

         it( '%s for strings', () => {
            expect( string.format( 'Hello [name:%s], here you have [amount:%s] dollars', {
               name: 'Hans',
               amount: {
                  toString: () => '3,45'
               }
            } ) ).toEqual( 'Hello Hans, here you have 3,45 dollars' );
         } );

         //////////////////////////////////////////////////////////////////////////////////////////////////

         it( '%d / %i for decimals / integers', () => {
            expect( string.format( '[0:%d] + [1:%i] = [2:%d]',[ 1.2, 2.1, 3.4 ] ) ).toEqual( '1 + 2 = 3' );
         } );

         //////////////////////////////////////////////////////////////////////////////////////////////////

         it( '%f for floating point numbers', () => {
            expect( string.format( '[0:%f]',[ 1.2343 ] ) ).toEqual( '1.2343' );
            expect( string.format( '[0:%.2f]',[ 1.2343 ] ) ).toEqual( '1.23' );
         } );

         //////////////////////////////////////////////////////////////////////////////////////////////////

         it( '%o for object types', () => {
            expect( string.format( 'User: [0:%o]', [ { user: 'Peter' } ] ) )
               .toEqual( 'User: {"user":"Peter"}' );
            expect( string.format( 'Items: [0:%o]', [ [ 'beer', 'wine', 'chips' ] ] ) )
               .toEqual( 'Items: ["beer","wine","chips"]' );
         } );

         //////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'and throws an error if an invalid specifier is used', () => {
            expect( () => { string.format( 'Unknown [0:%]', [ 1 ] ); } )
               .toThrow( new Error(
                  'Unknown format specifier "%" for placeholder at index 8 of string: ' +
                  '"Unknown [0:%]" (Known specifiers are: %s, %d, %i, %f, %o).'
               ) );
         } );

         //////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'and throws an error if an unknown specifier is used', () => {
            expect( () => { string.format( 'Unknown [0:%x]', [ 1 ] ); } )
               .toThrow( new Error(
                  'Unknown format specifier "%x" for placeholder at index 8 of string: ' +
                  '"Unknown [0:%x]" (Known specifiers are: %s, %d, %i, %f, %o).'
               ) );
         } );

      } );

   } );

   ////////////////////////////////////////////////////////////////////////////////////////////////////////

   describe( 'createFormatter( Object )', () => {

      var format;

      beforeEach( () => {
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

      it( 'creates a format function using the given type formatters', () => {
         expect( format( 'You owe me [0:%m].', [ { amount: 12, currency: 'EUR' } ] ) )
            .toEqual( 'You owe me 12 EUR.' );
         expect( format( '[0]^3 = [0:%3p]', [ 2 ] ) )
            .toEqual( '2^3 = 8' );
      } );

      //////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'creates a format function that throws an error if an unknown specifier is used', () => {
         expect( () => { format( 'Unknown [0:%x]', [ 1 ] ); } )
            .toThrow( new Error(
               'Unknown format specifier "%x" for placeholder at index 8 of string: ' +
               '"Unknown [0:%x]" (Known specifiers are: %m, %p).'
            ) );
      } );

   } );

   ////////////////////////////////////////////////////////////////////////////////////////////////////////

   describe( 'createFormatter( null, Object )', () => {

      var format;

      beforeEach( () => {
         format = string.createFormatter( {
            s: value => value.toString(),
            'default': value => JSON.stringify( value )
         }, {
            anonymize: () => '[anonymized]',
            flip: s => ( '' + s ).split( '' ).reverse().join( '' )
         } );
      } );

      /////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'creates a format function using the given mapping functions', () => {
         expect( format( 'You owe me [0:%s:anonymize:flip].', [ 'nothing' ] ) )
            .toEqual( 'You owe me ]dezimynona[.' );
      } );

      /////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'creates a format function using identity if a given mapping function does not exist', () => {
         expect( format( 'You owe me [0:%s:flip:whatever:flip].', [ 'nothing' ] ) )
            .toEqual( 'You owe me nothing.' );
      } );

      /////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'calls the default formatter before calling filters if no explicit type specifier is given', () => {
         expect( format( 'You owe me [0:flip].', [ { flip: 'me' } ] ) )
            .toEqual( 'You owe me }"em":"pilf"{.' );
      } );

   } );

} );
