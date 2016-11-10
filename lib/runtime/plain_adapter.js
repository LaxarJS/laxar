/**
 * Copyright 2016 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
/**
 * Module for the plain widget adapter factory.
 * In LaxarJS _plain_ widgets are defined as widgets without dependency to a specific view library or
 * framwork, and instead would be implemented using simple DOM access and manipulation.
 *
 * A developer will never call any of the API of this module.
 * The documentation solely exists as a blueprint for custom widget adapters and to explain certain concepts.
 *
 * @module plain_adapter
 */

//
export const technology = 'plain';

const noOp = () => {};

//////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Initializes the adapter module and returns a factory for plain widgets.
 * Note that the plain adapter doesn't need all the provided arguments, but they are listed here for
 * documentation purposes.
 *
 * @param {Object} artifacts
 *
 * @param {Object} artifacts.widgets
 *    asfsf
 * @param {Object} artifacts.controls
 *    asfsf
 * @param {Object} services
 * @param {AdapterUtilities} services.adapterUtilities
 * @param {Configuration} services.configuration
 * @param {EventBus} services.globalEventBus
 * @param {heartbeat} services.heartbeat
 * @param {Log} services.log
 * @param {PageService} services.pageService
 * @param {StorageFactory} services.storage
 * @param {ToolingProviders} services.tooling
 * @param {Object} anchorElement
 *    the DOM node the laxar application is bootstrapped on
 *
 * @return {PlainAdapterFactory}
 *    the factory for plain widget adapters
 */
export function bootstrap( { widgets }, { widgetLoader } ) {

   const { adapterErrors } = widgetLoader;
   const widgetModules = {};
   const activitySet = {};
   widgets.forEach( ({ descriptor, module }) => {
      widgetModules[ descriptor.name ] = module;
      if( descriptor.integration.type === 'activity' ) {
         activitySet[ descriptor.name ] = true;
      }
   } );

   return {
      create,
      technology
   };

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   /**
    * Creates a new adapter instance for the given widget environment.
    *
    * @param {Object} environment
    *    the environment for the widget to create and manage
    * @param {String} environment.name
    *    the name of the widget to load, exactly as specified by the widget descriptor
    * @param {HTMLElement} environment.anchorElement
    *    the DOM node that the widget's DOM fragment should be inserted into
    * @param {Object} environment.services
    *    injectable widget services provided directly by the laxar runtime
    * @param {Function} environment.onBeforeControllerCreation
    *    a function that the adapter must call with a map of all to-be-injected services, just before
    *    creating the controller
    * @param {AdapterErrors} environment.errors
    *    contains factory methods to create specific errors that are often needed by adapters
    *
    * @return {Object}
    *    the adapter instance
    */
   function create( { widgetName, anchorElement, services, onBeforeControllerCreation } ) {

      let onDomAvailable = null;
      let domAttached = false;
      createController();
      return {
         domAttachTo,
         domDetach
      };

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      function createController() {
         // backwards compatibility with old-style AMD widgets:
         const module = widgetModules[ widgetName ].default || widgetModules[ widgetName ];
         if( !module ) {
            throw adapterErrors.unknownWidget( { technology, widgetName } );
         }
         services.axWithDom = callback => {
            if( domAttached ) {
               callback( anchorElement );
            }
         };
         const injections = ( module.injections || [] ).map( injection => {
            if( !( injection in services ) ) {
               throw adapterErrors.unknownInjection( { technology, injection, widgetName } );
            }
            if( injection === 'axWithDom' && activitySet[ widgetName ] ) {
               throw adapterErrors.activityAccessingDom( { technology, injection, widgetName } );
            }
            return services[ injection ];
         } );

         onBeforeControllerCreation( services );
         ( { onDomAvailable = noOp } = module.create( ...injections ) || {} );
      }

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      function domAttachTo( areaElement, htmlTemplate ) {
         if( htmlTemplate === null ) { return; }
         anchorElement.innerHTML = htmlTemplate;
         areaElement.appendChild( anchorElement );
         domAttached = true;
         onDomAvailable( anchorElement );
      }

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      function domDetach() {
         const parent = anchorElement.parentNode;
         if( parent ) {
            parent.removeChild( anchorElement );
         }
         domAttached = false;
      }

   }

}
