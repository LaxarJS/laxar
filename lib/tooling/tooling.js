/**
 * Copyright 2016 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
/**
 * Accepts and keeps laxarjs application data from various laxarjs services, and makes it available to
 * development tools.
 */

import assert from '../utilities/assert';
import { tabulate } from '../utilities/object';
import { create as createPagesTooling } from './pages';

// eslint-disable-next-line valid-jsdoc
/** Exposes inspection data from laxarjs services to development tools */
export function create( debugEventBus ) {

   const debugInfoQueue = [];
   let debugInfoCallback;
   let debugInfo;

   const instanceListeners = [];
   const itemListeners = {};

   const api = {
      get pages() {
         const value = createPagesTooling( api );
         Object.defineProperty( api, 'pages', { value } );
         return value;
      },

      whenDebugInfoAvailable,

      forItem,
      onChange( callback ) {
         instanceListeners.push( callback );
      },
      unsubscribe( callback ) {
         remove( instanceListeners, callback );
      },

      registerDebugInfo,
      registerItem
   };

   return api;

   function whenDebugInfoAvailable( callback ) {
      if( callback ) {
         if( debugInfo ) {
            callback( debugInfo );
         }
         else {
            debugInfoQueue.push( callback );
         }
      }

      if( debugInfoCallback && debugInfoQueue.length > 0 ) {
         debugInfoCallback( info => {
            debugInfo = info;
            debugInfoQueue.splice( 0 ).forEach( callback => { callback( debugInfo ); } );
         } );
         debugInfoCallback = null;
      }
   }

   function registerDebugInfo( debugInfo ) {
      if( typeof debugInfo === 'function' ) {
         debugInfoCallback = debugInfo;
      }
      else {
         debugInfoCallback = callback => { callback( debugInfo ); };
      }

      whenDebugInfoAvailable();
   }

   function forItem( { instance, item } ) {
      assert( itemListeners[ item ] )
         .isNotNull( `Unknown bootstrap item '${item}' in instance '${instance}'` );

      return {
         onChange( callback ) {
            itemListeners[ item ].push( callback );
         },
         unsubscribe( callback ) {
            remove( itemListeners[ item ], callback );
         }
      };
   }

   function registerItem( { instance, item } ) {
      const pending = [];

      const state = {
         flows: addLoadingStateHandler( 'flow', instance, item, pending, onChange ),
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
                  flows: getActiveItems( 'flows' ),
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

   function addLoadingStateHandler( type, instance, item, pending, onChange ) {
      const active = [];

      debugEventBus.subscribe( `willLoad.${type}.${instance}.${item}`, ( { [ type ]: ref } ) => {
         pending.push( `load.${type}.${ref}` );
      } );
      debugEventBus.subscribe( `didLoad.${type}.${instance}.${item}`, ( { [ type ]: ref } ) => {
         remove( pending, `load.${type}.${ref}` );
         active.push( ref );
         if( pending.length === 0 ) {
            onChange( ref );
         }
      } );
      debugEventBus.subscribe( `willUnload.${type}.${instance}.${item}`, ( { [ type ]: ref } ) => {
         pending.push( `unload.${type}.${ref}` );
      } );
      debugEventBus.subscribe( `didUnload.${type}.${instance}.${item}`, ( { [ type ]: ref } ) => {
         remove( pending, `unload.${type}.${ref}` );
         remove( active, ref );
         if( pending.length === 0 ) {
            onChange( ref );
         }
      } );

      return active;
   }

}

function remove( array, item ) {
   const index = array.indexOf( item );
   if( index >= 0 ) {
      array.splice( index, 1 );
   }
}
