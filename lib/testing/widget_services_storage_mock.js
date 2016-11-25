/**
 * Copyright 2016 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */

/**
 * Allows to instantiate a mock implementations of {@link AxStorage}, compatible to the "axStorage" injection.
 *
 * @module widget_services_storage_mock
 */

import { create as createGlobalStorageMock } from './storage_mock';

/**
 * Creates a mock for the `axStorage` injection of a widget.
 *
 * @return {AxStorageMock}
 *    a mock of `axStorage` that can be spied and/or mocked with additional items
 */
export function create() {

   const globalStorageMock = createGlobalStorageMock();
   const namespace = 'mock';

   const local = globalStorageMock.getLocalStorage( namespace );
   const session = globalStorageMock.getSessionStorage( namespace );

   /**
    * The AxStorageMock provides the same API as AxStorage, with the additional property
    * {@link #mockBackends} to inspect and/or simulate mock values in the storage backend.
    *
    * @name AxStorageMock
    * @constructor
    * @extends AxStorage
    */
   return {
      local,
      session,

      /**
       * Provides access to the backing stores for `local` and `session` storage.
       *
       * Contains `local` and `session` store properties. The stores are plain objects whose properties
       * reflect any setItem/removeItem operations. When properties are set on a store, they are observed
       * by `getItem` calls on the corresponding axStorage API.
       *
       * @memberof AxStorageMock
       */
      mockBackends: {
         local: globalStorageMock.mockBackends.local[ namespace ].store,
         session: globalStorageMock.mockBackends.session[ namespace ].store
      }
   };

}
