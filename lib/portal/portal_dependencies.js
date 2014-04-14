/**
 * Copyright 2014 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
define( [
   'angular',
   'angular-sanitize',
   './modules/portal_services',
   './modules/flow',
   './modules/page',
   '../directives/directives'
], function( ng, ngSanitizeModule, portalServicesModule, flowModule, pageModule, directives ) {
   'use strict';

   return ng.module( 'laxar.portal.dependencies', [
      'ngSanitize',

      portalServicesModule.name,
      flowModule.name,
      pageModule.name,
      directives.widgetArea.name,
      directives.pageFade.name
   ] );

} );
