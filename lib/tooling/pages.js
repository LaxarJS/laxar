/**
 * Copyright 2016 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
import { deepClone } from '../utilities/object';

/** Use to access the flattened page model, where compositions have been expanded. */
export const FLAT = 'FLAT';
/** Use to access the compact page/composition model, where compositions have not been expanded. */
export const COMPACT = 'COMPACT';


export function createProvider( collector ) {

   return {

      /** Start collecting page/composition data. */
      enable() {
         collector.enable();
      },

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      /** Stop collecting page/composition data and clean up. */
      disable() {
         collector.disable();
      },

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

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
      current() {
         return collector.current();
      },

      /**
       * Add a listener function to be notified whenever the page information changes.
       * As a side-effect, this also automatically enables collecting page/composition data.
       * Each listener will be delivered its own copy of the page information.
       *
       * @param {Function}
       *   The listener to add. Will be called with the current page information whenever that changes.
       */
      addListener( _ ) {
         collector.addListener( _ );
      },

      /**
       * Remove a page information listener function.
       *
       * @param {Function}
       *   The listener to remove
       */
      removeListener( _ ) {
         collector.removeListener( _ );
      }

   };

};

export function createCollector( configuration, log ) {

   let enabled = configuration.get( 'tooling.enabled', false );

   let listeners = [];

   const currentPageInfo = {
      pageReference: null,
      pageDefinitions: {},
      compositionDefinitions: {},
      widgetDescriptors: {}
   };

   return {

      /** Collect a widget descriptor. */
      collectWidgetDescriptor( ref, descriptor ) {
         if( !enabled ) { return; }
         currentPageInfo.widgetDescriptors[ ref ] = descriptor;
      },

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      /**
       * Collect a page definition.
       * The page is deep-copied right away, and may safely be modified by the caller.
       */
      collectPageDefinition( ref, page, type ) {
         if( !enabled ) { return; }
         const definitions = currentPageInfo.pageDefinitions;
         definitions[ ref ] = definitions[ ref ] || {
            FLAT: null,
            COMPACT: null
         };
         definitions[ ref ][ type ] = deepClone( page );
      },

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      /**
       * Collect a composition definition.
       * The composition is deep-copied right away, and may safely be modified by the caller.
       */
      collectCompositionDefinition( pageRef, compositionInstanceId, composition, type ) {
         if( !enabled ) { return; }
         const definitions = currentPageInfo.compositionDefinitions;
         const definitionsByInstance = definitions[ pageRef ] = definitions[ pageRef ] || {};
         definitionsByInstance[ compositionInstanceId ] = definitionsByInstance[ compositionInstanceId ] || {
            FLAT: null,
            COMPACT: null
         };
         definitionsByInstance[ compositionInstanceId ][ type ] = deepClone( composition );
      },

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      /**
       * Collect information about the current page, and inform all listeners.
       * Each listener will receive its own copy of the page information.
       */
      collectCurrentPage( ref ) {
         if( !enabled ) { return; }
         currentPageInfo.pageReference = ref;
         listeners.forEach( function( listener ) {
            listener( deepClone( currentPageInfo ) );
         } );
         cleanup();
      },

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      enable() {
         enabled = true;
      },

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      disable() {
         enabled = false;
         currentPageInfo.pageReference = null;
         currentPageInfo.widgetDescriptors = {};
         cleanup();
      },

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      addListener( listener ) {
         enabled = true;
         listeners.push( listener );
      },

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      removeListener( listener ) {
         listeners = listeners.filter( function( _ ) {
            return _ !== listener;
         } );
      },

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      current() {
         if( !enabled ) {
            log.warn( 'laxar page tooling: trying to access data, but collecting it was never enabled' );
         }
         return deepClone( currentPageInfo );
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

}
