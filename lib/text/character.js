/**
 * Copyright 2014 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
define( [
   'underscore'
], function( _ ) {
   'use strict';

   function isDigit( value ) {
      return _.isString( value ) && value.length === 1 && '0' <= value && value <= '9';
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function isWhitespaceCharacter( character ) {
      return character === ' ' || character === '\n' || character === '\t' || character === '\r';
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function isWhitespace( text ) {
      if( text.length === 1 ) {
         return isWhitespaceCharacter( text );
      }

      for( var i = 0; i < text.length; ++i ) {
         if( !isWhitespaceCharacter( text.charAt( i ) ) ) {
            return false;
         }
      }

      return true;
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   return {
      /**
       * Tests if the specified character is a digit.
       *
       * @param char {String} The character to check.
       *
       * @return {Boolean} <code>true</code>, if the specified character is a digit, otherwise
       *                   <code>false</code>.
       */
      isDigit: isDigit,

      /**
       * Checks if a string or character is whitespace
       *
       * @param {String} text The text to check.
       *
       * @return {Boolean} <code>true</code>, if <i>text</i> contains only whitespace, otherwise
       *                   <code>false</code>.
       */
      isWhitespace: isWhitespace
   };
} );
