
# <a id="tooling"></a>tooling

Accepts and keeps laxarjs application data from various laxarjs services, and makes it available to
development tools.

## Contents

**Module Members**

- [create()](#create)
- [registerDebugInfo()](#registerDebugInfo)
- [registerItem()](#registerItem)

## Module Members

#### <a id="create"></a>create()

Exposes inspection data from laxarjs services to development tools

#### <a id="registerDebugInfo"></a>registerDebugInfo( debugInfo )

Register a debug info object or callback with the tooling instance.

##### Parameters

| Property | Type | Description |
| -------- | ---- | ----------- |
| debugInfo | `Object`, `Function` |  Debug information as created by `laxar-loader/debug-info`. May be a function accepting a callback. If debug information is needed, the function will be called to load it asynchronously. |

#### <a id="registerItem"></a>registerItem( object )

Register a bootstrapping item with the tooling instance.

##### Parameters

| Property | Type | Description |
| -------- | ---- | ----------- |
| object | `ItemMeta` |   |
