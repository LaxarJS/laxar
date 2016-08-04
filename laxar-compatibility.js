/**
 * Copyright 2016 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */

/**
 * A modified version of LaxarJS v2 that helps to transition from a v1 to a v2 application.
 *
 * It behaves like LaxarJS v2.x, but adds exports for `configuration`, `i18n`, `log` and `storage`.
 * When each of these global exports is used by application code for the first time, a warning is logged.
 */
import { assert, bootstrap as laxarBootstrap, instances, object, string } from './laxar';
import { create as createBrowser } from './lib/runtime/browser';
import { create as createConfiguration } from './lib/runtime/configuration';
import { create as createLog, BLACKBOX, level } from './lib/logging/log';
import { create as createStorage } from './lib/runtime/storage';

const preBootstrapServices = createPreBootstrapServices();
services().log.warn(
   'Compatibility: LaxarJS is loaded in 1.x-compatibility mode. ' +
   'You should fix any deprecation warnings and then change your build to use regular laxarjs.'
);
const warningsShown = {};
let firstInstance;

export { assert, object, string, instances };
export const configuration = createFallback( 'configuration', 'axConfiguration' );
export const i18n = createFallback( 'i18n', 'axI18n' );
export const log = createFallback( 'log', 'axLog', BLACKBOX );
log.level = level;
export const storage = createFallback( 'storage', 'axStorage' );

//////////////////////////////////////////////////////////////////////////////////////////////////////////////

export function bootstrap( ...args ) {
   const result = laxarBootstrap( ...args );
   if( !firstInstance ) {
      const first = _ => _[ Object.keys( _ )[ 0 ] ];
      firstInstance = first( instances() );
   }
   else if( !jasmine ) {
      services().log.warn(
         'Compatibility: Trying to bootstrap multiple LaxarJS instances in compatibility mode may cause ' +
         'undefined behavior.'
      );
   }
   return result;
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////////

function services() {
   return firstInstance || preBootstrapServices;
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////////

function createFallback( apiName, injectionName, ...passArgs ) {
   const fallback = {};
   // eslint-disable-next-line guard-for-in
   for( const method in services()[ apiName ] ) {
      fallback[ method ] = proxy( method );
   }
   return fallback;

   function proxy( method ) {
      return ( ...args ) => {
         const service = services()[ apiName ];
         if( !warningsShown[ apiName ] ) {
            const message =
               `Deprecation: avoid using laxar.${apiName}: ` +
               `Use the ${injectionName} injection.`;
            services().log.warn( message, BLACKBOX );
            warningsShown[ apiName ] = true;
         }
         return service[ method ]( ...args, ...passArgs );
      };
   }
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////////

function createPreBootstrapServices() {
   const browser = createBrowser();
   const configuration = createConfiguration( window.laxar || {
      name: 'laxar-compatibility',
      logging: { threshold: 'DEBUG' }
   } );
   const i18n = createI18n( configuration );
   const log = createLog( configuration, browser );
   const storage = createStorage( configuration, browser );

   return {
      configuration,
      i18n,
      log,
      storage
   };
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * A copy of the LaxarJS v1.x axI18n service (not widget-aware).
 *
 * @param {Object} configuration
 *   A configuration instance for the `i18n.fallback`.
 *
 * @return {Object} the old `laxar.i18n`
 */
export function createI18n( configuration ) {

   const primitives = {
      string: true,
      number: true,
      boolean: true
   };

   // Shortcuts: it is assumed that this module is used heavily (or not at all).
   const format = string.format;
   const keys = Object.keys;

   const localize = localizeRelaxed;
   const normalize = memoize( languageTag => languageTag.toLowerCase().replace( /[-]/g, '_' ) );

   let fallbackTag;

   return {
      localize,
      localizeStrict,
      localizeRelaxed,
      localizer,
      languageTagFromI18n
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
      const value = i18nValue[ languageTag ];
      if( value !== undefined ) {
         return value;
      }

      const lookupKey = normalize( languageTag );
      const availableTags = keys( i18nValue );
      const n = availableTags.length;
      for( let i = 0; i < n; ++i ) {
         const t = availableTags[ i ];
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
    *    the localized value if found, the fallback (or `undefined`) otherwise
    */
   function localizeRelaxed( languageTag, i18nValue, optionalFallback ) {
      assert( languageTag ).hasType( String );
      if( !i18nValue || primitives[ typeof i18nValue ] ) {
         // Value is not i18n (app does not use it)
         return i18nValue;
      }

      const tagParts = languageTag ? languageTag.replace( /-/g, '_' ).split( '_' ) : [];
      while( tagParts.length > 0 ) {
         const currentLocaleTag = tagParts.join( '-' );
         const value = localizeStrict( currentLocaleTag, i18nValue );
         if( value !== undefined ) {
            return value;
         }
         tagParts.pop();
      }

      if( fallbackTag === undefined ) {
         fallbackTag = configuration.get( 'i18n.fallback' );
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

      // eslint-disable-next-line valid-jsdoc
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
         const formatString = localize( languageTag, i18nValue );
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
      const cache = {};
      return key => {
         let value = cache[ key ];
         if( value === undefined ) {
            value = f( key );
            cache[ key ] = value;
         }
         return value;
      };
   }

}
