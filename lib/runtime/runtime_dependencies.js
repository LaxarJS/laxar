/**
 * Copyright 2014 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
define( [
   'angular',
   'angular-sanitize',
   './runtime_services',
   './flow',
   './page',
   '../loaders/widget_adapters/angular_adapter',
   '../directives/directives',
   '../profiling/profiling'
], function( ng, ngSanitizeModule, runtimeServicesModule, flowModule, pageModule, ngAdapter, directives, profilingModule ) {
   'use strict';

   return ng.module( 'axPortalDependencies', [
      'ngSanitize',

      runtimeServicesModule.name,
      flowModule.name,
      pageModule.name,
      ngAdapter.module.name,
      directives.id.name,
      directives.widgetArea.name,
      directives.pageFade.name,
      profilingModule.name
   ] );

} );
