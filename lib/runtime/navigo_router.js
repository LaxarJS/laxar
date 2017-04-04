/**
 * Copyright 2016 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
/**
 * Module providing the Navigo router factory.
 *
 * @module navigo_router
 */
import NavigoImplementation from 'navigo';

const ROUTE_PARAM_MATCHER = /\/:([^/?(]+)?/g;
const TRAILING_SEGMENTS_MATCHER = /\/(_\/)*_?$/;

/**
 * Creates and returns a new Navigo router instance from its dependencies.
 *
 * @param {Browser} browser
 *    the browser, used to determine the document base href
 * @param {Configuration} configuration
 *    the configuration instance, used to lookup router configuration as described above
 * @param {Function} [Navigo]
 *    a Navigo constructor or mock to use instead of the original implementation. Intended for testing only
 *
 * @return {NavigoRouter}
 *    a router instance that will route as soon as `registerRoutes` is invoked
 *
 * @private
 */
export function create( browser, configuration, Navigo = NavigoImplementation ) {

   const useHash = configuration.get( 'router.navigo.useHash', false );
   const hash = configuration.get( 'router.navigo.hash', '#' );
   const queryEnabled = configuration.ensure( 'router.query.enabled' );

   const absoluteBase = (() => {
      if( useHash ) { return null; }
      const base = configuration.get( 'router.base' ) || fallbackBase();
      const origin = originFromLocation( browser.location() );
      return browser.resolve( base, origin ).replace( /\/$/, '' );
   })();

   const router = new Navigo( absoluteBase, useHash, hash );

   /**
    * Router implementation based on [Navigo](https://github.com/krasimir/navigo).
    *
    * This router allows to register flow patterns in Navigo syntax so that their handler is activated when
    * the corresponding URL is entered in the browser. While that alone does not add much to the
    * functionality built into Navigo, this router also allows to construct URLs based on a pattern and
    * corresponding substitution parameters. Finally, users can trigger navigation directly.
    *
    * Note that the router supports various configuration options:
    *
    *  - `router.navigo`: configuration object that is directly passed to Navigo (such as `useHash`). The
    *    application is responsible for specifying the required options, as LaxarJS does not touch the Navigo
    *    defaults otherwise. Consult the Navigo documentation for more information
    *  - `router.query.enabled`: if `true`, query parameters are automatically transformed into additional
    *    place parameters and vice versa. The default is `false`
    *  - `router.base`: The base path under which to perform routing. If omitted, the document base href is
    *    used
    *
    * Note that this router encodes/decodes certain parameters in a way that is different from Navigo:
    *
    *  - when the value `null` is encoded into a URL path segment, it is encoded as `_`
    *  - the value `/` is double-encoded
    *
    * @name NavigoRouter
    * @constructor
    */
   return {
      registerRoutes,
      navigateTo,
      navigateToPath,
      constructAbsoluteUrl
   };

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   /**
    * Registers all routes defined in the given route map, as well as a fallback route that should be used
    * when none of the other routes match. Also causes the initial route to be triggered.
    *
    * @param {Object.<String, Function>} routeMap
    *    a map of routing patterns in Navigo syntax to the corresponding handler functions. When invoked,
    *    the handler functions will receive the decoded parameter values for their pattern and (if configured)
    *    from the query string, as a map from string parameter name to string value
    * @param {Function} fallbackHandler
    *    a handler that is invoked when none of the configured routes match. It receives the failed location
    *    href as a string argument
    *
    * @memberof NavigoRouter
    */
   function registerRoutes( routeMap, fallbackHandler ) {
      let emptyHashRouteHandler = null;
      if( useHash && '/' in routeMap ) {
         emptyHashRouteHandler = routeMap[ '/' ];
         delete routeMap[ '/' ];
      }
      const preparedRoutes = Object.keys( routeMap ).reduce( ( routes, pattern ) => ({
         ...routes,
         [ pattern ]: ( params, querystring ) => {
            routeMap[ pattern ]( collectParameters( params, querystring ) );
         }
      }), {} );

      router
         .on( preparedRoutes )
         .on( '*', querystring => {
            if( emptyHashRouteHandler ) {
               if( [ '', hash, `${hash}/` ].indexOf( browser.location().hash ) !== -1 ) {
                  emptyHashRouteHandler( collectParameters( {}, querystring ) );
                  return;
               }
            }
            fallbackHandler( browser.location().href );
         } )
         .resolve();
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   /**
    * Change the browser location to a different routable URL, from pattern and parameters. This is also
    * called reverse-routing.
    *
    * @param {String[]} patterns
    *    a list of patterns to choose from. This allows the router to pick the "best" pattern, such as the
    *    pattern containing the largest number of given parameters. This router always picks the first pattern
    *    for now
    * @param {Object} parameters
    *    parameter values to substitute into the pattern to generate a URL
    * @param {Boolean} [replaceHistory=true]
    *    if `true`, the current history entry is replaced with the new one, otherwise a new entry is pushed.
    *    Useful to express redirects
    *
    * @memberof NavigoRouter
    */
   function navigateTo( patterns, parameters, replaceHistory = false ) {
      navigateToPath( constructPath( patterns, parameters ), replaceHistory );
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   /**
    * Change the browser location to a different routable URL, from a complete path. This is also
    * called reverse-routing.
    *
    * @param {String} path
    *    the complete path to navigate to. This includes values for all relevant parameters
    * @param {Boolean} [replaceHistory=true]
    *    if `true`, the current history entry is replaced with the new one, otherwise a new entry is pushed.
    *    Useful to express redirects
    *
    * @memberof NavigoRouter
    */
   function navigateToPath( path, replaceHistory = false ) {
      if( !replaceHistory ) {
         router.navigate( path );
         return;
      }

      // Navigo uses replaceState only if the router is paused. Alas, if the router is paused, routes will no
      // longer be resolved. Hence, we call resolve again manually after changing history and the location.
      router.pause();
      router.navigate( path );
      router.resume();
      router.resolve();
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   /**
    * Create a routable URL, from pattern and parameters. This allows to create link-hrefs without repeating
    * URL patterns throughout the code base.
    *
    * @param {Array<String>} patterns
    *    a list of patterns to choose from. This allows the router to pick the "best" pattern, such as the
    *    pattern containing the largest number of given parameters. This router always picks the first pattern
    *    for now
    * @param {Object} parameters
    *    parameter values to substitute into the pattern to generate a URL
    *
    * @return {String} the resulting URL, including schema and host
    *
    * @memberof NavigoRouter
    */
   function constructAbsoluteUrl( patterns, parameters ) {
      return router.link( ( useHash ? hash : '' ) + constructPath( patterns, parameters ) );
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function constructPath( patterns, parameters ) {
      const bestPattern = patterns[ 0 ];
      const remainingParameters = { ...parameters };
      const path = bestPattern
         .replace( ROUTE_PARAM_MATCHER, ( $0, $param ) => {
            const replacement = encodeSegment( parameters[ $param ] );
            delete remainingParameters[ $param ];
            return `/${replacement}`;
         } )
         .replace( TRAILING_SEGMENTS_MATCHER, '/' );

      if( queryEnabled ) {
         const query = Object.keys( remainingParameters )
            .map( parameterName => {
               const value = remainingParameters[ parameterName ];
               const encodedKey = encodeURIComponent( parameterName );
               if( value === true ) {
                  return encodedKey;
               }
               if( value === false || value == null ) {
                  return null;
               }
               return `${encodedKey}=${encodeURIComponent( value )}`;
            } )
            .filter( _ => _ );

         if( query.length ) {
            return `${path}?${query.join( '&' )}`;
         }
      }

      return path;
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function collectParameters( params, querystring ) {
      const parameters = {};
      if( queryEnabled && querystring && querystring.length ) {
         querystring.split( '&' )
            .map( _ => _.split( '=' ).map( decodeURIComponent ) )
            .forEach( ([ key, value ]) => {
               parameters[ key ] = value !== undefined ? value : true;
            } );
      }
      Object.keys( params || {} ).forEach( key => {
         parameters[ key ] = decodeSegment( params[ key ] );
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
    *  - slashes ('/') are double-encoded to '%252F', so that Navigo ignores them during route matching,
    *  - underscore ('_') is double-encoded to '%255F', to avoid confusion with '_' (null).
    *
    * When decoded, for use in didNavigate events, the original values will be restored, except for:
    *  - non-string input values, which will always be decoded into strings,
    *  - `undefined` values which will be decoded to `null`.
    *
    * @param {*} value
    *   the parameter to encode
    * @return {String}
    *   the encoded value, for use as a path segment in URLs
    *
    * @private
    */
   function encodeSegment( value ) {
      if( value == null ) { return '_'; }
      const urlSegment = encodeURIComponent( value ).replace( /_/g, '%255F' );
      return urlSegment.replace( /%2F/g, '%252F' );
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
    * @return {String}
    *   the decoded value, for use as a path segment in URLs
    *
    * @private
    */
   function decodeSegment( value ) {
      if( value === '_' || value == null ) { return null; }
      const segment = decodeURIComponent( value ).replace( /%5F/g, '_' );
      return segment.replace( /%2F/g, '/' );
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function fallbackBase() {
      // relies on the HTML `base` element being present
      const documentBase = browser.resolve( '.' ).replace( /\/$/, '' );
      return documentBase;
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function originFromLocation({ protocol, hostname, port }) {
      return `${protocol}://${hostname}${port ? `:${port}` : ''}`;
   }
}
