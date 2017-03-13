/**
 * Copyright 2016 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
import { create as createLayoutLoader } from '../layout_loader';
import { create as createArtifactProviderMock, MOCK_THEME } from '../../testing/artifact_provider_mock';

describe( 'A layout loader', () => {

   let layoutLoader;
   let artifactProviderMock;

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
      layoutLoader = createLayoutLoader( artifactProviderMock );
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

   } );

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   describe( 'asked to load an existing layout with alternative style source', () => {

      let result;

      beforeEach( done => {
         const name = 'alternative-layout';
         artifactProviderMock.forLayout.mock( name, {
            descriptor: {
               name,
               styleSource: 'scss/whatever.scss',
               templateSource: 'to-be-processed.html'
            },
            assets: {
               [ MOCK_THEME ]: {
                  'to-be-processed.html': { content: '<h1>I was compiled or something</h1>' },
                  'scss/whatever.scss': { url: 'path/to/compiled.css' }
               }
            }
         } );

         layoutLoader.load( name )
            .then( _ => { result = _; } )
            .then( done, done.fail );
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'provides the customized layout HTML', () => {
         expect( result.html ).toEqual( '<h1>I was compiled or something</h1>' );
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
