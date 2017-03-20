# Upgrading LaxarJS

The LaxarJS packages use [semantic versioning](http://semver.org), so as long as you upgrade within a major version of LaxarJS or one of the associated libraries and widgets, you should not have any problems.

Of course, sometimes minor changes introduce bugs or new, (hopefully) better way to do things within applications.
To get an impression of what happens between versions, consult the *changelogs*.
A `CHANGELOG.md` file is maintained in each of our repositories.
Whenever a change comes with associated upgrade information, the changelog will mention this, and contain a pointer to the relevant GitHub issue.


## Migration Guide: LaxarJS v1.x to LaxarJS v2.x

Under the hood, LaxarJS v2 is a _major refactoring_ of LaxarJS.
In the process of this refactoring, _AngularJS was removed_ as a core dependency, and stateful APIs such as logging were changed to become _injectable services._
This improves testability, and allows technology adapters to freely intercept and modify widget injections.
It also enables multiple LaxarJS applications to run alongside each other within a single browser window.

Fortunately, for existing widgets, not that much has changed:
AngularJS widgets now require an adapter (see below), and some APIs that were previously accessed as properties of the LaxarJS object will now need to be injected into the widget controller.


### Tooling is now based around NPM and Webpack

This should not affect widgets and activities directly, but will require to rebuild some project infrastructure and configuration.

LaxarJS v1 project used _Bower_ to obtain frontend application artifacts, _RequireJS_ to load modules, and _Grunt_ in combination with _NPM_ to obtain and run the project build pipeline.

For LaxarJS v2, we wanted to support pre-built artifacts whose sources may be written in ES2015 or other "compile-to-js" languages, as well as artifacts that add dependencies to the development toolchain, such as additional webpack loaders.
Bower is not really a good fit for pre-built artifacts, as it is always backed by the sources on GitHub.
Rather than adding more "build" repositories, we chose switch to NPM for frontend artifacts, which was already required for the tooling infrastructure anyway.
In order to integrate seamlessly with workflows using ES2015 and SCSS, we switched from a collection of custom grunt tasks to a build-infrastructurebased around _Webpack_.
This saves us a lot of work, and makes custom build setups much simpler, e.g. for use with the

More Information:

   - [Manual: Infrastructure and Tools](./infrastructure_and_tools.md)
   - [webpack website](https://webpack.js.org/)
   - [NPM: laxar-loader](https://www.npmjs.com/package/laxar-loader)
   - [NPM: laxar-tooling](https://www.npmjs.com/package/laxar-tooling)


### JSON Schema now Processed _at build-time_

LaxarJS feature configuration for widgets, activities and compositions is no longer processed at runtime, but while loading the application artifacts using the `laxar-loader` for Webpack.
This allows us to replace the [jjv](https://www.npmjs.com/package/jjv) validator with the [ajv](https://www.npmjs.com/package/ajv) validator which is more actively maintained, more feature-rich and apparently more performant.
Simultaneously we save on bundle size and startup time, as neither the validator nor any widget schema instances need to be loaded or interpreted within the browser.

Note that LaxarJS deviates from standard JSON schema in two respects.
This was the case with jjv, and we ported the deviations to ajv:

   - `"additionalProperties": false` is default for all schemas of `"type": "object"`
   - `"format"` allows for the LaxarJS specific value `"topic"`, and checks it
   - defaults for features (first level of widget/composition schema) are inferred if they are of type `"array"` or `"object"`

More Information:

   - [Manual: Widgets and Activities](./widgets_and_activities.md)
   - [ajv website](https://www.npmjs.com/package/ajv)


### AngularJS moved from LaxarJS Core to Standalone Adapter Project

The LaxarJS runtime no longer depends on functionality provided by AngularJS.
Writing widgets using AngularJS works just like before, you just need to:

   - add the [laxar-angular-adapter]() to your project:
    `npm install --save laxar-angular-adapter`,

   - pass it to `bootstrap` using the `widgetAdapters` option.

More Information:

   - [API: `laxar.bootstrap`](../api/laxar.md#laxar.bootstrap)


### Application Configuration: `window.laxar` is No More

LaxarJS is no longer using a global object property for configuration.
This improves testability and allows to run multiple LaxarJS instances side-by-side.
Pass your configuration values to `bootstrap` instead, using the `configuration` option.

More Information:

   - [API: `laxar.bootstrap`](../api/laxar.md#laxar.bootstrap)


### Styles/Templates for Widgets/Controls lookup _by name only_

Previously, LaxarJS used several heuristics to derive a widget or control name from a file system path segment.
The name is important to find the JavaScript implementation module, HTML template (widgets only) and CSS stylesheet.
Now, widgets and controls must always provide a descriptor (widget.json, control.json) with a `name` property.
This makes artifacts robust against being moved, and for being used in different contexts.
It also eliminates confusion regarding the name of directories and files when styling artifacts from within a theme.


### axLayout control removed

Because layouts are now first-class items in widget areas, directly embedding them in widgets unnecessarily complicates the implementation of both widgets and runtime.
Widgets should simply offer _widget areas,_ which can then be configured by the page to contain layouts.


### Several LaxarJS APIs moved to Injectable Services

Previously, LaxarJS offered several stateful APIs as part of its exported API.
These were replaced by injectable widget services as follows:

   - `laxar.configuration` -> `axConfiguration`
   - `laxar.log` -> `axLog`
   - `laxar.i18n` -> `axI18n`
   - `laxar.storage` -> `axStorage`

This change improves testability and allows to run multiple instances of LaxarJS on the same page.
During your transition to LaxarJS v2, you can use the `dist/laxar-compatibility.js` entry point, which adds shims for the missing APIs.
Note that the compatibility entry point is intended only for use during a migration and not part of the official API.
This means that it _may be removed_ in upcoming minor versions.

The stateless utility APIs [`assert`](../api/utilities.assert.md), [`object`](../api/utilities.object.md) and [`string`](../api/utilities.string.md) are not affected by this change.

More Information:

   - [API: Widget Services](../api/runtime.widget_services.md)
   - [API: Widget Service Mocks](../api/laxar-widget-service-mocks.md) for testing


### Flow Definition: Format Changed

The flow definition files have a new format that clearly distinguishes between place IDs and URL mappings.
This also allows to map multiple URL patterns to the same place, and to specify place parameter values for redirects.

Also, the syntax for routing pattern definition has changed slightly, as LaxarJS now uses [Navigo](https://www.npmjs.com/package/navigo) for routing.

More Information:

   - [Manual: Flow and Places](flow_and_places.md)
   - [GitHub: LaxarJS#432](https://github.com/LaxarJS/laxar/issues/432#issuecomment-286998002)
   - [GitHub: LaxarJS#381](https://github.com/LaxarJS/laxar/issues/381#issuecomment-262914879)


### Flow Definition: Removed entryPoint / exitPoint features

These features were hard-to-explain in manuals as they cater to a very narrow set of integration use cases.
Entry points can be replaced by using _entry pages_ containing an activity that fires navigation events.
Exit points can be replaced by simply adding an activity that invokes the external API previously triggered by the exit point.

More Information:

   - [Manual: Flow and Places](flow_and_places.md)
   - [GitHub: LaxarJS#392](https://github.com/LaxarJS/laxar/issues/392#issuecomment-259353773)


### Flow: Default Router Changed from Angular $route to Navigo

Because AngularJS was removed from LaxarJS core, we no longer use AngularJS `$route` for routing.
Rather than creating our own standalone routing library, LaxarJS now depends on the _Navigo_ routing microlibrary.
We also evaluated _page.js_ by visionmedia, but due to the recent lack of project activity we think that Navigo is the right choice for now.
In the near-future, we plan on making routers pluggable.
This will be especially useful if your UI framework comes with a router anyway.

More Information:

   - [Manual: Flow and Places](flow_and_places.md)
   - [https://www.npmjs.com/package/navigo](https://webpack.js.org/)


### axFlowService: constructPath, constructAnchor removed

The methods `constructPath` and `constructAnchor` were removed because they are not portable across routing setups using hash-based and path-based navigation.
You should always use `constructAbsoluteUrl` to create links within a LaxarJS application.

More Information:

   - [Manual: Infrastructure and Tools](./infrastructure_and_tools.md)
   - [Manual: Assets and the Artifacts Bundle](./assets.md)
   - [webpack website](https://webpack.js.org/)


### axFlowService: No More Trailing `'_'`

When _generating_ URLs where values of trailing parameters are missing, this no longer results in trailing underscores.
Make sure to structure your routing patterns to handle these URLs, or avoid them by always populating the respective place parameters.

More Information:

   - [GitHub LaxarJS#389](https://github.com/LaxarJS/laxar/issues/389#issuecomment-259157734)


### Widget Descriptor: new `styleSource` and `templateSource`

Previously, SCSS had to be integrated by using the [grunt-laxar-compass](https://www.npmjs.com/package/grunt-laxar-compass) package, which required generated CSS to be committed to version control.
Now, SCSS can be processed by setting the `styleSource` attribute of the widget.json descriptor.
This allows for arbitrary compile-to-css languages (such as LESS).

Also, the grunt plugin was notoriously unreliable in watching transitive SCSS import dependencies, which is no longer the case when using webpack with the [sass-loader](https://www.npmjs.com/package/sass-loader).
The Yeoman Generator generates appropriate configuration out-of-the-box.

Additionally, `templateSource` can be used to preprocess widget HTML templates.
This allows to use HTML generator syntax such as [pug](https://www.npmjs.com/package/pug).

More Information:

   - [Manual: Flow and Places](flow_and_places.md)


### axVisibility: new widget service injection

Dealing with visibility events in LaxarJS v1 was too much voodoo.
The new `axVisibility` widget injection hopefully simplifies things.
To deal with visibility, the new injection is recommended over LaxarJS Patterns `visibility` and over using the event bus directly.

More Information:

   - [Manual: Visibility Events](visibility_events.md)
   - [API: `axVisibility`](../api/runtime.widget_services_visibility.md)
   - [API: `axVisibilityMock`](../api/testing.widget_services_visibility.md) for testing
   - [GitHub: LaxarJS#333](https://github.com/LaxarJS/laxar/issues/333#issuecomment-236914414)


### axI18n: new widget service injection

Dealing with internationalization has been further simplified and detangled from AngularJS by the new `axI18n` injection.
Also, the new injection is instantiated per bootstrapping instance, so that multiple LaxarJS applications can coexist in a browser window, and even use different locales.
To deal with i18n, the new injection is recommended over LaxarJS Patterns `i18n` and over using the event bus directly.

More Information:

   - [Manual: I18n](i18n.md)
   - [API: `axI18n`](../api/runtime.widget_services_i18n.md)
   - [API: `axVisibilityMock`](../api/testing.widget_services_i18n.md) for testing
   - [GitHub: LaxarJS#332](https://github.com/LaxarJS/laxar/issues/332#issuecomment-238213488)
   - [GitHub: LaxarJS#333](https://github.com/LaxarJS/laxar/issues/333#issuecomment-236914414)
   - [GitHub: LaxarJS#429](https://github.com/LaxarJS/laxar/issues/429#issuecomment-286042533)


### axAssets: replace require.toURL() using axAssets

LaxarJS no longer depends on RequireJS, and it is not recommended to mix RequireJS with webpack either.
Some widgets use RequireJS for generating absolute URLs, 


### axEventBus: removed methods: `unsubscribe`, `setMediator`, `setErrorHandler`

TODO: details


### Widget adapter API changed

TODO: details


### Browser Support

Support for MS Internet Explorer 9 was dropped.
LaxarJS v2 relies on dynamic property getters, which are not available for MSIE 8 and cannot be polyfilled.
In principle, MSIE 9 may still be working, but we are not actively supporting it.

Other than that, since LaxarJS no longer directly depends on AngularJS, it may actually be possible to support more browsers than in past major versions.


## Migration Guide: LaxarJS v0.x to LaxarJS v1.x

According to semantic versioning, minor versions starting with v0.x may introduce breaking changes.
We tried to avoid that as much as possible during our own v0.x releases, but depending on where you start off, only some of these items will be relevant for you.
Since LaxarJS v0.x was not used that much, this information is kept short:

   - Support for MS Internet Explorer 8 was dropped.

   - The format of `didUpdate` events was changed from "update maps" to the standard [JSON patch](http://jsonpatch.com/) format.
   When upgrading any complex application, this is probably the most work-intensive change.

   - The JSON schema format for widgets was changed from v3 to v4, with a compatibility fallback.

   - The `laxar.text` helper was removed.

   - Location and naming of HTML templates and CSS stylesheets was unified across artifacts.

   - Some of the name-mangling magic was removed when translating artifact names to file names or AngularJS module names.

   - The testing library built into LaxarJS core was deprecated in favor of [LaxarJS Mocks].

   - _Controls_ became a themeable artifact type, with the control.json as a descriptor.

   - AngularJS was upgraded from 1.2.x to (at least) 1.3.x.

For all the details, consult the changelog.
