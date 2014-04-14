/**
 * Copyright 2014 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
define( [
   './layout/layout',
   './widget_area/widget_area',
   './page_fade/page_fade'
], function( layoutModule, widgetAreaModule,pageFadeModule  ) {
   'use strict';

   return {
      layout: layoutModule,
      widgetArea: widgetAreaModule,
      pageFade: pageFadeModule
   };

} );
