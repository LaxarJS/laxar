/**
 * Copyright 2014 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
define( [
   'angular',
   'jquery',
   '../../logging/log',
   '../../directives/layout/layout',
   '../../utilities/assert',
   '../portal_assembler/widget_loader'
], function( ng, $, log, layoutModule, assert, widgetLoader ) {
   'use strict';

   var module = ng.module( 'laxar.portal.page', [ layoutModule.name ] );

   var $q_;
   var layoutLoader_;
   var themeManager_;
   var eventBus_;

   module.run( [
      '$q', 'LayoutLoader', 'EventBus', 'FileResourceProvider', 'ThemeManager',

      function( $q, layoutLoader, eventBus, fileResourceProvider, themeManager ) {
         $q_ = $q;
         layoutLoader_ = layoutLoader;
         eventBus_ = eventBus;
         themeManager_ = themeManager;

         widgetLoader.init( themeManager, fileResourceProvider, $q );
         widgetLoader.addDefaultWidgetResolvers();
      }
   ] );

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   module.directive( 'axPage', [ '$compile', function( $compile ) {

      var defaultAreas = [ { name: 'activities', hidden: true }, { name: 'popups' }, { name: 'popovers' } ];

      return {
         restrict: 'A',
         template: '<div ' +
            'data-ng-include="layout" ' +
            'data-ng-class="layoutClass" ' +
            'onload="layoutLoaded()"></div>',
         replace: true,
         scope: true,
         controller: 'portal.PageController',
         link: function( scope, element ) {
            scope.addMissingDefaultWidgetAreas = function() {
               var defaultAreaHtml = defaultAreas.reduce( function( html, area ) {
                  if( scope.widgetAreas.indexOf( area.name ) === -1 ) {
                     return html + '<div data-ax-widget-area="' + area.name + '"' +
                        ( area.hidden ? ' style="display: none;"' : '' ) +
                        ' data-added-by-page-directive></div>';
                  }

                  return html;
               }, '' );

               if( defaultAreaHtml ) {
                  // prior to AngularJS 1.2.x element would reference the element where originally the
                  // data-ax-page directive was set on. Possibly due to changes to ng-include in 1.2.x element
                  // now only is the HTML comment marking the place where ng-include once was. We therefore
                  // need to find the correct element again manually.
                  $( 'body' ).find( '[data-ax-page]:first,[ax-page]:first' ).eq( 0 )
                     .append( $compile( defaultAreaHtml )( scope ) );
               }
            };

            //////////////////////////////////////////////////////////////////////////////////////////////////

            scope.removeAddedDefaultWidgetAreas = function() {
               element.children( '[data-added-by-page-directive]' ).each( function( child ) {
                  var el = ng.element( child );
                  el.scope().$destroy();
                  el.remove();
               } );
            };
         }
      };
   } ] );

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   var theme_;

   module.controller( 'portal.PageController', [
      '$rootScope', '$scope',

      function( $rootScope, $scope ) {
         $scope.widgetAreas = [];

         var eventOptions = { sender: 'PageController' };
         var previousLayout = null;

         eventBus_.subscribe( 'loadPageRequest', function( event ) {
            eventBus_.publish( 'willLoadPage', {}, eventOptions );
            var page = event.page;

            theme_ = themeManager_.getTheme();

            $rootScope.allWidgetsLoaded = false;

            $scope.layoutLoaded = function() {
               $scope.layoutLoaded = function() {};

               $scope.addMissingDefaultWidgetAreas();

               loadPage( $scope, page )
                  .then( function() {
                     $rootScope.allWidgetsLoaded = true;
                     eventBus_.publish( 'didLoadPage', {}, eventOptions );
                  }, function( error ) {
                     eventBus_.publish( 'didLoadPage', { error: error }, eventOptions );
                  }
               );
            };

            loadLayout( $scope, page.layout, previousLayout )
               .then( function( layout ) {
                  previousLayout = layout;
               }, function( error ) {
                  log.error( '[0:%o]', error );
               } );

         }, { subscriber: eventOptions.sender } );
      }
   ] );

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function loadLayout( $scope, layout, previousLayout ) {
      if( previousLayout === layout ) {
         $scope.layoutLoaded();
         return $q_.when( previousLayout );
      }

      $scope.removeAddedDefaultWidgetAreas();

      return layoutLoader_.load( layout, previousLayout )
         .then( function( newLayoutData ) {
            if( !newLayoutData.html ) {
               throw new Error( 'Could not find HTML for layout "' + layout + '"' );
            }

            $scope.widgets = {};
            $scope.layoutClass = newLayoutData.className;
            $scope.layout = newLayoutData.html;

            return layout;
         } );
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function loadPage( $scope, page ) {
      var deferred = $q_.defer();
      var widgetsForPage = widgetLoader.processWidgetsForPage( page );

      var remaining = widgetsWithoutArea( $scope.widgetAreas, widgetsForPage );

      var loading = widgetsForPage.length - remaining.length;
      var loadingIncludeContent = 0;

      var scopeEventListeners = [
         $scope.$on( 'axPortal.loadedWidget', function(/* event, widget*/ ) {
            --loading;

            var oldRemaining = remaining;
            remaining = widgetsWithoutArea( $scope.widgetAreas, oldRemaining );

            loading += oldRemaining.length - remaining.length;

            if( loading === 0 && remaining.length === 0 ) {
               done();
            }

            checkForPossibleError();
         } ),

         $scope.$on( 'axLayoutLoading', function(/* event, layout */) {
            ++loadingIncludeContent;
         } ),

         $scope.$on( 'axLayoutLoaded', function(/* event, layout */) {
            --loadingIncludeContent;

            // here we may have some new widget areas
            var oldRemaining = remaining;
            remaining = widgetsWithoutArea( $scope.widgetAreas, oldRemaining );

            loading += oldRemaining.length - remaining.length;

            checkForPossibleError();
         } )
      ];

      loadWidgetSpecifications( widgetsForPage )
         .then( function( loadedWidgets ) {
            $scope.widgets = {};
            loadedWidgets.forEach( function( widget ) {
               if( !( widget.area in $scope.widgets ) ) {
                  $scope.widgets[ widget.area ] =  [];
               }
               $scope.widgets[ widget.area ].push( widget );
            } );

            if( widgetsForPage.length === 0 ) {
               log.debug( 'no widgets to load for current page' );
               done();
            }
         }, function( e ) {
            done( e );
         } );


      checkForPossibleError();

      return deferred.promise;

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      function checkForPossibleError() {
         if( loadingIncludeContent === 0 && loading === 0 && remaining.length > 0 ) {
            log.error( 'Some widgets are in no existing widget area and thus cannot be loaded: [0]', remaining );
            done( remaining.length + ' widgets are in no existing widget area and thus cannot be loaded' );
         }
      }

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      function done( error ) {
         scopeEventListeners.forEach( function( off ) { off(); } );
         if( error ) {
            deferred.reject( error );
         }
         else {
            deferred.resolve();
         }
      }
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function loadWidgetSpecifications( widgets ) {
      return $q_.all( widgets.map( function( requestedConfiguration ) {
         return widgetLoader.resolveWidget( requestedConfiguration.widget, theme_ )
            .then( function( resolved ) {
               var widget = {};
               ng.extend( widget, resolved );
               ng.extend( widget, requestedConfiguration );

               widget._scopeProperties = {
                  features: widgetLoader.featuresForWidget( resolved.specification, requestedConfiguration ),
                  messages: {},
                  layout: null // shadow the layout property of the rootScope for widgets (jira ATP-7065)
               };

               return widget;
            } );
      } ) );
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function widgetsWithoutArea( existingAreas, widgets ) {
      return widgets.reduce( function( remaining, widget ) {
         if( existingAreas.indexOf( widget.area ) !== -1 ) {
            return remaining;
         }

         return remaining.concat( widget );
      }, [] );
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   return module;

} );
