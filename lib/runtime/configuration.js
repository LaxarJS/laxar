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
import { path } from '../utilities/object';

export function create( source ) {
   return {
      /**
       * Returns the configured value for the specified attribute path or `undefined` in case it wasn't
       * configured. If a default value was passed as second argument this is returned instead of `undefined`.
       *
       * Examples:
       * ```js
       * define( [ 'laxar' ], function( ax ) {
       *    ax.configuration.get( 'logging.threshold' ); // -> 'INFO'
       *    ax.configuration.get( 'iDontExist' ); // -> undefined
       *    ax.configuration.get( 'iDontExist', 42 ); // -> 42
       * } );
       * ```
       *
       * @param {String} key
       *    a  path (using `.` as separator) to the property in the configuration object
       * @param {*} [optionalDefault]
       *    the value to return if no value was set for `key`
       *
       * @return {*}
       *    either the configured value, `undefined` or `optionalDefault`
       */
      get( key, optionalDefault ) {
         return path( source, key, optionalDefault );
      }
   };
}
