/**
 * Copyright 2016 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
import { create as createLayoutLoader } from '../layout_loader';
import { create as createThemeManager } from '../../runtime/theme_manager';
import { create as createFrpMock } from '../../testing/file_resource_provider_mock';

describe( 'A layout loader', () => {

   let cssLoaderMock;

   let listings;
   let theme;

   beforeEach( () => {
      theme = 'default';
   } );

   ////////////////////////////////////////////////////////////////////////////////////////////////////////

   function createTestBed() {
      cssLoaderMock = jasmine.createSpyObj( 'cssLoaderSpy', [ 'load' ] );
      const fileResourceProviderMock = createFrpMock( listings );

      return {
         layoutLoader: createLayoutLoader(
            'path/to/layouts/',
            'path/to/themes/',
            cssLoaderMock,
            createThemeManager( fileResourceProviderMock, cssLoaderMock, theme ),
            fileResourceProviderMock
         )
      };
   }

   ////////////////////////////////////////////////////////////////////////////////////////////////////////

   describe( 'when there is an application layout directory matching the requested theme', () => {

      let result;

      beforeEach( () => {
         theme = 'themeA';
         listings = {
            'path/to/layouts/abc/themeA.theme/abc.html': '<h1>layout abc for theme A here</h1>',
            'path/to/layouts/abc/themeA.theme/css/abc.css': 1
         };
      } );

      /////////////////////////////////////////////////////////////////////////////////////////////////////

      beforeEach( done => {
         createTestBed().layoutLoader.load( 'abc' )
            .then( layoutInfo => { result = layoutInfo; } )
            .then( done );
      } );

      /////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'sets the layout path to that directory', () => {
         expect( result.html ).toEqual( 'path/to/layouts/abc/themeA.theme/abc.html' );
      } );

      /////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'loads the css from that directory', () => {
         expect( cssLoaderMock.load ).toHaveBeenCalledWith( 'path/to/layouts/abc/themeA.theme/css/abc.css' );
      } );

   } );

   ////////////////////////////////////////////////////////////////////////////////////////////////////////

   describe( 'when there is *no* application layout directory matching the requested theme', () => {

      let result;

      describe( 'but there is an application layout directory for the default theme', () => {

         beforeEach( done => {
            listings = {
               'path/to/layouts/abc/default.theme/abc.html': '<h1>layout abc for the default theme</h1>',
               'path/to/layouts/abc/default.theme/css/abc.css': 1
            };
            createTestBed().layoutLoader.load( 'abc' )
               .then( layoutInfo => { result = layoutInfo; } )
               .then( done );
         } );

         //////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'uses the html file provided by the default theme', () => {
            expect( result.htmlContent ).toEqual( '<h1>layout abc for the default theme</h1>' );
         } );

         //////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'loads the css provided by the default theme', () => {
            expect( cssLoaderMock.load )
               .toHaveBeenCalledWith( 'path/to/layouts/abc/default.theme/css/abc.css' );
         } );

      } );

      /////////////////////////////////////////////////////////////////////////////////////////////////////

      describe( 'and there is no application layout directory for the default theme', () => {

         beforeEach( done => {
            listings = {};
            createTestBed().layoutLoader.load( 'abc' )
               .then( layoutInfo => { result = layoutInfo; } )
               .then( done );
         } );

         //////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'informs that no layout HTML is available', () => {
            expect( result.html ).toBe( null );
         } );

         //////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'does not provide any HTML content', () => {
            expect( result.htmlContent ).not.toBeDefined();
         } );


         //////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'does not try to load any CSS', () => {
            expect( cssLoaderMock.load ).not.toHaveBeenCalled();
         } );

      } );

   } );

   /////////////////////////////////////////////////////////////////////////////////////////////////////

   describe( 'when the theme itself contains the layout to load', () => {

      let result;

      beforeEach( () => {
         theme = 'A';
         listings = {
            'path/to/themes/A.theme/layouts/XYZ/XYZ.html': '<h1>layout XYZ from theme A</h1>',
            'path/to/themes/A.theme/layouts/XYZ/css/XYZ.css': 1
         };
      } );

      /////////////////////////////////////////////////////////////////////////////////////////////////////

      describe( 'and the application does not override it', () => {

         beforeEach( done => {
            createTestBed().layoutLoader.load( 'XYZ' )
               .then( layoutInfo => { result = layoutInfo; } )
               .then( done );
         } );

         //////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'uses the html file provided by the theme', () => {
            expect( result.html ).toEqual( 'path/to/themes/A.theme/layouts/XYZ/XYZ.html' );
         } );

         //////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'loads the css provided by the theme', () => {
            expect( cssLoaderMock.load )
               .toHaveBeenCalledWith( 'path/to/themes/A.theme/layouts/XYZ/css/XYZ.css' );
         } );

      } );

      /////////////////////////////////////////////////////////////////////////////////////////////////////

      describe( 'and the application overrides it', () => {

         beforeEach( done => {
            listings[ 'path/to/layouts/XYZ/A.theme/XYZ.html' ] = '<h1>layout XYZ by app</h1>';
            listings[ 'path/to/layouts/XYZ/A.theme/css/XYZ.css' ] = 1;
            createTestBed().layoutLoader.load( 'XYZ' )
               .then( layoutInfo => { result = layoutInfo; } )
               .then( done );
         } );

         //////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'sets the layout path to that directory', () => {
            expect( result.html ).toEqual( 'path/to/layouts/XYZ/A.theme/XYZ.html' );
            expect( result.htmlContent ).toEqual( '<h1>layout XYZ by app</h1>' );
         } );

         //////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'loads the css from that directory', () => {
            expect( cssLoaderMock.load ).toHaveBeenCalledWith( 'path/to/layouts/XYZ/A.theme/css/XYZ.css' );
         } );

      } );

   } );

} );
