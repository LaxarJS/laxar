/**
 * Copyright 2014 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
define( {

   pageWithSimpleComposition: {
      areas: {
         area1: [
            { widget: 'someWidgetPath1', id: 'id1' },
            { composition: 'simpleComposition' },
            { widget: 'someWidgetPath1', id: 'id2' }
         ],
         area2: [
            { widget: 'someWidgetPath1', id: 'id3' }
         ]
      }
   },

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   pageWithCompositionWithAdditionalAreas: {
      areas: {
         area1: [
            { composition: 'compositionWithAdditionalAreas' }
         ],
         area2: [
            { widget: 'someWidgetPath1', id: 'id3' }
         ]
      }
   },

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   pageWithCompositionWithFeaturesOverwritingDefaults: {
      areas: {
         area1: [
            {
               composition: 'compositionWithFeaturesDefined',
               features: {
                  close: {
                     onActions: [ 'close', 'cancelAction' ]
                  },
                  something: {
                     resource: 'cars'
                  }
               }
            }
         ]
      }
   },

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   pageWithCompositionWithFeaturesOmittingDefaults: {
      areas: {
         area1: [
            {
               composition: 'compositionWithFeaturesDefined',
               features: {
                  close: {
                     onActions: [ 'close', 'cancelAction' ]
                  }
               }
            }
         ]
      }
   },

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   pageWithCompositionWithEmbeddedComposition: {
      areas: {
         area1: [
            {
               composition: 'compositionWithEmbeddedComposition',
               features: {
                  shutdown: {
                     onActions: [ 'shutdownAction' ]
                  }
               }
            }
         ]
      }
   },

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   pageWithCompositionWithMergedFeatures: {
      areas: {
         area1: [
            {
               composition: 'compositionWithMergedFeatures',
               id: 'myComposition',
               features: {
                  closeButton: {
                     action: 'closeIt'
                  },
                  close: {
                     onActions: [ 'closeAgain', 'needMoreCloseActions' ]
                  }
               }
            }
         ]
      }
   },

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   pageWithCompositionWithDirectCycle: {
      areas: {
         area1: [
            { composition: 'compositionWithDirectCycle' }
         ]
      }
   },

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   pageWithCompositionWithCycle: {
      areas: {
         area1: [
            { composition: 'compositionWithCycle' }
         ]
      }
   },

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   pageWithCompositionInSubFolder: {
      areas: {
         area1: [
            { composition: 'composition/in/subfolder' }
         ]
      }
   },

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   pageWithCompositionWithReplacementsInKeys: {
      areas: {
         area1: [
            {
               composition: 'compositionWithReplacementsInKeys',
               id: 'myComposition',
               features: {
                  efficientFrontierData: {
                     resource: 'something'
                  }
               }
            }
         ]
      }
   },

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   pageWithCompositionWithNegatedGeneratedFlagName: {
      areas: {
         area1: [
            {
               composition: 'compositionWithNegatedGeneratedFlagName',
               id: 'myComposition'
            }
         ]
      }
   },

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   pageWithDisabledComposition: {
      areas: {
         area1: [
            { widget: 'someWidgetPath1', id: 'id1' },
            { composition: 'simpleComposition', enabled: false },
            { widget: 'someWidgetPath1', id: 'id2' }
         ],
         area2: [
            { widget: 'someWidgetPath1', id: 'id3' }
         ]
      }
   },

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   pageWithCompositionWithDisabledWidgets: {
      areas: {
         area1: [
            { widget: 'someWidgetPath1', id: 'id1' },
            { composition: 'compositionWithDisabledWidgets' },
            { widget: 'someWidgetPath1', id: 'id2' }
         ],
         area2: [
            { widget: 'someWidgetPath1', id: 'id3' }
         ]
      }
   },

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   pageWithFeaturesOfCompositionNotConfigured: {
      areas: {
         area1: [
            { composition: 'compositionWithFeaturesWithoutDefaults' }
         ]
      }
   },

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   pageWithCompositionWithNullFeatures: {
      areas: {
         area1: [
            { composition: 'compositionWithNullFeatures' }
         ]
      }
   },

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   pageWithDuplicateIdForCompositions: {
      areas: {
         area1: [
            { composition: 'evenSimplerComposition', id: 'broken' }
         ],
         area2: [
            { composition: 'evenSimplerComposition', id: 'broken' }
         ]
      }
   }

} );
