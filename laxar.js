/**
 * Copyright 2016 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
import assert from './lib/utilities/assert';
import fn from './lib/utilities/fn';
import * as object from './lib/utilities/object';
import * as string from './lib/utilities/string';

import { create as createServices } from './lib/runtime/services';
import { createLogErrorHandler } from './lib/event_bus/event_bus';
import { create as createConfiguration } from './lib/runtime/configuration';
import { create as createBrowser } from './lib/runtime/browser';
import { create as createLog } from './lib/logging/log';
import * as plainAdapter from './lib/widget_adapters/plain_adapter';

// Stores the fallback logger. The initial log is replaced with a correctly configured instance as soon as
// the laxarjs services have been bootstrapped.
let fallbackLog = createLog(
   createConfiguration( { logging: { threshold: 'INFO' } } ),
   createBrowser()
);

/**
 * Bootstraps AngularJS on the provided `anchorElement` and sets up the LaxarJS runtime.
 *
 * @memberOf laxar
 *
 * @param {HTMLElement} anchorElement the element to insert the page in
 * @param {Object} optionalOptions
 */
export function bootstrap(
   anchorElement, { widgetAdapters, widgetModules, whenServicesReady, configuration }
) {
   const services = createServices( configuration || {} );

   const { globalEventBus, log, i18n, themeManager, cssLoader, paths, storage, widgetLoader } = services;
   themeManager.loadThemeCss( cssLoader, paths );
   const adapterModules = [ plainAdapter, ...widgetAdapters ];
   const adapters = bootstrapWidgetAdapters( services, adapterModules, widgetModules );
   widgetLoader.registerWidgetAdapters( adapters );

   // TODO (#310) define exact set of publicy visible services, plus naming (injection-style or module-style?)
   const publicServices = {
      configuration: services.configuration,
      globalEventBus,
      i18n,
      log,
      storage,
      tooling: services.toolingProviders
   };

   fallbackLog = log;

   // TODO (#310) move out into application space (`whenServicesReady` callback)?
   globalEventBus.setErrorHandler( createLogErrorHandler( log ) );
   // TODO (#310) move out into application space (`whenServicesReady` callback)?
   ensureInstanceId( log, storage );
   if( whenServicesReady ) {
      whenServicesReady( publicServices );
   }

   if( services.paths.FLOW_JSON ) {
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

///////////////////////////////////////////////////////////////////////////////////////////////////////////

function bootstrapWidgetAdapters( services, adapterModules, widgetModulesByTechnology ) {
   const { log } = services;
   const adapterModulesByTechnology = {};
   adapterModules.forEach( module => {
      adapterModulesByTechnology[ module.technology ] = module;
   } );

   const adapters = [];
   Object.keys( widgetModulesByTechnology ).forEach( technology => {
      const adapterModule = adapterModulesByTechnology[ technology ];
      if( !adapterModule ) {
         log.fatal( 'Unknown widget technology: [0]', technology );
         return;
      }
      const widgetModules = widgetModulesByTechnology[ technology ];
      adapters.push( adapterModule.bootstrap( widgetModules, services ) );
   } );
   return adapters;
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////////

function ensureInstanceId( log, storage ) {
   const instanceIdStorageKey = 'axLogTags.INST';
   const store = storage.getApplicationSessionStorage();
   let instanceId = store.getItem( instanceIdStorageKey );
   if( !instanceId ) {
      instanceId = `${Date.now()}${Math.floor( Math.random() * 100 )}`;
      store.setItem( instanceIdStorageKey, instanceId );
   }
   log.addTag( 'INST', instanceId );
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * To ease the transition from laxarjs v1 to laxarjs v2, a global log fallback is provided.
 * Clients should prefer the widget-level injection `axLog` (TODO, #306) or use the global log-service,
 * which can be obtained using the `whenServicesReady` callback to `bootstrap`.
 */
const log = object.tabulate(
   method => {
      return ( ...args ) => {
         // TODO, #306: enable this deprecation warning
         // fallbackLog.warn( 'Deprecation warning: avoid using laxar.log and prefer the axLog injection' );
         fallbackLog[ method ]( ...args );
      };
   },
   Object.keys( fallbackLog )
);

//////////////////////////////////////////////////////////////////////////////////////////////////////////////

export {
   assert,
   object,
   string,
   fn,
   log
};
