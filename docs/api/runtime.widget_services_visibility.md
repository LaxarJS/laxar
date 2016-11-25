
# <a id="widget_services_visibility"></a>widget_services_visibility

Factory for i18n widget service instances.

## Contents

**Module Members**

- [create()](#create)

**Types**

- [AxVisibility](#AxVisibility)
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

#### <a id="AxVisibility.track"></a>AxVisibility.track( enabled, property )

Starts tracking visibility as a property on the context.

##### Parameters

| Property | Type | Description |
| -------- | ---- | ----------- |
| enabled | `Boolean` |  If `true` (default) an event bus subscription will be maintained to track visibility changes of the current widget by updating a managed property on the context. If `false`, any existing subscription will be cancelled. If set, the context property will *not* be removed. |
| property | `String` |  The name of the context property to maintain. Changing the property name after tracking has started once will not remove previously created properties. |

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
