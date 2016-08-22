/**
 * Copyright 2016 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */

/**
 * The API entry point for boostrapping LaxarJS applications.
 * Also, provides a couple of utilities to deal with assertions, objects and strings.
 *
 * @module laxar
 */

import assert from './lib/utilities/assert';
import * as object from './lib/utilities/object';
import * as string from './lib/utilities/string';

import { create as createServices } from './lib/runtime/services';
import * as plainAdapter from './lib/runtime/plain_adapter';


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


/**
 * Bootstraps AngularJS on the provided `anchorElement` and sets up the LaxarJS runtime.
 *
 * @param {HTMLElement} anchorElement
 *    the element to insert the page in
 * @param {Object} [optionalOptions]
 *    optional options for bootstrapping
 * @param {Array} optionalOptions.widgetAdapters
 *    widget adapters that are used in this application
 * @param {Object} optionalOptions.configuration
 *    configuration for the laxar application. See http://laxarjs.org/docs/laxar-latest/manuals/configuration/
 *    for further information on available properties
 * @param {Object} optionalOptions.artifacts
 *    an artifact listing for the application, generated build tools (webpack / grunt-laxar)
 *
 * @memberof laxar
 */
export function bootstrap(
   anchorElement, { widgetAdapters = [], configuration = {}, artifacts = {} } = {}
) {
   assert( anchorElement ).isNotNull();
   assert( widgetAdapters ).hasType( Array ).isNotNull();
   assert( artifacts ).hasType( Object ).isNotNull();
   assert( configuration ).hasType( Object ).isNotNull();

   const services = createServices( configuration, artifacts );

   const { globalEventBus, log, storage, themeLoader, widgetLoader } = services;
   themeLoader.load();

   const publicServices = {
      configuration: services.configuration,
      globalEventBus,
      heartbeat: services.heartbeat,
      log,
      pageService: services.pageService,
      storage,
      tooling: services.toolingProviders,
      widgetLoader: services.widgetLoader
   };

   const adapterModules = [ plainAdapter, ...widgetAdapters ];
   const adapters = bootstrapWidgetAdapters( anchorElement, publicServices, adapterModules, artifacts );
   widgetLoader.registerWidgetAdapters( adapters );

   announceInstance( services );

   const flowName = services.configuration.get( 'flow.name' );
   if( !flowName ) {
      log.trace( 'LaxarJS Bootstrap complete: No `flow.name` configured.' );
      return;
   }

   whenDocumentReady( () => {
      log.trace( `LaxarJS loading Flow: ${flowName}` );
      services.pageService.createControllerFor( anchorElement );
      services.flowService.controller()
         .loadFlow()
         .then( () => {
            log.trace( 'Flow loaded' );
         }, err => {
            log.fatal( 'Failed to load' );
            log.fatal( 'Error [0].\nStack: [1]', err, err && err.stack );
         } );
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

function bootstrapWidgetAdapters( anchorElement, services, adapterModules, artifacts ) {
   const { log } = services;
   const adapterModulesByTechnology = {};
   const artifactsByTechnology = {};

   adapterModules.forEach( module => {
      adapterModulesByTechnology[ module.technology ] = module;
      artifactsByTechnology[ module.technology ] = { widgets: [], controls: [] };
   } );

   [ 'widgets', 'controls' ].forEach( type => {
      artifacts[ type ].forEach( artifact => {
         const { technology } = artifact.descriptor.integration;
         if( !adapterModulesByTechnology[ technology ] ) {
            const { name } = artifact.descriptor;
            log.fatal( 'Unknown widget technology: [0], required by [1] "[2]"', technology, type, name );
            return;
         }
         artifactsByTechnology[ technology ][ type ].push( artifact );
      } );
   } );

   const adapters = [];
   Object.keys( adapterModulesByTechnology ).forEach( technology => {
      const adapterModule = adapterModulesByTechnology[ technology ];
      const artifacts = artifactsByTechnology[ technology ];
      adapters.push( adapterModule.bootstrap( artifacts, services, anchorElement ) );
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

export {
   assert,
   object,
   string,
   instances,
   plainAdapter
};
