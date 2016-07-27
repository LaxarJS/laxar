/**
 * Copyright 2016 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
import { create as createArtifactProviderMock, MOCK_THEME } from '../artifact_provider_mock';


describe( 'An artifactProvider mock', () => {

   let artifactProviderMock;

   describe( 'created without explicit theme', () => {

      beforeEach( () => {
         artifactProviderMock = createArtifactProviderMock();
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'offers mock APIs for all types of artifacts', () => {
         expect( artifactProviderMock.forFlow.mock ).toEqual( jasmine.any( Function ) );
         expect( artifactProviderMock.forTheme.mock ).toEqual( jasmine.any( Function ) );
         expect( artifactProviderMock.forPage.mock ).toEqual( jasmine.any( Function ) );
         expect( artifactProviderMock.forLayout.mock ).toEqual( jasmine.any( Function ) );
         expect( artifactProviderMock.forWidget.mock ).toEqual( jasmine.any( Function ) );
         expect( artifactProviderMock.forControl.mock ).toEqual( jasmine.any( Function ) );
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      describe( 'asked to mock artifact parts', () => {

         beforeEach( () => {
            artifactProviderMock.forFlow.mock( 'a-flow', {
               descriptor: { name: 'main' }
            } );
            artifactProviderMock.forControl.mock( 'a-control', {
               module: { hey: 'there' }
            } );
            artifactProviderMock.forPage.mock( 'a-page', {
               definition: { extends: 'base' }
            } );
            artifactProviderMock.forWidget.mock( 'a-widget', {
               assets: {
                  'some.txt': { content: 'Hello, world!' },
                  'some.png': { url: 'path/to/my-images/some.png' }
               }
            } );
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'provides these parts', done => {
            Promise.all( [
               artifactProviderMock.forFlow( 'a-flow' ).descriptor().then( _ => {
                  expect( _ ).toEqual( { name: 'main' } );
               } ),
               artifactProviderMock.forControl( 'a-control' ).module().then( _ => {
                  expect( _ ).toEqual( { hey: 'there' } );
               } ),
               artifactProviderMock.forPage( 'a-page' ).definition().then( _ => {
                  expect( _ ).toEqual( { extends: 'base' } );
               } ),
               artifactProviderMock.forWidget( 'a-widget' ).asset( 'some.txt' ).then( _ => {
                  expect( _ ).toEqual( 'Hello, world!' );
               } ),
               artifactProviderMock.forWidget( 'a-widget' ).assetUrl( 'some.png' ).then( _ => {
                  expect( _ ).toEqual( 'path/to/my-images/some.png' );
               } )
            ] )
            .then( done, done.fail );
         } );

      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      describe( 'asked mock widget assets for the mock theme', () => {

         beforeEach( () => {
            artifactProviderMock.forWidget.mock( 'a-widget', {
               assets: {
                  [ MOCK_THEME ]: {
                     'some.txt': { content: 'Hello, world!' },
                     'some.png': { url: 'path/to/my-images/some.png' }
                  }
               }
            } );
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'provides these themed assets', done => {
            Promise.all( [
               artifactProviderMock.forWidget( 'a-widget' ).assetForTheme( 'some.txt' ).then( _ => {
                  expect( _ ).toEqual( 'Hello, world!' );
               } ),
               artifactProviderMock.forWidget( 'a-widget' ).assetUrlForTheme( 'some.png' ).then( _ => {
                  expect( _ ).toEqual( 'path/to/my-images/some.png' );
               } )
            ] )
            .then( done, done.fail );
         } );

      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      describe( 'asked to mock a page definition', () => {

         beforeEach( () => {
            artifactProviderMock.forPage.mock( 'a-page', {
               definition: { extends: 'base' }
            } );
         } );

         it( 'clones the definition when asked for it', done => {
            artifactProviderMock.forPage( 'a-page' ).definition().then( p1 => {
               return artifactProviderMock.forPage( 'a-page' ).definition().then( p2 => {
                  expect( p1 ).toEqual( p2 );
                  p1.test = 'modified';
                  expect( p1.test ).toEqual( 'modified' );
                  expect( p2.test ).not.toBeDefined();
               } );
            } )
            .then( done, done.fail );
         } );

      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      describe( 'asked for parts of artifacts that *were not* mocked', () => {

         let results;

         beforeEach( done => {
            results = [];
            const collect = _ => { results.push( _ ); };

            Promise.all( [
               artifactProviderMock.forFlow( 'a-flow' ).descriptor().then( done.fail, collect ),
               artifactProviderMock.forControl( 'a-control' ).module().then( done.fail, collect ),
               artifactProviderMock.forPage( 'a-page' ).definition().then( done.fail, collect ),
               artifactProviderMock.forWidget( 'a-widget' ).asset( 'some-asset' ).then( done.fail, collect )
            ] )
            .then( done, done.fail );
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'rejects their promises', () => {
            expect( results.length ).toEqual( 4 );
         } );

      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      describe( 'asked for unmocked parts of artifacts that *were* mocked', () => {

         let results;

         beforeEach( done => {
            const collect = _ => { results = _; };

            artifactProviderMock.forFlow.mock( 'a-flow', {} );
            artifactProviderMock.forControl.mock( 'a-control', {} );
            artifactProviderMock.forPage.mock( 'a-page', {} );
            artifactProviderMock.forWidget.mock( 'a-widget', {} );

            Promise.all( [
               artifactProviderMock.forFlow( 'a-flow' ).descriptor(),
               artifactProviderMock.forControl( 'a-control' ).module(),
               artifactProviderMock.forPage( 'a-page' ).definition(),
               artifactProviderMock.forWidget( 'a-widget' ).asset( 'some-asset' )
            ] )
            .then( collect )
            .then( done, done.fail );
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'resolves their promises with null', () => {
            expect( results.length ).toEqual( 4 );
         } );

      } );

   } );

} );
