/**
 * Copyright 2016 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
/**
 * Module providing the Configuration factory.
 *
 * To use the Configuration in a widget, request the {@link widget_services#axConfiguration axConfiguration}
 * injection. In compatibility mode with LaxarJS v1.x, it is also available under `laxar.configuration`.
 *
 * @module configuration
 */
import assert from '../utilities/assert';
import { path } from '../utilities/object';

export function create( source, defaults ) {

   /**
    * Provides access to the configuration that was passed during application bootstrapping.
    *
    * A *Configuration* instance provides convenient readonly access to the underlying LaxarJS
    * application bootstrapping configuration. The configuration values are passed to
    * {@link laxar#create()} on startup (before LaxarJS v2.x, these configuration values were read from
    * `window.laxar`). When using the LaxarJS application template, the configuration values are set in the
    * file `init.js` under your project's root directory.
    *
    * @name Configuration
    * @constructor
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
    * // ... inject `axConfiguration` as parameter `config` ...
    * config.get( 'logging.threshold' ); // -> 'INFO'
    * config.get( 'iDontExist' ); // -> undefined
    * config.get( 'iDontExist', 42 ); // -> 42
    * ```
    *
    * @param {String} key
    *    a path (using `.` as separator) to the property in the configuration object
    * @param {*} [optionalDefault]
    *    the value to return if no value was set for `key`
    *
    * @return {*}
    *    either the configured value, `undefined` or `optionalDefault`
    *
    * @memberof Configuration
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
    * // ... inject `axConfiguration` as parameter `config` ...
    * config.ensure( 'logging.threshold' ); // -> 'INFO'
    * config.ensure( 'iDontExist' ); // -> throws
    * ```
    *
    * @param {String} key
    *    a path (using `.` as separator) to the property in the configuration object
    *
    * @return {*}
    *    the configured value (if `undefined` or `null`, an exception is thrown instead)
    *
    * @memberof Configuration
    */
   function ensure( key ) {
      const value = get( key );
      assert( value ).isNotNull( `Configuration is missing mandatory entry: ${key}` );
      return value;
   }
}
