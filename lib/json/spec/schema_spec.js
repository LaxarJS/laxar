/**
 * Copyright 2015 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
import * as schema from '../schema';
import { deepClone } from '../../utilities/object';
import data from './spec_data';

describe( 'schema.transformV3ToV4( schema )', () => {

   var v4Schema;

   beforeEach( () => {
      v4Schema = schema.transformV3ToV4( data.v3Schema );
   } );

   //////////////////////////////////////////////////////////////////////////////////////////////////

   it( 'moves boolean required to required array property of parent schema', () => {
      expect( v4Schema.properties.resource.required ).not.toBeDefined();
      expect( v4Schema.required ).toContain( 'resource' );
   } );

   //////////////////////////////////////////////////////////////////////////////////////////////////

   it( 'simply removes required combined with a default value', () => {
      expect( v4Schema.properties.action.required ).not.toBeDefined();
      expect( v4Schema.required ).not.toContain( 'action' );
      expect( v4Schema.properties.action.type ).toEqual( 'string' );
   } );

   //////////////////////////////////////////////////////////////////////////////////////////////////

   it( 'adds "null" to the allowed types for non-required fields (LaxarJS interpretation of non-required)', () => {
      expect( v4Schema.properties.attribute.type ).toContain( 'string' );
      expect( v4Schema.properties.attribute.type ).toContain( 'null' );
   } );

   //////////////////////////////////////////////////////////////////////////////////////////////////

   it( 'treats falsy required attribute as if not set at all (#46)', () => {
      expect( v4Schema.properties.reallyNotRequired.required ).not.toBeDefined();
      expect( v4Schema.required ).not.toContain( 'reallyNotRequired' );
      expect( v4Schema.properties.reallyNotRequired.type ).toContain( 'string' );
      expect( v4Schema.properties.reallyNotRequired.type ).toContain( 'null' );
   } );

} );

///////////////////////////////////////////////////////////////////////////////////////////////////////////

describe( 'schema.prohibitAdditionalProperties( schema )', () => {

   var strictSchema;
   var strictNestedSchema;

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
