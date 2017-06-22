# Creating a Project from Scratch

[« return to the manuals](index.md)

This manual is intended for experts that desire _full control_ over their application setup.
In general, using [the generator](https://laxarjs.org/docs/generator-laxarjs2-v2-latest/) is recommended instead of performing a manual application setup.

This guide will cover only the absolute basics for creating a LaxarJS project from scratch.
It does not explain how to setup [Babel](http://babeljs.io/) for ES2015 or how to add [integration technology adapters](../glossary.md#integration-technology) for using MVC frameworks.

Preliminary readings:

- [LaxarJS Core Concepts](../concepts.md)
- [Widgets and Activities](./widgets_and_activities.md)
- [Writing Pages](./writing_pages.md)
- [Flow and Places](./flow_and_places.md)


## The npm Project

You will need to create a Node.js project with webpack and basic webpack loaders.
Also needed are `laxar`, `laxar-uikit` (for the _default.theme_) and the `laxar-loader` to load LaxarJS artifacts using webpack.

```console
mkdir my-app
cd my-app
npm init
npm install --save-dev \
   webpack style-loader css-loader file-loader \
   laxar laxar-uikit laxar-loader
```

Having taken care of this, let us first look into providing a minimal set of LaxarJS application artifacts, and then add the required infrastructure to run them.


## Application Artifacts

The only application artifacts that are absolutely required are a _[flow](../glossary.md#flow)_, an empty _[page](../glossary.md#page)_ and a very basic _[layout](../glossary.md#layout)_.
Afterwards, you will want to add widgets as well, as explained in the [manual on widgets](./widgets_and_activities.md).


### Layout

Here, two files are required:

- a `layout.json` descriptor:

```js
// my-app/application/layouts/base/layout.json
{ "name": "base" }
```

- and an HTML template:

```html
<!-- my-app/application/layouts/base/default.theme/base.html -->
<h1>Welcome to your own LaxarJS setup!</h1>
<div data-ax-widget-area="content"></div>
```

Of course, the name _("base")_ is up to you.


### Page

Now, let use create a page called _"home"_ using the _base_ layout:

```js
// my-app/application/pages/home.json
{
   "layout": "base",
   "areas": {
      "content": []
   }
}
```


### Flow

Here is the minimal routing setup:

```js
// my-app/application/flows/main.json
{
   "places": {
      "home": {
         "patterns": [ "/" ],
         "page": "home"
      }
   }
}
```


## Project Scaffolding

Having created a minimal application, we still need to take care of some mundane plumbing that is required to actually get it running in your web browser.


### The init.js Entry Point

Create an `init.js` containing the application _bootstrapping code:_

```js
// my-app/init.js
require( 'laxar/dist/polyfills' ); // optional
const adapters = [];
const artifacts = require( 'laxar-loader/artifacts?flow=main&theme=default' );
const configuration = {
   // more diagnostics than the default ("INFO"):
   logging: { threshold: 'TRACE' },
   router: { navigo: { useHash: true } }
};

require( 'laxar' ).create( adapters, artifacts, configuration )
   .flow( 'main', document.querySelector( '[data-ax-page]' ) )
   .bootstrap();
```

The name of this file is up to you, but `init` is what our generator uses.


### HTML Entry

Some HTML code is required for actually loading the application in your browser, let's call it `my-app/index.html`:

```html
<!DOCTYPE html>
<html>
<head><!-- ... title, meta, favicon as you wish ... --></head>
<body>
   <div data-ax-page></div>
   <script src="build/init.bundle.js"></script>
</body>
</html>
```

Note that `data-ax-page` is an arbitrary attribute used by `init.js` to identify the anchor for the LaxarJS flow.
Instead, you could also use an ID or some other unambiguous way of selecting the desired container element.


### Webpack Configuration

To actually generate the `init.bundle.js` that was referenced in the HTML entry, let us create a basic webpack configuration.
Most of this is not specific to LaxarJS, except the alias-definition for the _default.theme_.

```js
// my-app/webpack.config.js
const path = require( 'path' );
module.exports = {
   entry: { 'init': './init.js' },

   output: {
      path: path.resolve( __dirname, `./build/` ),
      publicPath: '/build/',
      filename: '[name].bundle.js',
      chunkFilename: '[name].bundle.js'
   },

   resolve: {
      alias: {
         'default.theme': 'laxar-uikit/themes/default.theme'
      }
   },

   module: {
      rules: [
         {
            test: /\.(gif|jpe?g|png|ttf|woff2?|svg|eot|otf)(\?.*)?$/,
            loader: 'file-loader'
         },
         {
            test: /\.css$/,
            loader: 'style-loader!css-loader'
         }
      ]
   }
};
```

Now you can build your javascript bundle using `./node_modules/.bin/webpack`.
Add ` -P` for a minified, production-ready version.


## Optional: Webpack development Server

This is not specific to LaxarJS, but too useful to simply skip:

```console
npm install --save-dev webpack-dev-server
./node_modules/.bin/webpack-dev-server
```

This will serve and incrementally rebuild your application as you make changes.
When launching the web server and visiting `http://localhost:8080`, you should see the message _Welcome to your own LaxarJS setup!_, which means it is time to go ahead and [create some widgets](./widgets_and_activities.md).


## Optional: Developer Tools Support

To use the [LaxarJS Developer Tools Addon](https://chrome.google.com/webstore/detail/laxarjs-developer-tools/leidhppnemgdhcjfagmjdkfjpejibinp) for Google Chrome, you will need to add a line to the `init.js`:

```js
// my-app/init.js
// ... polyfills, adapters, configuration, artifacts, ...

require( 'laxar' ).create( adapters, artifacts, configuration )
   .tooling( require( 'laxar-loader/debug-info?flow=main&theme=default' ) )
   // .flow( ... )
   // .bootstrap();
```

This feature is _opt-in_ to avoid involuntary exposure of your application's inner workings, and to minimize performance and load-time overhead when tools are not actually needed.


## Next Steps

Of course, you are going to add widgets, usually using one or several technology adapters, which can also be installed using npm.
Then, you may want to setup transpilation using _Babel_, and possibly separate CSS bundling using the webpack _ExtractCssPlugin_.
Again, have a look at existing projects, such as the [LaxarJS ShopDemo](https://github.com/LaxarJS/shop-demo) for guidance, and/or consult the docs for the respective tools.
