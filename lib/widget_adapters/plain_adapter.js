/**
 * Copyright 2015 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
var widgetModules = {};

export const technology = 'plain';

///////////////////////////////////////////////////////////////////////////////////////////////////////////

export function bootstrap( modules ) {
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
 * @param {Object}      services
 *
 * @return {Object}
 */
export function create( environment, services ) {

   var exports = {
      createController: createController,
      domAttachTo: domAttachTo,
      domDetach: domDetach,
      destroy: function() {}
   };

   var widgetName = environment.specification.name;
   var moduleName = widgetName.replace( /^./, function( _ ) { return _.toLowerCase(); } );
   var context = environment.context;
   var controller = null;

   ////////////////////////////////////////////////////////////////////////////////////////////////////////

   function createController( config ) {
      var module = widgetModules[ moduleName ];
      var injector = createInjector();
      var injections = ( module.injections || [] ).map( function( injection ) {
         return injector.get( injection );
      } );

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
      var parent = environment.anchorElement.parentNode;
      if( parent ) {
         parent.removeChild( environment.anchorElement );
      }
   }

   ////////////////////////////////////////////////////////////////////////////////////////////////////////

   function createInjector() {
      var map = {
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

            if( name in services ) {
               return services[ name ];
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
