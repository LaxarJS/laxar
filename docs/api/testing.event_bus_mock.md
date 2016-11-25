
# <a id="event_bus_mock"></a>event_bus_mock

Allows to create mock implementations of [`EventBus`](runtime.event_bus.md), compatible to the "axEventBus" and
"axGlobalEventBus" injections.

## Contents

**Module Members**

- [create()](#create)

**Types**

- [EventBusMock](#EventBusMock)
- [{EventBusMock}](#{EventBusMock})
  - [{EventBusMock}.flush](#{EventBusMock}.flush)

## Module Members

#### <a id="create"></a>create( options )

Creates a mock [`EventBus`](runtime.event_bus.md), compatible to the "axEventBus" injection of a widget.

If no custom tick-scheduler function is passed through the options, the returned event bus has a method
`flush`, to synchronously deliver all pending events, until no events are left.

##### Parameters

| Property | Type | Description |
| -------- | ---- | ----------- |
| _options_ | `Object` |  additional options |
| _options.nextTick_ | `Object` |  an alternative callback for scheduling the next event bus cycle (such as window.setTimeout) |
| _options.errorHandler_ | `Object` |  an alternative error handler, e.g. to inspect error conditions during test |

##### Returns

| Type | Description |
| ---- | ----------- |
| [`EventBusMock`](#EventBusMock) |  a fresh mock instance |

## Types

### <a id="EventBusMock"></a>EventBusMock

> extends [`EventBus`](runtime.event_bus.md#EventBus)

A mock version of [`EventBus`](runtime.event_bus.md).

Offers spied-upon version of the usual axHeartbeat methods, as well as a `flush` method for synchronous
scheduling of heartbeat events, and a `reset` methods to clear all listeners.

### <a id="{EventBusMock}"></a>{EventBusMock}

#### <a id="{EventBusMock}.flush"></a>{EventBusMock}.flush `undefined`
