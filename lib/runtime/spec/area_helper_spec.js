/**
 * Copyright 2016 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
import * as areaHelperModule from '../area_helper';
import pageData from './data/area_helper_data';
import { create as createLogMock } from '../../testing/log_mock';

describe( 'An AreaHelper', () => {

   describe( 'instance', () => {

      let logMock;
      let widgetAdapterRefs;
      let areaHelper;
      let mockElement;

      beforeEach( () => {
         logMock = createLogMock();
         areaHelper = areaHelperModule.create( pageData, logMock );
         mockElement = {
            childNodes: [],
            setAttribute: jasmine.createSpy( 'setAttribute' ),
            hasAttribute: jasmine.createSpy( 'hasAttribute' ).and.returnValue( false )
         };

         widgetAdapterRefs = Object.keys( pageData.areas )
            .map( areaName => pageData.areas[ areaName ] )
            .reduce( ( refs, widgets ) => {
               return widgets.reduce( ( refs, { id } ) => {
                  return [ ...refs, {
                     id,
                     templatePromise: Promise.resolve( `<div>${id}</div>` ),
                     adapter: jasmine.createSpyObj( 'adapter', [ 'domAttachTo' ] )
                  } ];
               }, refs );
            }, [] );
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'extracts all areas on creation', () => {
         expect( areaHelper.areasInArea( '' ) ).toEqual( [ 'testArea1', 'testArea2' ] );
         expect( areaHelper.areasInArea( 'testArea1' ) ).toEqual( [ 'id2.content' ] );
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'registers widget areas embedded in widgets', () => {
         expect( areaHelper.areasInArea( '' ) ).toEqual( [ 'testArea1', 'testArea2' ] );
         expect( areaHelper.areasInArea( 'testArea1' ) ).toEqual( [ 'id2.content' ] );
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'initially has no registered areas with according DOM element', () => {
         expect( areaHelper.exists( 'testArea1' ) ).toBe( false );
         expect( areaHelper.exists( 'testArea2' ) ).toBe( false );
         expect( areaHelper.exists( 'id2.content' ) ).toBe( false );
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'throws if a widget area is attached more than once', () => {
         areaHelper.register( 'testArea1', mockElement );
         expect( () => areaHelper.register( 'testArea1', mockElement ) )
            .toThrow( new Error( 'The area "testArea1" is defined twice.' ) );
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      describe( 'with registered widget areas and attached widget adapters', () => {

         beforeEach( () => {
            areaHelper.register( 'testArea1', mockElement );
            areaHelper.register( 'testArea2', mockElement );
            areaHelper.register( 'testId.testArea3', mockElement );
            areaHelper.register( 'testId.testArea4', mockElement, 'localName' );
            const mockElementWithAttributeSet = {
               ...mockElement,
               hasAttribute: jasmine.createSpy( 'hasAttribute' ).and.returnValue( true )
            };
            areaHelper.register( 'testId.testArea5', mockElementWithAttributeSet, 'nameThatIsAlreadySet' );

            areaHelper.attachWidgets( widgetAdapterRefs );
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         describe( 'when set to visible', () => {

            beforeEach( done => {
               areaHelper.setVisibility( 'testArea1', true );

               Promise.all( widgetAdapterRefs.map( ref => ref.templatePromise ) ).then( done );
            } );

            //////////////////////////////////////////////////////////////////////////////////////////////////

            it( 'attaches the adapters of that area', () => {
               expect( widgetAdapterRefs[ 0 ].adapter.domAttachTo )
                  .toHaveBeenCalledWith( mockElement, '<div>id1</div>' );
               expect( widgetAdapterRefs[ 1 ].adapter.domAttachTo )
                  .toHaveBeenCalledWith( mockElement, '<div>id2</div>' );
               expect( widgetAdapterRefs[ 2 ].adapter.domAttachTo ).not.toHaveBeenCalled();
               expect( widgetAdapterRefs[ 3 ].adapter.domAttachTo ).not.toHaveBeenCalled();
            } );

         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'adds a DOM marker attribute corresponding to the areaName', () => {
            expect( mockElement.setAttribute )
               .toHaveBeenCalledWith( 'data-ax-widget-area', 'testArea1' );
            expect( mockElement.setAttribute )
               .toHaveBeenCalledWith( 'data-ax-widget-area', 'testArea2' );
            expect( mockElement.setAttribute )
               .toHaveBeenCalledWith( 'data-ax-widget-area', 'testId.testArea3' );
            expect( mockElement.setAttribute )
               .toHaveBeenCalledWith( 'data-ax-widget-area', 'localName' );
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'does not try to "infer" the local area name by itself', () => {
            expect( mockElement.setAttribute )
               .not.toHaveBeenCalledWith( 'data-ax-widget-area', 'testArea3' );
            expect( mockElement.setAttribute )
               .not.toHaveBeenCalledWith( 'data-ax-widget-area', 'testArea4' );
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'checks if the attribute is already registered by the adapter', () => {
            expect( mockElement.hasAttribute )
               .toHaveBeenCalledWith( 'data-ax-widget-area' );
            expect( mockElement.hasAttribute )
               .toHaveBeenCalledWith( 'ax-widget-area' );
            expect( mockElement.setAttribute )
               .not.toHaveBeenCalledWith( 'data-ax-widget-area', 'testArea5' );
         } );

      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      describe( 'when a widget adapter throws an error during domAttachTo', () => {

         let err;

         beforeEach( done => {
            err = new Error( 'Failed!' );
            widgetAdapterRefs[ 0 ].adapter.domAttachTo
               .and.callFake( () => { throw err; } );
            areaHelper.register( 'testArea1', mockElement );
            areaHelper.register( 'testArea2', mockElement );

            areaHelper.attachWidgets( widgetAdapterRefs );
            areaHelper.setVisibility( 'testArea1', true );

            Promise.all( widgetAdapterRefs.map( ref => ref.templatePromise ) )
               // We need to wait for a tick later than the call of the `domAttachTo` methods
               .then( () => Promise.resolve() )
               .then( done );
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'logs the error with useful debugging information (#408)', () => {
            expect( logMock.error )
               .toHaveBeenCalledWith( 'An error occured while attaching some widgets to the DOM:' );
            expect( logMock.error ).toHaveBeenCalledWith( '  - Widget ID: id1' );
            expect( logMock.error ).toHaveBeenCalledWith( '  - Widget Area: testArea1' );
            expect( logMock.error ).toHaveBeenCalledWith( '  - Original error: [0]', err );
         } );

      } );

   } );

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   describe( 'offers the findWidgetAreas( rootElement ) method that', () => {

      let root;
      let resultAreas;

      beforeEach( () => {
         root = document.createElement( 'div' );
         root.innerHTML = `
            <div ax-widget-area="area1" id="1"></div>
            <div data-ax-widget-area="area2" id="2"></div>
            <div>
               <section ax-widget-area="area3" id="3"></section>
               <section ax-widget-area="area4" id="4"></section>
               <main>
                  <div data-ax-widget-area="area5" id="5"></div>
               </main>
            </div>
         `;
         resultAreas = areaHelperModule.findWidgetAreas( root );
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'finds areas without data prefix', () => {
         expect( resultAreas[ 'area1' ] ).toBe( root.querySelector( '[id="1"]' ) );
         expect( resultAreas[ 'area3' ] ).toBe( root.querySelector( '[id="3"]' ) );
         expect( resultAreas[ 'area4' ] ).toBe( root.querySelector( '[id="4"]' ) );
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'finds areas with data prefix', () => {
         expect( resultAreas[ 'area2' ] ).toBe( root.querySelector( '[id="2"]' ) );
         expect( resultAreas[ 'area5' ] ).toBe( root.querySelector( '[id="5"]' ) );
      } );

   } );

} );
