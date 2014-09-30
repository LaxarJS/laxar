/**
 * Copyright 2014 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
define( [
   'angular',
   'jquery',
   '../../utilities/assert',
   '../../utilities/storage',
   '../../utilities/object',
   '../../logging/log',
   '../../directives/layout/layout',
   '../portal_assembler/page_loader',
   '../portal_assembler/widget_loader',
   '../paths'
], function( ng, $, assert, storage, object, log, layoutModule, pageLoader, widgetLoaderModule, paths ) {
   'use strict';

   var module = ng.module( 'laxar.portal.page', [ layoutModule.name ] );

   var PAGE_CONTROLLER_NAME = 'axPageController';
   var PAGE_SERVICE_NAME = 'axPageService';

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   /**
    * Mediates between the FlowController which has no ties to the DOM and the stateful PageController
    */
   module.service( PAGE_SERVICE_NAME, [ function() {

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
   module.controller( PAGE_CONTROLLER_NAME, [
      '$scope', PAGE_SERVICE_NAME, 'axVisibilityService', '$q', 'Configuration', 'LayoutLoader', 'EventBus', 'FileResourceProvider', 'ThemeManager', '$timeout',
      function( $scope, pageService, visibilityService, $q, configuration, layoutLoader, eventBus, fileResourceProvider, themeManager, $timeout ) {

         var self = this;
         var pageLoader_ = pageLoader.create( $q, null, paths.PAGES, fileResourceProvider );

         var areaHelper_;
         var widgetAdapters_ = [];

         var theme = themeManager.getTheme();
         var localeManager = createLocaleEventManager();
         var visibilityManager = createVisibilityEventManager();
         var lifecycleEvent = { lifecycleId: 'default' };
         var senderOptions = { sender: PAGE_CONTROLLER_NAME };
         var subscriberOptions = { subscriber: PAGE_CONTROLLER_NAME };

         var renderLayout = function( layoutInfo ) {
            assert.codeIsUnreachable( 'No renderer for page layout ' + layoutInfo.className );
         };

         var cleanup = pageService.registerPageController( this );
         $scope.$on( '$destroy', cleanup );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         function widgetsForPage( page ) {
            var widgets = [];
            object.forEach( page.areas, function( area, areaName ) {
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
            var widgetLoader_ = widgetLoaderModule.create( $q, fileResourceProvider, eventBus, {
               theme: themeManager.getTheme(),
               anchorScope: $scope
            } );

            var layoutDeferred = $q.defer();
            var pagePromise = pageLoader_.loadPage( pageName )
               .then( function( page ) {
                  areaHelper_ = createAreaHelper( $q, page, visibilityService );
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
               return $timeout( function(){}, 5, false );
            } );

            $q.all( [ layoutReady, widgetsInitialized ] )
               .then( function() {
                  areaHelper_.attachWidgets( widgetAdapters_ );
               } );

            return pagePromise;
         }

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         function tearDownPage() {
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

         /**
          * The LocaleManager initializes the locale(s) and implements changes to them.
          *
          * Before publishing the state of all configured locales, it listens to change requests, allowing
          * widgets and activities (such as a LocaleSwitcherWidget) to influence the state of locales before
          * the navigation is complete.
          */
         function createLocaleEventManager() {
            // DEPRECATION: the key 'locales' has been deprecated in favor of 'i18n.locales'
            var configLocales_ = configuration.get( 'i18n.locales', configuration.get( 'locales', {} ) );
            var i18n;
            var initialized;

            //////////////////////////////////////////////////////////////////////////////////////////////////

            function handleRequest( event ) {
               i18n[ event.locale ] = event.languageTag;
               if( initialized ) {
                  publish( event.locale );
               }
            }

            //////////////////////////////////////////////////////////////////////////////////////////////////

            function publish( locale ) {
               var event = { locale: locale, languageTag: i18n[ locale ] };
               return eventBus.publish( 'didChangeLocale.' + locale, event, senderOptions );
            }

            //////////////////////////////////////////////////////////////////////////////////////////////////

            function initialize() {
               initialized = true;
               return $q.all( Object.keys( configLocales_ ).map( publish ) );
            }

            //////////////////////////////////////////////////////////////////////////////////////////////////

            function unsubscribe() {
               eventBus.unsubscribe( handleRequest );
            }

            //////////////////////////////////////////////////////////////////////////////////////////////////

            function subscribe() {
               i18n = object.deepClone( configLocales_ );
               initialized = false;

               eventBus.subscribe( 'changeLocaleRequest', handleRequest, subscriberOptions );
            }

            //////////////////////////////////////////////////////////////////////////////////////////////////

            return {
               initialize: initialize,
               subscribe: subscribe,
               unsubscribe: unsubscribe
            };
         }

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         /**
          * The visibility event manager initializes and coordinates events for widget area visibility.
          *
          * It subscribes to all visibility changes and propagates them to nested widget areas
          * (if applicable). It is not concerned with the resulting DOM-visibility of individual controls:
          * the `axVisibilityService` takes care of that.
          *
          * @return {{initialize: Function}}
          *    a function to trigger initialization of the manager and initial widget visibility
          */
         function createVisibilityEventManager() {
            var ROOT = '';
            var senderOptions = { sender: PAGE_CONTROLLER_NAME, deliverToSender: false };

            function initialize() {
               // broadcast visibility changes in individual widgets to their nested areas
               eventBus.subscribe( 'changeWidgetVisibilityRequest', function( event ) {
                  var affectedAreas = areaHelper_.areasInWidget( event.widget );
                  var will = [ 'willChangeWidgetVisibility', event.widget, event.visible ].join( '.' );
                  var did = [ 'didChangeWidgetVisibility', event.widget, event.visible ].join( '.' );
                  eventBus.publish( will, event, senderOptions );
                  $q.all( ( affectedAreas || [] ).map( event.visible ? show : hide ) ).then( function() {
                     eventBus.publish( did, event, senderOptions );
                  } );
               }, subscriberOptions );

               // broadcast visibility changes in widget areas to their nested areas
               eventBus.subscribe( 'changeAreaVisibilityRequest', function( event ) {
                  return initiateAreaChange( event.area, event.visible );
               }, subscriberOptions );

               implementAreaChange( ROOT, true );
            }

            //////////////////////////////////////////////////////////////////////////////////////////////////

            function show( area ) {
               return requestAreaChange( area, true );
            }

            //////////////////////////////////////////////////////////////////////////////////////////////////

            function hide( area ) {
               return requestAreaChange( area, false );
            }

            //////////////////////////////////////////////////////////////////////////////////////////////////

            /**
             * First, publish a `changeAreaVisibilityRequest` to ask if some widget would like to manage the
             * given area's visibility.
             * If no widget responds, self-issue a will/did-response to notify interested widgets in the area
             * of their new visibility status.
             * In either case, manage the propagation to nested areas and inform the area helper so that it
             * may compile and attach the templates of any newly visible widgets.
             *
             * @param {String} area
             *    the area whose visibility to update
             * @param {Boolean} visible
             *    the new visibility state of the given area, to the best knowledge of the client
             */
            function requestAreaChange( area, visible ) {
               var request = [ 'changeAreaVisibilityRequest', area ].join( '.' );
               var event = { area: area, visible: visible };
               return eventBus.publishAndGatherReplies( request, event, senderOptions )
                  .then( function( responses ) {
                     if( responses.length === 0 ) {
                        // no one took responsibility, so the portal determines visibility by area nesting
                        return initiateAreaChange( area, visible );
                     }
                     // assume the first 'did'-response to be authoritative:
                     var response = responses[ 0 ];
                     return implementAreaChange( area, response.event.visible );
                  } );
            }

            //////////////////////////////////////////////////////////////////////////////////////////////////

            /**
             * Set the new visibility state for the given area, then issue requests for the child areas.
             * Inform the area helper so that it may compile and attach the templates of any newly visible
             * widgets.
             */
            function initiateAreaChange( area, visible ) {
               var will = [ 'willChangeAreaVisibility', area, visible ].join( '.' );
               var event = { area: area, visible: visible };
               eventBus.publish( will, event, senderOptions )
                  .then( function() {
                     return implementAreaChange( area, visible );
                  } )
                  .then( function() {
                     var did = [ 'didChangeAreaVisibility', area, visible ].join( '.' );
                     return eventBus.publish( did, event, senderOptions );
                  } );
            }

            //////////////////////////////////////////////////////////////////////////////////////////////////

            function implementAreaChange( ofArea, areaVisible ) {
               areaHelper_.setVisibility( ofArea, areaVisible );
               var children = areaHelper_.areasInArea( ofArea );
               if( !children ) { return $q.when(); }
               return $q.all( children.map( areaVisible ? show : hide ) );
            }

            //////////////////////////////////////////////////////////////////////////////////////////////////

            return {
               initialize: initialize
            };
         }

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         this.setupPage = setupPage;
         this.tearDownPage = tearDownPage;
         this.registerLayoutRenderer = registerLayoutRenderer;
      }
   ] );

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   /**
    * The area helper manages widget areas, their DOM representation and their nesting structure.
    *
    * It tracks widget area visibility in order to compile widgets and to attach them to their areas when
    * these become visible. It also tells the visibility service when change handlers need to be run. It does
    * not interact with the event bus directly, but is consulted by the visibility manager to determine area
    * nesting for visibility events.
    */
   function createAreaHelper( q, page, visibilityService ) {

      // forget about any visibility handlers/state from a previous page
      visibilityService._reset();

      // all initially visible widgets should be attached together, to reduce jitter and unnecessary DOM ops
      var freeToAttach = false;

      // keep the dom element for each area, to attach widgets to
      var areaToElement = {};

      // track widget adapters waiting for their area to become available so that they may attach to its DOM
      var areaToWaitingAdapters = {};

      // the area name for each widget
      var widgetIdToArea = {};
      object.forEach( page.areas, function( widgets, areaName ) {
         widgets.forEach( function( widget ) {
            widgetIdToArea[ widget.id ] = areaName;
         } );
      } );

      // for each widget with children, and each widget area with nested areas, store a list of child names
      var areasInArea = {};
      var areasInWidget = {};
      object.forEach( page.areas, function( widgetEntries, areaName ) {
         var containerName = '';
         if( areaName.indexOf( '.' ) !== -1 ) {
            var widgetId = areaName.split( '.' )[ 0 ];
            areasInWidget[ widgetId ] = areasInWidget[ widgetId ] || [];
            areasInWidget[ widgetId ].push( areaName );
            containerName = widgetIdToArea[ widgetId ];
         }
         areasInArea[ containerName ] = areasInArea[ containerName ] || [];
         areasInArea[ containerName ].push( areaName );
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      function attachWaitingAdapters( areaName ) {
         var waitingAdapters = areaToWaitingAdapters[ areaName ];
         if( !waitingAdapters || !waitingAdapters.length ) { return; }
         var element = areaToElement[ areaName ];
         if( !element ) { return; }

         q.all( waitingAdapters.map( function( adapter ) {
            return adapter.domPrepare();
         } ) ).then( function() {
            // prepare first/last bootstrap classes for appending widgets
            var currentLast = element.lastChild;
            if( currentLast ) { $( currentLast ).removeClass( 'last' ); }
            var currentFirst = element.firstChild;

            waitingAdapters.forEach( function( adapter ) {
               adapter.domAttachTo( element );
            } );

            // fix first/last bootstrap classes as needed
            if( !currentFirst ) {
               var first = element.firstChild;
               if( first ) { first.className += ' first'; }
            }
            var last = element.lastChild;
            if( last ) { last.className += ' last'; }
         } );

         delete areaToWaitingAdapters[ areaName ];
      }

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      return {
         setVisibility: function( areaName, visible ) {
            if( visible && freeToAttach ) {
               attachWaitingAdapters( areaName );
            }
            visibilityService._updateState( areaName, visible );
         },
         areasInArea: function( containerName ) {
            return areasInArea[ containerName ];
         },
         areasInWidget: function( widgetId ) {
            return areasInWidget[ widgetId ];
         },
         /**
          * Register a widget area
          *
          * @param {String} name
          *    the area name as used in the page definition
          * @param {HTMLElement} element
          *    an HTML element representing the widget area
          */
         register: function( name, element ) {
            areaToElement[ name ] = element;
            if( freeToAttach && visibilityService.isVisible( name ) ) {
               attachWaitingAdapters( name );
            }
            return function() {
               delete areaToElement[ name ];
            };
         },
         exists: function( name ) {
            return name in areaToElement;
         },
         attachWidgets: function( widgetAdapters ) {
            freeToAttach = true;
            widgetAdapters.forEach( function( adapter ) {
               var areaName = widgetIdToArea[ adapter.widgetId() ];
               areaToWaitingAdapters[ areaName ] = areaToWaitingAdapters[ areaName ] || [];
               areaToWaitingAdapters[ areaName ].push( adapter );
            } );
            object.forEach( page.areas, function( widgets, areaName ) {
               if( visibilityService.isVisible( areaName ) ) {
                  attachWaitingAdapters( areaName );
               }
            } );
         }
      };

   }

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
         controller: PAGE_CONTROLLER_NAME,
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
