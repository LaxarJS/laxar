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

const MESSAGE_ADAPTERS = 'laxar.create: `adapters` must be an array';
const MESSAGE_ARTIFACTS = 'laxar.create: `artifacts` object must have at least: aliases, themes, widgets';
const MESSAGE_CONFIGURATION = 'laxar.create: `configuration` must be an object';

const TOPIC_WHITESPACE_MATCHER = /\s+([A-Z]?)/g;
const TOPIC_WHITESPACE_REPLACER = (_, c) => `+${c.toUpperCase()}`;
const TOPIC_SEGMENTS_MATCHER = /[^+a-zA-Z0-9]+([a-z]?)/g;
const TOPIC_SEGMENTS_REPLACER = (_, c) => c.toUpperCase();

/**
 * Prepares a LaxarJS application instance from a list of adapters, a bundle of artifacts, and application
 * configuration. The instance then allows to configure which DOM node should receive an application flow.
 * Running this has no effect until `.bootstrap()` is called on the returned instance API.
 *
 * @param {Array} adapters
 *    widget adapters to use in this bootstrapping instance
 * @param {Object} artifacts
 *    an artifact listing for the application, generated by the utilized built tool (e.g. webpack)
 * @param {Object} configuration
 *    application-wide LaxarJS configuration. See http://laxarjs.org/docs/laxar-latest/manuals/configuration/
 *    for further information on available properties
 *
 * @return {BootstrappingInstance}
 *    a handle on the bootstrapping instance, to load and bootstrap a flow
 *
 * @memberof laxar
 */
