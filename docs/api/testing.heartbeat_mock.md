
# <a id="heartbeat_mock"></a>heartbeat_mock

Allows to create mock implementations of [`Heartbeat`](runtime.heartbeat.md), compatible to the "axHeartbeat" injection.

## Contents

**Module Members**

- [create()](#create)

**Types**

- [HeartbeatMock](#HeartbeatMock)
  - [HeartbeatMock.reset()](#HeartbeatMock.reset)
  - [HeartbeatMock.flush()](#HeartbeatMock.flush)

## Module Members

#### <a id="create"></a>create()

Creates a mock for the "axHeartbeat" injection of a widget.

##### Returns

| Type | Description |
| ---- | ----------- |
| [`HeartbeatMock`](#HeartbeatMock) |  a fresh mock instance |

## Types

### <a id="HeartbeatMock"></a>HeartbeatMock

> extends [`Heartbeat`](runtime.heartbeat.md#Heartbeat)

A mock version of [`Heartbeat`](runtime.heartbeat.md), with additional methods.

Offers spied-upon version of the usual axHeartbeat methods, as well as a `flush` method for synchronous
scheduling of heartbeat events, and a `reset` methods to clear all listeners.

#### <a id="HeartbeatMock.reset"></a>HeartbeatMock.reset()

Reset the internal state of the mock, clearing all `onBeforeNext`, `onNext` and `onAfterNext`
callbacks.

#### <a id="HeartbeatMock.flush"></a>HeartbeatMock.flush()

If any `onNext` callbacks have been schedules, synchronously runs all scheduled `onBeforeNext`,
`onNext` and `onAfterNext` callbacks, clearing the corresponding queues in the process.
