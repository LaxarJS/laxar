/**
 * Copyright 2015 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
define( [], function() {
   'use strict';

   var widgetModules = {};

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function bootstrap( modules ) {
      modules.forEach( function( module ) {
         widgetModules[ module.name ] = module;
      } );
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   /**
    *
    * @param {Object}      environment
    * @param {HTMLElement} environment.anchorElement
    * @param {Object}      environment.assetResolver
    * @param {Object}      environment.context
    * @param {EventBus}    environment.context.eventBus
    * @param {Object}      environment.context.features
    * @param {Function}    environment.context.id
    * @param {Object}      environment.context.widget
    * @param {String}      environment.context.widget.area
    * @param {String}      environment.context.widget.id
    * @param {String}      environment.context.widget.path
    * @param {Function}    environment.release
    * @param {Object}      environment.specification
    *
    * @return {Object}
    */
   function create( environment ) {

      var context = environment.context;
      var moduleName = 'widgets.' + context.widget.path.replace( /\//g, '.' );

      var controller = null;
      var assetUrlPromise_ = null;

      var exports = {
         createController: createController,
         domPrepare: domPrepare,
         domAttachTo: domAttachTo,
         domDetach: domDetach,
         widgetId: widgetId,
         destroy: destroy
      };

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      function createController() {
         var module = widgetModules[ moduleName ];
         var injector = createInjector();
         var injections = ( module.injections || [] ).map( function( injection ) {
            return injector.get( injection );
         } );
         assetUrlPromise_ = environment.assetResolver.resolve();

         controller = module.create.apply( module, injections );
      }

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      function domPrepare() {
         if( environment.specification.integration.type === 'activity' ) {
            environment.anchorElement = null;
            return assetUrlPromise_;
         }

         return assetUrlPromise_.then( function( urls ) {
            urls.cssFileUrls.forEach( function( url ) {
               environment.assetResolver.loadCss( url );
            } );
         } );
      }

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      function domAttachTo( areaElement ) {
         if( environment.specification.integration.type === 'activity' ) {
            return;
         }

         areaElement.appendChild( environment.anchorElement );
         controller.renderTo( environment.anchorElement );
      }

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      function domDetach() {
         if( environment.specification.integration.type === 'activity' ) {
            return;
         }

         environment.anchorElement.parentNode.removeChild( environment.anchorElement );
      }

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      function widgetId() {
         return context.widget.id;
      }

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      function destroy() {
         environment.release();
      }

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      function createInjector() {
         var map = {
            axContext: context,
            axEventBus: context.eventBus,
            axFeatures: context.features || {},
            axId: context.id,
            axWidget: context.widget,
            axTemplate: {
               load: function() {
                  return assetUrlPromise_.then( function( urls ) {
                     return urls.templateUrl ? environment.assetResolver.provide( urls.templateUrl ) : '';
                  } );
               }
            }
         };

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         return {
            get: function( name ) {
               if( !( name in map ) ) {
                  throw new Error( 'Unknown dependency "' + name + '".' );
               }

               return map[ name ];
            }
         };
      }

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      return exports;

   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   return {
      technology: 'plain',
      bootstrap: bootstrap,
      create: create
   };

} );
