/**
 * Copyright 2016 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */

export function create( artifactProvider ) {
   return {
      load( layoutRef ) {
         const { descriptor, assetForTheme } = artifactProvider.forLayout( layoutRef );
         return descriptor()
            .then( ({ name, templateSource }) => Promise.all( [
               Promise.resolve( name ),
               assetForTheme( templateSource || `${name}.html` )
            ] ) )
            .then( ([ name, html ]) => ({ name, html, className: `${name}-layout` }) );
      }
   };
}
