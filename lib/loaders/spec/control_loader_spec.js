/**
 * Copyright 2016 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
import { create as createControlLoader } from '../control_loader';
import { create as createArtifactProviderMock, MOCK_THEME } from '../../testing/artifact_provider_mock';

describe( 'The control loader', () => {

   let mockModule;
   let mockDescriptor;
   let artifactProviderMock;
   let controlLoader;

   beforeEach( () => {
      mockModule = { 'I am': 'in control' };

      mockDescriptor = {
         name: 'some-great-control',
         integration: { technology: 'plain' }
      };

      artifactProviderMock = createArtifactProviderMock();
      artifactProviderMock.forControl.mock( 'some-control', {
         descriptor: mockDescriptor,
         module: mockModule,
         assets: {
            [ MOCK_THEME ]: {
               'css/some-great-control.css': { url: 'path/to/the-styles.css' }
            }
         }
      } );

      controlLoader = createControlLoader( artifactProviderMock );
   } );

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   it( 'returns a controls loader instance', () => {
      expect( controlLoader.provide ).toEqual( jasmine.any( Function ) );
      expect( controlLoader.load ).toEqual( jasmine.any( Function ) );
   } );

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   describe( 'asked to load an existing control', () => {

      beforeEach( done => {
         controlLoader.load( 'some-control' )
            .then( done, done.fail );
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      describe( 'and then asked to provide the implementation module', () => {

         let module;

         beforeEach( () => {
            module = controlLoader.provide( 'some-control' );
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'synchronously hands out the descriptor', () => {
            expect( module ).toEqual( mockModule );
         } );
      } );
   } );

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   describe( 'asked to load an existing control with alternative style source', () => {

      beforeEach( done => {
         artifactProviderMock.forControl.mock( 'alternative-control', {
            descriptor: {
               name: 'alternative-control',
               styleSource: 'scss/custom.scss',
               integration: { technology: 'plain' }
            },
            module: mockModule,
            assets: {
               [ MOCK_THEME ]: {
                  'scss/custom.scss': { url: 'path/to/compiled.css' }
               }
            }
         } );

         controlLoader.load( 'alternative-control' )
            .then( done, done.fail );
      } );

   } );

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   describe( 'asked to provide a implementation module without loading it first', () => {

      it( 'fails to provide the module', () => {
         expect( () => { controlLoader.provide( 'some-control' ); } ).toThrow();
      } );

   } );

} );
