/**
 * Copyright 2016 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
import { create as createStorageMock } from '../storage_mock';

describe( 'A storage mock', () => {

   let storageMock;

   beforeEach( () => {
      storageMock = createStorageMock();
   } );

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   it( 'provides a `storage`-compatible API', () => {
      expect( storageMock.getLocalStorage ).toEqual( jasmine.any( Function ) );
      expect( storageMock.getSessionStorage ).toEqual( jasmine.any( Function ) );
   } );

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   it( 'provides direct access to the mock backends', () => {
      expect( storageMock.mockBackends ).toEqual( jasmine.any( Object ) );
   } );

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   describe( 'providing "session" and "local" storage', () => {

      let sessionStorage;
      let localStorage;
      let getResult;

      beforeEach( () => {
         sessionStorage = storageMock.getSessionStorage( 'NS' );
         localStorage = storageMock.getLocalStorage( 'NS' );
         storageMock.mockBackends.local.NS.store.X = 5;
         storageMock.mockBackends.local.NS.store.Y = 50;
         storageMock.mockBackends.session.NS.store.X = 1;
         storageMock.mockBackends.session.NS.store.Y = 10;

         getResult = {
            session: sessionStorage.getItem( 'X' ),
            local: localStorage.getItem( 'X' )
         };
         [ localStorage, sessionStorage ].forEach( ( storage, i ) => {
            storage.removeItem( 'Y' );
            storage.setItem( 'Z', 100 + i );
         } );
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'serves getItem operations from the mock backend', () => {
         expect( getResult.local ).toEqual( 5 );
         expect( getResult.session ).toEqual( 1 );
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'persists removeItem operations into the mock backend', () => {
         expect( storageMock.mockBackends.local.NS.store.Y ).not.toBeDefined();
         expect( storageMock.mockBackends.session.NS.store.Y ).not.toBeDefined();
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'persists setItem operations into the mock backend', () => {
         expect( storageMock.mockBackends.local.NS.store.Z ).toEqual( '100' );
         expect( storageMock.mockBackends.session.NS.store.Z ).toEqual( '101' );
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'spies on storage calls', () => {
         expect( sessionStorage.getItem ).toHaveBeenCalled();
         expect( sessionStorage.setItem ).toHaveBeenCalled();
         expect( sessionStorage.removeItem ).toHaveBeenCalled();
         expect( localStorage.getItem ).toHaveBeenCalled();
         expect( localStorage.setItem ).toHaveBeenCalled();
         expect( localStorage.removeItem ).toHaveBeenCalled();
      } );

   } );

} );
