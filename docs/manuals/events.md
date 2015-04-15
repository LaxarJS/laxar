[« return to the manuals](index.md)

Preliminary readings:

* [LaxarJS Core Concepts](../concepts.md)


# Events and Publish-Subscribe

The key concept that distinguishes LaxarJS applications from other AngularJS applications is the _publish-subscribe_ (or _pub/sub_) architecture.
It helps to isolate building blocks such as widgets and activities by moving the coupling from implementation (no module imports, no service contracts) to configuration (of event topics).

LaxarJS consistently uses the term _events_ rather than _messages_, to point out two key aspects of its pub/sub-architecture:
 * events convey information about _what happened_ (rather than _who is receiver_)
 * delivery is always _asynchronous_ (using an _event loop_)

For these reasons, you may also think of this pattern as a variation on the _hollywood principle_ ("Don't call us, we'll call you").

For efficient processing, LaxarJS ties into the AngularJS `$digest`-cycle.
This allows the web browser to batch event-handling with other operations that modify screen contents.


## The Event Bus

All events are published to and delivered by the _event bus_:
The event bus manages _name-based_ (or _topic-based)_ _event subscriptions_ for all interested widgets and activities (the _subscribers)_:
Subscribers specify an event name pattern that tells the event bus which kinds of "thing that happened" they are interested in.
When an event is published to the event bus, it is kept in an event queue, to be delivered asynchronously.
During event delivery, each event name is matched against each subscription, and each matching event is delivered by running the associated callback.

Each event has a _name_ containing a summary of what happened, and a _payload_ carrying additional information.


### Event Names

Event names summarize _what happened_, possibly with some additional context.
They follow a hierarchical structure that is used to pattern-match against subscriptions during delivery.

An event name is a string, formed by a sequence of one or more _topics_ that are separated by `.` (the full stop, U+002E).
Each topic is a string, made up from a sequence of one or more _sub-topics_ separated by `-` (the hyphen-minus, U+00AF).
Sub-Topics are strings, formed by

  * _either_ an upper case letter followed by a sequence of upper case letters and numbers
  * _or_ a lower case letter followed by a sequence of mixed case letters and numbers

