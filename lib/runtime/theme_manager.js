/**
 * Copyright 2014 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
/**
 * The theme manager simplifies lookup of theme specific assets. It should be used via AngularJS DI as
 * *axThemeManager* service.
 *
 * @module theme_manager
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
    * Returns a URL provider for specific path patterns that are used to lookup themed artifacts. The token
    * `[theme]` will be replaced by the name of the currently active theme (plus `.theme` suffix) or by
    * `default.theme` as a fallback. The `provide` method of the returned object can be called with a list of
    * files for which a themed version should be found. The most specific location is searched first and the
    * default theme last.
    *
    * @param {String} artifactPathPattern
    *    a path pattern for search within the artifact directory itself, based on the current theme
    * @param {String} [themePathPattern]
    *    a path pattern for search within the current theme
    * @param {String} [fallbackPathPattern]
    *    a fallback path, used if all else fails.
    *    Usually without placeholders, e.g. for loading the default theme itself.
    *
    * @returns {{provide: Function}}
    *    an object with a provide method
    */
   ThemeManager.prototype.urlProvider = function( artifactPathPattern, themePathPattern, fallbackPathPattern ) {
      var self = this;

      return {
         provide: function( fileNames ) {
            var searchPrefixes = [];

            if( self.theme_ && self.theme_ !== 'default' ) {
               var themeDirectory = self.theme_ + '.theme';
               if( artifactPathPattern ) {
                  // highest precedence: artifacts with (multiple) embedded theme styles:
                  searchPrefixes.push( artifactPathPattern.replace( '[theme]', themeDirectory ) );
               }
               if( themePathPattern ) {
                  // second-highest precedence: themes with embedded artifact styles:
                  searchPrefixes.push( themePathPattern.replace( '[theme]', themeDirectory ) );
               }
            }

            if( artifactPathPattern ) {
               // fall back to default theme provided by the artifact
               searchPrefixes.push( artifactPathPattern.replace( '[theme]', 'default.theme' ) );
            }

            if( fallbackPathPattern ) {
               // mostly to load the default-theme itself from any location
               searchPrefixes.push( fallbackPathPattern );
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

   function findExistingPath( self, searchPrefixes, fileName ) {
      if( searchPrefixes.length === 0 ) {
         return self.q_.when( null );
      }

      return self.fileResourceProvider_.isAvailable( path.join( searchPrefixes[0], fileName ) )
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
