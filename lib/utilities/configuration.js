/**
 * Copyright 2016 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
/**
 * The *configuration* module provides convenient readonly access to all values configured for this application
 * under `window.laxar`. Most probably this configuration takes place in the JavaScript file
 * `application/application.js` under your project's root directory.
 *
 * When requiring `laxar`, it is available as `laxar.configuration`.
 *
 * @module configuration
 */
import { path } from './object';

/*jshint evil:true*/
/**
 * Obtain global object in strict mode: http://stackoverflow.com/questions/3277182/
 *
 * private tag needed for api doc generation. Otherwise the module description becomes messed up.
 *
 * @private
 */
const global = new Function( 'return this' )();

///////////////////////////////////////////////////////////////////////////////////////////////////////////

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
export function get( key, optionalDefault ) {
   return path( global.laxar, key, optionalDefault );
}
