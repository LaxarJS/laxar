
# <a id="widget_services_area_helper_mock"></a>widget_services_area_helper_mock

Allows to instantiate a mock implementations of [`AxAreaHelper`](runtime.widget_services.md), compatible to the "axAreaHelper"
widget service injection.

## Contents

**Module Members**

- [create()](#create)

## Module Members

#### <a id="create"></a>create( context )

Creates a mock for the widget-specific "axAreaHelper" injection.

##### Parameters

| Property | Type | Description |
| -------- | ---- | ----------- |
| context | [`AxContext`](runtime.widget_services.md#AxContext) |  an object with a `widget.id` property |

##### Returns

| Type | Description |
| ---- | ----------- |
| [`AxAreaHelper`](runtime.widget_services.md#AxAreaHelper) |  an `axAreaHelper`-compatible mock object |
