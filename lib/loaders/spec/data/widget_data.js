/**
 * Copyright 2016 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
export default {

   descriptor: {
      name: 'test-widget',
      description: 'a test widget',
      integration: {
         type: 'widget',
         technology: 'mock'
      },
      controls: [
         '/some/control',
         'new-control'
      ]
   },

   htmlTemplate: '<h1>hey there</h1>',

   configuration: {
      area: 'contentArea',
      widget: 'test/test_widget',
      id: 'myTestWidget',
      features: {
         myFeature: {
            myProp: 'x'
         }
      }
   },

   amdWidgetSpecification: {
      name: 'amd-referenced-widget',
      description: 'a widget referenced as amd module',
      integration: {
         type: 'widget',
         technology: 'mock'
      },
      controls: []
   },

   amdWidgetConfiguration: {
      area: 'contentArea',
      widget: 'amd:amd-referenced-widget',
      id: 'myAmdWidget'
   }

};
