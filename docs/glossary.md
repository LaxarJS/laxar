# LaxarJS Glossary

While reading LaxarJS manuals and API documentation you will from time to time stumble over terms, that have a certain meaning within the context of LaxarJS.
To prevent from defining these terms over and over again, this document is a collection of all terms and our definition.
If you deem something important is missing here, feel free to [contact us](//laxarjs.org/the-team/).


## Action

In the context of [LaxarJS Patterns](https://laxarjs.org/docs/laxar-patterns-v2-latest/), an event expressing user intent.

More Information:

   - [LaxarJS Patterns: Actions](http://laxarjs.org/docs/laxar-patterns-v2-latest/patterns/actions/)


## Activity

An artifact in a LaxarJS application, implementing business logic or providing supporting service functionality.
Similar to a widget, but without any user interface.

More Information:

   - [LaxarJS Core Concepts](./concepts.md)
   - [Manual: Widgets and Activities](./manuals/widgets_and_activities.md)


## Artifact

LaxarJS distinguishes the following application artifacts:

   - [widgets](#widget)
   - [activities](#actvity)
   - [controls](#control)
   - [layouts](#layout)
   - [flows](#flow)
   - [pages](#page)
   - [themes](#theme)

More Information:

   - [LaxarJS Core Concepts](./concepts.md)
   - [Manual: Widgets and Activities](./manuals/widgets_and_activities.md)
   - [Manual: Providing Controls](./manuals/providing_controls.md)
   - [Manual: Writing Pages](./manuals/writing_pages.md)
   - [Manual: Flow and Places](./manuals/flow_and_places.md)


## Assets

Secondary resources (HTML, CSS, images) that may belong to certain application artifacts (widgets, controls, layouts).

More Information:

   - [Manual: Asset Lookup](./asset_lookup.md)


## Attribute Path

An attribute path is a JavaScript string that references a property in an object or array, possibly deeply nested.
It consists of a list of keys denoting the path to follow within the object hierarchy.
The keys are written as a string, where each key is separated by a dot from each other.

### Example

Consider the following object:

```js
{
   "items": [
      { "user": { "name": "Tom" } },
      { "user": { "name": "Pete" } }
   ]
}
```

When evaluated against this object, the attribute path `"items.1.user.name"` would yield the string `"Pete"`.

More Information:

   - [API: `laxar.object.path`](./api/utilities.object.md#path)


## Bootstrap CSS

The CSS framework used by default for LaxarJS applications, widgets and controls.

More Information:

   - [getbootstrap.com](http://getbootstrap.com/)


## Bootstrapping Instance

A runtime context within which LaxarJS instantiates and configures a flow, pages and widgets.
Multiple bootstrapping instances may run within the same browser window at the same time in complete isolation from each other.
Each instance displays one page at a time.

More Information:

   - [API: `laxar.bootstrap`](./api/laxar.md#laxar.bootstrap)


## Control

Generally, a basic UI building block to be used within widgets.
More specifically, a LaxarJS artifact consisting of a JavaScript module (possibly loading an HTML template) and an optional CSS stylesheet, which may be *themed*.

More Information:

   - [LaxarJS Core Concepts](./concepts.md)
   - [Manual: Providing Controls](./manuals/providing_controls.md)


## Composition

Advanced concept:
A partial page definition that can be instantiated from within other pages.
Supports feature configuration, similar to widgets.

More Information:

   - [Manual: Writing Compositions](./manuals/writing_compositions.md)


## Configuration

Apart from the page and flow definitions, LaxarJS supports application-level configuration which is passed directly to each bootstrapping instance.
Use this for deployment-dependent configuration, such as service URLs.

More Information:

   - [Manual: Configuration](./manuals/configuration.md)
   - [API: `axConfiguration`](./api/runtime.configuration.md)
   - [API: `laxar.bootstrap`](./api/laxar.md#laxar.bootstrap)


## Event Bus

Central event broker within each LaxarJS application.
Connects widgets and activities through publish/subscribe events.

More Information:

   - [Manual: Events](./manuals/events.md)
   - [API: `axEventBus`](./api/runtime.event_bus.md)


## Feature Path

_Most commonly used as function argument called `featurePath`_

This is an [attribute path](#attribute-path) for a widget feature.
If not said otherwise, the path starts after the `features` key.
You'll find this being used very frequently when working with the [LaxarJS Patterns library](https://github.com/LaxarJS/laxar-patterns).


## Flag

In the context of [LaxarJS Patterns](https://laxarjs.org/docs/laxar-patterns-v2-latest/), a publish/subscribe event announcing a Boolean state to collaborators.
Often used to toggle visibility of context-dependent UI items, or to enable/disable form elements.

More Information:

   - [LaxarJS Patterns: Flags](http://laxarjs.org/docs/laxar-patterns-v2-latest/patterns/flags/)


## Flow

Routing configuration for a LaxarJS application.
Associates URL patterns with pages, and defines their parameters.

More Information:

   - [Manual: Flow and Places](./manuals/flow_and_places.md)
   - [API: `axFlowService`](./api/runtime.flow_service.md)


## I18n

*Internationalization:* LaxarJS allows to broadcast changes to application locales and offers a small set of helpers for selecting the correct localization from internationalized values.

More Information:

   - [Manual: i18n](./manuals/i18n.md)


## I18n Object

For internationalization purposes, many LaxarJS libraries, widgets and controls support so-called *i18n objects* instead of primitive values, in order to support multiple localizations.
An i18n object is a map from language tag (`en-US`, `de`, etc.) to plain text or HTML markup.
Depending on the selected locale and resulting language tag, the correct message localization is used.

More Information:

   - [Manual: i18n](./manuals/i18n.md)


## Integration Technology

A string that identifies which UI technology a widget or control is built upon.
LaxarJS comes with support for a single integration technology, `"plain"`, meaning that an artifact is built using vanilla HTML5/CSS/JavaScript.
For any other technology, an appropriate _technology adapter_ must be passed to LaxarJS when bootstrapping the application.
The LaxarJS project provides adapters for the following integration technologies: `"angular"` (for [AngularJS v1](https://angularjs.org/)), `"angular2"` (for [Angular 2](https://angular.io/) and beyond), `"react"` (for [React](https://facebook.github.io/react/)) and `"vue"` (for [Vue.js v2](https://vuejs.org/)).

More Information:

   - [Manual: Widgets and Activities](./manuals/widgets_and_activities.md)
   - [Manual: Creating an Adapter for a new Widget Technology](./manuals/adapters.md)


## Integration Technology Adapter

A JavaScript module that allows LaxarJS to load widgets and controls written in a specific _integration technology._
Must be passed to LaxarJS when bootstrapping an application.

More Information:

   - [Manual: Creating an Adapter for a new Widget Technology](./manuals/adapters.md)
   - [laxar-angular-adapter](http://laxarjs.org/docs/laxar-angular-adapter-v2-latest/patterns/flags/)
   - [laxar-angular2-adapter](http://laxarjs.org/docs/laxar-angular2-adapter-v2-latest/patterns/flags/)
   - [laxar-react-adapter](http://laxarjs.org/docs/laxar-react-adapter-v2-latest/patterns/flags/)
   - [laxar-vue-adapter](http://laxarjs.org/docs/laxar-vue-adapter-v2-latest/patterns/flags/)


## Integration Type

A string used in the widget descriptor to distinguish widgets (integration type `"widget"`) from activities (integration type `"activity"`).

More Information:

   - [Manual: Widgets and Activities](./manuals/widgets_and_activities.md)


## Layout

A piece of plain old HTML used to render scaffolding HTML, or to arrange widgets contained in page by including one or more _widget areas_.

More Information:

   - [Manual: Writing Pages](./manuals/writing_pages.md)


## LaxarJS Patterns

A library helping to support several standard event patterns for widget collaboration, most importantly *actions, resources,* and *flags.*

More Information:

   - [LaxarJS Patterns](http://laxarjs.org/docs/laxar-patterns-v2-latest/)


## LaxarJS Mocks

A library that helps to write specification tests *(spec tests)* for widgets and activities.

More Information:

   - [LaxarJS Mocks](http://laxarjs.org/docs/laxar-mocks-v2-latest/)


## LaxarJS UiKit

A library containing the LaxarJS default theme (a slightly extended Bootstrap 3, plus Font Awesome) as well as JavaScript helper functions for locale-aware parsing and formatting of numbers and dates.

More Information:

   - [LaxarJS UiKit](http://laxarjs.org/docs/laxar-uikit-v2-latest/)


## Lifecycle

Standard event sequence that is published by the LaxarJS runtime from the instant a page is entered...

   - `beginLifecycleRequest`
   - `didNavigate`

...until it is replaced by the next page:

   - `navigateRequest`
   - `endLifecycleRequest`.

More Information:

   - [Manual: Events](./manuals/events.md)


## Topic

Fragment of an event name when split by `.` (dot).
More specifically, the "middle" part of pattern event names (actions, resources, flags) that is used within page definitions in order to connect collaborating widgets.
Also called topic ID in this context.


## Page

Configuration for a set of LaxarJS widgets, activities and possibly nested compositions that are run at the same time.
Also contains a reference to a main layout, and possibly to additional nested layouts, in order to visually arrange the widgets.


## Place

An entry in a flow definition.
Binds one or more URL patterns to either a page, or to a redirect.


## Publish/Subscribe

Architectural pattern used for communication of components within LaxarJS applications.


## Resource

In the context of [LaxarJS Patterns](https://laxarjs.org/docs/laxar-patterns-v2-latest/), a publish/subscribe event broadcasting application state to collaborators.

More Information:

   - [LaxarJS Patterns: Resources](http://laxarjs.org/docs/laxar-patterns-v2-latest/patterns/resources/)


## Theme

A named collection of CSS styles that define the look and feel of a LaxarJS application.
By default, LaxarJS applications use the *default.theme* which is just Bootstrap 3 plus Font Awesome.
Custom themes can modify the Bootstrap styling or completely replace it, e.g. by using [Material Design](https://material.io/guidelines/).
Widgets should always define styles for the *default.theme*.

More Information:

   - [Creating Themes](./manuals/creating_themes.md)


## Widget

Main building block within a LaxarJS application.
Provides and-user functionality within its area of the screen.

More Information:

   - [LaxarJS Core Concepts](./concepts.md)
   - [Manual: Widgets and Activities](./manuals/widgets_and_activities.md)


## Widget Adapter

See [Integration Technology Adapter](#integration-technology-adapter).



## Widget Area

An anchor for nested widgets that is provided by layouts and sometimes by widgets.
Each widget area is attached to a DOM node and its contents are determined by the page configuration.
Widget areas even allow nesting widgets that were created in different [integration technologies](#integration-technology).

More Information:

   - [Manual: Writing Pages](./manuals/writing_pages.md)
   - [API: `axAreaHelper`](./api/runtime.widget_services.md#axAreaHelper)


## Widget Descriptor

The contents of a JSON file (called `widget.json`) containing meta information about a widget.
The descriptor defines the *name*, *integration type and technology*, and the *widget features* that may be configured.
It may also specify a *styleSource* and/or *templateSource* if the widget deviates from the defaults, e.g. when using SCSS.

More Information:

   - [Manual: Widgets and Activities](./manuals/widgets_and_activities.md)


## Widget Directory

File system directory containing a widget with its descriptor, implementation module, and assets.

More Information:

   - [Manual: Widgets and Activities](./manuals/widgets_and_activities.md)


## Widget Features

When a widget is [instantiated](#widget-instance) within a page, runtime configuration is passed to the widget controller through the *axFeatures* injection.
The [widget descriptor](#) may specify and document what feature configuration is allowed by providing a JSON schema under its `features` property.

More Information:

   - [Manual: Widgets and Activities](./manuals/widgets_and_activities.md)
   - [Manual: Writing Pages](./manuals/writing_pages.md)
   - [API: `axFeatures`](./api/runtime.widget_services.md#axFeatures)


## Widget Instance

Each widget is a *blueprint* that can be instantiated on any number of pages, or even multiple times within a single page.
Each of those instances has its own configuration, its own ID, and its own container node in the browser DOM.


## Widget Services, Widget Injections

To use service APIs provided by LaxarJS, most importantly the event bus, widgets and activities request them to be injected into their controller.
The specific syntax for this depends on the integration technology.
LaxarJS does not use a fancy dependency injection (DI) framework for this, just a simple registry of known services.
However, technology adapters may hook into the DI of their respective framework to enrich it with the LaxarJS services.

More Information:

   - [Manual: Widget Services](./manuals/widgets_services.md)
   - [API: Widget Services](./api/runtime.widget_services.md)


## Yeoman, Yeoman Generator

[Yeoman](http://yeoman.io/) is a general purpose _scaffolding tool_ that allows to create new software artifacts based on a template, and interactive dialogues to fill in the blanks.
The [Yeoman Generator for LaxarJS](http://laxarjs.org/docs/generator-laxarjs-v2-latest/) is a plugin for Yeoman that helps to create LaxarJS applications, widgets, activities and controls.
