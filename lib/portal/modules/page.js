/**
 * Copyright 2014 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
define( [
   'angular',
   'jquery',
   '../../utilities/storage',
   '../../utilities/object',
   '../../logging/log',
   '../../directives/layout/layout',
   '../portal_assembler/page_loader',
   '../portal_assembler/widget_loader',
   '../paths',
   '../timer'
], function( ng, $, storage, object, log, layoutModule, pageLoader, widgetLoaderModule, paths, timer ) {
   'use strict';

   var module = ng.module( 'laxar.portal.page', [ layoutModule.name ] );

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   /**
    * Mediates between FlowController and the stateful PageController
    */
   module.service( 'laxar.portal.PageService', [ function() {

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
   module.controller( 'laxar.portal.PageController', [
      '$scope', 'laxar.portal.PageService', '$q', 'Configuration', 'LayoutLoader', 'EventBus', 'FileResourceProvider', 'ThemeManager',
      function( $scope, pageService, $q, configuration, layoutLoader, eventBus, fileResourceProvider, themeManager ) {

         var self = this;
         var pageLoader_ = pageLoader.create( $q, null, paths.PAGES, fileResourceProvider );

         var theme = themeManager.getTheme();
         var localeManager = createLocaleManager();
         var widgetAdapters_ = [];
         var areaHelper_;
         var lifecycleEvent = { lifecycleId: 'default' };
         var eventOptions = { sender: 'PageService' };

         var renderLayout = function() {
            assert.codeIsUnreachable( 'No layout renderer!' );
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
               eventOptions );
         }

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         function manageVisibility() {
            // to be done
         }

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         function publishTheme() {
            return eventBus.publish( 'didChangeTheme.' + theme, { theme: theme }, eventOptions );
         }

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         function prepareDom() {
            return areaHelper_.prepareWidgets( widgetAdapters_ );
         }

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         function assembleDom() {
            areaHelper_.attachWidgets( widgetAdapters_ );
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

            localeManager.subscribe();
            var layoutDeferred = $q.defer();
            var pagePromise = pageLoader_.loadPage( pageName )
               .then( function( page ) {
                  areaHelper_ = createAreaHelper( $q, page );
                  self.areas = areaHelper_;
                  layoutLoader.load( page.layout ).then( layoutDeferred.resolve );

                  // instantiate controllers
                  var widgets = widgetsForPage( page );
                  return $q.all( widgets.map( function( widget ) {
                     return widgetLoader_.load( widget );
                  } ) );
               } )
               .then( function( widgetAdapters ) {
                  widgetAdapters_ = widgetAdapters;
               } )
               .then( beginLifecycle )
               .then( manageVisibility )
               .then( localeManager.publishAll )
               .then( publishTheme );

            $q.all( [ layoutDeferred.promise, pagePromise ] )
               .then( function( results ) {
                  renderLayout( results[ 0 ] );
                  return prepareDom();
               } )
               .then( assembleDom );

            return pagePromise;
         }

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         function tearDownPage() {
            localeManager.unsubscribe();

            return eventBus
               .publishAndGatherReplies(
                  'endLifecycleRequest.default',
                  lifecycleEvent,
                  eventOptions
               ).then( function() {
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

         function createLocaleManager() {
            // DEPRECATION: the key 'locales' has been deprecated in favor of 'i18n.locales'
            var configLocales_ = configuration.get( 'i18n.locales', configuration.get( 'locales', {} ) );
            var i18n;
            var initiallyPublished;

            //////////////////////////////////////////////////////////////////////////////////////////////////

            function subscribe() {
               i18n = object.deepClone( configLocales_ );
               initiallyPublished = false;

               eventBus.subscribe( 'changeLocaleRequest', handleRequest, eventOptions );
            }

            //////////////////////////////////////////////////////////////////////////////////////////////////

            function handleRequest( event ) {
               i18n[ event.locale ] = event.languageTag;
               if( initiallyPublished ) {
                  publish( event.locale );
               }
            }

            //////////////////////////////////////////////////////////////////////////////////////////////////

            function publishAll() {
               initiallyPublished = true;
               return $q.all( Object.keys( configLocales_ ).map( publish ) );
            }

            //////////////////////////////////////////////////////////////////////////////////////////////////

            function publish( locale ) {
               var event = { locale: locale, languageTag: i18n[ locale ] };
               return eventBus.publish( 'didChangeLocale.' + locale, event, eventOptions );
            }

            //////////////////////////////////////////////////////////////////////////////////////////////////

            function unsubscribe() {
               eventBus.unsubscribe( handleRequest );
            }

            //////////////////////////////////////////////////////////////////////////////////////////////////

            return {
               subscribe: subscribe,
               unsubscribe: unsubscribe,
               publishAll: publishAll
            };
         }

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         this.setupPage = setupPage;
         this.tearDownPage = tearDownPage;
         this.registerLayoutRenderer = registerLayoutRenderer;
      }
   ] );

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function createAreaHelper( q, page ) {

      var areaToElement = {};
      var areaToWaitingAdapters = {};
      var widgetIdToArea = {};
      object.forEach( page.areas, function( widgets, areaName ) {
         widgets.forEach( function( widget ) {
            widgetIdToArea[ widget.id ] = areaName;
         } );
      } );

      return {
         /**
          * @param {String} name
          *    the area name as used in the page definition
          * @param {HTMLElement} element
          *    an HTML element representing the widget area
          */
         register: function( name, element ) {
            areaToElement[ name ] = element;
            if( name in areaToWaitingAdapters ) {
               areaToWaitingAdapters[ name ].forEach( function( adapter ) {
                  adapter.domAttachTo( element );
               } );
            }
            return function() {
               delete areaToElement[ name ];
            };
         },
         exists: function( name ) {
            return name in areaToElement;
         },
         prepareWidgets: function( widgetAdapters ) {
            return q.all( widgetAdapters.map( function( adapter ) {
               return adapter.domPrepare();
            } ) );
         },
         attachWidgets: function( widgetAdapters ) {
            widgetAdapters.forEach( function( adapter ) {
               var areaName = widgetIdToArea[ adapter.widgetId() ];
               var areaElement = areaToElement[ areaName ];
               if( areaElement ) {
                  adapter.domAttachTo( areaElement );
               }
               else {
                  if( !areaToWaitingAdapters[ areaName ] ) {
                     areaToWaitingAdapters[ areaName ] = [];
                  }
                  areaToWaitingAdapters[ areaName ].push( adapter );
               }
            } );
         }
      };

   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   module.directive( 'axPage', [ '$compile', function( $compile ) {

      var defaultAreas = [ { name: 'activities', hidden: true }, { name: 'popups' }, { name: 'popovers' } ];

      return {
         restrict: 'A',
         template: '<div data-ng-class="layoutClass"></div>',
         replace: true,
         scope: true,
         controller: 'laxar.portal.PageController',
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
