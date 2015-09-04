[« return to the manuals](index.md)

Preliminary readings:

* [LaxarJS Core Concepts](../concepts.md)

> *Note:* with LaxarJS v1.1.0, the grunt-based infrastructure has been completely overhauled.
> For the previous manual, make sure to browse the [v1.0.0 documentation](https://github.com/LaxarJS/laxar/blob/v1.0.0/docs/manuals/infrastructure_and_tools.md).


# Infrastructure and Tools

What does actually happen when you navigate to a LaxarJS page using the browser?
How does LaxarJS load your widgets, their assets and styles?
And what is the difference between the `debug.html` and `index.html` in the application template?
Read on to understand the inner workings of a LaxarJS application.

## Application Lifecycle

The [LaxarJS application template](//github.com/LaxarJS/grunt-init-laxar-application/tree/master/root) contains a `debug.html` which helps to bootstrap you application.
Additionally, there is an `index.html` that allows you to run the application using optimized scripts and assets.

In your own application, you do not have to actually use these files:
Instead you may copy the relevant parts into a [Ruby on Rails](http://rubyonrails.org/) or [Django](https://www.djangoproject.com/) template, or into a [JSP](http://en.wikipedia.org/wiki/JavaServer_Pages) and bootstrap LaxarJS from there.

### Scaffolding

Let us dissect the startup process of a LaxarJS application based on the `debug.html`, only that we have removed everything that is not absolutely required:

```HTML
<!DOCTYPE html>
<html>
<head><!-- ... optional: meta elements, title, page blocker styles go here ... --></head>
<body>
  <div data-ax-page></div>
  <div data-ng-view></div>

  <script data-ax-application-mode="DEBUG" src="application/application.js"></script>
  <script src="require_config.js"></script>
  <script data-main="../init.js" src="bower_components/requirejs/require.js"></script>
</body>
</html>
```

What do the individual elements mean?

  * The `axPage` directive determines where LaxarJS will place the layout for the current page.

  * The `ngView` directive integrates the [$ngRoute](https://docs.angularjs.org/api/ngRoute)-service, which the [LaxarJS flow](./flow_and_pages.md) uses for URL routing.

  * The `application/application.js` contains the [LaxarJS configuration](./configuration.md) for your application.
    The `data-ax-application-mode` attribute allows to differentiate configuration between _DEBUG_ and _PRODUCTION_ mode.
    It allows you to use bundled CSS, HTML and JSON assets for production, while always using their fresh source version during development.
    The attribute is not used by LaxarJS itself, but only by the `application.js` which is under your control, so using it is a convention rather than an API.

  * The `require_config.js` configures paths to libraries for [AMD-loading](http://requirejs.org/docs/whyamd.html).
    These may be your own libraries or 3rd party libraries installed through [Bower](http://bower.io/).

  * Finally, [RequireJS](http://requirejs.org) is loaded to bootstrap your application:
    The `data-main` tells RequireJS where to find the initialization code (`init.js`), which is the entry point to all AMD-modules for your application.
    AngularJS modules are automatically loaded for any [widgets/activities](./widgets_and_activities.md) and [controls](./providing_controls.md) that are reachable from your [flow](./flow_and_places.md):
    A LaxarJS grunt task prepares this list whenever you `npm install` your application or `npm start` the development server, so usually you will not to have manage AngularJS modules manually.
    For production (`grunt optimize`, see below), all RequireJS dependencies are combined and minified by default.

The HTML files in the application template also contain an optional `axPageFade` and associated styles.
This creates an overlay that covers your application with a white layer during navigation and then fades out, to may make loading a bit nicer on the eyes.
However, this may not be right for all applications, so feel free to remove the overlay, or replace it with a custom version.


### Startup

So, let us see what happens once all required JavaScript modules are available:

  1. The `init.js` collects all AngularJS module dependencies for your application and passes them to `laxar.bootstrap()`.

  2. `laxar.bootstrap()` just sets up a logging mechanism and invokes the AngularJS `ng.bootstrap` with the collected dependencies.
     This sets up your application modules and their dependencies as well as all internal LaxarJS services and `ngRoute`.
     During initialization, LaxarJS integrates with `ngRoute`, to take over navigation handling.

  3. `ngRoute` triggers the LaxarJS _flow controller_ which selects a page from the [flow definition](./flow_and_places.md), based on the current URL.

  4. The flow controller instantiates a _page controller_ for the current page.

  5. The page controller loads and inserts the page layout and instantiates the controllers for widgets and activities.
     Also, it loads the widget HTML templates and their CSS (during development).
     Widgets and activities controllers may already start to make HTTP requests if they need to while their view is being setup.

  6. When all controllers have been instantiated, the page controller publishes the `beginLifecycleRequest` event to signal that widgets may start publishing events themselves.
     Then, all widget templates are instantiated, inserted into the layout DOM and linked to their controllers' scopes.

  7. Finally, the page controller signals to the flow controller that navigation is complete, upon which the flow controller publishes the `didNavigateEvent`.
     This allows widgets to handle their URL place parameters, and from now on they may publish navigate requests for further navigation.

From this point on, the LaxarJS runtime interacts only through the event bus with widgets and activities.
The only exception to this rule is the _page teardown_ caused by _navigation_, either _indirectly_ through a widget, or _directly_ by changing the URL in the browser.


### Teardown

Before navigating away from a page, widgets receive `willNavigate` events. If the page is actually being left (alternatively, there may just have been an update to the URL parameters of the current page) an `endLifecycleRequest` event is published, before the widget scopes are destroyed through the regular AngularJS mechanism.
However, when the user simply closes the browser window, this is not always guaranteed.
If navigating to a new page, the startup process (described above) is repeated, starting at step 3.


### The File Resource Provider

Internally, LaxarJS uses a single service to provide HTML, CSS and JSON assets used to instantiate widgets and controls:
The _file resource provider_ is used to find out if a given template or stylesheet is available for the current theme.
It uses _resource listings_ (JSON files) to answer these queries without actually going to the web server.

Resource listings also contain bundled resource contents to avoid HTTP requests in production (not during development).
If your application causes a lot of HTTP requests for widget templates and CSS during production, it is likely due to a misconfiguration of the resource listings.
The listings are generated by one of the LaxarJS _grunt tasks_, which are described next.


## LaxarJS Development Tools

Most modern single page applications are no longer developed using just a text editor, and instead rely on additional development- and build-tools.
The npm module [grunt-laxar](//github.com/LaxarJS/grunt-laxar) provides the tooling to run LaxarJS applications and to optimize their assets.
It consists of several [grunt](http://gruntjs.com) tasks that help to manage the assets and dependencies used by your application, as well as a development server to simplify the development process.
The application template contains a grunt configuration file (`Gruntfile.js`) that will work for most scenarios, but feel free to modify the configuration if you would like to add your own tools to the build pipeline.


### LaxarJS Grunt Tasks

Following are the most important LaxarJS grunt tasks.
To actually run the tasks, you will usually run one of the short _alias tasks_ defined to the end of the `Gruntfile.js` (see below).
None of the tasks is strictly necessary to develop and run your application, but in concert they go a long way to avoid manual work or boilerplate code and to allow for an optimized user experience.
In other words: you will not want to do without them.

For the full story on the LaxarJS grunt tasks, consult the [grunt-laxar docs](https://github.com/LaxarJS/grunt-laxar#grunt-laxar-).
The following list just gives a quick overview of the available tasks and what their job is.
During day-to-day work, you will likely only use the alias tasks described in the next section, and will not have to deal with these tasks. However, this information may improve your understanding of LaxarJS:

  * `laxar-configure` dynamically configures settings for all other grunt-laxar tasks based on your application flows.
    Often, this is the only task needing manual configuration ([more](https://github.com/LaxarJS/grunt-laxar/blob/master/docs/tasks/laxar-configure.md)).

  * `laxar-artifacts` collects all artifacts for a given flow and prepares a JSON model from them. This model is used by the other build-tasks and can also be queried by the `laxar-info` task  ([more](https://github.com/LaxarJS/grunt-laxar/blob/master/docs/tasks/internal/laxar-artifacts.md)).

  * `laxar-resources` prepares the *resources listing* in JSON format for a given flow, based on the artifacts model described above (more). These listings are consulted by the LaxarJS runtime to determine if a widget has HTML/CSS assets for a given theme, and (in production mode) to obtain their contents  ([more](https://github.com/LaxarJS/grunt-laxar/blob/master/docs/tasks/internal/laxar-resources.md)).

  * `laxar-merge-require-config` combines `require_configuration.js` fragments from all artifacts of a given flow, helping you to automatically setup your AMD path configuration. Keep in mind, that widgets and controls have to provide these files for automatic configuration to work  ([more](https://github.com/LaxarJS/grunt-laxar/blob/master/docs/tasks/internal/laxar-merge-require-config.md)).

  * `laxar-dependencies` uses the artifacts model to prepare a list of AMD modules comprising the flow artifacts, and to collect them into a *dependencies* module. These modules are loaded by RequireJS during application bootstrap, or (for production) during creation of an optimized bundle ([more](https://github.com/LaxarJS/grunt-laxar/blob/master/docs/tasks/internal/laxar-dependencies.md)).

  * `laxar-build` prepares *configuration*, *artifacts*, *resources* and *dependencies* for all configured flows, using the building-block tasks described above ([more](https://github.com/LaxarJS/grunt-laxar/blob/master/docs/tasks/laxar-build.md)).

  * `laxar-dist-css` uses the artifacts model to collect all CSS files that are used by a given flow artifacts, and kicks off [grunt-contrib-cssmin](https://www.npmjs.com/package/grunt-contrib-cssmin) to assemble the CSS files into an optimized bundle ([more](https://github.com/LaxarJS/grunt-laxar/blob/master/docs/tasks/internal/laxar-dist-css.md)).

  * `laxar-dist-js` creates an optimized javascript bundle from the application dependencies, using [r.js](https://www.npmjs.com/package/grunt-contrib-requirejs)  ([more](https://github.com/LaxarJS/grunt-laxar/blob/master/docs/tasks/internal/laxar-dist-js.md)).

  * `laxar-dist` prepares optimizes *CSS* and *JavaScript* bundles, using the building-block tasks described above ([more](https://github.com/LaxarJS/grunt-laxar/blob/master/docs/tasks/laxar-dist.md)).

  * `laxar-configure-watch` prepares configuration for the [watch](https://www.npmjs.com/package/grunt-contrib-watch) task based on the artifacts model ([more](https://github.com/LaxarJS/grunt-laxar/blob/master/docs/tasks/internal/laxar-configure-watch.md)).

  * `laxar-develop` launches a development server, using the building-block tasks described above to prepare all build artifacts and to configure watch for live-reload functionality ([more](https://github.com/LaxarJS/grunt-laxar/blob/master/docs/tasks/laxar-develop.md)).

  * `laxar-test` runs all widgets' spec tests in a headless web browser, using [Karma](http://karma-runner.github.io) and [PhantomJS](http://phantomjs.org/).
    This is a useful starting point to setup continuous integration for your project  ([more](https://github.com/LaxarJS/grunt-laxar/blob/master/docs/tasks/laxar-test.md)).


#### Task Aliases

The aliases make sure that task dependencies are observed, plus they are easier to remember and type than the full tasks. To use them, define them in your `Gruntfile.js` or create your application from the current template (recommended).

  * `build` creates file listings and application dependencies, automatically runs when you start the development server

  * `optimize` makes sure that CSS and JavaScript are available for release

  * `start` starts the development server (see below), and watches for file changes (see below)

  * `test` runs your widget tests.


### The LaxarJS Development Server

The development server based on [Connect middleware](https://github.com/senchalabs/connect) helps to run your application without having to setup a full-blown web server.
It polls for changes to your widgets and automatically refreshes the browser by injecting a [live reload](https://github.com/intesso/connect-livereload) script.
By default, the development server runs on port 8000, but this can be configured in the Gruntfile.
Additional directories to be watched for live reload can also be reconfigured.
This may be necessary if you are developing a library within in your project, and that library does not belong to a specific widget.


## Other Toolchains

As you have seen, the LaxarJS tools provide a lot of useful functionality.
However the _runtime_ does not require that grunt-laxar is installed, it just depends on the right files in the `var` directory.
In fact, when deploying your application to a web server, you may omit the node modules entirely.

This means that nothing stops you from using a different toolchain, say one that is based on [gulp.js](http://gulpjs.com/), as long as it produces the right assets.
Hopefully though, the tools provided with LaxarJS serve as a useful stepping stone towards your perfect build process.
