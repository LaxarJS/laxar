/**
 * Copyright 2016 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
import { createCollectors, createProviders } from '../tooling';
import { FLAT } from '../pages';
import { create as createLogMock } from '../../testing/log_mock';
import { create as createConfigurationMock } from '../../testing/configuration_mock';

describe( 'The page tooling provider', () => {

   let configuration;
   let log;
   let pagesCollector;
   let pagesProvider;

   beforeEach( () => {
      configuration = createConfigurationMock();
      log = createLogMock();
      const collectors = createCollectors( configuration, log );
      pagesCollector = collectors.pages;
      pagesProvider = createProviders( collectors ).pages;
      pagesProvider.enable();

      pagesCollector.collectPageDefinition( 'p', { name: 'my page' }, FLAT );
      pagesCollector.collectWidgetDescriptor( 'w', { name: 'w' } );
      pagesCollector.collectCurrentPage( 'p' );
   } );

   ////////////////////////////////////////////////////////////////////////////////////////////////////////

   it( 'allows to access page definitions by reference', () => {
      expect( pagesProvider.current().pageDefinitions.p[ FLAT ] ).toEqual( { name: 'my page' } );
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
         pagesProvider.addListener( function( pageInfo ) {
            observedPageInfo = pageInfo;
         } );
         pagesCollector.collectPageDefinition( 'x', { name: 'x' }, FLAT );
         pagesCollector.collectCurrentPage( 'x' );
      } );

      /////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'notifies listeners about page changes', () => {
         expect( observedPageInfo ).toBeDefined();
         expect( observedPageInfo.pageReference ).toEqual( 'x' );
      } );

      /////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'cleans up old pages', () => {
         expect( pagesProvider.current().pageDefinitions.p ).not.toBeDefined();
      } );

   } );

} );
