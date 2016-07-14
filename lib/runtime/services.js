/**
 * Copyright 2016 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
import { create as createConfiguration } from './configuration';
import { create as createBrowser } from './browser';
import { create as createLog } from '../logging/log';
import { create as createEventBus } from '../event_bus/event_bus';
import { create as createFrp } from '../file_resource_provider/file_resource_provider';
import { create as createCssLoader } from '../loaders/css_loader';
import { create as createLayoutLoader } from '../loaders/layout_loader';
import { create as createPageLoader } from '../loaders/page_loader';
import { create as createWidgetLoader } from '../loaders/widget_loader';
import { create as createStorage } from './storage';
import { create as createTimer } from './timer';
import { create as createControlsService } from './controls_service';
import { create as createFlowService } from './flow_service';
import { create as createHeartbeat } from './heartbeat';
import { create as createPageService } from './page_service';
import { create as createThemeManager } from './theme_manager';
import { create as createLocaleEventManager } from './locale_event_manager';
import { create as createVisibilityEventManager } from './visibility_event_manager';
import {
   createCollectors as createToolingCollectors,
   createProviders as createToolingProviders
} from '../tooling/tooling';

export function create( configurationSource ) {

   const configuration = createConfiguration( configurationSource );
   const browser = createBrowser();
   const log = createLog( configuration, browser );
   const collectors = createToolingCollectors( configuration, log );

   const storage = createStorage( configuration, browser );
   const timer = createTimer( log, storage );

   const paths = createPaths( configuration );
   const fileResourceProvider = createFrp( configuration, browser, paths.PRODUCT );

   const heartbeat = createHeartbeat();
   const globalEventBus = createEventBus( heartbeat.onNext, ( f, t ) => {
      // MSIE Bug, we have to wrap set timeout to pass assertion
      setTimeout( f, t );
   }, browser, { pendingDidTimeout: configuration.get( 'eventBusTimeoutMs', 120 * 1000 ) } );

   const theme = configuration.get( 'theme', configurationSource );
   const themeManager = createThemeManager( fileResourceProvider, theme );
   const cssLoader = createCssLoader( configuration, themeManager, paths.PRODUCT );
   const layoutLoader = createLayoutLoader(
      paths.LAYOUTS,
      paths.THEMES,
      cssLoader,
      themeManager,
      fileResourceProvider
   );
   const pageLoader = createPageLoader( paths.PAGES, fileResourceProvider, collectors.pages );
   const controls = createControlsService( fileResourceProvider, paths.CONTROLS );
   const widgetLoader = createWidgetLoader(
      log,
      fileResourceProvider,
      globalEventBus,
      controls,
      cssLoader,
      themeManager,
      paths.THEMES,
      paths.WIDGETS,
      collectors.pages
   );

   const localeManager = createLocaleEventManager( globalEventBus, configuration );
   const visibilityManager = createVisibilityEventManager( globalEventBus );
   const pageService = createPageService(
      globalEventBus,
      heartbeat,
      pageLoader,
      layoutLoader,
      widgetLoader,
      themeManager,
      localeManager,
      visibilityManager,
      collectors.pages
   );

   const flowService = createFlowService(
      log,
      timer,
      fileResourceProvider,
      globalEventBus,
      configuration,
      browser,
      pageService
   );

   const toolingProviders = createToolingProviders( collectors );

   return {
      configuration,
      controls,
      cssLoader,
      globalEventBus,
      heartbeat,
      fileResourceProvider,
      flowService,
      layoutLoader,
      log,
      pageService,
      paths,
      storage,
      themeManager,
      timer,
      toolingProviders,
      widgetLoader
   };

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
         DEFAULT_THEME: configuration.get( 'paths.defaultTheme', 'includes/themes/default.theme' )
      };
   }

}