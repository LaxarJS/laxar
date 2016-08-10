/**
 * Copyright 2016 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */

/**
 * Allows to create mock implementations of {@link FlowService}, compatible to the "axFlowService" injection.
 *
 * @module flow_service_mock
 */

import { create as createBrowserMock } from './browser_mock';

/**
 * Creates a mock for the `axFlowService` injection of a widget.
 *
 * @param {Object} [dependencies={}]
 *   optional service dependencies to be used by the mock flow service
 * @param {AxBrowser} [dependencies.browser]
 *   a (mock) browser to resolve the location when creating absolute mock URLs
 *
 * @return {AxFlowServiceMock}
 *    a mock of `axFlowService` that can be spied and/or mocked with additional items
 */
export function create( { browser = createBrowserMock() } = {} ) {

   /**
    * A mock version of the {@link FlowService} that does not rely on an actual flow definition.
    *
    * By default, the mock will simply return '/mockPath' for any call to `constructPath`, and the remaining
    * methods behave accordingly. All methods are spies, so their arguments may be inspected and their return
    * value may be modified using `and.callFake`.
    *
    * @name AxFlowServiceMock
    * @constructor
    * @extends AxFlowService
    */
   const api = {
      constructPath: spy( 'constructPath', () => '/mockPath' ),
      constructAnchor: spy( 'constructAnchor', ( ...args ) => `#${api.constructPath( ...args )}` ),
      constructAbsoluteUrl: spy( 'constructAbsoluteUrl', ( ...args ) => {
         const loc = browser.location();
         return `${loc.protocol}://${loc.host}${api.constructPath( ...args )}`;
      } )
   };

   return api;

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function spy( name, fake ) {
      return jasmine.createSpy( `axFlowServiceMock.${name}` ).and.callFake( fake );
   }

}
