
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
  - [{EventBusMock}.drainAsync()](#{EventBusMock}.drainAsync)

## Module Members

#### <a id="create"></a>create( options )

Creates a mock [`EventBus`](runtime.event_bus.md), compatible to the "axEventBus" injection of a widget.

If no custom tick-scheduler function is passed through the options, the returned event bus has a method
`flush`, to synchronously deliver all pending as well as synchronously added events. It also has a method
drainAsync` to asynchronously run event handlers to completion, including additional asynchronously
published events.

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

Offers spied-upon version of the usual axEventBus methods, as well as a `flush` method for synchronous
scheduling of events, and a `drainAsync` to asynchronously run event handlers to completion.

### <a id="{EventBusMock}"></a>{EventBusMock}

#### <a id="{EventBusMock}.flush"></a>{EventBusMock}.flush `undefined`

Flushes all pending events and runs their subscriber callbacks.
If new events are published synchronously from subscriber callbacks, these will also be processed.

This operation happens synchronously, so asynchronously triggered events (e.g. those published from a
then handler) may not be processed.
#### <a id="{EventBusMock}.drainAsync"></a>{EventBusMock}.drainAsync()

Asynchronously flushes pending events and runs their subscriber callbacks.
If new events are published synchronously from subscriber callbacks, these will also be processed.
Additionally, if new events are published asynchronously but immediately (i.e. right after a call to
Promise.resolve), they will be processed as well.

This operation happens *asynchronously*, so callers need to wait on the returned promise in order to
observe the effects.

##### Returns

| Type | Description |
| ---- | ----------- |
| `Promise` |  a promise that is resolved when all events have been processed, and no more have been scheduled |
