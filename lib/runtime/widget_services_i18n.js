import assert from '../utilities/assert';
import { path, setPath } from '../utilities/object';
import { format as stringFormat } from '../utilities/string';

const noDeliveryToSender = { deliverToSender: false };

const primitives = {
   string: true,
   number: true,
   boolean: true
};

const normalize = memoize( languageTag => languageTag.toLowerCase().replace( /[_]/g, '-' ) );

//////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Creates a widget-specific helper for `didChangeLocale` events.
 *
 * @param {Object} context
 *    the widget context/scope that the handler should work with. It uses the `eventBus` property there
 *    with which it can do the event handling. The i18n service may be asked to `track` more context
 *    properties `i18n`, an object that maps each locale to its current language tag.
 * @param {Object} [optionalOptions]
 *    the fallback language tag to use when no localization is available for a locale's current language tag
 * @param {String} [optionalOptions.fallback]
 *    the fallback language tag to use when no localization is available for a locale's current language tag
 * @param {Boolean} [optionalOptions.strict]
 *    if `true`, localizations are only used if there language tags exactly match the current locale's tag
 *    (after normalizing case and dash/underscore). If `false` (default), specific requests can be satisfied
 *    by general localizations (e.g. a translation for 'en' may be used when missing 'en_GB' was requested).
 *
 * @return {axI18n}
 *    a visibility handler instance
 */
export function create( context, optionalOptions = {} ) {

   const { features, eventBus } = context;
   const { fallback = 'en', strict = false } = optionalOptions;
   const handlers = {};
   const tags = {};
   const callbacks = {};

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   /**
    * Unsubscribes from the event bus, stopping all localization updates.
    *
    * @memberOf axI18n
    */
   const release = eventBus.subscribe( 'didChangeLocale', handleLocaleChange );

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   /**
    * @name {axI18n}
    */
   return {
      forFeature,
      release,
      ...forFeature( 'i18n' )
   };

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function forFeature( featurePath ) {
      assert( featurePath ).hasType( String ).isNotNull();
      if( handlers[ featurePath ] ) {
         return handlers[ featurePath ];
      }

      const localize = strict ? localizeStrict : localizeRelaxed;
      const api = {
         format,
         languageTag,
         localize,
         track,
         update,
         whenLocaleChanged
      };
      handlers[ featurePath ] = api;
      const locale = path( features, `${featurePath}.locale` );
      assert( locale ).hasType( String ).isNotNull(
         `axI18n: missing feature-configuration '${featurePath}.locale' (widget: ${context.widget.id})`
      );
      let trackingProperty;
      return handlers[ featurePath ];

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      function update( languageTag ) {
         return eventBus.publishAndGatherReplies( `changeLocaleRequest.${locale}`, {
            locale,
            languageTag
         }, noDeliveryToSender ).then( () => {
            tags[ locale ] = languageTag;
         } );
      }

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      function languageTag() {
         return tags[ locale ];
      }

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      function track( enabled = true, property = featurePath ) {
         trackingProperty = enabled ? property : null;
         if( enabled ) {
            setPath( context, trackingProperty, { locale, tags } );
         }
      }

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      /**
       * Format an i18n value, by first localizing it and then applying substitutions.
       *
       * These are equivalent:
       * - `string.format( axI18n.localize( i18nValue ), numericArgs, namedArgs )`
       * - `axI18n.format( i18nValue, numericArgs, namedArgs )`.
       *
       * @param {String} i18nValue
       *    the value to localize and then format
       * @param {Array} [optionalIndexedReplacements]
       *    replacements for any numeric placeholders in the localized value
       * @param {Object} [optionalNamedReplacements]
       *    replacements for any named placeholders in the localized value
       *
       * @return {String}
       *    the formatted string after localization
       *
       * @memberOf axI18n
       */
      function format( i18nValue, optionalIndexedReplacements, optionalNamedReplacements ) {
         const formatString = localize( i18nValue );
         return formatString && stringFormat(
            formatString, optionalIndexedReplacements, optionalNamedReplacements
         );
      }

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      function whenLocaleChanged( callback ) {
         callbacks[ locale ] = callbacks[ locale ] || [];
         callbacks[ locale ].push( callback );
      }

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      /**
       * For controls (such as a datepicker), we cannot anticipate all required language tags, as they may be
       * app-specific. The relaxed `localize` behaves like localize if an exact localization is available.
       * If not, the language tag is successively generalized by stripping off the rightmost sub-tags until a
       * localization is found. Eventually, a fallback (default: 'en') is used.
       *
       * @param {*} i18nValue
       *    a possibly internationalized value:
       *    - when passing a primitive value, it is returned as-is
       *    - when passing an object, the `languageTag` is used to look up a localization within that object
       * @param {*} [optionalFallbackValue]
       *    a value to use if no localization is available for the given language tag
       *
       * @return {*}
       *    the localized value if found, the fallback (or `undefined`) otherwise
       */
      function localizeRelaxed( i18nValue, optionalFallbackValue ) {
         if( !i18nValue || primitives[ typeof i18nValue ] ) {
            // value is not internationalized
            return i18nValue;
         }

         const tag = tags[ locale ];
         const tagParts = tag ? tag.replace( /-/g, '_' ).split( '_' ) : [];
         while( tagParts.length > 0 ) {
            const currentLocaleTag = tagParts.join( '-' );
            const value = localizeStrict( i18nValue, undefined, currentLocaleTag );
            if( value !== undefined ) {
               return value;
            }
            tagParts.pop();
         }

         return fallback ?
            localizeStrict( i18nValue, optionalFallbackValue, fallback ) :
            optionalFallbackValue;
      }

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      /**
       * Localize the given internationalized object using the given languageTag.
       *
       * @param {*} i18nValue
       *    a possibly internationalized value:
       *    - when passing a primitive value, it is returned as-is
       *    - when passing an object, the languageTag is used as a key within that object
       * @param {*} [optionalFallbackValue]
       *    a value to use if no localization is available for the given language tag
       * @param {String} [languageTag]
       *    a language tag to override the current locale tag
       *
       * @return {*}
       *    the localized value if found, the fallback (or `undefined`) otherwise
       */
      function localizeStrict( i18nValue, optionalFallbackValue, languageTag = tags[ locale ] ) {
         if( !i18nValue || primitives[ typeof i18nValue ] ) {
            // Value is not i18n
            return i18nValue;
         }
         if( !languageTag ) {
            return optionalFallbackValue;
         }

         // Try one direct lookup before scanning the input keys,
         // assuming that language-tags are written in consistent style.
         const value = i18nValue[ languageTag ];
         if( value !== undefined ) {
            return value;
         }

         const lookupKey = normalize( languageTag );
         const availableTags = Object.keys( i18nValue );
         const n = availableTags.length;
         for( let i = 0; i < n; ++i ) {
            const t = availableTags[ i ];
            if( normalize( t ) === lookupKey ) {
               return i18nValue[ t ];
            }
         }

         return optionalFallbackValue;
      }

   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function handleLocaleChange({ locale, languageTag }) {
      const newTag = normalize( languageTag );
      if( newTag === tags[ locale ] ) {
         return;
      }
      tags[ locale ] = newTag;
      callbacks[ locale ] = callbacks[ locale ] || [];
      callbacks[ locale ].forEach( f => { f( languageTag ); } );
   }

}

//////////////////////////////////////////////////////////////////////////////////////////////////////////////

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
