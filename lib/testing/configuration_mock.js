/**
 * Copyright 2016 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
import assert from '../utilities/assert';
import { path, setPath } from '../utilities/object';

export function create( configByPath = {} ) {

   const get = jasmine.createSpy( 'configuration.get' ).and.callFake( ( key, fallback ) => {
      const config = {};
      Object.keys( configByPath ).forEach( path => {
         setPath( config, path, configByPath[ path ] );
      } );
      return path( config, key, fallback );
   } );

   const ensure = jasmine.createSpy( 'configuration.ensure' ).and.callFake( key => {
      const value = get( key );
      assert( value ).isNotNull( `Configuration mock is missing mandatory entry: ${key}` );
      return value;
   } );

   return { ensure, get };
}
