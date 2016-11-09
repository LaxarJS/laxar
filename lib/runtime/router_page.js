import page from 'page';
import { forEach } from '../utilities/object';

const ROUTE_PARAMS_MATCHER = /(?:^|\/):([^\/]+)/g;

export function create( browser, configuration ) {

   const pageSettings = configuration.get( 'router.page', {} );
   const { hashbang = false } = pageSettings;
   const base = configuration.get( 'router.base' ) || fallbackBase( hashbang );
   const queryEnabled = configuration.get( 'router.query.enabled', false );

   const origin = originFromLocation( browser.location() );
   const absoluteBase = browser.resolve( base, origin );

   return {
      registerRoutes,
      navigateTo,
      constructAbsoluteUrl
   };

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function registerRoutes( routeMap, fallbackHandler ) {
      page.base( base );
      forEach( routeMap, ( pattern, handler ) => {
         page( pattern, context => {
            handler( collectParameters( context ), context.path );
         } );
      } );
      page( '*', context => {
         fallbackHandler( context.path );
      } );
      page.start( pageSettings );
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function navigateTo( url, replaceHistory = false ) {
      ( replaceHistory ? page.redirect : page.show )( url );
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function constructAbsoluteUrl( targetOrPlace, optionalParameters ) {
      const routingPath = constructPath( targetOrPlace, optionalParameters );
      return hashbang ? `${absoluteBase}#!${routingPath}` : `${absoluteBase}${routingPath}`;
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function constructPath( patterns, parameters, parameterDefaults = {} ) {
      const bestPattern = patterns[ 0 ];
      const pathSuffix = bestPattern.replace( ROUTE_PARAMS_MATCHER, ( [ , $param ] ) => {
         const replacement = encodeSegment( parameters[ $param ] );
         delete parameters[ $param ];
         return replacement;
      } );
      const path = `/${pathSuffix}`;

      if( queryEnabled ) {
         const query = [];
         Object.keys( parameters ).forEach( parameterName => {
            const value = parameters[ parameterName ];
            const defaultValue = parameterDefaults[ parameterName ];
            if( value == null || value === defaultValue ) {
               return;
            }
            const encodedKey = encodeURIComponent( parameterName );
            if( value === true ) {
               query.push( encodedKey );
               return;
            }
            if( value === false && !defaultValue ) {
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

   function collectParameters( place, context ) {
      const { querystring = '', params = {} } = context;
      const parameters = {};
      if( querystring.length ) {
         querystring.split( '&' )
            .map( _ => _.split( '=' ).map( decodeURIComponent ) )
            .forEach( ([ key, value ]) => {
               parameters[ key ] = value !== undefined ? value : true;
            } );
      }
      forEach( params, (value, key) => {
         parameters[ key ] = decodeSegment( value );
      } );
      return parameters;
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   /**
    * Encode a value for use as a path segment in routing.
    *
    * Usually, values are simply URL-encoded, but there are special cases:
    *
    *  - `null` and `undefined` are encoded as '_',
    *  - other non-string values are converted to strings before URL encoding,
    *  - slashes ('/') are double-encoded to '%252F', so that page.js ignores them during route matching.
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
      return value == null ? '_' : encodeURIComponent( value ).replace( /%2F/g, '%252F' );
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   /**
    * Decodes a place parameter value from a path segment, for use in didNavigate event.
    *
    * Usually, this reverses the application of {#encodeSegment} after the browser has decoded a URL, except:
    *  - path-segments based on non-string input values, which will always be decoded into strings,
    *  - path-segments based on `undefined` values which will be decoded to `null`.
    *
    * Note that while the browser has already performed URL-decoding, this function replaces `%2F` into `/` to
    * be compatible with the double-encoding performaed by {#encodeSegment}.
    *
    * @param {String} value
    *   the encoded parameter segment to decode
    * @return {String}
    *   the decoded value, for use as a path segment in URLs
    *
    * @private
    */
   function decodeSegment( value ) {
      return value === '_' || value == null ? null : value.replace( /%2F/g, '/' );
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function fallbackBase( hashbang ) {
      return hashbang ?
         browser.location().pathname :
         browser.resolve( '.' ).replace( /\/$/, '' );
   }
}

function originFromLocation({ protocol, hostname, port }) {
   return `${protocol}://${hostname}${port ? `:${port}` : ''}`;
}
