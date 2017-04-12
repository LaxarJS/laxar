/**
 * Copyright 2016 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */

import assert from '../utilities/assert';

export function create( artifactProvider, debugEventBus ) {
   assert( artifactProvider ).hasType( Object ).isNotNull();
   assert( debugEventBus ).hasType( Object ).isNotNull();

   return {
      load( layoutRef ) {
         const { descriptor, assetForTheme } = artifactProvider.forLayout( layoutRef );
         //TODO: debugEventBus;
         return descriptor()
            .then( ({ name, templateSource }) => Promise.all( [
               Promise.resolve( name ),
               assetForTheme( templateSource || `${name}.html` )
            ] ) )
            .then( ([ name, html ]) => ({ name, html, className: `${name}-layout` }) );
      }
   };
}
