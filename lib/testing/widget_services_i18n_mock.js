/**
 * Copyright 2016 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */

import { path } from '../utilities/object';
import { create as createAxI18n } from '../runtime/widget_services_i18n';
import { create as createAxEventBusMock } from './event_bus_mock';
import { create as createAxConfigurationMock } from './configuration_mock';

/**
 * Allows to instantiate a mock implementation of {@link AxI18n}, compatible to "axI18n" injection.
 *
 * @module i18n_mock
 */

/**
 * Creates a mock for the "axI18n" injection of a widget.
 *
 * Custom language tags for locales may be passed on creation, or changed using `mockUpdateLocale`.
 * Alternatively, pass an AxContext instance to control the feature configuration and/or control the
 * locale state using events. This is for use by widget test-beds (e.g. LaxarJS Mocks) to connect the i18n
 * mock to the same event bus and feature configuration as the rest of the test.
 *
 * @param {Object} [tagsByLocale]
 *    starting locales with language tag(s) for which to simulate `didChangeLocale`. Use this to test
 *    controls (where using the event bus is out-of-scope)
 * @param {AxContext} [context]
 *    a context with features and/or eventBus to use. By default (or when set to an empty object), a mock
 *    eventBus will be used, and a widget with ID "test-widget" will be assumed, with its feature
 *    configuration `"i18n.locale"` set to `"default"`
 * @param {AxConfiguration} [configuration]
 *    pass a (mock) configuration to control the fallback language tag ("en" by default), using the
 *    configuration key `i18n.locales.default`
 *
 * @return {AxI18n}
 *    a mock of `axI18n` with preconfigured jasmine spies, plus the `mockUpdateLocale` method
 */
export function create( tagsByLocale = {}, context = {}, configuration ) {

   const {
      features = { i18n: { locale: 'default' } },
      eventBus = createAxEventBusMock(),
      widget = { id: 'test-widget' }
   } = context;
   const i18n = createAxI18n( { features, eventBus, widget }, configuration || createAxConfigurationMock() );

   // feature instances are re-used for spies to work across `forFeature` calls
   const byFeature = {};

   const api = {
      forFeature,
      release: i18n.release,
      ...forFeature( 'i18n' )
   };

   spyOn( api, 'release' ).and.callThrough();

   Object.keys( tagsByLocale ).forEach( locale => {
      const languageTag = tagsByLocale[ locale ];
      eventBus.publish( `didChangeLocale.${locale}`, { locale, languageTag } );
      if( eventBus.flush ) {
         eventBus.flush();
      }
   } );

   return api;

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function forFeature( featurePath ) {
      if( !( featurePath in byFeature ) ) {
         const i18nForFeature = i18n.forFeature( featurePath );
         Object.keys( i18nForFeature ).forEach( method => {
            spyOn( i18nForFeature, method ).and.callThrough();
         } );
         i18nForFeature.mockUpdateLocale = languageTag => {
            const locale = path( features, `${featurePath}.locale` );
            eventBus.publish( `didChangeLocale.${locale}`, { locale, languageTag } );
            if( eventBus.flush ) {
               eventBus.flush();
            }
         };
         byFeature[ featurePath ] = i18nForFeature;
      }
      return byFeature[ featurePath ];
   }

}
