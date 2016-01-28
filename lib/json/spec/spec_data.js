/**
 * Copyright 2015 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
export default {

   schemaWithoutVersion: {
      type: 'object',
      properties: {
         resource: {
            type: 'string',
            required: true
         }
      }
   },

   v3Schema: {
      '$schema': 'http://json-schema.org/draft-03/schema#',
      type: 'object',
      properties: {
         resource: {
            type: 'string',
            required: true
         }
      }
   },

   simpleV4Schema: {
      '$schema': 'http://json-schema.org/draft-04/schema#',
      'type': 'string'
   },

   v4SchemaWithDifferentProperties: {
      '$schema': 'http://json-schema.org/draft-04/schema#',
      type: 'object',
      properties: {
         simpleProps: {
            type: 'object',
            properties: {
               a: { type: 'string' }
            }
         },
         propsWithAdditional: {
            type: 'object',
            properties: {
               a: { type: 'string' }
            },
            additionalProperties: true
         },
         patternProps: {
            type: 'object',
            patternProperties: {
               '^bc': { type: 'string' }
            }
         },
         patternAndSimpleProps: {
            type: 'object',
            patternProperties: {
               '^bc': { type: 'string' }
            },
            properties: {
               a: { type: 'string' }
            }
         },
         allTypeOfProps: {
            type: 'object',
            patternProperties: {
               '^bc': { type: 'string' }
            },
            properties: {
               a: { type: 'string' }
            },
            additionalProperties: { type: 'string' }
         }
      }
   },

   v4SchemaWithNestedProperties: {
      '$schema': 'http://json-schema.org/draft-04/schema#',
      type: [ 'object', 'array' ],
      patternProperties: {
         '^y': {
            type: 'object',
            properties: {
               a: { type: 'string' }
            }
         }
      },
      items: {
         type: 'object',
         properties: {
            a: { type: 'string' }
         }
      },
      additionalProperties: {
         type: 'object',
         properties: {
            a: { type: 'string' }
         }
      }
   }

};
