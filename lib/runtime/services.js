/**
 * Copyright 2016 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
import assert from '../utilities/assert';
import { create as createConfiguration } from './configuration';
import { create as createBrowser } from './browser';
import { create as createLog } from './log';
import { create as createEventBus, createLogErrorHandler } from '../runtime/event_bus';
import { create as createAdapterUtilities } from './adapter_utilities';
import { create as createArtifactProvider } from './artifact_provider';
import { create as createControlLoader } from '../loaders/control_loader';
import { create as createLayoutLoader } from '../loaders/layout_loader';
import { create as createPageLoader } from '../loaders/page_loader';
import { create as createWidgetLoader } from '../loaders/widget_loader';
import { create as createStorage } from './storage';
import { create as createTimer } from './timer';
import { create as createFlowController } from './flow_controller';
import { create as createFlowService } from './flow_service';
import { create as createHeartbeat } from './heartbeat';
import { create as createNavigoRouter } from './navigo_router';
import { create as createPageService } from './page_service';
import { create as createLocaleEventManager } from './locale_event_manager';
import { create as createVisibilityEventManager } from './visibility_event_manager';
import { create as createWidgetServices } from './widget_services';
import { create as createTooling } from '../tooling/tooling';

export function create( configurationSource, assets, optionalDebugEventBus ) {

   const configurationDefaults = {
      baseHref: undefined,
      eventBusTimeoutMs: 120 * 1000,
      router: {
         query: {
            enabled: false
         }
         // 'navigo' is not configured here:
         // any deviation from the Navigo library defaults must be set by the application
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
      storagePrefix: undefined
   };

   const adapterUtilities = createAdapterUtilities();

   const configuration = createConfiguration( configurationSource, configurationDefaults );

   const browser = createBrowser();
   const log = createLog( configuration, browser );

   const storage = createStorage( configuration, browser );
   const timer = createTimer( log, storage );

   const artifactProvider = createArtifactProvider( assets, browser, configuration, log );

   const heartbeat = createHeartbeat();

   // MSIE Bug we have to wrap setTimeout to pass assertion
   const timeoutFn = ( f, t ) => setTimeout( f, t );
   const debugEventBus = optionalDebugEventBus || { publish() {}, subscribe() {} };
   const errorHandler = createLogErrorHandler( log );
   const globalEventBus = createEventBus( configuration, heartbeat.onNext, timeoutFn, errorHandler );

   const layoutLoader = createLayoutLoader( artifactProvider, debugEventBus );
   const pageLoader = createPageLoader( artifactProvider, debugEventBus );
   const controlLoader = createControlLoader( artifactProvider, debugEventBus );
   let widgetServices = { forWidget() {
      assert.codeIsUnreachable( 'Using widget services before they are available');
   } };
   const widgetLoader = createWidgetLoader(
      log,
      artifactProvider,
      debugEventBus,
      controlLoader,
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
      log,
      debugEventBus
   );

   const router = createNavigoRouter( browser, configuration );

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

   const tooling = createTooling( debugEventBus, log );

   widgetServices = createWidgetServices(
      artifactProvider,
      configuration,
      controlLoader,
      debugEventBus,
      globalEventBus,
      flowService,
      log,
      heartbeat,
      pageService,
      storage,
      tooling
   );

   return {
      adapterUtilities,
      artifactProvider,
      configuration,
      flowController,
      flowService,
      debugEventBus,
      globalEventBus,
      heartbeat,
      layoutLoader,
      log,
      pageService,
      storage,
      timer,
      tooling,
      widgetLoader
   };
}
