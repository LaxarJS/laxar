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
         technology: 'angular'
      },
      features: {
         $schema: 'http://json-schema.org/draft-04/schema#',
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

   widgetConfiguration: {
      area: 'contentArea',
      widget: 'test/test_widget',
      id: 'myTestWidget',
      features: {
         myFeature: {}
      }
   }

};
