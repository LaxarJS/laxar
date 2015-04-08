/**
 * Copyright 2014 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
define( [
   '../theme_manager',
   '../../testing/portal_mocks',
   '../../utilities/storage'
], function( themeManager, portalMocks, storage ) {
   'use strict';

   describe( 'The axThemeManager', function() {

      var knownFiles_;
      var q_;
      var fileResourceProvider_;
      var themeManager_;
      var resolvedSpy;
      var sessionStorageSpy;

      beforeEach( function() {
         jasmine.Clock.useMock();

         knownFiles_ = [];
         q_ = portalMocks.mockQ();
         fileResourceProvider_ = {
            isAvailable: jasmine.createSpy( 'isAvailable' ).andCallFake( function( file ) {
               return q_.when( knownFiles_.indexOf( file ) !== -1 );
            } )
         };
         sessionStorageSpy = jasmine.createSpyObj( 'sessionStorageSpy', [ 'setItem', 'getItem', 'removeItem' ] );
         storage.init( {}, sessionStorageSpy );

         resolvedSpy = jasmine.createSpy( 'resolvedSpy' );
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      afterEach( function() {
         themeManager_ = null;
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      describe( 'getTheme()', function() {

         it( 'returns the fallback theme if available and  no theme is set or present in sessionStorage', function() {
            themeManager_ = themeManager.create( fileResourceProvider_, q_, 'cyan' );
            expect( themeManager_.getTheme() ).toEqual( 'cyan' );
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'returns "default" if no theme is set or present in sessionStorage', function() {
            themeManager_ = themeManager.create( fileResourceProvider_, q_ );
            expect( themeManager_.getTheme() ).toEqual( 'default' );
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'reads it\'s theme from session storage if present', function() {
            sessionStorageSpy.getItem.andCallFake( function( key ) {
               return key === 'ax.themeManager.theme' ? '"green"' : '';
            } );
            themeManager_ = themeManager.create( fileResourceProvider_, q_ );

            expect( themeManager_.getTheme() ).toEqual( 'green' );
         } );

      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      describe( 'setTheme( theme )', function() {

         it( 'stores the given theme in session storage', function() {
            themeManager_ = themeManager.create( fileResourceProvider_, q_ );
            themeManager_.setTheme( 'bleu' );

            expect( sessionStorageSpy.setItem ).toHaveBeenCalledWith( 'ax.themeManager.theme', '"bleu"' );
         } );

      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      describe( 'findFiles( basePath, fileNames )', function() {

         function runFindFilesTest( availableFiles, searchFiles ) {
            [].push.apply( knownFiles_, availableFiles );
            themeManager_.findFiles( 'base', searchFiles ).then( resolvedSpy );
            jasmine.Clock.tick( 0 );
         }

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         beforeEach( function() {
            themeManager_ = themeManager.create( fileResourceProvider_, q_ );
            themeManager_.setTheme( 'themeA' );
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'uses the requested theme directory if it exists', function() {
            runFindFilesTest( [ 'base/themeA.theme/fileA', 'base/default.theme/fileA', 'base/fileA' ], [ 'fileA' ] );

            expect( resolvedSpy ).toHaveBeenCalledWith( [ 'base/themeA.theme/fileA' ] );
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'uses the default theme directory if the requested theme does not exist', function() {
            runFindFilesTest( [ 'base/default.theme/fileA', 'base/fileA' ], [ 'fileA' ] );

            expect( resolvedSpy ).toHaveBeenCalledWith( [ 'base/default.theme/fileA' ] );
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'returns null for files that don\'t exist in any search path', function() {
            runFindFilesTest( [ 'base/themeA.theme/fileB' ], [ 'fileA', 'fileB' ] );

            expect( resolvedSpy ).toHaveBeenCalledWith( [ null, 'base/themeA.theme/fileB' ] );
         } );

      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      describe( 'urlProvider( themePattern, defaultThemePattern )', function() {

         function runProvideTest( availableFiles, searchFiles ) {
            [].push.apply( knownFiles_, availableFiles );
            themeManager_ = themeManager.create( fileResourceProvider_, q_, 'themeA' );
            themeManager_.urlProvider( '[theme]/artifact', 'artifact/[theme]' ).provide( searchFiles )
               .then( resolvedSpy );
            jasmine.Clock.tick( 0 );
         }

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'returns a file from the configured theme if available', function() {
            runProvideTest(
               [ 'themeA.theme/artifact/fileB', 'artifact/default.theme/fileB' ],
               [ 'fileA', 'fileB' ]
            );

            expect( resolvedSpy ).toHaveBeenCalledWith( [ null, 'themeA.theme/artifact/fileB' ] );
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

      } );

   } );


} );
