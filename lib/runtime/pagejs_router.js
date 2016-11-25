/**
 * Copyright 2016 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
import { forEach } from '../utilities/object';

/**
 * Module providing the page.js router factory.
 *
 * @module pagejs_router
 */

const ROUTE_PARAM_MATCHER = /\/:([^\/\?\(]+)(\(\.\*\)|\?)?/g;
const TRAILING_SEGMENTS_MATCHER = /\/(_\/)*_?$/;

/**
 * Creates and returns a new page.js router instance from its dependencies.
 *
 * @param {Object} pagejs
 *    the pagejs router module (or a compatible mock)
 * @param {Browser} browser
 *    the browser, used to determine the document base href
 * @param {Configuration} configuration
 *    the configuration instance, used to lookup router configuration as described above
 *
 * @return {PagejsRouter}
 *    a router instance that will route as soon as `registerRoutes` is invoked
 *
 * @private
 */
export function create( pagejs, browser, configuration ) {

   const hashbang = configuration.get( 'router.pagejs.hashbang', false );
   const queryEnabled = configuration.ensure( 'router.query.enabled' );

   const base = configuration.get( 'router.base' ) || fallbackBase( hashbang );
   const origin = originFromLocation( browser.location() );
   const absoluteBase = browser.resolve( base, origin );

   /**
    * Router implementation based on [page.js](https://visionmedia.github.io/page.js/).
    *
    * This router allows to register flow patterns in page.js syntax so that their handler is activated when
    * the corresponding URL is entered in the browser. While that alone does not add much to the
    * functionality built into page.js, this router also allows to construct URLs based on a pattern and
    * corresponding substitution parameters. Finally, users can trigger navigation directly.
    *
    * Note that the router supports various configuration options:
    *
    *  - `router.pagejs`: configuration object that is directly passed to page.js (such as `click`,
    *    `popstate`, `dispatch`, `hashbang`). The application is responsible for specifying the required
    *    options, as LaxarJS does not touch the page.js defaults otherwise. Consult the page.js documentation
    *    for more information
    *  - `router.query.enabled`: if `true`, query parameters are automatically transformed into additional
    *    place parameters and vice versa. The default is `false`
    *  - `router.base`: The base path under which to perform routing. If omitted, the document base href is
    *    used
    *
    * Note that this router encodes/decodes certain parameters in a way that is different from page.js:
    *
    *  - when the value `null` is encoded into a URL path segment, it is encoded as `_`
    *  - the value `/` is double-encoded
    *
    * @name PagejsRouter
    * @constructor
    */
   return {
      registerRoutes,
      navigateTo,
      constructAbsoluteUrl
   };

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   /**
    * Register all routes defined in the given route map, as well as a fallback route that should be used
    * when none of the other routes match. Also causes the initial route to be triggered.
    *
    * @param {Object.<String, Function>} routeMap
    *    a map of routing patterns in page.js syntax to the corresponding handler functions. When invoked,
    *    the handler functions will receive the decoded parameter values for their pattern and (if configured)
    *    from the query string, as a map from string parameter name to string value
    * @param {Function} fallbackHandler
    *    a handler that is invoked when none of the configured routes match. It receives the failed path as
    *    a string argument
    *
    * @memberof PagejsRouter
    */
   function registerRoutes( routeMap, fallbackHandler ) {
      pagejs.base( base );
      forEach( routeMap, ( handler, pattern ) => {
         pagejs( pattern, context => {
            handler( collectParameters( pattern, context ) );
         } );
      } );
      pagejs( '*', context => {
         fallbackHandler( context.path );
      } );
      pagejs.start( configuration.get( 'router.pagejs', {} ) );
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   /**
    * Change the browser location to a different routable URL, from pattern and parameters. This is also
    * called reverse-routing.
    *
    * @param {String[]} patterns
    *    a list of patterns to choose from. This allows the router to pick the "best" pattern, such as the
    *    pattern containing the largest number of given parameters. This router always picks the first pattern
    *    for now.
    * @param {Object} parameters
    *    parameter values to substitute into the pattern to generate a URL
    * @param {Boolean} [replaceHistory=true]
    *    if `true`, the current history entry is replaced with the new one, otherwise a new entry is pushed.
    *    Useful to express redirects
    *
    * @memberof PagejsRouter
    */
   function navigateTo( patterns, parameters, replaceHistory = false ) {
      const path = constructPath( patterns, parameters );
      ( replaceHistory ? pagejs.redirect : pagejs.show )( path );
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   /**
    * Create a routable URL, from pattern and parameters. This allows to create link-hrefs without repeating
    * URL patterns throughout the code base.
    *
    * @param {Array<String>} patterns
    *    a list of patterns to choose from. This allows the router to pick the "best" pattern, such as the
    *    pattern containing the largest number of given parameters. This router always picks the first pattern
    *    for now.
    * @param {Object} parameters
    *    parameter values to substitute into the pattern to generate a URL
    * @param {Object} parameterDefaults
    *    only applicable if query strings are enabled by configuration: before a parameter is encoded into the
    *    query string, it is checked against the default. Only values that are different from their default
    *    are kept
    *
    * @return {String} the resulting URL, including schema and host
    *
    * @memberof PagejsRouter
    */
   function constructAbsoluteUrl( patterns, parameters, parameterDefaults ) {
      const routingPath = constructPath( patterns, parameters, parameterDefaults );
      return hashbang ? `${absoluteBase}#!${routingPath}` : `${absoluteBase}${routingPath}`;
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function constructPath( patterns, parameters ) {
      const bestPattern = patterns[ 0 ];
      const path = bestPattern
         .replace( ROUTE_PARAM_MATCHER, ( $0, $param, $modifier ) => {
            const replacement = encodeSegment( parameters[ $param ], $modifier === '(.*)' );
            delete parameters[ $param ];
            return `/${replacement}`;
         } )
         .replace( TRAILING_SEGMENTS_MATCHER, '/' );

      if( queryEnabled ) {
         const query = [];
         forEach( parameters, (value, parameterName) => {
            const encodedKey = encodeURIComponent( parameterName );
            if( value === true ) {
               query.push( encodedKey );
               return;
            }
            if( value === false || value == null ) {
               return;
            }
            query.push( `${encodedKey}=${encodeURIComponent( value )}` );
         } );

         if( query.length ) {
            return `${path}?${query.join( '&' )}`;
         }
      }

      return path;
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function collectParameters( pattern, context ) {
      const { querystring = '', params = {} } = context;
      const parameters = {};
      if( queryEnabled && querystring.length ) {
         querystring.split( '&' )
            .map( _ => _.split( '=' ).map( decodeURIComponent ) )
            .forEach( ([ key, value ]) => {
               parameters[ key ] = value !== undefined ? value : true;
            } );
      }
      forEach( params, ( value, key ) => {
         const isMultiSegment = pattern.indexOf( `/:${key}(.*)` ) !== -1;
         parameters[ key ] = decodeSegment( value, isMultiSegment );
      } );
      return parameters;
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   /**
    * Encode a parameter value for use as path segment(s) in routing.
    *
    * Usually, values are simply URL-encoded, but there are special cases:
    *
    *  - `null` and `undefined` are encoded as '_',
    *  - other non-string values are converted to strings before URL encoding,
    *  - slashes ('/') are double-encoded to '%252F', so that page.js ignores them during route matching,
    *  - underscore ('_') is double-encoded to '%255F', to avoid confusion with '_' (null).
    *
    * When decoded, for use in didNavigate events, the original values will be restored, except for:
    *  - non-string input values, which will always be decoded into strings,
    *  - `undefined` values which will be decoded to `null`.
    *
    * @param {*} value
    *   the parameter to encode
    * @param {Boolean} [isMultiSegment=false]
    *   determines if encoded value may contain slashes (true) or if slashes are double-encoded so that the
    *   parameter can always be matched by a single path segment (false)
    * @return {String}
    *   the encoded value, for use as a path segment in URLs
    *
    * @private
    */
   function encodeSegment( value, isMultiSegment ) {
      if( value == null ) { return '_'; }
      const urlSegments = encodeURIComponent( value ).replace( /_/g, '%255F' );
      return isMultiSegment ? urlSegments : urlSegments.replace( /%2F/g, '%252F' );
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   /**
    * Decodes a place parameter value from a path segment, to restore it for use in will/didNavigate events.
    *
    * Usually, this reverses the application of {#encodeSegment} after the browser has decoded a URL, except:
    *  - path-segments based on non-string input values, which will always be decoded into strings,
    *  - path-segments based on `undefined` values which will be decoded to `null`.
    *
    * Note that while the browser has already performed URL-decoding, this function replaces `%2F` into `/`
    * and `%5F` to `_`, to be compatible with the double-encoding performaed by {#encodeSegment}.
    *
    * @param {String} value
    *   the encoded parameter segment to decode
    * @param {Boolean} [isMultiSegment=false]
    *   determines if url-encoded slashes in the value were part of the original input (true) or if slashes
    *   in the given value were double-encoded by {#encodeSegment} and need additional decoding (false)
    * @return {String}
    *   the decoded value, for use as a path segment in URLs
    *
    * @private
    */
   function decodeSegment( value, isMultiSegment ) {
      if( value === '_' || value == null ) { return null; }
      const segments = value.replace( /%5F/g, '_' );
      return isMultiSegment ? segments : segments.replace( /%2F/g, '/' );
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function fallbackBase( hashbang ) {
      if( hashbang ) {
         return browser.location().pathname;
      }
      // relies on the HTML `base` element being present
      const documentBase = browser.resolve( '.' ).replace( /\/$/, '' );
      return documentBase;
   }
}

function originFromLocation({ protocol, hostname, port }) {
   return `${protocol}://${hostname}${port ? `:${port}` : ''}`;
}
