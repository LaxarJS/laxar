/**
 * Copyright 2016 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */

export const technology = 'plain';

//////////////////////////////////////////////////////////////////////////////////////////////////////////////

export function bootstrap( modules, services ) {
   const api = {
      create,
      technology,
      applyViewChanges() {}
   };

   const laxarServices = services;
   const widgetModules = {};
   modules.forEach( module => {
      widgetModules[ module.name ] = module;
   } );
   return api;

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   /**
    *
    * @param {Object}      environment
    * @param {HTMLElement} environment.anchorElement
    * @param {Object}      environment.context
    * @param {EventBus}    environment.context.eventBus
    * @param {Object}      environment.context.features
    * @param {Function}    environment.context.id
    * @param {Object}      environment.context.widget
    * @param {String}      environment.context.widget.area
    * @param {String}      environment.context.widget.id
    * @param {String}      environment.context.widget.path
    * @param {Object}      environment.specification
    *
    * @return {Object}
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
      const context = environment.context;
      let controller = null;

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      function createController( config ) {
         const module = widgetModules[ moduleName ];
         const availableInjections = {
            axContext: context,
            axEventBus: context.eventBus,
            axFeatures: context.features || {},
            axFlowService: laxarServices.flowService,
            axConfiguration: laxarServices.configuration,
            axGlobalEventBus: laxarServices.globalEventBus,
            axGlobalLog: laxarServices.log
         };
         const injections = ( module.injections || [] ).map( injection => {
            if( !( injection in availableInjections ) ) {
               throw new Error( `Trying to inject unknown service "${injection}".` );
            }
            return availableInjections[ injection ];
         } );

         config.onBeforeControllerCreation( environment, Object.freeze( availableInjections ) );
         controller = module.create.apply( module, injections );
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
