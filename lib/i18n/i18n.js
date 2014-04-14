/**
 * Copyright 2014 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
define( [
   '../text/text',
   '../utilities/assert'
], function( text, assert, undefined ) {
   'use strict';

   // Shortcuts: it is assumed that this module is used heavily (or not at all).
   var format = text.format;
   var slice = [].slice;
   var primitives = [ 'string', 'number', 'boolean' ];
   var keys = Object.keys;

   var normalize = memoize( function( languageTag ) {
      return languageTag.toLowerCase().replace( /-/g, '_' );
   } );

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

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function localize( languageTag, i18nValue, fallback ) {
      assert( languageTag ).hasType( String );
      if( !i18nValue || primitives.indexOf( typeof i18nValue ) !== -1 ) {
         // Value is not i18n (app does not use it)
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

      return fallback;
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   var RELAXED_DEFAULT_LOCALE = 'en';

   function localizeRelaxed( languageTag, i18nValue, fallback ) {
      assert( languageTag ).hasType( String );
      if( !i18nValue || primitives.indexOf( typeof i18nValue ) !== -1 ) {
         // Value is not i18n (app does not use it)
         return i18nValue;
      }

      var tagParts = languageTag ? languageTag.replace( /-/g, '_' ).split( '_' ) : [];
      while( tagParts.length > 0 ) {
         var currentLocaleTag = tagParts.join( '-' );
         var value = localize( currentLocaleTag, i18nValue );
         if( value !== undefined ) {
            return value;
         }
         tagParts.pop();
      }

      return i18nValue[ RELAXED_DEFAULT_LOCALE ] || fallback;
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function localizer( languageTag, fallback ) {
      function partial( i18nValue ) {
         return localize( languageTag, i18nValue, fallback );
      }

      /**
       * Shortcut to text.format, for simple chaining to the localizer.
       *
       * These are equal:
       * - `text.format( i18n.localizer( tag )( i18nValue ), arg1, arg2 )`
       * - `i18n.localizer( tag ).format( i18nValue, arg1, arg2 )`.
       */
      partial.format = function( i18nValue /*, substitution1, substitution2, ... */ ) {
         var args = slice.call( arguments, 1 );
         var formatString = localize( languageTag, i18nValue );
         if( formatString === undefined ) {
            return fallback;
         }
         args.unshift( formatString );
         return format.apply( text, args );
      };
      return partial;
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function languageTagFromI18n( i18n, fallbackLanguageTag ) {
      if( !i18n || !i18n.hasOwnProperty( 'tags' ) ) {
         return fallbackLanguageTag;
      }
      return i18n.tags[ i18n.locale ] || fallbackLanguageTag;
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   return {

      /**
       * Localize the given internationalized object using the given languageTag.
       *
       * @param {String} languageTag
       *    The languageTag to lookup a localization with
       *    Maybe undefined if the value is not i18n (app does not use i18n)
       * @param {*} i18nValue
       *    A possibly internationalized value:
       *    - When passing a primitive value, it is returned as-is.
       *    - When passing an object, the languageTag is used as a key within that object.
       *
       * @return {*}
       *    The localized value if found, `undefined` otherwise
       */
      localize: localize,

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      /**
       * For controls (such as a date-picker), we cannot anticipate all required language tags, as they may be
       * app-specific. The relaxed localize behaves like localize if an exact localization is available.
       * If not, the language tag is successively generalized by stripping off the rightmost sub-tags until a
       * localization is found.
       * Eventually, a fallback ('en') is used.
       *
       * @param {String} languageTag
       *    The languageTag to lookup a localization with.
       *    Maybe `undefined` if the value is not i18n (app does not use i18n)
       * @param {*} i18nValue
       *    A possibly internationalized value:
       *    - When passing a primitive value, it is returned as-is.
       *    - When passing an object, the `languageTag` is used as a key within that object.
       *
       * @return {*}
       *    The localized value if found, `undefined` otherwise
       */
      localizeRelaxed: localizeRelaxed,

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      /**
       * Encapsulate a given languageTag in a partially applied localize function.
       *
       * @param {String} languageTag
       *    The languageTag to lookup localizations with
       *
       * @return {Function<*,*>}
       *    A single-arg localize-Function, which always uses the given language-tag
       *    It also has a .format-method, which can be used as a shortcut to
       *    `text.format( localize( x ), args )`
       */
      localizer: localizer,

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      /**
       * Retrieve the language tag of the current locale from an i18n model object, such as used on the scope.
       *
       * @param {{locale: String, tags: Map<String, String}} i18n
       *    An internationalization model, with reference to the currently active locale and a map from
       *    locales to language tags.
       *
       * @return {String}
       *    The localized value if found, `undefined` otherwise
       */
      languageTagFromI18n: languageTagFromI18n

   };

} );
