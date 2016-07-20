# Widget Services

[« return to the manuals](index.md)

In order to make developing widgets even easier, a common set of services is offered to a widget instance, regardless of its implementation technology.
Some of these services are mere adapters to internal apis and are mostly relevant for tooling, while others are specifically bound to the respective widget instance, sparing the widget developer to provide context information by himself.
A widget adapter may offer additional services specific to its implementation technology.
For example the AngularJS adapter allows to inject all available AngularJS services and the widget's `$scope` object.

Preliminary readings:

* [Widgets and Activities](widgets_and_activities.md)

## Available Services

### `axAreaHelper`

A very thin wrapper around the internal area helper that manages existing areas, their hierarchy and visibility.
The wrapper only allows registering new areas that are nested in the widget.
De-registration is handled automatically as needed by the wrapper.


### `axConfiguration`

The global API for accessing the configuration the application was bootstrapped with.
For further information on this topic have a look at the [documentation for LaxarJS configuration](./configuration.md).


### `axContext`

The `context` object contains information that may be of use to the widget controller:

* `eventBus`: same as [axEventBus](#-axeventbus-)

* `features`: same as [axFeatures](#-axfeatures-)

* `id`: a function that takes a string and returns a unique ID that may be given to a DOM-element of this widget instance.
  This is mainly intended to associate form controls with their labels (using the HTML attributes `id` and `for`), without breaking multiple widget instances on a single page.

* `log`: same as [axLog](#-axlog-)

* `widget`: only rarely needed, this object provides additional meta information about the widget.
  There is the containing `area` name, the instance `id` as a string and the `path` that was used to instantiate the widget.


### `axEventBus`

The event bus instance for this widget. _sender_ and _subscriber_ on calls to `publish`, `publishAndGatherReplies` or `subscribe` respectively are automatically filled with the identifier for this widget.
Additionally this wrapped event bus instance takes care of unsubscribing from all event subscriptions as soon as the widget is no longer needed, i.e. if the current page is left.


### `axFeatures`

The complete feature configuration for this instance, with defaults filled in from the widget configuration schema.


### `axFlowService`

Offers the api of the flow service to widgets.
For widgets this api provides methods to e.g. create real URLs to flow targets for use as `href` in an `a` tag.
So whenever real links are required instead of programmatical navigation in a LaxarJS application, this is the way to create the URLs.


### `axGlobalEventBus`

A handle to the global event bus instance, that is not wrapped for a specific widget.
For "normal" event handling the `axEventBus` should always be preferred as it prevents memory leaks and takes care of some configuration (i.e. `subscriber` and `sender` values) already.
The only valid use case would be for tooling widgets or activities like the `ax-developer-tools-widget`, where it is necessary to add subscribers or inspectors that last longer than the lifespan of the widget.
Be sure to keep track of your subscriptions yourself!


### `axGlobalLog`

The ol' global logger instance, that just logs any message as it is passed to it without tampering with the message.
You should preferably use the [`axLog`](#-axlog-) service to log from within a widget, as it adds the widget's name and id to the message for improved debugging.
The global logger might be of use for adding a log channel, but just as it is the case for the [global event bus](#-axglobaleventbus-), think about the consequences when adding something globally from within a single widget instance with a presumably shorter lifespan than the application's!


### `axGlobalStorage`

The storage api for either gaining access to an application wide local or session storage, or for creating a storage with a custom name.
For widgets there is a special [`axStorage` service](-axstorage-), that offers some more convenience.


### `axHeartbeat`

The heartbeat service offers access to the heartbeat api, a simple task scheduler.
Its main purpose is to ensure that all events of an event cycle or intermediately created events are delivered before some other, possibly heavy weight task is executed.
A possible use case is for widgets that have costly rendering and want to wait until everything is settled before they re-render.


### `axI18n`

Provides access to localization apis and convenience for `didChangeLocale` event handling.


### `axId`

A function to create globally unique ids for an id that is unique in the context of a widget instance.
A common use case for this are input fields and according labels, that are connected via `id` and `for` attributes respectively.


### `axLog`

The logger wrapped specifically for the widget instance.
It offers the comlete api of the global logger, but adds the widget's name and id to the log message.
For better debugging this should always be preferred to [`axGlobalLog`](#-axgloballog-).


### `axStorage`

A simpler storage api for widgets, that only offers a `session` and a `local` property, already being instances of session scoped or permanent life time storage instances respectively.
When accessing or modifying properties via `getItem`, `setItem` or `removeItem` the `key` argument is always prefixed with a unique id of the widget instance.
This ensures that no two widgets, possibly of the same type, overwrite or use each other's stored data.


### `axTooling`

As the name already suggests this is a service merely for tooling tasks.
For now this is limited to page inspection.