These rules also exist as a formal [grammar](#grammar) for thorough people.

These are examples for _valid_ event names:

  * `didReplace.myShoppingCart`
  * `takeActionRequest.searchArticles`
  * `didTakeAction.searchArticles.SUCCESS`
  * `willEndLifecycle`
  * `didValidate.popup-user2`

_Invalid_ event names include:

  * `DidReplace.myShoppingCart`: _invalid,_ first topic starts upper case but contains lower case letters
  * `.searchArticles.SUCCESS`: _invalid,_ empty topic is not allowed
  * `didUpdate.1up`: _invalid_, topic must not start with a number


#### Naming Best Practices and Event Patterns

Good event names start with a very general _verb-based first topic_, broadly describing _what_ happened.
That topic is often followed by a more specific _object-based second topic_, describing _where_ (or _to what_) something happened.
Sometimes, this second topic is broken down into sub-topics that allow to "zoom in" on the event details.
For example, the event _didValidate.popup-user2_ informs all interested subscribers, that the second user has been validated by a widget _within a popup_.
This information can now be used to show validation messages at the appropriate location.
Sometimes there is a _modal third topic_, broadly describing _how_ something happened (e.g. to communicate an outcome such as `SUCCESS` or `ERROR`).

Of course, nothing prevents senders to break these rules and use any structure for their event names as long as they conform to the grammar.
But for best interoperability between widgets and activities, not only should the general structure of event names be observed.

It is recommended wherever possible for widgets to use one or more of the established _event patterns_:
These patterns consist of event vocabularies and minimal associated semantics that have been identified during the development of LaxarJS.
A few [core patterns](core-patterns) are baked right into the LaxarJS runtime, and these are listed below.
Other useful patterns are described in the separate project _[LaxarJS Patterns](//github.com/LaxarJS/laxar_patterns)_.
Even without using the LaxarJS Patterns _library_, widget authors are very much encouraged to use the [event vocabularies](//github.com/LaxarJS/laxar_patterns/docs/index.md) whenever meaningful.


### Event Payload

An event does not only have a name, but also a _payload_.
Any JavaScript object that can be directly represented as [JSON](http://json.org/) can be used as a payload.
This allows for the object to contain instances of _string_, _array_, _number_, _boolean_ and _object_, including `null`.
On the other hand, it excludes`undefined`, _Date_, _RegExp_ and custom classes.

The Event Bus will _create a copy_ of the payload _for each subscriber_ that gets the event delivered.
This improves decoupling and robustness, because events are "fire and forget":
A widget may publish some resource through an event and afterwards immediately modify its contents, but all subscribers are guaranteed to receive the original event.

However, this also means that you should only publish resources that are at most ~100 kilobyte in size.
For larger resources, it is recommended to only transfer a URL so that interested widgets may receive the content from a server (or the browser cache).


<a name="request-events"></a>
### Two-Way Communication or the Request/Will/Did Mechanism

Sometimes a widget has to request for some other widget or activity on the page to perform some action.
This might be a longer running action such as a search or some server side validation.
The requesting widget does not care about _who_ actually performs the request, but it is interested in _when_ the request has been fully processed by all respondents, and what is the outcome.

As an example, consider a multi-part user sign-up process, where each of several widgets allows the user to enter and validate some of the information such as email address, payment information or a CAPTCHA.
Another widget offering a _Complete Sign-Up_ button would be responsible for the overall process of submitting the registration resource to a REST service and navigating to a different page.
Before hitting the registration service, this widget would ask all input widgets to validate their respective sign-up details in order to provide immediate feedback to the user.
Some of the widgets might have to query their own validation services though, such as the CAPTCHA widget.

Using the _Request/Will/Did_ mechanism, such functionality can be achieved without the registration widget having to know any of the participant widgets:

1. The individual widgets are _configured_ on the page to work with a common `registrationForm` resource.
   On instantiation, the input widgets offering validation subscribe to `validateRequest` events for this resource.

2. When the user activates the _Complete Sign-Up_ button, the registration widget issues a `validateRequest.registrationForm` event, indicating that

  * a validation has been requested _(what happened)_ and
  * it concerns the resource `registrationForm` _(where_ it happened).

  The registration widget may now disable its button and start showing an activity indicator to help the user recognize that an action is in progress.

3. During delivery, the input widgets supporting validation receive the request and publish a `willValidate.registrationForm` event to indicate that

  * a validation has been initiated _(what)_ and
  * that it concerns the `registrationForm` resource _(where)_.

4. Each widget will either call its registration service to respond asynchronously, or publish a response directly if it can validate locally.
   The response is either `didValidate.registrationForm.SUCCESS` or `didValidate.registrationForm.ERROR` conveying that

  * a validation has been performed _(what)_ and
  * that it concerns the `registrationForm` resource _(where)_ and
  * the way the validation turned out _(how)_.

4. Once all responses have been collected and there were no validation errors, the registration form will be notified (through a promise) and the _sign-up_ REST request may be performed.

This mechanism allows any of the widgets on the page may be removed or replaced without any of the other widgets having to know.
New widgets may be added at any time, and will work as long as they support the validation pattern.
For example, the message display widget could be added to gather and display validation messages to the user, simply by hooking it up to the same resource and processing its `"didValidate"` events.
Even if some widgets do not support the validation pattern, they can still be used, only that their validation would have to be handled by the server upon submission of the registration form.

Validation and other patterns are described in the following section.


<a name="pattern-reference"></a>
## Pattern Reference

A few event patterns are supported directly by LaxarJS, while others are described in the _[LaxarJS Patterns](https://github.com/LaxarJS/laxar_patterns#laxarjs-patterns)_ library.
Have a good look at all of them before coming up with your own patterns, in order to maximize the synergy of your widgets, especially when aiming for reuse.


<a name="core-pattern"></a>
### Core Patterns

The core event patterns allow widgets to interact with the LaxarJS runtime.
They are related to initialization of pages and navigation between them.


#### Page Lifecycle

After all widget controllers have been instantiated, the runtime publishes a `beginLifecycleRequest` event.
Widgets that need to publish events on page load should do so _after_ receiving this event, ensuring that all receivers have been set up when their events are delivered.
A will/did-response may be used by widgets to defer rendering of the page until they have been initialized, which is usually not recommended.

Before [navigating](#navigation) away from a page, the runtime publishes the `endLifecycleRequest` event.
Widgets that need to save state to a service should respond with a `willEndLifecycle` event, perform their housekeeping and publish an `didEndLifecycle` when done.


Event name                            | Payload Attribute | Description
--------------------------------------|-------------------| ------------------------------------------------------------
`beginLifecycleRequest.{lifecycleId}` |                   | _published by the runtime to tell widgets that publishing of events is safe now_
                                      | `lifecycleId`     | the lifecycle ID (currently, this is always `"default"`)
`willBeginLifecycle.{lifecycleId}`    |                   | _published by widgets and activities to defer page rendering (not recommended)_
                                      | `lifecycleId`     | _see above_
`didBeginLifecycle.{lifecycleId}`     |                   | _published by widgets and activities when page rendering may commence (not recommended)_
                                      | `lifecycleId`     | _see above_
`endLifecycleRequest.{lifecycleId}`   |                   | _published by the runtime to tell widgets that the page is about to be destroyed_
                                      | `lifecycleId`     | _see above_
`willEndLifecycle.{lifecycleId}`      |                   | _published by widgets and activities to defer tear down of the page (if necessary)_
                                      | `lifecycleId`     | _see above_
`didEndLifecycle.{lifecycleId}`       |                   | _published by widgets and activities when page tear down may commence (after deferring it)_
                                      | `lifecycleId`     | _see above_


<a name="navigation"></a>
#### Navigation

Widgets and activities may initiate navigation using a `navigateRequest.{target}` event, substituting an actual navigation target instead of the placeholder `{target}`.
The event is interpreted by the LaxarJS runtime as follows:

  * if _target_ is `"_self"`, the runtime will simply propagate its place-parameters by publishing a `didNavigate` event right away
  * if _target_ is one of the targets configured for the current place (in the flow definition), the runtime will initiate navigation to the corresponding place
  * otherwise, if _target_ is a place within the flow definition, the runtime will initiate navigation to that place
  * otherwise, nothing will happen.

When _initiating navigation_, the LaxarJS runtime will:

  1. extract any place parameters from the event payload of the request event
  2. publish a `willNavigate.{target}` event with the corresponding target and parameters
  3. publish an `endLifecycle` event and wait for any respondents
  4. perform navigation by destroying the current page and loading the page associated with the new place
  3. publish a `beginLifecycle` event and wait for any respondents
  5. publish a `didNavigate.{target}` event, with the corresponding target and parameters as well as the resolved place

Here is the summary of navigation events:

Event name                 | Payload Attribute | Description
---------------------------|-------------------| ------------------------------------------------------------
`navigateRequest.{target}` |                   | _published by widgets and activities to indicate that a navigation has been requested_
                           | `target`          | the navigation target (used in the payload _as well as_ in the event name)
                           | `data`            | a map from place parameter names to parameter values
`willNavigate.{target}`    |                   | _published by the runtime to indicate that navigation has started_
                           | `target`, `data`  | _see above_
`didNavigate.{target}`     |                   | _published by the runtime to indicate that navigation has finished_
                           | `target`, `data`  | _see above_
                           | `place`           | the actual place that was navigated to, now the current place

More information on navigation is available in the ["Flow and Places" manual](./flow_and_places.md).


#### Locales and i18n

Events related to locales are described in the ["i18n" manual](./i18n.md).


### More Patterns

The patterns described so far are used mainly for widgets to interact with the LaxarJS runtime.
For application patterns that help widgets to interact with each other, refer to the [LaxarJS Patterns documentation](//github.com/LaxarJS/laxar_patterns/tree/master/docs/index.md).


## Event Reference

The single relevant API provided by LaxarJS is the event bus.
This section lists the exact details of using it, and on how event names may be constructed.

### The Event Bus API

The event bus is available to widgets and activities through `$scope.eventBus`.
It has only a few essential methods that allow to implement all patterns mentioned above.

* `subscribe( eventPattern, callback [, options] )`

   Creates a subscription on the event bus.

   - The `eventPattern` is a prefix for events to subscribe to:
     Events that start with the given sequence of (sub-)topics will be handled by this subscription.
     For example, a subscription to the pattern `didSave` will be triggered for the event `didSave.myDocument` as well as for the event `didSave.preferences-main`.
     Most of the time, widgets are only interested in very specific events related to resources they work with or actions they handle, so they use patterns such as `didReplace.someResource` where `someResource` is given by the page configuration.
   
   - The `callback` is the function which will be called to process any matching events.
     Event subscription callbacks receive two arguments:
       + The `event` is this subscriber's copy of the payload, as published by the sender of the event.
       + The `meta` object contains additional information about the event, in particular the `sender` (identified by a string) and the `name` (under which the event was published).
   
   - The `options` are usually not required for widgets:
     Using `options.subscriberId`, the subscriber can identify itself to the event bus.
     However, the LaxarJS runtime decorates each widget's event bus such that this option is always set correctly.
  
  The method `subscribe` does not return a value.

* `publish( eventName, payload [, options ] )`

  Publishes an event to all interested subscribers.
  Delivery is asynchronous: control is returned to the caller immediately, and delivery will be performed afterwards, together with an AngularJS digest cycle.
  The event payload is cloned immediately so that the caller is free to modify it right after publishing.
  Returns a promise that is resolved after the event has been delivered to all subscribers.

  - The `eventName` is used to identify matching subscribers.
    It is matched against the `eventPattern` of any subscriptions.

  - The `payload` will be delivered as the `event` parameter to any matching subscriber callbacks.
    It is copied right away, making it safe to modify afterwards.

  - The `options` are usually not required for widgets:
    By setting `options.deliverToSender` to `false`, widgets can ignore their own events, which can sometimes be necessary to avoid loops.

  The method `publish` returns a promise that is resolved after the event has been processed by all matching subscribers.

* `publishAndGatherReplies( requestEventName, payload [, options ] )`

  Publishes a [request event](#request-events), gathers all _will_-responses during delivery and then waits for all outstanding _did_-responses.
  The parameters `payload` and `options` are equivalent to the regular `publish`-method.
  Returns a promise that is resolved when all _did_-responses have been received.

This information should help to get started with the event bus and intentionally omits a lot of details.
For full information, refer to the [EventBus module](https://github.com/LaxarJS/laxar/blob/master/lib/event_bus/event_bus.js).

<a name="grammar"></a>
### Event Name Grammar

This is the formal grammar for event names, in [EBNF](http://en.wikipedia.org/wiki/Extended_Backus%E2%80%93Naur_Form):

```EBNF
<event-name> ::= <topic-id> [ '.' <topic-id> ]*
<topic-id> ::= <sub-topic-id> [ '-' <sub-topic-id> ]*
<sub-topic-id> ::= [a-z][+a-zA-Z0-9]* | [A-Z][+A-Z0-9]*
```
