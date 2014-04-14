/**
 * Copyright 2014 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
(function( global ) {
   'use strict';
   global.laxarSpec = {
      title: 'Portal Assembler Specification',
      tests: [
         'layout_loader_spec',
         'page_loader_spec',
         'widget_loader_spec',
         'angular_widget_resolver_spec'
      ],
      requireConfig: {

         paths: {
            'laxar-path-root': 'testing',
            'laxar-path-themes': 'testing/themes',
            'laxar-path-widgets': 'testing/widgets'
         },
         map: {
            '*': {
                'lib/portal/paths': 'lib/portal/modules/spec/mocks/paths_mock'
            }
         }
      }
   };
})( this );
