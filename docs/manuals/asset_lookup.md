[« return to the manuals](index.md)

Preliminary readings:

* [Widgets and Activities](widgets_and_activities.md)
* [Creating Themes](creating_themes.md)
* [Infrastructure and Tools](infrastructure_and_tools.md)


# Assets and the FileResourceProvider

Widgets and controls depend on various non-JavaScript resources which have to be loaded into the browser somehow.
These resources are also called *assets*.
Because of the LaxarJS themes feature, the specific set of HTML/CSS assets used by any widget always depend on the application where it is used.

In order to avoid excessive configuration, assets are selected based on their path in the directory tree of an application.


## Types of Assets handled by LaxarJS

For *widgets*, LaxarJS manages the following assets:

  * the `widget.json` *descriptor*, which describes the widget features

  * the *HTML template* which defines the widget markup, and may be overwritten by the theme

  * the *CSS stylesheet* refining the presentation of the widget, which is often overwritten by the theme, but which may also be missing completely

For *activities*, LaxarJS only manages the `widget.json` descriptor, since activities lack an associated presentation.

For *controls*, LaxarJS manages the `control.json` descriptor, and the theme-dependent CSS stylesheet (if any).
Controls may sometimes choose to load HTML assets (preferably using RequireJS), but these are not covered by the themeing mechanism.

For *layouts*, LaxarJS loads the AngularJS HTML template, and the CSS stylesheet (if any).
Both may be overridden by the application theme.


## Why Centralized Asset Handling?

Since LaxarJS widgets and controls may use AMD-style imports, they could try to include their assets themselves, for example through RequireJS plugins (*json*, *css* and *html*).
This would also allow for simple automatic minification through [r.js](https://github.com/jrburke/r.js/).
However, we chose a different approach for the following reasons:

* The runtime needs access to the `widget.json` to resolve the controller module and to validate the feature configuration, while only the actual configuration values for a specific widget instance are relevant to the corresponding controller instance.
  For this reason, the runtime should take care of obtaining the widget descriptor.

* The LaxarJS runtime knows when a widget is actually being displayed, and will only then instantiate the corresponding HTML template.

* The CSS should be loaded *en bloc* using a single, optimized stylesheet right on application entry.
  Deferring load of styles to the time where individual widgets are instantiated produces jitter and visual noise.
  Often, the page will look broken until the various CSS fragments have been loaded.

* The LaxarJS runtime will need to select assets based on the application *theme*, and based on which assets of a given artifact are available in which theme.

For these reasons, the LaxarJS runtime takes care of selecting and loading assets.
By using the FileResourceProvider service, fast development iterations as well as comprehensive optimization during production are still available.


## The FileResourceProvider

During application development, the LaxarJS runtime needs to know if HTML and CSS are available for a given artifact, and – if they are – from where to load them.
The straightforward approach for this is to query each possible location using an HTTP-request (starting with the application theme, and falling back to the default theme), and to use the first resource that is available.
However, this may considerably slow down loading the application, and will lead to a lot of ugly and confusing HTTP-404 errors in the browser console.

Ideally, the runtime would *just know* what assets are available so it could simply load the best matching variant, or skip loading completely for assets that are missing.
Fortunately, in LaxarJS there is a component that does precisely this: the *FileResourceProvider* service can be [configured](configuration.md) with a long list of all available assets.
Using this list, it can tell other components about the availability of individual asset and of their theme-specific variants.
It can also go ahead and fetch individual assets.
Of course, you do not have to create and maintain this list of assets by hand.
Instead, the [grunt-laxar](https://github.com/LaxarJS/grunt-laxar) task [laxar-resources](https://github.com/LaxarJS/grunt-laxar/blob/master/docs/tasks/internal/laxar-resources.md), which is part of the *laxar-build* target will automatically prepare the listing for you in JSON format, and the application configuration can be used to get it to the file resource provider.

While we have now eliminated the unnecessary 404 requests, in production we would like to avoid *any* requests that are not absolutely necessary.
For this reason, the FileResourceProvider can serve asset contents that were *embedded* into the JSON file listing, rather than fetching the contents using HTTP.
Again, the application configuration (`useEmbeddedFileListings`) determines if embedded assets are used.
Note that CSS is not embedded into the listings, but rather compiled into a single production CSS file by the grunt-laxar task [laxar-dist-css](https://github.com/LaxarJS/grunt-laxar/blob/master/docs/tasks/internal/laxar-dist-css.md), which is part of the *laxar-dist* target.


## Assets by Artifact Type

Having explained the general asset loading mechanism, the following sections go into detail on the individual artifact types and their asset locations.


### Looking up the Theme CSS

To load the CSS for the theme itself, the runtime simply uses the [configured](./configuration.md) theme _X_ and looks for its CSS under `includes/themes/X.theme/css/theme.css`.
The exception is the *default theme*, which is currently loaded from within _laxar-uikit_ (if no user-defined theme is specified).
Both the path for application specific themes and for the default theme can optionally be configured within the `require_config.js` of your project to match your setup.
The relevant paths are `laxar-path-themes` and `laxar-path-default-theme` respectively.
In most cases however, the predefined values should work just fine.


### Looking up Widget CSS and HTML Templates

For widget CSS styles and HTML templates, the LaxarJS runtime first checks if a version is available within the theme.
This means that you cannot only customize the CSS for a widget _x_ installed under `includes/widgets/cat/x` by placing a stylesheet at `<theme-folder>/widgets/category/x/css/x.css` but that you can also override the HTML at `<theme-folder>/widgets/category/x/x.html`.

When nothing was found among the assets bundled with the theme, the assets bundled with the widget are checked:
For a widget installed under `bower_components/x/`, the paths `bower_components/x/a.theme/css/x.css` and `bower_components/x/a.theme/x.html` respectively will be checked when using a theme `a.theme`.
Note that both locations (theme-bundled and artifact-bundled) are respected, no matter if a widget was installed as Bower component or locally into the `includes/widgets` folder.

If nothing was found for the application theme for a given widget, the `default.theme` folder within the widget itself is used.
Do note that CSS and HTML files are treated separately:
You can override the CSS but not the HTML or vice versa.


### Looking up CSS and HTML for a Layout

Themes are intended to be reusable across applications.
Because layouts are highly specific to an application, usually their CSS and HTML assets live _within the layout's folder_ of the application, with styling for all relevant themes.
However, like with widgets it is possible to style application layouts externally using the sub-folder `layouts` of the theme in use.
For lookup, the same process as for widgets is used:
First, LaxarJS searches the theme itself, then the theme folder within the layout, before finally falling back to the default theme.


### Looking up CSS for a Control

Controls (mostly AngularJS directives) take care of their own HTML loading (if required at all), so the choice of theme has no effect here.
The CSS styling however is theme specific:
Before looking for the default theme in `<control-amd-path>/default.theme/css/<control-name>.css`, LaxarJS looks for a theme specific override in `<theme-path>/controls/<control-amd-path>/css/<control-name>.css`.
Here, the `<theme-path>` refers to the folder containing your global theme, and the `<control-amd-path>` is the same path that widgets specify in their `widget.json` descriptor to include a control.
Have a look at the [manual on controls](./providing_controls.md) for details.
