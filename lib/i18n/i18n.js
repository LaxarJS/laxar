/**
 * Copyright 2014 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
/**
 * Utilities for dealing with internationalization (i18n).
 *
 * When requiring `laxar`, it is available as `laxar.i18n`.
 *
 * @module i18n
 */
define( [
   '../utilities/string',
   '../utilities/assert',
   '../utilities/configuration'
], function( string, assert, configuration ) {
   'use strict';

   var localize = localizeRelaxed;

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   var primitives = {
      string: true,
      number: true,
      boolean: true
   };

   var fallbackTag;

   var normalize = memoize( function( languageTag ) {
      return languageTag.toLowerCase().replace( /[-]/g, '_' );
   } );

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   // Shortcuts: it is assumed that this module is used heavily (or not at all).
   var format = string.format;
   var keys = Object.keys;

   return {
      localize: localize,
      localizeStrict: localizeStrict,
      localizeRelaxed: localizeRelaxed,
      localizer: localizer,
      languageTagFromI18n: languageTagFromI18n
   };

   /**
    * Shortcut to {@link localizeRelaxed}.
    *
    * @name localize
    * @type {Function}
    */

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   /**
    * Localize the given internationalized object using the given languageTag.
    *
    * @param {String} languageTag
    *    the languageTag to lookup a localization with. Maybe `undefined`, if the value is not i18n (app does
    *    not use i18n)
    * @param {*} i18nValue
    *    a possibly internationalized value:
    *    - when passing a primitive value, it is returned as-is
    *    - when passing an object, the languageTag is used as a key within that object
    * @param {*} [optionalFallback]
    *    a value to use if no localization is available for the given language tag
    *
    * @return {*}
    *    the localized value if found, `undefined` otherwise
    */
   function localizeStrict( languageTag, i18nValue, optionalFallback ) {
      assert( languageTag ).hasType( String );
      if( !i18nValue || primitives[ typeof i18nValue ] ) {
         // Value is not i18n
         return i18nValue;
      }
      assert( languageTag ).isNotNull();

      // Try one direct lookup before scanning the input keys,
      // assuming that language-tags are written in consistent style.
      var value = i18nValue[ languageTag ];
      if( value !== undefined ) {
         return value;
      }

      var lookupKey = normalize( languageTag );
      var availableTags = keys( i18nValue );
      var n = availableTags.length;
      for( var i = 0; i < n; ++i ) {
         var t = availableTags[ i ];
         if( normalize( t ) === lookupKey ) {
            return i18nValue[ t ];
         }
      }

      return optionalFallback;
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   /**
    * For controls (such as a date-picker), we cannot anticipate all required language tags, as they may be
    * app-specific. The relaxed localize behaves like localize if an exact localization is available. If not,
    * the language tag is successively generalized by stripping off the rightmost sub-tags until a
    * localization is found. Eventually, a fallback ('en') is used.
    *
    * @param {String} languageTag
    *    the languageTag to lookup a localization with. Maybe `undefined`, if the value is not i18n (app does
    *    not use i18n)
    * @param {*} i18nValue
    *    a possibly internationalized value:
    *    - when passing a primitive value, it is returned as-is
    *    - when passing an object, the `languageTag` is used to look up a localization within that object
    * @param {*} [optionalFallback]
    *    a value to use if no localization is available for the given language tag
    *
    * @return {*}
    *    the localized value if found, the fallback `undefined` otherwise
    */
   function localizeRelaxed( languageTag, i18nValue, optionalFallback ) {
      assert( languageTag ).hasType( String );
      if( !i18nValue || primitives[ typeof i18nValue ] ) {
         // Value is not i18n (app does not use it)
         return i18nValue;
      }

      var tagParts = languageTag ? languageTag.replace( /-/g, '_' ).split( '_' ) : [];
      while( tagParts.length > 0 ) {
         var currentLocaleTag = tagParts.join( '-' );
         var value = localizeStrict( currentLocaleTag, i18nValue );
         if( value !== undefined ) {
            return value;
         }
         tagParts.pop();
      }

      if( fallbackTag === undefined ) {
         fallbackTag = configuration.get( 'i18n.fallback', 'en' );
      }

      return ( fallbackTag && localizeStrict( fallbackTag, i18nValue ) ) || optionalFallback;
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   /**
    * Encapsulate a given languageTag in a partially applied localize function.
    *
    * @param {String} languageTag
    *    the languageTag to lookup localizations with
    * @param {*} [optionalFallback]
    *    a value to use by the localizer function whenever no localization is available for the language tag
    *
    * @return {Localizer}
    *    A single-arg localize-Function, which always uses the given language-tag. It also has a `.format`
    *    -method, which can be used as a shortcut to `string.format( localize( x ), args )`
    */
   function localizer( languageTag, optionalFallback ) {

      /**
       * @name Localizer
       * @private
       */
      function partial( i18nValue ) {
         return localize( languageTag, i18nValue, optionalFallback );
      }

      /**
       * Shortcut to string.format, for simple chaining to the localizer.
       *
       * These are equal:
       * - `string.format( i18n.localizer( tag )( i18nValue ), numericArgs, namedArgs )`
       * - `i18n.localizer( tag ).format( i18nValue, numericArgs, namedArgs )`.
       *
       * @param {String} i18nValue
       *    the value to localize and then format
       * @param {Array} [optionalIndexedReplacements]
       *    replacements for any numeric placeholders in the localized value
       * @param {Object} [optionalNamedReplacements]
       *    replacements for any named placeholders in the localized value
       *
       * @return {String}
       *    the formatted string, taking i18n into account
       *
       * @memberOf Localizer
       */
      partial.format = function( i18nValue, optionalIndexedReplacements, optionalNamedReplacements ) {
         var formatString = localize( languageTag, i18nValue );
         if( formatString === undefined ) {
            return optionalFallback;
         }
         return format( formatString, optionalIndexedReplacements, optionalNamedReplacements );
      };

      return partial;
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   /**
    * Retrieve the language tag of the current locale from an i18n model object, such as used on the scope.
    *
    * @param {{locale: String, tags: Object<String, String>}} i18n
    *    an internationalization model, with reference to the currently active locale and a map from locales
    *    to language tags
    * @param {*} [optionalFallbackLanguageTag]
    *    a language tag to use if no tags are found on the given object
    *
    * @return {String}
    *    the localized value if found, `undefined` otherwise
    */
   function languageTagFromI18n( i18n, optionalFallbackLanguageTag ) {
      if( !i18n || !i18n.hasOwnProperty( 'tags' ) ) {
         return optionalFallbackLanguageTag;
      }
      return i18n.tags[ i18n.locale ] || optionalFallbackLanguageTag;
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function memoize( f ) {
      var cache = {};
      return function( key ) {
         var value = cache[ key ];
         if( value === undefined ) {
            value = f( key );
            cache[ key ] = value;
         }
         return value;
      };
   }

} );
