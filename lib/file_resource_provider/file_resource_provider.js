/**
 * Copyright 2014 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
define( [
   '../utilities/assert',
   '../utilities/path'
], function( assert, path ) {
   'use strict';

   var q_;
   var httpClient_;

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   /**
    * A provider for file resources that tries to minimize the amount of 404 errors when requesting files that
    * are not available. To achieve this it is backed by one or more directory tree mappings that already list
    * which files are available on the server. For any file being located at a path that is not supported by a
    * mapping, a HEAD request takes place, that might or might not result in a 404 error. If a file is
    * located at a path supported by a mapping, but is not found in that mapping (because it was added later),
    * it is assumed to be nonexistent.
    *
    * @param {String} rootPath the path to the root of the application. It is needed to prefix relative
    *    paths found in the listing with an absolute prefix.
    * @constructor
    */
   function FileResourceProvider( rootPath ) {
      this.rootPath_ = path.normalize( rootPath );
      this.fileListings_ = {};
      this.fileListingUris_ = {};
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   /**
    * If available, resolves the returned promise with the file's contents. Otherwise the promise is rejected.
    * It uses the file mapping prior to fetching the contents to prevent from 404 errors. If no listing for
    * the path is available, the request simply takes place and either succeeds or fails.
    *
    * @param {String} resourceUri the uri to the resource to provide
    * @return {Promise} resolved with the file's content or rejected when the file could not be fetched
    */
   FileResourceProvider.prototype.provide = function( resourceUri ) {
      function fetchFile() {
         return httpClient_.get( resourceUri )
            .then( function( response ) {
               return response.data;
            } );
      }

      return isListed( this, resourceUri )
         .then( function( listed ) {
            return listed ? fetchFile() : q_.reject();
         }, fetchFile );
   };

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   /**
    * Resolves the returned promise with `true` as argument, if the requested resource is available and
    * `false` otherwise.  If no listing for the path is available, a HEAD request takes place and either
    * succeeds or fails.
    *
    * @param {String} resourceUri the uri to check for availability
    * @return {Promise} a promise that is always resolved with a boolean value
    */
   FileResourceProvider.prototype.isAvailable = function( resourceUri ) {
      return isListed( this, resourceUri )
         .then( function( listed ) {
            return listed;
         }, function() {
            return httpClient_.head( resourceUri )
               .then( function() {
                  return true;
               }, function() {
                  return false;
               } );
         } );
   };

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   /**
    * Sets the uri to a file listing file for a given path.
    *
    * @param {String} directory the directory the file listing is valid for
    * @param {String} listingUri the uri to the listing file
    */
   FileResourceProvider.prototype.setFileListingUri = function( directory, listingUri ) {
      var filePathPrefix = path.join( this.rootPath_, directory );
      this.fileListingUris_[ filePathPrefix ] = path.join( this.rootPath_, listingUri );
      this.fileListings_[ filePathPrefix ] = null;
   };

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function isListed( self, resourcePath ) {
      for( var prefix in self.fileListingUris_ ) {
         /*jshint loopfunc:true*/
         if( resourcePath.indexOf( prefix ) === 0 ) {
            return fetchListingForPath( self, prefix )
               .then( function( listing ) {
                  return findFileInListing( self, resourcePath, listing );
               }, function() {
                  return false;
               } );
         }
      }

      return q_.reject();
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function fetchListingForPath( self, path ) {
      if( self.fileListings_[ path ] ) {
         return q_.when( self.fileListings_[ path ] );
      }

      return httpClient_.get( self.fileListingUris_[ path ] )
         .then( function( response ) {
            self.fileListings_[ path ] = response.data;
            return response.data;
         } );
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function findFileInListing( self, file, listing ) {
      var parts = file.replace( self.rootPath_, '' ).split( '/' );
      for( var i = 0, len = parts.length; i < len; ++i ) {
         if( i === len - 1 ) {
            return listing[ parts[ i ] ] === 'file';
         }

         listing = listing[ parts[ i ] ];
         if( typeof listing !== 'object' ) {
            return false;
         }
      }
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   return {
      
      /**
       * Creates and returns a new instance.
       *
       * @param {String} rootPath the path to the root of the application. It is needed to prefix relative
       *    paths found in the listing with an absolute prefix.
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
       * @param {Object} q a promise library like AngularJS' $q
       * @param {Object} httpClient a http client whose api is like AngularJS' $http service
       */
      init: function( q, httpClient ) {
         q_ = q;
         httpClient_ = httpClient;
      }

   };

} );