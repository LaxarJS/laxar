/**
* Copyright 2016 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
import { tabulate } from '../utilities/object';

export function create( fakeEnvironment = {} ) {

   const consoleApi = tabulate(
      method => jasmine.createSpy( `console.${method}` ),
      [ 'log', 'debug', 'info', 'warn', 'error', 'trace' ]
   );

   const mockFetchResponses = [];

   return {
      location: jasmine.createSpy( 'browser.location' ).and.callFake( fakeLocation ),
      console: jasmine.createSpy( 'browser.console' ).and.callFake( fakeConsole ),
      fetch: jasmine.createSpy( 'fetch' ).and.callFake( fakeFetch ),

      // Special mock APIs for tests:
      respondWith( url, value, method = 'GET' ) {
         mockFetchResponses.push( { method, url, value } );
      },
      reset() {
         mockFetchResponses.length = 0;
      }
   };

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function fakeLocation() {
      return fakeEnvironment.location || window.location;
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function fakeFetch( url, optionalOptions ) {
      const options = { method: 'GET', ...optionalOptions };
      const { method } = options;
      const response = mockFetchResponses.filter( _ => _.url === url && _.method === method )[ 0 ];
      return response === undefined ? Promise.reject() : Promise.resolve( {
         text: () => Promise.resolve( JSON.stringify( response.value ) )
      } );
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function fakeConsole() {
      return ('console' in fakeEnvironment) ? fakeEnvironment.console : consoleApi;
   }
}
