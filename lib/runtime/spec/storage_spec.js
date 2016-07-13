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
   let fakeLocalStorage_;
   let fakeSessionStorage_;

   beforeEach( () => {
      configurationMock = createConfigurationMock({});
      browserMock = createBrowserMock();
      fakeLocalStorage_ = createFakeStorage();
      fakeSessionStorage_ = createFakeStorage();
      storage = createStorage( configurationMock, browserMock, fakeLocalStorage_, fakeSessionStorage_ );
   } );

   ////////////////////////////////////////////////////////////////////////////////////////////////////////

   it( 'getItem, setItem and removeItem calls will be redirected to the provided storage backends', () => {

      storage.getLocalStorage( 'x' ).setItem( 'A', '4711' );
      expect( fakeLocalStorage_.setItem ).toHaveBeenCalledWith( 'ax.0.x.A', '"4711"' );

      storage.getLocalStorage( 'y' ).getItem( 'B' );
      expect( fakeLocalStorage_.getItem ).toHaveBeenCalledWith( 'ax.0.y.B' );

      storage.getLocalStorage( 'z' ).removeItem( 'C' );
      expect( fakeLocalStorage_.removeItem ).toHaveBeenCalledWith( 'ax.0.z.C' );

   } );

   ////////////////////////////////////////////////////////////////////////////////////////////////////////

   describe( 'with a configured storage prefix', () => {

      beforeEach( () => {
         configurationMock = createConfigurationMock( {
            'name': 'Drempels!',
            'storagePrefix': 'myPrefix'
         } );

         storage = createStorage( configurationMock, browserMock, fakeLocalStorage_, fakeSessionStorage_ );
      } );

      /////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'uses the prefix to namespace keys', () => {

         storage.getLocalStorage( 'x' ).setItem( 'A', '4711' );
         expect( fakeLocalStorage_.setItem ).toHaveBeenCalledWith( 'ax.myPrefix.x.A', '"4711"' );

         storage.getLocalStorage( 'y' ).getItem( 'B' );
         expect( fakeLocalStorage_.getItem ).toHaveBeenCalledWith( 'ax.myPrefix.y.B' );

      } );

   } );

   ////////////////////////////////////////////////////////////////////////////////////////////////////////

   describe( 'with no configured storage prefix but a configured application name', () => {

      beforeEach( () => {
         configurationMock = createConfigurationMock( { 'name': 'Drempels!' } );

         storage = createStorage( configurationMock, browserMock, fakeLocalStorage_, fakeSessionStorage_ );
      } );

      /////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'uses a hash of the name to namespace keys', () => {

         storage.getLocalStorage( 'x' ).setItem( 'A', '4711' );
         expect( fakeLocalStorage_.setItem ).toHaveBeenCalledWith( 'ax.444424363.x.A', '"4711"' );

         storage.getLocalStorage( 'y' ).getItem( 'B' );
         expect( fakeLocalStorage_.getItem ).toHaveBeenCalledWith( 'ax.444424363.y.B' );

      } );

   } );

   ////////////////////////////////////////////////////////////////////////////////////////////////////////

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

   ////////////////////////////////////////////////////////////////////////////////////////////////////////

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

///////////////////////////////////////////////////////////////////////////////////////////////////////////

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
      const storage = createStorage( createConfigurationMock(), browserMock );
      localStorage = storage.getLocalStorage( 'X' );
   } );

   ////////////////////////////////////////////////////////////////////////////////////////////////////////

   afterEach( () => {
      window.sessionStorage.setItem = origSessionSetItem;
      window.localStorage.setItem = origLocalSetItem;

      window.localStorage.removeItem( 'myTestKey' );
      window.sessionStorage.removeItem( 'myTestKey' );
   } );

   ////////////////////////////////////////////////////////////////////////////////////////////////////////

   it( 'uses an in memory replacement for localStorage', () => {
      localStorage.setItem( 'myTestKey', 12 );

      expect( window.localStorage.getItem( 'myTestKey' ) ).toEqual( null );
      expect( localStorage.getItem( 'myTestKey' ) ).toEqual( 12 );
   } );

} );
