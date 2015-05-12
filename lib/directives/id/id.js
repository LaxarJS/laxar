/**
 * Copyright 2014 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
define( [
   'angular',
   '../../utilities/assert'
], function( ng, assert ) {
   'use strict';

   var module = ng.module( 'axId', [] );

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   var ID_DIRECTIVE_NAME = 'axId';
   /**
    *
    * @directive axId
    */
   module.directive( ID_DIRECTIVE_NAME, [ function() {
      return {
         restrict: 'A',
         link: function( scope, element, attrs ) {
            var localId = scope.$eval( attrs[ ID_DIRECTIVE_NAME ] );
            assert
               .state( localId, 'directive axId needs a non-empty local id, e.g. ax-id="\'myLocalId\'".' );

            element.attr( 'id', scope.id( localId ) );
         }
      };
   } ] );

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   var FOR_DIRECTIVE_NAME = 'axFor';
   /**
    *
    * @directive axFor
    */
   module.directive( FOR_DIRECTIVE_NAME, [ function() {
      return {
         restrict: 'A',
         link: function( scope, element, attrs ) {
            var localId = scope.$eval( attrs[ FOR_DIRECTIVE_NAME ] );
            assert
               .state( localId, 'directive axFor needs a non-empty local id, e.g. ax-for="\'myLocalId\'".' );

            element.attr( 'for', scope.id( localId ) );
         }
      };
   } ] );

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   return module;

} );
