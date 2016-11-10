/**
 * Copyright 2016 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
import { forEach } from '../utilities/object';

const ROUTE_PARAM_MATCHER = /\/:([^\/]+)/g;
const TRAILING_SEGMENTS_MATCHER = /\/(_\/)*_?$/;

export function create( pagejs, browser, configuration ) {

   const pagejsSettings = configuration.get( 'router.pagejs', {} );
   const { hashbang = true } = pagejsSettings;
   const queryEnabled = configuration.get( 'router.query.enabled', false );

   const base = configuration.get( 'router.base' ) || fallbackBase( hashbang );
   const origin = originFromLocation( browser.location() );
   const absoluteBase = browser.resolve( base, origin );

   return {
      registerRoutes,
      navigateTo,
      constructAbsoluteUrl
   };

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function registerRoutes( routeMap, fallbackHandler ) {
      pagejs.base( base );
      forEach( routeMap, ( handler, pattern ) => {
         pagejs( pattern, context => {
            handler( collectParameters( context ), context.path );
         } );
      } );
      pagejs( '*', context => {
         fallbackHandler( context.path );
      } );
      pagejs.start( pagejsSettings );
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function navigateTo( patterns, parameters, replaceHistory = false ) {
      const path = constructPath( patterns, parameters );
      ( replaceHistory ? pagejs.redirect : pagejs.show )( path );
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function constructAbsoluteUrl( patterns, parameters, parameterDefaults ) {
      const routingPath = constructPath( patterns, parameters, parameterDefaults );
      return hashbang ? `${absoluteBase}#!${routingPath}` : `${absoluteBase}${routingPath}`;
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function constructPath( patterns, parameters ) {
      const bestPattern = patterns[ 0 ];
      const path = bestPattern
         .replace( ROUTE_PARAM_MATCHER, ( $0, $param ) => {
            const replacement = encodeSegment( parameters[ $param ] );
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
      return value == null ?
         '_' :
         encodeURIComponent( value ).replace( /%2F/g, '%252F' ).replace( /_/g, '%255F' );
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
      return value === '_' || value == null ? null : value.replace( /%2F/g, '/' ).replace( /%5F/g, '_' );
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
