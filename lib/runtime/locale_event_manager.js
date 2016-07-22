/**
 * Copyright 2016 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
import { deepClone } from '../utilities/object';

const senderOptions = { sender: 'AxPageController' };
const subscriberOptions = { subscriber: 'AxPageController' };

//////////////////////////////////////////////////////////////////////////////////////////////////////////////

// eslint-disable-next-line valid-jsdoc
/**
 * The LocaleManager initializes the locale(s) and implements changes to them.
 *
 * Before publishing the state of all configured locales, it listens to change requests, allowing
 * widgets and activities (such as a LocaleSwitcherWidget) to influence the state of locales before
 * the navigation is complete.
 */
export function create( eventBus, configuration ) {

   const exports = {
      initialize,
      subscribe,
      unsubscribe
   };

   const configLocales = configuration.get( 'i18n.locales', { 'default': 'en' } );
   let i18n;
   let initialized;
   let unsubscribeFromEventBus = () => {};

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function publish( locale ) {
      const event = { locale, languageTag: i18n[ locale ] };
      return eventBus.publish( `didChangeLocale.${locale}`, event, senderOptions );
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function initialize() {
      initialized = true;
      return Promise.all( Object.keys( configLocales ).map( publish ) );
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function unsubscribe() {
      unsubscribeFromEventBus();
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function subscribe() {
      i18n = deepClone( configLocales );
      initialized = false;

      unsubscribeFromEventBus = eventBus.subscribe( 'changeLocaleRequest', event => {
         i18n[ event.locale ] = event.languageTag;
         if( initialized ) {
            publish( event.locale );
         }
      }, subscriberOptions );
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   return exports;

}
