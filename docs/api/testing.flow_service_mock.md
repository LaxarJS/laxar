
# <a id="flow_service_mock"></a>flow_service_mock

Allows to create mock implementations of [`FlowService`](runtime.flow_service.md), compatible to the "axFlowService" injection.

## Contents

**Module Members**

- [create()](#create)

**Types**

- [AxFlowServiceMock](#AxFlowServiceMock)

## Module Members

#### <a id="create"></a>create( dependencies={} )

Creates a mock for the `axFlowService` injection of a widget.

##### Parameters

| Property | Type | Description |
| -------- | ---- | ----------- |
| _dependencies={}_ | `Object` |  optional service dependencies to be used by the mock flow service |
| _dependencies.browser_ | `AxBrowser` |  a (mock) browser to resolve the location when creating absolute mock URLs |

##### Returns

| Type | Description |
| ---- | ----------- |
| [`AxFlowServiceMock`](#AxFlowServiceMock) |  a mock of `axFlowService` that can be spied and/or mocked with additional items |

## Types

### <a id="AxFlowServiceMock"></a>AxFlowServiceMock

> extends `AxFlowService`

A mock version of the [`FlowService`](runtime.flow_service.md) that does not rely on an actual flow definition.

By default, the mock will simply return '/mockPath' for any call to `constructPath`, and the remaining
methods behave accordingly. All methods are spies, so their arguments may be inspected and their return
value may be modified using `and.callFake`.
