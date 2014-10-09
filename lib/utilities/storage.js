/**
 * Copyright 2014 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
define( [], function() {
   'use strict';

   var PREFIX = 'ax.';
   var localStorageBackend_ = getOrFakeLocalStorage();
   var sessionStorageBackend_ = getOrFakeSessionStorage();

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   /**
    * Wrapper for `window.localStorage` or `window.sessionStorage` providing a more convenient api. In fact it
    * provides a K/V store where values can be any "JSON-stringifyable" object and stores them in a `backend`
    * only supporting strings as values.
    *
    * @param {Object} backend
    *    the K/V store, probably only accepting string values
    * @param {String} namespace
    *    prefix for all keys for namespacing purposes
    *
    * @constructor
    */
   function Storage( backend, namespace ) {
      this.backend = backend;
      this.namespace = namespace;
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   /**
    * Retrieves an item by key from the store. Note that the namespace the store was created with is prepended
    * automatically to the key.
    *
    * @param {String} key
    *    the key of the item to retrieve
    *
    * @return {*}
    *    the value or `null` if it doesn't exist in the store
    */
   Storage.prototype.getItem = function( key ) {
      var item = this.backend.getItem( this.namespace + '.' + key );
      return item ? JSON.parse( item ) : item;
   };

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   /**
    * Sets a value for a key. An existing value will be overwritten Note that the namespace the store was
    * created with is prepended automatically to the key.
    *
    * @param {String} key
    *    the key of the item to set
    * @param {*} value
    *    the new value to set
    */
   Storage.prototype.setItem = function( key, value ) {
      this.backend.setItem( this.namespace + '.' + key, JSON.stringify( value ) );
   };

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   /**
    * Removes the value associated with `key` from the store. Note that the namespace the store was created
    * with is prepended automatically to the key.
    *
    * @param {String} key
    *    the key of the item to remove
    */
   Storage.prototype.removeItem = function( key ) {
      this.backend.removeItem( this.namespace + '.' + key );
   };

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function createStorageForNamespace( backend, namespace ) {
      return new Storage( backend, PREFIX + namespace );
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function getOrFakeLocalStorage() {
      return testForStorage( 'localStorage', function() {

         var localStore = window.localStore = {};

         return {
            getItem: function( key ) {
               return localStore[ key ] || null;
            },
            setItem: function( key, val ) {
               localStore[ key ] = val;
            },
            removeItem: function( key ) {
               delete localStore[ key ];
            }
         };
      } );
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function getOrFakeSessionStorage() {
      return testForStorage( 'sessionStorage', function() {

         var sessionStoreCache = readWindowNameData();

         return {
            getItem: function( key ) {
               return sessionStoreCache[ key ] || null;
            },
            setItem: function( key, val ) {
               sessionStoreCache[ key ] = val;
               window.name = JSON.stringify( sessionStoreCache );
            },
            removeItem: function( key ) {
               delete sessionStoreCache[ key ];
               window.name = JSON.stringify( sessionStoreCache );
            }
         };

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         function readWindowNameData() {
            var cache = {};
            try {
               cache = JSON.parse( window.name );
            }
            catch( e ) {}
            return typeof cache === 'object' && cache !== null ? cache : {};
         }

      } );
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function testForStorage( which, mockFactory ) {
      var store = window[ which ];
      if( store.setItem && store.getItem && store.removeItem ) {
         return createStorageWrapper( store );
      }

      if( window.console ) {
         var method = 'warn' in window.console ? 'warn' : 'log';
         window.console[ method ](
            'window.' + which + ' is not available. Using a non-persistent polyfill. \n' +
            'If cookies are disabled, at least in Firefox WebStorage isn\'t available as well. \n' +
            'Thus enabling cookies in your browser and reopening the application might help.'
            );
      }

      return mockFactory();
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function createStorageWrapper( store ) {
      // Filtering IE 8 which reports localStorage.setItem as string and sessionStorage.setItem as object ...
      // We them return a wrapped access to web storage by directly setting and reading keys from the storage
      // object. Calling the methods of the web storage api in some cases leads to strange exceptions.
      if( typeof store.setItem === 'function' ) {
         return store;
      }

      return {
         getItem: function( key ) {
            return store[ key ];
         },
         setItem: function( key, val ) {
            store[ key ] = val;
         },
         removeItem: function( key ) {
            if( key in store ) {
               delete store[ key ];
            }
         }
      };
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   return {

      /**
       * Initializes this module. In most cases this module will be called without arguments, but having the
       * ability to provide them is useful e.g. for mocking purposes within tests. If the arguments are
       * omitted, an attempt is made to access the native browser WebStorage api. If that fails local storage
       * is only mocked by an in memory map (thus actually unavailable) and session storage by using the
       * `window.name` trick.
       *
       * @param {Object} [localStorageBackend]
       *    the backend for local storage, Default is `window.localStorage`
       * @param {Object} [sessionStorageBackend]
       *    the backend for session storage, Default is `window.sessionStorage`
       */
      init: function( localStorageBackend, sessionStorageBackend ) {
         localStorageBackend_ = localStorageBackend || getOrFakeLocalStorage();
         sessionStorageBackend_ = sessionStorageBackend || getOrFakeSessionStorage();
      },

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      /**
       * Returns a local storage object for a specific local namespace.
       *
       * @param {String} namespace
       *    the namespace
       *
       * @return {Storage}
       *    the local storage object
       */
      getLocalStorage: function( namespace ) {
         return createStorageForNamespace( localStorageBackend_, namespace );
      },

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      /**
       * Returns a session storage object for a specific local namespace.
       *
       * @param {String} namespace
       *    the namespace
       *
       * @return {Storage}
       *    the session storage object
       */
      getSessionStorage: function( namespace ) {
         return createStorageForNamespace( sessionStorageBackend_, namespace );
      },

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      /**
       * Returns the local storage object for application scoped keys.
       *
       * @return {Storage}
       *    the application local storage object
       */
      getApplicationLocalStorage: function() {
         return createStorageForNamespace( localStorageBackend_, 'app' );
      },

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      /**
       * Returns the session storage object for application scoped keys.
       *
       * @return {Storage}
       *    the application session storage object
       */
      getApplicationSessionStorage: function() {
         return createStorageForNamespace( sessionStorageBackend_, 'app' );
      }

   };

} );
