

## Contents

**Module Members**

- [constructAbsoluteUrl()](#constructAbsoluteUrl)

## Module Members

#### <a id="constructAbsoluteUrl"></a>constructAbsoluteUrl( targetOrPlace, optionalParameters )

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
| [`string`](utilities.string.md#string) |  the generated absolute URL |
