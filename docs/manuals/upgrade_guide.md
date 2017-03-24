# Upgrading LaxarJS

The LaxarJS packages use [semantic versioning](http://semver.org), so as long as you upgrade _within_ a major version of LaxarJS or one of the associated libraries and widgets, you should not have any problems.

Of course, sometimes minor changes introduce bugs or new, (hopefully) better way to do things within applications.
To get the full details of what happens between versions, consult the *changelogs*.
A `CHANGELOG.md` file is maintained in each of our repositories, and accessible from the [documentation site](https://laxarjs.org/docs/).
Whenever a change comes with associated upgrade information, the changelog will mention this, and contain a pointer to the relevant GitHub issue.
Note however, that sometimes individual changelog entries may be reverted or made obsolete by later changes.

Keeping in mind that only the changelogs contain the complete upgrade information with all the gritty details, this guide tries to give you the big picture of what happened between major versions.
It also tries to give a short rationale for each change, so that you know why we think the upgrade effort is justified.


## Migration Guide: LaxarJS v1.x to LaxarJS v2.x

Under the hood, LaxarJS v2 is a _major refactoring_ of LaxarJS.
In the process of this refactoring, _AngularJS was removed_ as a core dependency, and stateful APIs such as logging were changed to become _injectable services._
This improves testability, and allows technology adapters to freely intercept and modify widget injections.
It also enables multiple LaxarJS applications to run alongside each other within a single browser window.

Fortunately, for existing widgets, not that much has changed:
AngularJS widgets now require an adapter (see below), and some APIs that were previously accessed as properties of the LaxarJS object will now need to be injected into the widget controller.

Cleaning up widget spec tests may require a little more work, since [LaxarJS Mocks](https://laxarjs.org/docs/laxar-mocks-v2-latest/) was cleaned up significantly.


### Major Versions in Lockstep

The following libraries have their _major version locked_ to that of [LaxarJS Core](https://www.npmjs.com/package/laxar) itself:

   - [NPM: laxar-mocks](https://www.npmjs.com/package/laxar-mocks)
   - [NPM: laxar-patterns](https://www.npmjs.com/package/laxar-patterns)
   - [NPM: laxar-tooling](https://www.npmjs.com/package/laxar-tooling)
   - [NPM: laxar-loader](https://www.npmjs.com/package/laxar-loader)
   - [NPM: laxar-infrastructure](https://www.npmjs.com/package/laxar-infrastructure)
   - [NPM: laxar-react-adapter](https://www.npmjs.com/package/laxar-react-adapter)
   - [NPM: laxar-vue-adapter](https://www.npmjs.com/package/laxar-vue-adapter)
   - [NPM: laxar-angular-adapter](https://www.npmjs.com/package/laxar-angular-adapter)
   - [NPM: laxar-angular2-adapter](https://www.npmjs.com/package/laxar-angular2-adapter)
   - [NPM: laxar-uikit](https://www.npmjs.com/package/laxar-uikit)

This means, that for these libraries…

   - their v2.0 is released (roughly) around the same time as LaxarJS Core v2.0,
   - their v2.0 is compatible with LaxarJS Core v2.0.

For other packages, especially widgets and controls, this is not true.
When in doubt, always consult the _package.json_ of the respective artifact.


### Tooling: NPM and webpack

This should not affect widgets and activities too much directly, but will require to rebuild some project infrastructure and configuration.

LaxarJS v1 projects used:

   - _Bower_ to obtain front end application artifacts,
   - _RequireJS_ to load modules,
   - _NPM, Grunt, grunt-laxar_ and various grunt plugins to obtain and run the project build pipeline.

For LaxarJS v2, we wanted to support pre-built artifacts whose sources may be written in ES2015 or other "compile-to-js" languages, as well as artifacts that add dependencies to the development toolchain.

Bower is not really a good fit for pre-built artifacts, as it is always _backed by sources_ on GitHub.
Rather than adding more "build repositories", we chose to switch to NPM for front end artifacts, which was already required for the tooling infrastructure anyway.
In order to integrate seamlessly with workflows using [ES2015](https://babeljs.io/learn-es2015/) and [SCSS](http://sass-lang.com/libsass), we switched from a collection of custom grunt tasks to a build infrastructure based around _webpack_.

So, the new list of tools looks like this:

   - _NPM_ to obtain front end artifacts as well as build-time dependencies
   - _webpack_ and its loaders (especially the `laxar-loader`) to load and bundle artifacts

This saves us a lot of work maintaining grunt plugins: laxar-tooling and laxar-loader are much smaller than grunt-laxar.
It also makes custom build setups much simpler, as it unlocks the full array of [webpack plugins](https://github.com/webpack/docs/wiki/list-of-plugins) for loading widgets, controls and their assets.
Where needed, it is of course still possible

More Information:

   - [Manual: Infrastructure and Tools](./infrastructure_and_tools.md)
   - [Manual: Installing Widgets](./installing_widgets.md)
   - [webpack website](https://webpack.js.org/)
   - [NPM: laxar-loader](https://www.npmjs.com/package/laxar-loader)
   - [NPM: laxar-tooling](https://www.npmjs.com/package/laxar-tooling)


### JSON Schema now Processed _at build-time_

LaxarJS feature configuration for widgets, activities and compositions is no longer processed at runtime, but while loading the application artifacts using the `laxar-loader` for webpack.
This allows us to replace the [jjv](https://www.npmjs.com/package/jjv) validator with the [ajv](https://www.npmjs.com/package/ajv) validator which is more actively maintained, more feature-rich and apparently more performant.
Simultaneously we save on bundle size and startup time, as neither the validator nor any widget schema instances need to be loaded or interpreted within the browser.

Note that LaxarJS deviates from standard JSON schema in two respects.
This was the case with jjv, and we ported the deviations to ajv:

   - `"additionalProperties": false` is default for all schemas of `"type": "object"`,
   - `"format"` allows for the LaxarJS specific value `"topic"`, and checks it,
   - defaults for features (first level of widget/composition schema) are inferred if they are of type `"array"` or `"object"`,
   - support for `${topic:…}` and `${features.…}` syntax in compositions, before applying format checks.

More Information:

   - [Manual: Widgets and Activities](./widgets_and_activities.md)
   - [ajv website](https://www.npmjs.com/package/ajv)


### AngularJS Support Moved to Standalone Adapter Project

The LaxarJS runtime no longer depends on functionality provided by AngularJS.
Writing widgets using AngularJS works just like before, you just need to:

   - add the [laxar-angular-adapter](https://laxarjs.org/docs/laxar-angular-adapter-v2-latest/) to your project:
    `npm install --save laxar-angular-adapter`,

   - pass it to `create` using the `adapters` option.

More Information:

   - [API: `laxar.create`](../api/laxar.md#laxar.create)


### AngularJS: axLayout Control Removed

Because layouts are now first-class items in widget areas, directly embedding them in widgets unnecessarily complicates the implementation of both widgets and runtime.
Widgets should simply offer _widget areas,_ which can then be configured by the page to contain layouts.

  - [GitHub: LaxarJS/laxar#272](https://github.com/LaxarJS/laxar/issues/272#issuecomment-191699871)


### Application Configuration: `window.laxar` is No More

LaxarJS is no longer using a global object property for configuration.
This improves testability and allows to run multiple LaxarJS instances side-by-side.
Pass your configuration values to `create` instead, using the last parameter (`configuration`).

More Information:

   - [API: `laxar.create`](../api/laxar.md#laxar.create)


### Artifact Directory Defaults Changed

With the new tooling infrastructure, _all artifact types_ (themes, flows, pages, layouts, widgets, controls) will be expected to reside within the respective sub-folders of `application/` within your project.
Previously, widgets, controls and themes were expected to reside in sub-folders of `includes/`.
This behavior can be customized by creating a `laxar.config.js` in your project and exporting the corresponding `paths.flows`, `paths.pages` and so on from there.

More Information:

   - [laxar-loader Manual](https://laxarjs.org/docs/laxar-loader-v2-latest/manuals/)


### Styles/Templates for Widgets/Controls Lookup _by Name Only_

Previously, LaxarJS used several heuristics to derive the name of activities, widgets or controls from their file system path segment.
The name is needed to find the JavaScript implementation module, HTML template (widgets only) and CSS stylesheet of an artifact.

Now, widgets and controls must always provide a descriptor (`widget.json`, `control.json`) with a `name` property.
That name is then used to load the implementation module from the directory of the descriptor, as well as themed assets from the appropriate sub-directories.
Here, the `resolve` configuration of webpack comes into play, which allows projects using Angular 2 or Vue.js to transparently load implementations from `.ts` or `.vue` files.

Using explicit names instead of incidental file system locations makes artifacts robust against being moved, and for being used in different contexts.
It also eliminates confusion regarding the name of directories and files when styling artifacts from within a theme.

An exception is made for loading the implementation module of widgets that have a `package.json`:
To allow these widgets to be pre-compiled from "compile-to-js" languages, they may use the `"browser"` field of their `package.json` to specify the location of their implementation module.

More Information:

   - [Assets and the Artifacts Bundle](asset_lookup.md)


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
   - [GitHub: LaxarJS/laxar#432](https://github.com/LaxarJS/laxar/issues/432#issuecomment-286998002)
   - [GitHub: LaxarJS/laxar#381](https://github.com/LaxarJS/laxar/issues/381#issuecomment-262914879)


### Flow Definition: Removed entryPoint / exitPoint features

These features were hard-to-explain in manuals as they cater to a very narrow set of integration use cases.
Entry points can be replaced by using _entry pages_ containing an activity that fires navigation events.
Exit points can be replaced by simply adding an activity that invokes the external API previously triggered by the exit point.

More Information:

   - [Manual: Flow and Places](flow_and_places.md)
   - [GitHub: LaxarJS/laxar#392](https://github.com/LaxarJS/laxar/issues/392#issuecomment-259353773)


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

   - [GitHub LaxarJS/laxar#389](https://github.com/LaxarJS/laxar/issues/389#issuecomment-259157734)


### Widget Descriptor: new `styleSource` and `templateSource`

Previously, SCSS had to be integrated by using the [grunt-laxar-compass](https://www.npmjs.com/package/grunt-laxar-compass) package, which required generated CSS to be committed to version control.
Now, SCSS can be processed by setting the `styleSource` attribute of the widget.json descriptor.
This allows for arbitrary compile-to-css languages (such as LESS).

Also, the grunt plugin was notoriously unreliable in watching transitive SCSS import dependencies, which is no longer the case when using webpack with the [sass-loader](https://www.npmjs.com/package/sass-loader).
The Yeoman Generator generates appropriate webpack dependencies and configuration out-of-the-box.

Additionally, `templateSource` can be used to preprocess widget HTML templates.
This allows to use HTML generators such as [pug](https://www.npmjs.com/package/pug) to preprocess widget templates.

More Information:

   - [Manual: Flow and Places](flow_and_places.md)
   - [webpack website](https://webpack.js.org/)


### axVisibility: new widget service injection

Dealing with visibility events in LaxarJS v1 was too much voodoo.
The new `axVisibility` widget injection hopefully simplifies things.
To deal with visibility, the new injection is recommended over LaxarJS Patterns `visibility` and over using the event bus directly.

More Information:

   - [Manual: Visibility Events](visibility_events.md)
   - [API: `axVisibility` widget service](../api/runtime.widget_services_visibility.md)
   - [API: `axVisibility` mock](../api/testing.widget_services_visibility.md) for testing
   - [GitHub: LaxarJS/laxar#333](https://github.com/LaxarJS/laxar/issues/333#issuecomment-236914414)


### axI18n: new widget service injection

Dealing with internationalization has been further simplified and detangled from AngularJS by the new `axI18n` injection.
Also, the new injection is instantiated per bootstrapping instance, so that multiple LaxarJS applications can coexist in a browser window, and even use different locales.
To deal with i18n, the new injection is recommended over LaxarJS Patterns `i18n` and over using the event bus directly.

More Information:

   - [Manual: I18n](i18n.md)
   - [API: `axI18n` widget service](../api/runtime.widget_services_i18n.md)
   - [API: `axI18n` mock](../api/testing.widget_services_i18n.md) for testing
   - [GitHub: LaxarJS/laxar#332](https://github.com/LaxarJS/laxar/issues/332#issuecomment-238213488)
   - [GitHub: LaxarJS/laxar#333](https://github.com/LaxarJS/laxar/issues/333#issuecomment-236914414)
   - [GitHub: LaxarJS/laxar#429](https://github.com/LaxarJS/laxar/issues/429#issuecomment-286042533)


### Replace `require.toUrl()` using `axAssets`

LaxarJS no longer depends on RequireJS, and it is not recommended to mix RequireJS with webpack either.
Some widgets may use the `toUrl`-method provided by RequireJS for generating absolute URLs.
As this method constructs URLs at runtime, it is not supported by webpack.

You may wish to use webpack to pre-bundle smaller assets within a reusable widget that has its own `package.json` and build-setup.
In general, it is recommended to use the `axAssets` injection instead.

More Information:

   - [Manual: Assets and the Artifacts Bundle](assets.md)
   - [Manual: Infrastructure and Tools](infrastructure_and_tools.md)
   - [API: `axAssets` widget service](../api/runtime.widget_services.md#axAssets)
   - [API: `axAssets` Mock](../api/widget_services_assets_mock.md)
   - [webpack website](https://webpack.js.org/)


### axEventBus: removed methods: `unsubscribe`, `setMediator`, `setErrorHandler`

The LaxarJS event bus no longer allows to register a mediator, as this feature was never used.
Configuring a custom error handler was removed from the public API as well, with its use case (testing) supported by a pre-configured event bus mock.

Using `unsubscribe` was usually not required except when using the `axGlobalEventBus` injection.
To cancel an event bus subscription, you must now use the callback returned by `axEventBus.subscribe`.
This avoids possible problems with trying to using the old `unsubscribe` on decorated subscriber functions.

More Information:

   - [Manual: Assets and the Artifacts Bundle](assets.md)
   - [Manual: Infrastructure and Tools](infrastructure_and_tools.md)
   - [API: `axAssets` widget service](../api/runtime.widget_services.md#axAssets)
   - [API: `axAssets` Mock](../api/widget_services_assets_mock.md)


### Widget adapter API changed

The widget adapter API was rewritten to make adapters more powerful.
The two most important changes:

   - creating an adapter for a widget instance may now be asynchronous
   - widget adapters may now freely intercept and modify widget service injections

More Information:

   - [Manual: Creating Widget Adapters](adapters.md)
   - [API: the "plain" Widget Adapter](../api/runtime.plain_adapter.md)
   - [GitHub: LaxarJS/laxar#413](https://github.com/LaxarJS/laxar/issues/413#issuecomment-275091834)
   - [GitHub: LaxarJS/laxar#398](https://github.com/LaxarJS/laxar/issues/398#issuecomment-271912600)
   - [GitHub: LaxarJS/laxar#397](https://github.com/LaxarJS/laxar/issues/397#issuecomment-271912551)
   - [GitHub: LaxarJS/laxar#396](https://github.com/LaxarJS/laxar/issues/396#issuecomment-287765561)
   - [GitHub: LaxarJS/laxar#390](https://github.com/LaxarJS/laxar/issues/390#issuecomment-259363193)
   - [GitHub: LaxarJS/laxar#358](https://github.com/LaxarJS/laxar/issues/358#issuecomment-240727903)
   - [GitHub: LaxarJS/laxar#337](https://github.com/LaxarJS/laxar/issues/337#issuecomment-235178407)
   - [GitHub: LaxarJS/laxar#281](https://github.com/LaxarJS/laxar/issues/281#issuecomment-224545226)


### LaxarJS Mocks: Static HTML Test Runner is No More

Because widget dependencies are no longer loaded at runtime by RequireJS, the recommended setup for testing widgets using LaxarJS Mocks has changed significantly:

   - no more copy/paste of HTML spec runner files
   - use the laxar-mocks/spec-loader for webpack to precompile widget dependencies
   - no more need to declare "missing" CSS assets of controls
   - run tests on the command-line using karma and karma-webpack
   - run tests within the browser using the webpack-jasmine-html-runner-plugin

More Information:

   - [LaxarJS Mocks Manual](https://laxarjs.org/docs/laxar-mocks-v2-latest/manuals/)
   - [LaxarJS Mocks Manual: Setup](https://laxarjs.org/docs/laxar-mocks-v2-latest/manuals/setup)
   - [LaxarJS Mocks API](https://laxarjs.org/docs/laxar-mocks-v2-latest/api/laxar-mocks/)


### LaxarJS Mocks: Use `axMocks.widget.setupForWidget`

To clarify that test fixtures are now provided automatically and in advance (e.g. by the LaxarJS Mocks spec-loader for webpack), the testbed should now be created using `setupForWidget`.

   - [LaxarJS Mocks API: setupForWidget](https://laxarjs.org/docs/laxar-mocks-v2-latest/api/laxar-mocks/#setupForWidget)


### LaxarJS Mocks: `axMocks.widget.teardown` is now Asynchronous

To clean up correctly after tests, LaxarJS mocks publishes the `endLifecycleRequest` event after each tests and allows the widget under test to perform cleanup before proceeding.

   - [LaxarJS Mocks API: tearDown](https://laxarjs.org/docs/laxar-mocks-v2-latest/api/laxar-mocks/#tearDown)


### LaxarJS Patterns: `patches` API removed

The deprecated `patches` API was removed.
Use JSON patch instead.

   - [GitHub: LaxarJS/laxar-patterns#84](https://github.com/LaxarJS/laxar-patterns/issues/84#issuecomment-284394008)


### LaxarJS Patterns: `resources` API: removed `updateHandler`, `replaceHandler`

Use `handlerFor( context )` instead (or `$scope` instead of context for AngularJS widgets).

   - [GitHub: LaxarJS/laxar-patterns#85](https://github.com/LaxarJS/laxar-patterns/issues/85#issuecomment-284391396)


### LaxarJS Patterns: `actions` API: use Promise Rejections Correctly

Actions publisher promises are no longer rejected for actions with an ERROR outcome, caused by e.g. validation failure.
Instead, promises will only be rejected when subscribers fail with an exception.

   - [GitHub: LaxarJS/laxar-patterns#54](https://github.com/LaxarJS/laxar-patterns/issues/54#issuecomment-280272865)


### LaxarJS Patterns: Various Breaking Changes

Most likey, only very few widgets are affected by the remaining breaking changes.
Consult the Changelog for details:

   - [LaxarJS Patterns: Changelog](https://laxarjs.org/docs/laxar-patterns-v2-latest/CHANGELOG/)


### LaxarJS UiKit: I18n Controls Removed

The controls contained in LaxarJS UiKit were locked to the `"angular"` integration technology.
The `axLocalize` filter for AngularJS is now included in the `laxar-angular-adapter`.

   - [GitHub: LaxarJS/laxar-angular-adapter#38](https://github.com/LaxarJS/laxar-angular-adapter/issues/38#issuecomment-285694190)


### Browser Support

Support for MS Internet Explorer 9 was dropped.
LaxarJS v2 relies on dynamic property getters, which are not available for MSIE 8 and cannot be polyfilled.
In principle, MSIE 9 may still be working, but we are not actively supporting it.

Other than that, since LaxarJS no longer directly depends on AngularJS, it may actually be possible to support more browsers than in past major versions.

More Information:

 - [GitHub: LaxarJS/laxar#349](https://github.com/LaxarJS/laxar/issues/349#issuecomment-260323895)


## Migration Guide: LaxarJS v0.x to LaxarJS v1.x

According to semantic versioning, minor versions starting with `v0.` may introduce breaking changes.
We tried to avoid that as much as possible during our own `v0.x` releases, but depending on where you start off, only some of these items will be relevant for you.
Since LaxarJS `v0.x` was not used that much, this information is kept short:

   - Support for MS Internet Explorer 8 was dropped.

   - The format of `didUpdate` events was changed from "update maps" to the standard [JSON patch](http://jsonpatch.com/) format.
     When upgrading any complex application, this is probably the most work-intensive change.

   - The JSON schema format for widgets was changed from v3 to v4, with a compatibility fallback.

   - The `laxar.text` helper was removed.

   - Location and naming of HTML templates and CSS stylesheets was unified across artifacts.

   - Some of the name-mangling magic was removed when translating artifact names to file names or AngularJS module names.

   - The testing library built into LaxarJS core was deprecated in favor of [LaxarJS Mocks](https://laxarjs.org/docs/laxar-mocks-v1-latest/).

   - _Controls_ became a themable artifact type, with the `control.json` as a descriptor.

   - AngularJS was upgraded from 1.2.x to (at least) 1.3.x.

For all the details, consult the changelog.
