/**
 * Copyright 2014 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
define( [
   '../utilities/assert',
   '../utilities/string',
   '../utilities/path'
], function( assert, string, path ) {
   'use strict';

   var q_;
   var httpClient_;
   var BORDER_SLASHES_MATCHER = /^\/|\/$/g;

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   /**
    * A provider for file resources that tries to minimize the amount of 404 errors when requesting files that
    * are not available. To achieve this it is backed by one or more directory tree mappings that already list
    * which files are available on the server. For any file being located at a path that is not supported by a
    * mapping, a HEAD request takes place, that might or might not result in a 404 error. If a file is
    * located at a path supported by a mapping, but is not found in that mapping (because it was added later),
    * it is assumed to be nonexistent.
    *
    * @param {String} rootPath
    *    the path to the root of the application. It is needed to prefix relative paths found in the listing
    *    with an absolute prefix
    * @constructor
    */
   function FileResourceProvider( rootPath ) {
      this.rootPath_ = path.normalize( rootPath );
      this.fileListings_ = {};
      this.fileListingUris_ = {};

      this.httpGets_ = {};
      this.httpHeads_ = {};
      this.httpHeadCache_ = {};
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   /**
    * If available, resolves the returned promise with the file's contents. Otherwise the promise is rejected.
    * It uses the file mapping prior to fetching the contents to prevent from 404 errors. If no listing for
    * the path is available, the request simply takes place and either succeeds or fails.
    *
    * @param {String} resourceUri
    *    the uri to the resource to provide
    * @return {Promise}
    *    resolved with the file's content or rejected when the file could not be fetched
    */
   FileResourceProvider.prototype.provide = function( url ) {
      var self = this;
      return entry( this, url ).then( function( knownEntry ) {
         if( typeof( knownEntry ) === 'string' ) {
            return q_.when( knownEntry ).then( resourceTransform( url ) );
         }
         return knownEntry !== false ? httpGet( self, url ).then( resourceTransform( url ) ) : q_.reject();
      }, function() {
         return httpGet( self, url ).then( resourceTransform( url ) );
      } );
   };

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   /**
    * Resolves the returned promise with `true` as argument, if the requested resource is available and
    * `false` otherwise.  If no listing for the path is available, a HEAD request takes place and either
    * succeeds or fails.
    *
    * @param {String} resourceUri
    *    the uri to check for availability
    * @return {Promise}
    *    a promise that is always resolved with a boolean value
    */
   FileResourceProvider.prototype.isAvailable = function isAvailable( url ) {
      var self = this;
      return entry( self, url ).then( function( knownEntry ) {
         return q_.when( knownEntry !== false );
      }, function() {
         return httpHead( self, url ).then( function( knownAvailable ) {
            return q_.when( knownAvailable );
         } );
     } );
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
      var filePathPrefix = path.join( this.rootPath_, directory );
      this.fileListingUris_[ filePathPrefix ] = path.join( this.rootPath_, listingUri );
      this.fileListings_[ filePathPrefix ] = null;
      fetchListingForPath( this, filePathPrefix );
   };

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   /**
    * Try to lookup a file resource in the provider's listings.
    * @private
    *
    * @returns {Promise<*>}
    *    Resolves to `true` (listed but not embedded), to `false` (file is not listed), or to a string
    *    (embedded content for a listed file).
    */
   function entry( provider, resourcePath ) {
      var usablePrefixes = Object.keys( provider.fileListingUris_ ).filter( function( prefix ) {
         return resourcePath.indexOf( prefix ) === 0;
      } );

      if( usablePrefixes.length ) {
         var prefix = usablePrefixes[ 0 ];
         return fetchListingForPath( provider, prefix ).then( function( listing ) {
            return q_.when( lookup( provider, resourcePath, listing ) );
         } );
      }

      return q_.reject();

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      function lookup( self, file, listing ) {
         var parts = file.replace( self.rootPath_, '' ).replace( BORDER_SLASHES_MATCHER, '' ).split( '/' );
         for( var i = 0, len = parts.length; i < len; ++i ) {
            if( i === len - 1 ) {
               var value = listing[ parts[ i ] ];
               return typeof( value ) === 'string' ? value : (value === 1);
            }

            listing = listing[ parts[ i ] ];
            if( typeof listing !== 'object' ) {
               return false;
            }
         }
      }
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function resourceTransform( path ) {
      return string.endsWith( path, '.json' ) ?
         function( contents ) { return JSON.parse( contents ); } :
         function( contents ) { return contents; };
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function fetchListingForPath( self, path ) {
      if( self.fileListings_[ path ] ) {
         return q_.when( self.fileListings_[ path ] );
      }

      var listingUri = self.fileListingUris_[ path ];
      return httpGet( self, listingUri )
         .then( resourceTransform( listingUri ) )
         .then( function( listing ) {
            self.fileListings_[ path ] = listing;
            return listing;
         } );
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   /**
    * @private
    * @param {FileResourceProvider} self
    * @param {String} url A url to get
    * @return {Promise<String>} Resolved to the file contents if the request succeeds
    */
   function httpGet( self, url ) {
      if( url in self.httpGets_ ) {
         return self.httpGets_[ url ];
      }

      var promise = self.httpGets_[ url ] = httpClient_
         .get( url, { transformResponse: [] } )
         .then( function( response ) {
            return q_.when( response.data );
         } );

      // Free memory when the response is complete:
      promise.then( function() {
         delete self.httpGets_[ url ];
      } );

      return promise;
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   /**
    * @private
    * @param {FileResourceProvider} self
    * @param {String} url A url to check using a HEAD request
    * @return {Promise<Boolean>} Resolved to `true` if a HEAD-request to the url succeeds, else to `false`.
    */
   function httpHead( self, url ) {
      if( url in self.httpHeadCache_ ) {
         return q_.when( self.httpHeadCache_[ url ] );
      }
      if( url in self.httpHeads_ ) {
         return self.httpHeads_[ url ];
      }

      var promise = self.httpHeads_[ url ] = httpClient_.head( url )
         .then( function() {
            return true;
         }, function() {
            return false;
         } );

      // Free memory and cache result when the response is complete:
      promise.then( function( result ) {
         self.httpHeadCache_[ url ] = result;
         delete self.httpHeads_[ url ];
      } );

      return promise;
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   return {
      
      /**
       * Creates and returns a new instance.
       *
       * @param {String} rootPath
       *    the path to the root of the application. It is needed to prefix relative paths found in the
       *    listing with an absolute prefix
       * @return {FileResourceProvider}
       */
      create: function( rootPath ) {
         assert( q_ ).isNotNull( 'Need a promise implementation like $q or Q' );
         assert( httpClient_ ).isNotNull( 'Need a http client implementation like $http' );

         return new FileResourceProvider( rootPath );
      },

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      /**
       * Initializes the module.
       *
       * @param {Object} q
       *    a promise library like AngularJS' $q
       * @param {Object} httpClient
       *    a http client whose api is like AngularJS' $http service
       */
      init: function( q, httpClient ) {
         q_ = q;
         httpClient_ = httpClient;
      }

   };

} );