/**
 * Copyright 2016 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
define( [
   '../layout_loader',
   '../../logging/log',
   '../../runtime/theme_manager',
   '../../testing/portal_mocks'
], function( layoutLoader, log, themeManager, portalMocks ) {
   'use strict';

   describe( 'A layout loader', function() {

      var q_ = portalMocks.mockQ();
      var cssLoaderMock;
      var fileResourceProviderMock;

      var listings_;
      var theme_;

      beforeEach( function() {
         jasmine.Clock.useMock();
         theme_ = 'default';
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      function createTestBed() {
         spyOn( log, 'warn' );
         cssLoaderMock = jasmine.createSpyObj( 'cssLoaderSpy', [ 'load' ] );
         fileResourceProviderMock = portalMocks.mockFileResourceProvider( listings_ );

         return {
            layoutLoader: layoutLoader.create(
               'path/to/layouts/',
               'path/to/themes/',
               cssLoaderMock,
               themeManager.create( fileResourceProviderMock, q_, theme_ ),
               fileResourceProviderMock
            )
         };
      }

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      describe( 'when there is an application layout directory matching the requested theme', function() {

         var result_;

         beforeEach( function() {
            theme_ = 'themeA';
            listings_ = {
               'path/to/layouts/abc/themeA.theme/abc.html': '<h1>layout abc for theme A here</h1>',
               'path/to/layouts/abc/themeA.theme/css/abc.css': 1
            };
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         beforeEach( function() {
            createTestBed().layoutLoader.load( 'abc' ).then( function( layoutInfo ) {
               result_ = layoutInfo;
            } );
            jasmine.Clock.tick( 0 );
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'sets the layout path to that directory', function() {
            expect( result_.html ).toEqual( 'path/to/layouts/abc/themeA.theme/abc.html' );
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'loads the css from that directory', function() {
            expect( cssLoaderMock.load ).toHaveBeenCalledWith( 'path/to/layouts/abc/themeA.theme/css/abc.css' );
         } );

      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      describe( 'when there is *no* application layout directory matching the requested theme', function() {

         var result_;

         describe( 'but there is an application layout directory for the default theme', function() {

            beforeEach( function() {
               listings_ = {
                  'path/to/layouts/abc/default.theme/abc.html': '<h1>layout abc for the default theme</h1>',
                  'path/to/layouts/abc/default.theme/css/abc.css': 1
               };
               createTestBed().layoutLoader.load( 'abc' ).then( function( layoutInfo ) {
                  result_ = layoutInfo;
               } );

               jasmine.Clock.tick( 0 );
            } );

            //////////////////////////////////////////////////////////////////////////////////////////////////

            it( 'does not log a warning', function() {
               expect( log.warn ).not.toHaveBeenCalled();
            } );

            //////////////////////////////////////////////////////////////////////////////////////////////////

            it( 'uses the html file provided by the default theme', function() {
               expect( result_.htmlContent ).toEqual( '<h1>layout abc for the default theme</h1>' );
            } );

            //////////////////////////////////////////////////////////////////////////////////////////////////

            it( 'loads the css provided by the default theme', function() {
               expect( cssLoaderMock.load ).toHaveBeenCalledWith( 'path/to/layouts/abc/default.theme/css/abc.css' );
            } );

         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         describe( 'and there is no application layout directory for the default theme', function() {

            var rejectSpy;
            beforeEach( function() {
               listings_ = {};
               rejectSpy = jasmine.createSpy( 'rejectSpy' );
               createTestBed().layoutLoader.load( 'abc' ).then( function( layoutInfo ) {
                  result_ = layoutInfo;
               }, rejectSpy );
               jasmine.Clock.tick( 0 );
            } );

            //////////////////////////////////////////////////////////////////////////////////////////////////

            it( 'informs that no layout HTML is available', function() {
               expect( result_.html ).toBe( null );
            } );

            //////////////////////////////////////////////////////////////////////////////////////////////////

            it( 'does not provide any HTML content', function() {
               expect( result_.htmlContent ).not.toBeDefined();
            } );

            //////////////////////////////////////////////////////////////////////////////////////////////////

            it( 'logs a warning', function() {
               expect( log.warn ).toHaveBeenCalled();
            } );

            //////////////////////////////////////////////////////////////////////////////////////////////////

            it( 'does not try to load any CSS', function() {
               expect( cssLoaderMock.load ).not.toHaveBeenCalled();
            } );

         } );

      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      describe( 'when the theme itself contains the layout to load', function() {

         var result_;

         beforeEach( function() {
            theme_ = 'A';
            listings_ = {
               'path/to/themes/A.theme/layouts/XYZ/XYZ.html': '<h1>layout XYZ from theme A</h1>',
               'path/to/themes/A.theme/layouts/XYZ/css/XYZ.css': 1
            };
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         describe( 'and the application does not override it', function() {

            beforeEach( function() {
               createTestBed().layoutLoader.load( 'XYZ' ).then( function( layoutInfo ) {
                  result_ = layoutInfo;
               } );
               jasmine.Clock.tick( 0 );
            } );

            //////////////////////////////////////////////////////////////////////////////////////////////////

            it( 'uses the html file provided by the theme', function() {
               expect( result_.html ).toEqual( 'path/to/themes/A.theme/layouts/XYZ/XYZ.html' );
            } );

            //////////////////////////////////////////////////////////////////////////////////////////////////

            it( 'loads the css provided by the theme', function() {
               expect( cssLoaderMock.load ).toHaveBeenCalledWith( 'path/to/themes/A.theme/layouts/XYZ/css/XYZ.css' );
            } );

         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         describe( 'and the application overrides it', function() {

            beforeEach( function() {
               listings_[ 'path/to/layouts/XYZ/A.theme/XYZ.html' ] = '<h1>layout XYZ by app</h1>';
               listings_[ 'path/to/layouts/XYZ/A.theme/css/XYZ.css' ] = 1;
               createTestBed().layoutLoader.load( 'XYZ' ).then( function( layoutInfo ) {
                  result_ = layoutInfo;
               } );
               jasmine.Clock.tick( 0 );
            } );

            //////////////////////////////////////////////////////////////////////////////////////////////////

            it( 'sets the layout path to that directory', function() {
               expect( result_.html ).toEqual( 'path/to/layouts/XYZ/A.theme/XYZ.html' );
               expect( result_.htmlContent ).toEqual(  '<h1>layout XYZ by app</h1>' );
            } );

            //////////////////////////////////////////////////////////////////////////////////////////////////

            it( 'loads the css from that directory', function() {
               expect( cssLoaderMock.load ).toHaveBeenCalledWith( 'path/to/layouts/XYZ/A.theme/css/XYZ.css' );
            } );

         } );

      } );

   } );

} );
