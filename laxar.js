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


let widgetModules = [];

/**
 * Register all additional widget adapter modules that will be used. Only the adapter for plain JavaScript
 * widgets is included.
 *
 * @memberOf laxar
 *
 * @param {Object[]} widgetAdapters the widget adapter modules to register
 */
export function registerWidgetAdapters( widgetAdapters ) {
   adapters.addAdapters( widgetAdapters );
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Register all widget modules that will be available throughout the LaxarJS application. Note that for every
 * integration technology there needs to be a registered adapter available.
 * See {@link #registerWidgetAdapters()}.
 *
 * @memberOf laxar
 *
 * @param  {Object[]} modules the widget modules to register
 */
export function registerWidgetModules( modules ) {
   widgetModules = modules;
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Bootstraps AngularJS on the provided `anchorElement` and sets up the LaxarJS runtime.
 *
 * @memberOf laxar
 *
 * @param {HTMLElement} anchorElement the element to insert the page in
 */
export function bootstrap( anchorElement ) {

   setInstanceIdLogTag();

   log.trace( 'Bootstrapping LaxarJS...' );

   const services = createServices( configuration );
   loadThemeCss( services );

   Object.keys( widgetModules ).forEach( technology => {
      const adapter = adapters.getFor( technology );
      if( !adapter ) {
         log.error( 'Unknown widget technology: [0]', technology );
         return;
      }

      adapter.bootstrap( widgetModules[ technology ], services );
   } );

   whenDocumentReady( () => {
      log.trace( `Loading flow from "${services.paths.FLOW_JSON}"` );
      services.pageService.createControllerFor( anchorElement );
      services.flowService.controller()
         .loadFlow( services.paths.FLOW_JSON )
         .then( () => log.trace( 'Flow loaded' ), err => {
            log.fatal( 'Failed to load' );
            log.fatal( 'Error [0].\nStack: [1]', err, err.stack );
         } );
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

// API to leverage tooling support. Not for direct use by widgets/activities!
// For example laxar-mocks needs this for widget tests
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
   configuration,
   fn,
   i18n,
   log,
   object,
   storage,
   string,
   _tooling
};
