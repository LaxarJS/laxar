# Documentation

## bootstrap( widgetModules )
Bootstraps AngularJS on the current `window.document` and sets up the LaxarJS portal. All AngularJS
module names of widgets that are passed to this method will be passed to `angular.bootstrap` as initial
dependencies, along with internal laxar modules. This is needed because AngularJS currently doesn't
support lazy loading of modules. The `portal_angular_dependencies` grunt task of LaxarJS will collect
all widgets reachable for the given `flow.json`, define them as dependencies of an amd module, that will
return the names of their respective AngularJS modules. This list of module names can simply be passed
to the `boostrap` method.

### Parameters
- **widgetModules {String[]}**: all AngularJS modules that should instantly be loaded (most probably the widgets)
