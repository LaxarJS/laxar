/**
 * Copyright 2016-2017 aixigo AG
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
 * For details, see [widget_services_assets_mock](testing.widget_services_assets_mock.md#create).
 *
 * @name createAxAssetsMocks
 * @type {Function}
 */
export { create as createAxAssetsMock } from './lib/testing/widget_services_assets_mock';

/**
 * Returns a mock of the `axAreaHelper` injection for tests.
 *
 * For details, see [widget_services_area_helper_mock](testing.widget_services_area_helper_mock.md#create).
 *
 * @name createAxAreaHelperMock
 * @type {Function}
 */
export { create as createAxAreaHelperMock } from './lib/testing/widget_services_area_helper_mock';

/**
 * Returns a mock of the `axConfiguration` injection for tests.
 *
 * For details, see [configuration_mock](testing.configuration_mock.md#create).
 *
 * @name createAxConfigurationMock
 * @type {Function}
 */
export { create as createAxConfigurationMock } from './lib/testing/configuration_mock';

/**
 * Returns a mock of the `axEventBus` injection for tests.
 *
 * For details, see [event_bus_mock](testing.event_bus_mock.md#create).
 *
 * @name createAxEventBusMock
 * @type {Function}
 */
export { create as createAxEventBusMock } from './lib/testing/event_bus_mock';

/**
 * Returns a mock of the `axFlowService` injection for tests.
 *
 * For details, see [flow_service_mock](testing.flow_service_mock.md#create).
 *
 * @name createAxFlowServiceMock
 * @type {Function}
 */
export { create as createAxFlowServiceMock } from './lib/testing/flow_service_mock';

/**
 * Returns a mock of the `axGlobalStorage` injection for tests.
 *
 * For details, see [storage_mock](testing.storage_mock.md#create).
 *
 * @name createAxGlobalStorageMock
 * @type {Function}
 */
export { create as createAxGlobalStorageMock } from './lib/testing/storage_mock';

/**
 * Returns a mock of the `axHeartbeat` injection for tests.
 *
 * For details, see [heartbeat_mock](testing.heartbeat_mock.md#create).
 *
 * @name createAxHeartbeatMock
 * @type {Function}
 */
export { create as createAxHeartbeatMock } from './lib/testing/heartbeat_mock';

/**
 * Returns a mock of the `axI18n` injection for tests.
 *
 * For details, see [i18n_mock](testing.i18n_mock.md#create).
 *
 * @name createAxI18nMock
 * @type {Function}
 */
export { create as createAxI18nMock } from './lib/testing/widget_services_i18n_mock';

/**
 * Returns a mock of the `axLog` injection for tests.
 *
 * For details, see [log_mock](testing.log_mock.md#create).
 *
 * @name createAxLogMock
 * @type {Function}
 */
export { create as createAxLogMock } from './lib/testing/log_mock';

/**
 * Returns a mock of the `axStorage` injection for tests.
 *
 * For details, see [widget_services_storage_mock](testing.widget_services_storage_mock.md#create).
 *
 * @name createAxStorageMock
 * @type {Function}
 */
export { create as createAxStorageMock } from './lib/testing/widget_services_storage_mock';

/**
 * Returns a mock of the `axVisibility` injection for tests.
 *
 * For details, see [widget_services_visibility_mock](testing.widget_services_visibility_mock.md#create).
 *
 * @name createAxVisibilityMock
 * @type {Function}
 */
export { create as createAxVisibilityMock } from './lib/testing/widget_services_visibility_mock';
