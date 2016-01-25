/**
 * Copyright 2015 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
import { create as createValidator } from '../validator';
import * as schema from '../schema';
import jjv from 'jjv';
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
      expect( errors[0].code ).toEqual( 'VALIDATION_INVALID_TYPE' );
      expect( errors[0].path ).toEqual( '$' );
   } );

   ////////////////////////////////////////////////////////////////////////////////////////////////////////

   it( 'adds the path provided by jjve to the message', () => {
      const { errors } = createValidator( data.v4SchemaWithNestedProperties ).validate( [ { a: 12 } ] );

      expect( errors[0].message ).toEqual( 'Invalid type: integer should be string. Path: "$[0].a".' );
      expect( errors[0].path ).toEqual( '$[0].a' );
   } );

   ////////////////////////////////////////////////////////////////////////////////////////////////////////

   describe( 'for non draft v4 schemas', () => {

      beforeEach( () => {
         spyOn( schema, 'transformV3ToV4' ).and.callThrough();
      } );

      /////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'triggers transformation of the schema', () => {
         createValidator( data.v3Schema ).validate( {} );

         expect( schema.transformV3ToV4 ).toHaveBeenCalledWith( data.v3Schema );
      } );

   } );

   ////////////////////////////////////////////////////////////////////////////////////////////////////////

   describe( 'when asked to prohibit additional properties', () => {

      beforeEach( () => {
         spyOn( schema, 'prohibitAdditionalProperties' ).and.callThrough();
      } );

      /////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'calls a function to add the respective property to the schema', () => {
         createValidator( data.simpleV4Schema, {
            prohibitAdditionalProperties: true
         } ).validate( {} );

         expect( schema.prohibitAdditionalProperties ).toHaveBeenCalledWith( data.simpleV4Schema );
      } );

   } );

} );
