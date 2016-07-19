/**
 * Copyright 2016 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
import { create as createFrp } from '../file_resource_provider';
import { create as createConfigurationMock } from '../../testing/configuration_mock';
import { create as createBrowserMock } from '../../testing/browser_mock';

describe( 'A FileResourceProvider', () => {

   const ENTRY_FILE = 1;

   let rejectSpy;
   let configurationData;
   let configurationMock;
   let browserMock;
   let exampleListing;
   let fileResourceProvider;

   beforeEach( () => {
      rejectSpy = jasmine.createSpy( 'rejectSpy' );

      configurationData = {};
      configurationMock = createConfigurationMock( configurationData );

      browserMock = createBrowserMock();
      browserMock.respondWith( '/myFile.json', { key: 'value', aNumber: 12 } );
      browserMock.respondWith( '/embedded.json', { someKey: 'fresh from the server' } );

      exampleListing = {
         'myFile.json': ENTRY_FILE,
         'embedded.json': '{ "someKey": "from the listing" }',
         'deeply': {
            'nested': {
               'file.html': '<h1>Look at me!</h1>',
               'file.json': '{ "can": "do" }'
            }
         }
      };

      fileResourceProvider = createFrp( configurationMock, browserMock, '/', exampleListing );
   } );

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   describe( 'when asked to provide a JSON resource', () => {

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      describe( 'that is available', () => {

         let resource;

         beforeEach( done => {
            fileResourceProvider.provide( '/myFile.json' )
               .then( res => { resource = res; }, done.fail )
               .then( done );
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'should resolve the promise with parsed representation of the requested resource', () => {
            expect( resource ).toEqual( { key: 'value', aNumber: 12 } );
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         describe( 'and then asked again for the same JSON resource', () => {

            let resource2;

            beforeEach( done => {
               fileResourceProvider.provide( '/myFile.json' )
                  .then( res => { resource2 = res; }, done.fail )
                  .then( done );
            } );

            //////////////////////////////////////////////////////////////////////////////////////////////////

            it( 'must not reuse the parsed representation', () => {
               resource.aNumber = 13;
               expect( resource2.aNumber ).toEqual( 12 );
            } );

         } );

      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      describe( 'that is not JSON', () => {

         let resource;

         beforeEach( done => {
            fileResourceProvider.provide( '/deeply/nested/file.html' )
               .then( res => { resource = res; }, done.fail )
               .then( done );
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'should resolve the promise with the string representation', () => {
            expect( resource ).toEqual( '<h1>Look at me!</h1>' );
         } );

      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      describe( 'that is not available', () => {

         beforeEach( done => {
            fileResourceProvider.provide( '/nonExistingFile.json' )
               .then( done.fail, rejectSpy )
               .then( done );
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'should reject the promise', () => {
            expect( rejectSpy ).toHaveBeenCalled();
         } );

      } );

      /////////////////////////////////////////////////////////////////////////////////////////////////////

      describe( 'that is a directory', () => {

         beforeEach( done => {
            fileResourceProvider.provide( '/deeply/nested' )
               .then( done.fail, rejectSpy )
               .then( done );
         } );

         it( 'should reject the promise', () => {
            expect( rejectSpy ).toHaveBeenCalled();
         } );

      } );

      /////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'by default, does not request an embedded file from the server', done => {
         fileResourceProvider.provide( '/embedded.json' )
            .then( resource => {
               expect( browserMock.fetch.calls.count() ).toBe( 0 );
               expect( resource ).toEqual( { someKey: 'from the listing' } );
            }, done.fail )
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

   describe( 'that does not use embedded listings', () => {

      beforeEach( () => {
         configurationData.useEmbeddedFileListings = false;
         fileResourceProvider = createFrp( configurationMock, browserMock, '/', exampleListing );
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'provides files from the server', done => {
         fileResourceProvider.provide( '/embedded.json' )
            .then( result => {
               expect( result ).toEqual( { someKey: 'fresh from the server' } );
            }, done.fail )
            .then( () => {
               expect( browserMock.fetch.calls.count() ).toBe( 1 );
            } )
            .then( done );
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 're-uses HTTP responses for requested file resources', done => {
         Promise.all( [
            fileResourceProvider.provide( '/myFile.json' ),
            fileResourceProvider.provide( '/myFile.json' )
         ] )
            .then( () => {
               expect( browserMock.fetch.calls.count() ).toBe( 1 );
            }, done.fail )
            .then( done );
      } );
   } );

   ////////////////////////////////////////////////////////////////////////////////////////////////////////

   describe( 'for a root path with parent references', () => {

      beforeEach( () => {
         browserMock.reset();

         fileResourceProvider = createFrp( configurationMock, browserMock, 'http://domain:8000/includes/..', {
            'myFiles': {
               'myFile.json': ENTRY_FILE
            }
         } );
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
         fileResourceProvider = createFrp( configurationMock, browserMock, 'http://domain:8000/includes/', {
            'myFiles': {
               'myFile.json': ENTRY_FILE
            }
         } );
      } );

      /////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'leftover slashes during check for existence are removed (#23)', done => {
         fileResourceProvider.isAvailable( 'http://domain:8000/includes/myFiles/myFile.json' )
            .then( found => expect( found ).toEqual( true ) )
            .then( done );
      } );

   } );

} );
