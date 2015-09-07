/**
 * Copyright 2015 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
define( {

   resolvedWidgets: {
      'laxarjs/test_widget': {
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
         'languagePath': '/includes//widgets/laxarjs/test_widget/default.theme/language/',
         'includeUrl': '/includes/widgets/laxarjs/test_widget/default.theme/test_widget.html',
         'controllerName': 'AxTestWidgetController',
         'cssFileUrls': [ '/includes/widgets/laxarjs/test_widget/default.theme/css/test_widget.css' ]
      }
   },

   widgetFeatures: {
      'laxarjs/test_widget': {
         'main': {
            'testProperty': 'myValue'
         }
      }
   }

} );
