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


### `axAssets`

Provides access to all assets for a widget that are located within its directory and that are configured to be available as assets.
The service itself is a function that takes an asset path as a parameter and returns a promise resolved with the contents of the given asset.
Additionally the service has three other methods for more specific access:

* `url( path )`: instead of the content, the promise will be resolved with the URL to the asset

* `forTheme( path )`: resolves content for an asset in the active theme or alternatively from the default theme

* `urlForTheme( path )`: resolves the URL for an asset in the active theme or alternatively from the default theme

The service itself and its `url` method expect as argument a path that is relative to the widget directory, while `forTheme` and `urlForTheme` expect a path that is relative to the theme folders.
So for `my-widget/my.theme/data.json` one would pass `data.json` as argument to the latter methods, assuming the `my.theme` is the currently active theme.
If the requested file does not exist in the current theme directory but in the default theme (`default.theme` directory) it is read from there.
Configuration of available assets takes place in the `widget.json` and needs to be exact.
If an asset isn't configured there, it won't be available.
Configuration of these assets is explained [here](widgets_and_activities.md).


### `axConfiguration`

The global API for accessing the configuration the application was bootstrapped with.
For further information on this topic have a look at the [documentation for LaxarJS configuration](./configuration.md).


### `axContext`

The *context* object contains information that may be of use to the widget controller:

