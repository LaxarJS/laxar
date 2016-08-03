/**
 * Copyright 2016 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
import { create as createStorage } from '../storage';
import { create as createBrowserMock } from '../../testing/browser_mock';
import { create as createConfigurationMock } from '../../testing/configuration_mock';

describe( 'storage', () => {

   let browserMock;
   let configurationMock;
   let storage;
   let fakeLocalStorage;
   let fakeSessionStorage;

   beforeEach( () => {
      configurationMock = createConfigurationMock( { name: 'unnamed' } );
      browserMock = createBrowserMock();
      fakeLocalStorage = createFakeStorage();
      fakeSessionStorage = createFakeStorage();
      storage = createStorage( configurationMock, browserMock, fakeLocalStorage, fakeSessionStorage );
   } );

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   it( 'getItem, setItem and removeItem calls will be redirected to the provided storage backends', () => {

      storage.getLocalStorage( 'x' ).setItem( 'A', '4711' );
      expect( fakeLocalStorage.setItem ).toHaveBeenCalledWith( 'ax.unnamed.x.A', '"4711"' );

      storage.getLocalStorage( 'y' ).getItem( 'B' );
      expect( fakeLocalStorage.getItem ).toHaveBeenCalledWith( 'ax.unnamed.y.B' );

      storage.getLocalStorage( 'z' ).removeItem( 'C' );
      expect( fakeLocalStorage.removeItem ).toHaveBeenCalledWith( 'ax.unnamed.z.C' );

   } );

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   describe( 'with a configured storage prefix', () => {

      beforeEach( () => {
         configurationMock = createConfigurationMock( {
            'name': 'Drempels!',
            'storagePrefix': 'myPrefix'
         } );

         storage = createStorage( configurationMock, browserMock, fakeLocalStorage, fakeSessionStorage );
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'uses the prefix to namespace keys', () => {

         storage.getLocalStorage( 'x' ).setItem( 'A', '4711' );
         expect( fakeLocalStorage.setItem ).toHaveBeenCalledWith( 'ax.myPrefix.x.A', '"4711"' );

         storage.getLocalStorage( 'y' ).getItem( 'B' );
         expect( fakeLocalStorage.getItem ).toHaveBeenCalledWith( 'ax.myPrefix.y.B' );

      } );

   } );

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   describe( 'with no configured storage prefix but a configured application name', () => {

      beforeEach( () => {
         configurationMock = createConfigurationMock( { 'name': 'Drempels!' } );

         storage = createStorage( configurationMock, browserMock, fakeLocalStorage, fakeSessionStorage );
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'uses the application name to namespace keys', () => {

         storage.getLocalStorage( 'x' ).setItem( 'A', '4711' );
         expect( fakeLocalStorage.setItem ).toHaveBeenCalledWith( 'ax.Drempels!.x.A', '"4711"' );

         storage.getLocalStorage( 'y' ).getItem( 'B' );
         expect( fakeLocalStorage.getItem ).toHaveBeenCalledWith( 'ax.Drempels!.y.B' );

      } );

   } );

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   it( 'can store and retrieve objects and strings', () => {
      const donald = {
         id: 4711,
         name: 'Donald',
         nephews: [ 'Huey', 'Dewey', 'Louie' ],
         income: 0.5,
         lover: null,
         address: {
            city: 'Ducktown'
         }
      };

      const localStorage = storage.getLocalStorage( 'X' );

      localStorage.setItem( 'duck', donald );
      expect( localStorage.getItem( 'duck' ) ).toEqual( donald );

      localStorage.setItem( 'name', 'Daisy Duck' );
      expect( localStorage.getItem( 'name') ).toBe( 'Daisy Duck' );
   } );

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   it( 'setItem with undefined value is equivalent to removeItem', () => {
      const sessionStorage = storage.getSessionStorage( 'X' );

      sessionStorage.setItem( 'duck', 'Donald Duck' );
      expect( sessionStorage.getItem( 'duck' ) ).toEqual( 'Donald Duck' );

      sessionStorage.setItem( 'duck', undefined );
      expect( () => {
         sessionStorage.getItem( 'duck' );
      } ).not.toThrow();
      expect( sessionStorage.getItem( 'duck' ) ).toBeUndefined();
   } );

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function createFakeStorage() {
      const store = {};
      const api = {
         getItem( key ) {
            return store[ key ];
         },
         setItem( key, val ) {
            store[ key ] = `${val}`;
         },
         removeItem( key ) {
            delete store[ key ];
         }
      };
      Object.keys( api ).forEach( method => spyOn( api, method ).and.callThrough() );
      return api;
   }

} );

//////////////////////////////////////////////////////////////////////////////////////////////////////////////

describe( 'when localStorage or sessionStorage are not available', () => {

   let browserMock;
   let origSessionSetItem;
   let origLocalSetItem;
   let localStorage;

   beforeEach( () => {
      window.localStorage.removeItem( 'myTestKey' );
      window.sessionStorage.removeItem( 'myTestKey' );

      origSessionSetItem = window.sessionStorage.setItem;
      origLocalSetItem = window.localStorage.setItem;
      window.sessionStorage.setItem = () => {
         throw new Error( 'simulating setItem error (e.g. iOS private mode)' );
      };
      window.localStorage.setItem = '';

      browserMock = createBrowserMock();
      const storage = createStorage( createConfigurationMock( { name: 'whatever' } ), browserMock );
      localStorage = storage.getLocalStorage( 'X' );
   } );

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   afterEach( () => {
      window.sessionStorage.setItem = origSessionSetItem;
      window.localStorage.setItem = origLocalSetItem;

      window.localStorage.removeItem( 'myTestKey' );
      window.sessionStorage.removeItem( 'myTestKey' );
   } );

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   it( 'uses an in memory replacement for localStorage', () => {
      localStorage.setItem( 'myTestKey', 12 );

      expect( window.localStorage.getItem( 'myTestKey' ) ).toEqual( null );
      expect( localStorage.getItem( 'myTestKey' ) ).toEqual( 12 );
   } );

} );
