[« return to the manuals](index.md)

Preliminary readings:

* [LaxarJS Core Concepts](../concepts.md)
* [Widgets and Activities](widgets_and_activities.md)
* [Writing Pages](writing_pages.md)


# Installing Third Party Widgets

Among [the advantages](../why_laxar.md) of LaxarJS the concept of isolated, reusable widgets was mentioned.
This begs the question as to how an existing LaxarJS widget can be added to your application.


## Installing Widgets Manually

Currently, widgets must be installed manually in three steps, of which usually only the first is required.
There are plans to automate the installation in the future using bower.


### 1. Obtain the Widget

New widgets have to be installed into a sub-folder of `includes/widgets/` just like any widgets that you create yourself.
Usually, you will simply [clone](http://git-scm.com/docs/git-clone) the required widgets from a git repository, or add them as [git submodules](http://git-scm.com/docs/git-submodule).

In this example, the LaxarJS headline widget in Version 1.0.0 is obtained through `git submodule`:

```sh
git submodule add https://github.com/laxarjs/ax-headline-widget.git includes/widgets/laxarjs/ax-headline-widget
cd includes/widgets/laxarjs/ax-headline-widget
git checkout v1.0.0
```

Instead of using git, you can also simply copy a widget from another project, unpack it from a zip archive, or obtain it in any other way.
You just have to make sure that the widget files are located under `includes/widgets/<artifact>`, where the artifact value is given by the widget's `bower.json` (specifically by the `name` field).
For widgets obtained from GitHub, this is usually equivalent to the `user/repository` information.
In the example, the package path is `laxarjs/ax-headline-widget`.


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


## Installing Widgets Automatically

This is still in the works: for LaxarJS [v1.1](https://github.com/LaxarJS/laxar/issues?q=is%3Aopen+is%3Aissue+label%3Ablocks-1.0), we are evaluating to automate all three steps, possibly using `bower` and [bower-requirejs](https://github.com/yeoman/bower-requirejs).
