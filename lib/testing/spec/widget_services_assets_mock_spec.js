/**
 * Copyright 2016 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */

import { create as createWidgetServicesAssetsMock } from '../widget_services_assets_mock';

describe( 'An axAssets mock', () => {

   let assets;
   let axAssetsMock;

   const makeAssets = () => ({
      'myMessages.json': { content: '{"yo":42}', url: '/some/messages.json' },
      'default.theme': {
         'some.html': { content: '<h3>Hey!</h3>' },
         'some.png': { url: '/path/to/some.png' }
      },
      'custom.theme': {
         'some.html': { content: '<h3>Hello, Customer!</h3>' }
      }
   });

   beforeEach( () => {
      assets = makeAssets();
   } );

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   describe( 'created for the default theme', () => {

      beforeEach( () => {
         axAssetsMock = createWidgetServicesAssetsMock( assets );
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      describe( 'asked to provide assets', () => {

         let myMessages;
         let myMessagesUrl;
         let themeHtml;
         let somePngUrl;
         let missingAsset;

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         beforeEach( done => {
            Promise.all( [
               axAssetsMock( 'myMessages.json' ),
               axAssetsMock.url( 'myMessages.json' ),
               axAssetsMock.forTheme( 'some.html' ),
               axAssetsMock.urlForTheme( 'some.png' ),
               axAssetsMock( 'missing' )
            ] )
               .then( _ => {
                  [
                     myMessages,
                     myMessagesUrl,
                     themeHtml,
                     somePngUrl,
                     missingAsset
                  ] = _;
               } )
               .then( done, done.fail );
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'spies on axAssets functionality', () => {
            expect( axAssetsMock ).toHaveBeenCalledWith( 'myMessages.json' );
            expect( axAssetsMock.url ).toHaveBeenCalledWith( 'myMessages.json' );
            expect( axAssetsMock.forTheme ).toHaveBeenCalledWith( 'some.html' );
            expect( axAssetsMock.urlForTheme ).toHaveBeenCalledWith( 'some.png' );
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'provides configured assets', () => {
            expect( myMessages ).toEqual( '{"yo":42}' );
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'provides configured asset urls', () => {
            expect( myMessagesUrl ).toEqual( '/some/messages.json' );
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'provides configured assets for the default theme', () => {
            expect( themeHtml ).toEqual( '<h3>Hey!</h3>' );
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'provides configured asset urls for the default theme', () => {
            expect( somePngUrl ).toEqual( '/path/to/some.png' );
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'provides null for missing entries', () => {
            expect( missingAsset ).toEqual( null );
         } );

      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      describe( 'configured with custom assets', () => {

         beforeEach( () => {
            axAssetsMock.mockUrl( 'myMessages.json', '/some/different.json' );
            axAssetsMock.mockForTheme( 'some.html' );
            axAssetsMock.mock( 'new.html', '<h4>Whaddup!</h4>' );
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'does not modify the original assets object', () => {
            expect( assets ).toEqual( makeAssets() );
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         describe( 'asked for previously configured assets', () => {

            let myMessages;
            let somePngUrl;

            beforeEach( done => {
               Promise.all( [
                  axAssetsMock( 'myMessages.json' ),
                  axAssetsMock.urlForTheme( 'some.png' )
               ] )
                  .then( _ => {
                     [
                        myMessages,
                        somePngUrl
                     ] = _;
                  } )
                  .then( done, done.fail );
            } );

            //////////////////////////////////////////////////////////////////////////////////////////////////

            it( 'still provides them as previously configured', () => {
               expect( myMessages ).toEqual( '{"yo":42}' );
               expect( somePngUrl ).toEqual( '/path/to/some.png' );
            } );

         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         describe( 'asked for previously existing, but re-configured assets', () => {

            let myMessagesUrl;
            let themeHtml;

            beforeEach( done => {
               Promise.all( [
                  axAssetsMock.url( 'myMessages.json' ),
                  axAssetsMock.forTheme( 'some.html' )
               ] )
                  .then( _ => {
                     [
                        myMessagesUrl,
                        themeHtml
                     ] = _;
                  } )
                  .then( done, done.fail );
            } );

            //////////////////////////////////////////////////////////////////////////////////////////////////

            it( 'provides the new values', () => {
               expect( myMessagesUrl ).toEqual( '/some/different.json' );
               expect( themeHtml ).toEqual( null );
            } );

         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         describe( 'asked for newly configured assets', () => {

            let newHtml;

            beforeEach( done => {
               axAssetsMock( 'new.html' )
                  .then( _ => { newHtml = _; } )
                  .then( done, done.fail );
            } );

            //////////////////////////////////////////////////////////////////////////////////////////////////

            it( 'provides the new values', () => {
               expect( newHtml ).toEqual( '<h4>Whaddup!</h4>' );
            } );

         } );

      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      describe( 'created for a custom theme', () => {

         beforeEach( () => {
            axAssetsMock = createWidgetServicesAssetsMock( assets, 'custom.theme' );
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         describe( 'asked to provide assets', () => {

            let themeHtml;

            //////////////////////////////////////////////////////////////////////////////////////////////////

            beforeEach( done => {
               axAssetsMock.forTheme( 'some.html' )
                  .then( _ => { themeHtml = _; } )
                  .then( done, done.fail );
            } );

            //////////////////////////////////////////////////////////////////////////////////////////////////

            it( 'provides configured assets for the custom theme', () => {
               expect( themeHtml ).toEqual( '<h3>Hello, Customer!</h3>' );
            } );

         } );

      } );

   } );

} );
