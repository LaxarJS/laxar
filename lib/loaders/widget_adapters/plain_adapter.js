/**
 * Copyright 2014 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
define( [
   '../../utilities/assert',
   '../../runtime/module_registry'
], function( assert, moduleRegistry ) {
   'use strict';

   function create( assetResolver, specification, features, widgetConfiguration, anchorElement ) {

      var moduleName = 'widgets.' + widgetConfiguration.widget.replace( /\//g, '.' );

      var controller = null;
      var widgetServices_ = null;
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

      function createController( widgetServices, configuration ) {
         widgetServices_ = widgetServices;

         var module = moduleRegistry.getModule( 'plain', moduleName );
         var injector = createInjector( widgetServices );
         var injections = ( module.injections || [] ).map( function( injection ) {
            return injector.get( injection );
         } );
         assetUrlPromise_ = assetResolver.resolve();

         controller = module.create.apply( module, injections );
      }

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      function domPrepare() {
         if( specification.integration.type === 'activity' ) {
            anchorElement = null;
            return assetUrlPromise_;
         }

         return assetUrlPromise_.then( function( urls ) {
            urls.cssFileUrls.forEach( function( url ) {
               assetResolver.loadCss( url );
            } );
         } );
      }

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      function domAttachTo( areaElement ) {
         if( specification.integration.type === 'activity' ) {
            return;
         }

         areaElement.appendChild( anchorElement );
         controller.renderTo( anchorElement );
      }

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      function domDetach() {
         if( specification.integration.type === 'activity' ) {
            return;
         }

         anchorElement.parentNode.removeChild( anchorElement );
      }

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      function widgetId() {
         return widgetConfiguration.id;
      }

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      function destroy() {
         widgetServices_.release();
      }

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      function createInjector( widgetServices ) {
         var map = {
            axEventBus: widgetServices.eventBus,
            axFeatures: features || {},
            axId: widgetServices.idGenerator,
            axWidget: {
               area: widgetConfiguration.area,
               id: widgetConfiguration.id,
               path: widgetConfiguration.widget
            },
            axTemplate: {
               load: function() {
                  return assetUrlPromise_.then( function( urls ) {
                     return urls.templateUrl ? assetResolver.provide( urls.templateUrl ) : '';
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
      create: create
   };

} );
