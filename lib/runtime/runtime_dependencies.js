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
   '../directives/directives',
   '../profiling/profiling'
], function( ng, ngSanitizeModule, runtimeServicesModule, flowModule, pageModule, directives, profilingModule ) {
   'use strict';

   return ng.module( 'axPortalDependencies', [
      'ngSanitize',

      runtimeServicesModule.name,
      flowModule.name,
      pageModule.name,
      directives.id.name,
      directives.widgetArea.name,
      directives.pageFade.name,
      profilingModule.name
   ] );

} );
