/**
 * Copyright 2016 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
import { deepClone } from '../utilities/object';
import log from '../logging/log';

let enabled = false;

const currentPageInfo = {
   pageReference: null,
   pageDefinitions: {},
   compositionDefinitions: {},
   widgetDescriptors: {}
};

let listeners = [];

export default {
   /** Use to access the flattened page model, where compositions have been expanded. */
   FLAT: 'FLAT',
   /** Use to access the compact page/composition model, where compositions have not been expanded. */
   COMPACT: 'COMPACT',

   /** Start collecting page/composition data. */
   enable: function() {
      enabled = true;
   },

   /** Stop collecting page/composition data and clean up. */
   disable: function() {
      enabled = false;
      currentPageInfo.pageReference = null;
      currentPageInfo.widgetDescriptors = {};
      cleanup();
   },

   /**
    * Access the current page information.
    * Everything is returned as a copy, sothis object cannot be used to modify the host application.
    *
    * @return {Object}
    *   the current page information, with the following properties:
    *    - `pageDefinitions` {Object}
    *       both the original as well as the expanded/flattened page model for each available page
    *    - `compositionDefinitions` {Object}
    *       both the original as well as the expanded/flattened composition model for each composition of
    *       any available page
    *    - `widgetDescriptors` {Object}
    *       the widget descriptor for each widget that was referenced
    *    - `pageReference` {String}
    *       the reference for the current page, to lookup page/composition definitions
    */
   current: function() {
      if( !enabled ) {
         log.warn( 'laxar page tooling: trying to access data, but collecting it was never enabled' );
      }
      return deepClone( currentPageInfo );
   },

   /**
    * Add a listener function to be notified whenever the page information changes.
    * As a side-effect, this also automatically enables collecting page/composition data.
    *
    * @param {Function}
    *   The listener to add. Will be called with the current page information whenever that changes.
    */
   addListener: function( listener ) {
      enabled = true;
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

   ////////////////////////////////////////////////////////////////////////////////////////////////////////

   /** @private */
   setWidgetDescriptor: function( ref, descriptor ) {
      if( !enabled ) { return; }
      currentPageInfo.widgetDescriptors[ ref ] = descriptor;
   },

   /** @private */
   setPageDefinition: function( ref, page, type ) {
      if( !enabled ) { return; }
      const definitions = currentPageInfo.pageDefinitions;
      definitions[ ref ] = definitions[ ref ] || {
         FLAT: null,
         COMPACT: null
      };
      definitions[ ref ][ type ] = deepClone( page );
   },

   /** @private */
   setCompositionDefinition: function( pageRef, compositionInstanceId, composition, type ) {
      if( !enabled ) { return; }
      const definitions = currentPageInfo.compositionDefinitions;
      const definitionsByInstance = definitions[ pageRef ] = definitions[ pageRef ] || {};
      definitionsByInstance[ compositionInstanceId ] = definitionsByInstance[ compositionInstanceId ] || {
         FLAT: null,
         COMPACT: null
      };
      definitionsByInstance[ compositionInstanceId ][ type ] = deepClone( composition );
   },

   /** @private */
   setCurrentPage: function( ref ) {
      if( !enabled ) { return; }
      currentPageInfo.pageReference = ref;
      listeners.forEach( function( listener ) {
         listener( deepClone( currentPageInfo ) );
      } );
      cleanup();
   }
};

///////////////////////////////////////////////////////////////////////////////////////////////////////////

function cleanup() {
   const currentRef = currentPageInfo.pageReference;
   [ 'pageDefinitions', 'compositionDefinitions' ]
      .forEach( function( collection ) {
         Object.keys( currentPageInfo[ collection ] )
            .filter( function( ref ) { return ref !== currentRef; } )
            .forEach( function( ref ) { delete currentPageInfo[ collection ][ ref ]; } );
      } );
}
