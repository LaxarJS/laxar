/**
 * Copyright 2014 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
define( [], function() {
   'use strict';

   return {

      /**
       * Returns `true` if the first argument ends with the string given as second argument.
       *
       * @param {String} inputString
       *    test subject
       * @param {String} suffix
       *    string to find as tail
       * @param {Boolean=} optionalIgnoreCase
       *    if `true` case insensitive matching takes place.  Default is `false`
       *
       * @return {Boolean}
       *    `true` if suffix is the tail of inputString
       */
      endsWith: function( inputString, suffix, optionalIgnoreCase ) {
         inputString = optionalIgnoreCase ? inputString.toLowerCase() : inputString;
         suffix = optionalIgnoreCase ? suffix.toLowerCase() : suffix;
         return inputString.indexOf( suffix, inputString.length - suffix.length) !== -1;
      },

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      /**
       * Expects an upper-case string with underscores and creates a new string in the corresponding camel-
       * case notation, i.e. `SOME_NICE_FEATURE` will be converted to `someNiceFeature`. If there are n
       * successive underscores for n > 1, they will be transformed to n-1 underscores in the resulting string.
       * This can be prevented by passing the `removeAllUnderscores` parameter as `true`. In that case the
       * first character is always transformed to lower case.
       *
       * @param {String} inputString
       *    the uppercase-underscore string
       * @param {Boolean=} removeAllUnderscores
       *    if `true` all underscores will be removed
       *
       * @return {String}
       *    the string transformed to camelcase
       */
      upperCaseToCamelCase: function( inputString, removeAllUnderscores ) {
         var result = inputString.toLowerCase()
            .replace( /([_]+)([a-z])/g, function( match, underscores, character, offset ) {
               var remainingUnderScores = offset > 0 ? underscores.substr( 1 ) : underscores;
               return remainingUnderScores + character.toUpperCase();
            } );

         if( removeAllUnderscores === true ) {
            result = result.replace( /_*/g, '' );
            return result.charAt( 0 ).toLowerCase() + result.slice( 1 );
         }

         return result;
      },

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      /**
       * Removes all underscores from an otherwise camel-case formatted string. Those strings result e.g. from
       * generated id's, where there is a prefix taken from a component type, combined with an generated id,
       * separated by `__`. Example: `accordion_widget__id0` will result in `accordionWidgetId0`
       *
       * @param {String} inputString
       *    the camel-case string to remove all underscores from
       *
       * @return {String}
       *    the camel case string with all underscores removed
       */
      removeUnderscoresFromCamelCase: function( inputString ) {
         return inputString.replace( /_+([a-z])/g, function( match, char, offset ) {
            return offset > 0 ? char.toUpperCase() : char;
         } ).replace( /_/g, '' );
      },

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      /**
       * Returns a new string that equals the `inputString` where the first character is upper-case.
       *
       * @param {String} inputString
       *    the string to capitalize
       *
       * @return {String}
       *    the capitalized string
       */
      capitalize: function( inputString ) {
         if( typeof inputString !== 'string' || inputString.length < 1 ) {
            return inputString;
         }
         return inputString.charAt( 0 ).toUpperCase() + inputString.slice( 1 );
      }

   };

} );