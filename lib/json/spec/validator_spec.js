/**
 * Copyright 2016 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
import { create as createValidator } from '../validator';
import jjv from 'jjv';
import { deepClone } from '../../utilities/object';
import data from './spec_data';

describe( 'A JsonValidator', () => {

   it( 'calls jjv for actual validation', () => {
      spyOn( jjv.prototype, 'validate' );

      createValidator( data.simpleV4Schema ).validate( 'Hello World!' );

      expect( jjv.prototype.validate ).toHaveBeenCalledWith( data.simpleV4Schema, 'Hello World!' );
   } );

   ////////////////////////////////////////////////////////////////////////////////////////////////////////

   it( 'calls jjve for better messages on error', () => {
      const { errors } = createValidator( data.simpleV4Schema ).validate( [] );

      expect( errors.length ).toBe( 1 );
      expect( errors[ 0 ].code ).toEqual( 'VALIDATION_INVALID_TYPE' );
      expect( errors[ 0 ].path ).toEqual( '$' );
   } );

   ////////////////////////////////////////////////////////////////////////////////////////////////////////

   it( 'adds the path provided by jjve to the message', () => {
      const { errors } = createValidator( data.v4SchemaWithNestedProperties ).validate( [ { a: 12 } ] );

      expect( errors[ 0 ].message ).toEqual( 'Invalid type: integer should be string. Path: "$[0].a".' );
      expect( errors[ 0 ].path ).toEqual( '$[0].a' );
   } );

   ////////////////////////////////////////////////////////////////////////////////////////////////////////

   it( 'throws an error on missing schema version', () => {
      expect( () => createValidator( data.schemaWithoutVersion ) )
         .toThrow( new Error( 'Missing schema version. Use the $schema property to define it.' ) );
   } );

   ////////////////////////////////////////////////////////////////////////////////////////////////////////

   it( 'throws an error for unsupported schema version', () => {
      expect( () => createValidator( data.v3Schema ) )
         .toThrow( new Error(
            'Unsupported schema version "http://json-schema.org/draft-03/schema#". ' +
            'Only V4 is supported: "http://json-schema.org/draft-04/schema#".'
         ) );
   } );

   ////////////////////////////////////////////////////////////////////////////////////////////////////////

   describe( 'when asked to prohibit additional properties', () => {

      let schema;

      beforeEach( () => {
         schema = deepClone( data.v4SchemaWithDifferentProperties );
      } );

      /////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'calls a function to add the respective property to the schema', () => {
         expect( schema.properties.simpleProps.additionalProperties ).toBeUndefined();

         createValidator( schema, {
            prohibitAdditionalProperties: true
         } ).validate( {} );

         expect( schema.properties.simpleProps.additionalProperties ).toBe( false );
      } );

   } );

} );
