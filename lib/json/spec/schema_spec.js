/**
 * Copyright 2016 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
import * as schema from '../schema';
import { deepClone } from '../../utilities/object';
import data from './spec_data';

describe( 'schema.prohibitAdditionalProperties( schema )', () => {

   let strictSchema;
   let strictNestedSchema;

   beforeEach( () => {
      // prohibitAdditionalProperties modifies the schema. Hence, to isolate tests, we need to clone.
      strictSchema = deepClone( data.v4SchemaWithDifferentProperties );
      strictNestedSchema = deepClone( data.v4SchemaWithNestedProperties );

      schema.prohibitAdditionalProperties( strictSchema );
      schema.prohibitAdditionalProperties( strictNestedSchema );
   } );

   ////////////////////////////////////////////////////////////////////////////////////////////////////////

   it( 'adds additionProperties false where applicable', () => {
      expect( strictSchema.additionalProperties ).toBe( false );
      expect( strictSchema.properties.simpleProps.additionalProperties ).toBe( false );
      expect( strictSchema.properties.patternProps.additionalProperties ).toBe( false );
      expect( strictSchema.properties.patternAndSimpleProps.additionalProperties ).toBe( false );
   } );

   ////////////////////////////////////////////////////////////////////////////////////////////////////////

   it( 'leaves existing additionalProperties untouched', () => {
      expect( strictSchema.properties.propsWithAdditional )
         .toEqual( data.v4SchemaWithDifferentProperties.properties.propsWithAdditional );
      expect( strictSchema.properties.allTypeOfProps )
         .toEqual( data.v4SchemaWithDifferentProperties.properties.allTypeOfProps );
   } );

   ////////////////////////////////////////////////////////////////////////////////////////////////////////

   it( 'descends into nested pattern properties', () => {
      expect( strictNestedSchema.patternProperties['^y'].additionalProperties ).toBe( false );
   } );

   ////////////////////////////////////////////////////////////////////////////////////////////////////////

   it( 'descends into nested additional properties', () => {
      expect( strictNestedSchema.additionalProperties.additionalProperties ).toBe( false );
   } );

   ////////////////////////////////////////////////////////////////////////////////////////////////////////

   it( 'descends into nested array item specifications', () => {
      expect( strictNestedSchema.items.additionalProperties ).toBe( false );
   } );

} );
