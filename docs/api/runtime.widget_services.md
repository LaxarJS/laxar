
# <a id="widget_services"></a>widget_services

Factory for the services that are available to the controller of a widget, regardless of the underlying
view framework.

## Contents

**Module Members**

- [axAreaHelper](#axAreaHelper)
- [axAssets](#axAssets)
- [axConfiguration](#axConfiguration)
- [axContext](#axContext)
- [axControls](#axControls)
- [axDebugEventBus](#axDebugEventBus)
- [axEventBus](#axEventBus)
- [axFeatures](#axFeatures)
- [axFlowService](#axFlowService)
- [axGlobalEventBus](#axGlobalEventBus)
- [axGlobalLog](#axGlobalLog)
- [axGlobalStorage](#axGlobalStorage)
- [axHeartbeat](#axHeartbeat)
- [axI18n](#axI18n)
- [axId()](#axId)
- [axLog](#axLog)
- [axStorage](#axStorage)
- [axTooling](#axTooling)
- [axVisibility](#axVisibility)

**Types**

- [AxContext](#AxContext)
  - [AxContext.eventBus](#AxContext.eventBus)
  - [AxContext.features](#AxContext.features)
  - [AxContext.id()](#AxContext.id)
  - [AxContext.log](#AxContext.log)
  - [AxContext.widget](#AxContext.widget)
- [AxAreaHelper](#AxAreaHelper)
  - [AxAreaHelper.isVisible()](#AxAreaHelper.isVisible)
  - [AxAreaHelper.fullName()](#AxAreaHelper.fullName)
  - [AxAreaHelper.localName()](#AxAreaHelper.localName)
  - [AxAreaHelper.register()](#AxAreaHelper.register)
- [AxAssets](#AxAssets)
  - [AxAssets.url()](#AxAssets.url)
  - [AxAssets.forTheme()](#AxAssets.forTheme)
  - [AxAssets.urlForTheme()](#AxAssets.urlForTheme)
- [AxStorage](#AxStorage)
  - [AxStorage.local](#AxStorage.local)
  - [AxStorage.session](#AxStorage.session)
- [AxEventBus](#AxEventBus)

## Module Members

#### <a id="axAreaHelper"></a>axAreaHelper [`AxAreaHelper`](#AxAreaHelper)

Allows to manage the widget's areas.

#### <a id="axAssets"></a>axAssets [`AxAssets`](#AxAssets)

Provides access to the widget's assets.

#### <a id="axConfiguration"></a>axConfiguration [`Configuration`](runtime.configuration.md#Configuration)

Interface to the full configuration the application was bootstrapped with.

#### <a id="axContext"></a>axContext [`AxContext`](#AxContext)

Combines essential widget services with some instance information to be passed around en bloc.

#### <a id="axControls"></a>axControls [`ControlLoader`](loaders.control_loader.md#ControlLoader)

Provides access to implementation modules of the controls used by the widget.

#### <a id="axDebugEventBus"></a>axDebugEventBus [`AxEventBus`](#AxEventBus)

Provides access to a super-global EventBus shared by Laxar instances.

#### <a id="axEventBus"></a>axEventBus [`AxEventBus`](#AxEventBus)

Event bus instance specifically enriched for the widget instance.

#### <a id="axFeatures"></a>axFeatures `Object`

The features the widget was configured with.
Its structure depends on the schema defined in the widget descriptor (`widget.json`).

#### <a id="axFlowService"></a>axFlowService [`FlowService`](runtime.flow_service.md#FlowService)

Allows to generate URLs based on navigation targets or place IDs, in order to create links.

#### <a id="axGlobalEventBus"></a>axGlobalEventBus [`EventBus`](runtime.event_bus.md#EventBus)

The global event bus instance of the application.

The widget-specific [`axEventBus`](runtime.widget_services.md) should always be prefered over this, since subscriptions
to the global event bus will not be cleaned up automatically as clients are destroyed, which
can lead to severe memory leaks.
A valid use case could be an activity that needs to add an inspector to the event bus in order
to provide debuggig information about application events, or to log specific events without
stopping on page navigation.

#### <a id="axGlobalLog"></a>axGlobalLog [`Logger`](runtime.log.md#Logger)

Allows to log messages, taking into account the configured log level.

#### <a id="axGlobalStorage"></a>axGlobalStorage [`StorageFactory`](runtime.storage.md#StorageFactory)

The global storage factory allows to share storage items across widgets.

#### <a id="axHeartbeat"></a>axHeartbeat [`Heartbeat`](runtime.heartbeat.md#Heartbeat)

The heartbeat instance allows to perform actions such as dirty checking after each event
bus cycle.

#### <a id="axI18n"></a>axI18n [`AxI18n`](runtime.widget_services_i18n.md#AxI18n)

I18n API that allows to localize values depending on the locale configured for the widget.

#### <a id="axId"></a>axId( localUniqueId )

A function that generates page-wide unique IDs based on IDs that are unique within the scope
of a widget.

A common use case is the connection of a `label` HTML element and an `input` element via `for`
and `id` attributes.
To avoid collisions, IDs should **always** be generated using this service.

Example:

```js
// ... inject `axId`, get reference to `widgetDom` (depends on integration technology) ...
widgetDom.querySelector( 'label' ).setAttribute( 'for', axId( 'myField' ) );
widgetDom.querySelector( 'input' ).setAttribute( 'id', axId( 'myField' ) );
```

##### Parameters

| Property | Type | Description |
| -------- | ---- | ----------- |
| localUniqueId | `String` |  an identifier that is unique within a widget |

##### Returns

| Type | Description |
| ---- | ----------- |
| `String` |  an identifier that is unique for the current page |

#### <a id="axLog"></a>axLog [`Logger`](runtime.log.md#Logger)

The widget logger instance.
Similar to [`#axGlobalLog`](#axGlobalLog), but adds the name of the widget as prefix and the widget ID
as suffix to every log message.

#### <a id="axStorage"></a>axStorage [`AxStorage`](#AxStorage)

Preconfigured storage API for a widget: all keys are namespaced using the widget ID,
in order to limit item visibility to this specific instance.

#### <a id="axTooling"></a>axTooling [`AxTooling`](tooling.tooling.md#AxTooling)

Access to the tooling provider API.

#### <a id="axVisibility"></a>axVisibility [`AxVisibility`](runtime.widget_services_visibility.md#AxVisibility)

Visibility services for a widget instance.

## Types

### <a id="AxContext"></a>AxContext

This object encapsulates widget context information and provides access to the most important widget
specific service instances.
Most commonly this is used when working with
[LaxarJS Patterns](https://github.com/LaxarJS/laxar-patterns).

#### <a id="AxContext.eventBus"></a>AxContext.eventBus [`AxEventBus`](#AxEventBus)

The event bus instance of the widget. This is the same as [`#axEventBus`](#axEventBus).
#### <a id="AxContext.features"></a>AxContext.features `Object`

The configured features of the widget. This is the same as [`#axFeatures`](#axFeatures).
#### <a id="AxContext.id"></a>AxContext.id()

The unique id generator function. This is the same as [`#axId`](#axId).

#### <a id="AxContext.log"></a>AxContext.log `AxLog`

The widget local log instance. This is the same as [`#axLog`](#axLog).
#### <a id="AxContext.widget"></a>AxContext.widget `Object`

Some information regarding the widget instance.

The following fields are available:
- `area`: full name of the area the widget is located in
- `id`: the unique id of the widget on the page
- `path`: path of the widget that was used to reference it in the according page or composition.
   This is not the actual path on the file system, but most probably an alias known by the used
   module loader.

### <a id="AxAreaHelper"></a>AxAreaHelper

#### <a id="AxAreaHelper.isVisible"></a>AxAreaHelper.isVisible( fullAreaName )

Query if a given widget area is currently visible by accessing the underlying area status through
the page controller. Can be used to determine the current visibility state of an area without
having to constantly observe visibility events.

##### Parameters

| Property | Type | Description |
| -------- | ---- | ----------- |
| fullAreaName | `String` |  the global name of the area |

##### Returns

| Type | Description |
| ---- | ----------- |
| `Boolean` |  the current visibility state of the given area |

#### <a id="AxAreaHelper.fullName"></a>AxAreaHelper.fullName( localAreaName )

Looks up the global name of a widget area within a widget, as generated by LaxarJS.
This is the reverse of [`#AxAreaHelper.localName()`](#AxAreaHelper.localName).

##### Parameters

| Property | Type | Description |
| -------- | ---- | ----------- |
| localAreaName | `String` |  the widget-local name of the area |

##### Returns

| Type | Description |
| ---- | ----------- |
| `String` |  the globally valid name of the area |

#### <a id="AxAreaHelper.localName"></a>AxAreaHelper.localName( fullAreaName )

Returns the local part of a global area name.
This is the reverse of [`#AxAreaHelper.fullName()`](#AxAreaHelper.fullName).

##### Parameters

| Property | Type | Description |
| -------- | ---- | ----------- |
| fullAreaName | `String` |  the global name of the area |

##### Returns

| Type | Description |
| ---- | ----------- |
| `String` |  the name of the area as it is known to the widget |

#### <a id="AxAreaHelper.register"></a>AxAreaHelper.register( localAreaName, element )

Registers a DOM element as area of a widget with the area helper.

##### Parameters

| Property | Type | Description |
| -------- | ---- | ----------- |
| localAreaName | `String` |  the widget-local name of the area |
| element | `HTMLElement` |  the element to register as widget area |

### <a id="AxAssets"></a>AxAssets

_Note:_ This service is a function with the [`#AxAssets.url()`](#AxAssets.url), [`#AxAssets.forTheme()`](#AxAssets.forTheme) and
[`#AxAssets.urlForTheme()`](#AxAssets.urlForTheme) functions as properties.

Resolves an asset located directly in the widget folder or a subfolder of it.
Valid assets are all non-binary files like JSON or text files.
For binary files there exists the [`#AxAssets.url`](#AxAssets.url) function.

Example:
```js
// ... inject `axAssets` ...
axAssets( 'data.json' ).then( fileContent => { ... } );
```

##### Parameters

| Property | Type | Description |
| -------- | ---- | ----------- |
| name | `String` |  name of the asset to resolve |

##### Returns

| Type | Description |
| ---- | ----------- |
| `Promise` |  promise for the asset |

#### <a id="AxAssets.url"></a>AxAssets.url( name )

Resolves the absolute url to the given asset located directly in the widget folder or a subfolder of
it.
This can then be safely used in e.g. `video` or `img` tags.

Example:
```js
// ... inject `axAssets`, find `img` in DOM ...
axAssets.url( 'tux.jpg' ).then( url => { img.src = url; } );
```

##### Parameters

| Property | Type | Description |
| -------- | ---- | ----------- |
| name | `String` |  name of the asset the url should be returned of |

##### Returns

| Type | Description |
| ---- | ----------- |
| `Promise` |  promise for the url |

#### <a id="AxAssets.forTheme"></a>AxAssets.forTheme( name )

Resolves an asset from one of the `*.theme` subfolders of the widget.
The folder from which the asset is taken, depends on the selected theme and the availability of the
file within that theme (See
[here](http://laxarjs.org/docs/laxar-latest/manuals/creating_themes/#how-the-runtime-finds-css) for
further information on theme asset lookup).
Valid assets are all non-binary files like JSON or text files.
For binary files there exists the [`#AxAssets.urlForTheme`](#AxAssets.urlForTheme) function.

Example:
```js
// ... inject `axAssets` ...
axAssets.forTheme( 'some-template.html' ).then( template => { ... } );
```

##### Parameters

| Property | Type | Description |
| -------- | ---- | ----------- |
| name | `String` |  name of the asset to resolve |

##### Returns

| Type | Description |
| ---- | ----------- |
| `Promise` |  promise for the asset |

#### <a id="AxAssets.urlForTheme"></a>AxAssets.urlForTheme( name )

Resolves the absolute url to the given asset from one of the `*.theme` subfolders of the widget.
This can then be safely used in e.g. `video` or `img` tags.
The folder from which the asset is taken, depends on the selected theme and the availability of the
file within that theme (See
[here](http://laxarjs.org/docs/laxar-latest/manuals/creating_themes/#how-the-runtime-finds-css) for
further information on theme asset lookup).

Example:
```js
// ... inject `axAssets`, find `img` in DOM ...
axAssets.urlForTheme( 'icon.jpg' ).then( url => { img.src = url; } );
```

##### Parameters

| Property | Type | Description |
| -------- | ---- | ----------- |
| name | `String` |  name of the asset the url should be returned of |

##### Returns

| Type | Description |
| ---- | ----------- |
| `Promise` |  promise for the url |

### <a id="AxStorage"></a>AxStorage

Ready to use storage API for a single widget instance.
All keys are namespaced by the widget id to limit visibility to this specific instance.

#### <a id="AxStorage.local"></a>AxStorage.local [`StorageApi`](runtime.storage.md#StorageApi)

An instance of the storage api using the persistent `window.localStorage`.
#### <a id="AxStorage.session"></a>AxStorage.session [`StorageApi`](runtime.storage.md#StorageApi)

An instance of the storage api using the non-persistent `window.sessionStorage`.

### <a id="AxEventBus"></a>AxEventBus

This is an extension of the global [`EventBus`](runtime.event_bus.md#EventBus) by widget specific information
and tasks.
For example a combination of the widget's name and its id is always used as subscriber and sender
id.
Hence for example [`EventBus.publishAndGatherReplies`](runtime.event_bus.md#EventBus.publishAndGatherReplies)
works without passing in any options.

Additionally all subscriptions of a widget are removed as soon as the widget itself is destroyed.
So in practice a widget will receive no further events after the `endLifecycleRequest` event
processing has finished.

The documentation for the events bus api can be found [here](runtime.event_bus.md).
