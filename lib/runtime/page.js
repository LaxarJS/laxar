/**
 * Copyright 2016 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
import { codeIsUnreachable } from '../utilities/assert';
import ng from 'angular';
import * as pageLoader from '../loaders/page_loader';
import * as widgetLoader from '../loaders/widget_loader';
import * as paths from '../loaders/paths';
import * as layoutWidgetAdapter from './layout_widget_adapter';
import * as flowModule from './flow';
import { create as createAreaHelper, findWidgetAreas } from './area_helper';
import { create as createLocaleEventManager } from './locale_event_manager';
import { create as createVisibilityEventManager } from './visibility_event_manager';
import pageTooling from '../tooling/pages';

const module = ng.module( 'axPage', [ flowModule.name ] );

/** Delay between sending didLifeCycle and attaching widget templates. */
const WIDGET_ATTACH_DELAY_MS = 5;

///////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Mediates between the AxFlowController which has no ties to the DOM and the stateful AxPageController
 */
module.service( 'axPageService', [ function() {

   let pageController;

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
      controllerForScope: function( /*scope*/ ) {
         return pageController;
      }
   };

} ] );

///////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Manages widget adapters and their DOM for the current page
 */
( function() {

   const pageControllerDependencies = [ '$scope', '$q', '$timeout', 'axPageService'];

   const axServiceDependencies = [
      'axConfiguration',
      'axControls',
      'axCssLoader',
      'axFileResourceProvider',
      'axFlowService',
      'axGlobalEventBus',
      'axHeartbeat',
      'axLayoutLoader',
      'axThemeManager'
   ];

   const createPageControllerInjected = pageControllerDependencies
      .concat( axServiceDependencies )
      .concat( function( $scope, $q, $timeout, pageService ) {

         const axServices = {};
         const injections = [].slice.call( arguments );
         axServiceDependencies.forEach( function( name, index ) {
            axServices[ name ] = injections[ pageControllerDependencies.length + index ];
         } );

         const configuration = axServices.axConfiguration;
         const layoutLoader = axServices.axLayoutLoader;
         const eventBus = axServices.axGlobalEventBus;
         const fileResourceProvider = axServices.axFileResourceProvider;
         const themeManager = axServices.axThemeManager;

         const self = this;
         const pageLoader_ = pageLoader.create( $q, paths.PAGES, fileResourceProvider );

         let areaHelper_;
         let widgetAdapters_ = [];
         let viewChangeApplyFunctions_ = [];

         const theme = themeManager.getTheme();
         const localeManager = createLocaleEventManager( $q, eventBus, configuration );
         const visibilityManager = createVisibilityEventManager( $q, eventBus );
         const lifecycleEvent = { lifecycleId: 'default' };
         const senderOptions = { sender: 'AxPageController' };

         let renderLayout = function( layoutInfo ) {
            codeIsUnreachable( 'No renderer for page layout ' + layoutInfo.className );
         };

         const cleanup = pageService.registerPageController( this );
         $scope.$on( '$destroy', cleanup );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         function widgetsForPage( page ) {
            const widgets = [];
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
            const widgetLoader_ = widgetLoader.create( $q, axServices );

            const layoutDeferred = $q.defer();
            const pagePromise = pageLoader_.loadPage( pageName )
               .then( function( page ) {
                  areaHelper_ = createAreaHelper( $q, page );
                  visibilityManager.setAreaHelper( areaHelper_ );
                  self.areas = areaHelper_;
                  layoutLoader.load( page.layout ).then( layoutDeferred.resolve );

                  localeManager.subscribe();
                  // instantiate controllers
                  const widgets = widgetsForPage( page );
                  return $q.all( widgets.map( function( widget ) {
                     if( 'layout' in widget ) {
                        return createLayoutWidgetAdapter( widget );
                     }

                     return widgetLoader_.load( widget );
                  } ) );
               } )
               .then( function( widgetAdapters ) {
                  pageTooling.setCurrentPage( pageName );
                  widgetAdapters.forEach( function( adapter ) {
                     if( typeof adapter.applyViewChanges === 'function' &&
                         viewChangeApplyFunctions_.indexOf( adapter.applyViewChanges ) === -1 ) {
                        viewChangeApplyFunctions_.push( adapter.applyViewChanges );
                     }
                  } );
                  widgetAdapters_ = widgetAdapters;
               } )
               .then( localeManager.initialize )
               .then( publishTheme )
               .then( beginLifecycle )
               .then( visibilityManager.initialize );

            const layoutReady = layoutDeferred.promise.then( function( result ) {
               // function wrapper is necessary here to dereference `renderlayout` _after_ the layout is ready
               renderLayout( result );
            } );

            // Give the widgets (a little) time to settle on the event bus before $digesting and painting:
            const widgetsInitialized = pagePromise.then( function() {
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
                  widgetAdapters_.forEach( function( adapterRef ) {
                     adapterRef.destroy();
                  } );
                  widgetAdapters_ = [];
                  viewChangeApplyFunctions_ = [];
               } );
         }

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         function registerLayoutRenderer( render ) {
            renderLayout = render;
         }

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         function createLayoutWidgetAdapter( widget ) {
            return layoutLoader.load( widget.layout )
               .then( function( layout ) {
                  const adapter = layoutWidgetAdapter.create( pageService, layout, {
                     area: widget.area,
                     id: widget.id,
                     path: widget.layout
                  } );

                  return {
                     id: widget.id,
                     adapter: adapter,
                     destroy: adapter.destroy,
                     templatePromise: $q.when( layout.htmlContent )
                  };
               } );
         }

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         function applyViewChanges() {
            viewChangeApplyFunctions_.forEach( function( applyFunction ) {
               applyFunction();
            } );
            // TODO only temporary while we depend on an AngularJS $digest cycle to happen. Must be removed
            // prior to v2.0.0. See https://github.com/LaxarJS/laxar/issues/216
            $scope.$root.$apply();
         }

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         this.applyViewChanges = applyViewChanges;
         this.setupPage = setupPage;
         this.tearDownPage = tearDownPage;
         this.registerLayoutRenderer = registerLayoutRenderer;
      } );

   module.controller( 'AxPageController', createPageControllerInjected );

} )();

///////////////////////////////////////////////////////////////////////////////////////////////////////////

module.directive( 'axPage', [ () => {

   const defaultAreas = [
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
      link: ( scope, element, attrs, controller ) => {

         controller.registerLayoutRenderer( layoutInfo => {
            const areasController = controller.areas;

            scope.layoutClass = layoutInfo.className;
            element.html( layoutInfo.htmlContent );

            const areas = findWidgetAreas( element[ 0 ] );
            const deregisterFuncs = Object.keys( areas )
               .map( areaName => areasController.register( areaName, areas[ areaName ] ) );

            defaultAreas.forEach( area => {
               if( areasController.exists( area.name ) ) {
                  return;
               }

               const node = document.createElement( 'div' );
               // We only set the attribute here for debugging purposes
               node.setAttribute( 'ax-widget-area', area.name );
               if( area.hidden ) {
                  node.style.display = 'none';
               }
               deregisterFuncs.push( areasController.register( area.name, node ) );
               element.append( node );
            } );

            const deregister = () => deregisterFuncs.forEach( func => func() );

            scope.$on( '$destroy', deregister );
         } );

      }
   };

} ] );

///////////////////////////////////////////////////////////////////////////////////////////////////////////

export const name = module.name;
export default module;
