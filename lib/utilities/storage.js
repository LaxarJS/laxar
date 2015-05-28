/**
 * Copyright 2014 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
/**
 * Provides a convenient api over the browser's `window.localStorage` and `window.sessionStorage` objects. If
 * a browser doesn't support [web storage](http://www.w3.org/TR/webstorage/), a warning is logged to the
 * `console` (if available) and a non-persistent in-memory store will be used instead. Note that this can for
 * example also happen when using Mozilla Firefox with cookies disabled and as such isn't limited to older
 * browsers.
 *
 * Additionally, in contrast to plain *web storage* access, non-string values will be automatically passed
 * through JSON (de-) serialization on storage or retrieval. All keys will be prepended with a combination of
 * an arbitrary and a configured namespace to prevent naming clashes with other web applications running on
 * the same host and port. All {@link StorageApi} accessor methods should then be called without any namespace
 * since adding and removing it, is done automatically.
 *
 * When requiring `laxar`, it is available as `laxar.storage`.
 *
 * @module storage
 */
define( [
   './assert',
   './configuration'
], function( assert, configuration ) {
   'use strict';

   var SESSION = 'sessionStorage';
   var LOCAL = 'localStorage';

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   /**
    * @param {Object} backend
    *    the K/V store, probably only accepting string values
    * @param {String} namespace
    *    prefix for all keys for namespacing purposes
    *
    * @return {StorageApi}
    *    a storage wrapper to the given backend with `getItem`, `setItem` and `removeItem` methods
    *
    * @private
    */
   function createStorage( backend, namespace ) {

      /**
       * The api returned by one of the `get*Storage` functions of the *storage* module.
       *
       * @name StorageApi
       * @constructor
       */
      return {
         getItem: getItem,
         setItem: setItem,
         removeItem: removeItem
      };

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      /**
       * Retrieves a `value` by `key` from the store. JSON deserialization will automatically be applied.
       *
       * @param {String} key
       *    the key of the item to retrieve (without namespace prefix)
       *
       * @return {*}
       *    the value or `null` if it doesn't exist in the store
       *
       * @memberOf StorageApi
       */
      function getItem( key ) {
         var item = backend.getItem( namespace + '.' + key );
         return item ? JSON.parse( item ) : item;
      }

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      /**
       * Sets a `value` for a `key`. The value should be JSON serializable. An existing value will be
       * overwritten.
       *
       * @param {String} key
       *    the key of the item to set (without namespace prefix)
       * @param {*} value
       *    the new value to set
       *
       * @memberOf StorageApi
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
       * Removes the value associated with `key` from the store.
       *
       * @param {String} key
       *    the key of the item to remove (without namespace prefix)
       *
       * @memberOf StorageApi
       */
      function removeItem( key ) {
         backend.removeItem( namespace + '.' + key );
      }

   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function getOrFakeBackend( webStorageName ) {
      var store = window[ webStorageName ];
      if( store.setItem && store.getItem && store.removeItem ) {
         try {
            var testKey = 'ax.storage.testItem';
            // In iOS Safari Private Browsing, this will fail:
            store.setItem( testKey, 1 );
            store.removeItem( testKey );
            return store;
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

      var backend = {};
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

   function generateUniquePrefix() {
      var prefix = configuration.get( 'storagePrefix' );
      if( prefix ) {
         return prefix;
      }

      var str = configuration.get( 'name', '' );
      var res = 0;
      /* jshint bitwise:false */
      for( var i = str.length - 1; i > 0; --i ) {
         res = ((res << 5) - res) + str.charCodeAt( i );
         res |= 0;
      }
      return Math.abs( res );
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   /**
    * Creates a new storage module. In most cases this module will be called without arguments,
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
    *
    * @return {Object}
    *    a new storage module
    */
   function create( localStorageBackend, sessionStorageBackend ) {

      var localBackend = localStorageBackend || getOrFakeBackend( LOCAL );
      var sessionBackend = sessionStorageBackend || getOrFakeBackend( SESSION );
      var prefix = 'ax.' + generateUniquePrefix() + '.';

      return {

         /**
          * Returns a local storage object for a specific local namespace.
          *
          * @param {String} namespace
          *    the namespace to prepend to keys
          *
          * @return {StorageApi}
          *    the local storage object
          */
         getLocalStorage: function( namespace ) {
            assert( namespace ).hasType( String ).isNotNull();

            return createStorage( localBackend, prefix + namespace );
         },

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         /**
          * Returns a session storage object for a specific local namespace.
          *
          * @param {String} namespace
          *    the namespace to prepend to keys
          *
          * @return {StorageApi}
          *    the session storage object
          */
         getSessionStorage: function( namespace ) {
            assert( namespace ).hasType( String ).isNotNull();

            return createStorage( sessionBackend, prefix + namespace );
         },

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         /**
          * Returns the local storage object for application scoped keys. This is equivalent to
          * `storage.getLocalStorage( 'app' )`.
          *
          * @return {StorageApi}
          *    the application local storage object
          */
         getApplicationLocalStorage: function() {
            return createStorage( localBackend, prefix + 'app' );
         },

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         /**
          * Returns the session storage object for application scoped keys. This is equivalent to
          * `storage.getSessionStorage( 'app' )`.
          *
          * @return {StorageApi}
          *    the application session storage object
          */
         getApplicationSessionStorage: function() {
            return createStorage( sessionBackend, prefix + 'app' );
         },

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         create: create

      };

   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   return create();

} );
