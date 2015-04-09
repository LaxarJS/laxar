/**
 * Copyright 2014 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
define( [
   'angular',
   './lib/logging/log',
   './lib/logging/channels/console_logger',
   './lib/directives/directives',
   './lib/i18n/i18n',
   './lib/utilities/assert',
   './lib/utilities/array',
   './lib/utilities/fn',
   './lib/utilities/object',
   './lib/utilities/storage',
   './lib/utilities/string',
   './lib/runtime/configuration',
   './lib/runtime/module_registry',
   './lib/runtime/runtime',
   './lib/runtime/runtime_dependencies'
], function(
   ng,
   log,
   consoleLogger,
   directives,
   i18n,
   assert,
   array,
   fn,
   object,
   storage,
   string,
   configuration,
   moduleRegistry,
   runtime,
   runtimeDependencies
) {
   'use strict';

   /**
    * Bootstraps AngularJS on the current `window.document` and sets up the LaxarJS portal. All AngularJS
    * module names of widgets that are passed to this method will be passed to `angular.bootstrap` as initial
    * dependencies, along with internal laxar modules. This is needed because AngularJS currently doesn't
    * support lazy loading of modules. The `portal_angular_dependencies` grunt task of LaxarJS will collect
    * all widgets reachable for the given `flow.json`, define them as dependencies of an amd module, that will
    * return the names of their respective AngularJS modules. This list of module names can simply be passed
    * to the `boostrap` method.
    *
    * @memberOf laxar
    *
    * @param {String[]} widgetModules
    *    all AngularJS modules that should instantly be loaded (most probably the widgets)
    */
   function bootstrap( widgetModules ) {
      var logThreshold = configuration.get( 'logging.threshold' );
      if( logThreshold ) {
         log.setLogThreshold( logThreshold );
      }

      log.addLogChannel( log.channels.console );
      log.trace( 'Bootstrapping LaxarJS...' );

      Object.keys( widgetModules ).forEach( function( technology ) {
         widgetModules[ technology ].forEach( moduleRegistry.registerModule.bind( null, technology ) );
      } );

      var dependencies = [ runtime.name, runtimeDependencies.name ]
         .concat( moduleRegistry.bootstrapDependencies() );

      ng.element( document ).ready( function bootstrap() {
         ng.bootstrap( document, dependencies );
      } );
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   return {
      assert: assert,
      array: array,
      bootstrap: bootstrap,
      configuration: configuration,
      directives: directives,
      fn: fn,
      i18n: i18n,
      log: log,
      object: object,
      storage: storage,
      string: string
   };

} );
