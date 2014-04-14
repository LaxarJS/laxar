/**
 * Copyright 2014 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
define( [
   'angular',
   '../../logging/log'
], function( ng, log ) {
   'use strict';

   var module = ng.module( 'laxar.directives.layout', [] );

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   var directiveName = 'axLayout';
   var directive = [ 'LayoutLoader', function( layoutLoader ) {
      return {
         restrict: 'A',
         replace: true,
         scope: true,
         template: '<div data-ng-include="layoutUrl" data-ng-class="layoutClass" onload="layoutLoaded()"></div>',

         link: function( scope, element, attrs ) {
            var layout = scope.$eval( attrs[ directiveName ] );

            scope.layoutUrl = null;
            scope.layoutClass = null;

            scope.layoutLoaded = function() {
               scope.$emit( 'axLayoutLoaded', layout );
            };

            scope.$emit( 'axLayoutLoading', layout );

            layoutLoader.load( layout )
               .then( function( layoutData ) {
                  if( !layoutData.html ) {
                     throw new Error( 'axLayout: Could not find HTML file for layout "' + layout + '"' );
                  }

                  scope.layoutUrl = layoutData.html;
                  scope.layoutClass = layoutData.className;
               } )
               .then( null, function( error ) {
                  log.error( error );
               } );
         }
      };
   } ];

   module.directive( directiveName, directive );

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   return module;

} );