export function create( adapters, artifacts, configuration ) {
   assert( adapters ).hasType( Array ).isNotNull( MESSAGE_ADAPTERS );
   assert( artifacts ).hasType( Object ).isNotNull( MESSAGE_ARTIFACTS );
   assert( artifacts.aliases ).hasType( Object ).isNotNull( MESSAGE_ARTIFACTS );
   assert( artifacts.themes ).hasType( Array ).isNotNull( MESSAGE_ARTIFACTS );
   assert( artifacts.widgets ).hasType( Array ).isNotNull( MESSAGE_ARTIFACTS );
   assert( configuration ).hasType( Object ).isNotNull( MESSAGE_CONFIGURATION );

   const services = createServices( configuration, artifacts, sharedDebugEventBus() );
   const bootstrappingSchedule = {
      items: [],
      testing: false
   };

   let idCounter = 0;

   /**
    * Handle on a LaxarJS bootstrapping instance.
    *
    * @name BootstrappingInstance
    * @constructor
    */
   const api = { flow, page, tooling, testing, bootstrap };
   return api;

   /**
    * Registers a flow to control routing for this application.
    *
    * @param {String} name
    *    the name of the flow to load
    * @param {HTMLElement} anchorElement
    *    container element to determine where to put the flow
    *
    * @return {BootstrappingInstance}
    *    the current bootstrapping instance (self), for chaining
    *
    * @memberof BootstrappingInstance
    */
   function flow( name, anchorElement ) {
      assert( name ).hasType( String ).isNotNull();
      assert( anchorElement ).isNotNull();
      assert.state( anchorElement.nodeType === Node.ELEMENT_NODE );
      bootstrappingSchedule.items.push( { type: 'flow', name, anchorElement } );
      return api;
   }

   /**
    * Registers a page to display without navigation control.
    *
    * @param {String} name
    *    the name of the page to load
    * @param {HTMLElement} anchorElement
    *    container element to determine where to put the page
    * @param {Object} [parameters]
    *    page parameters to publish with didNavigate
    *
    * @return {BootstrappingInstance}
    *    the current bootstrapping instance (self), for chaining
    *
    * @memberof BootstrappingInstance
    */
   function page( name, anchorElement, parameters = {} ) {
      assert( name ).hasType( String ).isNotNull();
      assert( anchorElement ).isNotNull();
      assert.state( anchorElement.nodeType === Node.ELEMENT_NODE );
      bootstrappingSchedule.items.push( { type: 'page', name, anchorElement, parameters } );
      return api;
   }

   /**
    * Registers a debug bundle for this application.
    *
    * @param {String} name
    *    the instance name to announce in the current window
    * @param {Function|Object} debugInfo
    *    the debug-info bundle for the application, generated by the utilized built tool (e.g. webpack)
    *
    * @return {Bootstrappinginstance}
    *    the current bootstrapping instance (self), for chaining
    *
    * @memberof Bootstrappinginstance
    */
   function tooling( name, debugInfo ) {
      assert( name ).hasType( String ).isNotNull();
      assert( debugInfo ).isNotNull();
      if( configuration.tooling.enabled ) {
         bootstrappingSchedule.items.push( { type: 'tooling', name, debugInfo } );
      }
      return api;
   }

   /**
    * Declare that this instance is used for testing.
    * This will cause .bootstrap not to fail if no flow was configured.
    *
    * @return {BootstrappingInstance}
    *    the current bootstrapping instance (self), for chaining
    *
    * @memberof BootstrappingInstance
    */
   function testing() {
      bootstrappingSchedule.testing = true;
      return api;
   }

   /**
    * Performs the actual application bootstrapping.
    * This includes bootstrapping the application adapters and starting the router.
    *
    * @memberof BootstrappingInstance
    */
   function bootstrap() {
      const { testing, items } = bootstrappingSchedule;
      assert.state( testing || items.length > 0, 'Nothing configured for bootstrap()' );

      const adapterInstances = bootstrapAdapters( services, [ plainAdapter, ...adapters ], artifacts );
      services.widgetLoader.registerWidgetAdapters( adapterInstances );
      announceInstance( services );

      const instance = makeTopic( configuration.name );

      const { log } = services;
      const promises = items.map( item => {
         const { type, name, id = generateId( name ) } = item;
         const instanceContext = {
            instance,
            [ type ]: name,
            id
         };

         log.trace( `laxar.bootstrap: bootstrapping ${type} '${name}' (${id})` );

         if( type === 'flow' ) {
            const { anchorElement } = item;

            return whenDocumentReady( () => {
               log.trace( `laxar.bootstrap: loading flow: ${name}` );
               services.pageService.createControllerFor( anchorElement, instanceContext );
               services.flowController
                  .loadFlow( name )
                  .then( () => {
                     log.trace( 'laxar.bootstrap: flow loaded' );
                  }, err => {
                     log.fatal( 'laxar.bootstrap: failed to load flow.' );
                     log.fatal( 'Error [0].\nStack: [1]', err, err && err.stack );
                  } );
            } );
         }

         if( type === 'page' ) {
            const { anchorElement, parameters } = item;

            return whenDocumentReady( () => {
               const controller = services.pageService.createControllerFor( anchorElement, instanceContext );
               const eventBus = services.globalEventBus;
               const event = {
                  target: name,
                  place: null,
                  data: parameters
               };

               controller.setupPage( name )
                  .then( () => {
                     return eventBus.publish( `didNavigate.${event.target}`, event, { sender: 'bootstrap' } );
                  } )
                  .then( () => {
                     log.trace( 'laxar.bootstrap: page loaded' );
                  }, err => {
                     log.fatal( 'laxar.bootstrap: failed to load page.' );
                     log.fatal( 'Error [0].\nStack: [1]', err, err && err.stack );
                  } );
            } );
         }

         if( type === 'tooling' ) {
            const { debugInfo } = item;

            services.tooling.setupForInstance( debugInfo, instanceContext );
            instances()[ name ] = services;
            return;
         }

         // other item types will be added in future commits, but for now:
         assert.state( false );
      } );

      return Promise.all( promises ).then( () => services );
   }

   function generateId( name ) {
      return `${makeTopic( name )}-id${idCounter++}`;
   }
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////////

function makeTopic( string ) {
   const safeString = string
      .trim()
      .replace( TOPIC_WHITESPACE_MATCHER, TOPIC_WHITESPACE_REPLACER )
      .replace( TOPIC_SEGMENTS_MATCHER, TOPIC_SEGMENTS_REPLACER );
   return safeString.charAt( 0 ).toLowerCase() + safeString.substr( 1 );
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////////

function whenDocumentReady( callback ) {
   return new Promise( ( resolve, reject ) => {
      function ready() {
         try {
            resolve( callback() );
         }
         catch (err) {
            reject( err );
         }
      };

      if( document.readyState === 'complete' ) {
         ready();
      }
      else {
         document.addEventListener( 'DOMContentLoaded', ready );
      }
   } );
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////////

function bootstrapAdapters( services, adapterModules, artifacts ) {

   const adapterServices = {
      adapterUtilities: services.adapterUtilities,
      artifactProvider: services.artifactProvider,
      configuration: services.configuration,
      flowService: services.flowService,
      globalEventBus: services.globalEventBus,
      debugEventBus: services.debugEventBus,
      heartbeat: services.heartbeat,
      log: services.log,
      storage: services.storage,
      tooling: services.tooling,
      // TODO (https://github.com/LaxarJS/laxar/issues/363 and https://github.com/LaxarJS/laxar/issues/397)
      // Fixing the latter issue broke laxar-mocks, since it could no longer access the widget loader.
      // To temporarily fix this, we re-add the widget loader to the exposed services.
      // Nevertheless on the medium /short term we want to be able to load single widgets into the page
      // (the first issue above) and use the api that will be created for this in laxar-mocks.
      widgetLoader: services.widgetLoader
   };

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

   const adaptersByTechnology = {};
   Object.keys( adapterModulesByTechnology ).forEach( technology => {
      const adapterModule = adapterModulesByTechnology[ technology ];
      const artifacts = artifactsByTechnology[ technology ];
      adaptersByTechnology[ technology ] = adapterModule.bootstrap( artifacts, adapterServices );
   } );
   return adaptersByTechnology;
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////////

function announceInstance( services ) {
   const { configuration, log, storage } = services;

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
 *
 * @memberof laxar
 */
function instances( optionalName ) {
   const instances = global.laxarInstances = ( global.laxarInstances || {} );
   return optionalName ? instances[ optionalName ] : instances;
}

/**
 * Provide another instance's debug event bus. This instance is shared across all LaxarJS instances.
 * If there is no other active LaxarJS instance, a new event bus will be created with the creation of
 * the runtime services.
 *
 * @return {EventBus|null}
 *   The debugEventBus service of any other active LaxarJS instance or null, if this is the only instance.
 */
function sharedDebugEventBus() {
   const laxarInstances = instances();

   for( const name in laxarInstances ) {
      if( laxarInstances.hasOwnProperty( name ) && laxarInstances[ name ].debugEventBus ) {
         return laxarInstances[ name ].debugEventBus;
      }
   }
   return null;
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////////

export {
   assert,
   object,
   string,
   instances,
   plainAdapter
};
