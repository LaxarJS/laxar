/**
 * Copyright 2014 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
define( {
   urls: {
      flow: '/application/flow/flow.json',
      step1: '/application/pages/wizard/step1.json',
      step2: '/application/pages/wizard/step2.json',
      testWidget: '/includes/widgets/portal/test_widget/widget.json'
   },

   flow: {
      'places': {
         'entry': {
            'entryPoints': {
               'myEntry1': 'stepOne',
               'myEntry2': 'stepTwo'
            }
         },

         'stepOne/:taskId': {
            'page': 'wizard/step1',
            'targets': {
               'next': 'stepTwo',
               'cancel': 'entry'
            }
         },

         'stepTwo/:taskId/:anotherThing': {
            'page': 'wizard/step2',
            'targets': {
               'previous': 'stepOne',
               'cancel': 'entry',
               'end': 'exit1'
            }
         },

         'exit1/:taskId': {
            'exitPoint': 'exit1'
         }
      }
   },

   pages: {
      step1: {

         'layout': 'one_column',
         'areas': {
            'activities': [

            ],

            'content': [
               {
                  'widget': 'portal/test_widget',
                  'id': 'test123'
               }
            ]
         }

      },
      step2: {

         'areas': {
            'activities': [

            ],

            'content': [

            ]
         }

      },
      withError: {

         'layout': 'one_column',
         'areas': {
            'activities': [

            ],

            'wrongArea': [
               {
                  'widget': 'portal/test_widget',
                  'id': 'test123'
               }
            ]
         }

      }
   },

   widgets: {
      testWidget: {

         'name': 'TestWidget',
         'description': 'A widget simply serving testing purposes.',

         'integration': {
            'type': 'angular'
         }

      }
   },

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
