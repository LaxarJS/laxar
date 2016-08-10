/**
 * Copyright 2016 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
*/

/**
 * Allows to create mock implementations of {@link Configuration}, compatible to the "axConfiguration"
 * injection.
 *
 * @module heartbeat_mock
 */

import assert from '../utilities/assert';
import { path, setPath } from '../utilities/object';

/**
 * Creates a mock {@link Configuration}, compatible to the "axConfiguration" injection of a widget.
 *
 * The accessor methods `get` and `ensure` are spied.
 *
 * The mock behaves just like the actual configuration, except that configuration values may be initialized
 * from paths, not just regular nested JSON objects. This simplifies mocking of nested configuration such as
 * `logging.threshold`. Usage of this feature is optional, nested objects work just as well.
 *
 * @param {Object} configByPath
 *    path-to-value mappings for the mock
 *
 * @return {Configuration}
 *    a fresh mock instance
 */
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
