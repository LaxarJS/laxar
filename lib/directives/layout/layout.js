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

   var DIRECTIVE_NAME = 'axLayout';

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   module.directive( DIRECTIVE_NAME, [ 'LayoutLoader', '$compile', function( layoutLoader, $compile ) {

      return {
         restrict: 'A',
         link: function( scope, element, attrs ) {
            var layoutName = scope.$eval( attrs[ DIRECTIVE_NAME ] );
            layoutLoader.load( layoutName )
               .then( function( layoutInfo ) {
                  element.html( layoutInfo.htmlContent );
                  element.addClass( layoutInfo.className );
                  $compile( element.contents() )( scope );
                  scope.$emit( 'axLayoutLoaded', layoutName );
               }, function( err ) {
                  log.error( 'axLayout: could not load layout [0], error: [1]', layoutName, err );
               } );
         }
      };

   } ] );

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   return module;

} );
