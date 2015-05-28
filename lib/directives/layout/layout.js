/**
 * Copyright 2014 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
/**
 * A module for the `axLayout` directive.
 *
 * @module axLayout
 */
define( [
   'angular',
   '../../logging/log'
], function( ng, log ) {
   'use strict';

   var module = ng.module( 'axLayout', [] );

   var DIRECTIVE_NAME = 'axLayout';

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   /**
    * This directive uses the *axLayoutLoader* service to load a given layout and compile it as child to the
    * element the directive is set on. In contrast to *ngInclude* it doesn't watch the provided expression for
    * performance reasons and takes LaxarJS theming into account when loading the assets.
    *
    * @name axLayout
    * @directive
    */
   module.directive( DIRECTIVE_NAME, [ 'axLayoutLoader', '$compile', function( layoutLoader, $compile ) {

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
