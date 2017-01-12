
# <a id="plain_adapter"></a>plain_adapter

Module for the plain widget adapter factory.
In LaxarJS _plain_ widgets are defined as widgets without dependency to a specific view library or
framwork, and instead would be implemented using simple DOM access and manipulation.

A developer will never call any of the API of this module.
The documentation solely exists as a blueprint for custom widget adapters and to explain certain concepts.

## Contents

**Module Members**

- [bootstrap()](#bootstrap)

**Types**

- [PlainAdapterFactory](#PlainAdapterFactory)
  - [PlainAdapterFactory.create()](#PlainAdapterFactory.create)

## Module Members

#### <a id="bootstrap"></a>bootstrap( artifacts, services, anchorElement )

Initializes the adapter module and returns a factory for plain widgets.
Note that the plain adapter doesn't need all the provided arguments, but they are listed here for
documentation purposes.

##### Parameters

| Property | Type | Description |
| -------- | ---- | ----------- |
| artifacts | `Object` |  the artifacts available to this adapter factory |
| artifacts.widgets | `Object` |  all widgets, that are implemented in the adapter's technology |
| artifacts.controls | `Object` |  all controls, that are implemented in the adapter's technology |
| services | `Object` |  a selection of services adapter implementations may need to fulfill their task |
| services.adapterUtilities | [`AdapterUtilities`](runtime.adapter_utilities.md#AdapterUtilities) |  common utilities, that may be useful to a widget adapter |
| services.artifactProvider | `ArtifactProvider` |  the artifact provider instance |
| services.configuration | [`Configuration`](runtime.configuration.md#Configuration) |  access to the application configuration |
| services.globalEventBus | [`EventBus`](runtime.event_bus.md#EventBus) |  the global event bus. Note that an adapter should not sent any events by itself. It may instead be necessary that the adapter makes the event bus globally available to its widgets (for example like the AngularJS 1.x adapter), or that it registers an inspector |
| services.heartbeat | [`Heartbeat`](runtime.heartbeat.md#Heartbeat) |  the heartbeat instance. Depending on the underlying view technology (like AngularJS 1.x) it may be important to get notified when to re-render the user interface. For that reason an adapter can register a callback at the heartbeat, that gets called after all events of the current cycle were processed |
| services.log | `Log` |  the global log instance |
| services.storage | [`StorageFactory`](runtime.storage.md#StorageFactory) |  the global storage factory api |
| services.tooling | `Tooling` |  access to the tooling api |
| anchorElement | `HTMLElement` |  the DOM node the laxar application is bootstrapped on. An adapter should never try to access DOM nodes that are not the `anchorElement` or any of its children, since they are not under control of this LaxarJS application. |

##### Returns

| Type | Description |
| ---- | ----------- |
| [`PlainAdapterFactory`](#PlainAdapterFactory) |  the factory for plain widget adapters |

## Types

### <a id="PlainAdapterFactory"></a>PlainAdapterFactory

A factory for plain widget adapters.

#### <a id="PlainAdapterFactory.create"></a>PlainAdapterFactory.create( environment )

Creates a new adapter instance for the given widget environment.

##### Parameters

| Property | Type | Description |
| -------- | ---- | ----------- |
| environment | `Object` |  the environment for the widget to create and manage |
| environment.anchorElement | `HTMLElement` |  the DOM node that the widget's DOM fragment should be inserted into |
| environment.name | `String` |  the name of the widget to load, exactly as specified by the widget descriptor |
| environment.services | [`widget_services`](runtime.widget_services.md#widget_services) |  the services for this widget instance |
| environment.onBeforeControllerCreation | `Function` |  a function that the adapter must call with a map of all to-be-injected services, just before creating the controller |

##### Returns

| Type | Description |
| ---- | ----------- |
| `Object` |  the adapter instance |
