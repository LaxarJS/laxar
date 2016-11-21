/**
 * Copyright 2016 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */

export const technology = 'plain';

const noOp = () => {};

//////////////////////////////////////////////////////////////////////////////////////////////////////////////

export function bootstrap( artifacts, { widgetLoader, artifactProvider } ) {

   const { adapterErrors } = widgetLoader;

   return {
      create
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
