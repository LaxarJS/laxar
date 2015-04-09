/**
 * Copyright 2014 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
define( [
   '../layout_loader',
   '../../testing/portal_mocks'
], function( layoutLoader, portalMocks ) {
   'use strict';

   describe( 'A layout loader', function() {

      var q_ = portalMocks.mockQ();

      beforeEach( function() {
         jasmine.Clock.useMock();
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      function createTestBed( config ) {
         var fullConfig = {
            layoutsRoot: 'application/layouts/',
            theme: config.theme || 'default',
            layout: 'layoutA'
         };

         var mocks = {
            cssLoader: jasmine.createSpyObj( 'cssLoaderSpy', [ 'load' ] ),

            themeManager: createThemeManagerMock(
               fullConfig.layoutsRoot,
               fullConfig.layout,
               fullConfig.layoutHtml
            )
         };

         var testBed = {
            config: fullConfig,
            mocks: mocks,

            layoutLoader: layoutLoader.create(
               fullConfig.layoutsRoot,
               mocks.cssLoader,
               mocks.themeManager
            )
         };

         testBed.exercise = function( callback ) {
            testBed.layoutLoader.load( fullConfig.layout ).then( function( result ) {
               callback( result, fullConfig );
            } );

            jasmine.Clock.tick( 1 );
         };

         return testBed;
      }

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      function createThemeManagerMock( baseDir, layoutId, themeDir ) {
         return {
            findFiles: function( basePath, files ) {
               if( basePath === baseDir &&
                   files[ 0 ] === layoutId + '.html' &&
                   files[ 1 ] === 'css/' + layoutId + '.css' ) {

                  return q_.when( [ themeDir + files[0], themeDir + files[1] ] );
               }

               return q_.reject(
                  'No theme directory found for baseDir ' + baseDir + ' and layout ' + layoutId + '.'
               );
            }
         };
      }

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      describe( 'when there is a layout directory for the requested theme', function() {

         var testBed_;

         beforeEach( function() {
            testBed_ = createTestBed( {
               layoutHtml: 'application/layouts/layoutA/themeA.theme/layoutA.html',
               theme: 'themeA'
            } );
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'sets the layout path to that directory', function() {
            testBed_.exercise( function( layoutInfo, config ) {
               expect( layoutInfo.html ).toEqual( config.layoutHtml );
            } );
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'loads the css from that directory', function() {
            testBed_.exercise( function() {
               expect( testBed_.mocks.cssLoader.load ).toHaveBeenCalledWith(
                  'application/layouts/layoutA/themeA.theme/css/layoutA.css'
               );
            } );
         } );

      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      describe( 'when there is no layout directory for the requested theme', function() {

         describe( 'and there is a layout directory for the default theme', function() {

            var testBed_;

            beforeEach( function() {
               testBed_ = createTestBed( {
                  layoutHtml: 'application/layouts/layoutA/default.theme/layoutA.html',
                  theme: 'themeA'
               } );
            } );

            //////////////////////////////////////////////////////////////////////////////////////////////////

            it( 'sets the layout path to that directory', function() {
               testBed_.exercise( function( layoutInfo, config ) {
                  expect( layoutInfo.html ).toEqual( config.layoutHtml );
               } );
            } );

            //////////////////////////////////////////////////////////////////////////////////////////////////

            it( 'loads the css from that directory', function() {
               testBed_.exercise( function() {
                  expect( testBed_.mocks.cssLoader.load ).toHaveBeenCalledWith(
                     'application/layouts/layoutA/default.theme/css/layoutA.css'
                  );
               } );
            } );

         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         describe( 'and there is no layout directory for the default theme either', function() {

            it( 'falls back to using the layout\'s base directory', function() {
               var testBed = createTestBed( {
                  layoutHtml: 'application/layouts/layoutA/layoutA.html',
                  theme: 'themeA'
               } );

               testBed.exercise( function( layoutInfo, config ) {
                  expect( layoutInfo.html ).toEqual( config.layoutHtml );
                  expect( testBed.mocks.cssLoader.load ).toHaveBeenCalledWith(
                     'application/layouts/layoutA/css/layoutA.css'
                  );
               } );
            } );

         } );

      } );

   } );

} );
