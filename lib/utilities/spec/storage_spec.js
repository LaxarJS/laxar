/**
 * Copyright 2015 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
import { create as createStorage } from '../storage';
import * as configuration from '../configuration';

describe( 'storage', () => {

   var storage;
   var fakeLocalStorage_;
   var fakeSessionStorage_;

   beforeEach( () => {
      fakeLocalStorage_ = createFakeStorage();
      fakeSessionStorage_ = createFakeStorage();
      storage = createStorage( fakeLocalStorage_, fakeSessionStorage_ );
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
         spyOn( configuration, 'get' ).and.callFake( function( key, fallback ) {
            if( key === 'storagePrefix' ) {
               return 'myPrefix';
            }
            return fallback;
         } );

         storage =createStorage( fakeLocalStorage_, fakeSessionStorage_ );
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
         spyOn( configuration, 'get' ).and.callFake( function( key, fallback ) {
            if( key === 'name' ) {
               return 'Drempels!';
            }
            return fallback;
         } );

         storage = createStorage( fakeLocalStorage_, fakeSessionStorage_ );
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
      var donald = {
         id: 4711,
         name: 'Donald',
         nephews: [ 'Huey', 'Dewey', 'Louie'],
         income: 0.5,
         lover: null,
         address: {
            city: 'Ducktown'
         }
      };

      var localStorage = storage.getLocalStorage( 'X' );

      localStorage.setItem( 'duck', donald );
      expect( localStorage.getItem( 'duck' ) ).toEqual( donald );

      localStorage.setItem( 'name', 'Daisy Duck' );
      expect( localStorage.getItem( 'name') ).toBe( 'Daisy Duck' );
   } );

   ////////////////////////////////////////////////////////////////////////////////////////////////////////

   it( 'setItem with undefined value is equivalent to removeItem', () => {
      var sessionStorage = storage.getSessionStorage( 'X' );

      sessionStorage.setItem( 'duck', 'Donald Duck' );
      expect( sessionStorage.getItem( 'duck' ) ).toEqual( 'Donald Duck' );

      sessionStorage.setItem( 'duck', undefined );
      expect( () => {
         sessionStorage.getItem( 'duck' );
      } ).not.toThrow();
      expect( sessionStorage.getItem( 'duck' ) ).toBeUndefined();
   } );

} );

///////////////////////////////////////////////////////////////////////////////////////////////////////////

describe( 'when localStorage or sessionStorage are not available', () => {

   var storage;
   var origSessionSetItem;
   var origLocalSetItem;
   var localStorage;
   var sessionStorage;

   beforeEach( () => {
      window.localStorage.removeItem( 'myTestKey' );
      window.sessionStorage.removeItem( 'myTestKey' );

      origSessionSetItem = window.sessionStorage.setItem;
      origLocalSetItem = window.localStorage.setItem;
      window.sessionStorage.setItem = () => {
         throw new Error( 'simulating setItem error (e.g. iOS private mode)' );
      };
      window.localStorage.setItem = '';

      storage = createStorage();
      localStorage = storage.getLocalStorage( 'X' );
      sessionStorage = storage.getSessionStorage( 'X' );
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

///////////////////////////////////////////////////////////////////////////////////////////////////////////

function createFakeStorage() {
   var store = {};
   var api = {
      getItem( key ) {
         return store[ key ];
      },
      setItem( key, val ) {
         store[ key ] = ''+val;
      },
      removeItem( key ) {
         delete store[ key ];
      }
   };
   Object.keys( api ).forEach( method => spyOn( api, method ).and.callThrough() );
   return api;
}
