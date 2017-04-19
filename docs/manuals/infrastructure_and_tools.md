# Infrastructure and Tools

[« return to the manuals](index.md)

What does actually happen when you navigate to a LaxarJS page using the browser?
How does LaxarJS load your widgets, their assets and styles?
And what is the difference between the `debug.html` and `index.html` in the application template?
Read on to understand the inner workings of a LaxarJS application.

Preliminary readings:

* [LaxarJS Core Concepts](../concepts.md)
* [Widgets and Activities](./widgets_and_activities.md)

> *Note:* with LaxarJS v2.0, the grunt-based infrastructure was replaced by a webpack-based system.
> For the previous manual, make sure to browse the [LaxarJS v1 documentation](https://laxarjs.org/docs/laxar-v1-latest/).


## Application Lifecycle

The [LaxarJS Yeoman generator](//github.com/LaxarJS/generator-laxarjs) contains a `debug.html` that contains the to bootstrap you application during development.
Additionally, there is an `index.html` that shows how to run the application using optimized scripts and assets.

In your own application, you do not actually have to use these files:
Depending on your setup, you may wish to copy the relevant parts into a [Ruby on Rails](http://rubyonrails.org/) or [Django](https://www.djangoproject.com/) template, or into a [JSP](http://en.wikipedia.org/wiki/JavaServer_Pages) and bootstrap LaxarJS from there.


### Scaffolding

Let us dissect the startup process of a LaxarJS application based on the `debug.html`, only that we have removed everything that is not absolutely required:

```HTML
<!DOCTYPE html>
<html>
<head><!-- ... optional: meta elements, title, favicons go here ... --></head>
<body>
  <div data-ax-page></div>

  <!-- ... optional: add scripts for improved source-map-support -->
  <script src="build/app.bundle.js"></script>
</body>
</html>
```

What do the individual elements mean?

* The `data-ax-page` attribute is referenced by the `init.js` to determine where LaxarJS will place the layout for the current page.

* The `script` element loads your application bundle based on the `init.js` entry point, as configured by the `webpack.config.js`.


### Startup

So, let us see what happens once all required JavaScript modules are available:

1. The `init.js` collects all dependencies for your application and passes them to `laxar.create`.

2. `laxar.create().….bootstrap()` sets up the runtime services based on your configuration, and bootstraps all technology adapters used by your application.

3. If a flow was initialized before bootstrapping (using `laxar.create(…).flow( name, domNode )`), it is now instantiated, and its patterns are used to set up the [Navigo router](https://www.npmjs.com/package/navigo).

4. The router matches the flow routing patterns against the current URL, and invokes the LaxarJS _flow controller_ with the matching place, so that the current _page_ is determined (possibly after following redirects).

5. The flow controller instantiates a _page controller_ for the current page.

6. The page controller loads and inserts the page layout and instantiates the controllers for widgets and activities.
Also, it loads the widget HTML templates and their CSS (during development).
Widget and activity controllers may already start to make HTTP requests if they need to, while their view is being setup.

7. After all controllers have been instantiated, the page controller publishes the `beginLifecycleRequest` event to signal that widgets may start publishing events themselves.
Then, all widget templates are instantiated, inserted into the layout DOM and linked to their controllers' scopes.

8. Finally, the page controller signals to the flow controller that navigation is complete, upon which the flow controller publishes the `didNavigate` event.
This allows widgets to handle their URL place parameters, and from now on they may publish navigate requests for further navigation.

From this point on, the LaxarJS runtime interacts only through the event bus with widgets and activities.
The only exception to this rule is the _page teardown_ caused by _navigation_, either _indirectly_ through a widget, or _directly_ by changing the URL in the browser.


### Teardown

Before navigating away from a page, widgets receive `willNavigate` events.
If the page is actually being left (there may just have been an update to the URL parameters of the current page) an `endLifecycleRequest` event is published, before the widget scopes are destroyed through the regular AngularJS mechanism.
However, when the user simply closes the browser window, this is not always guaranteed.
If navigating to a new page, the startup process (described above) is repeated, starting at step 3.


### The Artifacts Bundle

Internally, LaxarJS uses a single service to provide HTML, CSS and JSON assets used to instantiate widgets and controls:
The _artifacts provider_ manages a bundle that was prepared by the `laxar-loader` for webpack at build-time, and contains the JavaScript modules as well as CSS/HTML assets for all application artifacts.
This avoids additional HTTP round trips in production, as well as during development.


## Webpack and the laxar-loader

Most modern single page applications are no longer developed using just a text editor, and instead rely on additional development- and build-tools.
The npm module [laxar-loader](laxarjs.org/docs/laxar-loader-v2-latest/) helps to load LaxarJS application artifacts that using the popular [webpack bundler](https://webpack.js.org/).
Used on a flow definition, this laxar-loader will bundle up all required artifacts, by following the flow via its pages and widgets to its controls and layouts.

LaxarJS does not actually require you to use webpack (for previous version, using RequireJS as loader was mandatory), because it does not perform module loading at runtime.
However, to use a different tool chain, you will to generate the artifacts bundle yourself.
If you need to do so, look into the laxar-loader and its dependency [laxar-tooling](laxarjs.org/docs/laxar-tooling-v2-latest/) for inspiration.


### Running the Development Server

The excellent [DevServer for webpack](https://webpack.js.org/configuration/dev-server/) allows you to quickly prototype and review changes to your widget.
Depending on the integration technology, you might even be able to "hot-reload" widget templates without reloading the browser window.
For projects created with the Yeoman generator for LaxarJS, you can run the DevServer using `npm start`.
