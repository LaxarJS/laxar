# LaxarJS [![Build Status](https://travis-ci.org/LaxarJS/laxar.svg?branch=master)](https://travis-ci.org/LaxarJS/laxar)

> _Middleware for your web client:_ Create maintainable applications from small, isolated parts.


## Why LaxarJS?

Find out [why](docs/why_laxar.md) you would use LaxarJS and if it's the right tool for you.
Then, explore the [core concepts](docs/concepts.md) and browse the [manuals](docs/manuals/index.md) in the [documentation](docs).

Have a look at the [LaxarJS homepage](http://laxarjs.org) for demos and more information.


## Getting Started

The following is a very minimal getting started guide.
It helps you to set up your first LaxarJS application and to create your first LaxarJS widget.


### Get the Prerequisites

The node package manager [npm](https://www.npmjs.com) is required to get started with LaxarJS.
First we use it to obtain some basic development tools ([grunt-cli](http://gruntjs.com/using-the-cli) and [grunt-init](http://gruntjs.com/project-scaffolding)), as well as templates for the main LaxarJS artifact types:

```sh
npm install -g grunt-cli grunt-init
git clone https://github.com/LaxarJS/grunt-init-laxar-application.git ~/.grunt-init/laxar-application
git clone https://github.com/LaxarJS/grunt-init-laxar-widget.git ~/.grunt-init/laxar-widget
git clone https://github.com/LaxarJS/grunt-init-laxar-activity.git ~/.grunt-init/laxar-activity
```

_Note that_, depending on your workstation setup, you might have to use `sudo` when running `npm install` with the `-g` option.
Make sure that your `PATH` includes the `.../node_modules/bin` directory.
For additional information and troubleshooting, consult the documentation of `npm` and `grunt-init` respectively. 


### Create a LaxarJS Application from Our Template

The scaffolding tool `grunt-init` can now be used to create artifacts from the LaxarJS templates.
When asked if you would like to create an example application, answer with *Yes*.

```sh
mkdir tryout
cd tryout
grunt-init laxar-application
npm install
npm start
```

Visit your fresh application at [http://localhost:8000/debug.html](http://localhost:8000/debug.html).

Press `Ctrl-C` to stop the server for now.


### Create your own LaxarJS widget

Create a widget which simply displays _Hello, world_:

```sh
mkdir -p includes/widgets/tryout/my-first-widget
cd includes/widgets/tryout/my-first-widget
grunt-init laxar-widget
```

Add some widget-HTML:

```sh
echo '<h1>Hello, world!</h1>' > default.theme/my-first-widget.html
```

Add the widget to the page *application/pages/example1.json*, so that it looks like this:

```js
{
   "layout": "two-columns",
   "areas": {
      "left": [
         {
            "widget": "tryout/my-first-widget"
         }
      ],
      // ...
   }
}
```

Now you may start the development server again:

```sh
cd -
npm start
```

See your *Hello, World!* widget in action at [http://localhost:8000/debug.html](http://localhost:8000/debug.html)


### Create a Compressed Release-Ready Version of Your Application

First, stop the development server using `Ctrl-C`.

```sh
grunt optimize
npm start
```

Now your production-ready application can be visited at [http://localhost:8000/index.html](http://localhost:8000/index.html).
You can also use `grunt dist` to get a zip archive containing the application without development server and build tools.


#### Next Steps

Have fun developing your first LaxarJS application.

Make sure to have a look at the [manuals](docs/manuals/index.md) and and check out the demo applications on the [LaxarJS website](http://laxarjs.org/).
If you're already developing your first widgets and want to know which programmatic APIs are provided by LaxarJS, have a look at the [API docs](docs/api).
