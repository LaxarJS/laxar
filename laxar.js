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
   './lib/runtime/runtime',
   './lib/runtime/runtime_dependencies',
   './lib/widget_adapters/adapters'
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
   runtime,
   runtimeDependencies,
   adapters
) {
   'use strict';

   /**
    * Bootstraps AngularJS on the current `window.document` and sets up the LaxarJS runtime. All AngularJS
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
    * @param {{create: Function}[]} optionalWidgetAdapters
    *    an optional array of user-defined widget adapter modules
    */
   function bootstrap( widgetModules, optionalWidgetAdapters ) {
      findAndLogDeprecatedSettings();

      var logThreshold = configuration.get( 'logging.threshold' );
      if( logThreshold ) {
         log.setLogThreshold( logThreshold );
      }

      log.addLogChannel( log.channels.console );
      log.trace( 'Bootstrapping LaxarJS...' );

      if( optionalWidgetAdapters && Array.isArray( optionalWidgetAdapters ) ) {
         adapters.addAdapters( optionalWidgetAdapters );
      }
      var dependencies = [ runtime.name, runtimeDependencies.name ];

      Object.keys( widgetModules ).forEach( function( technology ) {
         var adapter = adapters.getFor( technology );
         if( !adapter ) {
            log.error( 'Unknown widget technology: [0]', technology );
            return;
         }

         var module = adapter.bootstrap( widgetModules[ technology ] );
         if( module && module.name ) {
            dependencies.push( module.name );
         }
      } );

      ng.element( document ).ready( function bootstrap() {
         ng.bootstrap( document, dependencies );
      } );
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function findAndLogDeprecatedSettings() {
      var deprecatedConfiguration = {
         'event_bus.timeout_ms': 'eventBusTimeoutMs',
         'file_resource_provider.listings': 'fileListings',
         'file_resource_provider.fileListings': 'fileListings',
         'file_resource_provider.useEmbedded': 'useEmbeddedFileListings',
         'portal.useMergedCss': 'useMergedCss',
         'portal.theme': 'theme',
         'portal.flow.entryPoint': 'flow.entryPoint',
         'portal.flow.exitPoints': 'flow.exitPoints'
      };

      // Obtain global object in strict mode: http://stackoverflow.com/questions/3277182/
      /*jshint evil:true*/
      var global = new Function( 'return this' )();
      ng.forEach( deprecatedConfiguration, function( newLocation, oldLocation ) {
         var oldValue = object.path( global.laxar, oldLocation );
         if( oldValue !== undefined ) {
            log.warn( 'Found deprecated configuration key "[0]". Use "[1]" instead.', oldLocation, newLocation );
            var newValue = object.path( global.laxar, newLocation );
            if( newValue === undefined ) {
               object.setPath( global.laxar, newLocation, oldValue );
            }
         }
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
