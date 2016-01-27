/**
 * Copyright 2015 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
import assert from '../assert';

describe( 'An assertion library', () => {

   it( 'returns a function to create an assert instance', () => {
      expect( typeof assert ).toEqual( 'function' );
   } );

   ////////////////////////////////////////////////////////////////////////////////////////////////////////

   it( 'wraps a given test subject within an assert object', () => {
      expect( assert( {} ) ).toBeDefined();
   } );

   ////////////////////////////////////////////////////////////////////////////////////////////////////////

   it( 'uses global details if no local are given', () => {
      expect( () => {
         assert( 12, 'global details' ).hasType( String );
      } ).toThrow( new Error( 'Assertion error: Expected value to be an instance of "String" but was "Number". Details: global details' ) );
      expect( () => {
         assert( null, 'global details' ).hasType( String, 'irrelevant' ).isNotNull();
      } ).toThrow( new Error( 'Assertion error: Expected value to be defined and not null. Details: global details' ) );
   } );

} );

///////////////////////////////////////////////////////////////////////////////////////////////////////////

describe( 'Assert', () => {

   var objectAssert;
   var stringAssert;
   var numberAssert;
   var arrayAssert;
   var functionAssert;
   var nullAssert;
   var undefinedAssert;

   beforeEach( () => {
      objectAssert = assert( { myKey: 'val' } );
      stringAssert = assert( 'myString' );
      numberAssert = assert( 45 );
      arrayAssert = assert( [ 4, 'two' ] );
      functionAssert = assert( () => {} );
      nullAssert = assert( null );
      undefinedAssert = assert( void 0 );
   } );

   ////////////////////////////////////////////////////////////////////////////////////////////////////////

   describe( 'codeIsUnreachable', () => {

      it( 'throws when executed', () => {
         expect( () => { assert.codeIsUnreachable(); } )
            .toThrow( new Error( 'Assertion error: Code should be unreachable!' ) );
      } );

      /////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'appends the optional details to the exception', () => {
         expect( () => { assert.codeIsUnreachable( 'my details' ); } )
            .toThrow( new Error( 'Assertion error: Code should be unreachable! Details: my details' ) );
      } );

      /////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'appends a serialized version of object details to the exception', () => {
         expect( () => { assert.codeIsUnreachable( { key: 'my value' } ); } )
            .toThrow( new Error( 'Assertion error: Code should be unreachable! Details: {"key":"my value"}' ) );
      } );

   } );

   ////////////////////////////////////////////////////////////////////////////////////////////////////////

   describe( 'state', () => {

      it( 'does not throw if the given state is truthy', () => {
         expect( () => { assert.state( true ); } ).not.toThrow();
         expect( () => { assert.state( 1 ); } ).not.toThrow();
         expect( () => { assert.state( 'hello' ); } ).not.toThrow();
      } );

      /////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'throws if the given state is falsy', () => {
         expect( () => { assert.state( false ); } ).toThrow( new Error( 'Assertion error: State does not hold.' ) );
         expect( () => { assert.state( 1 === 2 ); } ).toThrow( new Error( 'Assertion error: State does not hold.' ) );
         expect( () => { assert.state( '' ); } ).toThrow( new Error( 'Assertion error: State does not hold.' ) );
         expect( () => { assert.state( null ); } ).toThrow( new Error( 'Assertion error: State does not hold.' ) );
      } );

      /////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'appends the optional details to the exception', () => {
         expect( () => { assert.state( false, 'More Details' ); } )
            .toThrow( new Error( 'Assertion error: State does not hold. Details: More Details' ) );
      } );

      /////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'appends a serialized version of object details to the exception', () => {
         expect( () => { assert.state( false, { key: 'my value' } ); } )
            .toThrow( new Error( 'Assertion error: State does not hold. Details: {"key":"my value"}' ) );
      } );

   } );

   ////////////////////////////////////////////////////////////////////////////////////////////////////////

   describe( 'isNotNull', () => {

      it( 'does not throw for defined non null items', () => {
         expect( () => { objectAssert.isNotNull(); } ).not.toThrow();
         expect( () => { stringAssert.isNotNull(); } ).not.toThrow();
         expect( () => { numberAssert.isNotNull(); } ).not.toThrow();
         expect( () => { arrayAssert.isNotNull(); } ).not.toThrow();
         expect( () => { functionAssert.isNotNull(); } ).not.toThrow();
      } );

      /////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'throws for null or undefined items', () => {
         expect( () => { nullAssert.isNotNull(); } )
            .toThrow( new Error( 'Assertion error: Expected value to be defined and not null.' ) );
         expect( () => { undefinedAssert.isNotNull(); } )
            .toThrow( new Error( 'Assertion error: Expected value to be defined and not null.' ) );
      } );

      /////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'returns the assert object again for chaining', () => {
         expect( objectAssert.isNotNull() ).toBe( objectAssert );
      } );

      /////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'appends the optional details to the exception', () => {
         expect( () => { nullAssert.isNotNull( 'my details' ); } )
            .toThrow( new Error( 'Assertion error: Expected value to be defined and not null. Details: my details' ) );
      } );

      /////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'appends a serialized version of object details to the exception', () => {
         expect( () => { nullAssert.isNotNull( { key: 'my value' } ); } )
            .toThrow( new Error( 'Assertion error: Expected value to be defined and not null. Details: {"key":"my value"}' ) );
      } );

   } );

   ////////////////////////////////////////////////////////////////////////////////////////////////////////

   describe( 'hasType', () => {

      it( 'can be used with a constructor function for instanceof checks', () => {
         expect( () => { objectAssert.hasType( Object ); } ).not.toThrow();
         expect( () => { stringAssert.hasType( String ); } ).not.toThrow();
      } );

      /////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'throws if the type is no function', () => {
         expect( () => { objectAssert.hasType( 'Function' ); } )
            .toThrow( new Error( 'Assertion error: type must be a constructor function. Got string.' ) );
      } );

      /////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'throws for a wrong instance type', () => {
         expect( () => { objectAssert.hasType( Number ); } )
            .toThrow( new Error( 'Assertion error: Expected value to be an instance of "Number" but was "Object".' ) );
         expect( () => { numberAssert.hasType( String ); } )
            .toThrow( new Error( 'Assertion error: Expected value to be an instance of "String" but was "Number".' ) );
      } );

      /////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'returns the assert object again for chaining', () => {
         expect( objectAssert.hasType( Object ) ).toBe( objectAssert );
         expect( nullAssert.hasType( Number ) ).toBe( nullAssert );
      } );

      /////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'appends the optional details to the exception', () => {
         expect( () => { objectAssert.hasType( Number, 'My Details' ); } )
            .toThrow( new Error( 'Assertion error: Expected value to be an instance of "Number" but was "Object". Details: My Details' ) );
      } );

      /////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'appends a serialized version of object details to the exception', () => {
         expect( () => { objectAssert.hasType( Number, { key: 'my value' } ); } )
            .toThrow( new Error( 'Assertion error: Expected value to be an instance of "Number" but was "Object". Details: {"key":"my value"}' ) );
      } );

   } );

   ////////////////////////////////////////////////////////////////////////////////////////////////////////

   describe( 'hasProperty', () => {

      it( 'does not throw if the subject has the given property', () => {
         expect( () => { objectAssert.hasProperty( 'myKey' ); } ).not.toThrow();
      } );

      /////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'throws if the subject is no object', () => {
         expect( () => { numberAssert.hasProperty( 'myKey' ); } )
            .toThrow( new Error( 'Assertion error: value must be an object. Got number.' ) );
      } );

      /////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'throws if the subject is missing the property', () => {
         expect( () => { objectAssert.hasProperty( 'myMissingKey' ); } )
            .toThrow( new Error( 'Assertion error: value is missing mandatory property "myMissingKey".' ) );
      } );

      /////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'returns the assert object again for chaining', () => {
         expect( objectAssert.hasProperty( 'myKey' ) ).toBe( objectAssert );
         expect( nullAssert.hasType( Number ) ).toBe( nullAssert );
      } );

      /////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'appends the optional details to the exception', () => {
         expect( () => { objectAssert.hasProperty( 'myMissingKey', 'no details' ); } )
            .toThrow( new Error( 'Assertion error: value is missing mandatory property "myMissingKey". Details: no details' ) );
      } );

      /////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'appends a serialized version of object details to the exception', () => {
         expect( () => { objectAssert.hasProperty( 'myMissingKey', { key: 'my value' } ); } )
            .toThrow( new Error( 'Assertion error: value is missing mandatory property "myMissingKey". Details: {"key":"my value"}' ) );
      } );

   } );

} );
