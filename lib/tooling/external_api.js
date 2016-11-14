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
         pushIntoStore( 'log', { index: index, json: jsonItem } );
      }

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      function inspector( item ) {
         var index = developerHooks.eventCounter++;
         var jsonItem = JSON.stringify( object.options( { time: Date.now() }, item ) );
         pushIntoStore( 'events', { index: index, json: jsonItem } );
      }

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      function onPageChange( pageInfo ) {
         developerHooks.pageInfo = pageInfo;
         ++developerHooks.pageInfoVersion;
      }

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      function pushIntoStore( storeName, item ) {
         var buffer = developerHooks.buffers[ storeName ];
         while( buffer.length >= bufferSize ) {
            buffer.shift();
         }
         buffer.push( item );
      }
   }

   return ng.module( 'axToolingExternalApi', [] ).run( [ 'axGlobalEventBus', create ] );
} );
