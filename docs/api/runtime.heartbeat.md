
# <a name="heartbeat"></a>heartbeat

Scheduler for tasks that possibly synchronously trigger creation of new tasks, that need some common work
to be done before or after all of these tasks (and all tasks scheduled in the meantime) are finished.

## Contents

**Types**

- [Heartbeat](#Heartbeat)
  - [Heartbeat.registerHeartbeatListener()](#Heartbeat.registerHeartbeatListener)
  - [Heartbeat.onNext()](#Heartbeat.onNext)
  - [Heartbeat.onBeforeNext()](#Heartbeat.onBeforeNext)
  - [Heartbeat.onAfterNext()](#Heartbeat.onAfterNext)

## Types

### <a name="Heartbeat"></a>Heartbeat

#### <a name="Heartbeat.registerHeartbeatListener"></a>Heartbeat.registerHeartbeatListener( listener )

Registers a listener, that is called whenever a heartbeat occurs.
It is called after the before and next queues were processed, but before working off the after queue has
started.
In contrast to the `on*` methods, listeners are not removed after a tick, but will be called again each
time a heartbeat occurs.
Instead this method returns a function to manually remove the listener again.

##### Parameters

| Property | Type | Description |
| -------- | ---- | ----------- |
| listener | `Function` |  the listener to register |

##### Returns

| Type | Description |
| ---- | ----------- |
| `Function` |  a function to remove the listener again |

#### <a name="Heartbeat.onNext"></a>Heartbeat.onNext( func )

Schedules a function for the next heartbeat.
If no heartbeat was triggered yet, it will be requested now.

##### Parameters

| Property | Type | Description |
| -------- | ---- | ----------- |
| func | `Function` |  a function to schedule for the next tick |

#### <a name="Heartbeat.onBeforeNext"></a>Heartbeat.onBeforeNext( func )

Schedules a function to be called before the next heartbeat occurs.
Note that `func` may never be called, if there is no next heartbeat since calling this function won't
trigger a new heartbeat.

##### Parameters

| Property | Type | Description |
| -------- | ---- | ----------- |
| func | `Function` |  a function to call before the next heartbeat |

#### <a name="Heartbeat.onAfterNext"></a>Heartbeat.onAfterNext( func )

Schedules a function to be called after the next heartbeat occured.
Note that `func` may never be called, if there is no next heartbeat since calling this function won't
trigger a new heartbeat.

##### Parameters

| Property | Type | Description |
| -------- | ---- | ----------- |
| func | `Function` |  a function to call after the next heartbeat |
