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
import * as plainAdapter from './lib/widget_adapters/plain_adapter';
import pageToolingApi from './lib/tooling/pages';


/**
 * Bootstraps AngularJS on the provided `anchorElement` and sets up the LaxarJS runtime.
 *
 * @memberOf laxar
 *
 * @param {HTMLElement} anchorElement the element to insert the page in
 */
export function bootstrap( anchorElement, { widgetAdapters, widgetModules } ) {

   setInstanceIdLogTag();

   log.trace( 'Bootstrapping LaxarJS...' );

   const adapters = [ plainAdapter, ...widgetAdapters ];
   const services = createServices( configuration, adapters );
   loadThemeCss( services );
   bootstrapWidgetAdapters( services, adapters, widgetModules );

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

function bootstrapWidgetAdapters( services, adapters, widgetModules ) {
   const widgetAdapters = {};
   adapters.forEach( adapter => {
      widgetAdapters[ adapter.technology ] = adapter;
   } );

   Object.keys( widgetModules ).forEach( technology => {
      const adapter = widgetAdapters[ technology ];
      if( !adapter ) {
         log.fatal( 'Unknown widget technology: [0]', technology );
         return;
      }

      adapter.bootstrap( widgetModules[ technology ], services );
   } );
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
