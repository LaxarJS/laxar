/**
 * Copyright 2014 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
/**
 * A module for the `axId` and `axFor` directives.
 *
 * @module axId
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
    * This directive should be used within a widget whenever a unique id for a DOM element should be created.
    * It's value is evaluated as AngularJS expression and used as a local identifier to generate a distinct,
    * unique document wide id.
    *
    * A common use case is in combination with {@link axFor} for input fields having a label.
    *
    * Example:
    * ```html
    * <label ax-for="'userName'">Please enter your name:</label>
    * <input ax-id="'userName'" type="text" ng-model="username">
    * ```
    *
    * @name axId
    * @directive
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
    * This directive should be used within a widget whenever an id, generated using the {@link axId} directive,
    * should be referenced at a `label` element.
    *
    * Example:
    * ```html
    * <label ax-for="'userName'">Please enter your name:</label>
    * <input ax-id="'userName'" type="text" ng-model="username">
    * ```
    *
    * @name axFor
    * @directive
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
