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
      const injector = createInjector();
      const injections = ( module.injections || [] ).map( injection => injector.get( injection ) );

      config.onBeforeControllerCreation( environment, injector.get() );
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

   function createInjector() {
      const map = {
         axContext: context,
         axEventBus: context.eventBus,
         axFeatures: context.features || {}
      };

      /////////////////////////////////////////////////////////////////////////////////////////////////////

      return {
         get: function( name ) {
            if( arguments.length === 0 ) {
               return map;
            }

            if( name in map ) {
               return map[ name ];
            }

            if( name in laxarServices ) {
               return laxarServices[ name ];
            }

            throw new Error( 'Unknown dependency "' + name + '".' );
         }
      };
   }

   ////////////////////////////////////////////////////////////////////////////////////////////////////////

   return exports;

}

///////////////////////////////////////////////////////////////////////////////////////////////////////////

export function applyViewChanges() {
   // no-op
}
