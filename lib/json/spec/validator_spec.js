/**
 * Copyright 2015 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
define( [
   '../validator',
   '../schema',
   'jjv',
   'jjve',
   './spec_data'
], function( JsonValidator, schema, jjv, jjveMock, data ) {
   'use strict';

   describe( 'A JsonValidator', function() {

      it( 'calls jjv for actual validation', function() {
         spyOn( jjv.prototype, 'validate' );

         JsonValidator.create( data.simpleV4Schema ).validate( 'Hello World!' );

         expect( jjv.prototype.validate ).toHaveBeenCalledWith( data.simpleV4Schema, 'Hello World!' );
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'calls jjve for better messages on error', function() {
         JsonValidator.create( data.simpleV4Schema ).validate( [] );

         expect( jjveMock.messageGenerator )
            .toHaveBeenCalledWith( data.simpleV4Schema, [], { validation : { type : 'string' } } );
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'adds the path provided by jjve to the message', function() {
         jjveMock.setGeneratedMessages( [ {
            path: '$.x.y',
            message: 'Wrong type'
         } ] );
         var messages = JsonValidator.create( data.simpleV4Schema ).validate( {} );

         expect( messages ).toEqual( {
            errors: [
               {
                  path: '$.x.y',
                  message: 'Wrong type. Path: "$.x.y".'
               }
            ]
         } );
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      describe( 'for non draft v4 schemas', function() {

         beforeEach( function() {
            spyOn( schema, 'transformV3ToV4' ).andCallThrough();
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'triggers transformation of the schema', function() {
            JsonValidator.create( data.v3Schema ).validate( {} );

            expect( schema.transformV3ToV4 ).toHaveBeenCalledWith( data.v3Schema );
         } );

      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      describe( 'when asked to prohibit additional properties', function() {

         beforeEach( function() {
            spyOn( schema, 'prohibitAdditionalProperties' ).andCallThrough();
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'calls a function to add the respective property to the schema', function() {
            JsonValidator.create( data.simpleV4Schema, {
               prohibitAdditionalProperties: true
            } ).validate( {} );

            expect( schema.prohibitAdditionalProperties ).toHaveBeenCalledWith( data.simpleV4Schema );
         } );

      } );

   } );

} );
