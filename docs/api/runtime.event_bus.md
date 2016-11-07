
# <a name="event_bus"></a>event_bus

The *event_bus* module contains the implementation of the *LaxarJS EventBus*.
In an application you'll never use this module or instantiate an event bus instance directly.
Instead within a widget the event bus can be injected as `axEventBus` or accessed as property on the
`axContext` injection.

## Contents

**Module Members**

- [create()](#create)

**Types**

- [EventBus](#EventBus)
  - [EventBus.addInspector()](#EventBus.addInspector)
  - [EventBus.subscribe()](#EventBus.subscribe)
  - [EventBus.publish()](#EventBus.publish)
  - [EventBus.publishAndGatherReplies()](#EventBus.publishAndGatherReplies)

## Module Members

#### <a name="create"></a>create( configuration, log, nextTick, timeoutFunction, errorHandler )

Creates and returns a new event bus instance using the given configuration.

##### Parameters

| Property | Type | Description |
| -------- | ---- | ----------- |
| configuration | `Object` |  configuration for the event bus instance. The key `eventBusTimeoutMs` is used to determine the will/did timeout. |
| log | `Object` |  a logger to use for error reporting |
| nextTick | `Function` |  a next tick function like `process.nextTick` or AngularJS' `$timeout` |
| timeoutFunction | `Function` |  a timeout function like `window.setTimeout` or AngularJS' `$timeout` |
| _errorHandler_ | `Function` |  a custom handler for thrown exceptions. By default exceptions are logged using the global logger. |

##### Returns

| Type | Description |
| ---- | ----------- |
| [`EventBus`](#EventBus) |  an event bus instance |

## Types

### <a name="EventBus"></a>EventBus

#### <a name="EventBus.addInspector"></a>EventBus.addInspector( inspector )

Adds an inspector, that gets notified when certain actions within the event bus take place. Currently
these actions may occur:

- `subscribe`: a new subscriber registered for an event
- `publish`: an event is published but not yet delivered
- `deliver`: an event is actually delivered to a subscriber

An inspector receives a map with the following properties:

- `action`: one of the actions from above
- `source`: the origin of the `action`
- `target`: the name of the event subscriber (`deliver` action only)
- `event`: the full name of the event or the subscribed event (`subscribe` action only)
- `eventObject`: the published event item (`publish` action only)
- `subscribedTo`: the event, possibly with omissions, the subscriber subscribed to (`deliver` action only)
- `cycleId`: the id of the event cycle

The function returned by this method can be called to remove the inspector again and prevent it from
being called for future event bus actions.

##### Parameters

| Property | Type | Description |
| -------- | ---- | ----------- |
| inspector | `Function` |  the inspector function to add |

##### Returns

| Type | Description |
| ---- | ----------- |
| `Function` |  a function to remove the inspector |

#### <a name="EventBus.subscribe"></a>EventBus.subscribe( eventName, subscriber, optionalOptions )

Subscribes to an event by name. An event name consists of so called *topics*, where each topic is
separated from another by dots (`.`). If a topic is omitted, this is treated as a wildcard. Note that
two dots in the middle or one dot at the beginning of an event name must remain, whereas a dot at the
end may be omitted. As such every event name has an intrinsic wildcard at its end. For example these are
all valid event names:

- `some.event`: matches `some.event`, `some.event.again`
- `.event`: matches `some.event`, `any.event`, `any.event.again`
- `some..event`: matches `some.fancy.event`, `some.special.event`

Additionally *subtopics* are supported. Subtopics are fragments of a topic, separated from another by
simple dashes (`-`). Here only suffixes of subtopics may be omitted when subscribing. Thus subscribing
to `some.event` would match an event published with name `some.event-again` or even
`some.event-another.again`.

**The subscriber function**

When an event is delivered, the subscriber function receives two arguments:
The first one is the event object as it was published. If `optionalOptions.clone` yields `true` this is a
simple deep copy of the object (note that only properties passing a JSON-(de)serialization remain). If
`false` the object is frozen using `Object.freeze` recursively.

The second one is a meta object with these properties:

- `name`: The name of the event as it actually was published (i.e. without wildcards).
- `cycleId`: The id of the cycle the event was published (and delivered) in
- `sender`: The id of the event sender, may be `null`.
- `initiator`: The id of the initiator of the cycle. Currently not implemented, thus always `null`.
- `options`: The options that were passed to `publish` or `publishAndGatherReplies` respectively.

##### Parameters

| Property | Type | Description |
| -------- | ---- | ----------- |
| eventName | `String` |  the name of the event to subscribe to |
| subscriber | `Function` |  a function to call whenever an event matching `eventName` is published |
| _optionalOptions_ | `Object` |  additional options for the subscribe action |
| _optionalOptions.subscriber=null_ | `String` |  the id of the subscriber. Default is `null` |
| _optionalOptions.clone=true_ | `Boolean` |  if `false` the event will be send frozen to the subscriber, otherwise it will receive a deep copy. Default is `true` |

##### Returns

| Type | Description |
| ---- | ----------- |
| `Function` |  a function that when called unsubscribes from this subscription again |

#### <a name="EventBus.publish"></a>EventBus.publish( eventName, optionalEvent, optionalOptions )

Asynchronously publishes an event on the event bus. The returned promise will be enqueued as soon as this
event is delivered and, if during delivery a new event was enqueued, resolved after that new event was
delivered. If no new event is published during delivery of this event, the promise is instantly resolved.
To make this a bit clearer, lets assume we publish and thus enqueue an event at time `t`. It then will
be delivered at time `t+1`. At that precise moment the promise is enqueued to be resolved soon. We then
distinguish between two cases:

- At time `t+1` no subscriber publishes (i.e. enqueues) an event: Thus there is no event in the same
  cycle and the promise is also resolved at time `t+1`.
- At least one subscriber publishes an event at time `t+1`: The promise is then scheduled to be resolved
  as soon as this event is delivered at time `t+2`.

The implication of this is the following:

We have two collaborators, A and B. A listens to event b and B listens to event a.
Whenever A publishes a and B than instantly (i.e. in the same event cycle of the JavaScript runtime
where its subscriber function was called) *responds* by publishing b, b arrives at the subscriber
function of A, before the promise of A's publish action is resolved.
It is hence possible to observe possible effects of an event sent by oneself, under the conditions
mentioned above. Practically this is used internally for the implementation of
[`#EventBus.publishAndGatherReplies()`](#EventBus.publishAndGatherReplies).

##### Parameters

| Property | Type | Description |
| -------- | ---- | ----------- |
| eventName | `String` |  the name of the event to publish |
| _optionalEvent_ | `Object` |  the event to publish |
| _optionalOptions_ | `Object` |  additional options for the publish action |
| _optionalOptions.sender=null_ | `String` |  the id of the event sender. Default is `null` |
| _optionalOptions.deliverToSender=true_ | `Boolean` |  if `false` the event will not be send to subscribers whose subscriber name matches `optionalOptions.sender`, else all subscribers will receive the event. Default is `true` |

##### Returns

| Type | Description |
| ---- | ----------- |
| `Promise` |  the delivery promise |

#### <a name="EventBus.publishAndGatherReplies"></a>EventBus.publishAndGatherReplies( eventName, optionalEvent, optionalOptions )

Publishes an event that follows the *request-will-did pattern* and awaits all replies. This pattern has
evolved over time and is of great use when handling the asynchronous nature of event bus events.

Certain rules need to be fulfilled: First the initiator needs to call this method with an event whose
name has the suffix `Request`, e.g. `takeActionRequest`. All collaborators that want to react to this
event then either do so in the same event cycle by sending a `didTakeAction` event or announce that they
will do something asynchronously by publishing a `willTakeAction` event. In the latter case they need to
broadcast the fulfillment of their action some time later by sending a `didTakeAction` event. Note that for
both events the same sender name needs to be given. Otherwise they cannot be mapped and the event bus
doesn't know if all asynchronous replies were already received.

Additionally a timer is started using either the globally configured `pendingDidTimeout` ms value or the
value provided as option to this method. If that timer expires before all `did*` events to all given
`will*` events were received, the error handler is called to handle the incident and the promise is
rejected with all responses received up to now.

##### Parameters

| Property | Type | Description |
| -------- | ---- | ----------- |
| eventName | `String` |  the name of the event to publish |
| _optionalEvent_ | `Object` |  the event to publish |
| _optionalOptions_ | `Object` |  additional options for the publish action |
| _optionalOptions.sender=null_ | `String` |  the id of the event sender. Default is `null` |
| _optionalOptions.pendingDidTimeout_ | `Number` |  the timeout in milliseconds for pending did* events. Default is the timeout option used when the event bus instance was created |

##### Returns

| Type | Description |
| ---- | ----------- |
| `Promise` |  the delivery promise. It receives a list of all collected `did*` events and according meta information |
