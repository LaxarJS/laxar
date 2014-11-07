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

   function StringFormatter() {}

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function repeatCharacter( character, count ) {
      var result = '';

      for( var i = 0; i < count; ++i ) {
         result += character;
      }

      return result;
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   /**
    * Formats a number as string according to a specified format string.
    *
    * @param {String} value         The value to format.
    * @param {GenericFormat} genericFormat The format string as GenericFormat instance.

    * @return {String} The formatted value.
    */
   StringFormatter.prototype.format = function( value, genericFormat ) {
      if( !genericFormat ) {
         return value.toString();
      }

      if( genericFormat.precision() > -1 && genericFormat.precision() < value.length ) {
         value = value.substring( 0, genericFormat.precision() );
      }

      if( genericFormat.width() > -1 ) {
         if( genericFormat.width() < value.length ) {
            return value.substring( 0, genericFormat.width() );
         }

         if( genericFormat.width() > value.length ) {
            return repeatCharacter( ' ', genericFormat.width() - value.length ) + value;
         }
      }

      return value.toString();
   };

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   return {
      /**
       * Creates a new instance of <code>StringFormatter</code>.
       *
       * @return {StringFormatter} A new instance of <code>StringFormatter</code>.
       */
      create: function() {
         return new StringFormatter();
      }
   };
} );
