/**
 * Copyright 2016 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
define( [
   '../utilities/path'
], function( path ) {
   'use strict';

   function create( layoutsRoot, themesRoot, cssLoader, themeManager, fileResourceProvider, cache ) {
      return {
         load: function( layout ) {
            return resolveLayout( layout ).then(
               function( layoutInfo ) {
                  if( layoutInfo.css ) {
                     cssLoader.load( layoutInfo.css );
                  }
                  if( layoutInfo.html ) {
                     return fileResourceProvider.provide( layoutInfo.html ).then( function( htmlContent ) {
                        layoutInfo.htmlContent = htmlContent;
                        if( cache ) {
                           cache.put( layoutInfo.html, htmlContent );
                        }
                        return layoutInfo;
                     } );
                  }
                  return layoutInfo;
               }
            );
         }
      };

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      function resolveLayout( layout ) {
         var layoutPath = path.join( layoutsRoot, layout );
         var layoutName = layoutPath.substr( layoutPath.lastIndexOf( '/' ) + 1 );
         var layoutFile = layoutName + '.html';
         var cssFile    = 'css/' + layoutName + '.css';

         return themeManager.urlProvider(
            path.join( layoutPath, '[theme]' ),
            path.join( themesRoot, '[theme]', 'layouts', layout )
         ).provide( [ layoutFile, cssFile ] ).then(
            function( results ) {
               return {
                  html: results[ 0 ],
                  css: results[ 1 ],
                  className: layoutName.replace( /\//g, '' ).replace( /_/g, '-' ) + '-layout'
               };
            }
         );
      }
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   return {

      create: create

   };

} );
