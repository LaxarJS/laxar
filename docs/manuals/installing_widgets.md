[« return to the manuals](index.md)

Preliminary readings:

* [LaxarJS Core Concepts](../concepts.md)
* [Widgets and Activities](widgets_and_activities.md)
* [Writing Pages](writing_pages.md)


# Installing Third Party Widgets

One of [the advantages](../why_laxar.md) of LaxarJS is the concept of isolated, reusable widgets.
This begs the question as to how an existing LaxarJS widget can be added to your application.


## Installing Widgets Using Bower

Starting with LaxarJS v1.1.0, widgets and activities can be installed using Bower.
Besides being a simple way to download a widget, Bower helps you to install and manage widget dependencies such as controls and libraries.


### 1. Obtain Widget & Dependencies

Assuming that the widget has been registered as a Bower package named `laxar-headline-widget`, you can install it into your project like this:

```console
$ bower install --save laxar-headline-widget
```

This will also automatically install the latest version along with its Bower dependencies.
To reference this widget from a JSON page definition, set the `widget` field to `'amd:laxar-headline-widget'`.
This will use RequireJS to find the widget in the `bower_components` folder.


### 2. Configure Paths for RequireJS

Check the widget documentation to find out if any RequireJS paths need to be configured.
Starting with [grunt-laxar](https://github.com/LaxarJS/grunt-laxar) v1.1.0, automatic setup is performed for any widgets that have a `require_config.js`.


## Installing Widgets Manually

Currently, widgets must be installed manually in three steps, of which usually only the first is required.
There are plans to automate the installation in the future using bower.


### 1. Obtain the Widget

New widgets have to be installed into a sub-folder of `includes/widgets/` just like any widgets that you create yourself.
Usually, you will simply [clone](http://git-scm.com/docs/git-clone) the required widgets from a git repository, or add them as [git submodules](http://git-scm.com/docs/git-submodule).

In this example, the LaxarJS headline widget in Version 1.0.0 is obtained through `git submodule`:

```sh
$ git submodule add \
    https://github.com/laxarjs/ax-headline-widget.git \
    includes/widgets/laxarjs/ax-headline-widget
$ cd includes/widgets/laxarjs/ax-headline-widget
$ git checkout v1.0.0
```

Instead of using git, you can also simply copy a widget from another project, unpack it from a zip archive, or obtain it in any other way.
You just have to make sure that the widget files are located under `includes/widgets/<some-path>` and then you can use the value of `<some-path>` to reference the widget from your pages.
For widgets obtained from GitHub, this path is usually equivalent to the `<user>/<repository>` information.
In the example, the path is `laxarjs/ax-headline-widget`.


### 2. Obtain the Dependencies

Some widgets have extra dependencies that should be listed in the `dependencies` section of the `bower.json` file.
You should compare your widget's bower dependencies to those of your application, adding missing dependencies.
Usually, you can automate that process using `bower` itself:

```sh
bower install --save ./includes/widgets/category/widget
```

_Note:_ This will also install the widget itself as a bower component, which is not actually needed but also should not hurt.


### 3. Configure Paths for RequireJS

This is only relevant if your widget has its own bower-dependencies (step 2):
The _Installation_ section of your widget should tell you if any changes need to be made to your RequireJS configuration.
Usually, you will need to ensure that all bower-dependencies have a corresponding require-path configuration.

Having followed these steps, you can now add the new widget to a page by specifying the _artifact_ value from step 1 in your page configuration.
