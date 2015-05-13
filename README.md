# LaxarJS

> _Middleware for your web client:_ Create maintainable AngularJS applications from small, isolated parts.


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

The scaffolding tool `grunt-init` can now be used to create artifacts from the LaxarJS templates:

```sh
mkdir tryout
cd tryout
grunt-init laxar-application
npm install
npm start
```

Visit your empty application at [http://localhost:8000/debug.html](http://localhost:8000/debug.html).

Press `Ctrl-C` to stop the server for now.


### Create your first LaxarJS widget

Create a widget which simply displays _Hello, world!_:

```sh
mkdir -p includes/widgets/tryout/my_first_widget
cd includes/widgets/tryout/my_first_widget
grunt-init laxar-widget
```

Add some widget-HTML:

```sh
echo '<h1>Hello, world!</h1>' > default.theme/my_first_widget.html
```

Reference the widget from your page:

```sh
cd -
echo '{
   "layout": "one_column",
   "areas": {
      "activities": [ ],
      "header": [ ],
      "content": [
          {
             "widget": "tryout/my_first_widget"
          }
      ],
      "footer": [ ]
   }
}
' > application/pages/page1.json
npm start
```

See your widget in action at [http://localhost:8000/debug.html](http://localhost:8000/debug.html)


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
