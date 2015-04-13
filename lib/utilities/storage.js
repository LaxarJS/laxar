/**
 * Copyright 2014 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
define( [], function( undefined ) {
   'use strict';

   var PREFIX = 'ax.';
   var SESSION = 'sessionStorage';
   var LOCAL = 'localStorage';

   var localBackend = getOrFake( LOCAL, createFakeBackend );
   var sessionBackend = getOrFake( SESSION, createFakeBackend );

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   /**
    * Wraps a given storage backend so that all access transparently goes to the given namespace.
    *
    * @param {Object} backend
    *    a storage-compatible object (browser-provided or mock)
    * @param {string} namespace
    *    the key prefix to prepend to all get/set/remove-operation keys
    *
    * @return {Object}
    */
   function createStorageForNamespace( backend, namespace ) {
      return createStorage( backend, PREFIX + namespace );
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   /**
    * Wrapper for `window.localStorage` or `window.sessionStorage` providing a more convenient API.
    *
    * Provides a K/V store where values can be any "JSON-stringifyable" object and stores them in a `backend`
    * only supporting strings as values. Also, all keys are transparently prefixed by a namespace, so that
    * many storage wrappers can share the same backend without interference.
    *
    * @param {Object} backend
    *    the K/V store, probably only accepting string values
    * @param {String} namespace
    *    prefix for all keys for namespacing purposes
    *
    * @return {Object}
    *    a storage wrapper to the given backend with `getItem`, `setItem` and `removeItem` methods
    */
   function createStorage( backend, namespace ) {

      return {
         getItem: getItem,
         setItem: setItem,
         removeItem: removeItem
      };

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      /**
       * Retrieves an item by key from the store. Note that the namespace the store was created with is
       * prepended automatically to the key.
       *
       * @param {String} key
       *    the key of the item to retrieve
       *
       * @return {*}
       *    the value or `null` if it doesn't exist in the store
       */
      function getItem( key ) {
         var item = backend.getItem( namespace + '.' + key );
         return item ? JSON.parse( item ) : item;
      }

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      /**
       * Sets a value for a key. An existing value will be overwritten Note that the namespace the store was
       * created with is prepended automatically to the key.
       *
       * @param {String} key
       *    the key of the item to set
       * @param {*} value
       *    the new value to set
       */
      function setItem( key, value ) {
         var nsKey = namespace + '.' + key;
         if( value === undefined ) {
            backend.removeItem( nsKey );
         }
         else {
            backend.setItem( nsKey, JSON.stringify( value ) );
         }
      }

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      /**
       * Removes the value associated with `key` from the store. Note that the namespace the store was created
       * with is prepended automatically to the key.
       *
       * @param {String} key
       *    the key of the item to remove
       */
      function removeItem( key ) {
         backend.removeItem( namespace + '.' + key );
      }

   }


   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   /**
    * Creates a fake storage backend to use when local/session-storage is not available (privacy settings).
    *
    * @return {Object}
    *    a storage-compatible object that does however not keep any data across navigation
    */
   function createFakeBackend() {
      return createDecoratedStorageBackend( {} );
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   /**
    * Takes a storage-compatible object (real or browser-provided) and adds get/set/remove-accessors that
    * behave like the versions from the web-storage standard.
    *
    * @param {Object} backend
    *    a web-storage compatible object (browser-provided or mock)
    *
    * @return {Object}
    *    a storage-compatible object that does however not keep any data across navigation
    */
   function createDecoratedStorageBackend( backend ) {
      return {
         getItem: function( key ) {
            return backend[ key ] || null;
         },
         setItem: function( key, val ) {
            backend[ key ] = val;
         },
         removeItem: function( key ) {
            if( key in backend ) {
               delete backend[ key ];
            }
         }
      };
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function getOrFake( webStorageName, mockFactory ) {
      var store = window[ webStorageName ];
      if( store.setItem && store.getItem && store.removeItem ) {
         try {
            var testKey = PREFIX + 'storage.testItem';
            // In iOS Safari Private Browsing, this will fail:
            store.setItem( testKey, 1 );
            store.removeItem( testKey );
            return createDecoratedStorageBackend( store );
         }
         catch( e ) {
            // setItem failed: must use fake storage
         }
      }

      if( window.console ) {
         var method = 'warn' in window.console ? 'warn' : 'log';
         window.console[ method ](
            'window.' + webStorageName + ' not available: Using non-persistent polyfill. \n' +
            'Try disabling private browsing or enabling cookies.'
         );
      }

      return mockFactory();
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   return {

      /**
       * Initializes or resets this module. In most cases this module will be called without arguments,
       * but having the ability to provide them is useful e.g. for mocking purposes within tests.
       * If the arguments are omitted, an attempt is made to access the native browser WebStorage api.
       * If that fails, storage is only mocked by an in memory map (thus actually unavailable).
       *
       * Developers are free to use polyfills to support cases where local- or session-storage may not be
       * available. Just make sure to initialize the polyfills before this module.
       *
       * @param {Object} [localStorageBackend]
       *    the backend for local storage, Default is `window.localStorage`
       * @param {Object} [sessionStorageBackend]
       *    the backend for session storage, Default is `window.sessionStorage`
       */
      init: function( localStorageBackend, sessionStorageBackend ) {
         localBackend = localStorageBackend || getOrFake( LOCAL, createFakeBackend );
         sessionBackend = sessionStorageBackend || getOrFake( SESSION, createFakeBackend );
      },

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      /**
       * Returns a local storage object for a specific local namespace.
       *
       * @param {String} namespace
       *    the namespace
       *
       * @return {Object}
       *    the local storage object
       */
      getLocalStorage: function( namespace ) {
         return createStorageForNamespace( localBackend, namespace );
      },

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      /**
       * Returns a session storage object for a specific local namespace.
       *
       * @param {String} namespace
       *    the namespace
       *
       * @return {Object}
       *    the session storage object
       */
      getSessionStorage: function( namespace ) {
         return createStorageForNamespace( sessionBackend, namespace );
      },

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      /**
       * Returns the local storage object for application scoped keys.
       *
       * @return {Object}
       *    the application local storage object
       */
      getApplicationLocalStorage: function() {
         return createStorageForNamespace( localBackend, 'app' );
      },

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      /**
       * Returns the session storage object for application scoped keys.
       *
       * @return {Object}
       *    the application session storage object
       */
      getApplicationSessionStorage: function() {
         return createStorageForNamespace( sessionBackend, 'app' );
      }

   };

} );
