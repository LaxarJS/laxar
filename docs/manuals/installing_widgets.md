# Installing Third Party Widgets

[« return to the manuals](index.md)

One of [the advantages](../why_laxar.md) of LaxarJS is the concept of isolated, reusable widgets.
This begs the question as to how an existing LaxarJS widget can be added to your application.

Preliminary readings:

* [LaxarJS Core Concepts](../concepts.md)
* [Widgets and Activities](widgets_and_activities.md)
* [Writing Pages](writing_pages.md)


## Installing Widgets from NPM

Starting with LaxarJS v2, the recommended way for installing third-party widgets is by using [NPM](https://www.npmjs.com/) or its compatible alternative, [Yarn](http://yarnpkg.com/).

Installing a widget usually becomes as simple as running:

```console
npm install --save my-widget
```

Now, the widget can be added to an area within your page definition:

```json
"myArea": [
   {
      "widget": "my-widget",
      "features": {}
   }
]
```


## Installing Widgets using Bower

For LaxarJS v1, we recommended installing widgets using [Bower](https://bower.io/), and this still works for LaxarJS v2.
Besides being a simple and fast way to download a widget, Bower helps you to install and manage widget dependencies such as controls and libraries.

However, it has shortcomings when widgets require additional tooling infrastructure (such babel) to run:
First, Bower does not directly support pre-built packages, like NPM does.
Then, all Bower dependencies are meant to be run in the Browser, so widgets cannot indicate that they require additional tooling (such as webpack loaders) to work.


### 1. Configure Webpack

First, tell webpack to use `bower_components` and the `bower.json` when resolving modules.
For this, edit the `resolve` section in your `webpack.config.js`:

```js
resolve: {
   modules: [ path.resolve( 'node_modules' ), path.resolve( 'bower_components' ) ],
   descriptionFiles: [ 'package.json', 'bower.json' ]
}
```

Touching the webpack configuration should be needed only once, except for widgets or controls that require additional `alias` configuration.
These artifacts should come with appropriate installation instructions.


### 2. Obtain Widget & Dependencies

Assuming that the widget has been registered as a Bower package named `laxar-headline-widget`, you can install it into your project like this:

```console
$ bower install --save laxar-headline-widget
```

This will also automatically install the latest version along with its Bower dependencies.
To reference this widget from a JSON page definition, set the `widget` field to `'laxar-headline-widget'`.
This will cause LaxarJS to use RequireJS in order to find the widget in the `bower_components` folder.


## Installing Widgets from Source

Installing widgets from source is a bit more involved, and usually depends on the widget in question.


### 1. Obtain the Widget

New widgets should be installed into the widgets-root (`application/widgets/` by default) just like any widgets that you create yourself.
Usually, you will simply [clone](http://git-scm.com/docs/git-clone) the required widgets from a Git repository, or add them as [Git submodules](http://git-scm.com/docs/git-submodule).

In this example, the LaxarJS headline widget in Version 4.0.0 is obtained through `git submodule`:

```sh
$ git submodule add \
    https://github.com/laxarjs/ax-headline-widget.git \
    application/widgets/laxar-headline-widget
$ cd application/widgets/laxar-headline-widget
$ git checkout v4.0.0
```

Instead of using Git, you can also simply copy a widget from another project, unpack it from a zip archive, or obtain it in any other way.
Just make sure that the widget files are located under `application/widgets/<some-path>`, then you can use `<some-path>` to reference the widget from your pages.
In the example, the path is `laxar-headline-widget`.


### 2. Obtain the Dependencies

Some widgets have extra dependencies that should be listed in the `dependencies` section of their `package.json` (or sometimes `bower.json`) file.
You should compare your widget's dependencies to those of your application, adding missing dependencies.
If your widget declares its dependencies, you can automate that process using `NPM` (or bower):

```sh
> npm install --save ./application/widgets/my-widget
# or, if the widget only has bower dependencies:
# > bower install --save ./application/widgets/my-widget
```

_Note:_ This will also install the widget itself as a dependency, which is not actually needed but also should not hurt.


### 3. Configure Paths for Webpack

The _Installation_ section of your widget should tell you if any changes need to be made to your webpack configuration.

Having followed these steps, you can now add the new widget to a page by specifying the path in your page configuration.
