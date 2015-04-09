/**
 * Copyright 2014 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
define( [
   '../utilities/object'
], function( object ) {
   'use strict';

   var senderOptions = { sender: 'AxPageController' };
   var subscriberOptions = { subscriber: 'AxPageController' };

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   /**
    * The LocaleManager initializes the locale(s) and implements changes to them.
    *
    * Before publishing the state of all configured locales, it listens to change requests, allowing
    * widgets and activities (such as a LocaleSwitcherWidget) to influence the state of locales before
    * the navigation is complete.
    */
   function create( $q, eventBus, configuration ) {

      var exports = {
         initialize: initialize,
         subscribe: subscribe,
         unsubscribe: unsubscribe
      };

      var configLocales_ = configuration.get( 'i18n.locales' );
      var i18n;
      var initialized;

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      function handleRequest( event ) {
         i18n[ event.locale ] = event.languageTag;
         if( initialized ) {
            publish( event.locale );
         }
      }

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      function publish( locale ) {
         var event = { locale: locale, languageTag: i18n[ locale ] };
         return eventBus.publish( 'didChangeLocale.' + locale, event, senderOptions );
      }

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      function initialize() {
         initialized = true;
         return $q.all( Object.keys( configLocales_ ).map( publish ) );
      }

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      function unsubscribe() {
         eventBus.unsubscribe( handleRequest );
      }

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      function subscribe() {
         i18n = object.deepClone( configLocales_ );
         initialized = false;

         eventBus.subscribe( 'changeLocaleRequest', handleRequest, subscriberOptions );
      }

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      return exports;

   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   return create;

} );
