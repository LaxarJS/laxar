# Documentation

## EventBus( [optionalConfiguration] )
Constructor for an event bus.

### Parameters
- **_optionalConfiguration_ {Object}**: configuration for the event bus instance

  - **pendingDidTimeout {Number}**: the timeout in milliseconds used by {@link EventBus#publishAndGatherReplies}. Default is 120000ms



## EventBus#setErrorHandler( errorHandler )
Sets an handler for all errors that may occur during event processing. It receives an error message as
first argument and a map with additional information on the problem as second argument. There may be
instances of `Error` as values within the map.
The default error handler simply logs all issues to `console.error` or `console.log` if available.

### Parameters
- **errorHandler {Function}**: the error handler


## EventBus#setMediator( mediator )
Sets a mediator, that has the chance to alter events shortly before their delivery to the according
subscribers. Its sole argument is the complete list of queued events, that should be delivered during
the current JavaScript event loop. It then needs to return this optionally modified list again. Events
may be added or deleted at will, but the return type needs to be an array containing zero or more event-
like objects.

### Parameters
- **mediator {Function}**: the mediator function


## EventBus#addInspector( inspector )
Adds an inspector, that gets notified when certain actions within the event bus take place. Currently
this includes the following actions:

- `subscribe`: a new subscriber registered for an event
- `publish`: an event is published but not yet delivered
- `deliver`: an event is actually delivered to a subscriber

An inspector receives a map with the following properties:

- `action`: one of the actions from above
- `source`: the origin of the `action`
- `target`: the name of the event subscriber (`deliver` action)
- `event`: the full name of the event or the subscribed event (`subscribe` action)
- `eventObject`: the published event item (`publish` action)
- `subscribedTo`: the event, possibly with omissions, the subscriber subscribed to (`deliver` action)
- `cycleId`: the id of the event cycle

The function returned by this method can be called to remove the inspector again and prevent it from
being called for future event bus actions.

### Parameters
- **inspector {Function}**: the inspector function to add


### Returns
- **{Function}**: a function to remove the inspector


## EventBus#subscribe( eventName, subscriber, [optionalOptions] )
Subscribes to an event by name. An event name consists of so called _topics_, where each topic is
separated from another by dots (`.`). If a topic is omitted, this is treated as a wildcard. Note that
two dots in the middle or one dot at the beginning of an event name must remain, whereas a dot at the
end may be omitted. As such every event name has an intrinsic wildcard at its end. For example these are
all valid event names:

- `some.event`: matches `some.event`, `some.event.again`
- `.event`: matches `some.event`, `any.event`, `any.event.again`
- `some..event`: matches `some.fancy.event`, `some.special.event`

Additionally subtopics are supported. A subtopic are fragments within a topic, separated from another by
simple dashes (`-`). Here only suffixes of subtopics may be omitted when subscribing. Thus subscribing
to `some.event` would match an event published with name `some.event-again` or even
`some.event-another.again`.

When an event is delivered, the subscriber function receives two arguments:
The first one is the event object as it was published. If `clone` yields `true` this is a simple deep
copy of the object (note that only properties passing a JSON-(de)serialization remain). If `false` the
object is frozen using `Object.freeze` recursively in browsers that support freezing. In Any other
browser this is just an identity operation.

The second one is a meta object with these properties:

- `unsubscribe`: A function to directly unsubscribe the called subscriber from further events
- `name`: The name of the event as it actually was delivered (i.e. without wildcards).
- `cycleId`: The cycle the event was delivered in
- `sender`: The id of the event sender, may be `null`.
- `initiator`: The id of the initator of the cycle. Currently not implemented, thus always `null`.
- `options`: The options that were passed to `publish` or `publishAndGatherReplies` respectively.

### Parameters
- **eventName {String}**: the name of the event to subscribe to

- **subscriber {Function}**: a function to call whenever an event matching the name is published

- **_optionalOptions_ {Object}**: additional options for the subscribe action

  - **subscriber {String}**: the id of the subscriber. Default is `null`

  - **clone {Boolean}**: if `false` the event will be send frozen to the subscriber, otherwise it will receive a deep copy.
Default is `true`


## EventBus#unsubscribe( subscriber )
Removes all subscriptions of the given subscriber.

### Parameters
- **subscriber {Function}**: the function to unsubscribe


## EventBus#publish( eventName, [optionalEvent], [optionalOptions] )
Asynchronously publishes an event on the event bus. The returned promise will be queued as soon as this
event is delivered and, if during delivery a new event was enqueued, resolved after that new event was
delivered. If no new event is queued during delivery of this event, the promise is instantly resolved.
To make it a bit clearer, lets assume we publish and thus enqueue an event at time `t`. It then will be
delivered at time `t+1`. At that precise moment the promise is enqueued to be resolved soon. We then
distinguish between two cases:

- At time `t+1` no subscriber publishes (i.e. enqueues) an event: Thus there is no event in the same
  cycle and the promise is also resolved at time `t+1`.
- At least one subscriber publishes an event at time `t+1`: The promise is then scheduled to be resolved
  as soon as this event is delivered at time `t+2`.

The implication of this is the following:

We have two collaborators, A and B. A listens to event b and b listens to event A.
Whenever A publishes a and B than instantly (i.e. in the same event cycle of the JavaScript runtime its
subscriber function was called) "responds" by publishing b, b arrives at the subscriber function of A
before the promise of A's publish action is resolved.
It is hence possible to observe possible effects of an event send by oneself,under the conditions
mentioned above.

### Parameters
- **eventName {String}**: the name of the event to publish

- **_optionalEvent_ {Object}**: the event to publish

- **_optionalOptions_ {Object}**: additional options for the publish action

  - **sender {String}**: the id of the event sender. Default is `null`

  - **deliverToSender {Boolean}**: if `false` the event will not be send to subscribers whose subscriber name matches
`optionalOptions.sender`, else all subscribers will receive the event. Default is `true`


### Returns
- **{Promise}**: the delivery promise


## EventBus#publishAndGatherReplies( eventName, [optionalEvent], [optionalOptions] )
Publishes an event that follows the request-will-did pattern and awaits all replies. This pattern has
evolved over time and is of great use when handling the asynchronous nature of event bus events.

Certain rules need to be fulfilled: First the initiator needs to call this method with an event whose
name has the suffix `Request`, e.g. `takeActionRequest`. All collaborators that want to react to this
event then either do so in the same event cycle by sending a `didTakeAction` event or announce that they
will do something asynchronously by publishing a `willTakeAction` event. In the latter case they need to
broadcast the end of their action by sending a `didTakeAction` event. Note that for both events the same
sender name needs to be given. Otherwise they cannot be mapped and the event bus doesn't know if all
asynchronous replies were already received.

Additionally a timer is started using either the globally configured `pendingDidTimeout` ms value or the
value provided as option to this method. If that timer expires before all did* events to all given will*
events were received, the error handler is called to handle the incident and the promise is resolved as
normally.

### Parameters
- **eventName {String}**: the name of the event to publish

- **_optionalEvent_ {Object}**: the event to publish

- **_optionalOptions_ {Object}**: additional options for the publish action

  - **sender {String}**: the id of the event sender. Default is `null`

  - **pendingDidTimeout {Number}**: the timeout in milliseconds for pending did* events


### Returns
- **{Promise}**: the delivery promise. It receives a list of all collected `did*` events and according meta information
