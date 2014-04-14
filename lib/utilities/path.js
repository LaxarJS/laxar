/**
 * Copyright 2014 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
define( [
   './assert'
], function( assert ) {
   'use strict';

   var PATH_SEPARATOR = '/';
   var PARENT = '..';
   var ABSOLUTE = /^([a-z0-9]+:\/\/[^\/]+\/|\/)(.*)$/;

   function join( /* firstFragment, secondFragment, ... */ ) {
      var fragments = Array.prototype.slice.call( arguments, 0 );
      if( fragments.length === 0 ) {
         return '';
      }

      var prefix = '';

      fragments = fragments.reduce( function( fragments, fragment ) {
         assert( fragment ).hasType( String ).isNotNull();

         var matchAbsolute = ABSOLUTE.exec( fragment );

         if( matchAbsolute ) {
            prefix = matchAbsolute[1];
            fragment = matchAbsolute[2];
            return fragment.split( PATH_SEPARATOR );
         }

         return fragments.concat( fragment.split( PATH_SEPARATOR ) );
      }, [] );

      var pathStack = normalizeFragments( fragments );

      return prefix + pathStack.join( PATH_SEPARATOR );
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function normalize( path ) {
      var prefix = '';
      var matchAbsolute = ABSOLUTE.exec( path );

      if( matchAbsolute ) {
         prefix = matchAbsolute[1];
         path = matchAbsolute[2];
      }

      var pathStack = normalizeFragments( path.split( PATH_SEPARATOR ) );

      return prefix + pathStack.join( PATH_SEPARATOR );
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

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   return {

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
      join: join,

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

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
      normalize: normalize

   };

} );
