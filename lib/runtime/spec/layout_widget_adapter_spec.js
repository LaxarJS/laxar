/**
 * Copyright 2015 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
import * as layoutWidgetAdapter from '../layout_widget_adapter';
import 'angular-mocks';

const { module, inject } = window;

describe( 'A LayoutWidgetAdapter', () => {

   var adapter;
   var layout;
   var widget;

   beforeEach( () => {
      module( layoutWidgetAdapter.name );
      inject();

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

   it( 'at least offers a createController method (although it may do nothing)', () => {
      expect( typeof adapter.createController ).toEqual( 'function' );
   } );

   ////////////////////////////////////////////////////////////////////////////////////////////////////////

   describe( 'when asked to attach itself to the DOM', () => {

      var areaElement;

      beforeEach( () => {
         areaElement = document.createElement( 'div' );

         adapter.domAttachTo( areaElement, layout.htmlContent );
      } );

      /////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'compiles the DOM node and links it to a new scope', () => {
         expect( Array.from( areaElement.firstChild.classList ) ).toContain( 'ng-scope' );
      } );

      /////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'sets the class from the configured layout', () => {
         expect( Array.from( areaElement.firstChild.classList ) ).toContain( 'super-layout' );
      } );

      /////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'sets the id from the widget definition', () => {
         expect( areaElement.firstChild.id ).toEqual( widget.id );
      } );

      /////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'inserts the html into the anchor node', () => {
         expect( areaElement.firstChild.innerHTML ).toEqual( layout.htmlContent );
      } );

      /////////////////////////////////////////////////////////////////////////////////////////////////////

      describe( 'when asked to detach again', () => {

         beforeEach( () => {
            adapter.domDetach();
         } );

         //////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'removes the node as child from the area element', () => {
            expect( areaElement.firstChild ).toEqual( null );
         } );

      } );

   } );

} );
