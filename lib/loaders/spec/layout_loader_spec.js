/**
 * Copyright 2016 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
import { create as createLayoutLoader } from '../layout_loader';
import { create as createArtifactProviderMock, MOCK_THEME } from '../../testing/artifact_provider_mock';
import { create as createCssLoaderMock } from '../../testing/css_loader_mock';

describe( 'A layout loader', () => {

   let layoutLoader;
   let artifactProviderMock;
   let cssLoaderMock;

   beforeEach( () => {
      artifactProviderMock = createArtifactProviderMock();
      artifactProviderMock.forLayout.mock( 'hans', {
         descriptor: {
            name: 'peter'
         },
         assets: {
            [ MOCK_THEME ]: {
               'peter.html': { content: '<blink>Peter &amp; Hans</blink>' },
               'css/peter.css': { url: 'path/layouts/peter.css' }
            }
         }
      } );
      cssLoaderMock = createCssLoaderMock();
      layoutLoader = createLayoutLoader( artifactProviderMock, cssLoaderMock );
   } );

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   describe( 'asked to load an existing layout', () => {

      let result;

      beforeEach( done => {
         layoutLoader.load( 'hans' )
            .then( _ => { result = _; } )
            .then( done, done.fail );
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'provides the canonical layout name', () => {
         expect( result.name ).toEqual( 'peter' );
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'provides the layout HTML', () => {
         expect( result.html ).toEqual( '<blink>Peter &amp; Hans</blink>' );
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'loads the layout CSS', () => {
         expect( cssLoaderMock.load ).toHaveBeenCalledWith( 'path/layouts/peter.css' );
      } );

   } );

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   describe( 'asked to load a non-existent layout', () => {

      let result;

      beforeEach( done => {
         layoutLoader.load( 'peter' )
            .then( _ => { result = _; } )
            .then( done.fail, done );
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'fails', () => {
         expect( result ).not.toBeDefined();
      } );

   } );

} );
