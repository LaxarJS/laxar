/**
 * Copyright 2014 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
define( [
   'angular',
   '../../utilities/array',
   '../../utilities/storage',
   '../../portal/portal_assembler/widget_loader'
], function( ng, array, storage, widgetLoader ) {
   'use strict';

   var module = ng.module( 'laxar.directives.widget_area', [] );
   var WIDGET_ID_PREFIX = 'widget__';

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   module.directive( 'axWidgetArea', [ '$compile', function( $compile ) {
      return {
         restrict: 'A',
         template: '<div data-ax-widget-loader="widget"></div>',
         scope: true,
         compile: function( tElement, tAttrs, linker ) {
            var template = tElement.children().remove();
            var templateFunction;

            return function( scope, element, attrs ) {
               if( !templateFunction ) {
                  templateFunction = $compile( template );
                  template = null;
               }

               var areaName = attrs.axWidgetArea;
               if( !areaName ) {
                  if( attrs.axWidgetAreaBinding ) {
                     areaName = scope.$eval( attrs.axWidgetAreaBinding );
                  }
                  else {
                     throw new Error( 'A widget area either needs a static name assigned ' +
                        'or a binding via "data-ax-widget-area-binding".');
                  }
               }

               if( scope.widget ) {
                  // If a widget is found in a parent scope, this area must be an area contained in another
                  // widget. Therefore the areaName is prefixed with the id of that widget.
                  areaName = scope.widget.id + '.' + areaName;
               }

               scope.widgetAreas.push( areaName );
               scope.areaName = areaName;

               if( scope.widgets[ areaName ] && scope.widgets[ areaName ].length ) {
                  render( scope.widgets[ areaName ] );
               }
               else {
                  var done = scope.$watch( 'widgets.' + areaName, function( widgets ) {
                     if( widgets && widgets.length ) {
                        render( widgets );
                        done();
                     }
                  } );
               }

               ///////////////////////////////////////////////////////////////////////////////////////////////

               function render( widgets ) {
                  var length = widgets.length;
                  widgets.forEach( function( widget, i ) {
                     var widgetScope = scope.$new();
                     widgetScope.widget = widget;
                     templateFunction( widgetScope, function( widgetNode ) {
                        widgetNode.attr( 'id', WIDGET_ID_PREFIX + widget.id );
                        widgetNode.addClass( camelCaseToDashed( widget.specification.name ) );
                        if( i === 0 ) {
                           widgetNode.addClass( 'first' );
                        }
                        if( i === length - 1 ) {
                           widgetNode.addClass( 'last' );
                        }
                        element.append( widgetNode );
                     } );
                  } );
               }

               scope.$on( '$destroy', function() {
                  array.remove( scope.widgetAreas, areaName );
               } );
            };
         }
      };
   } ] );

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   module.directive( 'axWidgetLoader', [
      '$q', '$compile', '$controller', '$http', '$templateCache', '$timeout', 'EventBus', 'CssLoader', 'FileResourceProvider',

      function( $q, $compile, $controller, $http, $templateCache, $timeout, eventBus, cssLoader, fileResourceProvider ) {

         var widgetStorage = storage.getLocalStorage( 'widgetStorage' );

         return {
            restrict: 'A',
            scope: true,
            link: function( scope, element, attrs ) {
               var widget = scope.$parent.$eval( attrs.axWidgetLoader );
               if( !widget ) {
                  return;
               }

               scope.widget = widget;
               scope.storage = restoreWidgetStorage( widgetStorage, scope.place, widget );

               var promise = $q.when( true );
               if( widget.includeUrl ) {
                  promise = getTemplate( widget.includeUrl, $q, $templateCache )
                     .then( function( htmlCode ) {
                        element.html( htmlCode );
                        $compile( element.contents() )( scope );
                     } );
               }

               if( widget.cssFileUrls ) {
                  widget.cssFileUrls.forEach( function( url ) { cssLoader.load( url ); } );
               }

               scope.widgetClass = camelCaseToDashed( widget.specification.name );

               scope.eventBus = widgetLoader.createEventBusForWidget( eventBus, widget );
               scope.id = widgetLoader.createIdGeneratorForWidget( widget );

               ng.forEach( widget._scopeProperties, function( property, name ) {
                  scope[ name ] = property;
               } );
               delete widget._scopeProperties;

               promise.then( function()  {
                  // we need another timeout here, that guarantees us being called AFTER directives contained
                  // within widgets were compiled and linked.
                  $timeout( function() {
                     scope.$emit( 'axPortal.loadedWidget', widget );
                  } );
               } );

               $controller( widget.controllerName, { '$scope': scope } );

               widget.scope = function() {
                  return scope;
               };

               ///////////////////////////////////////////////////////////////////////////////////////////////

               scope.$on( '$destroy', function() {

                  persistWidgetStorage( widgetStorage, scope.place, widget, scope.storage );

                  ng.forEach( widget.__subscriptions, function( subscriber ) {
                     eventBus.unsubscribe( subscriber );
                  } );

                  // trying to minimize memory leakage when removing a widget.
                  element.remove();
                  element = null;

                  delete scope.$$listeners;
                  delete scope.$$watchers;
                  delete scope.eventBus;
                  delete scope.eventBus;
                  delete scope.features;
                  delete scope.id;
                  delete scope.messages;
                  delete scope.storage;
                  delete widget.scope;

                  scope = null;
               } );
            }
         };


         /////////////////////////////////////////////////////////////////////////////////////////////////////

         /** Retrieve template from fileResourceProvider, ensuring use of relevant caches. */
         function getTemplate( url, q, templateCache ) {
            var result = templateCache.get( url );
            if( result ) {
               return q.when( result );
            }
            return fileResourceProvider.provide( url ).then( function( template ) {
               templateCache.put( url, template );
               return template;
            } );
         }

      }
   ] );

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function restoreWidgetStorage( widgetStorage, place, widget ) {
      var data = widgetStorage.getItem( place.id + '#' + widget.id );
      return typeof data === 'object' && data != null ? data : {};
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function persistWidgetStorage( widgetStorage, place, widget, data ) {
      if( typeof data === 'object' && data != null && Object.keys( data ).length > 0 ) {
         widgetStorage.setItem( place.id + '#' + widget.id, data );
      }
      else {
         widgetStorage.removeItem( place.id + '#' + widget.id );
      }
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function camelCaseToDashed( str ) {
      return str.replace( /[A-Z]/g, function( character, offset ) {
         return ( offset > 0 ? '-' : '' ) + character.toLowerCase();
      } );
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   return module;

} );