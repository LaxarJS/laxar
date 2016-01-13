/**
 * Copyright 2016 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
define( [
   '../theme_manager',
   '../../testing/portal_mocks'
], function( themeManager, portalMocks ) {
   'use strict';

   describe( 'The axThemeManager', function() {

      var knownFiles_;
      var q_;
      var fileResourceProvider_;
      var themeManager_;
      var resolvedSpy;

      beforeEach( function() {
         jasmine.Clock.useMock();

         knownFiles_ = [];
         q_ = portalMocks.mockQ();
         fileResourceProvider_ = {
            isAvailable: jasmine.createSpy( 'isAvailable' ).andCallFake( function( file ) {
               return q_.when( knownFiles_.indexOf( file ) !== -1 );
            } )
         };
         resolvedSpy = jasmine.createSpy( 'resolvedSpy' );
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      afterEach( function() {
         themeManager_ = null;
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'getTheme() returns the configured theme', function() {
         themeManager_ = themeManager.create( fileResourceProvider_, q_, 'cyan' );
         expect( themeManager_.getTheme() ).toEqual( 'cyan' );
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      describe( 'urlProvider( artifactPattern, themePattern )', function() {

         function runProvideTest( availableFiles, searchFiles ) {
            [].push.apply( knownFiles_, availableFiles );
            themeManager_ = themeManager.create( fileResourceProvider_, q_, 'themeA' );
            themeManager_
               .urlProvider(
                  'artifact/[theme]',
                  '[theme]/artifact',
                  [ 'fallbackPath', '[theme]/artifact/sub' ]
               )
               .provide( searchFiles )
               .then( resolvedSpy );
            jasmine.Clock.tick( 0 );
         }

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'returns a file from the configured theme if available', function() {
            runProvideTest(
               [ 'themeA.theme/artifact/fileB', 'artifact/default.theme/fileB', 'themeA.theme/artifact/sub/fileC' ],
               [ 'fileA', 'fileB', 'sub/fileC' ]
            );

            expect( resolvedSpy ).toHaveBeenCalledWith( [
               null,
               'themeA.theme/artifact/fileB',
               'themeA.theme/artifact/sub/fileC'
            ] );
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'returns a file from the default theme if not available in theme', function() {
            runProvideTest(
               [ 'themeA.theme/artifact/fileB', 'artifact/default.theme/fileA' ],
               [ 'fileA', 'fileB' ]
            );

            expect( resolvedSpy ).toHaveBeenCalledWith(
               [ 'artifact/default.theme/fileA', 'themeA.theme/artifact/fileB' ]
            );
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'returns file from configured theme if locally available (e.g. within a widget)', function() {
            runProvideTest(
               [ 'artifact/themeA.theme/file', 'artifact/default.theme/file' ],
               [ 'file' ]
            );

            expect( resolvedSpy ).toHaveBeenCalledWith( [ 'artifact/themeA.theme/file' ] );
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'uses the fallback path if none of the other options are available', function() {
            runProvideTest(
               [ 'fallbackPath/file' ],
               [ 'file' ]
            );

            expect( resolvedSpy ).toHaveBeenCalledWith( [ 'fallbackPath/file' ] );
         } );

      } );

   } );


} );
