
# <a id="widget_services_visibility"></a>widget_services_visibility

Factory for i18n widget service instances.

## Contents

**Module Members**

- [create()](#create)

**Types**

- [AxVisibility](#AxVisibility)
  - [AxVisibility.isVisible()](#AxVisibility.isVisible)
  - [AxVisibility.onHide()](#AxVisibility.onHide)
  - [AxVisibility.onShow()](#AxVisibility.onShow)
  - [AxVisibility.onChange()](#AxVisibility.onChange)
  - [AxVisibility.track()](#AxVisibility.track)
  - [AxVisibility.updateAreaVisibility()](#AxVisibility.updateAreaVisibility)
  - [AxVisibility.updateWidgetVisibility()](#AxVisibility.updateWidgetVisibility)
  - [AxVisibility.unsubscribe()](#AxVisibility.unsubscribe)

## Module Members

#### <a id="create"></a>create( context, areaHelper )

Creates a widget-specific helper for `didChangeAreaVisibility` events.

##### Parameters

| Property | Type | Description |
| -------- | ---- | ----------- |
| context | [`AxContext`](runtime.widget_services.md#AxContext) |  the widget context/scope that the handler should work with. It uses the `eventBus` property there with which it can do the event handling. The visibility handler will set the boolean context property `isVisible` which can be used to determine the visibility state of the entire widget, e.g. for use in templates. |
| areaHelper | [`AxAreaHelper`](runtime.widget_services.md#AxAreaHelper) |  an area helper to qualify/unqualify names for this widget's areas |

##### Returns

| Type | Description |
| ---- | ----------- |
| [`AxVisibility`](#AxVisibility) |  a visibility handler instance |

## Types

### <a id="AxVisibility"></a>AxVisibility

#### <a id="AxVisibility.isVisible"></a>AxVisibility.isVisible()

Query the current visibility state.

##### Returns

| Type | Description |
| ---- | ----------- |
| `Boolean` |  this current visibility status as determined through eventBus events |

#### <a id="AxVisibility.onHide"></a>AxVisibility.onHide( callback )

Registers a callback to be run when this widget becomes hidden.

##### Parameters

| Property | Type | Description |
| -------- | ---- | ----------- |
| callback | `Function` |  a callback to be invoked whenever the widget becomes visible, with a boolean argument indicating the new visibility state (`false`). The callback will *not* be invoked for the start value (`false`). |

##### Returns

| Type | Description |
| ---- | ----------- |
| [`AxVisibility`](#AxVisibility) |  this instance for chaining |

#### <a id="AxVisibility.onShow"></a>AxVisibility.onShow( callback )

Registers a callback to be run when this widget becomes visbile.

##### Parameters

| Property | Type | Description |
| -------- | ---- | ----------- |
| callback | `Function` |  a callback to be invoked whenever the widget becomes visible, with a boolean argument indicating the new visibility state (`true`). |

##### Returns

| Type | Description |
| ---- | ----------- |
| [`AxVisibility`](#AxVisibility) |  this instance for chaining |

#### <a id="AxVisibility.onChange"></a>AxVisibility.onChange( callback )

Registers a callback for changes to this widget's visibility.

##### Parameters

| Property | Type | Description |
| -------- | ---- | ----------- |
| callback | `Function` |  a callback to be invoked whenever the widget visibility changes, with a boolean argument indicating the new visibility state. The callback will *not* be invoked for the start value (`false`). |

##### Returns

| Type | Description |
| ---- | ----------- |
| [`AxVisibility`](#AxVisibility) |  this instance for chaining |

#### <a id="AxVisibility.track"></a>AxVisibility.track( property )

Starts tracking visibility as a property on the context.

Calling this repeatedly with different property names will stop previous properties from receiving
further updates, but will not remove previously set tracking properties from the context object.

##### Parameters

| Property | Type | Description |
| -------- | ---- | ----------- |
| property | `String` |  the name of the context property to maintain |

##### Returns

| Type | Description |
| ---- | ----------- |
| [`AxVisibility`](#AxVisibility) |  this instance for chaining |

#### <a id="AxVisibility.updateAreaVisibility"></a>AxVisibility.updateAreaVisibility( visibilityByLocalArea, optionalOptions )

Triggers a visibility change to the given area. The visibility of the area and its nested areas is
re-evaluated over the event bus. Use this to implement e.g. tabbing/accordion/expander widgets.

##### Parameters

| Property | Type | Description |
| -------- | ---- | ----------- |
| visibilityByLocalArea | `Object` |  A mapping of local area names (without the widget ID) to their new visibility state (Boolean). Areas that are omitted here are left as is. Areas that have not been set at all just assume the visibility state of the containing area. |
| _optionalOptions_ | `Object` |  Additional options |
| _optionalOptions.overrideContainer_ | `Object` |  Allows the specified areas to become visible even if the widget's container area is not visible. |

##### Returns

| Type | Description |
| ---- | ----------- |
| `Promise` |  a promise that is resolved (without a value) when the visibility change was applied |

#### <a id="AxVisibility.updateWidgetVisibility"></a>AxVisibility.updateWidgetVisibility( visible )

Triggers a visibility change the widget itself and all its areas, always overriding its container
visibility with the given value.
This simplifies implementing popup/popover/layer widgets, which always live in an invisible container
area, but need to show/hide all their owned areas.

To control the visibility of individual areas, use #updateAreaVisibility

##### Parameters

| Property | Type | Description |
| -------- | ---- | ----------- |
| visible | `Boolean` |  The new visibility state of the widget. |

##### Returns

| Type | Description |
| ---- | ----------- |
| [`AxVisibility`](#AxVisibility) |  this instance for chaining |

#### <a id="AxVisibility.unsubscribe"></a>AxVisibility.unsubscribe( callback )

Remove the given callback (registered through one or more of the on... methods) from any subscriptions.

##### Parameters

| Property | Type | Description |
| -------- | ---- | ----------- |
| callback | `Function` |  a callback that was previously registered using any of the `on...` methods. It will be removed from all registrations. Passing an unknown callback has no effect. |

##### Returns

| Type | Description |
| ---- | ----------- |
| [`AxVisibility`](#AxVisibility) |  this instance for chaining |
