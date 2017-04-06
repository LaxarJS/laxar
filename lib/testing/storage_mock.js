/**
 * Copyright 2016 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */

/**
 * Allows to instantiate a mock implementations of {@link Storage}, compatible to the "axGlobalStorage"
 * injection. For the widget-specific "axStorage" injection, refer to the {@link widget_services_storage_mock}
 * module.
 *
 * @module storage_mock
 */

 /**
  * Creates a storage mock that does not actually change the browser's local- or session-storage.
  *
  * @return {StorageMock}
  *    a fresh mock instance
  */
export function create() {

   const spy = name => jasmine.createSpy( name );

   const mockBackends = {
      local: {},
      session: {}
   };

   /**
    * A mock for {@link Storage} that does not actually change the browser's local- or session-storage.
    * Instances of this mock are compatible to the "axGlobalStorage" injection.
    *
    * Do not confuse this with the {@AxStorageMock}, which is compatible to the "axStorage" injection offered
    * by the widget services.
    *
    * Note that the mock does perform JSON transformations of the value objects, just like the actual Storage.
    *
    * @name StorageMock
    * @constructor
    * @extends {Storage}
    */
   return {
      getLocalStorage: spy( 'getLocalStorage' ).and.callFake( mockStorage( 'local' ) ),
      getSessionStorage: spy( 'getSessionStorage' ).and.callFake( mockStorage( 'session' ) ),

      /**
       * Provides access to the backing stores of the storage mock.
       *
       * Has a `local` and a `session` property, each of which has spies for `getItem`/`setItem`/`removeItem`.
       * The `local` and `session` properties also provide direct access to their respective backing `store`
       * objects, accessible in this manner:
       *
       * ```js
       * import { createAxGlobalStorageMock } from 'laxar/laxar-widget-service-mocks';
       * const storageMock = createAxGlobalStorageMock();
       * storageMock.getLocalStorage( 'myNs' ).setItem( 'k', 'v' );
       * expect( storageMock.mockBackends.local.myNs.k ).toEqual( '"v"' );  // note the JSON transform
       * ```
       *
       * @memberof {StorageMock}
       * @type {Object}
       */
      mockBackends
   };

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function mockBackend( type ) {
      const store = {};
      return {
         setItem: spy( `${type}.setItem` ).and.callFake( ( k, v ) => {
            store[ k ] = v === undefined ? v : JSON.stringify( v );
         } ),
         getItem: spy( `${type}.getItem` ).and.callFake( k => store[ k ] && JSON.parse( store[ k ] ) ),
         removeItem: spy( `${type}.removeItem` ).and.callFake( k => { delete store[ k ]; } ),
         store
      };
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function mockStorage( type ) {
      return prefix => {
         if( !mockBackends[ type ][ prefix ] ) {
            mockBackends[ type ][ prefix ] = mockBackend( type );
         }
         return mockBackends[ type ][ prefix ];
      };
   }
}
