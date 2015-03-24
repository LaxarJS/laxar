/**
 * Copyright 2014 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
define( [
   'angular',
   '../../utilities/string'
], function( ng, string ) {
   'use strict';

   var module = ng.module( 'axWidgetArea', [] );

   var DIRECTIVE_NAME = 'axWidgetArea';

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   module.directive( DIRECTIVE_NAME, [ 'axPageService', function( pageService ) {
      return {
         restrict: 'A',
         link: function( scope, element, attrs ) {

            var widgetId = scope.widget && scope.widget.id;
            var areaName = attrs[ DIRECTIVE_NAME ];
            if( !areaName ) {
               if( attrs[ DIRECTIVE_NAME + 'Binding' ] ) {
                  areaName = scope.$eval( attrs[ DIRECTIVE_NAME + 'Binding' ] );
               }
               else {
                  var message = 'axWidgetArea: area at at [0] has neither a name nor a binding assigned.';
                  var context = widgetId || scope.layoutClass;
                  throw new Error( string.format( message, [ context ] ) );
               }
            }

            if( widgetId ) {
               // If a widget is found in a parent scope, this area must be an area contained in that widget.
               // Therefore the areaName is prefixed with the id of that widget.
               areaName = widgetId + '.' + areaName;
            }

            var areasController = pageService.controllerForScope( scope ).areas;
            var deregister = areasController.register( areaName, element[ 0 ] );
            scope.$on( '$destroy', deregister );
         }
      };
   } ] );

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   return module;

} );
