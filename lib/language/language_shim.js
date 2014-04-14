/**
 * Copyright 2014 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
define( [
   './lang',
   './message_loader'
], function( lang, messageLoader ) {
   'use strict';

   var eventBus_;

   // NEEDS FIX A: i18n: Remove this module
   /**
    * The old language-module, backed by the i18n-locale.
    *
    * This module provides the old 'Language'-Service, but uses the "default"-locale (if received per event).
    *
    * @deprecated Users should move to i18n, because
    *  - this module mixes handling of i18n- and html-content instead of treating them independently
    *    (i18n-input is interpreted as HTML, non-i18n-content is interpreted as plain text).
    *  - this module assumes that there is one global locale, and one global fallback
    *    (i18n allows to configure an arbitrary number of locales per event-subscriber).
    */
   return {
      init: function( Q, fileProvider, eventBus, startLocale ) {
         lang.setDefaultLocale( startLocale );
         messageLoader.init( Q, fileProvider );
         eventBus_ = eventBus;
         eventBus_.subscribe( 'didChangeLocale.default', function( event ) {
            lang.setDefaultLocale( event.languageTag );
         } );
         messageLoader.init( Q, fileProvider );
      },
      getHtmlText: lang.getHtmlText,
      getPlainText: lang.getPlainText,
      getDefaultLocale: lang.getDefaultLocale,
      setDefaultLocale: lang.setDefaultLocale,
      getLocaleFromString: lang.localeFromString,
      provideMessages: messageLoader.provideMessages
   };

} );