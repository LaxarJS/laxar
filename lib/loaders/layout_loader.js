/**
 * Copyright 2016 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
import * as path from '../utilities/path';

export function create( layoutsRoot, themesRoot, cssLoader, themeManager, fileResourceProvider ) {
   return {
      load( layout ) {
         return resolveLayout( layout )
            .then( layoutInfo => {
               if( layoutInfo.css ) {
                  cssLoader.load( layoutInfo.css );
               }
               if( !layoutInfo.html ) {
                  return layoutInfo;
               }
               return fileResourceProvider.provide( layoutInfo.html )
                  .then( htmlContent => {
                     layoutInfo.htmlContent = htmlContent;
                     return layoutInfo;
                  } );
            } );
      }
   };

   ////////////////////////////////////////////////////////////////////////////////////////////////////////

   function resolveLayout( layout ) {
      const layoutPath = path.join( layoutsRoot, layout );
      const layoutName = layoutPath.substr( layoutPath.lastIndexOf( '/' ) + 1 );
      const className = `${layoutName}-layout`;

      const provide = themeManager.urlProvider(
         path.join( layoutPath, '[theme]' ),
         path.join( themesRoot, '[theme]', 'layouts', layout )
      );

      return Promise.all( [ provide( `${layoutName}.html` ), provide( `css/${layoutName}.css` ) ] )
         .then( ( [ html, css ] ) => ( { html, css, className } ) );
   }
}
