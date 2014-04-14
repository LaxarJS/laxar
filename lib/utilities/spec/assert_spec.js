/**
 * Copyright 2014 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
define( [
   '../assert'
], function( assert ) {
   'use strict';

   describe( 'An assertion library', function() {
      
      it( 'returns a function to create an assert instance', function() {
         expect( typeof( assert ) ).toEqual( 'function' );
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'wraps a given test subject within an assert object', function() {
         expect( assert( {} ) ).toBeDefined();
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'uses global details if no local are given', function() {
         expect( function() {
            assert( 12, 'global details' ).hasType( String );
         } ).toThrow( 'Assertion error: Expected value to be an instance of "String" but was "Number". Details: global details' );
         expect( function() {
            assert( null, 'global details' ).hasType( String, 'irrelevant' ).isNotNull();
         } ).toThrow( 'Assertion error: Expected value to be defined and not null. Details: global details' );
      } );
      
   } );

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   describe( 'Assert', function() {

      var objectAssert;
      var stringAssert;
      var numberAssert;
      var arrayAssert;
      var functionAssert;
      var nullAssert;
      var undefinedAssert;

      beforeEach( function() {
         objectAssert = assert( { myKey: 'val' } );
         stringAssert = assert( 'myString' );
         numberAssert = assert( 45 );
         arrayAssert = assert( [ 4, 'two' ] );
         functionAssert = assert( function() {} );
         nullAssert = assert( null );
         undefinedAssert = assert( void 0 );
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      describe( 'codeIsUnreachable', function() {

         it( 'throws when executed', function() {
            expect( function() { assert.codeIsUnreachable(); } )
               .toThrow( 'Assertion error: Code should be unreachable!' );
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'appends the optional details to the exception', function() {
            expect( function() { assert.codeIsUnreachable( 'my details' ); } )
               .toThrow( 'Assertion error: Code should be unreachable! Details: my details' );
         } );

      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      describe( 'state', function() {

         it( 'does not throw if the given state is truthy', function() {
            expect( function() { assert.state( true ); } ).not.toThrow();
            expect( function() { assert.state( 1 ); } ).not.toThrow();
            expect( function() { assert.state( 'hello' ); } ).not.toThrow();
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'throws if the given state is falsy', function() {
            expect( function() { assert.state( false ); } ).toThrow( 'Assertion error: State does not hold.');
            expect( function() { assert.state( 1 === 2 ); } ).toThrow( 'Assertion error: State does not hold.' );
            expect( function() { assert.state( '' ); } ).toThrow( 'Assertion error: State does not hold.' );
            expect( function() { assert.state( null ); } ).toThrow( 'Assertion error: State does not hold.' );
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'appends the optional details to the exception', function() {
            expect( function() { assert.state( false, 'More Details' ); } )
               .toThrow( 'Assertion error: State does not hold. Details: More Details' );
         } );

      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      describe( 'isNotNull', function() {

         it( 'does not throw for defined non null items', function() {
            expect( function() { objectAssert.isNotNull(); } ).not.toThrow();
            expect( function() { stringAssert.isNotNull(); } ).not.toThrow();
            expect( function() { numberAssert.isNotNull(); } ).not.toThrow();
            expect( function() { arrayAssert.isNotNull(); } ).not.toThrow();
            expect( function() { functionAssert.isNotNull(); } ).not.toThrow();
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'throws for null or undefined items', function() {
            expect( function() { nullAssert.isNotNull(); } )
               .toThrow( 'Assertion error: Expected value to be defined and not null.' );
            expect( function() { undefinedAssert.isNotNull(); } )
               .toThrow( 'Assertion error: Expected value to be defined and not null.' );
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'appends the optional details to the exception', function() {
            expect( function() { nullAssert.isNotNull( 'my details' ); } )
               .toThrow( 'Assertion error: Expected value to be defined and not null. Details: my details' );
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'returns the assert object again for chaining', function() {
            expect( objectAssert.isNotNull() ).toBe( objectAssert );
         } );

      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      describe( 'hasType', function() {
         
         it( 'can be used with a constructor function for instanceof checks', function() {
            expect( function() { objectAssert.hasType( Object ); } ).not.toThrow();
            expect( function() { stringAssert.hasType( String ); } ).not.toThrow();
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'throws if the type is no function', function() {
            expect( function() { objectAssert.hasType( 'Function' ); } )
               .toThrow( 'Assertion error: type must be a constructor function. Got string.' );
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'throws for a wrong instance type', function() {
            expect( function() { objectAssert.hasType( Number ); } )
               .toThrow( 'Assertion error: Expected value to be an instance of "Number" but was "Object".' );
            expect( function() { numberAssert.hasType( String ); } )
               .toThrow( 'Assertion error: Expected value to be an instance of "String" but was "Number".' );
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'returns the assert object again for chaining', function() {
            expect( objectAssert.hasType( Object ) ).toBe( objectAssert );
            expect( nullAssert.hasType( Number ) ).toBe( nullAssert );
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'appends the optional details to the exception', function() {
            expect( function() { objectAssert.hasType( Number, 'My Details' ); } )
               .toThrow( 'Assertion error: Expected value to be an instance of "Number" but was "Object". Details: My Details' );
         } );

      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      describe( 'hasProperty', function() {

         it( 'does not throw if the subject has the given property', function() {
            expect( function() { objectAssert.hasProperty( 'myKey' ); } ).not.toThrow();
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'throws if the subject is no object', function() {
            expect( function() { numberAssert.hasProperty( 'myKey' ); } )
               .toThrow( 'Assertion error: value must be an object. Got number.' );
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'throws if the subject is missing the property', function() {
            expect( function() { objectAssert.hasProperty( 'myMissingKey' ); } )
               .toThrow( 'Assertion error: value is missing mandatory property "myMissingKey".' );
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'returns the assert object again for chaining', function() {
            expect( objectAssert.hasProperty( 'myKey' ) ).toBe( objectAssert );
            expect( nullAssert.hasType( Number ) ).toBe( nullAssert );
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'appends the optional details to the exception', function() {
            expect( function() { objectAssert.hasProperty( 'myMissingKey', 'no details' ); } )
               .toThrow( 'Assertion error: value is missing mandatory property "myMissingKey". Details: no details' );
         } );

      } );

   } );

} );