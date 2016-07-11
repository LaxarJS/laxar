/**
 * Copyright 2016 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
export default {
   page: {
      layout: 'super-layout',
      areas: {
         testArea1: [
            { widget: 'someWidgetRef1', id: 'id1' },
            { layout: 'myLayout', id: 'nestedLayout' }
         ],
         testArea2: [
            { widget: 'someWidgetRef2', id: 'id3' }
         ],
         'nestedLayout.content': [
            { widget: 'someWidgetRef3', id: 'id4' }
         ]
      }
   },
   layout: {
      className: 'super-layout',
      htmlContent: '<section>' +
         '<div ax-widget-area="testArea1"></div>' +
         '<div ax-widget-area="testArea2"></div>' +
         '<div ax-widget-area="popups"></div>' +
         '</section>'
   }
};
