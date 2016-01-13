/**
 * Copyright 2016 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
define( [
   '../schema',
   '../../utilities/object',
   './spec_data'
], function( schema, object, data ) {
   'use strict';

   describe( 'schema.transformV3ToV4( schema )', function() {

      var v4Schema;

      beforeEach( function() {
         v4Schema = schema.transformV3ToV4( data.v3Schema );
      } );

      //////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'moves boolean required to required array property of parent schema', function() {
         expect( v4Schema.properties.resource.required ).not.toBeDefined();
         expect( v4Schema.required ).toContain( 'resource' );
      } );

      //////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'simply removes required combined with a default value', function() {
         expect( v4Schema.properties.action.required ).not.toBeDefined();
         expect( v4Schema.required ).not.toContain( 'action' );
         expect( v4Schema.properties.action.type ).toEqual( 'string' );
      } );

      //////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'adds "null" to the allowed types for non-required fields (LaxarJS interpretation of non-required)', function() {
         expect( v4Schema.properties.attribute.type ).toContain( 'string' );
         expect( v4Schema.properties.attribute.type ).toContain( 'null' );
      } );

      //////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'treats falsy required attribute as if not set at all (#46)', function() {
         expect( v4Schema.properties.reallyNotRequired.required ).not.toBeDefined();
         expect( v4Schema.required ).not.toContain( 'reallyNotRequired' );
         expect( v4Schema.properties.reallyNotRequired.type ).toContain( 'string' );
         expect( v4Schema.properties.reallyNotRequired.type ).toContain( 'null' );
      } );

   } );

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   describe( 'schema.prohibitAdditionalProperties( schema )', function() {

      var strictSchema;
      var strictNestedSchema;

      beforeEach( function() {
         // prohibitAdditionalProperties modifies the schema. Hence, to isolate tests, we need to clone.
         strictSchema = object.deepClone( data.v4SchemaWithDifferentProperties );
         strictNestedSchema = object.deepClone( data.v4SchemaWithNestedProperties );

         schema.prohibitAdditionalProperties( strictSchema );
         schema.prohibitAdditionalProperties( strictNestedSchema );
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'adds additionProperties false where applicable', function() {
         expect( strictSchema.additionalProperties ).toBe( false );
         expect( strictSchema.properties.simpleProps.additionalProperties ).toBe( false );
         expect( strictSchema.properties.patternProps.additionalProperties ).toBe( false );
         expect( strictSchema.properties.patternAndSimpleProps.additionalProperties ).toBe( false );
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'leaves existing additionalProperties untouched', function() {
         expect( strictSchema.properties.propsWithAdditional )
            .toEqual( data.v4SchemaWithDifferentProperties.properties.propsWithAdditional );
         expect( strictSchema.properties.allTypeOfProps )
            .toEqual( data.v4SchemaWithDifferentProperties.properties.allTypeOfProps );
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'descends into nested pattern properties', function() {
         expect( strictNestedSchema.patternProperties['^y'].additionalProperties ).toBe( false );
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'descends into nested additional properties', function() {
         expect( strictNestedSchema.additionalProperties.additionalProperties ).toBe( false );
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'descends into nested array item specifications', function() {
         expect( strictNestedSchema.items.additionalProperties ).toBe( false );
      } );

   } );

} );