* `eventBus`: same as [axEventBus](#-axeventbus-)

* `features`: same as [axFeatures](#-axfeatures-)

* `id( suffix )`: a function that takes a string and returns a unique ID that may be given to a DOM-element of this widget instance.
  This is mainly intended to associate form controls with their labels (using the HTML attributes `id` and `for`), without breaking multiple widget instances on a single page.

* `log`: same as [axLog](#-axlog-)

* `widget`: only rarely needed, this object provides additional meta information about the widget.
  There is the containing `area` name, the instance `id` as a string and the `path` that was used to instantiate the widget.

While some of these properties are available as standalone injections, they are bundled on the context to simplify the creation of powerful libraries such as *LaxarJS Patterns.*


### `axControls`

Widgets can use this service to get access to their controls' implementation modules.
It has a single method:

* `provide( name )` returns the implementation module (AMD, CommonJS, ES2015) for the given named control.
The name must be the same as the one used in the `widget.json` descriptor to declare the control dependency.
If the control was not declared, or if it does not have an implementation module (e.g. a pure CSS styling control), an exception is raised.

Depending on the implementation technology, using this service may not be needed. For example, "angular" controls are automatically loaded as AngularJS modules.


### `axEventBus`

The event bus instance for this widget.
When calling `publish`, `publishAndGatherReplies` or `subscribe`, the _sender_ (or _subscriber_, respectively) are filled automatically with the identifier for this widget.
Additionally this wrapped event bus instance takes care of unsubscribing from all event subscriptions as soon as the widget is no longer needed, i.e. when the current page is left.


### `axFeatures`

The complete feature configuration for this instance, with defaults filled in from the widget configuration schema.


### `axFlowService`

Offers the API of the flow service to widgets.
For widgets this API provides methods to e.g. create bookmarkable URLs to flow targets for use as `href` in an `a` tag.
So whenever real links are required instead of programmatical navigation in a LaxarJS application, this is the way to create the URLs.


### `axGlobalEventBus`

A handle to the global event bus instance, that is not wrapped for a specific widget.
For "normal" event handling the `axEventBus` should always be preferred as it prevents memory leaks and takes care of some configuration (i.e. `subscriber` and `sender` values) already.
The only valid use case would be for tooling widgets or activities like the `ax-developer-tools-widget`, where it is necessary to add subscribers or inspectors that last longer than the lifespan of the widget.
Be sure to keep track of your subscriptions yourself!


### `axGlobalLog`

The ol' global logger instance (previously available as `laxar.log`), that just logs any message as it is passed to it without tampering with the message.
You should preferably use the [`axLog`](#-axlog-) service to log from within a widget, as it adds the widget's name and ID to the message for improved debugging.
The global logger might be of use for adding a log channel, but just as it is the case for the [global event bus](#-axglobaleventbus-), think about the consequences when adding something globally from within a single widget instance with a lifespan that is presumably shorter than that of the application!


### `axGlobalStorage`

The storage API for either gaining access to an applicationwide local or session storage, or for creating a storage with a custom name.
For widgets there is a dedicated [`axStorage` service](-axstorage-), that offers additional convenience by namespacing keys to the widget instance.


### `axHeartbeat`

The heartbeat service offers access to the heartbeat API, a simple task scheduler.
Its main purpose is to ensure that all events of an event cycle as well as intermediately created events are batch-processed before some other, possibly heavyweight task is executed.
A possible use case is for widgets that have costly rendering and want to wait until everything is settled before they re-render.


### `axI18n`

Provides access to localization and automates `didChangeLocale` event handling.
Behind the scenes, the service subscribes to `didChangeLocale` events to stay up-to-date.

If using this injection, make sure to have `i18n.locale` feature configuration on your widget, as described in the [i18n manual](i18n.md).
The following methods are provided to work with the locale configured for the `i18n` feature:

* `format( i18nFormatString, indexedReplacements = [], namedReplacements = {} )`: first, the given format string is localized (see below).
Then, placeholders are substituted using `laxar.string.format`, using the array of indexed replacements (for `[0]`, `[1]`, etc.) and the object of named replacements (for `[myValue]` etc.).

* `languageTag()`: returns the current language tag (such as `'en'` or `'de-CH'`) for the locale.

* `localize( i18nValue, fallback )`: returns the localization of the given internationalized value by using the locale's current language tag (falling back to the globally configured fallback tag as needed), or the given `fallback` value if no localization is available at all.

* `track( enabled = true, property = 'i18n' )`: starts tracking i18n information on the [widget context](#-axcontext-), so that it can be used by templates.
The tracking property is an object containing `locale` (name of the locale being tracked) and an object `tags`, mapping each locale to its current tag.

* `whenLocaleChanged( callback )`: schedules the given callback to be run whenever the language tag of the locale changes.
The callback will be invoked with the new language tag.

Sometimes, widgets use additional locales that are configured using additional features.
To deal with these cases, the `axI18n` service methods listed above may be instantiated for another feature by using a special factory method:

* `forFeature( featurePath )`: provides an object that has all of the methods listed above, but backed by a different feature.
For example, when specifying feature `myFeature.sub`, the locale topic configured under `myFeature.sub.locale` is observed for changes.


### `axId`

A function to create globally unique IDs from an ID that is unique within the context of a widget instance.
A common use case for this is associating input fields and the corresponding labels, that are connected via `id` and `for` attributes respectively.


### `axLog`

The logger, wrapped specifically for the widget instance.
It offers the complete API of the global logger, but adds the widget's name and ID to the log message.
For better debugging this should always be preferred to [`axGlobalLog`](#-axgloballog-).


### `axStorage`

A simpler storage API for widgets, that only offers a `session` and a `local` property, already being instances of session-scoped or permanent life time storage instances respectively.
When accessing or modifying properties via `getItem`, `setItem` or `removeItem`, the `key` argument is always prefixed with a unique ID of the widget instance.
This ensures that no two widgets, possibly of the same type, overwrite or use each other's stored data.


### `axTooling`

This service provides inspection capabilities for development tools, such as the definitions of the current application's pages and their widgets, and access to the name of the current page.


### `axVisibility`

Allows painless handling of `didChangeAreaVisibility` events.
The injection can be used by widgets to be notified about changes to their containing area's visibility.
Widgets that provide their own areas (e.g. a tabbing widget) can also use it to inform other widgets about changes to the visibility of those areas.

* `track( enabled = true, property = 'isVisible' )`: Start maintaining a boolean flag on the [widget context](#-axcontext-) under the given property name. This flag can be used in the widget template or may be queried programmatically.

* `onShow( callback )`,
* `onHide( callback )`,
* `onChange( callback )`: Register callbacks to be invoked whenever the visibility changes to the respective state.
The callbacks will receive a boolean argument containing the visibility.

* `unsubscribe( callback )`: Unsubscribe a previously registered callback. Happens automatically when a widget is destroyed.

Widgets that offer their own areas and that change the visibility of those areas need to inform the LaxarJS runtime about those changes.

* `updateAreaVisibility( visibilityByName )`: The method takes an object mapping area names (without the widget-ID prefix) to their new boolean visibility state.
Unchanged areas may be omitted.
The `axVisibility` service automatically incorporates the visibility of containing areas, so when e.g. a tabbing widget "shows" one of its areas while itself is hidden, that area will remain hidden until the tabbing widget itself becomes visible.
