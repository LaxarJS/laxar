/**
 * Copyright 2014 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
(function( global ) {
   'use strict';
   global.laxarSpec = {
      title: 'LaxarJS Loaders Specification',
      tests: [
         'features_provider_spec',
         'layout_loader_spec',
         'page_loader_spec',
         'widget_loader_spec',
         'angular_widget_adapter_spec',
         'plain_widget_adapter_spec'
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
