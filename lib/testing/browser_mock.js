/**
* Copyright 2016 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
import { tabulate } from  '../utilities/object';

export function create( fakeEnvironment={} ) {

   const consoleApi = tabulate(
      method => jasmine.createSpy( `console.${method}` ),
      [ 'log', 'debug', 'info', 'warn', 'error', 'trace' ]
   );

   return {
      location: jasmine.createSpy( 'browser.location' ).and.callFake( fakeLocation ),
      fetch: jasmine.createSpy( 'browser.fetch' ).and.callFake( fakeFetch ),
      console: jasmine.createSpy( 'browser.console' ).and.callFake( fakeConsole )
   };

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function fakeLocation() {
      return fakeEnvironment.location || window.location;
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function fakeFetch() {
      return { then: () => {} };
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function fakeConsole() {
      return ('console' in fakeEnvironment) ? fakeEnvironment.console : consoleApi;
   }
}
