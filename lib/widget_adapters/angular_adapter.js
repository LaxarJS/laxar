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

   var controllerNames = {};

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function bootstrap( widgetModules ) {
      var dependencies = ( widgetModules || [] ).map( function( module ) {
         controllerNames[ module.name ] = capitalize( module.name ) + 'Controller';
         supportPreviousNaming( module.name );
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

      var exports = {
         createController: createController,
         domAttachTo: domAttachTo,
         domDetach: domDetach,
         destroy: destroy
      };

      var context = environment.context;
      var scope_;
      var injections_;

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      function createController() {
         var widgetName = environment.specification.name;
         var moduleName = widgetName.replace( /^./, function( _ ) { return _.toLowerCase(); } );
         var controllerName = controllerNames[ moduleName ];

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

      /**
       * Synchronously attach the widget DOM to the given area.
       *
       * @param {HTMLElement} areaElement
       *    The widget area to attach this widget to.
       * @param {String} templateHtml
       *
       */
      function domAttachTo( areaElement, templateHtml ) {
         if( templateHtml === null ) {
            return;
         }

         var element = ng.element( environment.anchorElement );
         element.html( templateHtml );
         areaElement.appendChild( environment.anchorElement );
         $compile( environment.anchorElement )( injections_.$scope );
         templateHtml = null;
      }

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      function domDetach() {
         var parent = environment.anchorElement.parentNode;
         if( parent ) {
            parent.removeChild( environment.anchorElement );
         }
      }

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      function destroy() {
         if( scope_ ) {
            scope_.$destroy();
         }
      }

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      return exports;

   }


   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function capitalize( _ ) {
      return _.replace( /^./, function( _ ) { return _.toUpperCase(); } );
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function supportPreviousNaming( moduleName ) {
      if( moduleName.indexOf( '.' ) === -1 ) {
         return;
      }

      var lookupName = moduleName.replace( /^.*\.([^.]+)$/, function( $_, $1 ) {
         return $1.replace( /_(.)/g, function( $_, $1 ) { return $1.toUpperCase(); } );
      } );
      controllerNames[ lookupName ] = controllerNames[ moduleName ] = moduleName + '.Controller';

      log.warn( 'Deprecation: AngularJS widget module name "' + moduleName + '" violates naming rules! ' +
                'Module should be named "' + lookupName + '". ' +
                'Controller should be named "' + capitalize( lookupName ) + 'Controller".' );
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   return {
      technology: 'angular',
      bootstrap: bootstrap,
      create: create
   };

} );
