# Assets and the FileResourceProvider

[« return to the manuals](index.md)

Widgets and controls depend on various non-JavaScript resources which have to be loaded into the browser somehow.
These resources are also called *assets*.

Preliminary readings:

* [Widgets and Activities](widgets_and_activities.md)
* [Creating Themes](creating_themes.md)
* [Infrastructure and Tools](infrastructure_and_tools.md)

Because of the LaxarJS themes feature, the specific set of HTML/CSS assets used by any widget or control always depend on the application where it is used.

In order to avoid excessive configuration, assets are automatically resolved based on their path in the directory tree of an application.


## Types of Assets handled by LaxarJS

For *widgets*, LaxarJS manages the following assets:

  * the `widget.json` *descriptor*, which describes the widget features

  * the *HTML template* which defines the widget markup, and may be overwritten by the theme

  * the *CSS stylesheet* refining the presentation of the widget, which is often overwritten by the theme, but which may also be missing completely

For *activities*, LaxarJS only manages the `widget.json` descriptor, since activities have no presentation.

For *controls*, LaxarJS manages the `control.json` descriptor, and the theme-dependent CSS stylesheet (if any).
Controls may sometimes choose to load HTML assets (preferably using webpack), but these are not covered by the themeing mechanism.

For *layouts*, LaxarJS loads an HTML template, and the CSS stylesheet (if any).
Both may be overridden by the application theme.


## Why Centralized Asset Handling?

Since LaxarJS widgets and controls may use JavaScript import- or require-calls, they could try to include their assets themselves, for example by using the webpack raw-loader.
This would also allow for simple automatic minification using `webpack -P`.
However, we chose a different approach for the following reasons:

* The runtime needs access to the `widget.json` to resolve the controller module, while only the actual configuration values for a specific widget instance are relevant to the corresponding controller instance.
  For this reason, the runtime should take care of reading the widget descriptor and pass the preprocessed configuration to each widget instance.
  Also, we want to validate the feature configuration of widgets and compositions at build-time, which is only only possible if LaxarJS handles loading of widget descriptors and page definitions.

* The LaxarJS runtime knows when a widget is actually being displayed, and will only then instantiate the corresponding HTML template.
  This reduces memory consumption and improves render performance.

* The CSS should be loaded *en bloc* using a single, optimized stylesheet right on application entry.
  Deferring load of styles to the time where individual widgets are instantiated produces jitter and visual noise.
  Often, the page will look broken until the various CSS fragments have been loaded.

* The LaxarJS bundle needs to select assets based on the application *theme*, and based on which assets of a given artifact are available in which theme.

For these reasons, LaxarJS takes care of selecting and loading assets.
By using the [laxar-loader](laxarjs.org/docs/laxar-loader-v2-latest/) for webpack, fast development iterations as well as comprehensive optimization during production are still available.


## The Artifacts Bundle

During application development, the LaxarJS runtime needs to know if HTML and CSS are available for a given artifact, and – if they are – from where to load them.
The straightforward approach for this is to query each possible location using an HTTP-request (starting with the application theme, and falling back to the default theme), and to use the first resource that is available.
However, this may considerably slow down loading the application, and will lead to a lot of ugly and confusing HTTP-404 errors in the browser console.

Ideally, the runtime would *just know* what assets are available so it could simply load the best matching variant, or skip loading completely for assets that are missing.

Fortunately, using the laxar-loader allows to do precisely this:
It has the knowledge that is needed to determine which artifacts and assets are actually used, and produces an `artifacts` bundle which can be passed to LaxarJS `bootstrap`, and is then used both internally by the runtime and made available as the `axAssets` injection to widgets.


## Assets by Artifact Type

Having explained the general asset loading mechanism, the following sections go into detail on the individual artifact types and their asset locations.


### Looking up the Theme CSS

The laxar-loader is parameterized with a list of themes to include in its lookup chain.
No matter what themes are specified, the `default.theme` is always added as a final entry to the resulting list.

To load the CSS for the theme itself, the loader simply checks each theme _T_ and looks for its CSS under `application/themes/T.theme/css/theme.css`, using the first theme that is available.


### Looking up Widget CSS and HTML Templates

For widget CSS styles and HTML templates, the laxar-loader first checks if a version is available within the theme directory.
This means that you cannot only customize the CSS for a widget _W_ installed under `application/widgets/W` by placing a stylesheet at `<theme-folder>/widgets/W/css/W.css` but that you can also override the HTML at `<theme-folder>/widgets/W/W.html`.

When nothing was found among the assets bundled with the theme, the assets bundled with the widget are checked:
For a widget installed under `node_modules/W/`, the paths `node_modules/W/T.theme/css/W.css` and `node_modules/W/T.theme/W.html` respectively will be checked when using a theme _T_.
Note that both locations (theme-bundled and artifact-bundled) are respected, no matter if a widget was installed using NPM or locally under `application/widgets/`.

If nothing was found for the application theme for a given widget, the `default.theme` folder within the widget itself is used.
Note that CSS and HTML files are treated separately:
You can choose to override the CSS but not the HTML or vice versa.


### Looking up CSS for a Control

Controls take care of their own HTML loading (if required at all), so the choice of theme has no effect here.
The CSS styling of a control however is theme-specific.
For a control named _"C"_ in its `control.json` descriptor, it works as follows:
Before looking for the default theme in `<control-path>/default.theme/css/C.css`, LaxarJS looks for a theme override in `<theme-path>/controls/C/css/C.css`.
Here, the `<theme-path>` refers to the folder containing your global theme, and the `<control-amd-path>` is the same path that widgets specify in their `widget.json` descriptor to include a control.
Have a look at the [manual on controls](./providing_controls.md) for details.


### Looking up CSS and HTML for a Layout

Themes are intended to be reusable across applications.
Because layouts are highly specific to an application, usually their CSS and HTML assets live _within the layout's folder_ of the application, with styling for all relevant themes.
However, like with widgets it is possible to style application layouts externally using the sub-folder `layouts` of the theme in use.
For lookup, the same process as for widgets is used:
First, LaxarJS searches the theme itself, then the theme folder within the layout, before finally falling back to the default theme.
