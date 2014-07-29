/**
 * Copyright 2014 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
(function( global ) {
   'use strict';
   global.laxarSpec = {
      title: 'JSON Validator Specification',
      tests: [
         'json_patch_compatibility_spec',
         'schema_spec',
         'validator_spec'
      ],
      requireConfig: {

         paths: {
            jjve: 'lib/json/spec/jjve_mock'
         }

      }
   };
})( this );
