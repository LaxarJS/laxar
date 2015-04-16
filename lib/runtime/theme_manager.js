/**
 * Copyright 2014 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
define( [
   '../utilities/assert',
   '../utilities/path',
   '../utilities/storage'
], function( assert, path, storage ) {
   'use strict';

   /**
    * @param {FileResourceProvider} fileResourceProvider
    *    the file resource provider used for theme file lookups
    * @param {$q} q
    *    a `$q` like promise library
    * @param {String} fallbackTheme
    *    the theme to use if none can be found in the session storage
    *
    * @constructor
    */
   function ThemeManager( fileResourceProvider, q, fallbackTheme ) {
      this.q_ = q;
      this.fileResourceProvider_ = fileResourceProvider;
      this.store_ = storage.getSessionStorage( 'themeManager' );

      var theme = this.store_.getItem( 'theme' );
      this.theme_ = ( theme && theme.length ) ? theme : ( fallbackTheme || 'default' );
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   /**
    * Sets a new theme and stores it in the browser's session storage. This method should only ever be called
    * by the runtime. The correct way to change the theme for the application is via the `changeThemeRequest`
    * event.
    *
    * @param {String} theme
    *    the theme to set
    *
    * @private
    */
   ThemeManager.prototype.setTheme = function( theme ) {
      assert( theme ).hasType( String ).isNotNull();

      this.theme_ = theme;
      this.store_.setItem( 'theme', theme );
   };

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
    * @param {String} artifactThemePathPattern
    *    a path pattern for search within the artifact directory itself
    *
    * @returns {{provide: Function}}
    *    an object with a provide method
    */
   ThemeManager.prototype.urlProvider = function( themePathPattern, artifactThemePathPattern ) {
      var self = this;

      return {
         provide: function( fileNames ) {
            var promises = [];
            var themeUrls = [ artifactThemePathPattern.replace( '[theme]', 'default.theme' ) ];
            if( self.theme_ && self.theme_ !== 'default' ) {
               var themeDirectory = self.theme_ + '.theme';
               // support for widgets and layouts with multiple embedded themes
               themeUrls.unshift( artifactThemePathPattern.replace( '[theme]', themeDirectory ) );
               themeUrls.unshift( themePathPattern.replace( '[theme]', themeDirectory ) );
            }

            for( var i = 0; i < fileNames.length; ++i ) {
               promises.push( findExistingPath( self, themeUrls, fileNames[ i ] ) );
            }

            return self.q_.all( promises )
               .then( function( results ) {
                  return results.map(  function( result, i ) {
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

   function findExistingPath( self, urlPrefixes, fileName ) {
      if( urlPrefixes.length === 0 ) {
         return self.q_.when( null );
      }

      return self.fileResourceProvider_.isAvailable( path.join( urlPrefixes[0], fileName ) )
         .then( function( available ) {
            if( available ) {
               return self.q_.when( urlPrefixes[0] );
            }

            return findExistingPath( self, urlPrefixes.slice( 1 ), fileName )
               .then( function( url ) {
                  return url;
               } );
         } );
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   return {

      /**
       * Creates and returns a new theme manager instance.
       *
       * @param {FileResourceProvider} fileResourceProvider
       *    the file resource provider used for theme file lookups
       * @param {$q} q
       *    a `$q` like promise library
       * @param {String} fallbackTheme
       *    the theme to use if none can be found in the session storage
       *
       * @returns {ThemeManager}
       */
      create: function( fileResourceProvider, q, fallbackTheme ) {
         return new ThemeManager( fileResourceProvider, q, fallbackTheme );
      }

   };

} );
