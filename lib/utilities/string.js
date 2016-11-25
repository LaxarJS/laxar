/**
 * Copyright 2016 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
/**
 * Utilities for dealing with strings.
 *
 * When requiring `laxar`, it is available as `laxar.string`.
 *
 * @module string
 */

//
const BACKSLASH = '\\';
const OPENING_BRACKET = '[';
const CLOSING_BRACKET = ']';
const INTEGER_MATCHER = /^[0-9]+$/;

/**
 * A map of all available default format specifiers to their respective formatter function.
 * The following specifiers are available:
 *
 * - `%d` / `%i`: Format the given numeric value as integer. Decimal places are removed
 * - `%f`: Format the given numeric value as floating point value. This specifier supports precision as
 *   sub-specifier (e.g. `%.2f` for 2 decimal places)
 * - `%s`: use simple string serialization using `toString`
 * - `%o`: Format complex objects using `JSON.stringify`
 *
 * @type {Object}
 * @name DEFAULT_FORMATTERS
 */
export const DEFAULT_FORMATTERS = Object.freeze( {
   's'( input ) {
      return `${input}`;
   },

   'd'( input ) {
      return input.toFixed( 0 );
   },

   'i'( input, subSpecifierString ) {
      return DEFAULT_FORMATTERS.d( input, subSpecifierString );
   },

   'f'( input, subSpecifierString ) {
      const precision = subSpecifierString.match( /^\.(\d)$/ );
      if( precision ) {
         return input.toFixed( precision[ 1 ] );
      }

      return `${input}`;
   },

   'o'( input ) {
      return JSON.stringify( input );
   },

   'default'( input, subSpecifierString ) {
      return DEFAULT_FORMATTERS.s( input, subSpecifierString );
   }
} );

const DEFAULT_FORMATTER = createFormatter( DEFAULT_FORMATTERS );

