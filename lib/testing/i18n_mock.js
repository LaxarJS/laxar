/**
 * Copyright 2016 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */

import { create as createMockConfiguration } from './configuration_mock';
import { create as createI18n } from '../i18n/i18n';

export function create( configuration = createMockConfiguration( { i18n: { fallback: 'en' } } ) ) {
   // since it is side-effect-free, we can use the original i18n for simulation
   const i18n = createI18n( configuration );
   [ 'localize', 'localizeStrict', 'localizeRelaxed', 'localizer', 'languageTagFromI18n' ]
      .forEach( method => {
         spyOn( i18n, method ).and.callThrough();
      } );
   return i18n;
}
