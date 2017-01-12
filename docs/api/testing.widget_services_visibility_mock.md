
# <a id="widget_services_visibility_mock"></a>widget_services_visibility_mock

Allows to instantiate a mock implementations of [`AxVisibility`](runtime.widget_services_visibility.md), compatible to the "axVisibility"
widet service injection.

## Contents

**Module Members**

- [create()](#create)

**Types**

- [AxVisibilityMock](#AxVisibilityMock)
  - [AxVisibilityMock.mockShow()](#AxVisibilityMock.mockShow)
  - [AxVisibilityMock.mockHide()](#AxVisibilityMock.mockHide)

## Module Members

#### <a id="create"></a>create( context )

Creates a mock for the widget-specific "axVisibility" injection.

##### Parameters

| Property | Type | Description |
| -------- | ---- | ----------- |
| context | [`AxContext`](runtime.widget_services.md#AxContext) |  an object with an `eventBus` and a `widget.area`. |

##### Returns

| Type | Description |
| ---- | ----------- |
| [`AxVisibilityMock`](#AxVisibilityMock) |  an `axVisibility`-compatible mock object |

## Types

### <a id="AxVisibilityMock"></a>AxVisibilityMock

> extends `AxMock`

A mock version of [`AxVisibility`](runtime.widget_services_visibility.md), the widget-specific "axVisibility" injection.

The mock:
- spies on the regular methods,
- turns the update-methods into no-ops (but you can still inspect their spies),
- offers additional `mockShow` and `mockHide` methods, which internally use the context (mock) event bus
  to allow testing features that involve `track/onShow/onHide/onChange/unsubscribe`.
  If the (mock) event bus has a flush method, using `mockShow` and `mockHide` will automatically flush.

#### <a id="AxVisibilityMock.mockShow"></a>AxVisibilityMock.mockShow()

Simulates the widget's containing area becoming visible.
Flushes the underlying event bus mock as a side-effect.

#### <a id="AxVisibilityMock.mockHide"></a>AxVisibilityMock.mockHide()

Simulates the widget's containing area becoming hidden.
Flushes the underlying event bus mock as a side-effect.
