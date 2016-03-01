/**
 * Copyright 2016 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */

/**
 * Abstraction for browser api used internally by LaxarJS. We use this instead of the DOM and window directly
 * to be able to easily mock this during tests.
 */
export function create() {

   return {
      location: () => window.location
   };

}
