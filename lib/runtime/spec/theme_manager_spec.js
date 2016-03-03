/**
 * Copyright 2016 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
import { create as createThemeManager } from '../theme_manager';
import { create as createFrpMock } from '../../testing/file_resource_provider_mock';

describe( 'The axThemeManager', () => {

   let resolvedSpy;

   beforeEach( () => {
      resolvedSpy = jasmine.createSpy( 'resolvedSpy' );
   } );

   ////////////////////////////////////////////////////////////////////////////////////////////////////////

   it( 'getTheme() returns the configured theme', () => {
      expect( createThemeManager( createFrpMock( {} ), 'cyan' ).getTheme() ).toEqual( 'cyan' );
   } );

   ////////////////////////////////////////////////////////////////////////////////////////////////////////

   describe( 'urlProvider( artifactPattern, themePattern )', () => {

      function runProvideTest( availableFiles, searchFiles ) {
         const files = availableFiles.reduce( ( acc, file ) => ( acc[ file ] = 1, acc ), {} );
         return createThemeManager( createFrpMock( files ), 'themeA' )
            .urlProvider(
               'artifact/[theme]',
               '[theme]/artifact',
               [ 'fallbackPath', '[theme]/artifact/sub' ]
            )
            .provide( searchFiles )
            .then( resolvedSpy );
      }

      /////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'returns a file from the configured theme if available', done => {
         runProvideTest(
            [ 'themeA.theme/artifact/fileB', 'artifact/default.theme/fileB', 'themeA.theme/artifact/sub/fileC' ],
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
            expect( resolvedSpy ).toHaveBeenCalledWith(
               [ 'artifact/default.theme/fileA', 'themeA.theme/artifact/fileB' ]
            );
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

      /////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'uses the fallback path if none of the other options are available', done => {
         runProvideTest(
            [ 'fallbackPath/file' ],
            [ 'file' ]
         )
         .then( () => {
            expect( resolvedSpy ).toHaveBeenCalledWith( [ 'fallbackPath/file' ] );
         } )
         .then( done );
      } );

   } );

} );
