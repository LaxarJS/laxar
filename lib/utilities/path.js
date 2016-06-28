/**
 * Copyright 2016 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
import assert from './assert';

const PATH_SEPARATOR = '/';
const PARENT = '..';
const ABSOLUTE = /^([a-z0-9]+:\/\/[^\/]+\/|\/)(.*)$/;

///////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Joins multiple path fragments into one normalized path. Absolute paths (paths starting with a `/`)
 * and URLs will "override" any preceding paths. I.e. joining a URL or an absolute path to _anything_
 * will give the URL or absolute path.
 *
 * @param {...String} fragments
 *    the path fragments to join
 *
 * @return {String}
 *    the joined path
 */
export function join( ...fragments ) {
   if( fragments.length === 0 ) {
      return '';
   }

   let prefix = '';

   fragments = fragments.reduce( function( fragments, fragment ) {
      assert( fragment ).hasType( String ).isNotNull();

      const matchAbsolute = ABSOLUTE.exec( fragment );

      if( matchAbsolute ) {
         prefix = matchAbsolute[1];
         fragment = matchAbsolute[2];
         return fragment.split( PATH_SEPARATOR );
      }

      return fragments.concat( fragment.split( PATH_SEPARATOR ) );
   }, [] );

   const pathStack = normalizeFragments( fragments );

   return prefix + pathStack.join( PATH_SEPARATOR );
}

///////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Normalizes a path. Removes multiple consecutive slashes, strips trailing slashes, removes `.`
 * references and resolves `..` references (unless there are no preceding directories).
 *
 * @param {String} path
 *    the path to normalize
 *
 * @return {String}
 *    the normalized path
 */
export function normalize( path ) {
   let prefix = '';
   const matchAbsolute = ABSOLUTE.exec( path );

   if( matchAbsolute ) {
      prefix = matchAbsolute[1];
      path = matchAbsolute[2];
   }

   const pathStack = normalizeFragments( path.split( PATH_SEPARATOR ) );

   return prefix + pathStack.join( PATH_SEPARATOR );
}

///////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Compute a relative path. Takes two absolute paths and returns a normalized path, relative to
 * the first path.
 * Note that if both paths are URLs they are threated as if they were on the same host. I.e. this function
 * does not complain when called with `http://localhost/path` and `http://example.com/another/path`.
 *
 * @param {String} from
 *    the starting point from which to determine the relative path
 *
 * @param {String} path
 *    the target path
 *
 * @return {String}
 *    the relative path from `from` to `to`
 */
export function relative( from, path ) {
   const matchAbsoluteFrom = ABSOLUTE.exec( from );
   const matchAbsolutePath = ABSOLUTE.exec( path );

   assert( matchAbsoluteFrom ).isNotNull();
   assert( matchAbsolutePath ).isNotNull();

   const fromStack = normalizeFragments( matchAbsoluteFrom[2].split( PATH_SEPARATOR ) );
   const pathStack = normalizeFragments( matchAbsolutePath[2].split( PATH_SEPARATOR ) );

   return fromStack.reduce( function( path, fragment ) {
      if( path[0] === fragment ) {
         path.shift();
      } else {
         path.unshift( '..' );
      }
      return path;
   }, pathStack ).join( PATH_SEPARATOR ) || '.';
}

///////////////////////////////////////////////////////////////////////////////////////////////////////////

export function resolveAssetPath( refWithScheme, defaultAssetDirectory, optionalDefaultScheme ) {
   const info = extractScheme( refWithScheme, optionalDefaultScheme || 'amd' );
   if( typeof schemeLoaders[ info.scheme ] !== 'function' ) {
      throw new Error( 'Unknown schema type "' + info.scheme + '" in reference "' + refWithScheme + '".' );
   }
   return normalize( schemeLoaders[ info.scheme ]( info.ref, defaultAssetDirectory ) );
}

const schemeLoaders = {
   local: function( ref, defaultAssetDirectory ) {
      return join( defaultAssetDirectory, ref );
   },
   amd: function( ref ) {
      // TODO (#304): amd references should already be resolved by the grunt task
      // this is a hack for basic AMD loading "support" without e.g. paths/aliases:
      return join( 'bower_components/', ref.replace( /\.js$/, '' ) );
   }
};

///////////////////////////////////////////////////////////////////////////////////////////////////////////

export function extractScheme( ref, defaultScheme ) {
   const parts = ref.split( ':' );
   return {
      scheme: parts.length === 2 ? parts[ 0 ] : defaultScheme,
      ref: parts.length === 2 ? parts[ 1 ]: parts[ 0 ]
   };
}

///////////////////////////////////////////////////////////////////////////////////////////////////////////

function normalizeFragments( fragments ) {
   return fragments.reduce( function( pathStack, fragment ) {
      fragment = fragment.replace( /^\/+|\/+$/g, '' );

      if( fragment === '' || fragment === '.' ) {
         return pathStack;
      }

      if( pathStack.length === 0 ) {
         return [ fragment ];
      }

      if( fragment === PARENT && pathStack.length > 0 && pathStack[ pathStack.length - 1 ] !== PARENT ) {
         pathStack.pop();
         return pathStack;
      }
      pathStack.push( fragment );

      return pathStack;
   }, [] );
}
