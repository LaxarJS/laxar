# Changelog

## Last Changes
- [#51](https://github.com/LaxarJS/laxar/issues/51): Remove some obsolete NPM `devDependencies`.
- [#46](https://github.com/LaxarJS/laxar/issues/46): fixed misinterpretation of falsy required attribute in json schema converter.

## v0.11.1
- [#40](https://github.com/LaxarJS/laxar/issues/40): portal: fixed 'flag-topic' pattern.

## v0.11.0
- [#39](https://github.com/LaxarJS/laxar/issues/39): portal: added JSON-schema formats 'topic', 'sub-topic' and 'flag-topic' to widget loader.
  NEW FEATURE: see ticket for details
- [#37](https://github.com/LaxarJS/laxar/issues/37): improved browsing of existing api doc and fixed some syntactical errors.
- [#36](https://github.com/LaxarJS/laxar/issues/36): jshintrc: disabled enforcement of dot notation for object property access.
- [#34](https://github.com/LaxarJS/laxar/issues/34): Enabled specification of widget features using JSON schema draft v4 notation.
  NEW FEATURE: see ticket for details
- [#33](https://github.com/LaxarJS/laxar/issues/33): EventBus: added event object to the information sent to inspectors on deliver actions.
- [#31](https://github.com/LaxarJS/laxar/issues/31): Refactored JSON validator for better error messages and schema v4 support.
  NEW FEATURE: see ticket for details
- [#32](https://github.com/LaxarJS/laxar/issues/32): Configuration: Consolidated and documented configuration options under docs/manuals/configuration.md
  NEW FEATURE: see ticket for details
- [#30](https://github.com/LaxarJS/laxar/issues/30): PageLoader: added missing check for duplicate composition ids.

## v0.10.0
- [#27](https://github.com/LaxarJS/laxar/issues/27): Portal: Enhanced the portal event bus performance by not requiring a digest/render-cycle on each tick
- [#28](https://github.com/LaxarJS/laxar/issues/28): Fixed null values in widget features within compositions being turned into empty objects.
- [#29](https://github.com/LaxarJS/laxar/issues/29): PageLoader: composition features that are not configured do not result in undefined values for widget features.
- [#25](https://github.com/LaxarJS/laxar/issues/25): Only the page relevant for the current place is loaded now.
- [#17](https://github.com/LaxarJS/laxar/issues/17): Testing: The testBed.setup method can now simulate default-events
  NEW FEATURE: see ticket for details
- [#26](https://github.com/LaxarJS/laxar/issues/26): Testing: Fixed the responseTransform option for http-mock
- [#22](https://github.com/LaxarJS/laxar/issues/22): FileResourceProvider: allow to embed files into listings
  NEW FEATURE: see ticket for details
- [#15](https://github.com/LaxarJS/laxar/issues/15): FileResourceProvider, PageLoader: Prevented duplicate (simultaneous) requests to file listings
- [#24](https://github.com/LaxarJS/laxar/issues/24): Widgets and compositions can now be disabled in pages.
  NEW FEATURE: see ticket for details
- [#23](https://github.com/LaxarJS/laxar/issues/23): FileResourceProvider: Slashes are now correctly handled when checking a file for existence in a listing.
- [#21](https://github.com/LaxarJS/laxar/issues/21): The file resource provider now normalizes its root path.
- [#20](https://github.com/LaxarJS/laxar/issues/20): Fixed event bus inspectors not being notified on unsubscription.
- [#14](https://github.com/LaxarJS/laxar/issues/14): Fixed navigation being broken after successive navigation to the current location.
- [#13](https://github.com/LaxarJS/laxar/issues/13): The current place is now send as part of the didNavigate event.
- [#12](https://github.com/LaxarJS/laxar/issues/12): Testing: Get the LaxarJS tests running in Karma again.
- [#11](https://github.com/LaxarJS/laxar/issues/11): Testing: Handle `spec_runner.js` that are not in a subdirectory of the RequireJS' `baseUrl`.
- [#10](https://github.com/LaxarJS/laxar/issues/10): Testing: Loading controls during tests now works in Karma.
- [#9](https://github.com/LaxarJS/laxar/issues/9): Update Bower from ~1.2.8 to ~1.3.3.
- [#8](https://github.com/LaxarJS/laxar/issues/8): Fixed the cleanup mechanism for generated widget areas.
- [#6](https://github.com/LaxarJS/laxar/issues/6): The Portal now initializes an i18n object on the application's `$rootScope`
- [#5](https://github.com/LaxarJS/laxar/issues/5): Testing: The run_spec-script (used to set up the spec tests) now loads controls declared in the widget.json
- [#4](https://github.com/LaxarJS/laxar/issues/4): PageLoader: Added missing optional negation of generated topics and replacement of expressions in feature keys
- [#3](https://github.com/LaxarJS/laxar/issues/3): Added url formatting for links in Readme.md
- [#2](https://github.com/LaxarJS/laxar/issues/2): Fixed grunt-init step in Getting-Started docs
- [#1](https://github.com/LaxarJS/laxar/issues/1): Added initial Getting-Started documentation
