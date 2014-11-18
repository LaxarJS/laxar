[« return to the manuals](index.md)

Preliminary readings:

* [LaxarJS Core Concepts](../concepts.md)


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
    The `data-ax-application-mode` attribute allows to differentiate configuration between _DEBUG_ and _RELEASE_ mode.
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
     Widgets and activities controllers may already start to make HTTP requests if they need to while the view is being setup.

  6. After all controllers are instantiated, the page controller publishes the `beginLifecycleRequest` event to signal that widgets may start publishing events themselves.
     Now all widget templates are instantiated, inserted into the layout DOM and linked to their controllers' scopes.

  7. Finally, the page controller signals to the flow controller that navigation is complete, upon which the flow controller publishes the `didNavigateEvent`.
     This allows widgets to handle their URL place parameters, and from now on they may publish navigate requests got further navigation. 

From this point on, the LaxarJS runtime interacts only through the event bus with widgets and activities.
The only exception to this rule is the _page teardown_ caused by _navigation_, either _indirectly_ through a widget, or _directly_ by changing the URL in the browser.


### Teardown

Before navigating away from a page, widgets receive `willNavigate` and `endLifecycleRequest` events, before their scope is destroyed through the regular AngularJS mechanism.
However, when the user simply closes the browser window, this is not always guaranteed.
If navigating to a new page, the startup process (described above) repeated, starting at step 3.


### The File Resource Provider

Internally, LaxarJS uses a single service to provide HTML, CSS and JSON assets used to instantiate widgets and controls:
The file resource provider is used to find out if a given template or stylesheet is available for the current theme.
It uses _file listings_ (JSON files) to answer these queries without actually going to the web server.
File listings also contain bundled resources to avoid HTTP requests in production (not during development).
If your application causes a lot of HTTP requests for widget templates and CSS, it is likely due to a misconfiguration of the file listings.
The listings are generated by one of the LaxarJS _grunt tasks_, which are described subsequently.



## LaxarJS Development Tools

Most modern single page applications are no longer developed using just a text editor, and instead relies on additional development- and build-tools. 
The npm module [grunt-laxar](//github.com/LaxarJS/grunt-laxar) provides the tooling to run LaxarJS applications and to optimize their assets.
It consists of several [grunt](http://gruntjs.com) tasks that help to manage the assets and dependencies used by your application, as well as a development server to simplify the development process.
The application template contains a grunt configuration file (`Gruntfile.js`) that will work for most scenarios, but feel free to modify the configuration if you would like to add your own tools to the build pipeline.


### LaxarJS Grunt Tasks

Following are the most important LaxarJS grunt tasks. 
To actually run the tasks, you will usually run one of the short, _alias tasks_ defined to the end of the `Gruntfile.js` (see below). 
None of the tasks is strictly necessary to develop and run your application, but in concert they go a long way to help reduce boilerplate code and to allow for an optimized user experience.
In other words: you will not want to do without them.

  * `portal_angular_dependencies`

    This task finds every page that can be reached from your flow definition to collect all widgets and activities used by your application, and all controls used by your widgets.
    From that list, it generates a listing of all the corresponding AngularJS modules and saves it to `var/static/portal_angular_dependencies.js`.
    It is the prerequisite for step 1 of the startup process described above.
    Of course, you could assemble and maintain such a listing by hand, but using the grunt task is a lot easier and less error prone.  

  * `directory_tree`

    This task generates a JSON file tree that is used to avoid unnecessary HTTP requests for static assets.
    The listings tell the LaxarJS file resource provider, which of the assets relevant to controls and widgets are available.
    Listings may also embed entire assets to avoid having to fetch them, which is used to minimize load time in production.
    Which assets to embed and which to list is determined by the task configuration.
    In the application template, three listings are configured to cover the three relevant directory trees:
    
      1. `includes/` - contains widget templates and stylesheets, as well as templates that are overridden by a theme.
      
      2. `application/` - contains the flow definition, pages and compositions, as well as layouts.
      
      3. `bower_components/` - contains assets for LaxarJS UiKit, for controls and for the default theme
      
    All three trees are heavily filtered to make sure that no unnecessary files are included.
    If something is missing, you can add a corresponding pattern to the Gruntfile.

  * `css_merger`
  
    Similar to `portal_angular_dependencies`, this tasks finds and concats all CSS for the theme and for widgets, layouts and controls within your application.
    It repeats the process once for each theme under `includes/themes`.
    The resulting theme CSS is then used during production, to have as few CSS-related HTTP requests as possible, which reduces the number of HTTP requests as well the CPU load.

  * `requirejs`
  
    Based on your require configuration and the module list generated by `portal_angular_dependencies`, this produces a single, minified JavaScript file containing all your widgets and their dependencies, including LaxarJS and AngularJS.
    Similarly to the CSS merger, this allows for fast loading of your application during production.
    Internally, `grunt-contrib-requirejs` is used.

  * `widgets`
  
    Runs all widgets' spec tests in a headless web browser, using [Karma](http://karma-runner.github.io) and [PhantomJS](http://phantomjs.org/).
    This is a very useful starting point to setup continuous integration for your project, and for a TDD-based development process.


#### Task Aliases

The aliases make sure that task dependencies are observed, plus they are easier to remember and type than the full tasks.

  * `build`: creates file listings and angular dependencies, automatically runs when you start the development server

  * `optimize`: makes sure that CSS and JavaScript are available for release

  * `develop`: starts the development server (see below), and watches for file changes (see below)
  
  * `test`: runs your widget tests.


### The LaxarJS Development Server

The development server based on [Connect middleware](https://github.com/senchalabs/connect) helps to run your application without having to setup a full-blown web server.
It polls for changes to your widgets and automatically refreshes the browser by injecting a [live reload](https://github.com/intesso/connect-livereload) script.
By default, the development server runs on port 8000, but this can be configured in the Gruntfile.
The directories that are watched for live reload can also be reconfigured.
This may be necessary if you are developing a library within in your project, and that library does not belong to a single widget.


## Other Toolchains

As you have seen, the LaxarJS tools provide a lot of useful functionality.
However the _runtime_ does not require that grunt-laxar is installed, it just depends on the right files in the `var` directory.
In fact, when deploying your application to a web server, you should be able to omit the node modules entirely.

This means that nothing stops you from using a different toolchain, say one that is based on [gulp.js](http://gulpjs.com/), as long as it produces the right assets.
Hopefully though, the tools provided with LaxarJS serve as a useful stepping stone towards your perfect build process.
