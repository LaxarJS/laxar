/**
 * Copyright 2016 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
/**
 * The *file_resource_provider* module defines a mechanism to load static assets from the web server of the
 * LaxarJS application efficiently. Whenever a file should be requested from the server, the file resource
 * provider should be used in favor of manual http requests, due to two reasons: During development it reduces
 * the amount of `404` status replies for files that may or may not exist, and when making a release build,
 * file contents may optionally be embedded in the build bundle. This makes further http requests redundant,
 * which is especially relevant in high-latency networks, such as cellular networks.
 *
 * This module should not be used directly, but via the `axFileResourceProvider` service provided by LaxarJS.
 *
 * @module file_resource_provider
 */
import assert from '../utilities/assert';
import * as path from '../utilities/path';
import { forEach } from '../utilities/object';

const BORDER_SLASHES_MATCHER = /^\/|\/$/g;
const ENTRY_TYPE_FILE = 1;

///////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * A provider for file resources that tries to minimize the amount of 404 errors when requesting files that
 * are not available. To achieve this it is backed by one or more directory tree mappings that already list
 * which files are available on the server. For any file being located at a path that is not supported by a
 * mapping, a HEAD request takes place, that might or might not result in a 404 error. If a file is
 * located at a path supported by a mapping, but is not found in that mapping (because it was added later),
 * it is assumed to be nonexistent.
 *
 * @param {Object} browser
 *    a browser abstraction
 * @param {String} rootPath
 *    the path to the root of the application. It is needed to prefix relative paths found in a listing
 *    with an absolute prefix
 *
 * @constructor
 * @private
 */
function FileResourceProvider( configuration, browser, rootPath ) {
   this.browser = browser;
   this.rootPath = path.normalize( rootPath );
   this.useEmbedded = configuration.get( 'useEmbeddedFileListings', false );
   this.fileListings = {};
   this.fileListingUris = {};

   this.httpGets = {};
   this.httpHeads = {};
   this.httpHeadCache = {};

   forEach( configuration.get( 'fileListings', {} ), ( value, key ) => {
      if( typeof value === 'string' ) {
         this.setFileListingUri( key, value );
      }
      else {
         this.setFileListingContents( key, value );
      }
   } );
}

///////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * If available, resolves the returned promise with the requested file's contents. Otherwise the promise is
 * rejected. It uses the file mapping prior to fetching the contents to prevent from 404 errors. In the
 * optimal case the contents are already embedded in the listing and simply need to be returned. If no
 * listing for the path is available, a request simply takes place and either succeeds or fails.
 *
 * @param {String} url
 *    the uri to the resource to provide
 *
 * @return {Promise}
 *    resolved with the file's content or rejected when the file could not be fetched
 */
FileResourceProvider.prototype.provide = function( url ) {
   const self = this;
   return entry( this, url )
      .then( knownEntry => {
         if( typeof knownEntry === 'string' ) {
            return Promise.resolve( knownEntry );
         }
         return knownEntry !== false ? httpGet( self, url ) : Promise.reject();
      }, () => httpGet( self, url ) )
      .then( resourceTransform( url ) );
};

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
FileResourceProvider.prototype.isAvailable = function isAvailable( url ) {
   const self = this;
   return entry( self, url )
      .then(
         knownEntry => Promise.resolve( knownEntry !== false ),
         () => httpHead( self, url ).then( knownAvailable => Promise.resolve( knownAvailable ) )
      );
};

///////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Sets the uri to a file listing file for a given path.
 *
 * @param {String} directory
 *    the directory the file listing is valid for
 * @param {String} listingUri
 *    the uri to the listing file
 */
FileResourceProvider.prototype.setFileListingUri = function( directory, listingUri ) {
   const filePathPrefix = path.join( this.rootPath, directory );
   this.fileListingUris[ filePathPrefix ] = path.join( this.rootPath, listingUri );
   this.fileListings[ filePathPrefix ] = null;
   fetchListingForPath( this, filePathPrefix );
};

