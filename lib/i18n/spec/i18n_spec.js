/**
 * Copyright 2016 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
import * as i18n from '../i18n';
import * as object from '../../utilities/object';

const CONFIGURED_FALLBACK = 'en-US';
const INTERNAL_FALLBACK = 'en';

describe( 'An internationalization package ', () => {

   let i18nValue;
   let i18nFormat;
   const global = new Function( 'return this' )();

   beforeEach( () => {

      // TODO this since "get" is readonly since using es6 modules. This is obsolete as soon as
      // every module has to expose a create function for fresh creation and dependency injection
      object.setPath( global, 'i18n.fallback', CONFIGURED_FALLBACK );

      i18nValue = {
         'en-US': 'A value',
         de_DE: 'Ein Wert',
         en: 'A value'
      };

      i18nFormat = {
         'en-US': 'Howdy, [0]! [1] is a value.',
         de_DE: 'Guten Tag, [0]! [1] ist ein Wert.',
         en: 'Hello [0]! [1] is a value.'
      };
   } );

   afterEach( () => {
      delete global.laxar;
   } );

   ////////////////////////////////////////////////////////////////////////////////////////////////////////

   describe( 'when asked for a localization (localize)', () => {

      it( 'should localize a given internationalized value using the given language-tag', () => {
         expect( i18n.localize( 'de_DE', i18nValue ) ).toEqual( 'Ein Wert' );
         expect( i18n.localize( 'en_US', i18nValue ) ).toEqual( 'A value' );
         expect( i18n.localize( 'en', i18nValue ) ).toEqual( 'A value' );
      } );

      /////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'should not try to localize a given primitive non-internationalized value', () => {
         expect( i18n.localize( 'de_DE', 'Peter Berger' ) ).toEqual( 'Peter Berger' );
         expect( i18n.localize( 'en_US', 'Peter Berger' ) ).toEqual( 'Peter Berger' );
         expect( i18n.localize( 'en_US', 17 ) ).toEqual( 17 );
         expect( i18n.localize( 'XYZ', true ) ).toEqual( true );
      } );

      /////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'should return undefined when the requested localization is missing', () => {
         delete i18nValue[ CONFIGURED_FALLBACK ];
         delete i18nValue[ INTERNAL_FALLBACK ];

         expect( i18n.localize( 'XYZ', i18nValue ) ).toBeUndefined();
         expect( i18n.localize( 'de', i18nValue ) ).toBeUndefined();
         expect( i18n.localize( 'en_GB', [] ) ).toBeUndefined();
         expect( i18n.localize( 'en_GB', {} ) ).toBeUndefined();
      } );

      /////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'should fallback to a more general localization when the requested tag is missing', () => {
         expect( i18n.localize( 'en_GB', i18nValue ) ).toEqual( 'A value' );
         expect( i18n.localize( 'de_DE-xmine', i18nValue ) ).toEqual( 'Ein Wert' );
      } );

      /////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'should be case-insensitive when processing languageTags', () => {
         expect( i18n.localize( 'DE-de', i18nValue ) ).toEqual( 'Ein Wert' );
         expect( i18n.localize( 'EN_US', i18nValue ) ).toEqual( 'A value' );
         expect( i18n.localize( 'EN', i18nValue ) ).toEqual( 'A value' );

         const i18nValueUnconventional = {
            'EN-uS': 'A value',
            'DE_DE': 'Ein Wert',
            'En': 'A value'
         };

         expect( i18n.localize( 'DE-de', i18nValueUnconventional ) ).toEqual( 'Ein Wert' );
         expect( i18n.localize( 'EN_US', i18nValueUnconventional ) ).toEqual( 'A value' );
         expect( i18n.localize( 'EN', i18nValueUnconventional ) ).toEqual( 'A value' );

         expect( i18n.localize( 'EN-US', 17 ) ).toEqual( 17 );

         expect( i18n.localize( 'EN_GB', { 'enGb': Error, 'en-GB-': Error } ) ).toBeUndefined();
         expect( i18n.localize( 'de-DE',  { 'de': 'hey', 'de_DE': 'ho' } ) ).toEqual( 'ho' );
      } );

      /////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'fails if given a non-string languageTag', () => {

         function tester( languageTag ) {
            return () => { i18n.localize( languageTag, i18nValue ); };
         }

         expect( tester( {} ) ).toThrow();
         expect( tester( [] ) ).toThrow();
         expect( tester( true ) ).toThrow();
         expect( tester( 17 ) ).toThrow();
         expect( tester( { languageTag: 'de_DE' } ) ).toThrow();

         expect( tester( '' ) ).not.toThrow();

      } );

   } );

   ////////////////////////////////////////////////////////////////////////////////////////////////////////

   describe( 'when asked for a strict localization (localizeStrict)', () => {

      it( 'should return undefined when the requested localization is missing', () => {
         expect( i18n.localizeStrict( 'XYZ', i18nValue ) ).toBeUndefined();
         expect( i18n.localizeStrict( 'de', i18nValue ) ).toBeUndefined();
         expect( i18n.localizeStrict( 'en_GB', i18nValue ) ).toBeUndefined();
         expect( i18n.localizeStrict( 'en_GB', [] ) ).toBeUndefined();
         expect( i18n.localizeStrict( 'en_GB', {} ) ).toBeUndefined();
      } );

      it( 'should be case-insensitive when processing languageTags', () => {
         expect( i18n.localizeStrict( 'de-DE',  { 'de': Error, 'de_DE_etc': Error } ) ).toBeUndefined();
      } );

   } );

   ////////////////////////////////////////////////////////////////////////////////////////////////////////

   describe( 'when asked for a relaxed localization (localizeRelaxed)', () => {

      it( 'should localize a given internationalized value using the given language-tag', () => {
         expect( i18n.localizeRelaxed( 'de_DE', i18nValue ) ).toEqual( 'Ein Wert' );
         expect( i18n.localizeRelaxed( 'en_US', i18nValue ) ).toEqual( 'A value' );
         expect( i18n.localizeRelaxed( 'en', i18nValue ) ).toEqual( 'A value' );
      } );

      /////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'should not try to localize a given primitive non-internationalized value', () => {
         expect( i18n.localizeRelaxed( 'de_DE', 'Peter Berger' ) ).toEqual( 'Peter Berger' );
         expect( i18n.localizeRelaxed( 'en_US', 'Peter Berger' ) ).toEqual( 'Peter Berger' );
         expect( i18n.localizeRelaxed( 'en_US', 17 ) ).toEqual( 17 );
         expect( i18n.localizeRelaxed( 'XYZ', true ) ).toEqual( true );
      } );

      /////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'should return undefined when the requested localization is missing and no fallback is available', () => {
         expect( i18n.localizeRelaxed( 'en_GB', [] ) ).toBeUndefined();
         expect( i18n.localizeRelaxed( 'en_GB', {} ) ).toBeUndefined();
      } );

      /////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'should generalize the language tag as needed', () => {
         expect( i18n.localizeRelaxed( 'de_DE-meinestadt', i18nValue ) ).toEqual( 'Ein Wert' );
         expect( i18n.localizeRelaxed( 'en_US_cyrl', i18nValue ) ).toEqual( 'A value' );
         expect( i18n.localizeRelaxed( 'en-GB', i18nValue ) ).toEqual( 'A value' );
      } );

      /////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'should access the fallback locale as needed', () => {
         i18nValue[ CONFIGURED_FALLBACK ] = 'the default';
         // TODO this is necessary due to the statefulness of the i18n module. This is obsolete as soon as
         // every module has to expose a create function for fresh creation and dependency injection
         i18nValue[ INTERNAL_FALLBACK ] = i18nValue[ CONFIGURED_FALLBACK ];
         expect( i18n.localizeRelaxed( 'XYZ', i18nValue ) ).toEqual( 'the default' );
      } );

   } );

   ////////////////////////////////////////////////////////////////////////////////////////////////////////

   describe( 'when asked for a partially applied localization (localizer)', () => {

      it( 'should wrap the given language-tag in a partially applied function', () => {

         function tester( languageTag, i18nValue ) {
            return () => { i18n.localizer( languageTag )( i18nValue ); };
         }
         expect( tester( 'de_DE', i18nValue ) ).not.toThrow();

         expect( i18n.localizer( 'de_DE' )( i18nValue ) ).toEqual( 'Ein Wert' );
         expect( i18n.localizer( 'en_US' )( i18nValue ) ).toEqual( 'A value' );
         expect( i18n.localizer( 'en' )( i18nValue ) ).toEqual( 'A value' );
      } );

      /////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'should not apply the given language-tag on a primitive non-internationalized value', () => {
         expect( i18n.localizer( 'de_DE' )( 'Peter Berger' ) ).toEqual( 'Peter Berger' );
         expect( i18n.localizer( 'en_US' )( 'Peter Berger' ) ).toEqual( 'Peter Berger' );
         expect( i18n.localizer( 'en_US' )( 17 ) ).toEqual( 17 );
         expect( i18n.localizer( 'XYZ' )( true ) ).toEqual( true );
      } );

      /////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'fails if given a non-string languageTag', () => {
         function tester( languageTag, i18nValue ) {
            return () => { i18n.localizer( languageTag )( i18nValue ); };
         }

         expect( tester( {} ) ).toThrow();
         expect( tester( [] ) ).toThrow();
         expect( tester( true ) ).toThrow();
         expect( tester( 17 ) ).toThrow();
         expect( tester( { languageTag: 'de_De' } ) ).toThrow();

         expect( tester( '' ) ).not.toThrow();
      } );

      /////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'should apply any given substitutions to the localized value when asked to format it', () => {
         const enUs = i18n.localizer( 'en_US' );
         expect( enUs.format( i18nFormat, [ 'Joe', enUs( i18nValue ) ] ) )
            .toEqual( 'Howdy, Joe! A value is a value.' );
         const en = i18n.localizer( 'en' );
         expect( en.format( i18nFormat, [ 'Kevin', en( i18nValue ) ] ) )
            .toEqual( 'Hello Kevin! A value is a value.' );
         const deDe = i18n.localizer( 'de_de' );
         expect( deDe.format( i18nFormat, [ 'Hans', deDe( i18nValue ) ] ) )
            .toEqual( 'Guten Tag, Hans! Ein Wert ist ein Wert.' );
      } );

      /////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'should apply named substitutions when formatting a localized value', () => {
         const enUs = i18n.localizer( 'en_US' );
         expect( enUs.format( 'Hey [who], dont make it [how]', [], { who: 'Joe', how: 'good' } ) )
            .toEqual( 'Hey Joe, dont make it good' );
      } );

      /////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'should return undefined when there is no format string for the given languageTag', () => {
         delete i18nFormat[ CONFIGURED_FALLBACK ];
         delete i18nFormat[ 'en' ];

         const enGb = i18n.localizer( 'en_GB' );
         expect( enGb.format( i18nFormat, [ 'Giles', enGb( i18nValue ) ] ) ).toBeUndefined();
         const de = i18n.localizer( 'de' );
         expect( de.format( i18nFormat, [ 'Peter', de( i18nValue ) ] ) ).toBeUndefined();
         const deCh = i18n.localizer( 'de_CH' );
         expect( deCh.format( i18nFormat, [ 'Hans', deCh( i18nValue ) ] ) ).toBeUndefined();
      } );

      /////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'returns a simple serialized string for a non-string localized value', () => {
         const i18nInvalidFormat = {
            en_GB: 17,
            de: { 'i': 'am', 'no': 'format string' },
            de_CH: null
         };

         const enGb = i18n.localizer( 'en_GB' );
         expect( enGb.format( i18nInvalidFormat, [ 'Giles', 'a value' ] ) ).toEqual( '17' );
         const de = i18n.localizer( 'de' );
         expect( de.format( i18nInvalidFormat, [ 'Peter', 'ein Wert' ] ) ).toEqual( '[object Object]' );
         const deCh = i18n.localizer( 'de_CH' );
         expect( deCh.format( i18nInvalidFormat, [ 'Hans', 'ein Wert' ] ) ).toEqual( 'null' );
      } );

   } );

} );
