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
      technology,
      applyViewChanges() {}
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
    * @param {Object} environment.context
    *    the context with instance state for the widget
    * @param {EventBus} environment.context.eventBus
    *    an event bus instance specifically decorated for the widget instance
    * @param {Object} environment.context.features
    *    the resolved features for the widget instance. Defaults for missing properties where already filled
    *    in from the widget feature descriptor
    * @param {Function} environment.context.id
    *    a function to create uniwue ids for this widget. It expects an id string that is unique within the
    *    DOM fragment of the widget and returns an id that is unique within the DOM tree of the application
    * @param {Object} environment.context.widget
    *    an object with information about the widget
    * @param {String} environment.context.widget.area
    *    the area the widget instance is located in
    * @param {String} environment.context.widget.id
    *    the id of the widget instance
    * @param {String} environment.context.widget.path
    *    the path to the widget's assets
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