///////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Sets the contents of a file listing file to the given object. This a useful alternative to
 * {@link FileResourceProvider#setFileListingUri}, to avoid an additional round-trip during production.
 *
 * @param {String} directory
 *    the directory the file listing is valid for
 * @param {String} listing
 *    the actual file listing
 */
FileResourceProvider.prototype.setFileListingContents = function( directory, listing ) {
   const filePathPrefix = path.join( this.rootPath, directory );
   this.fileListingUris[ filePathPrefix ] = '#';
   this.fileListings[ filePathPrefix ] = listing;
};

///////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Try to lookup a file resource in the provider's listings.
 *
 * @return {Promise}
 *    Resolves to `true` (listed but not embedded), to `false` (file is not listed), or to a string
 *    (embedded content for a listed file).
 *
 * @private
 */
function entry( self, resourcePath ) {
   const usablePrefixes = Object.keys( self.fileListingUris ).filter( function( prefix ) {
      return resourcePath.indexOf( prefix ) === 0;
   } );

   if( usablePrefixes.length ) {
      const prefix = usablePrefixes[ 0 ];
      return fetchListingForPath( self, prefix ).then( function( listing ) {
         return Promise.resolve( lookup( self, resourcePath, listing ) );
      } );
   }

   return Promise.reject();

   ////////////////////////////////////////////////////////////////////////////////////////////////////////

   function lookup( self, file, listing ) {
      const parts = file.replace( self.rootPath, '' ).replace( BORDER_SLASHES_MATCHER, '' ).split( '/' );
      let subListing = listing;
      for( let i = 0, len = parts.length; i < len; ++i ) {
         if( i === len - 1 ) {
            const value = subListing[ parts[ i ] ];
            if( self.useEmbedded ) {
               return typeof value === 'string' ? value : (value === ENTRY_TYPE_FILE);
            }
            return typeof value === 'string' || (value === ENTRY_TYPE_FILE);
         }

         subListing = subListing[ parts[ i ] ];
         if( typeof subListing !== 'object' ) {
            return false;
         }
      }
      return false;
   }
}

///////////////////////////////////////////////////////////////////////////////////////////////////////////

function resourceTransform( path ) {
   return /\.json$/.test( path ) ? contents => JSON.parse( contents ) : contents => contents;
}

///////////////////////////////////////////////////////////////////////////////////////////////////////////

function fetchListingForPath( self, path ) {
   if( self.fileListings[ path ] ) {
      return Promise.resolve( self.fileListings[ path ] );
   }

   const listingUri = self.fileListingUris[ path ];
   return httpGet( self, listingUri )
      .then( resourceTransform( listingUri ) )
      .then( listing => {
         self.fileListings[ path ] = listing;
         return listing;
      } );
}

///////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * @param {FileResourceProvider} self
 * @param {String} url A url to get
 *
 * @return {Promise<String>} Resolved to the file contents if the request succeeds
 *
 * @private
 */
function httpGet( self, url ) {
   if( url in self.httpGets ) {
      return self.httpGets[ url ];
   }

   const promise = self.httpGets[ url ] = self.browser
      .fetch( url )
      .then( response => response.text() );

   // Free memory when the response is complete:
   promise.then( () => {
      delete self.httpGets[ url ];
   } );

   return promise;
}

///////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * @param {FileResourceProvider} self
 * @param {String} url A url to check using a HEAD request
 *
 * @return {Promise<Boolean>} Resolved to `true` if a HEAD-request to the url succeeds, else to `false`.
 *
 * @private
 */
function httpHead( self, url ) {
   if( url in self.httpHeadCache ) {
      return Promise.resolve( self.httpHeadCache[ url ] );
   }
   if( url in self.httpHeads ) {
      return self.httpHeads[ url ];
   }

   const promise = self.httpHeads[ url ] = self.browser.fetch( url, { method: 'HEAD' } )
      .then( () => true, () => false );

   // Free memory and cache result when the response is complete:
   promise.then( result => {
      self.httpHeadCache[ url ] = result;
      delete self.httpHeads[ url ];
   } );

   return promise;
}

///////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Creates and returns a new instance.
 *
 * @param {Object} configuration
 *    a laxarjs application configuration
 * @param {Object} browser
 *    a browser abstraction
 * @param {String} rootPath
 *    the path to the root of the application. It is needed to prefix relative paths found in a listing
 *    with an absolute prefix
 *
 * @return {FileResourceProvider}
 *    a new instance
 */
export function create( configuration, browser, rootPath ) {
   assert( browser )
      .hasProperty( 'fetch' )
      .isNotNull( 'Need a browser abstraction library providing fetch()' );

   return new FileResourceProvider( configuration, browser, rootPath );
}
