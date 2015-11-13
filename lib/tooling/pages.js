/**
 * Copyright 2015 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
define( [
   '../utilities/object'
], function( object ) {
   'use strict';

   var currentPageInfo = {
      pageReference: null,
      pageDefinitions: {},
      widgetDescriptors: {}
   };

   var listeners = [];

   return {
      /**
       * Access the current page information.
       * Everything is returned as a copy, so this object cannot be used to modify the host application.
       *
       * @return {Object}
       *   the current page information, with the following properties:
       *    - pageDefinitions {Object} the expanded page model for each page that was visited
       *    - widgetDescriptors {Object} the widget descriptor for each widget that was referenced
       *    - pageReference {String} the reference of the current page, for use against the page definitions
       */
      current: function() {
         return object.deepClone( currentPageInfo );
      },

      /**
       * Add a listener function to be notified whenever the page information changes.
       *
       * @param {Function}
       *   The listener to add. Will be called with the current page information whenever that changes.
       */
      addListener: function( listener ) {
         listeners.push( listener );
      },

      /**
       * Remove a page information listener function.
       *
       * @param {Function}
       *   The listener to remove
       */
      removeListener: function( listener ) {
         listeners = listeners.filter( function( _ ) {
            return _ !== listener;
         } );
      },

      /** @private */
      setWidgetDescriptor: function( ref, descriptor ) {
         currentPageInfo.widgetDescriptors[ ref ] = descriptor;
      },
      /** @private */
      setPageDefinition: function( ref, page ) {
         currentPageInfo.pageDefinitions[ ref ] = page;
      },
      /** @private */
      setCurrentPage: function( ref ) {
         currentPageInfo.pageReference = ref;
         listeners.forEach( function( listener ) {
            listener( object.deepClone( currentPageInfo ) );
         } );
      }
   };

} );
