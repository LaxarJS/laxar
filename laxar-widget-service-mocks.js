/**
 * Copyright 2016 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */

/**
 * Mock factories that help to tests widgets.
 * These mocks are automatically provided in place of the regular LaxarJS widget services when using
 * laxar-mocks for widget testing.
 *
 * @module laxar-widget-service-mocks
 */

/**
 * Returns a mock of the `axAssets` injection for tests, to avoid making actual `fetch` calls.
 *
 * For details, see {@link widget_services_assets_mock#create}.
 *
 * @memberof laxar-widget-service-mocks
 * @name createAxAssetsMocks
 * @type {Function}
 */
export { create as createAxAssetsMock } from './lib/testing/widget_services_assets_mock';

/**
 * Returns a mock of the `axConfiguration` injection for tests.
 *
 * For details, see {@link widget_services_assets_mock#create}.
 *
 * @name createAxConfigurationMock
 * @memberof laxar-widget-service-mocks
 * @type {Function}
 */
export { create as createAxConfigurationMock } from './lib/testing/configuration_mock';

/**
 * Returns a mock of the `axEventBus` injection for tests.
 *
 * For details, see {@link event_bus_mock#create}.
 *
 * @name createAxEventBusMock
 * @memberof laxar-widget-service-mocks
 * @type {Function}
 */
export { create as createAxEventBusMock } from './lib/testing/event_bus_mock';

/**
 * Returns a mock of the `axFlowService` injection for tests.
 *
 * For details, see {@link flow_service_mock#create}.
 *
 * @name createAxFlowServiceMock
 * @memberof laxar-widget-service-mocks
 * @type {Function}
 */
export { create as createAxFlowServiceMock } from './lib/testing/flow_service_mock';

/**
 * Returns a mock of the `axGlobalStorage` injection for tests.
 *
 * For details, see {@link storage_mock#create}.
 *
 * @name createAxGlobalStorageMock
 * @memberof laxar-widget-service-mocks
 * @type {Function}
 */
export { create as createAxGlobalStorageMock } from './lib/testing/storage_mock';

/**
 * Returns a mock of the `axHeartbeat` injection for tests.
 *
 * For details, see {@link heartbeat_mock#create}.
 *
 * @name createAxHeartbeatMock
 * @memberof laxar-widget-service-mocks
 * @type {Function}
 */
export { create as createAxHeartbeatMock } from './lib/testing/heartbeat_mock';

/**
 * Returns a mock of the `axI18n` injection for tests.
 *
 * For details, see {@link i18n_mock#create}.
 *
 * @name createAxI18nMock
 * @memberof laxar-widget-service-mocks
 * @type {Function}
 */
export { create as createAxI18nMock } from './lib/testing/widget_services_i18n_mock';

/**
 * Returns a mock of the `axLog` injection for tests.
 *
 * For details, see {@link log_mock#create}.
 *
 * @name createAxLogMock
 * @memberof laxar-widget-service-mocks
 * @type {Function}
 */
export { create as createAxLogMock } from './lib/testing/log_mock';

/**
 * Returns a mock of the `axStorage` injection for tests.
 *
 * For details, see {@link widget_services_storage_mock#create}.
 *
 * @name createAxStorageMock
 * @memberof laxar-widget-service-mocks
 * @type {Function}
 */
export { create as createAxStorageMock } from './lib/testing/widget_services_storage_mock';

/**
 * Returns a mock of the `axVisibility` injection for tests.
 *
 * For details, see {@link widget_services_visibility_mock#create}.
 *
 * @name createAxVisibilityMock
 * @memberof laxar-widget-service-mocks
 * @type {Function}
 */
export { create as createAxVisibilityMock } from './lib/testing/widget_services_visibility_mock';
