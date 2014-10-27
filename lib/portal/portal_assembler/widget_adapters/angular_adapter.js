/**
 * Copyright 2014 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
define( [
   'angular',
   'require',
   '../../../utilities/assert',
   '../../../utilities/path',
   '../../paths'
], function( ng, require, assert, path, paths ) {
   'use strict';

   var module = ng.module( 'laxar.portal.angular_adapter', [] );

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   var $compile;
   var $controller;
   var themeManager;
   var cssLoader;
   module.run( [
      '$compile', '$controller', 'ThemeManager', 'CssLoader',
      function( _$compile_, _$controller_, _themeManager_, _cssLoader_ ) {
         $controller = _$controller_;
         $compile = _$compile_;
         themeManager = _themeManager_;
         cssLoader = _cssLoader_;
      }
   ] );

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function create( q, fileResourceProvider, specification, features, widgetConfiguration, anchorElement ) {
      assert( q ).isNotNull();
      assert( fileResourceProvider ).hasType( Object ).isNotNull();
      assert( specification ).hasType( Object ).isNotNull();
      assert( features ).hasType( Object ).isNotNull();
      assert( widgetConfiguration ).hasType( Object ).isNotNull();
      assert( anchorElement ).isNotNull();

      var scope_;
      var widgetServices_;
      var hasDom_ = false;
      var domPrepare_;

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
         $controller( controllerName, { '$scope': scope_ } );
      }

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      function domPrepare() {
         if( !domPrepare_ ) {
            domPrepare_ = resolveAssets( q, widgetConfiguration, specification )
               .then( function( urls ) {
                  urls.cssFileUrls.forEach( function( url ) {
                     cssLoader.load( url );
                  } );
                  if( urls.templateUrl ) {
                     hasDom_ = true;
                     return fileResourceProvider.provide( urls.templateUrl )
                        .then( function( templateHtml ) {
                           var element = ng.element( anchorElement );
                           element.html( templateHtml );
                        } );
                  }
               } );
         }
         return domPrepare_;
      }

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      /**
       * @param {HTMLElement} areaElement
       *    The widget area to attach this widget to.
       */
      function domAttachTo( areaElement ) {
         if( !hasDom_ ) {
            return;
         }
         areaElement.appendChild( anchorElement );
         $compile( anchorElement )( scope_ );
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
         domPrepare_ = null;
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

   function resolveAssets( q, widgetConfiguration, widgetSpecification ) {
      var technicalName = widgetConfiguration.widget.split( '/' ).pop();
      var widgetPath = path.join( paths.WIDGETS, widgetConfiguration.widget );
      var htmlFile = technicalName + '.html';
      var cssFile = path.join( 'css/', technicalName + '.css' );

      var promises = [];
      promises.push( themeManager.urlProvider(
         path.join( paths.THEMES, '[theme]', 'widgets', widgetConfiguration.widget ),
         path.join( widgetPath, '[theme]' )
      ).provide( [ htmlFile, cssFile ] ) );

      promises = promises.concat( ( widgetSpecification.controls || [] ).map( function( controlReference ) {
         var name = controlReference.split( '/' ).pop();
         return themeManager.urlProvider(
            path.join( paths.THEMES, '[theme]', controlReference ),
            path.join( require.toUrl( controlReference ), '[theme]' )
         ).provide( [ path.join( 'css/', name + '.css' ) ] );
      } ) );

      return q.all( promises )
         .then( function( results ) {
            var widgetUrls = results[ 0 ];
            var cssUrls = results.slice( 1 )
               .map( function( urls ) { return urls[ 0 ]; } )
               .concat( widgetUrls.slice( 1 ) )
               .filter( function( url ) { return !!url; } );

            return {
               templateUrl: widgetUrls[0] || '',
               cssFileUrls: cssUrls
            };
         } );
   }


   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   return {
      create: create,
      module: module
   };

} );