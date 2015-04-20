/**
 * Copyright 2014 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
define( {

   specification: {
      name: 'TestWidget',
      description: 'a test widget',
      integration: {
         type: 'widget',
         technology: 'angular'
      },
      controls: [
         '/some/control'
      ],
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

   htmlTemplate: '<h1>hey there</h1>',

   configuration: {
      area: 'contentArea',
      widget: 'test/test_widget',
      id: 'myTestWidget',
      features: {
         myFeature: {}
      }
   }

} );
