/**
 * Copyright 2016 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
export function create( configByPath={} ) {
   return {
      get: jasmine.createSpy( 'configuration.get' ).and.callFake(
         ( path, fallback ) => ( path in configByPath ) ? configByPath[ path ] : fallback
      )
   };
}
