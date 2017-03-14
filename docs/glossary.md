# LaxarJS Glossary

While reading LaxarJS manuals and api documentation you will from time to time stumble over terms, that have a certain meaning within the context of LaxarJS.
To prevent from defining these terms over and over again, this document is a collection of all terms and our definition.
If you deem something important is missing here, feel free to [contact us](http://laxarjs.org/the-team/).


## Action

TODO


## Activity

TODO


## Artifact

TODO


## Asset

TODO


## Attribute Path

An attribute path is a JavaScript string that references a property in an object or array, possibly deeply nested.
It consists of a list of keys denoting the path to follow within the object hierarchy.
The keys are written as a string, where each key is separated by a dot from each other.


## Bootstrap CSS

TODO


## Bootstrapping Instance

TODO


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

TODO


## Composition

TODO


## Configuration

TODO


## Event Bus

TODO


## Feature Path

_Most commonly used as function argument called `featurePath`_

This is an [attribute path](#attribute-path) for a widget feature.
If not said otherwise, the path starts after the `features` key.
You'll find this being used very frequently when working with the [LaxarJS Patterns library](https://github.com/LaxarJS/laxar-patterns).


## Flow

TODO


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

TODO


## LaxarJS Mocks

TODO


## LaxarJS UiKit

TODO


## I18n

TODO


## Lifecycle

TODO


## Topic

TODO


## Page

TODO


## Place

TODO


## Publish/Subscribe

TODO


## Resource

TODO


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
