/**
 * Copyright 2016 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
export default {

   specification: {
      name: 'TestWidget',
      description: 'a test widget',
      integration: {
         type: 'widget',
         technology: 'angular'
      },
      controls: [
         '/some/control',
         'new-control'
      ],
      features: {
         '$schema': 'http://json-schema.org/draft-04/schema#',
         type: 'object',
         properties: {
            'myFeature': {
               type: 'object',
               properties: {
                  'myProp': {
                     type: 'string',
                     'default': 'x'
                  }
               }
            }
         }
      }
   },

   htmlTemplate: '<h1>hey there</h1>',

   configuration: {
      area: 'contentArea',
      widget: 'test/test_widget',
      id: 'myTestWidget',
      features: {
         myFeature: {}
      }
   },

   amdWidgetSpecification: {
      name: 'amd-referenced-widget',
      description: 'a widget referenced as amd module',
      integration: {
         type: 'widget',
         technology: 'angular'
      },
      controls: [],
      features: {
         '$schema': 'http://json-schema.org/draft-04/schema#',
         type: 'object',
         properties: {}
      }
   },

   amdWidgetConfiguration: {
      area: 'contentArea',
      widget: 'amd:amd-referenced-widget',
      id: 'myAmdWidget'
   }

};
