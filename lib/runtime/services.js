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
import { create as createI18n } from '../i18n/i18n';
import { create as createCssLoader } from '../loaders/css_loader';
import { create as createLayoutLoader } from '../loaders/layout_loader';
import { create as createPageLoader } from '../loaders/page_loader';
import { create as createWidgetLoader } from '../loaders/widget_loader';
import assert from '../utilities/assert';
import { create as createStorage } from './storage';
import { create as createTimer } from './timer';
import { create as createControlsService } from './controls_service';
import { create as createFlowService } from './flow_service';
import { create as createHeartbeat } from './heartbeat';
import { create as createPageService } from './page_service';
import { create as createThemeManager } from './theme_manager';
import { create as createLocaleEventManager } from './locale_event_manager';
import { create as createVisibilityEventManager } from './visibility_event_manager';
import { create as createWidgetServices } from './widget_services';
import {
   createCollectors as createToolingCollectors,
   createProviders as createToolingProviders
} from '../tooling/tooling';

export function create( configurationSource ) {

   const configuration = createConfiguration( configurationSource );
   const browser = createBrowser();
   const log = createLog( configuration, browser );
   const collectors = createToolingCollectors( configuration, log );
   const i18n = createI18n( configuration );

   const storage = createStorage( configuration, browser );
   const timer = createTimer( log, storage );

   const paths = createPaths( configuration );
   const fileResourceProvider = createFrp( configuration, browser, paths.PRODUCT );

   const nextTick = f => setTimeout( f, 0 );
   const heartbeat = createHeartbeat( nextTick );

   // MSIE Bug we have to wrap setTimeout to pass assertion
   const timeoutFn = ( f, t ) => setTimeout( f, t );
   const globalEventBus = createEventBus( configuration, log, heartbeat.onNext, timeoutFn );

   const theme = configuration.get( 'theme', configurationSource );
   const cssLoader = createCssLoader();
   const themeManager = createThemeManager( fileResourceProvider, cssLoader, theme );
   const layoutLoader = createLayoutLoader(
      paths.LAYOUTS,
      paths.THEMES,
      cssLoader,
      themeManager,
      fileResourceProvider
   );
   const pageLoader = createPageLoader( paths.PAGES, fileResourceProvider, collectors.pages );
   const controls = createControlsService( fileResourceProvider, paths.CONTROLS );
   let widgetServices = { forWidget() {
      assert.codeIsUnreachable( 'Using widget services before they are available');
   } };
   const widgetLoader = createWidgetLoader(
      log,
      fileResourceProvider,
      controls,
      cssLoader,
      themeManager,
      paths.THEMES,
      paths.WIDGETS,
      collectors.pages,
      ( ...args ) => widgetServices.forWidget( ...args )
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

   widgetServices = createWidgetServices(
      configuration,
      globalEventBus,
      flowService,
      log,
      heartbeat,
      i18n,
      storage,
      toolingProviders
   );

   return {
      configuration,
      controls,
      cssLoader,
      fileResourceProvider,
      flowService,
      globalEventBus,
      heartbeat,
      i18n,
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
