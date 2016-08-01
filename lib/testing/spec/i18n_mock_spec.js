/**
 * Copyright 2016 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
import { create as createI18nMock } from '../i18n_mock';
import { create as createConfigurationMock } from '../configuration_mock';

describe( 'An i18n mock', () => {

   let i18nMock;

   describe( 'created without custom configuration', () => {

      beforeEach( () => {
         i18nMock = createI18nMock();
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'provides i18n-methods', () => {
         expect( i18nMock.localize ).toEqual( jasmine.any( Function ) );
         expect( i18nMock.localizeRelaxed ).toEqual( jasmine.any( Function ) );
         expect( i18nMock.localizeStrict ).toEqual( jasmine.any( Function ) );
         expect( i18nMock.localizer ).toEqual( jasmine.any( Function ) );
         expect( i18nMock.languageTagFromI18n ).toEqual( jasmine.any( Function ) );
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      describe( 'asked for localizations', () => {

         let localizeResult;
         let localizeResultUsingFallback;
         let deVariantLocalizerResult;

         beforeEach( () => {
            localizeResult = i18nMock.localize( 'en_US', { en: 'EN', de: 'DE', en_US: 'EN_US' } );
            localizeResultUsingFallback = i18nMock.localize( 'fr', { en: 'EN', de: 'DE' } );
            deVariantLocalizerResult = i18nMock.localizer( 'de_CH' );
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'spies on the provided i18n-methods', () => {
            expect( i18nMock.localize ).toHaveBeenCalled();
            expect( i18nMock.localizer ).toHaveBeenCalled();
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'passes through to the actual i18 module, using the default fallback language (en)', () => {
            expect( localizeResult ).toEqual( 'EN_US' );
            expect( localizeResultUsingFallback ).toEqual( 'EN' );
            expect( deVariantLocalizerResult( { 'en': 'hello', 'de': 'Hallo' } ) ).toEqual( 'Hallo' );
         } );

      } );

   } );

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   describe( 'created from custom configuration', () => {

      beforeEach( () => {
         i18nMock = createI18nMock( createConfigurationMock( { i18n: { fallback: 'de' } } ) );
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      describe( 'asked for localizations', () => {

         let localizeResultUsingFallback;

         beforeEach( () => {
            localizeResultUsingFallback = i18nMock.localize( 'fr', { en: 'EN', de: 'DE' } );
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'uses the custom configuration for the actual i18n module', () => {
            expect( localizeResultUsingFallback ).toEqual( 'DE' );
         } );

      } );

   } );

} );
