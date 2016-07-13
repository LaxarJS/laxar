/**
 * Copyright 2016 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
import * as path from '../utilities/path';

export function create( layoutsRoot, themesRoot, cssLoader, themeManager, fileResourceProvider, cache ) {
   return {
      load( layout ) {
         return resolveLayout( layout )
            .then( layoutInfo => {
               if( layoutInfo.css ) {
                  cssLoader.load( layoutInfo.css );
               }
               if( layoutInfo.html ) {
                  return fileResourceProvider.provide( layoutInfo.html )
                     .then( htmlContent => {
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
      const layoutPath = path.join( layoutsRoot, layout );
      const layoutName = layoutPath.substr( layoutPath.lastIndexOf( '/' ) + 1 );
      const layoutFile = layoutName + '.html';
      const cssFile = 'css/' + layoutName + '.css';

      return themeManager.urlProvider(
         path.join( layoutPath, '[theme]' ),
         path.join( themesRoot, '[theme]', 'layouts', layout )
      ).provide( [ layoutFile, cssFile ] ).then( ( [ html, css ] ) => ( {
         html,
         css,
         className: `${layoutName.replace( /\//g, '' ).replace( /_/g, '-' )}-layout`
      } ) );
   }
}
