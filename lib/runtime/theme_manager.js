/**
 * Copyright 2016 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
/**
 * The theme manager simplifies lookup of theme specific assets.
 *
 * @module theme_manager
 */
import * as path from '../utilities/path';

/**
 * @param {FileResourceProvider} fileResourceProvider
 *    the file resource provider used for theme file lookups
 * @param {String} theme
 *    the theme to use
 *
 * @constructor
 */
function ThemeManager( fileResourceProvider, theme ) {
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


//////////////////////////////////////////////////////////////////////////////////////////////////////////////

ThemeManager.prototype.loadThemeCss = function( cssLoader, paths ) {
   return this
      .urlProvider( path.join( paths.THEMES, '[theme]' ), null, [ paths.DEFAULT_THEME ] )
      .provide( [ 'css/theme.css' ] )
      .then( ( [ cssFile ] ) => cssLoader.load( cssFile ) );
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
 * @param {String[]} [fallbackPathPatterns]
 *    fallback paths, used if all else fails.
 *    Possibly without placeholders, e.g. for loading the default theme itself.
 *
 * @return {Object}
 *    an object with a `provide` method
 */
ThemeManager.prototype.urlProvider = function( artifactPathPattern, themePathPattern, fallbackPathPatterns ) {
   const self = this;

   return {
      provide( fileNames ) {
         const searchPrefixes = [];

         const themeDirectory = `${self.theme_}.theme`;
         if( self.theme_ && self.theme_ !== 'default' ) {
            if( artifactPathPattern ) {
               // highest precedence: artifacts with (multiple) embedded theme styles:
               searchPrefixes.push( artifactPathPattern.replace( '[theme]', themeDirectory ) );
            }
            if( themePathPattern ) {
               // second-highest precedence: themes with embedded artifact styles:
               searchPrefixes.push( themePathPattern.replace( '[theme]', themeDirectory ) );
            }
         }

         ( fallbackPathPatterns || [] ).forEach( pattern => {
            // additional paths, usually for backward compatibility
            if( self.theme_ !== 'default' || pattern.indexOf( '[theme]' ) === -1 ) {
               searchPrefixes.push( pattern.replace( '[theme]', themeDirectory ) );
            }
         } );

         if( artifactPathPattern ) {
            // fall back to default theme provided by the artifact
            searchPrefixes.push( artifactPathPattern.replace( '[theme]', 'default.theme' ) );
         }

         const promises = fileNames.map( fileName => findExistingPath( self, searchPrefixes, fileName ) );
         return Promise.all( promises )
            .then( results => {
               return results.map( ( result, i ) => {
                  return result !== null ? path.join( result, fileNames[ i ] ) : null;
               } );
            } );
      }
   };
};

///////////////////////////////////////////////////////////////////////////////////////////////////////////

function findExistingPath( self, searchPrefixes, fileName ) {
   if( searchPrefixes.length === 0 ) {
      return Promise.resolve( null );
   }

   return self.fileResourceProvider_.isAvailable( path.join( searchPrefixes[ 0 ], fileName ) )
      .then( available =>
         available ? searchPrefixes[ 0 ] : findExistingPath( self, searchPrefixes.slice( 1 ), fileName )
      );
}

///////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Creates and returns a new theme manager instance.
 *
 * @param {FileResourceProvider} fileResourceProvider
 *    the file resource provider used for theme file lookup
 * @param {String} theme
 *    the theme to use
 *
 * @return {ThemeManager}
 *    a theme manager instance
 */
export function create( fileResourceProvider, theme ) {
   return new ThemeManager( fileResourceProvider, theme );
}
