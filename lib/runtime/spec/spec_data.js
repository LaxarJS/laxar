/**
 * Copyright 2015 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
define( {

   urls: {
      flow: '/application/flow/flow.json',
      step1: '/application/pages/steps/step1.json',
      step2: '/application/pages/steps/step2.json',
      step3: '/application/pages/steps/step3.json',
      withError: '/application/pages/steps/withError.json',
      testWidget: '/includes/widgets/laxarjs/test_widget/widget.json'
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
            'page': 'steps/step1',
            'targets': {
               'next': 'stepTwo',
               'cancel': 'entry'
            }
         },

         'stepTwo/:taskId/:anotherThing': {
            'page': 'steps/step2',
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
                  'widget': 'laxarjs/test_widget',
                  'id': 'test123'
               },
               {
                  layout: 'one_column',
                  id: 'myEmbeddedLayout'
               }
            ],
            'test123.nested': [
               {
                  'widget': 'laxarjs/nested_test_widget',
                  'id': 'test5678'
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
      step3: {

         areas: {
            activities: [

            ],

            content: [

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
                  'widget': 'laxarjs/test_widget',
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
