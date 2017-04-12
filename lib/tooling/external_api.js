/**
 * Copyright 2016 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */

import { options } from '../utilities/object';

/**
 * Creation of the tooling hooks can be provided by explicitly setting tooling.enabled
 * to `true`.
 */
export function create( { configuration, globalEventBus: eventBus, log, tooling } ) {
   const CLEAR_BUFFER_DELAY_MS = 5000;
   let lastAccess = null;
   let clearBufferInterval;

   tooling.pages.addListener( onPageChange );
   const bufferSize = configuration.get( 'tooling.bufferSize', 2500 );

   const developerHooks = window.laxarDeveloperToolsApi = ( window.laxarDeveloperToolsApi || {} );
   developerHooks.buffers = { events: [], log: [] } ;
   developerHooks.eventCounter = Date.now();
   developerHooks.logCounter = Date.now();
   developerHooks.pageInfo = tooling.pages.current();
   developerHooks.pageInfoVersion =  Date.now();
   developerHooks.gridSettings = configuration.get( 'tooling.grid', null );

   log.addLogChannel( logChannel );
   const cleanupInspector = eventBus.addInspector( inspector );

   window.addEventListener( 'beforeunload', () => {
      log.removeLogChannel( logChannel );
      cleanupInspector();
   } );

   ////////////////////////////////////////////////////////////////////////////////////////////////////////

   function logChannel( messageObject ) {
      const index = developerHooks.logCounter++;
      const jsonItem = JSON.stringify( messageObject );
      const timeStamp = Date.now();
      pushIntoStore( 'log', { index: index, json: jsonItem, timeStamp: timeStamp } );
   }

   ////////////////////////////////////////////////////////////////////////////////////////////////////////

   function inspector( item ) {
      const index = developerHooks.eventCounter++;
      const timeStamp = Date.now();
      const jsonItem = JSON.stringify( options( { time: timeStamp }, item ) );
      pushIntoStore( 'events', { index: index, json: jsonItem, timeStamp: timeStamp } );
   }

   ////////////////////////////////////////////////////////////////////////////////////////////////////////

   function onPageChange( pageInfo ) {
      developerHooks.pageInfo = pageInfo;
      ++developerHooks.pageInfoVersion;
   }

   ////////////////////////////////////////////////////////////////////////////////////////////////////////

   function clearBuffer() {
      const currentLastAccess = readLastAccess();
      if( currentLastAccess === lastAccess || currentLastAccess === null ) { return; }
      lastAccess = currentLastAccess;
      const logItems = developerHooks.buffers.log;
      while( logItems[ 0 ] && logItems[ 0 ].timeStamp < lastAccess ) {
         logItems.shift();
      }
      const eventItems = developerHooks.buffers.events;
      while( eventItems[ 0 ] && eventItems[ 0 ].timeStamp < lastAccess ) {
         eventItems.shift();
      }
   }

   ////////////////////////////////////////////////////////////////////////////////////////////////////////

   function readLastAccess() {
      return document.documentElement.hasAttribute( 'data-laxar-developer-tools-extension' ) ?
         document.documentElement.getAttribute( 'data-laxar-developer-tools-extension' ) :
         null;
   }

   ////////////////////////////////////////////////////////////////////////////////////////////////////////

   function pushIntoStore( storeName, item ) {
      window.clearInterval( clearBufferInterval );
      clearBuffer();
      const buffer = developerHooks.buffers[ storeName ];
      while( buffer.length >= bufferSize ) {
         buffer.shift();
      }
      buffer.push( item );
      clearBufferInterval = window.setInterval( () => {
         clearBuffer();
      }, CLEAR_BUFFER_DELAY_MS );
   }
}
