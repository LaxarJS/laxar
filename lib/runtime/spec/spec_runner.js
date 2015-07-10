/**
 * Copyright 2014 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
(function( global ) {
   'use strict';
   global.laxarSpec = {
      title: 'LaxarJS Runtime Specification',
      tests: [
         'flow_spec',
         'layout_widget_adapter_spec',
         'page_spec',
         'runtime_services_spec',
         'theme_manager_spec'
      ],
      requireConfig: {
         deps: [
            'lib/runtime/spec/test_configuration'
         ],
         paths: {
            'laxar-path-root': 'static/testing',
            'laxar-path-application': 'static/testing/application',
            'laxar-path-themes': 'static/testing/themes',
            'laxar-path-widgets': 'static/testing/widgets'
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
