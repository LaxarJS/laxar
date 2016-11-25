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

export const technology = 'plain';

const noOp = () => {};

//////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Initializes the adapter module and returns a factory for plain widgets.
 * Note that the plain adapter doesn't need all the provided arguments, but they are listed here for
 * documentation purposes.
 *
 * @param {Object} artifacts
 *    the artifacts available to this adapter factory
 * @param {Object} artifacts.widgets
 *    all widgets, that are implemented in the adapter's technology
 * @param {Object} artifacts.controls
 *    all controls, that are implemented in the adapter's technology
 * @param {Object} services
 *    a selection of services adapter implementations may need to fulfill their task
 * @param {AdapterUtilities} services.adapterUtilities
 *    common utilities, that may be useful to a widget adapter
 * @param {ArtifactProvider} services.artifactProvider
 *    the artifact provider instance
 * @param {Configuration} services.configuration
 *    access to the application configuration
 * @param {EventBus} services.globalEventBus
 *    the global event bus.
 *    Note that an adapter should not sent any events by itself.
 *    It may instead be necessary that the adapter makes the event bus globally available to its widgets (for
 *    example like the AngularJS 1.x adapter), or that it registers an inspector
 * @param {Heartbeat} services.heartbeat
 *    the heartbeat instance.
 *    Depending on the underlying view technology (like AngularJS 1.x) it may be important to get notified
 *    when to re-render the user interface.
 *    For that reason an adapter can register a callback at the heartbeat, that gets called after all events
 *    of the current cycle were processed
 * @param {Log} services.log
 *    the global log instance
 * @param {StorageFactory} services.storage
 *    the global storage factory api
 * @param {Tooling} services.tooling
 *    access to the tooling api
 * @param {HTMLElement} anchorElement
 *    the DOM node the laxar application is bootstrapped on.
 *    An adapter should never try to access DOM nodes that are not the `anchorElement` or any of its children,
 *    since they are not under control of this LaxarJS application.
 *
 * @return {PlainAdapterFactory}
 *    the factory for plain widget adapters
 */
export function bootstrap( artifacts, { widgetLoader, artifactProvider } ) {

   const { adapterErrors } = widgetLoader;

   /**
    * A factory for plain widget adapters.
    *
    * @constructor
    * @name PlainAdapterFactory
    */
   return {
      create,
      /**
       * TODO remove: https://github.com/LaxarJS/laxar/issues/396
       */
      technology
   };

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   /**
    * Creates a new adapter instance for the given widget environment.
    *
    * @param {Object} environment
    *    the environment for the widget to create and manage
    * @param {HTMLElement} environment.anchorElement
    *    the DOM node that the widget's DOM fragment should be inserted into
    * @param {String} environment.name
    *    the name of the widget to load, exactly as specified by the widget descriptor
    * @param {widget_services} environment.services
    *    the services for this widget instance
    * @param {Function} environment.onBeforeControllerCreation
    *    a function that the adapter must call with a map of all to-be-injected services, just before
    *    creating the controller
    *
    * @return {Object}
    *    the adapter instance
    *
    * @memberof PlainAdapterFactory
    */
   function create( { widgetName, anchorElement, services, onBeforeControllerCreation } ) {

      let onDomAvailable = null;
      let domAttached = false;

      const provider = artifactProvider.forWidget( widgetName );

      return Promise.all( [ provider.descriptor(), provider.module() ] )
         .then( createController, () => adapterErrors.unknownWidget( { technology, widgetName } ) )
         .then( () => ( {
            domAttachTo,
            domDetach
         } ) );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      function createController( [ descriptor, module ] ) {
         services.axWithDom = callback => {
            if( domAttached ) {
               callback( anchorElement );
            }
         };
         const injections = ( module.injections || [] ).map( injection => {
            if( !( injection in services ) ) {
               throw adapterErrors.unknownInjection( { technology, injection, widgetName } );
            }
            if( injection === 'axWithDom' && descriptor.integration.type === 'activity' ) {
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
