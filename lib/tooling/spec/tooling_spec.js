/**
 * Copyright 2016 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
import { create as createTooling } from '../tooling';
import { FLAT } from '../pages';
import { create as createEventBusMock } from '../../testing/event_bus_mock';

describe( 'The page tooling provider', () => {

   let debugEventBus;
   let pagesProvider;

   beforeEach( () => {
      debugEventBus = createEventBusMock();
      const tooling = createTooling( debugEventBus );

      tooling.registerDebugInfo( {
         aliases: {
            pages: { p: 0, q: 1 },
            widgets: { w: 0 }
         },
         pages: [
            { name: 'my first page', [ FLAT ]: { layout: 'some-layout.html' }, compositions: [] },
            { name: 'my second page', [ FLAT ]: { layout: 'some-other-layout.html' }, compositions: [] }
         ],
         widgets: [
            { DESC: { name: 'w' } }
         ]
      } );

      tooling.registerItem( {
         instance: 'inst-id0',
         item: 'item-id1'
      } );

      pagesProvider = tooling.pages;
      pagesProvider.enable();

      debugEventBus.publish( 'didLoad.page.inst-id0.item-id1', { page: 'p' } );
      debugEventBus.flush();
   } );

   ////////////////////////////////////////////////////////////////////////////////////////////////////////

   it( 'allows to access page definitions by reference', () => {
      expect( pagesProvider.current().pageDefinitions.p[ FLAT ] ).toEqual( { layout: 'some-layout.html' } );
   } );

   ////////////////////////////////////////////////////////////////////////////////////////////////////////

   it( 'allows to access widget descriptors by reference', () => {
      expect( pagesProvider.current().widgetDescriptors.w ).toEqual( { name: 'w' } );
   } );

   ////////////////////////////////////////////////////////////////////////////////////////////////////////

   it( 'allows to access the current page reference', () => {
      expect( pagesProvider.current().pageReference ).toEqual( 'p' );
   } );

   ////////////////////////////////////////////////////////////////////////////////////////////////////////

   describe( 'with registered listeners', () => {

      let observedPageInfo;

      beforeEach( () => {
         pagesProvider.addListener( pageInfo => {
            observedPageInfo = pageInfo;
         } );
         debugEventBus.publish( 'didUnload.page.inst-id0.item-id1', { page: 'p' } );
         debugEventBus.publish( 'didLoad.page.inst-id0.item-id1', { page: 'q' } );
         debugEventBus.flush();
      } );

      /////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'notifies listeners about page changes', () => {
         expect( observedPageInfo ).toBeDefined();
         expect( observedPageInfo.pageReference ).toEqual( 'q' );
      } );

      /////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'cleans up old pages', () => {
         expect( pagesProvider.current().pageDefinitions.p ).not.toBeDefined();
      } );

   } );

} );
