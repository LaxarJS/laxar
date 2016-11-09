/**
 * Copyright 2016 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
import pagejs from 'page';
import assert from '../utilities/assert';
import { create as createConfiguration } from './configuration';
import { create as createBrowser } from './browser';
import { create as createLog } from './log';
import { create as createEventBus } from '../runtime/event_bus';
import { create as createArtifactProvider } from './artifact_provider';
import { create as createControlLoader } from '../loaders/control_loader';
import { create as createCssLoader } from '../loaders/css_loader';
import { create as createLayoutLoader } from '../loaders/layout_loader';
import { create as createPageLoader } from '../loaders/page_loader';
import { create as createThemeLoader } from '../loaders/theme_loader';
import { create as createWidgetLoader } from '../loaders/widget_loader';
import { create as createStorage } from './storage';
import { create as createTimer } from './timer';
import { create as createFlowController } from './flow_controller';
import { create as createFlowService } from './flow_service';
import { create as createHeartbeat } from './heartbeat';
import { create as createPageService } from './page_service';
import { create as createPagejsRouter } from './pagejs_router';
import { create as createLocaleEventManager } from './locale_event_manager';
import { create as createVisibilityEventManager } from './visibility_event_manager';
import { create as createWidgetServices } from './widget_services';
import {
   createCollectors as createToolingCollectors,
   createProviders as createToolingProviders
} from '../tooling/tooling';

export function create( configurationSource, assets ) {

   const configurationDefaults = {
      baseHref: undefined,
      eventBusTimeoutMs: 120 * 1000,
      router: {
         query: {
            enabled: false
         }
         // 'pagejs' is not configured here:
         // any deviation from the page.js library defaults must be set by the application
      },
      flow: {
         entryPoint: {
            target: 'default',
            parameters: {}
         }
      },
      i18n: {
         fallback: 'en',
         strict: false,
         locales: {
            'default': 'en'
         }
      },
      logging: {
         levels: {},
         threshold: 'INFO'
      },
      name: 'unnamed',
      theme: 'default',
      storagePrefix: undefined,
      tooling: {
         enabled: false
      }
   };
   const configuration = createConfiguration( configurationSource, configurationDefaults );

   const browser = createBrowser();
   const log = createLog( configuration, browser );
   const collectors = createToolingCollectors( configuration, log );

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
   const controlLoader = createControlLoader( artifactProvider, cssLoader );
   let widgetServices = { forWidget() {
      assert.codeIsUnreachable( 'Using widget services before they are available');
   } };
   const widgetLoader = createWidgetLoader(
      log,
      artifactProvider,
      controlLoader,
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

   const router = createPagejsRouter( pagejs, browser, configuration );

   const flowController = createFlowController(
      artifactProvider,
      configuration,
      globalEventBus,
      log,
      pageService,
      router,
      timer
   );
   const flowService = createFlowService(
      flowController
   );

   const toolingProviders = createToolingProviders( collectors );

   widgetServices = createWidgetServices(
      artifactProvider,
      configuration,
      controlLoader,
      globalEventBus,
      flowService,
      log,
      heartbeat,
      pageService,
      storage,
      toolingProviders
   );

   return {
      configuration,
      cssLoader,
      artifactProvider,
      flowController,
      flowService,
      globalEventBus,
      heartbeat,
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
