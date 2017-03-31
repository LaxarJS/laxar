/**
 * Copyright 2016 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
/**
 * Accepts and keeps laxarjs application data from various laxarjs services, and makes it available to
 * development tools.
 *
 * This module has an internal API (the `collectors`-service), and an external API (the `providers` service).
 * The collectors service is fed data by the other laxarjs services, while the provider allows external
 * listeners to subscribe to that data's changes, or to retrieve snapshots of it.
 */

//import assert from '../utilities/assert';
import { create as createPagesTooling } from './pages';

// eslint-disable-next-line valid-jsdoc
/** Exposes inspection data from laxarjs services to development tools */
export function create( debugEventBus ) {

   const debugInfoQueue = [];
   let debugInfoCallback;
   let debugInfo;

   const instanceState = {
      flows: [
         // active flow definitions?
      ],
      pages: [
         // active page definitions?
      ],
      widgets: [
         // active widget instances?
      ]
   };

   const api = {
      get pages() {
         const value = createPagesTooling( api, debugEventBus );
         Object.defineProperty( api, 'pages', { value } );
         return value;
      },

      instanceState,

      whenDebugInfoAvailable,
      setupForInstance( debugInfo, instanceContext ) {
         addLoadingStateHandler( 'page', instanceContext.instance, instanceState.pages );
         addLoadingStateHandler( 'flow', instanceContext.instance, instanceState.flows );

         registerDebugInfo( debugInfo );
      }
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

   function addLoadingStateHandler( type, instance, array ) {
      debugEventBus.subscribe( `didLoad.${type}.${instance}`, ( { [ type ]: ref } ) => {
         array.push( ref );
      } );
      debugEventBus.subscribe( `didUnload.${type}.${instance}`, ( { [ type ]: ref } ) => {
         const index = array.indexOf( ref );
         if( index >= 0 ) {
            array.splice( index, 1 );
         }
      } );
   }

}
