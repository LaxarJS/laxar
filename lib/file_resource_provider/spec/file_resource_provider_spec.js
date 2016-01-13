/**
 * Copyright 2016 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
define( [
   '../../testing/portal_mocks',
   '../file_resource_provider',
   '../../utilities/path',
   '../../utilities/configuration'
], function( portalMocks, fileResourceProvider, path, configuration ) {
   'use strict';

   describe( 'A FileResourceProvider', function() {

      var ENTRY_FILE = 1;

      var fileResourceProvider_;
      var httpClient;
      var resolveSpy;
      var rejectSpy;

      beforeEach( function() {
         jasmine.Clock.useMock();

         resolveSpy = jasmine.createSpy( 'resolveSpy' );
         rejectSpy = jasmine.createSpy( 'rejectSpy' );

         httpClient = portalMocks.mockHttp();

         fileResourceProvider.init( portalMocks.mockQ(), httpClient );

         fileResourceProvider_ = fileResourceProvider.create( '/' );

         httpClient.respondWith( '/myFile.json', {
            key: 'value',
            aNumber: 12
         } );
         httpClient.respondWith( 'HEAD', '/myFile.json', {} );
         httpClient.respondWith( '/var/listing/myFiles.json', {
            'myFiles': {
               'myFile.json': ENTRY_FILE
            }
         } );
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      describe( 'when asked to provide a resource', function() {

         it( 'should resolve the promise with the requested resource', function() {
            fileResourceProvider_.provide( '/myFile.json' ).then( resolveSpy, rejectSpy );
            jasmine.Clock.tick( 0 );

            expect( resolveSpy ).toHaveBeenCalledWith( { key: 'value', aNumber: 12 } );
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'should reject the promise if the resource isn\'t available', function() {
            fileResourceProvider_.provide( '/nonExistingFile.json' ).then( resolveSpy, rejectSpy );
            jasmine.Clock.tick( 0 );

            expect( rejectSpy ).toHaveBeenCalled();
         } );

      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      describe( 'when asked for availability of a certain resource', function() {

         it( 'should resolve the promise with true if the requested resource exists', function() {
            fileResourceProvider_.isAvailable( '/myFile.json' ).then( resolveSpy, rejectSpy );
            jasmine.Clock.tick( 0 );

            expect( resolveSpy ).toHaveBeenCalledWith( true );
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'should resolve the promise with false if the resource isn\'t available', function() {
            fileResourceProvider_.isAvailable( '/nonExistingFile.json' ).then( resolveSpy, rejectSpy );
            jasmine.Clock.tick( 0 );

            expect( resolveSpy ).toHaveBeenCalledWith( false );
         } );

      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      describe( 'when supplied with a file listing', function() {

         beforeEach( function() {
            fileResourceProvider_.setFileListingUri( 'myFiles', '/var/listing/myFiles.json' );
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'only makes a http request for the listing but not the file to ask for availability within that path', function() {
            fileResourceProvider_.isAvailable( '/myFiles/myFile.json' ).then( resolveSpy, rejectSpy );

            jasmine.Clock.tick( 0 );

            expect( httpClient.get.calls.length ).toBe( 1 );
            expect( httpClient.get ).toHaveBeenCalledWith( '/var/listing/myFiles.json', jasmine.any( Object ) );
            expect( resolveSpy ).toHaveBeenCalledWith( true );
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'only makes a http request for the listing but not the file to provide a file not listed in its file listing', function() {
            fileResourceProvider_.provide( '/myFiles/myFile2.json' ).then( resolveSpy, rejectSpy );

            jasmine.Clock.tick( 0 );

            expect( httpClient.get.calls.length ).toBe( 1 );
            expect( httpClient.get ).toHaveBeenCalledWith( '/var/listing/myFiles.json', jasmine.any( Object )  );
            expect( rejectSpy ).toHaveBeenCalled();
         } );

         ////////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'only makes a single HTTP request for each configured listing and for each configured file resource', function() {
            fileResourceProvider_.isAvailable( '/myFiles/myFile.json' ).then( resolveSpy, rejectSpy );
            fileResourceProvider_.isAvailable( '/myFiles/myFile.json' ).then( resolveSpy, rejectSpy );

            jasmine.Clock.tick( 0 );

            expect( resolveSpy ).toHaveBeenCalled();
            expect( resolveSpy.calls.length ).toBe( 2 );
            expect( httpClient.get.calls.length ).toBe( 1 );

            fileResourceProvider_.isAvailable( '/myFiles/myFile.json' ).then( resolveSpy, rejectSpy );
            fileResourceProvider_.isAvailable( '/myFiles/myFile.json' ).then( resolveSpy, rejectSpy );
            fileResourceProvider_.provide( '/myFile.json' ).then( resolveSpy, rejectSpy );
            fileResourceProvider_.provide( '/myFile.json' ).then( resolveSpy, rejectSpy );
            fileResourceProvider_.provide( '/myFile.json' ).then( resolveSpy, rejectSpy );

            jasmine.Clock.tick( 0 );
            expect( resolveSpy.calls.length ).toBe( 7 );
            expect( httpClient.get.calls.length ).toBe( 2 );
         } );

      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      describe( 'when supplied with file listing contents', function() {

         beforeEach( function() {
            fileResourceProvider_.setFileListingContents( 'myFiles', {
               'myFiles': {
                  'myFile.json': ENTRY_FILE
               }
            } );
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'does not make any HTTP request when asked for availability within that path', function() {
            fileResourceProvider_.isAvailable( '/myFiles/myFile.json' ).then( resolveSpy, rejectSpy );
            jasmine.Clock.tick( 0 );
            expect( httpClient.get.calls.length ).toBe( 0 );
            expect( resolveSpy ).toHaveBeenCalledWith( true );

            fileResourceProvider_.isAvailable( '/myFiles/otherFile.json' ).then( resolveSpy, rejectSpy );
            jasmine.Clock.tick( 0 );
            expect( httpClient.get.calls.length ).toBe( 0 );
            expect( resolveSpy ).toHaveBeenCalledWith( false );
         } );

      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      describe( 'for a root path with parent references', function() {

         beforeEach( function() {
            httpClient.reset();

            fileResourceProvider_ = fileResourceProvider.create( 'http://domain:8000/includes/..' );
            httpClient.respondWith( 'http://domain:8000/var/listing/myFiles.json', {
               'myFiles': {
                  'myFile.json': ENTRY_FILE
               }
            } );
            fileResourceProvider_.setFileListingUri( 'myFiles', 'http://domain:8000/var/listing/myFiles.json' );
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'normalizes the provided root path (#21)', function() {
            fileResourceProvider_.isAvailable( 'http://domain:8000/myFiles/myFile.json' )
               .then( resolveSpy, rejectSpy );
            jasmine.Clock.tick( 0 );

            expect( resolveSpy ).toHaveBeenCalledWith( true );
         } );

      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      describe( 'for a root path which is not only host and port', function() {

         beforeEach( function() {
            httpClient.reset();

            fileResourceProvider_ = fileResourceProvider.create( 'http://domain:8000/includes/' );
            httpClient.respondWith( 'http://domain:8000/var/listing/myFiles.json', {
               'myFiles': {
                  'myFile.json': ENTRY_FILE
               }
            } );
            fileResourceProvider_.setFileListingUri( 'myFiles', 'http://domain:8000/var/listing/myFiles.json' );
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'left over slashes during check for existence are removed (#23)', function() {
            fileResourceProvider_.isAvailable( 'http://domain:8000/includes/myFiles/myFile.json' )
               .then( resolveSpy, rejectSpy );
            jasmine.Clock.tick( 0 );

            expect( resolveSpy ).toHaveBeenCalledWith( true );
         } );

      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      describe( 'with embedded contents', function() {

         var useEmbedded_;

         beforeEach( function() {

            var origGet = configuration.get;
            spyOn( configuration, 'get' ).andCallFake( function( key, fallback ) {
               if( key === 'useEmbeddedFileListings' ) {
                  return useEmbedded_;
               }
               return origGet( key, fallback );
            } );

            httpClient.reset();

            httpClient.respondWith( '/var/listing/myFiles.json', {
               'myFiles': {
                  'myFile.json': '{"my_embedded": 13}'
               }
            } );
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         describe( 'if embedded files should be used', function() {

            beforeEach( function() {
               useEmbedded_ = true;
               fileResourceProvider_ = fileResourceProvider.create( '/' );
               fileResourceProvider_.setFileListingUri( 'myFiles', '/var/listing/myFiles.json' );
            } );

            it( 'does not request the file from the server', function() {
               fileResourceProvider_.provide( '/myFiles/myFile.json' ).then( resolveSpy, rejectSpy );
               jasmine.Clock.tick( 0 );
               expect( httpClient.get.calls.length ).toBe( 1 );
               expect( resolveSpy ).toHaveBeenCalledWith( { my_embedded: 13 } );
            } );

         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         describe( 'if embedded files should not be used', function() {

            beforeEach( function() {
               useEmbedded_ = false;
               httpClient.respondWith( '/myFiles/myFile.json', { my_embedded: 13 } );
               fileResourceProvider_ = fileResourceProvider.create( '/' );
               fileResourceProvider_.setFileListingUri( 'myFiles', '/var/listing/myFiles.json' );
            } );

            it( 'does request the file from the server', function() {

               fileResourceProvider_.provide( '/myFiles/myFile.json' ).then( resolveSpy, rejectSpy );
               jasmine.Clock.tick( 0 );
               expect( httpClient.get.calls.length ).toBe( 2 );
               expect( resolveSpy ).toHaveBeenCalledWith( { my_embedded: 13 } );
            } );

         } );

      } );

   } );

} );
