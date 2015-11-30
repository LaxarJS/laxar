/**
 * Copyright 2015 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */

import ng from 'angular';
import log from 'lib/logging/log';
import * as directives from 'lib/directives/directives';
import * as eventBus from 'lib/event_bus/event_bus';
import * as fileResourceProvider from 'lib/file_resource_provider/file_resource_provider';
import * as i18n from 'lib/i18n/i18n';
import * as widgetLoader from 'lib/loaders/widget_loader';
import assert from 'lib/utilities/assert';
import * as configuration from 'lib/utilities/configuration';
import fn from 'lib/utilities/fn';
import * as object from 'lib/utilities/object';
import * as path from 'lib/utilities/path';
import storage from 'lib/utilities/storage';
import * as string from 'lib/utilities/string';
import runtime from 'lib/runtime/runtime';
import * as runtimeDependencies from 'lib/runtime/runtime_dependencies';
import * as controlsService from 'lib/runtime/controls_service';
import * as themeManager from 'lib/runtime/theme_manager';
import * as adapters from 'lib/widget_adapters/adapters';


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

   setInstanceIdLogTag();

   findAndLogDeprecatedSettings();

   log.trace( 'Bootstrapping LaxarJS...' );

   if( optionalWidgetAdapters && Array.isArray( optionalWidgetAdapters ) ) {
      adapters.addAdapters( optionalWidgetAdapters );
   }
   var dependencies = [ runtime.module.name, runtimeDependencies.name ];

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

function setInstanceIdLogTag() {
   var instanceIdStorageKey = 'axLogTags.INST';
   var store = storage.getApplicationSessionStorage();
   var instanceId = store.getItem( instanceIdStorageKey );
   if( !instanceId ) {
      instanceId = '' + new Date().getTime() + Math.floor( Math.random() * 100 );
      store.setItem( instanceIdStorageKey, instanceId );
   }

   log.addTag( 'INST', instanceId );
}

// API to leverage tooling support.
// Not for direct use by widgets/activities!
//  - laxar-mocks needs this for widget tests
//  - laxar-patterns needs this to have the same (mocked) q version as the event bus
var _tooling = {
   controlsService: controlsService,
   eventBus: eventBus,
   fileResourceProvider: fileResourceProvider,
   path: path,
   themeManager: themeManager,
   widgetAdapters: adapters,
   widgetLoader: widgetLoader,
   runtimeDependenciesModule: runtimeDependencies,
   provideQ: function() {
      return runtime.api.provideQ();
   }
};

///////////////////////////////////////////////////////////////////////////////////////////////////////////

export {
   assert,
   bootstrap,
   configuration,
   directives,
   fn,
   i18n,
   log,
   object,
   storage,
   string,
   _tooling
};
