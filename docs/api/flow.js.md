
# flow

The *flow* module is responsible for the handling of all tasks regarding navigation and routing and as such
is part of the LaxarJS core. It is your communication partner on the other end of the event bus for
`navigateRequest`, `willNavigate` and `didNavigate` events. For application developers it additionally
provides the `axFlowService`, which can be used for some flow specific tasks.

## Contents

**Injectable Services**
- [axFlowService](#axFlowService)
  - [axFlowService#constructPath](#axFlowService#constructPath)
  - [axFlowService#constructAnchor](#axFlowService#constructAnchor)
  - [axFlowService#constructAbsoluteUrl](#axFlowService#constructAbsoluteUrl)
  - [axFlowService#place](#axFlowService#place)

## Injectable Services
### <a name="axFlowService"></a>axFlowService
A service providing some flow specific tasks that may be useful from within widgets.

#### <a name="axFlowService#constructPath"></a>axFlowService#constructPath( targetOrPlace, optionalParameters )
Constructs a path, that is compatible to the expected arguments of `$location.path()` from
AngularJS. If a target is given as first argument, this is resolved using the currently active
place.

Deprecation Notice: this will probably create invalid links if using query parameters. Use
constructAbsoluteUrl instead.

##### Parameters
| Property | Type | Description |
| -------- | ---- | ----------- |
| targetOrPlace | `String` |  the target or place id to construct the url for |
| _optionalParameters_ | `Object` |  optional map of place parameters. Missing parameters are taken from the parameters that were passed to the currently active place |

##### Returns
| Type | Description |
| ---- | ----------- |
| `string` |  the generated path |

#### <a name="axFlowService#constructAnchor"></a>axFlowService#constructAnchor( targetOrPlace, optionalParameters )
Constructs a path and prepends a `#` to make it directly usable as relative link within an
application. If a target is given as first argument, this is resolved using the currently active
place.

Deprecation Notice: this will probably create invalid links if using html5 routing. Use
constructAbsoluteUrl instead, which also works for hash-based URLs.

##### Parameters
| Property | Type | Description |
| -------- | ---- | ----------- |
| targetOrPlace | `String` |  the target or place id to construct the url for |
| _optionalParameters_ | `Object` |  optional map of place parameters. Missing parameters are taken from the parameters that were passed to the currently active place |

##### Returns
| Type | Description |
| ---- | ----------- |
| `string` |  the generated anchor |

#### <a name="axFlowService#constructAbsoluteUrl"></a>axFlowService#constructAbsoluteUrl( targetOrPlace, optionalParameters )
Constructs an absolute url to the given target or place using the given parameters application. If
a target is given as first argument, this is resolved using the currently active place.

##### Parameters
| Property | Type | Description |
| -------- | ---- | ----------- |
| targetOrPlace | `String` |  the target or place id to construct the url for |
| _optionalParameters_ | `Object` |  optional map of place parameters. Missing parameters are taken from the parameters that were passed to the currently active place |

##### Returns
| Type | Description |
| ---- | ----------- |
| `string` |  the generated url |

#### <a name="axFlowService#place"></a>axFlowService#place()
Returns a copy of the currently active place.

Deprecation Notice: will be removed in LaxarJS v2 without replacement. Subscribe to `didNavigate`
for the relevant information.

##### Returns
| Type | Description |
| ---- | ----------- |
| `Object` |  the currently active place |
