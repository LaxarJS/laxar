/**
 * Copyright 2014 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
/*jshint evil:true*/
define( [
   '../utilities/object'
], function( object ) {
   'use strict';

   // Obtain global object in strict mode: http://stackoverflow.com/questions/3277182/
   var global = new Function( 'return this' )();

   return {

      /**
       * Returns the configured value for the specified attribute path or `undefined` in case it wasn't
       * configured. If a default value was passed as second argument this is returned instead of `undefined`.
       *
       * @param {String} key
       *    a  path (using `.` as separator) to the property in the configuration object
       * @param {*} [optionalDefault]
       *    the value to return if no value was set for `key`
       *
       * @return {*}
       *    either the configured value or `optionalDefault`
       */
      get: function( key, optionalDefault ) {
         return object.path( global.laxar, key, optionalDefault );
      }

   };

} );
