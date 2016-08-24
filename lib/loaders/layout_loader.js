/**
 * Copyright 2016 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */

export function create( artifactProvider, cssLoader ) {
   return {
      load( layoutRef ) {
         const { descriptor, assetForTheme, assetUrlForTheme } = artifactProvider.forLayout( layoutRef );
         return descriptor()
            .then( ({ name, templateSource, styleSource }) => Promise.all( [
               assetForTheme( templateSource || `${name}.html` ),
               assetUrlForTheme( styleSource || `css/${name}.css` ),
               Promise.resolve( name )
            ] ) )
            .then( ([ html, cssUrl, name ]) => {
               if( cssUrl ) {
                  cssLoader.load( cssUrl );
               }
               return { name, className: `${name}-layout`, html };
            } );
      }
   };
}
