/**
 * Copyright 2014 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
define( [
   '../instantiator'
], function( jsonInstantiator ) {
   'use strict';

   describe( 'A JSON instantiator', function() {

      it( 'provides a method to apply default values from a schema to an object', function() {
         expect( jsonInstantiator.instantiate ).toBeDefined();
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'must be called with a schema and a configuration', function() {
         expect( jsonInstantiator.instantiate ).toThrow();
         expect( function() {
            jsonInstantiator.instantiate( {
               properties: {}
            } );
         } ).toThrow();
         expect( function() {
            jsonInstantiator.instantiate( null, {} );
         } ).toThrow();
      } );

   } );

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   describe( 'JSON objects for simple schemas', function() {

      var schema;

      beforeEach( function() {
         schema = {
            properties: {
               firstName: {
                  type: 'string'
               },
               lastName: {
                  type: 'string'
               },
               age: {
                  type: 'integer',
                  'default': 30
               }
            }
         };
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'can be instantiated', function() {
         expect( jsonInstantiator.instantiate( schema, { firstName: 'Alf' } ) )
            .toEqual( {
               'firstName': 'Alf',
               'age': 30
            } );
      } );

   } );

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   describe( 'JSON objects for complex array schemas', function() {

      var schema;

      beforeEach( function() {
         schema = {
            properties: {
               firstName: {
                  type: 'string'
               },
               contacts: {
                  type: 'array',
                  items: {
                     type: 'object',
                     properties: {
                        street: {
                           type: 'string',
                           'default': 'Musterstraße 3'
                        },
                        city: {
                           type: 'string'
                        }
                     }
                  }
               },
               pets: {
                  type: 'array',
                  items: {
                     type: 'string'
                  }
               }
            }
         };
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'can be instantiated without values', function() {
         expect( jsonInstantiator.instantiate( schema, { firstName: 'Alf' } ) )
            .toEqual( {
               'firstName': 'Alf'
            } );
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'can be instantiated with values', function() {
         expect( jsonInstantiator.instantiate( schema, {
            firstName: 'Alf',
            contacts: [ { city: 'Aachen' } ],
            pets: [ 'hamster' ] }
         ) )
            .toEqual( {
               'firstName': 'Alf',
               'contacts': [
                  {
                     street: 'Musterstraße 3',
                     city: 'Aachen'
                  }
               ],
               'pets': [ 'hamster' ]
            } );
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'can be instantiated with default value', function() {
         schema.properties.contacts[ 'default' ] = [
            {
               street: 'Peterring 1',
               city: 'Berlin'
            }
         ];

         expect( jsonInstantiator.instantiate( schema, { firstName: 'Alf' } ) )
            .toEqual( {
               'firstName': 'Alf',
               'contacts': [
                  {
                     street: 'Peterring 1',
                     city: 'Berlin'
                  }
               ]
            } );
      } );

   } );

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   describe( 'JSON objects for simple schemas', function() {

      var schema;

      beforeEach( function() {
         schema = {
            properties: {
               firstName: {
                  type: 'string'
               },
               partner: {
                  type: 'object',
                  properties: {
                     firstName: {
                        type: 'string'
                     },
                     lastName: {
                        type: 'string'
                     },
                     age: {
                        type: 'integer',
                        'default': 30
                     }
                  }
               }
            }
         };
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'can be instantiated without values', function() {
         expect( jsonInstantiator.instantiate( schema, { firstName: 'Alf', partner: {} } ) )
            .toEqual( {
               firstName: 'Alf',
               partner: {
                  age: 30
               }
            } );
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'can be instantiated without values', function() {
         expect( jsonInstantiator.instantiate( schema, { firstName: 'Alf', partner: { firstName: 'Lisa' } } ) )
            .toEqual( {
               firstName: 'Alf',
               partner: {
                  firstName: 'Lisa',
                  age: 30
               }
            } );
      } );

   } );

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   describe( 'JSON objects for map schemas', function() {

      it( 'can be instantiated', function() {
         var schema = {
            properties: {
               knownProperty: {
                  type: 'string',
                  'default': 'something'
               }
            },

            patternProperties: {
               '^[a-zA-Z_][a-zA-Z_0-9]*$': {
                  type: 'array',
                  items: { type: 'string' }
               }
            }
         };

         expect( jsonInstantiator.instantiate( schema, { route66: [ 'dusty' ] } ) )
            .toEqual( {
               route66: [ 'dusty' ],
               knownProperty: 'something'
            } );
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'does not throw an exception if the key does not conform to the naming rules', function() {
         var schema = {
            patternProperties: {
               '^[a-zA-Z_][a-zA-Z_0-9]*$': {
                  type: 'string'
               }
            }
         };

         expect( function() { jsonInstantiator.instantiate( schema, { 'ab-cd': '' } ); } ).not.toThrow();
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'accepts a minus in the property name if the naming rule allows it', function() {
         var schema = {
            patternProperties: {
               '^[a-zA-Z_][a-zA-Z_0-9-]*$': {
                  type: 'string'
               }
            }
         };

         expect( jsonInstantiator.instantiate( schema, { 'ab-cd': 'x' } ) ).toEqual( { 'ab-cd': 'x' } );
      } );

   } );

} );