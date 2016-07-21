/**
 * Copyright 2016 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */

export const technology = 'plain';

//////////////////////////////////////////////////////////////////////////////////////////////////////////////

// eslint-disable-next-line no-unused-vars
export function bootstrap( modules, services ) {

   const api = {
      create,
      technology
   };

   const widgetModules = {};
   modules.forEach( module => {
      widgetModules[ module.name ] = module;
   } );

   return api;

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   /**
    * Creates a new adapter instance for the given widget environment.
    *
    * @param {Object} environment
    *    the environment for the widget to create and manage
    * @param {HTMLElement} environment.anchorElement
    *    the DOM node where the widgets DOM fragment should be inserted into
    * @param {Object} environment.services
    *    injectable services provided directly by the laxar runtime
    * @param {Object} environment.specification
    *    the full widget specification read from the `widget.json` descriptor
    *
    * @return {Object}
    *    the adapter instance
    */
   function create( environment ) {

      const exports = {
         createController,
         domAttachTo,
         domDetach,
         destroy() {}
      };

      const widgetName = environment.specification.name;
      const moduleName = widgetName.replace( /^./, _ => _.toLowerCase() );
      let controller = null;

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      function createController( config ) {
         const module = widgetModules[ moduleName ];
         const availableInjections = { ...environment.services };
         const injections = ( module.injections || [] ).map( injection => {
            if( !( injection in availableInjections ) ) {
               throw new Error( `Trying to inject unknown service "${injection}".` );
            }
            return availableInjections[ injection ];
         } );

         config.onBeforeControllerCreation( environment, Object.freeze( availableInjections ) );
         controller = module.create( ...injections );
      }

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      function domAttachTo( areaElement, htmlTemplate ) {
         if( htmlTemplate === null ) {
            return;
         }

         environment.anchorElement.innerHTML = htmlTemplate;
         areaElement.appendChild( environment.anchorElement );
         controller.renderTo( environment.anchorElement );
      }

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      function domDetach() {
         const parent = environment.anchorElement.parentNode;
         if( parent ) {
            parent.removeChild( environment.anchorElement );
         }
      }

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      return exports;

   }

}
