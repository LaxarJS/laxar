/**
 * Copyright 2016 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */

import { create as createAxI18n } from '../../runtime/widget_services_i18n';
import { create as createEventBusMock } from '../event_bus_mock';
import { create as createConfigurationMock } from '../configuration_mock';
import { create as createAxI18nMock } from '../widget_services_i18n_mock';

describe( 'An axI18n mock', () => {

   let eventBus;
   let axI18n;
   let axI18nMock;

   let i18nValue;

   beforeEach( () => {
      eventBus = createEventBusMock();
      const contextMock = {
         eventBus,
         features: {
            i18n: {
               locale: 'default'
            },
            alt: {
               locale: 'other'
            }
         },
         widget: {
            id: 'test-widget'
         }
      };
      const configurationMock = createConfigurationMock();
      axI18n = createAxI18n( contextMock, configurationMock );
      axI18nMock = createAxI18nMock( axI18n );
      i18nValue = { en: 'Hello [0]', it: 'Pronto [0]' };
   } );

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   describe( 'asked for a localization', () => {

      let result;

      beforeEach( () => {
         result = axI18nMock.localize( i18nValue );
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'uses the provided axI18n implementation', () => {
         expect( result ).toEqual( 'Hello [0]' );
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'spies on the provided i18n methods', () => {
         expect( axI18nMock.localize ).toHaveBeenCalledWith( i18nValue );
      } );

   } );

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   describe( 'asked for a localization using a non-default locale', () => {

      let result;

      beforeEach( () => {
         eventBus.publish( 'didChangeLocale.other', {
            locale: 'other',
            languageTag: 'it'
         } );
         eventBus.flush();
         result = axI18nMock.forFeature( 'alt' ).localize( i18nValue );
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'uses the provided axI18n implementation', () => {
         expect( result ).toEqual( 'Pronto [0]' );
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'spies on the provided i18n methods', () => {
         expect( axI18nMock.forFeature( 'alt' ).localize ).toHaveBeenCalledWith( i18nValue );
      } );

   } );

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   describe( 'when the locale has been changed', () => {

      let result;

      beforeEach( () => {
         eventBus.publish( 'didChangeLocale.default', {
            locale: 'default',
            languageTag: 'it'
         } );
         eventBus.flush();
         result = axI18nMock.format( i18nValue, [ 'Segnor' ] );
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'reflects the updated axI18n state', () => {
         expect( result ).toEqual( 'Pronto Segnor' );
      } );

   } );

} );
