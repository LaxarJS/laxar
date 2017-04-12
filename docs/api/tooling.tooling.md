
# <a id="tooling"></a>tooling

Accepts and keeps laxarjs application data from various laxarjs services, and makes it available to
development tools.

## Contents

**Module Members**

- [create()](#create)

**Types**

- [AxTooling](#AxTooling)
  - [AxTooling.forItem()](#AxTooling.forItem)
  - [AxTooling.registerDebugInfo()](#AxTooling.registerDebugInfo)
  - [AxTooling.registerItem()](#AxTooling.registerItem)
  - [AxTooling.onChange()](#AxTooling.onChange)
  - [AxTooling.unsubscribe()](#AxTooling.unsubscribe)
  - [AxTooling.pages](#AxTooling.pages)

## Module Members

#### <a id="create"></a>create()

Exposes inspection data from laxarjs services to development tools

## Types

### <a id="AxTooling"></a>AxTooling

#### <a id="AxTooling.forItem"></a>AxTooling.forItem( itemMeta )

Get an [`#AxTooling`](#AxTooling) interface for the given bootstrapping item.

##### Parameters

| Property | Type | Description |
| -------- | ---- | ----------- |
| itemMeta | `ItemMeta` |  an object identifying the bootstrapping item |

##### Returns

| Type | Description |
| ---- | ----------- |
| [`AxTooling`](#AxTooling) |  a tooling API for the given bootstrapping item |

#### <a id="AxTooling.registerDebugInfo"></a>AxTooling.registerDebugInfo( debugInfo )

Register a debug info object or callback with the tooling instance. Debug information can be generated
with `laxar-loader/debug-info` and may be in the form a function accepting a callback.
If debug information is needed, the function will be called to load it asynchronously.

##### Parameters

| Property | Type | Description |
| -------- | ---- | ----------- |
| debugInfo | `Object`, `Function` |  a debug information callback or object |

#### <a id="AxTooling.registerItem"></a>AxTooling.registerItem( itemMeta )

Register a bootstrapping item with the tooling instance.

##### Parameters

| Property | Type | Description |
| -------- | ---- | ----------- |
| itemMeta | `ItemMeta` |  an object identifying the bootstrapping item |

#### <a id="AxTooling.onChange"></a>AxTooling.onChange( callback )

Register a function to be called when the composition of active observed itemschanges.

##### Parameters

| Property | Type | Description |
| -------- | ---- | ----------- |
| callback | `Function` |  a function to call with updated debug information |

##### Returns

| Type | Description |
| ---- | ----------- |
| [`AxTooling`](#AxTooling) |  the tooling instance |

#### <a id="AxTooling.unsubscribe"></a>AxTooling.unsubscribe( callback )

Unsubscribe a registered [`#AxTooling.onChange`](#AxTooling.onChange) callback

##### Parameters

| Property | Type | Description |
| -------- | ---- | ----------- |
| callback | `Function` |  a function that was previously passed to [`#AxTooling.onChange`](#AxTooling.onChange) |

##### Returns

| Type | Description |
| ---- | ----------- |
| [`AxTooling`](#AxTooling) |  the tooling instance |

#### <a id="AxTooling.pages"></a>AxTooling.pages [`PagesTooling`](tooling.pages.md#PagesTooling)

A [`PagesTooling`](tooling.pages.md) interface to the [`AxTooling`](tooling.tooling.md) instance.
