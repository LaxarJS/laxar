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
    * If the documentElement has the attribute 'data-laxar-developer-tools-extension' or
    * the property 'laxarDeveloperToolsExtensionLoaded' of the window is true or
    * the tooling is enabled by configuration in the laxar application then
    * laxar is providing the API by creating the object `window.laxarDeveloperToolsApi`.
    * The attribute 'data-laxar-developer-tools-extension' is set by the web extension and
    * the property 'laxarDeveloperToolsExtensionLoaded' is set by the firefox extension.
    *
    * Creation of the tooling hooks can be prevented by explicitly setting tooling.enabled
    * to `false`.
    */
   function create( eventBus ) {
      var toolingEnabled = configuration.get( 'tooling.enabled', false );
      if( toolingEnabled !== true ) {
         // tooling not enabled explicitly
         return;
      }

      var lastAccess = null;
      var clearBufferTimeout;
      var CLEAR_BUFFER_DELAY_MS = 1000;

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
         developerHooks.buffers.log = developerHooks.buffers.log.filter( function( message ) {
            return message.timeStamp >= lastAccess;
         } );
         developerHooks.buffers.events = developerHooks.buffers.events.filter( function( event ) {
            return event.timeStamp >= lastAccess;
         } );
      }

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      function readLastAccess() {
         return document.documentElement.hasAttribute( 'data-laxar-developer-tools-extension' ) ?
                           document.documentElement.getAttribute( 'data-laxar-developer-tools-extension' ) :
                           null;
      }

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      function pushIntoStore( storeName, item ) {
         window.clearTimeout( clearBufferTimeout );
         clearBuffer();
         var buffer = developerHooks.buffers[ storeName ];
         while( buffer.length >= bufferSize ) {
            buffer.shift();
         }
         buffer.push( item );
         clearBufferTimeout = window.setTimeout( function() {
            clearBuffer();
         }, CLEAR_BUFFER_DELAY_MS );
      }
   }

   return ng.module( 'axToolingExternalApi', [] ).run( [ 'axGlobalEventBus', create ] );
} );
