/**
 * Copyright 2016 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
import assert from './lib/utilities/assert';
import * as object from './lib/utilities/object';
import * as string from './lib/utilities/string';

import { create as createServices } from './lib/runtime/services';
import { create as createConfiguration } from './lib/runtime/configuration';
import { create as createBrowser } from './lib/runtime/browser';
import { create as createLog, BLACKBOX } from './lib/logging/log';
import * as plainAdapter from './lib/widget_adapters/plain_adapter';

// Get a reference to the global object of the JS environment.
// See http://stackoverflow.com/a/6930376 for details
let global;
try {
   // eslint-disable-next-line no-new-func, no-eval
   global = Function( 'return this' )() || ( 1, eval )( 'this' );
}
catch( _ ) {
   // if it forbids eval, it's probably a browser
   global = window;
}


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
 * @param {HTMLElement} anchorElement
 *    the element to insert the page in
 * @param {Object} [optionalOptions]
 *    optional options for bootstrapping
 * @param {Array} optionalOptions.widgetAdapters
 *    widget adapters that are used in this application
 * @param {Object} optionalOptions.widgetModules
 *    map from widget technology to the list of widgets using that technology, for use in the application
 * @param {Object} optionalOptions.configuration
 *    configuration for the laxar application. See http://laxarjs.org/docs/laxar-latest/manuals/configuration/
 *    for further information on available properties
 */
export function bootstrap(
   anchorElement, { widgetAdapters = [], widgetModules = {}, configuration = {}, resources = {} } = {}
) {
   assert( anchorElement ).hasType( HTMLElement ).isNotNull();
   assert( widgetAdapters ).hasType( Array ).isNotNull();
   assert( widgetModules ).hasType( Object ).isNotNull();
   assert( configuration ).hasType( Object ).isNotNull();

   const services = createServices( configuration, resources );

   const { globalEventBus, log, i18n, themeManager, paths, storage, widgetLoader } = services;
   themeManager.loadThemeCss( paths );

   const publicServices = {
      configuration: services.configuration,
      globalEventBus,
      heartbeat: services.heartbeat,
      i18n,
      log,
      pageService: services.pageService,
      storage,
      tooling: services.toolingProviders
   };

   const adapterModules = [ plainAdapter, ...widgetAdapters ];
   const adapters = bootstrapWidgetAdapters( publicServices, adapterModules, widgetModules );
   widgetLoader.registerWidgetAdapters( adapters );

   fallbackLog = log;
   announceInstance( services );

   if( services.paths.FLOW_JSON ) {
      whenDocumentReady( () => {
         log.trace( `Loading flow from "${services.paths.FLOW_JSON}"` );
         services.pageService.createControllerFor( anchorElement );
         services.flowService.controller()
            .loadFlow( services.paths.FLOW_JSON )
            .then( () => log.trace( 'Flow loaded' ), err => {
               log.fatal( 'Failed to load' );
               log.fatal( 'Error [0].\nStack: [1]', err, err && err.stack );
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

function announceInstance( publicServices ) {
   const { configuration, log, storage } = publicServices;

   if( configuration.get( 'tooling.enabled' ) ) {
      instances()[ configuration.get( 'name', 'unnamed' ) ] = publicServices;
   }

   const idGenerator = configuration.get( 'logging.instanceId', simpleId );
   if( idGenerator === false ) { return; }

   const instanceIdStorageKey = 'axLogTags.INST';
   const store = storage.getApplicationSessionStorage();
   let instanceId = store.getItem( instanceIdStorageKey );
   if( !instanceId ) {
      instanceId = idGenerator();
      store.setItem( instanceIdStorageKey, instanceId );
   }
   log.addTag( 'INST', instanceId );

   function simpleId() {
      return `${Date.now()}${Math.floor( Math.random() * 100 )}`;
   }
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Provide tooling access to LaxarJS services.
 *
 * Each laxar#bootstrap call creates a new set of services such as a logger, global event bus etc. For tools
 * like the laxar-developer-tools-widget, it may be necessary to access these services for a given instance,
 * or for all instances.
 *
 * @param {String} [optionalName]
 *   The configuration name of a LaxarJS instance to inspect.
 *   May be omitted to access all application instances by name.
 *
 * @return {Object}
 *   The tooling services for a specified instance, or for all instances that have tooling enabled.
 */
function instances( optionalName ) {
   const instances = global.laxarInstances = ( global.laxarInstances || {} );
   return optionalName ? instances[ optionalName ] : instances;
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * To ease the transition from laxarjs v1 to laxarjs v2, a global log fallback is provided.
 * Clients should prefer the widget-level injection `axLog` (TODO, #306) or use the global log-service,
 * which can be obtained by enabling tooling in the configuration and using the log service from
 * `laxar.instances(*application name from configuration*).log`.
 */
const log = object.tabulate(
   method => {
      return ( ...args ) => {
         // TODO, #306: enable this deprecation warning
         // fallbackLog.warn( 'Deprecation warning: avoid using laxar.log and prefer the axLog injection' );
         fallbackLog[ method ]( ...args, BLACKBOX );
      };
   },
   Object.keys( fallbackLog )
);

//////////////////////////////////////////////////////////////////////////////////////////////////////////////

export {
   assert,
   object,
   string,
   instances,
   log
};
