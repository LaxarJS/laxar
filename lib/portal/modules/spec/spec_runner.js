/**
 * Copyright 2014 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
(function( global ) {
   'use strict';
   global.laxarSpec = {
      title: 'Portal Modules Specification',
      tests: [
         'flow_spec',
         'page_spec',
         'portal_services_spec',
         'theme_manager_spec'
      ],
      requireConfig: {
         deps: [
            'lib/portal/modules/spec/test_configuration'
         ],
         paths: {
            'laxar-path-root': 'static/testing',
            'laxar-path-application': 'static/testing/application',
            'laxar-path-themes': 'static/testing/themes',
            'laxar-path-widgets': 'static/testing/widgets'
         },
         map: {
            'lib/portal/modules/spec/mocks/paths_mock': {
                'lib/portal/paths': 'lib/portal/paths'
            },
            '*': {
                'lib/portal/paths': 'lib/portal/modules/spec/mocks/paths_mock'
            }
         }
      }
   };
})( this );
