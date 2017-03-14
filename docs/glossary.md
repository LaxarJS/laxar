# LaxarJS Glossary

While reading LaxarJS manuals and api documentation you will from time to time stumble over terms, that have a certain meaning within the context of LaxarJS.
To prevent from defining these terms over and over again, this document is a collection of all terms and our definition.
If you deem something important is missing here, feel free to [contact us](//laxarjs.org/the-team/).


## Action

In the context of [LaxarJS Patterns](https://laxarjs.org/docs/laxar-patterns-latest/), an event expressing user intent.


## Activity

An artifact in a LaxarJS application, implementing business logic or providing supporting service functionality.
Similar to a widget, but without any user interface.


## Artifact

LaxarJS distinguishes the following application artifacts:

  - widgets
  - activities
  - controls
  - layouts
  - flows
  - pages
  - themes


## Assets

Secondary resources (HTML, CSS, images) that may belong to certain application artifacts (widgets, controls, layouts).


## Attribute Path

An attribute path is a JavaScript string that references a property in an object or array, possibly deeply nested.
It consists of a list of keys denoting the path to follow within the object hierarchy.
The keys are written as a string, where each key is separated by a dot from each other.


## Bootstrap CSS

The CSS framework used by default for LaxarJS applications, widgets and controls.


## Bootstrapping Instance

A runtime context within which LaxarJS instantiates and configures a flow, pages and widgets.
Multiple bootstrapping instances may run within the same browser window at the same time in complete isolation from each other.
Each instance displays one page at a time.


### Example

Consider the following object:

```js
{
   "something": [
      { "user": { "name": "Tom" } },
      { "user": { "name": "Pete" } },
      { "user": { "name": "Suzi" } }
   ]
}
```

When evaluated against this object, the attribute path `"something.1.user.name"` would return the string `"Pete"`.


## Control

Generally, a basic UI building block to be used within widgets.
More specifically, a LaxarJS artifact consisting of a JavaScript module (possibly loading an HTML template) and an optional CSS stylesheet, which may be *themed*.


## Composition

A partial page definition that can be instantiated from within other pages.
Supports feature configuration, similar to widgets.


## Configuration

Apart from the page and flow definitions, LaxarJS supports application-level configuration which is passed directly to each bootstrapping instance.
Use this for deployment-dependent configuration, such as service URLs.


## Event Bus

Central event broker within each LaxarJS application.
Connects widgets and activities through publish/subscribe events.


## Feature Path

_Most commonly used as function argument called `featurePath`_

This is an [attribute path](#attribute-path) for a widget feature.
If not said otherwise, the path starts after the `features` key.
You'll find this being used very frequently when working with the [LaxarJS Patterns library](https://github.com/LaxarJS/laxar-patterns).


## Flow

Routing configuration for a LaxarJS application.
Associates URL patterns with pages, and defines their parameters.


## Integration Technology

A string that identifies which view technology a widget or control is built upon.
LaxarJS comes with support for a single integration technology: `"plain"`.
For any other technology, an appropriate _technology adapter_ must be passed to LaxarJS when bootstrapping the application.
The LaxarJS project adapters for the following integration technologies: `"angular"` (for [AngularJS v1](https://angularjs.org/)), `"angular2"` (for [Angular 2](https://angular.io/) and beyond), `"react"` (for [React](https://facebook.github.io/react/)) and `"vue"` (for [Vue.js v2](https://vuejs.org/)).


## Integration Technology Adapter

A JavaScript module that allows LaxarJS to load widgets and controls written in a specific _integration technology._
Must be passed to LaxarJS when bootstrapping an application.


## Integration Type

A string used to distinguish widgets (integration type `"widget"`) from activities (integration type `"activity"`).


## Layout

A piece of plain old HTML used to render scaffolding HTML, or to arrange widgets on screen by including one or more _widget areas_.


## LaxarJS Patterns

A library helping to support several standard event patterns for widget collaboration, most importantly *actions, resources,* and *flags.*


## LaxarJS Mocks

A library that helps to write tests for widgets and activities.


## LaxarJS UiKit

A library containing the LaxarJS default theme (slightly extended Bootstrap 3) as well as helper functions for locale-aware parsing and formatting of numbers and dates.


## I18n

Internationalization: LaxarJS allows to broadcast changes to application locales and offers a small set of helpers for selecting the correct localizations from internationalized values.


## Lifecycle

Standard event sequence that is published by the LaxarJS runtime from the instant a page is entered...

 - `beginLifecycleRequest`
 - `didNavigate`

...until it is replaced by the next page:

 - `navigateRequest`
 - `endLifecycleRequest`.


## Topic

Fragment of an event name when split by `.` (dot).
More specifically, the "middle" part of pattern event names (actions, resources, flags) that is used within page definitions in order to connect collaborating widgets.
Also called topic ID in this context.


## Page

Configuration for a set of LaxarJS widgets, activities and possibly nested compositions.
Also references a layout in order to visually arrange the widgets.


## Place

An entry in a flow definition.
Binds one or more URL patterns to either a page, or to a redirect.


## Publish/Subscribe

Architectural pattern used for communication of components within LaxarJS applications.


## Resource

In the context of [LaxarJS Patterns](https://laxarjs.org/docs/laxar-patterns-latest/), a publish/subscribe event broadcasting application state to collaborators.


## Theme

TODO


## Widget

TODO


## Widget Area

TODO


## Widget Descriptor

TODO


## Widget Features

TODO


## Widget Instance

TODO


## Widget Services, Widget Injections

TODO


## Yeoman

TODO
