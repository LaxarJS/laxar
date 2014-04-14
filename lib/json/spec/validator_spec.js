/**
 * Copyright 2014 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
define( [
   '../validator'
], function( JsonValidator ) {
   'use strict';

   describe( 'JsonValidator', function() {

      beforeEach( function() {
         this.addMatchers( {
            toYieldError: function( code ) {
               var json = this.actual.json;
               var schema = this.actual.schema;
               var report = JsonValidator.create( schema ).validate( json );

               this.message = function() {
                  return jasmine.pp( 'Expected ' ) +
                     jasmine.pp( json ) + ' to yield error code ' +
                     jasmine.pp( code ) +
                     jasmine.pp( ' using schema ' ) +
                     jasmine.pp( schema ) +' but returned '  +
                     jasmine.pp( report.errors );
               };

               return report.errors.some( function( error ) {
                  return error.code === code;
               } );
            },
            toMatchSchema: function( schema ) {
               var json = this.actual;
               var report = JsonValidator.create( schema ).validate( json );

               return report.errors.length === 0;
            }
         } );
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      /**
       * @param testData An array of the following type:
       *
       * [
       *    {
       *       schema: { ... }
       *       validObjects: [ { ... }, ... ]
       *       invalidObjects: [
       *          {
       *            errorCode: ...,
       *            objects: [ { ... }, ... ]
       *          },
       *          ...
       *       ]
       *    },
       * ...
       * ]
       */
      function runSpecsTest( testData ) {
         testData.forEach( function( record ) {
            record.validObjects.forEach( function( object ) {
               expect( object ).toMatchSchema( record.schema );
            } );

            record.invalidObjects.forEach( function( invalidObjectRecord ) {
               invalidObjectRecord.objects.forEach( function( invalidObject ) {
                  var data = { schema: record.schema, json: invalidObject  };
                  expect( data ).toYieldError( invalidObjectRecord.errorCode );
               } );
            } );
         } );
      }

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'reports an error if a required object property is missing', function() {
         var testData = [
            {
               schema: { properties: { x: { type: 'any', required: true } } },
               object: {}
            },
            {
               schema: {
                  properties: {
                     x: {
                        type: 'object',
                        properties: {
                           p: {
                              required: true,
                              type: 'any'
                           }
                        }
                     }
                  }
               },
               object: {
                  x: {
                  }
               }
            },
            {
               schema: {
                  properties: {
                     x: {
                        type: 'array',
                        items: {
                           type: 'object',
                           properties: {
                              z: {
                                 required: true,
                                 type: 'any'
                              }
                           }
                        }
                     }
                  }
               },
               object: {
                  x: [ {} ]
               }
            },
            {
               schema: {
                  patternProperties: {
                     '[0-9]+': {
                        type: 'object',
                        properties: {
                           name: {
                              type: 'string',
                              required: true
                           }
                        }
                     }
                  }
               },
               object: {
                  '0': {
                     names: 'blubb'
                  }
               }
            }

         ];

         testData.forEach( function( record ) {
            var report = JsonValidator.create( record.schema ).validate( record.object );
            expect( report.errors.length ).toBe( 1 );
            expect( report.errors[ 0 ].code ).toBe( JsonValidator.REQUIRED_PROPERTY_MISSING );
         } );
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'accepts additional properties unless not conforming or explicitly forbidden', function() {
         var testData = [
            {
               schema: {
                  properties: {
                     main: {
                        type: 'object',
                        properties: {
                           a: { type: 'any' }
                        },
                        additionalProperties: false
                     }
                  }
               },
               validObjects: [ { main: { a: 'I am A' } } ],
               invalidObjects: [
                  {
                     errorCode: JsonValidator.UNEXPECTED_PROPERTY,
                     objects: [ { main: { a: 'I am A', b: null } } ]
                  }
               ]
            },
            {
               schema: {
                  properties: {
                     main: {
                        type: 'object',
                        properties: {
                        },
                        additionalProperties: { 'type': 'integer' }
                     }
                  }
               },
               validObjects: [
                  { main: { a: 4711, b: 5 } }
               ],
               invalidObjects: [
                  {
                     errorCode: JsonValidator.INVALID_PROPERTY_TYPE,
                     objects: [
                        { main: { a: '' } },
                        { main: { a: 5, b: '' } },
                        { main: { a: 47.11 } }
                     ]
                  }
               ]
            },
            {
               schema: {
                  patternProperties: {
                     'A[0-9]+': {
                        type: 'object',
                        properties: {
                           name: {
                              type: 'string'
                           }
                        },
                        additionalProperties: false
                     }
                  },
                  additionalProperties: false
               },
               validObjects: [],
               invalidObjects: [
                  {
                     errorCode: JsonValidator.UNEXPECTED_PROPERTY,
                     objects: [
                        // Typo: name is missing
                        { 'A01': { names: 'blubb' } }
                     ]
                  }
               ]
            }
         ];

         runSpecsTest( testData );
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'validates that objects are of the expected well-known type', function() {
         var testData = [
            {
               schema: { properties: { x: { type: 'string' } } },
               object: { x: 4711 }
            },
            {
               schema: { properties: { x: { type: 'number' } } },
               object: { x: true }
            },
            {
               schema: { properties: { x: { type: 'integer' } } },
               object: { x: true }
            },
            {
               schema: { properties: { x: { type: 'integer' } } },
               object: { x: 47.11 }
            },
            {
               schema: { properties: { x: { type: 'boolean' } } },
               object: { x: 47.11 }
            },
            {
               schema: { properties: { x: { type: 'array' } } },
               object: { x: 47.11 }
            },
            {
               schema: { properties: { x: { type: 'object' } } },
               object: { x: 47.11 }
            }
         ];

         testData.forEach( function( record ) {
            var report = JsonValidator.create( record.schema ).validate( record.object );

            expect( report.errors.length).toBe( 1 );
            expect( report.errors[ 0 ].code ).toBe( JsonValidator.INVALID_PROPERTY_TYPE );
         } );
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'validates that objects are not of any disallowed well-known type', function() {
         var testData = [
            {
               schema: { properties: { x: { type: 'number', disallow: 'integer' } } },
               object: { x: 4711 }
            },
            {
               schema: { properties: { x: { disallow: 'number' } } },
               object: { x: 47.11 }
            }
         ];

         testData.forEach( function( record ) {
            var report = JsonValidator.create( record.schema ).validate( record.object );

            expect( report.errors.length).toBe( 1 );
            expect( report.errors[ 0 ].code ).toBe( JsonValidator.INVALID_PROPERTY_TYPE );
         } );
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'accepts any property type if the schema specifies a custom type', function() {
         var testData = [
            {
               schema: { properties: { x: { type: 'Whiskey' } } },
               object: { x: 4711 }
            },
            {
               schema: { properties: { x: { type: [ 'number', 'WhatEver' ] } } },
               object: { x: true }
            },
            {
               schema: { properties: { x: { type: [ 'number', 'WhatEver' ] } } },
               object: { x: [] }
            }
         ];

         testData.forEach( function( record ) {
            var report = JsonValidator.create( record.schema ).validate( record.object );
            expect( report.errors.length ).toBe( 0 );
         } );
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'accepts any property type if the schema says "any"', function() {
         var schema    = { properties: { x: { type: 'any' } } };
         var validator = JsonValidator.create( schema );

         var testData = [
            { x: 4711 }, { x: true }, { x: null }, { x: [] }, { x: { a:[] } }, { x: '' }
         ];

         testData.forEach( function( record ) {
            var report = validator.validate( record );
            expect( report.errors.length ).toBe( 0 );
         } );
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'accepts missing required properties, if a default value was specified', function() {
         var testData = [
            {
               schema: { properties: { x: { type: 'string', required: true, 'default': '' } } },
               object: {}
            },
            {
               schema: { properties: { x: { type: 'number', required: true, 'default': 47.11 } } },
               object: {}
            },
            {
               schema: { properties: { x: { type: 'integer', required: true, 'default': 4711 } } },
               object: {}
            },
            {
               schema: { properties: { x: { type: 'boolean', required: true, 'default': false } } },
               object: {}
            },
            {
               schema: { properties: { x: { type: 'any', required: true, 'default': {} } } },
               object: {}
            },
            {
               schema: { properties: { x: { type: 'array', required: true, 'default': [ 1, 2, 3 ] } } },
               object: {}
            },
            {
               schema: { properties: { x: { type: 'object', required: true, 'default': [ {}, 47.11 ] } } },
               object: {}
            }
         ];

         testData.forEach( function( record ) {
            var report = JsonValidator.create( record.schema ).validate( record.object );
            expect( report.errors.length).toBe( 0 );
         } );
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'reports an error, if an expected null value is not null', function() {
         var schema = { properties: { x: { type: 'null' } } };
         var object = { x: 4711 };

         var report = JsonValidator.create( schema ).validate( object );
         expect( report.errors.length).toBe( 1 );
         expect( report.errors[ 0 ].code ).toBe( JsonValidator.INVALID_PROPERTY_TYPE );
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'reports an error if a value is outside its specified bounds', function() {
         var testData = [
            {
               schema: { properties: { x: { type: 'number', minimum: 0, maximum: 50 } } },
               validObjects: [
                  { x: 0 }, { x: 50 }, { x: 23 }
               ],
               invalidObjects: [
                  { x: -1 }, { x: -0.0001 }, { x: 50.00001 }, { x: 100 }
               ]
            },
            {
               schema: { properties: { x: { type: 'number', exclusiveMinimum: 0, exclusiveMaximum: 50 } } },
               validObjects: [
                  { x: 0.001 }, { x: 40.999 }, { x: 23 }
               ],
               invalidObjects: [
                  { x: -1 }, { x: -0.0001 }, { x : 0 }, { x: 50 }, { x: 50.00001 }, { x: 100 }
               ]
            },
            {
               schema: { properties: { x: { type: 'array', minItems: 3, maxItems: 5, items: { type: 'any'} } } },
               validObjects: [
                  { x: null }, { x: [ 1, 2, 3 ] }, { x: [ 'A', 'B', 'C', 'D' ] }, { x: [ 1, 2, 3, 4, 5 ] }
               ],
               invalidObjects: [
                  { x: [] }, { x: [ 1, 2 ] }, { x: [ 1, 2, 3, 4, 5, 6 ]  }
               ]
            },
            {
               schema: { properties: { x: { type: 'string', minLength: 1, maxLength: 10 } } },
               validObjects: [
                  { x: 'x' }, { x: 'abc' }, { x: '1234567890' }
               ],
               invalidObjects: [
                  { x: '' }, { x: '12345678901' }
               ]
            }
         ];

         testData.forEach( function( record ) {
            var validator = JsonValidator.create( record.schema );

            for( var k=0; k < record.validObjects.length; ++k ) {
               var validObject = record.validObjects[ k ];
               expect( validator.validate( validObject ).errors.length ).toBe( 0 );
            }

            for( var n=0; n < record.invalidObjects.length; ++n ) {
               var invalidObject = record.invalidObjects[ n ];
               var report = validator.validate( invalidObject );

               expect( report.errors.length ).toBe( 1 );
               expect( report.errors[ 0 ].code ).toBe( JsonValidator.BOUNDS_VIOLATION );
            }
         } );
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'accepts multiple property types in schema', function() {
         var schema = {
            properties: {
               main: { type: [ 'string', 'integer' ] }
            }
         };

         var validObjects = [
            { main: null },
            { main: '' },
            { main: 4711 }
         ];

         var invalidObjects = [
            { main: 47.11 },
            { main: true },
            { main: [] },
            { main: {} }
         ];

         var validator = JsonValidator.create( schema );

         validObjects.forEach( function( object ) {
            var report = validator.validate( object );
            expect( report.errors.length ).toBe( 0 );
         } );

         invalidObjects.forEach( function( object ) {
            var report = validator.validate( object );

            expect( report.errors.length ).toBe( 1 );
            expect( report.errors[ 0 ].code ).toBe( JsonValidator.INVALID_PROPERTY_TYPE );
         } );
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'supports enumerations of valid values', function() {
         var schema = {
            properties: {
               main: {
                  'type': [ 'string', 'integer' ],
                  'enum': [ 5, 'otto', 'x' ]
               }
            }
         };

         var validObjects = [
            { main: 'otto' },
            { main: 'x' },
            { main: 5 }
         ];

         var invalidObjects = [
            { main: null },
            { main: 'karl' },
            { main: 6 }
         ];

         var validator = JsonValidator.create( schema );

         validObjects.forEach( function( object ) {
            var report = validator.validate( object );
            expect( report.errors.length ).toBe( 0 );
         } );

         invalidObjects.forEach( function( object ) {
            var report = validator.validate( object );
            expect( report.errors.length ).toBe( 1 );
            expect( report.errors[ 0 ].code ).toBe( JsonValidator.NOT_AN_ALLOWED_VALUE );
         } );
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'validates string instances if a pattern was specified', function() {
         var schema = {
            properties: {
               x: {
                  type: 'string',
                  pattern: '^[0-9][0-9][.] [A-Z][a-z][a-z]$'
               }
            }
         };

         var validObjects = [
            { x: '01. Jan' },
            { x: '15. Dec' },
            { x: '35. Abc' }
         ];

         var invalidObjects = [
            { x: null },
            { x: '12.Dec.' },
            { x: '12.  Dec.' },
            { x: '12. Dec. ' },
            { x: '12 Dec' },
            { x: '01.05.' },
            { x: '01' },
            { x: '35. ABC' }
         ];

         var validator = JsonValidator.create( schema );

         validObjects.forEach( function( object ) {
            var report = validator.validate( object );
            expect( report.errors.length ).toBe( 0 );
         } );

         invalidObjects.forEach( function( object ) {
            var report = validator.validate( object );
            expect( report.errors.length ).toBe( 1 );
            expect( report.errors[ 0 ].code ).toBe( JsonValidator.NOT_AN_ALLOWED_VALUE );
         } );
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'validates that array items are unique, if "uniqueItems" flag was specified', function() {
         var schema = {
            properties: {
               x: {
                  type: 'array',
                  uniqueItems: true,
                  items: { type: 'any' }
               }
            }
         };

         var validObjects = [
            { x: [ 1, 4, 'a', { a: 'ABC' }, [], [ 1, 2, 3 ], [ 'a' ] ] },
            { x: [ 1, 4, 'a', { a: 'ABC' }, [], [ 1, 2, 3 ] ] },
            { x: [ null ] },
            { x: [] }
         ];

         var invalidObjects = [
            { x: [ 1, 4, 'a', { a: 'ABC' }, 4 ] },
            { x: [ 1, 4, 'a', { a: 'ABC' }, 'a' ] },
            { x: [ 1, 4, 'a', { a: 'ABC', b: [ 5, 1 ] }, [], { b: [1, 5 ], a: 'ABC' } ] },
            { x: [ null, 1, null ] }
         ];

         var validator = JsonValidator.create( schema );

         validObjects.forEach( function( object ) {
            var report = validator.validate( object );
            expect( report.errors.length ).toBe( 0 );
         } );

         invalidObjects.forEach( function( object ) {
            var report = validator.validate( object );
            expect( report.errors.length ).toBe( 1 );
            expect( report.errors[ 0 ].code ).toBe( JsonValidator.DUPLICATE_VALUES );
         } );
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'validates that number values are divisible by a specified value', function() {
         var schema = {
            properties: {
               x: { type: 'number',  divisibleBy: '3.5' },
               y: { type: 'integer', divisibleBy: '3' }
            }
         };

         var validObjects = [
            { x: 7,    y: 6 },
            { x: 14,   y: 3 },
            { x: 10.5, y : 0 },
            { x: 0 }
         ];

         var invalidObjects = [
            { x: 8,      y: 6 },
            { x: 14.001, y: 3 },
            { x: 10.5,   y: 5 },
            { x: 0,      y: 1 }
         ];

         var validator = JsonValidator.create( schema );

         validObjects.forEach( function( object ) {
            var report = validator.validate( object );
            expect( report.errors.length ).toBe( 0 );
         } );

         invalidObjects.forEach( function( object ) {
            var report = validator.validate( object );
            expect( report.errors.length ).toBe( 1 );
            expect( report.errors[ 0 ].code ).toBe( JsonValidator.DIVISIBLE_BY_VIOLATION );
         } );
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'validates properties against name patterns, if provided', function() {
         var testData = [
            {
               schema: {
                  type: 'object',
                  properties: {
                     x: {
                        type: 'object',
                        patternProperties: {
                           'a':       { type: 'any' },
                           'x[0-9]+': { type: 'string' }
                        },
                        properties: {
                        },
                        additionalProperties: false
                     }
                  }
               },
               validObjects: [
                  { x: { a: 4711, x001: 'abc' } },
                  { x: { a: 4711, x01:  'abc', x002: 'def' } }
               ],
               invalidObjects: [
                  {
                     errorCode: JsonValidator.UNEXPECTED_PROPERTY,
                     objects: [
                        { x: { a: 4711, x:   'abc' } },
                        { x: { a: 4711, x0y: 'abc' } }
                     ]
                  },

                  {
                     errorCode: JsonValidator.INVALID_PROPERTY_TYPE,
                     objects: [
                        { x: { x0: 5 } }
                     ]
                  }
               ]
            }
         ];

         runSpecsTest( testData );
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'optionally prohibits additional properties on objects (jira ATP-7893)', function() {
         var schema = {
            type: 'object',
            properties: {
               x: {
                  type: 'object',
                  patternProperties: {
                     'a':       { type: 'any' },
                     'x[0-9]+': { type: 'string' }
                  }
               }
            }
         };

         var validator = JsonValidator.create( schema, { prohibitAdditionalProperties: true } );
         expect( validator.validate( { x: {}, y: {} } ).errors.length ).toBe( 1 );
         expect( validator.validate( { x: { b: 1 } } ).errors.length ).toBe( 1 );
      } );

   } );

} );
