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
   './portal_assembler/widget_adapters/angular_adapter',
   '../directives/directives',
   '../profiling/profiling'
], function( ng, ngSanitizeModule, portalServicesModule, flowModule, pageModule, ngAdapter, directives, profilingModule ) {
   'use strict';

   return ng.module( 'axPortalDependencies', [
      'ngSanitize',

      portalServicesModule.name,
      flowModule.name,
      pageModule.name,
      ngAdapter.module.name,
      directives.id.name,
      directives.widgetArea.name,
      directives.pageFade.name,
      profilingModule.name
   ] );

} );
