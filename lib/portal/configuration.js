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
      get: function( key, optionalDefault ) {
         return object.path( global.laxar, key, optionalDefault );
      }
   };

} );
