/**
 * Copyright 2014 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
define( [
   './id/id',
   './layout/layout',
   './widget_area/widget_area',
   './page_fade/page_fade'
], function( idModule, layoutModule, widgetAreaModule,pageFadeModule  ) {
   'use strict';

   return {
      id: idModule,
      layout: layoutModule,
      widgetArea: widgetAreaModule,
      pageFade: pageFadeModule
   };

} );
