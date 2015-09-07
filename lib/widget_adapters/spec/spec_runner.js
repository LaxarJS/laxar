/**
 * Copyright 2015 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
(function( global ) {
   'use strict';
   global.laxarSpec = {
      title: 'Widget Adapters Specification',
      tests: [
         'angular_adapter_spec',
         'plain_adapter_spec'
      ],
      requireConfig: {

         paths: {
            'laxar-path-root': 'mocked',
            'laxar-path-themes': 'mocked/themes',
            'laxar-path-widgets': 'mocked/widgets'
         },
         map: {
            '*': {
               'lib/loaders/paths': 'lib/runtime/spec/mocks/paths_mock'
            }
         }
      },
      widgetJson: false
   };
})( this );
