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
   './lib/text/text',
   './lib/i18n/i18n',
   './lib/utilities/assert',
   './lib/utilities/array',
   './lib/utilities/object',
   './lib/utilities/storage',
   './lib/utilities/string',
   './lib/portal/configuration',
   './lib/portal/portal', // no arg
   './lib/portal/portal_dependencies' // no arg
], function(
   ng,
   log,
   consoleLogger,
   directives,
   text,
   i18n,
   assert,
   array,
   object,
   storage,
   string,
   configuration
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
      // DEPRECATED: 'logThreshold' should be removed in the next major version
      var logThreshold = configuration.get( 'logging.threshold' ) || configuration.get( 'logThreshold' );
      if( logThreshold ) {
         log.setLogThreshold( logThreshold );
      }
      log.addLogChannel( log.channels.console );
      log.trace( 'Bootstrapping portal ... ' );

      var dependencies = [
         'laxar.portal',
         'laxar.portal.dependencies'
      ].concat( widgetModules );

      ng.element( document ).ready( function bootstrap() {
         ng.bootstrap( document, dependencies );
      } );
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   return {
      bootstrap: bootstrap,
      log: log,
      configuration: configuration,
      directives: directives,
      text: text,
      i18n: i18n,
      assert: assert,
      array: array,
      object: object,
      storage: storage,
      string: string
   };

} );
