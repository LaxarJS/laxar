/**
 * Copyright 2016 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
define( [
   '../permissive-validator',
   '../schema',
   'jjv'
], function( permissiveValidator, schema, jjv ) {
   'use strict';

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   describe( 'A permissive Validator', function() {


      function check( schema, options, testcases ) {
         var env = jjv();
         env.addSchema( 'schema', schema );
         var pv = permissiveValidator.create( schema, options );

         testcases.forEach( function( data ) {
            var data_valid = JSON.parse( JSON.stringify( data ) );
            env.validate( 'schema', data_valid );
            pv.validate( data );
            expect( data ).toEqual( data_valid );
         } );

      }

      it( 'instantiates default values', function() {
         var schema = {
             '$schema': 'http://json-schema.org/draft-04/schema#',
             'type': 'object',
             'required': [
                 'places'
             ],
             'properties': {
                 'places': {
                     'type': 'object',
                     'description': 'The places for this flow.',
                     'patternProperties': {
                         '[a-z][a-zA-Z0-9_]*': {
                             'type': 'object',
                             'properties': {
                                 'redirectTo': {
                                     'type': 'string',
                                     'description': 'The place to redirect to when hitting this place.'
                                 },
                                 'page': {
                                     'type': 'string',
                                     'description': 'The page to render for this place.'
                                 },
                                 'targets': {
                                     'type': 'object',
                                     'patternProperties': {
                                         '[a-z][a-zA-Z0-9_]*': {
                                             'type': 'string'
                                         }
                                     },
                                     'description':
                                        'A map of symbolic targets to places reachable from this place.'
                                 },
                                 'entryPoints': {
                                     'type': 'object',
                                     'patternProperties': {
                                         '[a-z][a-zA-Z0-9_]*': {
                                             'type': 'string'
                                         }
                                     },
                                     'description': 'Entry points defined by this place.'
                                 },
                                 'exitPoint': {
                                     'type': 'string',
                                     'description': 'The exit point to invoke when reaching this place.'
                                 }
                             },
                             'additionalProperties': false
                         }
                     },
                     'additionalProperties': false
                 }
             },
             'additionalProperties': false
         };

         var testcases = [
            {
                'places': {
                    'entry': {
                        'redirectTo': 'investify'
                    },
                    'investify/:selectedColumn/:selectedUser/:details': {
                        'page': 'single_page',
                        'targets': {}
                    },
                    'email-validation/': {
                        'page': 'email_validation_page',
                        'targets': {}
                    },
                    'change-password/': {
                        'page': 'change_password_page',
                        'targets': {}
                    }
                }
            }
         ];

         check( schema, {}, testcases );
      } );

   } );

} );
