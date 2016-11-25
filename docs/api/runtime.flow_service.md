
# <a id="flow_service"></a>flow_service

Module providing the FlowService factory.

To access the FlowService in a widget, request the [`axFlowService`](runtime.widget_services.md#axFlowService)
injection.

## Contents

**Types**

- [FlowService](#FlowService)
  - [FlowService.constructAbsoluteUrl()](#FlowService.constructAbsoluteUrl)

## Types

### <a id="FlowService"></a>FlowService

Allows widgets to create valid URLs without knowledge about the current place, its routing patterns, or
about the actual routing implementation.

#### <a id="FlowService.constructAbsoluteUrl"></a>FlowService.constructAbsoluteUrl( targetOrPlace, optionalParameters )

Constructs an absolute URL to the given target or place using the given parameters. If a target is
given as first argument, it is resolved using the currently active place.

##### Parameters

| Property | Type | Description |
| -------- | ---- | ----------- |
| targetOrPlace | `String` |  the target or place ID to construct a URL for |
| _optionalParameters_ | `Object` |  optional map of place parameters. Missing parameters are filled base on the parameters that were passed to the currently active place |

##### Returns

| Type | Description |
| ---- | ----------- |
| `String` |  the generated absolute URL |
