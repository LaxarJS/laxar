/**
 * Copyright 2015 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
define( [
   'angular-mocks',
   '../layout_widget_adapter'
], function( ngMocks, layoutWidgetAdapter ) {
   'use strict';

   describe( 'A LayoutWidgetAdapter', function() {

      var adapter;
      var layout;
      var widget;

      beforeEach( function() {
         ngMocks.module( layoutWidgetAdapter.name );
         ngMocks.inject();

         layout = {
            className: 'super-layout',
            htmlContent: '<div data-ax-widget-area="inner"></div>'
         };
         widget = {
            area: 'outer',
            id: 'layoutThing',
            path: 'irrelevant'
         };

         adapter = layoutWidgetAdapter.create( layout, widget );
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'at least offers a createController method (although it may do nothing)', function() {
         expect( typeof adapter.createController ).toEqual( 'function' );
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      describe( 'when asked to attach itself to the DOM', function() {

         var areaElement;

         beforeEach( function() {
            areaElement = document.createElement( 'div' );

            adapter.domAttachTo( areaElement, layout.htmlContent );
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'compiles the DOM node and links it to a new scope', function() {
            expect( toArray( areaElement.firstChild.classList ) ).toContain( 'ng-scope' );
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'sets the class from the configured layout', function() {
            expect( toArray( areaElement.firstChild.classList ) ).toContain( 'super-layout' );
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'sets the id from the widget definition', function() {
            expect( areaElement.firstChild.id ).toEqual( widget.id );
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'inserts the html into the anchor node', function() {
            expect( areaElement.firstChild.innerHTML ).toEqual( layout.htmlContent );
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         describe( 'when asked to detach again', function() {

            beforeEach( function() {
               adapter.domDetach();
            } );

            //////////////////////////////////////////////////////////////////////////////////////////////////

            it( 'removes the node as child from the area element', function() {
               expect( areaElement.firstChild ).toEqual( null );
            } );

         } );

      } );

   } );

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function toArray( arrayLike ) {
      return Array.prototype.slice.call( arrayLike );
   }

} );
