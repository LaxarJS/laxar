/**
 * Copyright 2016 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
import { create as createThemeManager } from '../theme_manager';
import { create as createFrpMock } from '../../testing/file_resource_provider_mock';
import { create as createCssLoaderMock } from '../../testing/css_loader_mock';
import { tabulate } from '../../utilities/object';

describe( 'The axThemeManager', () => {

   let resolvedSpy;

   beforeEach( () => {
      resolvedSpy = jasmine.createSpy( 'resolvedSpy' );
   } );

   ////////////////////////////////////////////////////////////////////////////////////////////////////////

   it( 'getTheme() returns the configured theme', () => {
      expect( createThemeManager(
         createFrpMock( {} ),
         createCssLoaderMock(),
         'cyan'
      ).getTheme() ).toEqual( 'cyan' );
   } );

   ////////////////////////////////////////////////////////////////////////////////////////////////////////

   describe( 'loadThemeCss()', () => {

      let frpMock;
      let cssLoaderMock;
      beforeEach( () => {
         frpMock = createFrpMock( {
            'path/to/the/themes/purple.theme/css/theme.css': 1,
            'path/default.theme/css/theme.css': 1
         } );
         cssLoaderMock = createCssLoaderMock();
      } );

      /////////////////////////////////////////////////////////////////////////////////////////////////////

      describe( 'when using the default theme', () => {

         beforeEach( done => {
            createThemeManager( frpMock, cssLoaderMock, 'default' )
               .loadThemeCss( {
                  THEMES: 'path/to/the/themes',
                  DEFAULT_THEME: 'path/default.theme'
               } )
               .then( done );
         } );

         //////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'tries to load the default theme CSS', () => {
            expect( frpMock.isAvailable )
               .toHaveBeenCalledWith( 'path/default.theme/css/theme.css' );
            expect( cssLoaderMock.load )
               .toHaveBeenCalledWith( 'path/default.theme/css/theme.css' );
         } );

      } );

      /////////////////////////////////////////////////////////////////////////////////////////////////////

      describe( 'when using a custom theme', () => {

         beforeEach( done => {
            createThemeManager( frpMock, cssLoaderMock, 'purple' )
               .loadThemeCss( {
                  THEMES: 'path/to/the/themes',
                  DEFAULT_THEME: 'path/default.theme'
               } )
               .then( done );
         } );

         //////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'tries to load the corresponding CSS', () => {
            expect( frpMock.isAvailable )
               .toHaveBeenCalledWith( 'path/to/the/themes/purple.theme/css/theme.css' );
            expect( cssLoaderMock.load )
               .toHaveBeenCalledWith( 'path/to/the/themes/purple.theme/css/theme.css' );
         } );

      } );

   } );

   ////////////////////////////////////////////////////////////////////////////////////////////////////////

   describe( 'urlProvider( artifactPattern, themePattern )', () => {

      function runProvideTest( availableFiles, searchFiles ) {
         const listing = tabulate( () => 1, availableFiles );
         const themeManager = createThemeManager(
            createFrpMock( listing ),
            createCssLoaderMock(),
            'themeA'
         );
         const provide = themeManager.urlProvider( 'artifact/[theme]', '[theme]/artifact' );
         return Promise.all( searchFiles.map( provide ) )
            .then( resolvedSpy );
      }

      /////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'returns a file from the configured theme if available', done => {
         runProvideTest(
            [
               'themeA.theme/artifact/fileB',
               'artifact/default.theme/fileB',
               'themeA.theme/artifact/sub/fileC'
            ],
            [ 'fileA', 'fileB', 'sub/fileC' ]
         )
         .then( () => {
            expect( resolvedSpy ).toHaveBeenCalledWith( [
               null,
               'themeA.theme/artifact/fileB',
               'themeA.theme/artifact/sub/fileC'
            ] );
         } )
         .then( done );
      } );

      /////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'returns a file from the default theme if not available in theme', done => {
         runProvideTest(
            [ 'themeA.theme/artifact/fileB', 'artifact/default.theme/fileA' ],
            [ 'fileA', 'fileB' ]
         )
         .then( () => {
            expect( resolvedSpy ).toHaveBeenCalledWith( [
               'artifact/default.theme/fileA',
               'themeA.theme/artifact/fileB'
            ] );
         } )
         .then( done );
      } );

      /////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'returns file from configured theme if locally available (e.g. within a widget)', done => {
         runProvideTest(
            [ 'artifact/themeA.theme/file', 'artifact/default.theme/file' ],
            [ 'file' ]
         )
         .then( () => {
            expect( resolvedSpy ).toHaveBeenCalledWith( [ 'artifact/themeA.theme/file' ] );
         } )
         .then( done );
      } );

   } );

} );
