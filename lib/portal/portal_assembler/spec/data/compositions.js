/**
 * Copyright 2014 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
define( {

   simpleComposition: {

      features: {},
      areas: {
         '.': [
            { widget: 'portal/test_widget', id: 'idx1' },
            { widget: 'portal/test_widget2' },
            { widget: 'portal/test_widget2' }
         ]
      }

   },

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   compositionWithAdditionalAreas: {

      features: {},
      areas: {
         '.': [
            { widget: 'portal/test_widget1', id: 'idx1' }
         ],
         area2: [
            { widget: 'portal/test_widget2', id: 'idx2' }
         ],
         'idx2.content': [
            { widget: 'portal/test_widget3', id: 'idx3' }
         ]
      }

   },

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   compositionWithFeaturesDefined: {

      features: {
         close: {
            type: 'object',
            properties: {
               onActions: {
                  type: 'array',
                  items: {
                     type: 'string'
                  }
               }
            }
         },
         something: {
            type: 'object',
            properties: {
               resource: {
                  type: 'string',
                  'default': '${topic:myResource}'
               }
            }
         }
      },
      areas: {
         '.': [
            {
               widget: 'portal/test_widget1',
               id: 'idx1',
               features: {
                  open: { onActions: [ 'openAction' ] },
                  close: { onActions: '${features.close.onActions}' }
               }
            }
         ],
         areaX: [
            {
               widget: 'portal/test_widget2',
               features: {
                  importantFeature: {
                     resource: '${features.something.resource}',
                     attribute: 'entries'
                  }
               }
            }
         ]
      }

   },

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   compositionWithEmbeddedComposition: {
      features: {
         shutdown: {
            type: 'object',
            properties: {
               onActions: {
                  type: 'array',
                  items: {
                     type: 'string'
                  }
               }
            }
         }
      },
      areas: {
         '.': [
            {
               composition: 'compositionWithFeaturesDefined',
               id: 'myComposition',
               features: {
                  close: '${features.shutdown}',
                  something: { resource: 'plane' }
               }
            },
            { widget: 'portal/test_widget2' }
         ]
      }
   },

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   compositionWithMergedFeatures: {

      features: {
         closeButton: {
            type: 'object',
            properties: {
               action: {
                  type: 'string',
                  required: true
               }
            }
         },
         close: {
            type: 'object',
            properties: {
               onActions: {
                  type: 'array',
                  items: {
                     type: 'string'
                  }
               }
            }
         }
      },
      mergedFeatures: {
         'close.onActions': [ '${features.closeButton.action}', '${topic:internalClose}' ]
      },
      areas: {
         '.': [
            {
               widget: 'portal/test_widget1',
               id: 'idx1',
               features: {
                  close: { onActions: '${features.close.onActions}' }
               }
            }
         ]
      }
   },

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   compositionWithDirectCycle: {
      areas: {
         '.': [
            { composition: 'compositionWithDirectCycle' }
         ]
      }
   },

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   compositionWithCycle: {
      areas: {
         '.': [
            { composition: 'compositionWithCycle2' }
         ]
      }
   },
   compositionWithCycle2: {
      areas: {
         '.': [
            { composition: 'compositionWithCycle' }
         ]
      }
   },

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   'composition/in/subfolder': {
      areas: {
         '.': [
            {
               widget: 'portal/test_widget1',
               id: 'myWidget3',
               features: {
                  xy: {
                     resource: '${topic:myResource}'
                  }
               }
            }
         ]
      }
   },

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   compositionWithReplacementsInKeys: {

      features: {
         efficientFrontierData: {
            type: 'object',
            properties: {
               resource: {
                  type: 'string'
               }
            }
         }
      },
      areas: {
         '.': [
            {
               widget: 'portal/test_widget1',
               features: {
                  childResources: {
                     '${features.efficientFrontierData.resource}': 'efficientFrontier'
                  }
               }
            }
         ],
         area2: [
            {
               widget: 'portal/test_widget2',
               features: {
                  actions: {
                     '${topic:applyAction}': [ 'first', '${topic:second}' ]
                  }
               }
            }
         ]
      }

   },

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   compositionWithNegatedGeneratedFlagName: {

      areas: {
         '.': [
            {
               widget: 'portal/headline_widget',
               features: {
                  buttons: [
                     {
                        action: 'one',
                        hideOn: [ '${topic:holdingsShowing}' ]
                     },
                     {
                        action: 'two',
                        hideOn: [ '!${topic:holdingsShowing}' ]
                     }
                  ]
               }
            }
         ]
      }

   },

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   compositionWithDisabledWidgets: {

      features: {},
      areas: {
         '.': [
            { widget: 'portal/test_widget', id: 'idx1', enabled: false },
            { widget: 'portal/test_widget2' },
            { widget: 'portal/test_widget2', enabled: false }
         ]
      }

   },

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   compositionWithFeaturesWithoutDefaults: {

      features: {
         something: {
            type: 'object',
            properties: {
               resource: {
                  type: 'string'
               },
               action: {
                  type: 'string'
               }
            }
         }
      },
      areas: {
         '.': [
            {
               widget: 'portal/test_widget1',
               id: 'idx1',
               features: {
                  open: { onActions: [ '${features.something.action}' ] },
                  anything: {
                     resource: '${features.something.resource}'
                  }
               }
            }
         ]
      }

   }

} );