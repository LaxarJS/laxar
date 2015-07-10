/**
 * Copyright 2015 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
define( [
   'angular'
], function( ng ) {
   'use strict';

   var $compile;
   var $rootScope;
   var module = ng.module( 'axLayoutWidgetAdapter', [] )
      .run( [ '$compile', '$rootScope', function( _$compile_, _$rootScope_ ) {
         $compile = _$compile_;
         $rootScope = _$rootScope_;
      } ] );

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function create( layout, widget ) {

      var exports = {
         createController: createController,
         domAttachTo: domAttachTo,
         domDetach: domDetach,
         destroy: destroy
      };
      var layoutElement;
      var scope;

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      function createController() {
         // noop
      }

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      function domAttachTo( areaElement, htmlTemplate ) {
         scope = $rootScope.$new();
         scope.widget = widget;

         var layoutNode = document.createElement( 'div' );
         layoutNode.id = widget.id;
         layoutNode.className = layout.className;
         layoutNode.innerHTML = htmlTemplate;

         layoutElement = $compile( layoutNode )( scope );
         areaElement.appendChild( layoutNode );
      }

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      function domDetach() {
         layoutElement.remove();
      }

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      function destroy() {
         if( scope ){
            scope.$destroy();
         }
         scope = null;
      }

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      return exports;

   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   return {
      create: create,
      name: module.name
   };

} );
