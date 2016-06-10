/**
 * Copyright 2016 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
let laxarServices;

const widgetModules = {};

export const technology = 'plain';

///////////////////////////////////////////////////////////////////////////////////////////////////////////

export function bootstrap( modules, services ) {
   laxarServices = services;
   modules.forEach( function( module ) {
      widgetModules[ module.name ] = module;
   } );
}

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
export function create( environment ) {

   const exports = {
      createController: createController,
      domAttachTo: domAttachTo,
      domDetach: domDetach,
      destroy: function() {}
   };

   const widgetName = environment.specification.name;
   const moduleName = widgetName.replace( /^./, function( _ ) { return _.toLowerCase(); } );
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
         axGlobalEventBus: laxarServices.globalEventBus
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

///////////////////////////////////////////////////////////////////////////////////////////////////////////

export function applyViewChanges() {
   // no-op
}
