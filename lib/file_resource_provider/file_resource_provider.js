/**
 * Copyright 2016 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
/**
 * The *file_resource_provider* allows to load static assets from the resources bundle of a LaxarJS
 * application efficiently. Files are requested by LaxarJS as if they were to be fetched from the server,
 * and the file resource provider serves them from a pre-assembled bundle. If files are not embedded into the
 * bundle, the file resource provider can still determine if they would be provided by the server, and then
 * make the necessary HTTP request for them.
 * Clients can also check for the existence of certain assets (e.g. CSS stylesheets that may not be embedded
 * in the bundle) and then load these assets manually (e.g. by adding a `link` element to the page).
 *
 * This saves a lot of HTTP requests compared to just getting every file through plain HTTP GET.
 *
 * Widgets cannot currently access the file resource provider directly, but it is used by the LaxarJS runtime
 * to prepare their assets.
 *
 * @module file_resource_provider
 */
import assert from '../utilities/assert';
import * as path from '../utilities/path';

const BORDER_SLASHES_MATCHER = /^\/|\/$/g;
const ENTRY_TYPE_FILE = 1;

/**
 * Creates and returns a new instance.
 *
 * @param {Object} configuration
 *    the configuration api for the configuration the application was bootstrapped with
 * @param {Object} browser
 *    a browser abstraction
 * @param {String} rootPath
 *    the path to the root of the application. It is needed to prefix relative paths found in a listing
 *    with an absolute prefix
 * @param {String} resources
 *    the actual file listing
 *
 * @return {FileResourceProvider}
 *    a new instance
 */
export function create( configuration, browser, rootPath, resources ) {
   assert( configuration ).hasProperty( 'get' );
   assert( browser ).hasProperty( 'fetch' );
   assert( rootPath ).hasType( String ).isNotNull();
   assert( resources ).hasType( Object ).isNotNull();

   const exports = {
      isAvailable,
      provide
   };

   const root = path.normalize( rootPath );
   const useEmbedded = configuration.get( 'useEmbeddedFileListings', true );
   const httpGets = {};

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   return exports;

   /**
    * Resolves the returned promise with `true` as argument, if the requested resource is available and
    * `false` otherwise. Currently, this operation is always satisfied
    *
    * @param {String} url
    *    the uri to check for availability
    *
    * @return {Promise}
    *    a promise that is always resolved with a boolean value
    */
   function isAvailable( url ) {
      const entry = lookup( url );
      return Promise.resolve( isEntryAvailable( entry ) );
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   /**
    * Resolves the returned promise with `true` as argument, if the requested resource is available and
    * `false` otherwise.  If no listing for the path is available, a HEAD request takes place and either
    * succeeds or fails.
    *
    * @param {String} url
    *    the uri to check for availability
    *
    * @return {Promise}
    *    a promise that is always resolved with a boolean value
    */
   function provide( url ) {
      const entry = lookup( url );
      if( useEmbedded && isEntryEmbedded( entry ) ) {
         return Promise.resolve( entry ).then( transform( url ) );
      }
      if( isEntryAvailable( entry ) ) {
         return httpGet( url ).then( transform( url ) );
      }
      return Promise.reject();
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function transform( url ) {
      return url.slice( -5 ) === '.json' ?
         _ => JSON.parse( _ ) :
         _ => _;
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function lookup( url ) {
      const parts = url
         .replace( root, '' )
         .replace( BORDER_SLASHES_MATCHER, '' )
         .split( '/' );

      let subListing = resources;
      while( subListing && parts.length ) {
         subListing = subListing[ parts.shift() ];
      }
      return subListing;
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function isEntryAvailable( value ) {
      return value === ENTRY_TYPE_FILE || isEntryEmbedded( value );
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function isEntryEmbedded( value ) {
      return typeof value === 'string';
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function httpGet( url ) {
      if( url in httpGets ) {
         return httpGets[ url ];
      }
      const promise = httpGets[ url ] = browser.fetch( url ).then( response => response.text() );
      // Free memory when the response is complete:
      promise.then( () => { delete httpGets[ url ]; } );
      return promise;
   }

}
