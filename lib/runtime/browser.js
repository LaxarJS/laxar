/**
 * Copyright 2016 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
/**
 * Module providing the Browser factory.
 *
 * Provides abstractions for browser APIs used internally by LaxarJS, which might need a different
 * implementation in a server-side environment, or for testing.
 * This service is internal to LaxarJS and not available to widgets and activities.
 *
 * @module browser
 */

/**
 * Create a browser abstraction environment.
 *
 * @return {Browser}
 *    a fresh browser instance
 *
 * @private
 */
export function create() {

   // for the MSIE `resolve`-workaround, cache the temporary HTML document
   let resolveDoc;
   let resolveDocBase;

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   /**
    * A brower mostly abstracts over the location-related DOM window APIs, and provides a console wrapper.
    * Since it is internal to LaxarJS, only relevant APIs are included.
    *
    * @name Browser
    * @constructor
    */
   return {
      /**
      * Calculates an absolute URL from a (relative) URL, and an optional base URL.
      *
      * If no base URL is given, the `document.baseURI` is used instead. The given base URL may also be
      * relative, in which case it is resolved against the `document.baseURI` before resolving the first URL.
      *
      * For browser environments that do not support the `new URL( url, baseUrl )` constructor for resolving
      * URLs or that do not support `document.baseURI`, fallback mechanisms are used.
      *
      * @param {String} url
      *    the URL to resolve
      * @param {String} baseUrl
      *    the base to resolve from
      *
      * @return {String}
      *    an absolute URL based on the given URL
      *
      * @type {Function}
      * @memberof Browser
      */
      resolve: selectResolver(),

      /**
       * Provides easily mocked access to `window.location`
       *
       * @return {Location}
       *    the current (window's) DOM location
       *
       * @type {Function}
       * @memberof Browser
       */
      location: () => window.location,

      /**
       * Provides easily mocked access to `window.fetch` or a suitable polyfill:
       *
       * @param {String|Request} input
       *    the URL to fetch or the request to perform
       * @param {Object} [init]
       *    additional options, described here in more detail:
       *    https://developer.mozilla.org/en-US/docs/Web/API/Globalfetch/fetch#Parameters
       *
       * @return {Promise<Response>}
       *    the resulting promise
       *
       * @type {Function}
       * @memberof Browser
       */
      fetch: ( input, init ) => window.fetch( input, init ),

      /**
       * Provides easily mocked access to `window.console`:
       *
       * @return {Console}
       *    the browser console promise
       *
       * @type {Function}
       * @memberof Browser
       */
      console: () => console.log //window.console
   };

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   // perform the exception-based feature-detect only once (for performance, and to be nice to debugger users)
   function selectResolver() {
      try {
         const { href } = window.location;
         return ( new URL( '', href ).href === href ) ? resolveUsingUrl : resolveUsingLink;
      }
      catch( e ) {
         return resolveUsingLink;
      }
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   // Resolve using the DOM URL API (Chrome, Firefox, Safari, MS Edge)
   function resolveUsingUrl( url, baseUrl ) {
      const absoluteBaseUrl = baseUrl ? abs( baseUrl ) : ( document.baseURI || abs( '.' ) );
      return new URL( url, absoluteBaseUrl ).href;

      function abs( url ) {
         return new URL( url, document.baseURI || resolveUsingLink( '.' ) );
      }
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   // Resolve using the a-tag fallback (MSIE)
   function resolveUsingLink( url, baseUrl ) {
      const absoluteBaseUrl = abs( baseUrl );
      if( !resolveDoc ) {
         resolveDoc = document.implementation.createHTMLDocument( '' );
         resolveDocBase = resolveDoc.createElement( 'base' );
         resolveDoc.head.appendChild( resolveDocBase );
      }
      resolveDocBase.href = absoluteBaseUrl;
      return abs( url, resolveDoc );

      function abs( url, baseDocument = document ) {
         const a = baseDocument.createElement( 'a' );
         // MSIE does not process empty URLs correctly (http://stackoverflow.com/a/7966835)
         a.href = url || '#';
         return url ? a.href : a.href.slice( 0, -1 );
      }
   }

}