///////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
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
 * by backslashes (thus to get an actual backslash in a JavaScript string literal, which is then treated as
 * an escape symbol, it needs to be written as double backslash):
 * ```javascript
 * string.format( 'A [something] should eventually only have \\[x].', {
 *    something: 'checklist'
 * } );
 * // => 'A checklist should eventually only have [x].'
 * ```
 * A placeholder key can be any character string besides `[`, `]` and `:` to keep parsing simple and fast.
 * By using `:` as separator it is possible to provide a type specifier for string serialization or other
 * additional mapping functions for the value to insert. Type specifiers always begin with an `%` and end
 * with the specifier type. Builtin specifiers and their according formatter functions are defined
 * as {@link DEFAULT_FORMATTERS}.
 *
 * When no specifier is provided, by default `%s` is assumed.
 *
 * Example:
 * ```javascript
 * string.format( 'Hello [0:%s], you owe me [1:%.2f] euros.', [ 'Peter', 12.1243 ] );
 * // => 'Hello Peter, you owe me 12.12 euros.'
 * ```
 *
 * Mapping functions should instead consist of simple strings and may not begin with a `%` character. It is
 * advised to use the same naming rules as for simple JavaScript functions. Type specifiers and mapping
 * functions are applied in the order they appear within the placeholder.
 *
 * An example, where we assume that the mapping functions `flip` and `double` where defined by the user
 * when creating the `formatString` function using {@link #createFormatter()}:
 * ```javascript
 * formatString( 'Hello [0:%s:flip], you owe me [1:double:%.2f] euros.', [ 'Peter', 12 ] );
 * // => 'Hello reteP, you owe me 24.00 euros.'
 * ```
 *
 * Note that there currently exist no builtin mapping functions.
 *
 * If a type specifier is used that doesn't exist, an exception is thrown. In contrast to that the use of
 * an unknown mapping function results in a no-op. This is on purpose to be able to use filter-like
 * functions that, in case they are defined for a formatter, transform a value as needed and in all other
 * cases simply are ignored and don't alter the value.
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
export function format( string, optionalIndexedReplacements, optionalNamedReplacements ) {
   return DEFAULT_FORMATTER( string, optionalIndexedReplacements, optionalNamedReplacements );
}

///////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Creates a new format function having the same api as {@link #format()}. If the first argument is
 * omitted or `null`, the default formatters for type specifiers are used. Otherwise only the provided map
 * of specifiers is available to the returned format function. Each key of the map is a specifier character
 * where the `%` is omitted and the value is the formatting function. A formatting function receives the
 * value to format (i.e. serialize) and the sub-specifier (if any) as arguments. For example for the format
 * specifier `%.2f` the sub-specifier would be `.2` where for `%s` it would simply be the empty string.
 *
 * Example:
 * ```js
 * const format = string.createFormatter( {
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
 * The second argument is completely additional to the behavior of the default {@link #format()}
 * function. Here a map from mapping function id to actual mapping function can be passed in. Whenever the
 * id of a mapping function is found within the placeholder, that mapping function is called with the
 * current value and its return value is either passed to the next mapping function or rendered
 * instead of the placeholder if there are no more mapping function ids or type specifiers within the
 * placeholder string.
 *
 * ```javascript
 * const format = string.createFormatter( null, {
 *    flip: function( value ) {
 *       return ( '' + s ).split( '' ).reverse().join( '' );
 *    },
 *    double: function( value ) {
 *       return value * 2;
 *    }
 * } );
 *
 * format( 'Hello [0:%s:flip], you owe me [1:double:%.2f] euros.', [ 'Peter', 12 ] );
 * // => 'Hello reteP, you owe me 24.00 euros.'
 * ```
 *
 * @param {Object} typeFormatters
 *    map from format specifier (single letter without leading `%`) to formatting function
 * @param {Object} [optionalValueMappers]
 *    map from mapping identifier to mapping function
 *
 * @return {Function}
 *    a function having the same api as {@link #format()}
 */
export function createFormatter( typeFormatters = DEFAULT_FORMATTERS, optionalValueMappers = {} ) {

   function format( string, optionalIndexedReplacements, optionalNamedReplacements ) {
      if( typeof string !== 'string' ) {
         return defaultTypeFormatter( typeFormatters )( string );
      }

      const indexed = Array.isArray( optionalIndexedReplacements ) ? optionalIndexedReplacements : [];
      let named = {};
      if( optionalNamedReplacements ) {
         named = optionalNamedReplacements || {};
      }
      else if( !Array.isArray( optionalIndexedReplacements ) ) {
         named = optionalIndexedReplacements || {};
      }

      const chars = string.split( '' );
      let output = '';
      for( let i = 0, len = chars.length; i < len; ++i ) {
         if( chars[ i ] === BACKSLASH ) {
            if( i + 1 === len ) {
               throw new Error( `Unterminated escaping sequence at index ${i} of string: "${string}".` );
            }

            output += chars[ ++i ];
         }
         else if( chars[ i ] === OPENING_BRACKET ) {
            const closingIndex = string.indexOf( CLOSING_BRACKET, i + 1 );
            if( closingIndex === -1 ) {
               throw new Error( `Unterminated placeholder at index ${i} of string: "${string}".` );
            }

            const key = string.substring( i + 1, closingIndex );

            output += replacePlaceholder( key, named, indexed, { string, index: i } );

            i = closingIndex;
         }
         else {
            output += chars[ i ];
         }
      }
      return output;
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function replacePlaceholder( placeholder, named, indexed, context ) {
      let specifier = '';
      let subSpecifierString = '';
      const placeholderParts = placeholder.split( ':' );
      const key = placeholderParts[ 0 ];

      let value;
      if( INTEGER_MATCHER.test( key ) && key < indexed.length ) {
         value = indexed[ key ];
      }
      else if( key in named ) {
         value = named[ key ];
      }
      else {
         return OPENING_BRACKET + placeholder + CLOSING_BRACKET;
      }

      if( placeholderParts.length > 1 ) {

         if( placeholderParts[ 1 ].charAt( 0 ) !== '%' ) {
            value = defaultTypeFormatter( typeFormatters )( value );
         }

         return placeholderParts.slice( 1 ).reduce( ( value, part ) => {
            if( part.indexOf( '%' ) === 0 ) {
               const specifierMatch = part.match( /^%(.*)(\w)$/ );
               specifier = specifierMatch ? specifierMatch[ 2 ] : '';
               subSpecifierString = specifierMatch ? specifierMatch[ 1 ] : '';
               if( specifier in typeFormatters ) {
                  return typeFormatters[ specifier ]( value, subSpecifierString );
               }
               const knownSpecifiers = Object.keys( typeFormatters )
                  .filter( _ => _ !== 'default' )
                  .map( _ => `%${_}` )
                  .join( ', ' );

               throw new Error(
                  `Unknown format specifier "%${specifier}" for placeholder` +
                  ` at index ${context.index} of string: "${context.string}"` +
                  ` (Known specifiers are: ${knownSpecifiers}).`
               );
            }
            if( part in optionalValueMappers ) {
               return optionalValueMappers[ part ]( value );
            }

            return value;
         }, value );
      }

      return defaultTypeFormatter( typeFormatters )( value );
   }

   ////////////////////////////////////////////////////////////////////////////////////////////////////////

   return format;

}

///////////////////////////////////////////////////////////////////////////////////////////////////////////

function defaultTypeFormatter( typeFormatters ) {
   if( 'default' in typeFormatters ) {
      return typeFormatters[ 'default' ];
   }

   return DEFAULT_FORMATTERS[ 'default' ];
}
