/**
 * Copyright 2016 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
define( [], {
   pageThatExtendsItself: {
      'extends': 'pageThatExtendsItself'
   },

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   pageWithoutLayout: {
   },
   pageWithLayout: {
      layout: 'someLayout'
   },
   pageWithLayoutExtendingPageWithoutLayout: {
      'extends': 'pageWithoutLayout',
      layout: 'someLayout'
   },
   pageWithLayoutExtendingOtherPageWithLayout: {
      'extends': 'pageWithLayout',
      layout: 'someLayout'
   },

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   cyclicPage1: {
      'extends': 'cyclicPage3'
   },
   cyclicPage2: {
      'extends': 'cyclicPage1'
   },
   cyclicPage3: {
      'extends': 'cyclicPage2'
   },

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   'extends/base_page': {
      areas: {
         one: []
      }
   },
   'category/page': {
      'extends': 'extends/base_page'
   },

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   pageWithDuplicateWidgetIdsInSameArea: {
     layout: 'someLayout',
     areas: {
        testArea: [
           { widget: 'someWidgetPath1', id: 'id1' },
           { widget: 'someWidgetPath2', id: 'id2' },
           { widget: 'someWidgetPath3', id: 'id1' }
        ]
     }
   },
   pageWithDuplicateWidgetIdsInDifferentAreas: {
      layout: 'someLayout',
      areas: {
         testArea1: [
            { widget: 'someWidgetPath1', id: 'id1' },
            { widget: 'someWidgetPath2', id: 'id2' }
         ],
         testArea2: [
            { widget: 'someWidgetPath3', id: 'id3' },
            { widget: 'someWidgetPath4', id: 'id1' },
            { widget: 'someWidgetPath4', id: 'id2' }
         ]
      }
   },

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   basePage: {
      layout: 'someLayout',

      areas: {
         area1: [
            { widget: 'someWidgetPath1', id: 'id1' },
            { widget: 'someWidgetPath2', id: 'id2' }
         ],
         area2: [
            { widget: 'someWidgetPath3', id: 'id3' }
         ]
      }
   },
   derivedPage: {
      'extends': 'basePage',

      areas: {
         area1: [
            { widget: 'someWidgetPath4', id: 'id4' }
         ],
         area3: [
            { widget: 'someWidgetPath5', id: 'id5' }
         ]
      }
   },
   derivedPageWithDuplicateIds: {
      'extends': 'basePage',

      areas: {
         area1: [
            { widget: 'someWidgetPath4', id: 'id3' }
         ],
         area3: [
            { widget: 'someWidgetPath5', id: 'id1' }
         ]
      }
   },
   derivedPageWithInsertBeforeId: {
      'extends': 'basePage',

      areas: {
         area1: [
            { widget: 'someWidgetPath4', id: 'id4', insertBeforeId: 'id2' }
         ],
         area2: [
            { widget: 'someWidgetPath5', id: 'id5', insertBeforeId: 'id3' }
         ]
      }
   },
   derivedPageWithNonExistingInsertBeforeId: {
      'extends': 'basePage',

      areas: {
         area1: [
            { widget: 'someWidgetPath4', id: 'id4', insertBeforeId: 'idXXX' }
         ]
      }
   },

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   derivedPageWithJsonSuffix: {
      'extends': 'basePage.json',

      areas: {
         area1: [
            { widget: 'someWidgetPath4', id: 'id4' }
         ],
         area3: [
            { widget: 'someWidgetPath5', id: 'id5' }
         ]
      }
   },

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   pageWithMissingWidgetIds: {
      layout: 'someLayout',

      areas: {
         area1: [
            { widget: 'category/widget1', id: 'id1' },
            { widget: 'category/widget2' },
            { widget: 'category/widget3' }
         ]
      }
   },

   pageWithMissingWidgetIdsAndInheritance: {
      'extends': 'pageWithMissingWidgetIds',

      areas: {
         area1: [
            { widget: 'someWidgetPath1', id: 'id2' },
            { widget: 'category/widget2' },
            { widget: 'category/widget3' }
         ]
      }
   },

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   invalidPage: {
      layout: 'someLayout',
      areas: {
         testArea: [
            { widget: 'someWidgetPath1', id: 'ImWrong!' }
         ]
      }
   },

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   pageWithDisabledWidgets: {
      layout: 'someLayout',

      areas: {
         area1: [
            { widget: 'someWidgetPath1', id: 'id1', enabled: false },
            { widget: 'someWidgetPath2', id: 'id2' }
         ],
         area2: [
            { widget: 'someWidgetPath3', id: 'id3', enabled: false }
         ]
      }
   },

   pageWithDisabledWidgetsInExtendedPage: {
      'extends': 'pageWithDisabledWidgets',

      areas: {
         area2: [
            { widget: 'someWidgetPath3', id: 'id4' }
         ]
      }
   },

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   pageWithDotlessComposition: {
      layout: 'someLayout',

      areas: {
         test: [
            {
               composition: 'dotlessComposition'
            }
         ]
      }
   }

} );
