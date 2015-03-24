/**
 * Copyright 2014 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
define( [
   'angular',
   '../../utilities/assert',
   '../../directives/layout/layout',
   '../portal_assembler/page_loader',
   '../portal_assembler/widget_loader',
   '../paths',
   './area_helper',
   './locale_event_manager',
   './visibility_event_manager'
], function( ng, assert, layoutModule, pageLoader, widgetLoader, paths, createAreaHelper, createLocaleEventManager, createVisibilityEventManager ) {
   'use strict';

   var module = ng.module( 'axPage', [ layoutModule.name ] );

   /** Delay between sending didLifeCycle and attaching widget templates. */
   var WIDGET_ATTACH_DELAY_MS = 5;

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   /**
    * Mediates between the AxFlowController which has no ties to the DOM and the stateful AxPageController
    */
   module.service( 'axPageService', [ function() {

      var pageController;

      return {
         controller: function() {
            return pageController;
         },
         registerPageController: function( controller ) {
            pageController = controller;
            return function() {
               pageController = null;
            };
         },
         controllerForScope: function( scope ) {
            return pageController;
         }
      };

   } ] );

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   /**
    * Manages widget adapters and their DOM for the current page
    */
   module.controller( 'AxPageController', [
      '$scope', '$q', '$timeout', 'axPageService', 'axVisibilityService', 'axConfiguration', 'axCssLoader', 'axLayoutLoader', 'axGlobalEventBus', 'axFileResourceProvider', 'axThemeManager',
      function( $scope, $q, $timeout , pageService, visibilityService, configuration, cssLoader, layoutLoader, eventBus, fileResourceProvider, themeManager ) {

         var self = this;
         var pageLoader_ = pageLoader.create( $q, null, paths.PAGES, fileResourceProvider );

         var areaHelper_;
         var widgetAdapters_ = [];

         var theme = themeManager.getTheme();
         var localeManager = createLocaleEventManager( $q, eventBus, configuration );
         var visibilityManager = createVisibilityEventManager( $q, eventBus );
         var lifecycleEvent = { lifecycleId: 'default' };
         var senderOptions = { sender: 'AxPageController' };

         var renderLayout = function( layoutInfo ) {
            assert.codeIsUnreachable( 'No renderer for page layout ' + layoutInfo.className );
         };

         var cleanup = pageService.registerPageController( this );
         $scope.$on( '$destroy', cleanup );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         function widgetsForPage( page ) {
            var widgets = [];
            ng.forEach( page.areas, function( area, areaName ) {
               area.forEach( function( widget ) {
                  widget.area = areaName;
                  widgets.push( widget );
               } );
            } );
            return widgets;
         }

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         function beginLifecycle() {
            return eventBus.publishAndGatherReplies(
               'beginLifecycleRequest.default',
               lifecycleEvent,
               senderOptions );
         }

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         function publishTheme() {
            return eventBus.publish( 'didChangeTheme.' + theme, { theme: theme }, senderOptions );
         }

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         /**
          * Instantiate all widget controllers on this page, and then load their UI.
          *
          * @return {Promise}
          *    A promise that is resolved when all controllers have been instantiated, and when the initial
          *    events have been sent.
          */
         function setupPage( pageName ) {
            var widgetLoader_ = widgetLoader
               .create( $q, fileResourceProvider, themeManager, cssLoader, eventBus, {
                  anchorScope: $scope
               } );

            var layoutDeferred = $q.defer();
            var pagePromise = pageLoader_.loadPage( pageName )
               .then( function( page ) {
                  areaHelper_ = createAreaHelper( $q, page, visibilityService );
                  visibilityManager.setAreaHelper( areaHelper_ );
                  self.areas = areaHelper_;
                  layoutLoader.load( page.layout ).then( layoutDeferred.resolve );

                  localeManager.subscribe();
                  // instantiate controllers
                  var widgets = widgetsForPage( page );
                  return $q.all( widgets.map( function( widget ) {
                     return widgetLoader_.load( widget );
                  } ) );
               } )
               .then( function( widgetAdapters ) {
                  widgetAdapters_ = widgetAdapters;
                  // start preloading all widget assets now
                  widgetAdapters.forEach( function( adapter ) { adapter.domPrepare(); } );
               } )
               .then( localeManager.initialize )
               .then( publishTheme )
               .then( beginLifecycle )
               .then( visibilityManager.initialize );

            var layoutReady = layoutDeferred.promise.then( function( result ) {
               // function wrapper is necessary here to dereference `renderlayout` _after_ the layout is ready
               renderLayout( result );
            } );

            // Give the widgets (a little) time to settle on the event bus before $digesting and painting:
            var widgetsInitialized = pagePromise.then( function() {
               return $timeout( function(){}, WIDGET_ATTACH_DELAY_MS, false );
            } );

            return $q.all( [ layoutReady, widgetsInitialized ] )
               .then( function() {
                  areaHelper_.attachWidgets( widgetAdapters_ );
               } );
         }

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         function tearDownPage() {
            visibilityManager.unsubscribe();
            localeManager.unsubscribe();

            return eventBus
               .publishAndGatherReplies( 'endLifecycleRequest.default', lifecycleEvent, senderOptions )
               .then( function() {
                  widgetAdapters_.forEach( function( adapter ) {
                     adapter.destroy();
                  } );
                  widgetAdapters_ = [];
               } );
         }

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         function registerLayoutRenderer( render ) {
            renderLayout = render;
         }

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         this.setupPage = setupPage;
         this.tearDownPage = tearDownPage;
         this.registerLayoutRenderer = registerLayoutRenderer;
      }

   ] );

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   module.directive( 'axPage', [ '$compile', function( $compile ) {

      var defaultAreas = [
         { name: 'activities', hidden: true },
         { name: 'popups' },
         { name: 'popovers' }
      ];

      return {
         restrict: 'A',
         template: '<div data-ng-class="layoutClass"></div>',
         replace: true,
         scope: true,
         controller: 'AxPageController',
         link: function( scope, element, attrs, controller ) {

            controller.registerLayoutRenderer( function( layoutInfo ) {
               scope.layoutClass = layoutInfo.className;
               element.html( layoutInfo.htmlContent );
               $compile( element.contents() )( scope );

               var defaultAreaHtml = defaultAreas.reduce( function( html, area ) {
                  if( !controller.areas.exists( area.name ) ) {
                     return html + '<div data-ax-widget-area="' + area.name + '"' +
                            ( area.hidden ? ' style="display: none;"' : '' ) + '></div>';
                  }
                  return html;
               }, '' );

               if( defaultAreaHtml ) {
                  element.append( $compile( defaultAreaHtml )( scope ) );
               }
            } );

         }
      };

   } ] );

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   return module;

} );
