/**
 * Copyright 2016 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */

import { tabulate } from '../utilities/object';
import { create as createBrowser } from '../runtime/browser';

/**
 * A browser mock where the URL and base URL can be set without affecting the actual document location.
 *
 * Also provides a mock `console` where the most important log methods are available.
 * If other methods need to be mocked, a custom console should be passed through the fake environment.
 *
 * @param {Object} [fakeEnvironment]
 *    optional options to override the behavior of the mock
 * @param {Location} [fakeEnvironment.locationMock=window.location]
 *    a specific value to return from the `location()` mock
 * @param {Console} [fakeEnvironment.consoleMock]
 *    a specific console to use for the `console()` mock instead of the default fake console
 *
 * @return {Browser}
 *    a fresh mock instance
 */
export function create( { locationMock, consoleMock } = {} ) {

   const browser = createBrowser();
   const mockFetchResponses = [];

   const api = {
      location: jasmine.createSpy( 'browser.location' ).and.callFake( () => api.locationMock ),
      resolve: jasmine.createSpy( 'browser.resolve' ).and.callFake( browser.resolve ),
      console: jasmine.createSpy( 'browser.console' ).and.callFake( () => api.consoleMock ),
      fetch: jasmine.createSpy( 'fetch' ).and.callFake( fakeFetch ),

      /**
       * Can be used by tests to spy on `location()`-methods, or to modify the location mock afterwards.
       *
       * @type {Location}
       * @memberof Browser
       */
      locationMock: locationMock || browser.location(),

      /**
       * Can be used by tests to spy on `console()`-methods, or to modify the console mock afterwards.
       *
       * @type {Console}
       * @memberof Browser
       */
      consoleMock: consoleMock || tabulate(
         method => jasmine.createSpy( `console.${method}` ),
         [ 'log', 'debug', 'info', 'warn', 'error', 'trace' ]
      ),

      /**
       * Add a mock `fetch()` response.
       * When clients use `fetch` with the specified URL (directly, not through a `Request` object), they will
       * be served an Object that has the corresponding value as its `text()` result.
       *
       * @param {String} url
       *    a URL to mock a response for
       * @param {String} value
       *    the value to return (will be transformed using JSON.stringify)
       * @param {String} [method='GET']
       *    the HTTP method to use
       *
       * @memberof Browser
       */
      respondWith( url, value, method = 'GET' ) {
         mockFetchResponses.push( { method, url, value } );
      },

      /**
       * Reset the mock `fetch()` responses
       * @memberof Browser
       */
      reset() {
         mockFetchResponses.length = 0;
      }
   };

   return api;

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function fakeFetch( url, optionalOptions ) {
      const options = { method: 'GET', ...optionalOptions };
      const { method } = options;
      const response = mockFetchResponses.filter( _ => _.url === url && _.method === method )[ 0 ];
      return response === undefined ? Promise.reject() : Promise.resolve( {
         text: () => Promise.resolve( JSON.stringify( response.value ) )
      } );
   }

}
