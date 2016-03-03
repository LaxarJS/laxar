/**
 * Copyright 2016 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
import log from './lib/logging/log';
import * as eventBus from './lib/event_bus/event_bus';
import * as fileResourceProvider from './lib/file_resource_provider/file_resource_provider';
import * as i18n from './lib/i18n/i18n';
import * as widgetLoader from './lib/loaders/widget_loader';
import assert from './lib/utilities/assert';
import * as configuration from './lib/utilities/configuration';
import fn from './lib/utilities/fn';
import * as object from './lib/utilities/object';
import * as path from './lib/utilities/path';
import storage from './lib/utilities/storage';
import * as string from './lib/utilities/string';
import { create as createServices } from './lib/runtime/services';
import * as controlsService from './lib/runtime/controls_service';
import * as themeManager from './lib/runtime/theme_manager';
import * as adapters from './lib/widget_adapters/adapters';
import pageToolingApi from './lib/tooling/pages';


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

   log.trace( 'Bootstrapping LaxarJS...' );

   const services = createServices( configuration );
   loadThemeCss( services );

   if( optionalWidgetAdapters && Array.isArray( optionalWidgetAdapters ) ) {
      adapters.addAdapters( optionalWidgetAdapters );
   }

   Object.keys( widgetModules ).forEach( function( technology ) {
      const adapter = adapters.getFor( technology );
      if( !adapter ) {
         log.error( 'Unknown widget technology: [0]', technology );
         return;
      }

      adapter.bootstrap( widgetModules[ technology ], services );
   } );

   whenDocumentReady( () => {
      log.trace( `Loading flow from "${services.paths.FLOW_JSON}"` );
      services.pageService.createControllerFor( document.querySelector( '[data-ax-page]' ) );
      services.flowService.controller()
         .loadFlow( services.paths.FLOW_JSON )
         .then( () => log.trace( 'Flow loaded' ), err => log.fatal( err ) );
   } );
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////////

function setInstanceIdLogTag() {
   const instanceIdStorageKey = 'axLogTags.INST';
   const store = storage.getApplicationSessionStorage();
   let instanceId = store.getItem( instanceIdStorageKey );
   if( !instanceId ) {
      instanceId = '' + Date.now() + Math.floor( Math.random() * 100 );
      store.setItem( instanceIdStorageKey, instanceId );
   }

   log.addTag( 'INST', instanceId );
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////////

function loadThemeCss( services ) {
   services.themeManager
      .urlProvider( path.join( services.paths.THEMES, '[theme]' ), null, [ services.paths.DEFAULT_THEME ] )
      .provide( [ 'css/theme.css' ] )
      .then( ( [ cssFile ] ) => services.cssLoader.load( cssFile ) );
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////////

function whenDocumentReady( callback ) {
   if( document.readyState === 'complete' ) {
      callback();
   }
   else {
      document.addEventListener( 'DOMContentLoaded', callback );
   }
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////////

// API to leverage tooling support.
// Not for direct use by widgets/activities!
//  - laxar-mocks needs this for widget tests
const _tooling = {
   controlsService: controlsService,
   eventBus: eventBus,
   fileResourceProvider: fileResourceProvider,
   path: path,
   themeManager: themeManager,
   widgetAdapters: adapters,
   widgetLoader: widgetLoader,
   // Prototype support for page inspection tools:
   pages: pageToolingApi
};

//////////////////////////////////////////////////////////////////////////////////////////////////////////////

export {
   assert,
   bootstrap,
   configuration,
   fn,
   i18n,
   log,
   object,
   storage,
   string,
   _tooling
};
