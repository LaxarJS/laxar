/**
 * Copyright 2016 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
import { create as createFrp } from '../file_resource_provider';
import { create as createConfigurationMock } from '../../testing/configuration_mock';

describe( 'A FileResourceProvider', () => {

   const ENTRY_FILE = 1;

   let rejectSpy;
   let configurationData;
   let configurationMock;
   let browserMock;
   let fileResourceProvider;

   beforeEach( () => {
      rejectSpy = jasmine.createSpy( 'rejectSpy' );

      configurationData = {};
      configurationMock = createConfigurationMock( configurationData );

      browserMock = {
         fetch: jasmine.createSpy( 'fetch' ).and.callFake( ( url, options ) => {
            let method = 'GET';
            if( options && options.method ) {
               method = options.method;
            }

            const responseObj = browserMock._responses
               .filter( responseObj => {
                  return responseObj.url === url && responseObj.method === method;
               } )[ 0 ];

            if( responseObj === undefined ) {
               return Promise.reject();
            }

            return Promise.resolve( {
               text: () => Promise.resolve( JSON.stringify( responseObj.value ) )
            } );
         } ),
         respondWith( method, url, value ) {
            if( value === undefined ) {
               browserMock._responses.push( {
                  method: 'GET',
                  url: method,
                  value: url
               } );
               return;
            }
            browserMock._responses.push( { method, url, value } );
         },
         reset() {
            browserMock._responses = [];
         },
         _responses: []
      };

      fileResourceProvider = createFrp( configurationMock, browserMock, '/' );

      browserMock.respondWith( '/myFile.json', {
         key: 'value',
         aNumber: 12
      } );
      browserMock.respondWith( 'HEAD', '/myFile.json', {} );
      browserMock.respondWith( '/const/listing/myFiles.json', {
         'myFiles': {
            'myFile.json': ENTRY_FILE
         }
      } );
   } );

   ////////////////////////////////////////////////////////////////////////////////////////////////////////

   describe( 'when asked to provide a resource', () => {

      it( 'should resolve the promise with the requested resource', done => {
         fileResourceProvider.provide( '/myFile.json' )
            .then( resource => expect( resource ).toEqual( { key: 'value', aNumber: 12 } ) )
            .then( done );
      } );

      /////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'should reject the promise if the resource isn\'t available', done => {
         fileResourceProvider.provide( '/nonExistingFile.json' )
            .then( done.fail, rejectSpy )
            .then( () => expect( rejectSpy ).toHaveBeenCalled() )
            .then( done );
      } );

   } );

   ////////////////////////////////////////////////////////////////////////////////////////////////////////

   describe( 'when asked for availability of a certain resource', () => {

      it( 'should resolve the promise with true if the requested resource exists', done => {
         fileResourceProvider.isAvailable( '/myFile.json' )
            .then( found => expect( found ).toEqual( true ) )
            .then( done );
      } );

      /////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'should resolve the promise with false if the resource isn\'t available', done => {
         fileResourceProvider.isAvailable( '/nonExistingFile.json' )
            .then( found => expect( found ).toEqual( false ) )
            .then( done );
      } );

   } );

   ////////////////////////////////////////////////////////////////////////////////////////////////////////

   describe( 'when supplied with a file listing', () => {

      beforeEach( () => {
         fileResourceProvider.setFileListingUri( 'myFiles', '/const/listing/myFiles.json' );
      } );

      /////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'to check existence, makes an http request for the listing, not the file itself', done => {
         fileResourceProvider.isAvailable( '/myFiles/myFile.json' )
            .then( found => {
               expect( browserMock.fetch.calls.count() ).toBe( 1 );
               expect( browserMock.fetch ).toHaveBeenCalledWith( '/const/listing/myFiles.json' );
               expect( found ).toEqual( true );
            } )
            .then( done );
      } );

      /////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'to get contents, makes a http request for the listing, not the file itself', done => {
         fileResourceProvider.provide( '/myFiles/myFile2.json' )
            .then( done.fail, () => {
               expect( browserMock.fetch.calls.count() ).toBe( 1 );
               expect( browserMock.fetch ).toHaveBeenCalledWith( '/const/listing/myFiles.json' );
            } )
            .then( done );
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 're-uses HTTP responses for configured listings and configured file resources', done => {
         Promise.all( [
            fileResourceProvider.isAvailable( '/myFiles/myFile.json' ),
            fileResourceProvider.isAvailable( '/myFiles/myFile.json' )
         ] )
         .then( () => {
            expect( browserMock.fetch.calls.count() ).toBe( 1 );
         }, done.fail )
         .then( () => {
            return Promise.all( [
               fileResourceProvider.isAvailable( '/myFiles/myFile.json' ),
               fileResourceProvider.isAvailable( '/myFiles/myFile.json' ),
               fileResourceProvider.provide( '/myFile.json' ),
               fileResourceProvider.provide( '/myFile.json' ),
               fileResourceProvider.provide( '/myFile.json' )
            ] );
         } )
         .then( () => {
            expect( browserMock.fetch.calls.count() ).toBe( 2 );
         }, done.fail )
         .then( done );
      } );

   } );

   ////////////////////////////////////////////////////////////////////////////////////////////////////////

   describe( 'when supplied with file listing contents', () => {

      beforeEach( () => {
         fileResourceProvider.setFileListingContents( 'myFiles', {
            'myFiles': {
               'myFile.json': ENTRY_FILE
            }
         } );
      } );

      /////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'does not make any HTTP request when asked for availability within that path', done => {
         fileResourceProvider.isAvailable( '/myFiles/myFile.json' )
            .then( found => {
               expect( found ).toEqual( true );
               expect( browserMock.fetch.calls.count() ).toBe( 0 );
            }, done.fail )
            .then( () => fileResourceProvider.isAvailable( '/myFiles/otherFile.json' ) )
            .then( found => {
               expect( found ).toEqual( false );
               expect( browserMock.fetch.calls.count() ).toBe( 0 );
            }, done.fail )
            .then( done );
      } );

   } );

   ////////////////////////////////////////////////////////////////////////////////////////////////////////

   describe( 'for a root path with parent references', () => {

      beforeEach( () => {
         browserMock.reset();

         fileResourceProvider = createFrp( configurationMock, browserMock, 'http://domain:8000/includes/..' );
         browserMock.respondWith( 'http://domain:8000/const/listing/myFiles.json', {
            'myFiles': {
               'myFile.json': ENTRY_FILE
            }
         } );
         fileResourceProvider.setFileListingUri( 'myFiles', 'http://domain:8000/const/listing/myFiles.json' );
      } );

      /////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'normalizes the provided root path (#21)', done => {
         fileResourceProvider.isAvailable( 'http://domain:8000/myFiles/myFile.json' )
            .then( found => expect( found ).toEqual( true ) )
            .then( done );
      } );

   } );

   ////////////////////////////////////////////////////////////////////////////////////////////////////////

   describe( 'for a root path which is not only host and port', () => {

      beforeEach( () => {
         browserMock.reset();

         fileResourceProvider = createFrp( configurationMock, browserMock, 'http://domain:8000/includes/' );
         browserMock.respondWith( 'http://domain:8000/const/listing/myFiles.json', {
            'myFiles': {
               'myFile.json': ENTRY_FILE
            }
         } );
         fileResourceProvider.setFileListingUri( 'myFiles', 'http://domain:8000/const/listing/myFiles.json' );
      } );

      /////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'left over slashes during check for existence are removed (#23)', done => {
         fileResourceProvider.isAvailable( 'http://domain:8000/includes/myFiles/myFile.json' )
            .then( found => expect( found ).toEqual( true ) )
            .then( done );
      } );

   } );

   ////////////////////////////////////////////////////////////////////////////////////////////////////////

   describe( 'with embedded contents', () => {

      beforeEach( () => {
         browserMock.reset();

         browserMock.respondWith( '/const/listing/myFiles.json', {
            'myFiles': {
               'myFile.json': '{"my_embedded": 13}'
            }
         } );
      } );

      /////////////////////////////////////////////////////////////////////////////////////////////////////

      describe( 'if embedded files should be used', () => {

         beforeEach( () => {
            configurationData.useEmbeddedFileListings = true;
            fileResourceProvider = createFrp( configurationMock, browserMock, '/' );
            fileResourceProvider.setFileListingUri( 'myFiles', '/const/listing/myFiles.json' );
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'does not request the file from the server', done => {
            fileResourceProvider.provide( '/myFiles/myFile.json' )
               .then( resource => {
                  expect( browserMock.fetch.calls.count() ).toBe( 1 );
                  expect( resource ).toEqual( { my_embedded: 13 } );
               }, done.fail )
               .then( done );
         } );

      } );

      /////////////////////////////////////////////////////////////////////////////////////////////////////

      describe( 'if embedded files should not be used', () => {

         beforeEach( () => {
            configurationData.useEmbeddedFileListings = false;
            browserMock.respondWith( '/myFiles/myFile.json', { my_embedded: 13 } );
            fileResourceProvider = createFrp( configurationMock, browserMock, '/' );
            fileResourceProvider.setFileListingUri( 'myFiles', '/const/listing/myFiles.json' );
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'does request the file from the server', done => {
            fileResourceProvider.provide( '/myFiles/myFile.json' )
               .then( resource => {
                  expect( browserMock.fetch.calls.count() ).toBe( 2 );
                  expect( resource ).toEqual( { my_embedded: 13 } );
               }, done.fail )
               .then( done );
         } );

      } );

   } );

} );
