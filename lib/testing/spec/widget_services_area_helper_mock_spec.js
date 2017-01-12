/**
 * Copyright 2017 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
import { create as createWidgetServicesAreaHelperMock } from '../widget_services_area_helper_mock';

describe( 'An axAreaHelper mock', () => {

   let contextMock;
   let areaHelperMock;

   describe( 'created from a minimal context', () => {

      beforeEach( () => {
         contextMock = {
            widget: {
               id: 'theWidgetId'
            }
         };
         areaHelperMock = createWidgetServicesAreaHelperMock( contextMock );
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'provides methods to simulate the axAreaHelper service', () => {
         expect( areaHelperMock.isVisible ).toBeDefined();
         expect( areaHelperMock.register ).toBeDefined();
         expect( areaHelperMock.fullName ).toBeDefined();
         expect( areaHelperMock.localName ).toBeDefined();
         expect( areaHelperMock.release ).toBeDefined();
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      describe( 'queried for visibility', () => {

         let isVisible;

         beforeEach( () => {
            isVisible = areaHelperMock.isVisible( 'bogusArea' );
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'initially returns false', () => {
            expect( isVisible ).toBe( false );
         } );

      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      describe( 'asked to convert between local and full area name', () => {

         let localName;
         let fullName;

         beforeEach( () => {
            localName = areaHelperMock.localName( 'theWidgetId.bogusArea' );
            fullName = areaHelperMock.fullName( 'myArea' );
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'calculates the local name based on the provided mock context', () => {
            expect( localName ).toBe( 'bogusArea' );
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'calculates the full name based on the provided mock context', () => {
            expect( fullName ).toBe( 'theWidgetId.myArea' );
         } );

      } );

   } );

} );
