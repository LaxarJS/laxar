/**
 * Copyright 2016 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
define( [
   'angular',
   './pages',
   '../logging/log',
   '../utilities/object',
   '../utilities/configuration'
],
function( ng, pages, log, object, configuration ) {
   'use strict';

   /**
    * Creation of the tooling hooks can be provided by explicitly setting tooling.enabled
    * to `true`.
    */
   function create( eventBus ) {
      var toolingEnabled = configuration.get( 'tooling.enabled', false );
      if( toolingEnabled !== true ) {
         // tooling not enabled explicitly
         return;
      }

      var lastAccess = null;
      var clearBufferInterval;
      var CLEAR_BUFFER_DELAY_MS = 5000;

      pages.addListener( onPageChange );
      var bufferSize = configuration.get( 'tooling.bufferSize', 2500 );

      var developerHooks = window.laxarDeveloperToolsApi = ( window.laxarDeveloperToolsApi || {} );
      developerHooks.buffers = { events: [], log: [] } ;
      developerHooks.eventCounter = Date.now();
      developerHooks.logCounter = Date.now();
      developerHooks.pageInfo = pages.current();
      developerHooks.pageInfoVersion =  1;
      developerHooks.gridSettings = configuration.get( 'tooling.grid', null );

      log.addLogChannel( logChannel );
      var cleanupInspector = eventBus.addInspector( inspector );

      window.addEventListener( 'beforeunload', function() {
         log.removeLogChannel( logChannel );
         cleanupInspector();
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      function logChannel( messageObject ) {
         var index = developerHooks.logCounter++;
         var jsonItem = JSON.stringify( messageObject );
         var timeStamp = Date.now();
         pushIntoStore( 'log', { index: index, json: jsonItem, timeStamp: timeStamp } );
      }

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      function inspector( item ) {
         var index = developerHooks.eventCounter++;
         var timeStamp = Date.now();
         var jsonItem = JSON.stringify( object.options( { time: timeStamp }, item ) );
         pushIntoStore( 'events', { index: index, json: jsonItem, timeStamp: timeStamp } );
      }

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      function onPageChange( pageInfo ) {
         developerHooks.pageInfo = pageInfo;
         ++developerHooks.pageInfoVersion;
      }

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      function clearBuffer() {
         var currentLastAccess = readLastAccess();
         if( currentLastAccess === lastAccess || currentLastAccess === null ) { return; }
         lastAccess = currentLastAccess;
         var logItems = developerHooks.buffers.log;
         while( logItems[ 0 ] && logItems[ 0 ].timeStamp < lastAccess ) {
            logItems.shift();
         }
         var eventItems = developerHooks.buffers.events;
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
         var buffer = developerHooks.buffers[ storeName ];
         while( buffer.length >= bufferSize ) {
            buffer.shift();
         }
         buffer.push( item );
         clearBufferInterval = window.setInterval( function() {
            clearBuffer();
         }, CLEAR_BUFFER_DELAY_MS );
      }
   }

   return ng.module( 'axToolingExternalApi', [] ).run( [ 'axGlobalEventBus', create ] );
} );
