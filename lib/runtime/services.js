/**
 * Copyright 2016 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
import { create as createControlsService } from './controls_service';
import { create as createEventBus } from '../event_bus/event_bus';
import { create as createFrp } from '../file_resource_provider/file_resource_provider';
import { create as createHeartbeat } from './heartbeat';
import { create as createPageService } from './page_service';
import { create as createThemeManager } from './theme_manager';
import { create as createCssLoader } from '../loaders/css_loader';
import { create as createLayoutLoader } from '../loaders/layout_loader';
import { forEach } from '../utilities/object';
import log from '../logging/log';
import * as paths from '../loaders/paths';

// TODO only temporary
import ng from 'angular';
import * as configuration from '../utilities/configuration';

const module = ng.module( 'axServices', [ 'axFlow' ] )
   .factory( 'axServices', [
      '$q', '$http', 'axFlowService',
      ( $q, $http, flowService ) => create( configuration, $q, $http, flowService )
   ] );

export const name = module.name;

export function create( configuration, $q, $http, flowService ) {

   const pageService = createPageService();
   const heartbeat = createHeartbeat( pageService );

   const eventBus = createEventBus( $q, heartbeat.onNext, ( f, t ) => {
      // MSIE Bug, we have to wrap set timeout to pass assertion
      setTimeout( f, t );
   }, { pendingDidTimeout: configuration.get( 'eventBusTimeoutMs', 120 * 1000 ) } );
   eventBus.setErrorHandler( eventBusErrorHandler );

   const fileResourceProvider = createFrp( $q, $http, paths.PRODUCT );
   forEach( configuration.get( 'fileListings', {} ), ( value, key ) => {
      if( typeof value === 'string' ) {
         fileResourceProvider.setFileListingUri( key, value );
      }
      else {
         fileResourceProvider.setFileListingContents( key, value );
      }
   } );

   const themeManager = createThemeManager( fileResourceProvider, $q, configuration.get( 'theme' ) );
   const cssLoader = createCssLoader( configuration, themeManager );
   const layoutLoader =
      createLayoutLoader( paths.LAYOUTS, paths.THEMES, cssLoader, themeManager, fileResourceProvider );

   return {

      axConfiguration: configuration,

      axControls: createControlsService( fileResourceProvider ),

      axCssLoader: cssLoader,

      axFileResourceProvider: fileResourceProvider,

      axFlowService: flowService,

      axGlobalEventBus: eventBus,

      axHeartbeat: heartbeat,

      axLayoutLoader: layoutLoader,

      axThemeManager: themeManager,

      // TODO: remove? isn't stateful and very specific ...
      axTimestamp: () => Date.now(),

   };

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function eventBusErrorHandler( message, optionalErrorInformation ) {
      const sensitiveData = [ 'Published event' ];

      log.error( 'EventBus: ' + message );

      if( optionalErrorInformation ) {
         forEach( optionalErrorInformation, ( info, title ) => {
            let formatString = '   - [0]: [1:%o]';
            if( sensitiveData.indexOf( title ) !== -1 ) {
               formatString = '   - [0]: [1:%o:anonymize]';
            }

            log.error( formatString, title, info );

            if( info instanceof Error && info.stack ) {
               log.error( '   - Stacktrace: ' + info.stack );
            }
         } );
      }
   }

}
