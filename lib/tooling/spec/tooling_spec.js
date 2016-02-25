/**
 * Copyright 2016 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
import pageTooling from '../pages';

describe( 'The page tooling API', () => {

   beforeEach( () => {
      pageTooling.enable();

      pageTooling.setPageDefinition( 'p', { name: 'my page' }, pageTooling.FLAT );
      pageTooling.setWidgetDescriptor( 'w', { name: 'w' } );
      pageTooling.setCurrentPage( 'p' );
   } );

   ////////////////////////////////////////////////////////////////////////////////////////////////////////

   it( 'allows to access page definitions by reference', () => {
      expect( pageTooling.current().pageDefinitions.p[ pageTooling.FLAT ] ).toEqual( { name: 'my page' } );
   } );

   ////////////////////////////////////////////////////////////////////////////////////////////////////////

   it( 'allows to access widget descriptors by reference', () => {
      expect( pageTooling.current().widgetDescriptors.w ).toEqual( { name: 'w' } );
   } );

   ////////////////////////////////////////////////////////////////////////////////////////////////////////

   it( 'allows to access the current page reference', () => {
      expect( pageTooling.current().pageReference ).toEqual( 'p' );
   } );

   ////////////////////////////////////////////////////////////////////////////////////////////////////////

   describe( 'with registered listeners', () => {

      let observedPageInfo_;

      beforeEach( () => {
         pageTooling.addListener( function( pageInfo ) {
            observedPageInfo_ = pageInfo;
         } );
         pageTooling.setPageDefinition( 'x', { name: 'x' }, pageTooling.FLAT );
         pageTooling.setCurrentPage( 'x' );
      } );

      /////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'notifies listeners about page changes', () => {
         expect( observedPageInfo_ ).toBeDefined();
         expect( observedPageInfo_.pageReference ).toEqual( 'x' );
      } );

      /////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'cleans up old pages', () => {
         expect( pageTooling.current().pageDefinitions.p ).not.toBeDefined();
      } );

   } );

} );
