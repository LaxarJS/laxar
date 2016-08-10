/**
 * Copyright 2016 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
import { create as createArtifactProvider } from '../artifact_provider';
import { create as createArtifactsMock } from './data/artifact_data';
import { create as createBrowserMock } from '../../testing/browser_mock';
import { create as createConfigurationMock } from '../../testing/configuration_mock';
import { create as createLogMock } from '../../testing/log_mock';

describe( 'An artifactProvider', () => {

   let artifactProvider;
   let artifactsMock;
   let browserMock;
   let configurationMock;
   let logMock;

   beforeEach( () => {
      artifactsMock = createArtifactsMock();
      browserMock = createBrowserMock();
      browserMock.respondWith( 'what/ever', { myMessage: 'Ola!' } );
      configurationMock = createConfigurationMock( { theme: 'western', base: '' } );
      logMock = createLogMock();
      artifactProvider = createArtifactProvider( artifactsMock, browserMock, configurationMock, logMock );
   } );

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   it( 'can be created', () => {
      expect( artifactProvider ).toBeDefined();
   } );

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   describe( 'configured with a theme that does not exist', () => {

      beforeEach( () => {
         configurationMock = createConfigurationMock( { theme: 'missing', base: '' } );
         artifactProvider = createArtifactProvider( artifactsMock, browserMock, configurationMock, logMock );
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'logs an error', () => {
         expect( logMock.error ).toHaveBeenCalled();
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'uses the default theme', done => {
         artifactProvider.forTheme().descriptor().then( _ => {
            expect( _.name ).toEqual( 'default.theme' );
         } )
         .then( done, done.fail );
      } );

   } );

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   describe( 'when asked for a theme', () => {

      let themeProvider;

      beforeEach( () => {
         themeProvider = artifactProvider.forTheme();
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'selects the theme based on the configuration', done => {
         expect( configurationMock.get ).toHaveBeenCalledWith( 'theme' );
         themeProvider.descriptor()
            .then( ({ name }) => {
               expect( name ).toEqual( 'best.theme' );
            } )
            .then( done, done.fail );
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'provides a URL for the theme\'s main CSS file', done => {
         themeProvider.assetUrl( 'css/theme.css' )
            .then( url => {
               expect( url ).toEqual( 'path/to/best/theme.css' );
            } )
            .then( done, done.fail );
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'throws an error when asked to provide an asset without path', () => {
         expect( () => themeProvider.assetUrlForTheme() ).toThrow();
      } );

   } );

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   describe( 'when asked for a flow', () => {

      let flowProvider;

      beforeEach( () => {
         flowProvider = artifactProvider.forFlow( 'main' );
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'provides the flow descriptor', done => {
         flowProvider.descriptor()
            .then( ({ name }) => {
               expect( name ).toEqual( 'mainz' );
            } )
            .then( done, done.fail );
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'provides the flow definition', done => {
         flowProvider.definition()
            .then( def => {
               expect( def ).toEqual( artifactsMock.flows[ 0 ].definition );
            } )
            .then( done, done.fail );
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'makes a copy when handing out the flow definition', done => {
         flowProvider.definition()
            .then( def => {
               def.modification = true;
               expect( artifactsMock.flows[ 0 ].definition.modification ).not.toBeDefined();
            } )
            .then( done, done.fail );
      } );

   } );

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   describe( 'when asked for a widget', () => {

      let widgetProvider;

      beforeEach( () => {
         widgetProvider = artifactProvider.forWidget( 'amd:hallo-widget' );
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'provides the widget descriptor', done => {
         widgetProvider.descriptor()
            .then( ({ name }) => {
               expect( name ).toEqual( 'some-widget' );
            } )
            .then( done, done.fail );
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'provides the widget module', done => {
         widgetProvider.module()
            .then( module => {
               expect( module ).toBe( artifactsMock.widgets[ 0 ].module );
            } )
            .then( done, done.fail );
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'provides access to widget HTML for the correct theme', done => {
         widgetProvider.assetForTheme( 'some-widget.html' )
            .then( html => {
               const { content } = artifactsMock.widgets[ 0 ].assets[ 'default.theme' ][ 'some-widget.html' ];
               expect( html ).toEqual( content );
            } )
            .then( done, done.fail );
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'provides access to widget CSS for the correct theme', done => {
         widgetProvider.assetUrlForTheme( 'css/some-widget.css' )
            .then( result => {
               const { url } = artifactsMock.widgets[ 0 ].assets[ 'best.theme' ][ 'css/some-widget.css' ];
               expect( result ).toEqual( url );
            } )
            .then( done, done.fail );
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'provides access to custom assets bundled into the artifacts listing', done => {
         widgetProvider.asset( 'messages.json' )
            .then( result => {
               expect( browserMock.fetch ).not.toHaveBeenCalled();
               expect( JSON.parse( result ) ).toEqual( { myMessage: 'hey!' } );
            } )
            .then( done, done.fail );
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'provides access to custom assets referenced by URL', done => {
         widgetProvider.asset( 'messages.de.json' )
            .then( result => {
               expect( browserMock.fetch ).toHaveBeenCalledWith( 'what/ever' );
               expect( JSON.parse( result ) ).toEqual( { myMessage: 'Ola!' } );
            } )
            .then( done, done.fail );
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'provides access to URLs (for custom assets referenced by URL)', done => {
         widgetProvider.assetUrl( 'image.png' )
            .then( result => {
               expect( browserMock.fetch ).not.toHaveBeenCalled();
               const { url } = artifactsMock.widgets[ 0 ].assets[ 'image.png' ];
               expect( result ).toEqual( url );
            } )
            .then( done, done.fail );
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'provides access to themed asset URLs (for custom assets referenced by URL)', done => {
         widgetProvider.assetUrlForTheme( 'icon.png' )
            .then( result => {
               expect( browserMock.fetch ).not.toHaveBeenCalled();
               const { url } = artifactsMock.widgets[ 0 ].assets[ 'default.theme' ][ 'icon.png' ];
               expect( result ).toEqual( url );
            } )
            .then( done, done.fail );
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'returns null when asked for the content of a non-existing asset', done => {
         widgetProvider.asset( 'no-such.json' )
            .then( result => {
               expect( result ).toBe( null );
            } )
            .then( done, done.fail );
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'returns null when asked for the URL of a non-existing themed asset', done => {
         widgetProvider.assetForTheme( 'no-such.json' )
            .then( result => {
               expect( result ).toBe( null );
            } )
            .then( done, done.fail );
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'returns null when asked for the URL of a non-existing asset', done => {
         widgetProvider.assetUrl( 'no-such.png' )
            .then( result => {
               expect( result ).toBe( null );
            } )
            .then( done, done.fail );
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'returns null when asked for the URL of a non-existing themed asset', done => {
         widgetProvider.assetUrlForTheme( 'no-such.png' )
            .then( result => {
               expect( result ).toBe( null );
            } )
            .then( done, done.fail );
      } );

   } );

} );
