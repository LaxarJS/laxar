/**
 * Copyright 2015 aixigo AG
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
         // for lookup, use a normalized module name that can also be derived from the widget.json name:
         var moduleKey = normalize( module.name );
         controllerNames[ moduleKey ] = capitalize( module.name ) + 'Controller';

         // add an additional lookup entry for deprecated "my.category.MyWidget" style module names:
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
    * @param {Object}      services
    *
    * @return {Object}
    */
   function create( environment, services ) {

      // services are not relevant for now, since all LaxarJS services are already available via AngularJS DI.

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

      function createController( config ) {
         var moduleKey = normalize( environment.specification.name );
         var controllerName = controllerNames[ moduleKey ];

         injections_ = {
            axContext: context,
            axEventBus: context.eventBus,
            axFeatures: context.features || {}
         };
         Object.defineProperty( injections_, '$scope', {
            enumerable: true,
            get: function() {
               if( !scope_ ) {
                  scope_ = $rootScope.$new();
                  ng.extend( scope_, context );
               }
               return scope_;
            }
         } );

         config.onBeforeControllerCreation( environment, injections_ );
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

   function normalize( moduleName ) {
      return moduleName.replace( /([a-zA-Z0-9])[-_]([a-zA-Z0-9])/g, function( $_, $1, $2 ) {
         return $1 + $2.toUpperCase();
      } ).replace( /^[A-Z]/, function( $_ ) {
         return $_.toLowerCase();
      } );
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

   function applyViewChanges() {
      $rootScope.$apply();
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   return {
      applyViewChanges: applyViewChanges,
      technology: 'angular',
      bootstrap: bootstrap,
      create: create
   };

} );
