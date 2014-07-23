/**
 * Copyright 2014 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
define( [], function() {
   'use strict';

   var DEFAULT_FORMATTERS = {
      's': function( input, subSpecifierString ) {
         return '' + input;
      },

      'd': function( input, subSpecifierString ) {
         return input.toFixed( 0 );
      },

      'i': function( input, subSpecifierString ) {
         return DEFAULT_FORMATTERS.d( input, subSpecifierString );
      },

      'f': function( input, subSpecifierString ) {
         var precision = subSpecifierString.match( /^\.(\d)$/ );
         if( precision ) {
            return input.toFixed( precision[1] );
         }

         return '' + input;
      },

      'o': function( input, subSpecifierString ) {
         return JSON.stringify( input );
      },

      'default': function( input, subSpecifierString ) {
         return DEFAULT_FORMATTERS.s( input, subSpecifierString );
      }
   };

   if( typeof Object.freeze === 'function' ) {
      Object.freeze( DEFAULT_FORMATTERS );
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   /**
    * Returns `true` if the first argument ends with the string given as second argument.
    *
    * @param {String} inputString
    *    test subject
    * @param {String} suffix
    *    string to find as tail
    * @param {Boolean} [optionalIgnoreCase]
    *    if `true` case insensitive matching takes place.  Default is `false`
    *
    * @return {Boolean}
    *    `true` if suffix is the tail of inputString
    */
   function endsWith( inputString, suffix, optionalIgnoreCase ) {
      inputString = optionalIgnoreCase ? inputString.toLowerCase() : inputString;
      suffix = optionalIgnoreCase ? suffix.toLowerCase() : suffix;

      return inputString.indexOf( suffix, inputString.length - suffix.length) !== -1;
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   /**
    * Expects an upper-case string with underscores and creates a new string in the corresponding camel-
    * case notation, i.e. `SOME_NICE_FEATURE` will be converted to `someNiceFeature`. If there are n
    * successive underscores for n > 1, they will be transformed to n-1 underscores in the resulting string.
    * This can be prevented by passing the `removeAllUnderscores` parameter as `true`. In that case the
    * first character is always transformed to lower case.
    *
    * @param {String} inputString
    *    the uppercase-underscore string
    * @param {Boolean} [removeAllUnderscores]
    *    if `true` all underscores will be removed
    *
    * @return {String}
    *    the string transformed to camelcase
    */
   function upperCaseToCamelCase( inputString, removeAllUnderscores ) {
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
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

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
   function removeUnderscoresFromCamelCase( inputString ) {
      return inputString.replace( /_+([a-z])/g, function( match, char, offset ) {
         return offset > 0 ? char.toUpperCase() : char;
      } ).replace( /_/g, '' );
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   /**
    * Returns a new string that equals the `inputString` where the first character is upper-case.
    *
    * @param {String} inputString
    *    the string to capitalize
    *
    * @return {String}
    *    the capitalized string
    */
   function capitalize( inputString ) {
      if( typeof inputString !== 'string' || inputString.length < 1 ) {
         return inputString;
      }
      return inputString.charAt( 0 ).toUpperCase() + inputString.slice( 1 );
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   /**
    * <a name="format"></a>
    * Substitutes all unescaped placeholders in the given string for a given indexed or named value.
    * A placeholder is written as a pair of brackets around the key of the placeholder. An example of an
    * indexed placeholder is `[0]` and a named placeholder would look like this `[replaceMe]`. If no
    * replacement for a key exists, the placeholder will simply not be substituted.
    *
    * Some examples:
    * ```javascript
    * string.format( 'Hello [0], how do you like [1]?', [ 'Peter', 'Cheeseburgers' ] );
    * // => 'Hello Peter, how do you like Cheeseburgers?'
    * ```
    * ```javascript
    * string.format( 'Hello [name] and [partner], how do you like [0]?', [ 'Pizza' ], {
    *    name: 'Hans',
    *    partner: 'Roswita'
    * } );
    * // => 'Hello Hans and Roswita, how do you like Pizza?'
    * ```
    * If a pair of brackets should not be treated as a placeholder, the opening bracket can simply be escaped
    * by backslashes (thus to get an actual backslash, it needs to be written as double backslash):
    * ```javascript
    * string.format( 'A [something] should eventually only have \\[x].', {
    *    something: 'checklist'
    * } );
    * // => 'A checklist should eventually only have [x].'
    * ```
    * A placeholder key can be any character string besides `[`, `]` and `:` to keep parsing simple and fast.
    * Using `:` as separator it is possible to provide a type specifier for string serialization. Known types
    * are:
    *
    * - `%d` / `%i`: Format the given numeric value as integer. Decimal places are removed.
    * - `%f`: Format the given numeric value as floating point value. This specifier supports precision as
    *   sub-specifier (e.g. `%.2f` for 2 decimal places).
    * - `%s`: use simple string serialization using `toString`.
    * - `%o`: Format complex objects using `JSON.stringify`.
    *
    * When no specifier is provided, by default `%s` is assumed.
    *
    * Example:
    * ```javascript
    * string.format( 'Hello [0:%s], you owe me [1:%.2f] euros.', [ 'Peter', 12.1243 ] );
    * // => 'Hello Peter, you owe me 12.12 euros.'
    * ```
    *
    * @param {String} string
    *    the string to replace placeholders in
    * @param {Array} [optionalIndexedReplacements]
    *    an optional array of indexed replacements
    * @param {Object} [optionalNamedReplacements]
    *    an optional map of named replacements
    *
    * @return {String}
    *    the string with placeholders substituted for their according replacements
    */
   function format( string, optionalIndexedReplacements, optionalNamedReplacements ) {
      return DEFAULT_FORMATTER( string, optionalIndexedReplacements, optionalNamedReplacements );
   }
   var DEFAULT_FORMATTER = createFormatter( DEFAULT_FORMATTERS );

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   /**
    * Creates a new format function having the same api as [`format()`](#format) but without the default
    * formatters for specifiers. Instead the specifiers of interest have to be passed to this function as map
    * from specifier (omitting the `%`) to formatting function. A formatting function receives the value to
    * format and the sub-specifier (if any) as arguments. For example for the format specifier `%.2f` the
    * sub-specifier would be `.2` where for `%s` it would simply be the empty string.
    *
    * Example:
    * ```javascript
    * var format = string.createFormatter( {
    *    'm': function( value ) {
    *       return value.amount + ' ' + value.currency;
    *    },
    *    'p': function( value, subSpecifier ) {
    *       return Math.pow( value, parseInt( subSpecifier, 10 ) );
    *    }
    * } );
    *
    * format( 'You owe me [0:%m].', [ { amount: 12, currency: 'EUR' } ] );
    * // => 'You owe me 12 EUR.'
    *
    * format( '[0]^3 = [0:%3p]', [ 2 ] );
    * // => '2^3 = 8'
    * ```
    *
    * @param {Object} typeFormatters
    *    map from format specifier (single letter without leading `%`) to formatting function
    *
    * @return {Function}
    *    A function having the same api as [`format()`](#format)
    */
   function createFormatter( typeFormatters ) {

      return function format( string, optionalIndexedReplacements, optionalNamedReplacements ) {
         if( typeof string !== 'string' || string.length < 1 ) {
            return string;
         }

         var indexed = Array.isArray( optionalIndexedReplacements ) ? optionalIndexedReplacements : [];
         var named = {};
         if( optionalNamedReplacements ) {
            named = optionalNamedReplacements || {};
         }
         else if( !Array.isArray( optionalIndexedReplacements ) ) {
            named = optionalIndexedReplacements || {};
         }

         var chars = string.split( '' );
         var output = '';
         for( var i = 0, len = chars.length; i < len; ++i ) {
            if( chars[i] === BACKSLASH ) {
               if( i + 1 === len ) {
                  throw new Error( 'Unterminated escaping sequence at index ' + i + ' of string: "' +
                     string + '".' );
               }

               output += chars[ ++i ];
            }
            else if( chars[i] === OPENING_BRACKET ) {
               var closingIndex = string.indexOf( CLOSING_BRACKET, i + 1 );
               if( closingIndex === -1 ) {
                  throw new Error( 'Unterminated placeholder at index ' + i + ' of string: "' +
                     string + '".' );
               }

               var key = string.substring( i + 1, closingIndex );

               output += replacePlaceholder( key, named, indexed, typeFormatters, { string: string, index: i } );

               i = closingIndex;
            }
            else {
               output += chars[i];
            }
         }
         return output;
      };

   }
   var BACKSLASH = '\\';
   var OPENING_BRACKET = '[';
   var CLOSING_BRACKET = ']';
   var INTEGER_MATCHER = /^[0-9]+$/;

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function replacePlaceholder( placeholder, named, indexed, typeFormatters, context ) {
      if( !typeFormatters ) {
         typeFormatters = DEFAULT_FORMATTERS;
      }

      var specifier = '';
      var subSpecifierString = '';
      var index = placeholder.indexOf( ':' );
      var key = placeholder;

      if( index !== -1 ) {
         var specifierPart = key.substring( index + 1 );
         var specifierMatch = specifierPart.match( /^%(.*)(\w)$/ );
         if( !specifierMatch ) {
            throw new Error( 'Invalid format specifier "' + specifierPart + '" at index ' +
               ( context.index + index + 2 /* [ and : */ ) + ' of string: "' + context.string + '".' );
         }
         specifier = specifierMatch[ 2 ];
         subSpecifierString = specifierMatch[ 1 ];

         key = key.substring( 0, index );
      }

      var value;
      if( INTEGER_MATCHER.test( key ) && key < indexed.length ) {
         value = indexed[ key ];
      }
      else if( key in named ) {
         value = named[ key ];
      }
      else {
         return OPENING_BRACKET + placeholder + CLOSING_BRACKET;
      }

      if( specifier in typeFormatters ) {
         return typeFormatters[ specifier ]( value, subSpecifierString );
      }
      else if( !specifier ) {
         if( 'default' in typeFormatters ) {
            return typeFormatters['default']( value, subSpecifierString );
         }

         return DEFAULT_FORMATTERS['default']( value, subSpecifierString );
      }

      var knownSpecifiers = Object.keys( typeFormatters )
         .filter( function( _ ) { return  _ !== 'default'; } )
         .map( function( _ ) { return '%' + _; } )
         .join( ', ' );

      throw new Error( 'Unknown format specifier "' + specifier + '" at index ' +
         ( context.index + index + 2 /* [ and : */ ) + ' of string: "' + context.string +
         '" (Known specifiers are: ' + knownSpecifiers + ').' );
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   return {
      endsWith: endsWith,
      upperCaseToCamelCase: upperCaseToCamelCase,
      removeUnderscoresFromCamelCase: removeUnderscoresFromCamelCase,
      capitalize: capitalize,
      format: format,
      createFormatter: createFormatter,
      DEFAULT_FORMATTERS: DEFAULT_FORMATTERS
   };

} );
