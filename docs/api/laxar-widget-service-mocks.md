
# <a id="laxar-widget-service-mocks"></a>laxar-widget-service-mocks

Mock factories that help to tests widgets.
These mocks are automatically provided in place of the regular LaxarJS widget services when using
laxar-mocks for widget testing.

## Contents

**Module Members**

- [createAxAssetsMocks()](#createAxAssetsMocks)
- [createAxAreaHelperMock()](#createAxAreaHelperMock)
- [createAxConfigurationMock()](#createAxConfigurationMock)
- [createAxEventBusMock()](#createAxEventBusMock)
- [createAxFlowServiceMock()](#createAxFlowServiceMock)
- [createAxGlobalStorageMock()](#createAxGlobalStorageMock)
- [createAxHeartbeatMock()](#createAxHeartbeatMock)
- [createAxI18nMock()](#createAxI18nMock)
- [createAxLogMock()](#createAxLogMock)
- [createAxStorageMock()](#createAxStorageMock)
- [createAxVisibilityMock()](#createAxVisibilityMock)

## Module Members

#### <a id="createAxAssetsMocks"></a>createAxAssetsMocks()

Returns a mock of the `axAssets` injection for tests, to avoid making actual `fetch` calls.

For details, see [widget_services_assets_mock](testing.widget_services_assets_mock.md#create).

#### <a id="createAxAreaHelperMock"></a>createAxAreaHelperMock()

Returns a mock of the `axAreaHelper` injection for tests.

For details, see [widget_services_area_helper_mock](testing.widget_services_area_helper_mock.md#create).

#### <a id="createAxConfigurationMock"></a>createAxConfigurationMock()

Returns a mock of the `axConfiguration` injection for tests.

For details, see [configuration_mock](testing.configuration_mock.md#create).

#### <a id="createAxEventBusMock"></a>createAxEventBusMock()

Returns a mock of the `axEventBus` injection for tests.

For details, see [event_bus_mock](testing.event_bus_mock.md#create).

#### <a id="createAxFlowServiceMock"></a>createAxFlowServiceMock()

Returns a mock of the `axFlowService` injection for tests.

For details, see [flow_service_mock](testing.flow_service_mock.md#create).

#### <a id="createAxGlobalStorageMock"></a>createAxGlobalStorageMock()

Returns a mock of the `axGlobalStorage` injection for tests.

For details, see [storage_mock](testing.storage_mock.md#create).

#### <a id="createAxHeartbeatMock"></a>createAxHeartbeatMock()

Returns a mock of the `axHeartbeat` injection for tests.

For details, see [heartbeat_mock](testing.heartbeat_mock.md#create).

#### <a id="createAxI18nMock"></a>createAxI18nMock()

Returns a mock of the `axI18n` injection for tests.

For details, see [i18n_mock](testing.i18n_mock.md#create).

#### <a id="createAxLogMock"></a>createAxLogMock()

Returns a mock of the `axLog` injection for tests.

For details, see [log_mock](testing.log_mock.md#create).

#### <a id="createAxStorageMock"></a>createAxStorageMock()

Returns a mock of the `axStorage` injection for tests.

For details, see [widget_services_storage_mock](testing.widget_services_storage_mock.md#create).

#### <a id="createAxVisibilityMock"></a>createAxVisibilityMock()

Returns a mock of the `axVisibility` injection for tests.

For details, see [widget_services_visibility_mock](testing.widget_services_visibility_mock.md#create).
