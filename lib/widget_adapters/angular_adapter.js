/**
 * Copyright 2014 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
define( [
   'angular',
   'require',
   '../utilities/assert',
   '../logging/log'
], function( ng, require, assert, log ) {
   'use strict';

   var $compile;
   var $controller;
   var $rootScope;

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function bootstrap( widgetModules ) {
      var dependencies = ( widgetModules || [] ).map( function( module ) {
         return module.name;
      } );

      return ng.module( 'axAngularWidgetAdapter', dependencies )
         .run( [ '$compile', '$controller', '$rootScope', function( _$compile_, _$controller_, _$rootScope_ ) {
            $controller = _$controller_;
            $compile = _$compile_;
            $rootScope = _$rootScope_;
         } ] );
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
      var scope_;
      var injections_;
      var hasDom_ = false;
      var assetsPromise_;
      var templateHtml_;

      function createController() {
         var moduleName = environment.specification.name.replace( /^./, function( _ ) { return _.toLowerCase(); } );
         var controllerName = environment.specification.name + 'Controller';
         try {
            ng.module( moduleName );
         }
         catch( error ) {
            // controller not found: try the old style module/controller name (pre LaxarJS/laxar#153)
            var fallbackModuleName = 'widgets.' + context.widget.path.replace( /\//g, '.' );
            controllerName = fallbackModuleName + '.Controller';
            try {
               ng.module( fallbackModuleName );
            }
            catch( fallbackError ) {
               log.error(
                  'AngularAdapter: module for widget [0] is missing! Tried modules: [1], [2]',
                  environment.specification.name, moduleName, fallbackModuleName
               );
               return;
            }
         }

         injections_ = {
            axContext: context,
            axEventBus: context.eventBus
         };
         Object.defineProperty( injections_, '$scope', {
            get: function() {
               if( !scope_ ) {
                  scope_ = $rootScope.$new();
                  ng.extend( scope_, context );
               }

               return scope_;
            }
         } );

         $controller( controllerName, injections_ );
      }

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      function domPrepare() {
         if( !assetsPromise_ ) {
            assetsPromise_ = environment.assetResolver.resolve()
               .then( function( urls ) {
                  urls.cssFileUrls.forEach( function( url ) {
                     environment.assetResolver.loadCss( url );
                  } );
                  if( urls.templateUrl ) {
                     hasDom_ = true;
                     return environment.assetResolver.provide( urls.templateUrl )
                        .then( function( templateHtml ) {
                           templateHtml_ = templateHtml;
                        } );
                  }
               } );
         }
         return assetsPromise_;
      }

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      /**
       * Synchronously attach the widget DOM to the given area.
       *
       * @param {HTMLElement} areaElement
       *    The widget area to attach this widget to.
       */
      function domAttachTo( areaElement ) {
         if( !hasDom_ ) {
            return;
         }
         var element = ng.element( environment.anchorElement );
         element.html( templateHtml_ );
         areaElement.appendChild( environment.anchorElement );
         $compile( environment.anchorElement )( injections_.$scope );
         templateHtml_ = null;
      }

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      function domDetach() {
         if( !hasDom_ ) {
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
         templateHtml_ = null;
         assetsPromise_ = null;
         environment.release();
         if( scope_ ) {
            scope_.$destroy();
         }
      }

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      return {
         createController: createController,
         domPrepare: domPrepare,
         domAttachTo: domAttachTo,
         domDetach: domDetach,
         widgetId: widgetId,
         destroy: destroy
      };
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   return {
      technology: 'angular',
      bootstrap: bootstrap,
      create: create
   };

} );
