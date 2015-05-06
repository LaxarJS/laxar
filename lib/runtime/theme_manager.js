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

   /**
    * @param {FileResourceProvider} fileResourceProvider
    *    the file resource provider used for theme file lookups
    * @param {$q} q
    *    a `$q` like promise library
    * @param {String} theme
    *    the theme to use
    *
    * @constructor
    */
   function ThemeManager( fileResourceProvider, q, theme ) {
      this.q_ = q;
      this.fileResourceProvider_ = fileResourceProvider;
      this.theme_ = theme;
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   /**
    * Returns the currently used theme.
    *
    * @return {String}
    *    the currently active theme
    */
   ThemeManager.prototype.getTheme = function() {
      return this.theme_;
   };

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   /**
    * Returns a url provider for specific path patterns that are used to lookup themed artifacts. The token
    * `[theme]` will be replaced by the currently active theme and a `.theme` suffix or `default.theme` as
    * fallback. The `provide` method of the returned object can be called with a list of files for which a
    * themed version should be found. The most specific theme is searched for first and the default theme
    * afterwards.
    *
    * @param {String} themePathPattern
    *    a path pattern for search within the theme
    * @param {String} artifactPathPattern
    *    a path pattern for search within the artifact directory itself
    *
    * @returns {{provide: Function}}
    *    an object with a provide method
    */
   ThemeManager.prototype.urlProvider = function( themePathPattern, artifactPathPattern ) {
      var self = this;

      return {
         provide: function( fileNames ) {
            var searchPrefixes = [ artifactPathPattern.replace( '[theme]', 'default.theme' ) ];
            if( self.theme_ && self.theme_ !== 'default' ) {
               var themeDirectory = self.theme_ + '.theme';
               searchPrefixes.unshift( themePathPattern.replace( '[theme]', themeDirectory ) );
               // support for widgets and layouts with multiple embedded themes
               searchPrefixes.unshift( artifactPathPattern.replace( '[theme]', themeDirectory ) );
            }

            var promises = [];
            for( var i = 0; i < fileNames.length; ++i ) {
               promises.push( findExistingPath( self, searchPrefixes, fileNames[ i ] ) );
            }

            return self.q_.all( promises )
               .then( function( results ) {
                  return results.map( function( result, i ) {
                     return result !== null ? path.join( result, fileNames[ i ] ) : null;
                  } );
               } );
         }
      };
   };

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   /**
    * Creates and directly uses a url provider via #urlProvider with the given `themePathPrefix` and searches
    * themed versions for the passed files. The token `[theme]` in the `themePathPrefix` will be replaced by
    * the currently active theme and a `.theme` suffix or `default.theme` as fallback.
    *
    * @param {String} themePathPrefix
    *    the path to search in
    * @param {String[]} fileNames
    *    the files find themed version for
    *
    * @returns {Promise}
    *    a promise for the themed files
    */
   ThemeManager.prototype.findFiles = function( themePathPrefix, fileNames ) {
      var commonPattern = path.join( themePathPrefix, '[theme]' );
      return this.urlProvider( commonPattern, commonPattern ).provide( fileNames );
   };

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function findExistingPath( self, searchPrefixes, fileName ) {
      if( searchPrefixes.length === 0 ) {
         return self.q_.when( null );
      }

      return self.fileResourceProvider_.isAvailable( path.join( searchPrefixes[0], fileName ) )
         .then( function( available ) {
            return available;
         } )
         .then( function( available ) {
            if( available ) {
               return self.q_.when( searchPrefixes[0] );
            }

            return findExistingPath( self, searchPrefixes.slice( 1 ), fileName );
         } );
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   return {

      /**
       * Creates and returns a new theme manager instance.
       *
       * @param {FileResourceProvider} fileResourceProvider
       *    the file resource provider used for theme file lookup
       * @param {$q} q
       *    a `$q` like promise library
       * @param {String} theme
       *    the theme to use
       *
       * @returns {ThemeManager}
       */
      create: function( fileResourceProvider, q, theme ) {
         return new ThemeManager( fileResourceProvider, q, theme );
      }

   };

} );
