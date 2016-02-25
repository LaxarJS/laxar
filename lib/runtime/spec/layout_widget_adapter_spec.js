/**
 * Copyright 2016 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
import * as layoutWidgetAdapter from '../layout_widget_adapter';
import 'angular-mocks';

const { module, inject } = window;

describe( 'A LayoutWidgetAdapter', () => {

   let adapter;
   let layout;
   let widget;
   let areasController;

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

      areasController = jasmine.createSpyObj( 'areasController', [ 'register' ] );
      const pageService = { controllerForScope: () => ( { areas: areasController } ) };
      adapter = layoutWidgetAdapter.create( pageService, layout, widget );
   } );

   ////////////////////////////////////////////////////////////////////////////////////////////////////////

   it( 'at least offers a createController method (although it may do nothing)', () => {
      expect( typeof adapter.createController ).toEqual( 'function' );
   } );

   ////////////////////////////////////////////////////////////////////////////////////////////////////////

   describe( 'when asked to attach itself to the DOM', () => {

      let areaElement;

      beforeEach( () => {
         areaElement = document.createElement( 'div' );

         adapter.domAttachTo( areaElement, layout.htmlContent );
      } );

      /////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'registers the new area with the area controller', () => {
         expect( areasController.register )
            .toHaveBeenCalledWith( 'layoutThing.inner', jasmine.any( Object ) );
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
