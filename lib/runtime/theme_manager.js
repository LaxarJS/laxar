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
 * @param {CssLoader} cssLoader
 *    to load the theme CSS itself (if needed)
 * @param {String} theme
 *    the theme to use
 *
 * @constructor
 */
function ThemeManager( fileResourceProvider, cssLoader, theme ) {
   this.fileResourceProvider_ = fileResourceProvider;
   this.cssLoader_ = cssLoader;
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

ThemeManager.prototype.loadThemeCss = function( paths ) {
   const themePath = this.theme_ === 'default' ?
      paths.DEFAULT_THEME :
      path.join( paths.THEMES, '[theme]' );

   return this.urlProvider( themePath, null )( 'css/theme.css' )
      .then( _ => this.cssLoader_.load( _ ) );
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
 *
 * @return {Function}
 *    an `provide` function to look up individual themed assets by their artifact-relative name
 */
ThemeManager.prototype.urlProvider = function( artifactPathPattern, themePathPattern ) {
   const searchPrefixes = [];
   const themeDirectory = `${this.theme_}.theme`;
   const frp = this.fileResourceProvider_;

   if( this.theme_ && this.theme_ !== 'default' ) {
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

   return fileName => findExistingPath( frp, searchPrefixes, fileName );
};

///////////////////////////////////////////////////////////////////////////////////////////////////////////

function findExistingPath( frp, searchPrefixes, fileName ) {
   if( searchPrefixes.length === 0 ) {
      return Promise.resolve( null );
   }

   const resultPath = path.join( searchPrefixes[ 0 ], fileName );
   return frp.isAvailable( resultPath )
      .then( available =>
         available ? resultPath : findExistingPath( frp, searchPrefixes.slice( 1 ), fileName )
      );
}

///////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Creates and returns a new theme manager instance.
 *
 * @param {FileResourceProvider} fileResourceProvider
 *    the file resource provider used for theme file lookup
 * @param {CssLoader} cssLoader
 *    to load the theme CSS itself (if needed)
 * @param {String} theme
 *    the theme to use
 *
 * @return {ThemeManager}
 *    a theme manager instance
 */
export function create( fileResourceProvider, cssLoader, theme ) {
   return new ThemeManager( fileResourceProvider, cssLoader, theme );
}
