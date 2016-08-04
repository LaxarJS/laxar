/**
 * Copyright 2016 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
/**
 * The *configuration* module provides convenient readonly access to the LaxarJS application bootstrapping
 * configuration. The configuration values are passed to laxar.bootstrap on startup (until LaxarJS v1.x,
 * these configuration values were read from `window.laxar`). When using the LaxarJS application template,
 * the configuration values are set in the file `application/application.js` under your project's root
 * directory.
 *
 * The configuration can be injected into widgets as `axConfiguration`.
 *
 * For compatibility, it is (for now) also available under `laxar.configuration`.
 *
 * @module configuration
 */
import assert from '../utilities/assert';
import { path } from '../utilities/object';

export function create( source, defaults ) {

   /**
    * @name {axConfiguration}
    */
   return { get, ensure };

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   /**
    * Returns the configured value for the specified attribute path or `undefined` in case it wasn't
    * configured. If a default value was passed as second argument this is returned instead of `undefined`.
    *
    * Services should use this to get configuration values for which there are universal fallback behaviors.
    *
    * Examples:
    * ```js
    *    const config = create( { logging: { threshold: 'INFO' } } );
    *    configuration.get( 'logging.threshold' ); // -> 'INFO'
    *    configuration.get( 'iDontExist' ); // -> undefined
    *    configuration.get( 'iDontExist', 42 ); // -> 42
    * ```
    *
    * @memberof {axConfiguration}
    *
    * @param {String} key
    *    a  path (using `.` as separator) to the property in the configuration object
    * @param {*} [optionalDefault]
    *    the value to return if no value was set for `key`
    *
    * @return {*}
    *    either the configured value, `undefined` or `optionalDefault`
    */
   function get( key, optionalDefault ) {
      const value = path( source, key );
      return ( value !== undefined ) ? value : path( defaults, key, optionalDefault );
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   /**
    * Retrieves a configuration value by key, failing if it is `undefined` or `null`.
    *
    * Services should use this to get configuration values for which no universal default or fallback exists.
    *
    * Examples:
    * ```js
    *    const config = create( { logging: { threshold: 'INFO' } } );
    *    configuration.ensure( 'logging.threshold' ); // -> 'INFO'
    *    configuration.ensure( 'iDontExist' ); // -> throws
    * ```
    *
    *
    * @memberof {axConfiguration}
    *
    * @param {String} key
    *    a  path (using `.` as separator) to the property in the configuration object
    *
    * @return {*}
    *    the configured value (if `undefined` or `null`, an exception is thrown instead)
    */
   function ensure( key ) {
      const value = get( key );
      assert( value ).isNotNull( `Configuration is missing mandatory entry: ${key}` );
      return value;
   }
}
