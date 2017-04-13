/**
 * Copyright 2016 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
/**
 * Accepts static debug information from `laxar-loader/debug-info` and listens on the debug event bus to
 * supply development tools with the current state of the LaxarJS instance and bootstrapping items:
 *
 * @module tooling
 */

import assert from '../utilities/assert';
import { tabulate } from '../utilities/object';
import { create as createPagesTooling } from './pages';

// eslint-disable-next-line valid-jsdoc
/** Exposes inspection data from laxarjs services to development tools */
export function create( debugEventBus, log ) {

   const debugInfoQueue = []; // a list of callbacks waiting for whenDebugInfoAvailable()
   let loadDebugInfo; // the debug info loader registered with registerDebugInfo()
   let debugInfo; // the actual debug info object loaded by loadDebugInfo( debugInfo => {} )

   const instanceListeners = [];
   const itemListeners = {};

   /**
    * @constructor
    * @name AxTooling
    */
   const api = {
      forItem,
      ...createToolingApi( instanceListeners ),

      registerDebugInfo,
      registerItem
   };

   addPagesTooling( api );

   return api;

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   /**
    * Get an {@link #AxTooling} interface for the given bootstrapping item.
    *
    * @param {ItemMeta} itemMeta
    *    an object identifying the bootstrapping item
    * @return {AxTooling}
    *    a tooling API for the given bootstrapping item
    * @memberof AxTooling
    */
   function forItem( { instance, item } ) {
      const key = `${instance}.${item}`;
      assert.state( key in itemListeners, `Unknown bootstrap item '${item}' in instance '${instance}'` );

      const api = createToolingApi( itemListeners[ key ] );
      addPagesTooling( api );
      return api;
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   /**
    * Register a debug info object or callback with the tooling instance. Debug information can be generated
    * with `laxar-loader/debug-info` and may be in the form a function accepting a callback.
    * If debug information is needed, the function will be called to load it asynchronously.
    *
    * @param {Object|Function} debugInfo
    *    a debug information callback or object
    * @memberof AxTooling
    */
   function registerDebugInfo( debugInfo ) {
      if( typeof debugInfo === 'function' ) {
         loadDebugInfo = debugInfo;
      }
      else {
         loadDebugInfo = callback => { callback( debugInfo ); };
      }

      whenDebugInfoAvailable();
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   /**
    * Register a bootstrapping item with the tooling instance.
    *
    * @param {ItemMeta} itemMeta
    *    an object identifying the bootstrapping item
    * @memberof AxTooling
    */
   function registerItem( { instance, item } ) {
      const key = `${instance}.${item}`;
      const pending = [];

      const state = {
         pages: addLoadingStateHandler( 'page', instance, item, pending, onChange ),
         widgets: addLoadingStateHandler( 'widget', instance, item, pending, onChange )
      };

      itemListeners[ key ] = [];

      function onChange() {
         if( instanceListeners.length > 0 || itemListeners[ key ].length > 0 ) {
            whenDebugInfoAvailable( debugInfo => {
               const event = {
                  instance,
                  item,
                  pages: getActiveItems( 'pages', state.pages ),
                  widgets: getActiveItems( 'widgets', state.widgets )
               };

               instanceListeners.forEach( callListener );
               itemListeners[ key ].forEach( callListener );

               function getActiveItems( category, refs ) {
                  if( !debugInfo.aliases ) {
                     return {};
                  }

                  return tabulate( ref => {
                     const index = debugInfo.aliases[ category ][ ref ];
                     if( index === undefined ) {
                        const message = `${ref} not present in ${category} debug information`;
                        log.info( message );
                        return { info: message };
                     }
                     return debugInfo[ category ][ index ];
                  }, refs );
               }

               function callListener( listener ) {
                  listener( event );
               }
            } );
         }
      }
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   /**
    * Create debugEventBus subscriptions for the load events related to the given type of artifact and scoped
    * to the given instance and item.
    *
    * @param {String} type
    *    the type of load event (page, widget, etc.) to subscribe to
    * @param {String} instance
    *    the instance name
    * @param {String} item
    *    the bootstrapping item id
    * @param {Array} pending
    *    an array to use for managing pending events
    * @param {Function} onChange
    *    a function to call when a change occurred and there are no more pending events
    * @return {Array}
    *    an array that will be updated with the currently active items of the given type in the given
    *    bootstrapping item.
    * @private
    */
   function addLoadingStateHandler( type, instance, item, pending, onChange ) {
      const subtopic = `${type}.${instance}.${item}`;
      const active = [];

      const willLoad = `willLoad.${subtopic}`;
      const didLoad = `didLoad.${subtopic}`;
      const willUnload = `willUnload.${subtopic}`;
      const didUnload = `didUnload.${subtopic}`;

      debugEventBus.subscribe( willLoad, ( { [ type ]: ref } ) => {
         pending.push( `${didLoad}:${ref}` );
      } );
      debugEventBus.subscribe( didLoad, ( { [ type ]: ref } ) => {
         remove( pending, `${didLoad}:${ref}` );
         active.push( ref );
         if( pending.length === 0 ) {
            onChange();
         }
      } );
      debugEventBus.subscribe( willUnload, ( { [ type ]: ref } ) => {
         pending.push( `${didUnload}:${ref}` );
      } );
      debugEventBus.subscribe( didUnload, ( { [ type ]: ref } ) => {
         remove( pending, `${didUnload}:${ref}` );
         remove( active, ref );
         if( pending.length === 0 ) {
            onChange();
         }
      } );

      return active;
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   /**
    * Register a function to be called when debug info is available and trigger loading the debug information
    * if not present. If no callback was given, just re-check if the debug info was registered and possibly
    * handle queued callbacks.
    *
    * @param {Function} [callback]
    *    a function to be called with the debug information object
    * @private
    */
   function whenDebugInfoAvailable( callback ) {
      if( callback ) {
         if( debugInfo ) {
            callback( debugInfo );
         }
         else {
            debugInfoQueue.push( callback );
         }
      }

      if( loadDebugInfo && debugInfoQueue.length > 0 ) {
         loadDebugInfo( info => {
            debugInfo = info;
            if( debugInfo.info && !debugInfo.aliases ) {
               // debug info not available, but an informative message in .info
               log.info( debugInfo.info );
            }
            else {
               debugInfoQueue.splice( 0 ).forEach( callback => { callback( debugInfo ); } );
            }
         } );
         loadDebugInfo = null;
      }
   }

}

//////////////////////////////////////////////////////////////////////////////////////////////////////////////

function createToolingApi( listeners ) {
   assert( listeners ).hasType( Array );

   return {
      /**
       * Register a function to be called when the composition of active observed itemschanges.
       *
       * @param {Function} callback
       *    a function to call with updated debug information
       * @return {AxTooling}
       *    the tooling instance
       * @memberof AxTooling
       */
      onChange( callback ) {
         listeners.push( callback );
         return this;
      },

      /**
       * Unsubscribe a registered {@link #AxTooling.onChange} callback
       *
       * @param {Function} callback
       *    a function that was previously passed to {@link #AxTooling.onChange}
       * @return {AxTooling}
       *    the tooling instance
       * @memberof AxTooling
       */
      unsubscribe( callback ) {
         remove( listeners, callback );
         return this;
      },

      /**
       * A {@link PagesTooling} interface to the {@link AxTooling} instance.
       *
       * @type {PagesTooling}
       * @memberof AxTooling
       * @deprecated
       */
      pages: null,

      release: () => {}
   };
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Add a getter to create the old interface on demand.
 *
 * @param {AxTooling} api
 *    the tooling instance to enrich with the pages tooling
 * @private
 */
function addPagesTooling( api ) {
   let pagesTooling;
   Object.defineProperty( api, 'pages', {
      get() {
         if( !pagesTooling ) {
            pagesTooling = createPagesTooling( api );
            pagesTooling.enable();
            api.destroy = () => {
               pagesTooling.disable();
            };
         }
         return pagesTooling;
      }
   } );
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////////

function remove( array, item ) {
   const index = array.indexOf( item );
   if( index >= 0 ) {
      array.splice( index, 1 );
   }
}
