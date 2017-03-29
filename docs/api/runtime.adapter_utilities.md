
# <a id="adapter_utilities"></a>adapter_utilities

Several factory methods for creating error objects that are useful for almost any adapter.

## Contents

**Module Members**

- [activityAccessingDom()](#activityAccessingDom)
- [unknownInjection()](#unknownInjection)

**Types**

- [AdapterUtilities](#AdapterUtilities)

## Module Members

#### <a id="activityAccessingDom"></a>activityAccessingDom( details )

Creates (but does not throw) an error indicating that an activity tried accessing the DOM.

##### Parameters

| Property | Type | Description |
| -------- | ---- | ----------- |
| details | `Object` |  details for the error |
| details.technology | `String` |  the complaining adapter's technology |
| details.widgetName | `String` |  the canonical name of the activity causing the problem |

##### Returns

| Type | Description |
| ---- | ----------- |
| `Error` |  the error, ready to throw |

#### <a id="unknownInjection"></a>unknownInjection( details )

Creates (but does not throw) an error indicating that a widget requested an injection that cannot be
provided by the adapter.

##### Parameters

| Property | Type | Description |
| -------- | ---- | ----------- |
| details | `Object` |  details for the error |
| details.technology | `String` |  the complaining adapter's technology |
| details.injection | `String` |  the failing injection |
| details.widgetName | `String` |  the canonical name of the widget causing the problem |

##### Returns

| Type | Description |
| ---- | ----------- |
| `Error` |  the error, ready to throw |

## Types

### <a id="AdapterUtilities"></a>AdapterUtilities

Provides access to the configuration that was passed during application bootstrapping.

A *Configuration* instance provides convenient readonly access to the underlying LaxarJS
application bootstrapping configuration. The configuration values are passed to
[`laxar#create()`](-unknown-#create) on startup (before LaxarJS v2.x, these configuration values were read from
`window.laxar`). When using the LaxarJS application template, the configuration values are set in the
file `init.js` under your project's root directory.
