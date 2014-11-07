/**
 * Copyright 2014 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
define( {
   mixin1: {
      widgets: [
         { widget: 'some_widget1', id: 'someWidgetId1' },
         { widget: 'some_widget2' }
      ]
   },
   mixin2: {
      widgets: [
         { widget: 'mixin2/some_widget1', id: 'mixin2WidgetId1' },
         { widget: 'mixin2/some_widget2' }
      ]
   }
} );
