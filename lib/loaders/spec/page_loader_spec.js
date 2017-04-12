/**
 * Copyright 2016 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
import { create as createPageLoader } from '../page_loader';
import { create as createArtifactProviderMock } from '../../testing/artifact_provider_mock';
import { create as createEventBusMock } from '../../testing/event_bus_mock';
import { deepClone, forEach } from '../../utilities/object';
import pages from './data/pages';

describe( 'A PageLoader', () => {

   let artifactProviderMock;
   let pageLoader;
   let debugEventBusMock;

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   beforeEach( () => {
      const files = {};
      artifactProviderMock = createArtifactProviderMock( files );
      forEach( pages, ( definition, name ) => {
         artifactProviderMock.forPage.mock( name, {
            definition,
            descriptor: { name }
         } );
      } );

      debugEventBusMock = createEventBusMock();
      pageLoader = createPageLoader( artifactProviderMock, debugEventBusMock );
   } );

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   it( 'throws if created with missing requirements', () => {
      expect( () => { createPageLoader(); } ).toThrow();
      expect( () => { createPageLoader( '' ); } ).toThrow();
   } );

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   it( 'does not throw if it is created with the correct requirements', () => {
      expect( () => { createPageLoader( artifactProviderMock, debugEventBusMock ); } ).not.toThrow();
   } );

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   it( 'has a method to load a page', () => {
      expect( typeof pageLoader.load ).toEqual( 'function' );
   } );

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   describe( 'when loading a page', () => {

      let resolvedPage;
      beforeEach( () => {
         resolvedPage = deepClone( pages.somePage );
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'rejects for a page that does not exist', done => {
         pageLoader.load( 'iDontExist' )
            .then( done.fail, err => {
               expect( err ).toEqual( new Error( 'Artifact iDontExist not found in pages' ) );
            } )
            .then( done );
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'resolves with the loaded page', done => {
         pageLoader.load( 'somePage' )
            .then( page => expect( page ).toEqual( resolvedPage ) )
            .then( done, done.fail );
      } );

   } );

} );
