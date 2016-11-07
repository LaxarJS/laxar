
# <a name="flow_service"></a>flow_service

This module encapsulates all logic regarding the flow and navigation between different pages.
Its the place where `navigateRequest` events are handled and the source of `will-` and `didNavigate`
events.

## Contents

**Module Members**

- [constructAbsoluteUrl()](#constructAbsoluteUrl)
- [absoluteUrl()](#absoluteUrl)

**Types**

- [FlowService](#FlowService)

## Module Members

#### <a name="constructAbsoluteUrl"></a>constructAbsoluteUrl()

Alias for [`#absoluteUrl`](#absoluteUrl), for backward-compatibility.

#### <a name="absoluteUrl"></a>absoluteUrl( targetOrPlace, optionalParameters )

Constructs an absolute URL to the given target or place using the given parameters. If a target is
given as first argument, it is resolved using the currently active place.

##### Parameters

| Property | Type | Description |
| -------- | ---- | ----------- |
| targetOrPlace | `String` |  the target or place id to construct a URL for |
| _optionalParameters_ | `Object` |  optional map of place parameters. Missing parameters are taken from the parameters that were passed to the currently active place |

##### Returns

| Type | Description |
| ---- | ----------- |
| `String` |  the generated absolute url |

## Types

### <a name="FlowService"></a>FlowService

Service granting access to certain flow specific tasks.
