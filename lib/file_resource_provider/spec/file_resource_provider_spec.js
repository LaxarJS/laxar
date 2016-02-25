/**
 * Copyright 2016 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
import { create as createFrp } from '../file_resource_provider';
import * as q from 'q';
import * as object from '../../utilities/object';
import { create as createHttpMock } from '../../testing/http_mock';

describe( 'A FileResourceProvider', () => {

   const ENTRY_FILE = 1;

   let fileResourceProvider_;
   let httpClient;
   let rejectSpy;

   beforeEach( () => {
      rejectSpy = jasmine.createSpy( 'rejectSpy' );

      httpClient = createHttpMock( q );

      fileResourceProvider_ = createFrp( q, httpClient, '/' );

      httpClient.respondWith( '/myFile.json', {
         key: 'value',
         aNumber: 12
      } );
      httpClient.respondWith( 'HEAD', '/myFile.json', {} );
      httpClient.respondWith( '/const/listing/myFiles.json', {
         'myFiles': {
            'myFile.json': ENTRY_FILE
         }
      } );
   } );

   ////////////////////////////////////////////////////////////////////////////////////////////////////////

   describe( 'when asked to provide a resource', () => {

      it( 'should resolve the promise with the requested resource', done => {
         fileResourceProvider_.provide( '/myFile.json' )
            .then( resource => expect( resource ).toEqual( { key: 'value', aNumber: 12 } ) )
            .then( done );
      } );

      /////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'should reject the promise if the resource isn\'t available', done => {
         fileResourceProvider_.provide( '/nonExistingFile.json' )
            .then( done.fail, rejectSpy )
            .then( () => expect( rejectSpy ).toHaveBeenCalled() )
            .then( done );
      } );

   } );

   ////////////////////////////////////////////////////////////////////////////////////////////////////////

   describe( 'when asked for availability of a certain resource', () => {

      it( 'should resolve the promise with true if the requested resource exists', done => {
         fileResourceProvider_.isAvailable( '/myFile.json' )
            .then( found => expect( found ).toEqual( true ) )
            .then( done );
      } );

      /////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'should resolve the promise with false if the resource isn\'t available', done => {
         fileResourceProvider_.isAvailable( '/nonExistingFile.json' )
            .then( found => expect( found ).toEqual( false ) )
            .then( done );
      } );

   } );

   ////////////////////////////////////////////////////////////////////////////////////////////////////////

   describe( 'when supplied with a file listing', () => {

      beforeEach( () => {
         fileResourceProvider_.setFileListingUri( 'myFiles', '/const/listing/myFiles.json' );
      } );

      /////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'only makes a http request for the listing but not the file to ask for availability within that path', done => {
         fileResourceProvider_.isAvailable( '/myFiles/myFile.json' )
            .then( found => {
               expect( httpClient.get.calls.count() ).toBe( 1 );
               expect( httpClient.get )
                  .toHaveBeenCalledWith( '/const/listing/myFiles.json', jasmine.any( Object ) );
               expect( found ).toEqual( true );
            } )
            .then( done );
      } );

      /////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'only makes a http request for the listing but not the file to provide a file not listed in its file listing', done => {
         fileResourceProvider_.provide( '/myFiles/myFile2.json' )
            .then( done.fail, () => {
               expect( httpClient.get.calls.count() ).toBe( 1 );
               expect( httpClient.get )
                  .toHaveBeenCalledWith( '/const/listing/myFiles.json', jasmine.any( Object ) );
            } )
            .then( done );
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'only makes a single HTTP request for each configured listing and for each configured file resource', done => {
         q.all( [
            fileResourceProvider_.isAvailable( '/myFiles/myFile.json' ),
            fileResourceProvider_.isAvailable( '/myFiles/myFile.json' ),
         ] )
         .then( () => {
            expect( httpClient.get.calls.count() ).toBe( 1 );
         }, done.fail )
         .then( () => {
            return q.all( [
               fileResourceProvider_.isAvailable( '/myFiles/myFile.json' ),
               fileResourceProvider_.isAvailable( '/myFiles/myFile.json' ),
               fileResourceProvider_.provide( '/myFile.json' ),
               fileResourceProvider_.provide( '/myFile.json' ),
               fileResourceProvider_.provide( '/myFile.json' ),
            ] );
         } )
         .then( () => {
            expect( httpClient.get.calls.count() ).toBe( 2 );
         }, done.fail )
         .then( done );
      } );

   } );

   ////////////////////////////////////////////////////////////////////////////////////////////////////////

   describe( 'when supplied with file listing contents', () => {

      beforeEach( () => {
         fileResourceProvider_.setFileListingContents( 'myFiles', {
            'myFiles': {
               'myFile.json': ENTRY_FILE
            }
         } );
      } );

      /////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'does not make any HTTP request when asked for availability within that path', done => {
         fileResourceProvider_.isAvailable( '/myFiles/myFile.json' )
            .then( found => {
               expect( found ).toEqual( true );
               expect( httpClient.get.calls.count() ).toBe( 0 );
            }, done.fail )
            .then( () => fileResourceProvider_.isAvailable( '/myFiles/otherFile.json' ) )
            .then( found => {
               expect( found ).toEqual( false );
               expect( httpClient.get.calls.count() ).toBe( 0 );
            }, done.fail )
            .then( done );
      } );

   } );

   ////////////////////////////////////////////////////////////////////////////////////////////////////////

   describe( 'for a root path with parent references', () => {

      beforeEach( () => {
         httpClient.reset();

         fileResourceProvider_ = createFrp( q, httpClient, 'http://domain:8000/includes/..' );
         httpClient.respondWith( 'http://domain:8000/const/listing/myFiles.json', {
            'myFiles': {
               'myFile.json': ENTRY_FILE
            }
         } );
         fileResourceProvider_.setFileListingUri( 'myFiles', 'http://domain:8000/const/listing/myFiles.json' );
      } );

      /////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'normalizes the provided root path (#21)', done => {
         fileResourceProvider_.isAvailable( 'http://domain:8000/myFiles/myFile.json' )
            .then( found => expect( found ).toEqual( true ) )
            .then( done );
      } );

   } );

   ////////////////////////////////////////////////////////////////////////////////////////////////////////

   describe( 'for a root path which is not only host and port', () => {

      beforeEach( () => {
         httpClient.reset();

         fileResourceProvider_ = createFrp( q, httpClient, 'http://domain:8000/includes/' );
         httpClient.respondWith( 'http://domain:8000/const/listing/myFiles.json', {
            'myFiles': {
               'myFile.json': ENTRY_FILE
            }
         } );
         fileResourceProvider_.setFileListingUri( 'myFiles', 'http://domain:8000/const/listing/myFiles.json' );
      } );

      /////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'left over slashes during check for existence are removed (#23)', done => {
         fileResourceProvider_.isAvailable( 'http://domain:8000/includes/myFiles/myFile.json' )
            .then( found => expect( found ).toEqual( true ) )
            .then( done );
      } );

   } );

   ////////////////////////////////////////////////////////////////////////////////////////////////////////

   describe( 'with embedded contents', () => {

      const global = new Function( 'return this' )();

      beforeEach( () => {
         httpClient.reset();

         httpClient.respondWith( '/const/listing/myFiles.json', {
            'myFiles': {
               'myFile.json': '{"my_embedded": 13}'
            }
         } );
      } );

      afterEach( () => {
         delete global.laxar;
      } );

      /////////////////////////////////////////////////////////////////////////////////////////////////////

      describe( 'if embedded files should be used', () => {

         beforeEach( () => {
            // TODO this since "get" is readonly since using es6 modules. This is obsolete as soon as
            // every module has to expose a create function for fresh creation and dependency injection
            object.setPath( global, 'laxar.useEmbeddedFileListings', true );

            fileResourceProvider_ = createFrp( q, httpClient, '/' );
            fileResourceProvider_.setFileListingUri( 'myFiles', '/const/listing/myFiles.json' );
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'does not request the file from the server', done => {
            fileResourceProvider_.provide( '/myFiles/myFile.json' )
               .then( resource => {
                  expect( httpClient.get.calls.count() ).toBe( 1 );
                  expect( resource ).toEqual( { my_embedded: 13 } );
               }, done.fail )
               .then( done );
         } );

      } );

      /////////////////////////////////////////////////////////////////////////////////////////////////////

      describe( 'if embedded files should not be used', () => {

         beforeEach( () => {
            // TODO this since "get" is readonly since using es6 modules. This is obsolete as soon as
            // every module has to expose a create function for fresh creation and dependency injection
            object.setPath( global, 'laxar.useEmbeddedFileListings', false );

            httpClient.respondWith( '/myFiles/myFile.json', { my_embedded: 13 } );
            fileResourceProvider_ = createFrp( q, httpClient, '/' );
            fileResourceProvider_.setFileListingUri( 'myFiles', '/const/listing/myFiles.json' );
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'does request the file from the server', done => {
            fileResourceProvider_.provide( '/myFiles/myFile.json' )
               .then( resource => {
                  expect( httpClient.get.calls.count() ).toBe( 2 );
                  expect( resource ).toEqual( { my_embedded: 13 } );
               }, done.fail )
               .then( done );
         } );

      } );

   } );

} );
