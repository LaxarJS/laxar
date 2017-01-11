/**
 * Copyright 2016 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */

/**
 * Factory for i18n widget service instances.
 *
 * @module widget_services_i18n
 */
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
 * The helper automatically observes the any changes to the locale that was configured under the `i18n`
 * feature, and can be asked for localization based on that locale. It also allows to `track` the current
 * language tag for all observed locale topics under the object `i18n.tags`. This object can be used to set
 * up value bindings and/or watchers so that other components may react to locale-changes in a data-driven
 * way.
 *
 * The i18n helper is an {@link AxI18nHandler} for the feauture "i18n" by default, but allows to create
 * handlers for other feature-paths using the `forFeature` method.
 * Using `release`, it is possible to free the eventBus subscription held by an i18n helper instance and by
 * all feature-handlers created by it.
 *
 * @param {AxContext} context
 *    the widget context/scope that the handler should work with. It uses the `eventBus` property there
 *    with which it can do the event handling
 * @param {Object} [optionalOptions]
 *    the fallback language tag to use when no localization is available for a locale's current language tag
 * @param {String} [optionalOptions.fallback]
 *    the fallback language tag to use when no localization is available for a locale's current language tag
 * @param {Boolean} [optionalOptions.strict]
 *    if `true`, localizations are only used if the language tags exactly match the current locale's tag
 *    (after normalizing case and dash/underscore). If `false` (default), specific requests can be satisfied
 *    by general localizations (e.g. a translation for 'en' may be used when missing 'en_GB' was requested).
 *
 * @return {AxI18n}
 *    an i18n instance
 */
export function create( context, optionalOptions = {} ) {

   const { features, eventBus } = context;
   const { fallback = 'en', strict = false } = optionalOptions;
   const handlers = {};
   const tags = {};
   const callbacks = {};

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   const release = eventBus.subscribe( 'didChangeLocale', handleLocaleChange );

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   /**
    * An i18n instance allows to create {@link #AxI18nHandler} instances for any feature, but is itself also
    * an i18n handler for the feature `i18n`.
    * So if the widget using the {@link widget_services#axI18n axI18n} injection uses the recommended
    * name `i18n` for the localization feature, use this directly with the i18n handler API.
    *
    * @constructor
    * @name AxI18n
    */
   return {
      forFeature,
      release,
      ...forFeature( 'i18n' )
   };

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   /**
    * Creates and returns an i18n handler for the loclization configuration under the given
    * [feature path](../glossary#feature-path).
    * The configuration value is expected to be an object with the key `locale` that is configured with the
    * locale to use in the widget instance.
    *
    * @param {String} featurePath
    *    the feature path localization configuration can be found at
    *
    * @return {AxI18nHandler}
    *    the i18n handler for the given feature path
    *
    * @memberof AxI18n
    */
   function forFeature( featurePath ) {
      assert( featurePath ).hasType( String ).isNotNull();
      if( handlers[ featurePath ] ) {
         return handlers[ featurePath ];
      }

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      /**
       * @constructor
       * @name AxI18nHandler
       */
      const api = {
         format,
         languageTag,

         /**
          * Localize the given internationalized object using the given languageTag.
          *
          * If i18n is configured to be _strict_, the currently active language tag is used to lookup a
          * translation.
          * If nothing is found, the `languageTag` argument is tried.
          * If still nothing is found, `undefined` is returned.
          *
          * In the case _strict_ is set to `false`, the behavior is the same as in _strict_ mode if an exact
          * localization is available.
          * If not, the language tag is successively generalized by stripping off the rightmost sub-tags
          * until a localization is found.
          * Eventually, a fallback (default: 'en') is used.
          * This behavior is especially useful for controls (such as a datepicker), where we cannot
          * anticipate all required language tags, as they may be app-specific.
          *
          * @param {*} i18nValue
          *    a possibly internationalized value:
          *    - when passing a primitive value, it is returned as-is
          *    - when passing an object, the languageTag is used as a key within that object
          * @param {*} [optionalFallbackValue]
          *    a value to use if no localization is available for the given language tag
          * @param {String} [languageTag]
          *    a language tag to override the current locale tag. Only available in _strict_ mode
          *
          * @return {*}
          *    the localized value if found, the fallback (or `undefined`) otherwise
          *
          * @memberof AxI18nHandler
          * @name localize
          */
         localize: strict ? localizeStrict : localizeRelaxed,
         track,
         update,
         whenLocaleChanged
      };
      handlers[ featurePath ] = api;
      const locale = path( features, `${featurePath}.locale` );
      assert( locale ).hasType( String ).isNotNull(
         `axI18n: missing feature-configuration '${featurePath}.locale' (widget: ${context.widget.id})`
      );
      return api;

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      /**
       * Updates the language tag for the configured locale by emitting the according `changeLocaleRequest`
       * event.
       *
       * @param {String} languageTag
       *    the language tag to propagate
       *
       * @return {Promise}
       *    the promise of the event cycle
       *
       * @memberof AxI18nHandler
       */
      function update( languageTag ) {
         return eventBus.publishAndGatherReplies( `changeLocaleRequest.${locale}`, {
            locale,
            languageTag
         }, noDeliveryToSender ).then( () => {
            tags[ locale ] = languageTag;
         } );
      }

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      /**
       * Returns the language tag set for the configured locale.
       * If no tag is available, `undefined` is returned.
       *
       * @return {String}
       *    the active language tag or `undefined`
       *
       * @memberof AxI18nHandler
       */
      function languageTag() {
         return tags[ locale ];
      }

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      /**
       * References the current i18n state as an object under the given property of the context.
       *
       * If this method is not used, changes to the locale are still observed by the handler, but not
       * tracked on the context object. Use this to react to locale-changes in a data-driven fashion, for
       * example by using an AngularJS watcher.
       *
       * By default, the i18n state is stored under the feature path used to create this i18n handler ("i18n"
       * for the default handler provided by the "axI18n" widget service injection).
       *
       * The tracking structure stored under the property is an object that has two properties:
       *
       *   - `locale` is the constant locale topic that was configured for the tracked feature
       *   - `tags` is an object mapping all locale names to their normalized current language tag
       *
       * Note that tracked language tags are *normalized*, i.e. converted to lowercase with underscores (`_`)
       * replaced by dashes (`-`).
       *
       * @param {*} [property=featurePath]
       *    name of the context property to store the state under, defaults to the feature path
       *
       * @memberof AxI18nHandler
       */
      function track( property = featurePath ) {
         setPath( context, property, { locale, tags } );
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
       * @memberof AxI18nHandler
       */
      function format( i18nValue, optionalIndexedReplacements, optionalNamedReplacements ) {
         const formatString = api.localize( i18nValue );
         return formatString && stringFormat(
            formatString, optionalIndexedReplacements, optionalNamedReplacements
         );
      }

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      /**
       * Registers a callback that is called whenever the new valid locale was received via event.
       *
       * @param {Function} callback
       *    the function to call on locale change
       *
       * @memberof AxI18nHandler
       */
      function whenLocaleChanged( callback ) {
         callbacks[ locale ] = callbacks[ locale ] || [];
         callbacks[ locale ].push( callback );
      }

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

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
