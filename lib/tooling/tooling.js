/**
 * Copyright 2016 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
/**
 * Accepts and keeps laxarjs application data from various laxarjs services, and makes it available to
 * development tools.
 *
 * @module tooling
 */

import assert from '../utilities/assert';
import { tabulate } from '../utilities/object';
import { create as createPagesTooling } from './pages';

// eslint-disable-next-line valid-jsdoc
/** Exposes inspection data from laxarjs services to development tools */
export function create( debugEventBus, log ) {

   const debugInfoQueue = [];
   let loadDebugInfo;
   let debugInfo;

   const instanceListeners = [];
   const itemListeners = {};

   let pagesTooling;

   const api = {
      get pages() {
         if( !pagesTooling ) {
            pagesTooling = createPagesTooling( api );
         }

         return pagesTooling;
      },

      forItem,
      ...createToolingApi( instanceListeners ),

      registerDebugInfo,
      registerItem
   };

   return api;

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function forItem( { instance, item } ) {
      assert.state( item in itemListeners, `Unknown bootstrap item '${item}' in instance '${instance}'` );
      return createToolingApi( itemListeners[ item ] );
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

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
               // debug info was requested in production build
               log.info( debugInfo.info );
            }
            else {
               debugInfoQueue.splice( 0 ).forEach( callback => { callback( debugInfo ); } );
            }
         } );
         loadDebugInfo = null;
      }
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   /**
    * Register a debug info object or callback with the tooling instance.
    *
    * @param {Object|Function} debugInfo
    *    Debug information as created by `laxar-loader/debug-info`. May be a function
    *    accepting a callback. If debug information is needed, the function will be called
    *    to load it asynchronously.
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
    * @param {ItemMeta} object
    *    
    */
   function registerItem( { instance, item } ) {
      const pending = [];

      const state = {
         pages: addLoadingStateHandler( 'page', instance, item, pending, onChange ),
         widgets: addLoadingStateHandler( 'widget', instance, item, pending, onChange )
      };

      itemListeners[ item ] = [];

      function onChange() {
         if( instanceListeners.length > 0 || itemListeners[ item ].length > 0 ) {
            whenDebugInfoAvailable( debugInfo => {
               const event = {
                  instance,
                  item,
                  pages: getActiveItems( 'pages' ),
                  widgets: getActiveItems( 'widgets' )
               };

               instanceListeners.forEach( callListener );
               itemListeners[ item ].forEach( callListener );

               function getActiveItems( key ) {
                  return tabulate( ref => {
                     const index = debugInfo.aliases[ key ][ ref ];
                     const value = debugInfo[ key ][ index ];
                     return value;
                  }, state[ key ] );
               }

               function callListener( listener ) {
                  listener( event );
               }
            } );
         }
      }
   }

   //slashes

   /**
    * Create debugEventBus subscriptions for the load events related to
    * the given type of artifact and scoped to the given instance and item.
    *
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

}

function createToolingApi( listeners ) {
   assert( listeners ).hasType( Array );
   return {
      onChange( callback ) {
         listeners.push( callback );
      },
      unsubscribe( callback ) {
         remove( listeners, callback );
      }
   };
}

function remove( array, item ) {
   const index = array.indexOf( item );
   if( index >= 0 ) {
      array.splice( index, 1 );
   }
}
