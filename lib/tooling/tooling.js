/**
 * Copyright 2016 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
/**
 * Accepts and keeps laxarjs application data from various laxarjs services, and makes it available to
 * development tools.
 *
 * This module has an internal API (the `collectors`-service), and an external API (the `provitemers` service).
 * The collectors service is fed data by the other laxarjs services, while the provitemer allows external
 * listeners to subscribe to that data's changes, or to retrieve snapshots of it.
 */

import assert from '../utilities/assert';
import { create as createPagesTooling } from './pages';

const TYPE_TO_KEY = {
   flow: 'flows',
   page: 'pages',
   widget: 'widgets'
};

// eslint-disable-next-line valitem-jsdoc
/** Exposes inspection data from laxarjs services to development tools */
export function create( debugEventBus ) {

   const debugInfoQueue = [];
   let debugInfoCallback;
   let debugInfo;

   const listeners = [];
   const states = {
      // [ item item ]: { listeners: [], flows: [], pages: [], widgets: [] }
   };

   const api = {
      get pages() {
         const value = createPagesTooling( api );
         Object.defineProperty( api, 'pages', { value } );
         return value;
      },

      whenDebugInfoAvailable,

      forItem,
      onChange( callback ) {
         listeners.push( callback );
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
      assert( states[ item ] ).isNotNull( `Unknown bootstrap item '${item}' in instance '${instance}'` )

      const state = states[ item ];
      const { listeners } = state;

      return {
         onChange( callback ) {
            listeners.push( callback );
         }
      };
   }

   function registerItem( { instance, item } ) {
      const state = ( states[ item ] = { listeners: [] } );

      addLoadingStateHandler( 'flow', instance, item, state );
      addLoadingStateHandler( 'page', instance, item, state );
      //addLoadingStateHandler( 'widget', instance, item, state );
   }

   function addLoadingStateHandler( type, instance, item, state ) {
      const key = TYPE_TO_KEY[ type ];
      const active = state[ key ] = [];

      // TODO: listen to willUnload, willLoad, to bundle change events
      debugEventBus.subscribe( `didLoad.${type}.${instance}.${item}`, ( { [ type ]: ref } ) => {
         active.push( ref );
         onChange( ref );
      } );
      debugEventBus.subscribe( `didUnload.${type}.${instance}.${item}`, ( { [ type ]: ref } ) => {
         const index = active.indexOf( ref );
         if( index >= 0 ) {
            active.splice( index, 1 );
         }
      } );


      function onChange( ref ) {
         if( listeners.length > 0 || state.listeners.length > 0 ) {
            whenDebugInfoAvailable( debugInfo => {
               const index = debugInfo.aliases[ key ][ ref ];
               const data = debugInfo[ key ][ index ];

               listeners.forEach( callListener );
               state.listeners.forEach( callListener );

               function callListener( listener ) {
                  listener( {
                     type,
                     instance,
                     item,
                     [ type ]: ref,
                     data
                  } );
               }
            } );
         }
      }
   }

}
