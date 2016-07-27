/**
 * Copyright 2016 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
import assert from '../utilities/assert';
import { create as createConfiguration } from './configuration';
import { create as createBrowser } from './browser';
import { create as createLog } from '../logging/log';
import { create as createEventBus } from '../event_bus/event_bus';
import { create as createArtifactProvider } from './artifact_provider';
import { create as createI18n } from '../i18n/i18n';
import { create as createControlsLoader } from '../loaders/control_loader';
import { create as createCssLoader } from '../loaders/css_loader';
import { create as createLayoutLoader } from '../loaders/layout_loader';
import { create as createPageLoader } from '../loaders/page_loader';
import { create as createThemeLoader } from '../loaders/theme_loader';
import { create as createWidgetLoader } from '../loaders/widget_loader';
import { create as createStorage } from './storage';
import { create as createTimer } from './timer';
import { create as createFlowService } from './flow_service';
import { create as createHeartbeat } from './heartbeat';
import { create as createPageService } from './page_service';
import { create as createLocaleEventManager } from './locale_event_manager';
import { create as createVisibilityEventManager } from './visibility_event_manager';
import { create as createWidgetServices } from './widget_services';
import {
   createCollectors as createToolingCollectors,
   createProviders as createToolingProviders
} from '../tooling/tooling';

export function create( configurationSource, assets ) {

   const configuration = createConfiguration( configurationSource );
   const browser = createBrowser();
   const log = createLog( configuration, browser );
   const collectors = createToolingCollectors( configuration, log );
   const i18n = createI18n( configuration );

   const storage = createStorage( configuration, browser );
   const timer = createTimer( log, storage );

   const artifactProvider = createArtifactProvider( assets, browser, configuration, log );

   const heartbeat = createHeartbeat();

   // MSIE Bug we have to wrap setTimeout to pass assertion
   const timeoutFn = ( f, t ) => setTimeout( f, t );
   const globalEventBus = createEventBus( configuration, log, heartbeat.onNext, timeoutFn );

   const cssLoader = createCssLoader();
   const themeLoader = createThemeLoader( artifactProvider, cssLoader );
   const layoutLoader = createLayoutLoader( artifactProvider, cssLoader );
   const pageLoader = createPageLoader( artifactProvider, collectors.pages );
   const controlsLoader = createControlsLoader( artifactProvider, cssLoader );
   let widgetServices = { forWidget() {
      assert.codeIsUnreachable( 'Using widget services before they are available');
   } };
   const widgetLoader = createWidgetLoader(
      log,
      artifactProvider,
      controlsLoader,
      cssLoader,
      collectors.pages,
      ( ...args ) => widgetServices.forWidget( ...args )
   );

   const localeManager = createLocaleEventManager( globalEventBus, configuration );
   const visibilityManager = createVisibilityEventManager( globalEventBus );
   const pageService = createPageService(
      globalEventBus,
      pageLoader,
      layoutLoader,
      widgetLoader,
      localeManager,
      visibilityManager,
      collectors.pages
   );

   const flowService = createFlowService(
      log,
      timer,
      artifactProvider,
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
      pageService,
      storage,
      toolingProviders
   );

   return {
      configuration,
      cssLoader,
      artifactProvider,
      flowService,
      globalEventBus,
      heartbeat,
      i18n,
      layoutLoader,
      log,
      pageService,
      storage,
      themeLoader,
      timer,
      toolingProviders,
      widgetLoader
   };
}
