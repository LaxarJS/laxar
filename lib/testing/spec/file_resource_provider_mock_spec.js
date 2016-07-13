/**
 * Copyright 2016 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
import { create as createFrpMock } from '../file_resource_provider_mock';

describe( 'A FileResourceProviderMock', () => {

   const mockFiles_ = {
      'some/file.json': { a: { json: 'file' } },
      'some/file.html': '<h1>a mock html</h1>'
   };
   let mockFileResourceProvider_;

   beforeEach( () => {
      mockFileResourceProvider_ = createFrpMock( mockFiles_ );
   } );

   ////////////////////////////////////////////////////////////////////////////////////////////////////////

   it( 'spies on the offered "isAvailable" and "provide" methods', () => {
      expect( () => {
         mockFileResourceProvider_.isAvailable.calls.reset();
         mockFileResourceProvider_.provide.calls.reset();
      } ).not.toThrow();
   } );

   ////////////////////////////////////////////////////////////////////////////////////////////////////////

   it( 'offers an "isAvailable" method based on the mock entries', done => {
      mockFileResourceProvider_.isAvailable( 'some/file.json' )
         .then( exists => expect( exists ).toBe( true ) )
         .then( () => mockFileResourceProvider_.isAvailable( 'any/missing.json' ) )
         .then( exists => expect( exists ).toBe( false ) )
         .then( done );
   } );

   ////////////////////////////////////////////////////////////////////////////////////////////////////////

   it( 'offers a "provide" method based on the mock entries', done => {
      const spyForMissingReject = jasmine.createSpy( 'spyForMissingReject' );

      mockFileResourceProvider_.provide( 'any/missing' )
         .then( done.fail, spyForMissingReject )
         .then( () => expect( spyForMissingReject ).toHaveBeenCalled() )
         .then( () => mockFileResourceProvider_.provide( 'some/file.json' ) )
         .then( result => expect( result ).toEqual( mockFiles_[ 'some/file.json' ] ) )
         .then( () => mockFileResourceProvider_.provide( 'some/file.html' ) )
         .then( result => expect( result ).toEqual( mockFiles_[ 'some/file.html' ] ) )
         .then( done );
   } );

   ////////////////////////////////////////////////////////////////////////////////////////////////////////

   it( 'hands out fresh copies of provided json objects', done => {
      const spyForJson1 = jasmine.createSpy( 'spyForJson1' ).and.callFake( json => {
         expect( json ).toEqual( mockFiles_[ 'some/file.json' ] );
         json.manipulation = 'manipulation';
      } );

      mockFileResourceProvider_.provide( 'some/file.json' )
         .then( spyForJson1 )
         .then( () => expect( spyForJson1 ).toHaveBeenCalled() )
         .then( () => mockFileResourceProvider_.provide( 'some/file.json' ) )
         .then( result => expect( result ).toEqual( mockFiles_[ 'some/file.json' ] ) )
         .then( done );
   } );

} );
