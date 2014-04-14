/**
 * Copyright 2014 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
define( {

   resolvedWidgets: {
      'portal/test_widget': {
         'specification': {
            'name': 'TestWidget',
            'description': 'A widget simply serving testing purposes.',
            'integration': {
               'type': 'angular'
            },
            'features': {
               'main': {
                  'type': 'object',
                  'properties': {
                     'testProperty': {
                        'type': 'string',
                        'required': true
                     }
                  }
               }
            }
         },
         'languagePath': '/includes//widgets/portal/test_widget/default.theme/language/',
         'includeUrl': '/includes/widgets/portal/test_widget/default.theme/test_widget.html',
         'controllerName': 'widgets.portal.test_widget.Controller',
         'cssFileUrls': [ '/includes/widgets/portal/test_widget/default.theme/css/test_widget.css' ]
      }
   },

   widgetFeatures: {
      'portal/test_widget': {
         'main': {
            'testProperty': 'myValue'
         }
      }
   }

} );
