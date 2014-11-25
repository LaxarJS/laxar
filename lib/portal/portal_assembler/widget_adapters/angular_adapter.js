/**
 * Copyright 2014 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
define( [
   'angular',
   'require',
   '../../../utilities/assert'
], function( ng, require, assert ) {
   'use strict';

   var module = ng.module( 'laxar.portal.angular_adapter', [] );

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   var $compile;
   var $controller;
   module.run( [ '$compile', '$controller', function( _$compile_, _$controller_ ) {
      $controller = _$controller_;
      $compile = _$compile_;
   } ] );

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function create( assetResolver, specification, features, widgetConfiguration, anchorElement ) {

      assert( assetResolver ).hasType( Object ).isNotNull();
      assert( specification ).hasType( Object ).isNotNull();
      assert( features ).hasType( Object ).isNotNull();
      assert( widgetConfiguration ).hasType( Object ).isNotNull();
      assert( anchorElement ).isNotNull();

      var scope_;
      var widgetServices_;
      var hasDom_ = false;
      var assetsPromise_;
      var templateHtml_;

      function createController( widgetServices, configuration ) {
         assert( widgetServices ).hasType( Object ).isNotNull();
         assert( widgetServices.eventBus ).hasType( Object ).isNotNull();
         assert( widgetServices.idGenerator ).hasType( Function ).isNotNull();
         assert( configuration ).hasType( Object ).isNotNull();

         widgetServices_ = widgetServices;

         scope_ = configuration.anchorScope.$new();
         scope_.eventBus = widgetServices.eventBus;
         scope_.id = widgetServices.idGenerator;
         scope_.widget = {
            area: widgetConfiguration.area,
            id: widgetConfiguration.id,
            path: widgetConfiguration.widget
         };
         scope_.features = features;

         var controllerName = 'widgets.' + widgetConfiguration.widget.replace( /\//g, '.' ) + '.Controller';
         $controller( controllerName, { '$scope': scope_, 'axEventBus': widgetServices.eventBus } );
      }

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      function domPrepare() {
         if( !assetsPromise_ ) {
            assetsPromise_ = assetResolver.resolve()
               .then( function( urls ) {
                  urls.cssFileUrls.forEach( function( url ) {
                     assetResolver.loadCss( url );
                  } );
                  if( urls.templateUrl ) {
                     hasDom_ = true;
                     return assetResolver.provide( urls.templateUrl )
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
         var element = ng.element( anchorElement );
         element.html( templateHtml_ );
         areaElement.appendChild( anchorElement );
         $compile( anchorElement )( scope_ );
         templateHtml_ = null;
      }

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      function domDetach() {
         if( !hasDom_ ) {
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
         templateHtml_ = null;
         assetsPromise_ = null;
         widgetServices_.release();
         scope_.$destroy();
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
      create: create,
      module: module
   };

} );
