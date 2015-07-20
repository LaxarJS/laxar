/**
 * Copyright 2014 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
(function( global ) {
   'use strict';
   global.laxarSpec = {
      title: 'JSON lib Specification',
      tests: [
         'schema_spec',
         'validator_spec'
      ],
      requireConfig: {
         map: {
            '*': {
               jjve: 'laxar/lib/json/spec/jjve_mock'
            }
         }
      },
      widgetJson: false
   };
})( this );
