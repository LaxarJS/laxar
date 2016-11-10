
# <a id="plain_adapter"></a>plain_adapter

Module for the plain widget adapter factory.
In LaxarJS _plain_ widgets are defined as widgets without dependency to a specific view library or
framwork, and instead would be implemented using simple DOM access and manipulation.

A developer will never call any of the API of this module.
The documentation solely exists as a blueprint for custom widget adapters and to explain certain concepts.

## Contents

**Module Members**

- [bootstrap()](#bootstrap)
- [create()](#create)

## Module Members

#### <a id="bootstrap"></a>bootstrap( artifacts, services, anchorElement )

Initializes the adapter module and returns a factory for plain widgets.
Note that the plain adapter doesn't need all the provided arguments, but they are listed here for
documentation purposes.

##### Parameters

| Property | Type | Description |
| -------- | ---- | ----------- |
| artifacts | `Object` |   |
| artifacts.widgets | `Object` |  asfsf |
| artifacts.controls | `Object` |  asfsf |
| services | `Object` |   |
| services.adapterUtilities | `AdapterUtilities` |   |
| services.configuration | [`Configuration`](runtime.configuration.md#Configuration) |   |
| services.globalEventBus | [`EventBus`](runtime.event_bus.md#EventBus) |   |
| services.heartbeat | [`heartbeat`](runtime.heartbeat.md#heartbeat) |   |
| services.log | `Log` |   |
| services.pageService | `PageService` |   |
| services.storage | [`StorageFactory`](runtime.storage.md#StorageFactory) |   |
| services.tooling | `ToolingProviders` |   |
| anchorElement | `Object` |  the DOM node the laxar application is bootstrapped on |

##### Returns

| Type | Description |
| ---- | ----------- |
| `PlainAdapterFactory` |  the factory for plain widget adapters |

#### <a id="create"></a>create( environment )

Creates a new adapter instance for the given widget environment.

##### Parameters

| Property | Type | Description |
| -------- | ---- | ----------- |
| environment | `Object` |  the environment for the widget to create and manage |
| environment.name | `String` |  the name of the widget to load, exactly as specified by the widget descriptor |
| environment.anchorElement | `HTMLElement` |  the DOM node that the widget's DOM fragment should be inserted into |
| environment.services | `Object` |  injectable widget services provided directly by the laxar runtime |
| environment.onBeforeControllerCreation | `Function` |  a function that the adapter must call with a map of all to-be-injected services, just before creating the controller |
| environment.errors | `AdapterErrors` |  contains factory methods to create specific errors that are often needed by adapters |

##### Returns

| Type | Description |
| ---- | ----------- |
| `Object` |  the adapter instance |
