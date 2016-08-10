/**
 * Copyright 2016 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */

/**
 * Allows to instantiate a mock implementation of {@link AxI18n}, compatible to "axI18n" injection.
 *
 * @module i18n_mock
 */

/**
 * Creates a mock for the "axI18n" injection of a widget.
 *
 * The mock needs to be backed by an actual i18n implementation. In widget tests, the provided implementation
 * should usually use the same context as the rest of the widget test. Feature-specific locales constructed
 * multiple times using the `forFeature` method will retain their spies over time, as long as the same mock
 * object is used.
 *
 * @param {AxI18n} i18n
 *    a specific backing {@link AxI18n} instance to return localizations from
 *
 * @return {AxI18n}
 *    a mock of `axI18n` that can be spied upon and/or mocked with additional items
 */
export function create( i18n ) {

   // feature instances are re-used for spies to work across `forFeature` calls
   const byFeature = {};

   const api = {
      forFeature,
      release: i18n.release,
      ...forFeature( 'i18n' )
   };

   spyOn( api, 'release' ).and.callThrough();

   return api;

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function forFeature( path ) {
      if( !( path in byFeature ) ) {
         const i18nForFeature = i18n.forFeature( path );
         Object.keys( i18nForFeature ).forEach( method => {
            spyOn( i18nForFeature, method ).and.callThrough();
         } );
         byFeature[ path ] = i18nForFeature;
      }
      return byFeature[ path ];
   }

}
