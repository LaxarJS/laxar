/**
 * Copyright 2016 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
import { create as createBrowser } from './browser';
import { create as createControlsService } from './controls_service';
import { create as createEventBus } from '../event_bus/event_bus';
import { create as createFlowService } from './flow_service';
import { create as createFrp } from '../file_resource_provider/file_resource_provider';
import { create as createHeartbeat } from './heartbeat';
import { create as createPageService } from './page_service';
import { create as createThemeManager } from './theme_manager';
import { create as createLocaleEventManager } from './locale_event_manager';
import { create as createVisibilityEventManager } from './visibility_event_manager';
import { create as createCssLoader } from '../loaders/css_loader';
import { create as createLayoutLoader } from '../loaders/layout_loader';
import { create as createPageLoader } from '../loaders/page_loader';
import { create as createWidgetLoader } from '../loaders/widget_loader';
import { forEach } from '../utilities/object';
import log from '../logging/log';

export function create( configuration ) {

   const services = {};

   const browser = createBrowser();
   const paths = createPaths( configuration );
   const fileResourceProvider = createFrp( browser, paths.PRODUCT );
   configureFileResourceProvider( fileResourceProvider, configuration );

   const heartbeat = createHeartbeat();
   const eventBus = createEventBus( heartbeat.onNext, ( f, t ) => {
      // MSIE Bug, we have to wrap set timeout to pass assertion
      setTimeout( f, t );
   }, { pendingDidTimeout: configuration.get( 'eventBusTimeoutMs', 120 * 1000 ) } );
   eventBus.setErrorHandler( eventBusErrorHandler );

   const themeManager = createThemeManager( fileResourceProvider, configuration.get( 'theme' ) );
   const cssLoader = createCssLoader( configuration, themeManager, paths.PRODUCT );
   const layoutLoader =
      createLayoutLoader( paths.LAYOUTS, paths.THEMES, cssLoader, themeManager, fileResourceProvider );
   const pageLoader = createPageLoader( paths.PAGES, fileResourceProvider);
   const controls = createControlsService( fileResourceProvider, paths.CONTROLS );
   const widgetLoader = createWidgetLoader(
      fileResourceProvider,
      eventBus,
      controls,
      cssLoader,
      themeManager,
      paths.THEMES,
      paths.WIDGETS
   );
   const localeManager = createLocaleEventManager( eventBus, configuration );
   const visibilityManager = createVisibilityEventManager( eventBus );
   const pageService = createPageService(
      eventBus,
      heartbeat,
      pageLoader,
      layoutLoader,
      widgetLoader,
      themeManager,
      localeManager,
      visibilityManager
   );

   const flowService = createFlowService(
      fileResourceProvider,
      eventBus,
      configuration,
      browser,
      pageService
   ) ;

   services.configuration = configuration;
   services.controls = controls;
   services.cssLoader = cssLoader;
   services.fileResourceProvider = fileResourceProvider;
   services.flowService = flowService;
   services.globalEventBus = eventBus;
   services.heartbeat = heartbeat;
   services.layoutLoader = layoutLoader;
   services.pageService = pageService;
   services.paths = paths;
   services.themeManager = themeManager;

   return services;

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

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function configureFileResourceProvider( fileResourceProvider, configuration ) {
      forEach( configuration.get( 'fileListings', {} ), ( value, key ) => {
         if( typeof value === 'string' ) {
            fileResourceProvider.setFileListingUri( key, value );
         }
         else {
            fileResourceProvider.setFileListingContents( key, value );
         }
      } );
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function createPaths( configuration ) {
      return {
         PRODUCT: configuration.get( 'paths.product', '' ),
         THEMES: configuration.get( 'paths.themes', 'includes/themes' ),
         LAYOUTS: configuration.get( 'paths.layouts', 'application/layouts' ),
         CONTROLS: configuration.get( 'paths.controls', 'includes/controls' ),
         WIDGETS: configuration.get( 'paths.widgets', 'includes/widgets' ),
         PAGES: configuration.get( 'paths.pages', 'application/pages' ),
         FLOW_JSON: configuration.get( 'paths.flowJson', 'application/flow/flow.json' ),
         DEFAULT_THEME: configuration.get( 'paths.defaultTheme', 'includes/themes/default.theme' ),
      };
   }

}
