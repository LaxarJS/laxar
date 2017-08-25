/**
 * Copyright 2016 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */

/**
 * Module providing the StorageApi factory.
 *
 * Widgets and activities can access their StorageApi instance by requesting the injection
 * {@link widget_services#axStorage axStorage}, or use
 * {@link widget_services#axGlobalStorage axGlobalStorage} for shared items.
 *
 * As such, in most cases only the {@link StorageApi} documentation is relevant.
 *
 * @module storage
 */
import assert from '../utilities/assert';

const SESSION = 'sessionStorage';
const LOCAL = 'localStorage';

//////////////////////////////////////////////////////////////////////////////////////////////////////////////

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
    * Provides a convenient API over the browser's `window.localStorage` and `window.sessionStorage` objects.
    * If a browser doesn't support [web storage](http://www.w3.org/TR/webstorage/), a warning is logged to the
    * `console` (if available) and a non-persistent in-memory store will be used instead. Note that this can
    * for example also happen when using Mozilla Firefox with cookies disabled and as such isn't limited to
    * older browsers.
    *
    * Additionally, in contrast to plain *web storage* access, non-string values will be automatically passed
    * through JSON (de-) serialization on storage or retrieval. All keys will be prepended with a combination
    * of a fixed (`ax.`) and an application-specific namespace (configured using `storagePrefix` with fallback
    * to `name`) to avoid naming clashes with other (LaxarJS) web applications running on the same host and
    * port. All {@link StorageApi} accessor methods should be called without any namespace as it is
    * prepended automatically.
    *
    * @name StorageApi
    * @constructor
    */
   return {
      getItem,
      setItem,
      removeItem
   };

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   /**
    * Retrieves a `value` by `key` from the store. JSON deserialization will automatically be applied.
    *
    * @param {String} key
    *    the key of the item to retrieve (without namespace prefix)
    *
    * @return {*}
    *    the value or `null` if it doesn't exist in the store
    *
    * @memberof StorageApi
    */
   function getItem( key ) {
      const item = backend.getItem( `${namespace}.${key}` );
      return item && JSON.parse( item );
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   /**
    * Sets a `value` for a `key`. The value must be JSON serializable. An existing value will be overwritten.
    *
    * @param {String} key
    *    the key of the item to set (without namespace prefix)
    * @param {*} value
    *    the new value to set
    *
    * @memberof StorageApi
    */
   function setItem( key, value ) {
      const nsKey = `${namespace}.${key}`;
      if( value === undefined ) {
         backend.removeItem( nsKey );
      }
      else {
         backend.setItem( nsKey, JSON.stringify( value ) );
      }
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   /**
    * Removes the value associated with `key` from the store.
    *
    * @param {String} key
    *    the key of the item to remove (without namespace prefix)
    *
    * @memberof StorageApi
    */
   function removeItem( key ) {
      backend.removeItem( `${namespace}.${key}` );
   }

}

//////////////////////////////////////////////////////////////////////////////////////////////////////////////

function getOrFakeBackend( browser, webStorageName ) {
   const browserConsole = browser.console();
   if( typeof window !== 'undefined' ) {
      const store = window[webStorageName];
      if (store.setItem && store.getItem && store.removeItem) {
         try {
            const testKey = 'ax_.storage.test';
            // In iOS Safari Private Browsing, this will fail:
            store.setItem(testKey, 1);
            store.removeItem(testKey);
            return store;
         }
         catch (e) {
            // setItem failed: must use fake storage
         }
      }

      if (browserConsole) {
         const method = 'warn' in browserConsole ? 'warn' : 'log';
         browserConsole[method](
            `window.${webStorageName} not available: Using non-persistent polyfill. \n` +
            'Try disabling private browsing or enabling cookies.'
         );
      }
   }
   const backend = {};
   return {
      getItem( key ) {
         return backend[ key ] || null;
      },
      setItem( key, val ) {
         backend[ key ] = val;
      },
      removeItem( key ) {
         if( key in backend ) {
            delete backend[ key ];
         }
      }
   };
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////////

function applicationPrefix( configuration ) {
   return configuration.get(
      'storagePrefix',
      configuration.ensure( 'name' )
   );
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Creates a new storage factory. In most cases this module will be called without arguments,
 * but having the ability to provide them is useful e.g. for mocking purposes within tests.
 * If the arguments are omitted, an attempt is made to access the native browser WebStorage api.
 * If that fails, storage is only mocked by an in memory map (thus actually unavailable).
 *
 * Developers are free to use polyfills to support cases where local- or session-storage may not be
 * available. Just make sure to initialize the polyfills before this module.
 *
 * @param {Object} configuration
 *    a configuration service instance, to determine a storage prefix based on the configured name
 * @param {Object} browser
 *    the browser api adapter
 * @param {Object} [localStorageBackend]
 *    the backend for local storage. Default is `window.localStorage`
 * @param {Object} [sessionStorageBackend]
 *    the backend for session storage. Default is `window.sessionStorage`
 *
 * @return {StorageFactory}
 *    a new storage factory
 *
 * @private
 */
export function create( configuration, browser, localStorageBackend, sessionStorageBackend ) {

   const localBackend = localStorageBackend || getOrFakeBackend( browser, LOCAL );
   const sessionBackend = sessionStorageBackend || getOrFakeBackend( browser, SESSION );
   const prefix = `ax.${applicationPrefix( configuration )}.`;

   /**
    * The API returned by the module's `create` function.
    *
    * @name StorageFactory
    * @constructor
    */
   return {

      /**
       * Returns a local storage object for a specific local namespace.
       *
       * @param {String} namespace
       *    the namespace to prepend to keys
       *
       * @return {StorageApi}
       *    the local storage object
       *
       * @memberof StorageFactory
       */
      getLocalStorage( namespace ) {
         assert( namespace ).hasType( String ).isNotNull();

         return createStorage( localBackend, prefix + namespace );
      },

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      /**
       * Returns a session storage object for a specific local namespace.
       *
       * @param {String} namespace
       *    the namespace to prepend to keys
       *
       * @return {StorageApi}
       *    the session storage object
       *
       * @memberof StorageFactory
       */
      getSessionStorage( namespace ) {
         assert( namespace ).hasType( String ).isNotNull();

         return createStorage( sessionBackend, prefix + namespace );
      },

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      /**
       * Returns the local storage object for application scoped keys. This is equivalent to
       * `storage.getLocalStorage( 'app' )`.
       *
       * @return {StorageApi}
       *    the application local storage object
       *
       * @memberof StorageFactory
       */
      getApplicationLocalStorage() {
         return createStorage( localBackend, `${prefix}app` );
      },

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      /**
       * Returns the session storage object for application scoped keys. This is equivalent to
       * `storage.getSessionStorage( 'app' )`.
       *
       * @return {StorageApi}
       *    the application session storage object
       *
       * @memberof StorageFactory
       */
      getApplicationSessionStorage() {
         return createStorage( sessionBackend, `${prefix}app` );
      }

   };

}
