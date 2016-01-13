/**
 * Copyright 2016 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
define( [
   '../storage',
   '../configuration'
], function( storageModule, configuration ) {
   'use strict';

   describe( 'storage', function() {

      var storage;
      var fakeLocalStorage_;
      var fakeSessionStorage_;

      beforeEach( function() {
         fakeLocalStorage_ = createFakeStorage();
         fakeSessionStorage_ = createFakeStorage();
         storage = storageModule.create( fakeLocalStorage_, fakeSessionStorage_ );
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'getItem, setItem and removeItem calls will be redirected to the provided storage backends', function() {

         storage.getLocalStorage( 'x' ).setItem( 'A', '4711' );
         expect( fakeLocalStorage_.setItem ).toHaveBeenCalledWith( 'ax.0.x.A', '"4711"' );

         storage.getLocalStorage( 'y' ).getItem( 'B' );
         expect( fakeLocalStorage_.getItem ).toHaveBeenCalledWith( 'ax.0.y.B' );

         storage.getLocalStorage( 'z' ).removeItem( 'C' );
         expect( fakeLocalStorage_.removeItem ).toHaveBeenCalledWith( 'ax.0.z.C' );

      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      describe( 'with a configured storage prefix', function() {

         beforeEach( function() {
            spyOn( configuration, 'get' ).andCallFake( function( key, fallback ) {
               if( key === 'storagePrefix' ) {
                  return 'myPrefix';
               }
               return fallback;
            } );

            storage = storageModule.create( fakeLocalStorage_, fakeSessionStorage_ );
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'uses the prefix to namespace keys', function() {

            storage.getLocalStorage( 'x' ).setItem( 'A', '4711' );
            expect( fakeLocalStorage_.setItem ).toHaveBeenCalledWith( 'ax.myPrefix.x.A', '"4711"' );

            storage.getLocalStorage( 'y' ).getItem( 'B' );
            expect( fakeLocalStorage_.getItem ).toHaveBeenCalledWith( 'ax.myPrefix.y.B' );

         } );

      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      describe( 'with no configured storage prefix but a configured application name', function() {

         beforeEach( function() {
            spyOn( configuration, 'get' ).andCallFake( function( key, fallback ) {
               if( key === 'name' ) {
                  return 'Drempels!';
               }
               return fallback;
            } );

            storage = storageModule.create( fakeLocalStorage_, fakeSessionStorage_ );
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'uses a hash of the name to namespace keys', function() {

            storage.getLocalStorage( 'x' ).setItem( 'A', '4711' );
            expect( fakeLocalStorage_.setItem ).toHaveBeenCalledWith( 'ax.444424363.x.A', '"4711"' );

            storage.getLocalStorage( 'y' ).getItem( 'B' );
            expect( fakeLocalStorage_.getItem ).toHaveBeenCalledWith( 'ax.444424363.y.B' );

         } );

      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'can store and retrieve objects and strings', function() {
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

      it( 'setItem with undefined value is equivalent to removeItem', function() {
         var sessionStorage = storage.getSessionStorage( 'X' );

         sessionStorage.setItem( 'duck', 'Donald Duck' );
         expect( sessionStorage.getItem( 'duck' ) ).toEqual( 'Donald Duck' );

         sessionStorage.setItem( 'duck', undefined );
         expect( function() {
            sessionStorage.getItem( 'duck' );
         } ).not.toThrow();
         expect( sessionStorage.getItem( 'duck' ) ).toBeUndefined();
      } );

   } );

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   describe( 'when localStorage or sessionStorage are not available', function() {

      var storage;
      var origSessionSetItem;
      var origLocalSetItem;
      var localStorage;
      var sessionStorage;

      beforeEach( function() {
         window.localStorage.removeItem( 'myTestKey' );
         window.sessionStorage.removeItem( 'myTestKey' );

         origSessionSetItem = window.sessionStorage.setItem;
         origLocalSetItem = window.localStorage.setItem;
         window.sessionStorage.setItem = function() {
            throw new Error( 'simulating setItem error (e.g. iOS private mode)' );
         };
         window.localStorage.setItem = '';

         storage = storageModule.create();
         localStorage = storage.getLocalStorage( 'X' );
         sessionStorage = storage.getSessionStorage( 'X' );
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      afterEach( function() {
         window.sessionStorage.setItem = origSessionSetItem;
         window.localStorage.setItem = origLocalSetItem;

         window.localStorage.removeItem( 'myTestKey' );
         window.sessionStorage.removeItem( 'myTestKey' );
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'uses an in memory replacement for localStorage', function() {
         localStorage.setItem( 'myTestKey', 12 );

         expect( window.localStorage.getItem( 'myTestKey' ) ).toEqual( null );
         expect( localStorage.getItem( 'myTestKey' ) ).toEqual( 12 );
      } );

   } );

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function createFakeStorage() {
      var store = {};
      var api = {
         getItem: function( key ) {
            return store[ key ];
         },
         setItem: function( key, val ) {
            store[ key ] = ''+val;
         },
         removeItem: function( key ) {
            delete store[ key ];
         }
      };
      Object.keys( api ).forEach( function( method ) {
         spyOn( api, method ).andCallThrough();
      } );
      return api;
   }

} );
