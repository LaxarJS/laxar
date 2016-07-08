/**
 * Copyright 2016 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */

import { path, setPath } from '../utilities/object';

export function create( configByPath={} ) {
   return {
      get: jasmine.createSpy( 'configuration.get' ).and.callFake( ( lookup, fallback ) => {
         const config = {};
         Object.keys( configByPath ).forEach( path => {
            setPath( config, path, configByPath[ path ] );
         } );
         return path( config, lookup, fallback );
      } )
   };
}
