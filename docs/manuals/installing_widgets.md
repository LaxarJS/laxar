[« return to the manuals](index.md)

Preliminary readings:

* [LaxarJS Core Concepts](../concepts.md)
* [Widgets and Activities](widgets_and_activities.md)
* [Writing Pages](writing_pages.md)


# Installing Third Party Widgets

Among [the advantages](../why_laxar.md) of using LaxarJS, the concept of isolated, reusable widgets was mentioned.
This begs the quetion, as to how can an existing LaxarJS widget can be added to your application.


## Installing Widgets Manually

Currently, widgets must be installed manually in three steps, of which usually only the first is required.
There are plans to add an automated bower-based installation process in the future.


### 1. Obtain the Widget

New widgets have to be installed into a sub-folder of `includes/widgets/` just like any widgets that you create yourself.
Usually, you will simply clone the required widgets from a git repository.

The recommended way to do this is using `git submodule add`:

```sh
git submodule add https://github.com/laxarjs/ax-headline-widget.git includes/widgets/laxarjs/ax-headline-widget.git
```

Instead of using git, you can also copy the widget from somewhere, unpack it from a zip archive or obtain it in any other way.
You just have to make sure that the widget's files are located under `includes/widgets/<artifact>`, where the artifact value is given by the widget's `bower.json` (specifically by the `name` field).
For widgets obtained from GitHub, this is usually equivalent to the `user/repository` information.
In the example, the package path is `laxarjs/ax-headline-widget`.


### 2. Obtain the Dependencies

Some widgets have extra dependencies that should be listed in the `dependencies` section of the `bower.json` file.
You should compare your widget's bower dependencies to those of your application, adding missing dependencies.
Usually, you can automate that process using `bower` itself:

```sh
bower install --save ./includes/widgets/category/widget`
```

_Note:_ This will also install the widget itself as a bower component, which is not needed but also should not hurt.


### 3. Configure Paths for RequireJS

This is only relevant if your widget has its own bower-dependencies (step 2):
The _Installation_ section of your widget should tell you if any changes need to be made to your RequireJS configuration.
Usually, you will need to ensure that all bower-dependencies have a corresponding require path configuration.

Now you can use the new widget within your pages, by using the artifact value from step 1 in your page configuration. 


## Installing Widgets Automatically

This is still in the works: for LaxarJS [v1.0](https://github.com/LaxarJS/laxar/issues?q=is%3Aopen+is%3Aissue+label%3Ablocks-1.0), we are evaluating to automate all three steps, possibly using `bower` and [bower-requirejs](https://github.com/yeoman/bower-requirejs).
