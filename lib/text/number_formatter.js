/**
 * Copyright 2014 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
define( [
   'underscore',
   './generic_format'
], function( _, GenericFormat ) {
   'use strict';

   function NumberFormatter() {}

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   /**
    * Formats a number as string according to a specified format string.
    *
    * @param {*} value         The value to format.
    * @param {GenericFormat} genericFormat The format string as GenericFormat instance.

    * @return {String} The formatted value.
    */
   NumberFormatter.prototype.format = function( value, genericFormat ) {
      if( _.isUndefined( genericFormat ) || _.isNull( genericFormat ) ) {
         return value.toString();
      }

      var result = '';

      // With precision we mean the number of digits after the decimal point.
      if( genericFormat.precision() > -1 ) {
         result = value.toFixed( genericFormat.precision() );
      }
      else if( genericFormat.width() > -1 ) {
         result = value.toPrecision( genericFormat.width() );
      }
      else {
         result = value.toString();
      }

      // NEEDS FIX A: This is just a temporary, rudimentary implementation. Complete/replace this!

      return result;
   };

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   return {
      /**
       * Creates a new instance of <code>NumberFormatter</code>.
       *
       * @return {NumberFormatter} A new instance of <code>NumberFormatter</code>.
       */
      create: function() {
         return new NumberFormatter();
      }
   };
} );
