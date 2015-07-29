[« return to the manuals](index.md)

Preliminary readings:

* [Widgets and Activities](widgets_and_activities.md)
* [Infrastructure and Tools](infrastructure_and_tools.md)


# Configuring RequireJS for Widgets and Controls


## The Need for Configuration

Widgets and Controls perform very different tasks and are of varying complexity.
In many cases only the event bus is needed as communication interface and all logic is contained within the implementation of an artifact.
However, sooner or later one will come to a point, where third party libraries are useful or even necessary for a widget or control, or where own code should be extracted into a separate library.
When using such external dependencies, it is never a good idea to assume a specific location for it.
Instead, a widget should add a dependency to an according [named module](http://requirejs.org/docs/whyamd.html#namedmodules), where the actual location of a module can then be configured independently by using the [configuration API of RequireJS](http://requirejs.org/docs/api.html).


## The One-File-Fits-All Way

The most common way to configure *RequireJS* is by adding all necessary entries to the `require_config.js` file within the root folder of the application.
Everything configured there will be used when loading widget and control AMD modules.
If, for example, a widget needs a special library to fulfill its task, this library can be configured as a module in there and the widget will have access to it via the normal AMD module definition syntax.

Although this will work and may be sufficient for small projects where custom widgets are tightly coupled to the application, this adds complexity when attempting to share widgets or controls.
In this case every developer who wants to use that artifact in his application, has to know about these requirements and adjust the `require_config.js` of his application accordingly.
As if this isn't worse enough, over time this global configuration will grow and probably become a maintenance hell.


## The Individual Way

To solve this problem, *LaxarJS* supports placing *RequireJS* configuration locally within a widget or control directory.
All configuration that is specific to an artifact and not already satisfied by the configuration of the application can then be placed there.
Since *RequireJS* does not support this out-of-the-box, *LaxarJS* implements the support for distributed configuration itself during the build process.


### How it works

The magic happens inside the [grunt-laxar](https://github.com/LaxarJS/grunt-laxar) grunt tasks:
Running the `laxar-build` task now also triggers running the `laxar-merge-require-config` task.
This task walks through all widget and control directories reachable from a flow, collects all `require_config.js` files and merges them with the application specific `require_config.js` found in the root directory of the application.
The result will be written under the folder for generated flow artifacts (e.g. `var/flows/main/require_config.js` for a flow called *main*).

It is assumed that the configuration is saved as a global `require` variable within the `require_config.js`.

For example:
```js
var require = {
   paths: {
      marked: 'marked/lib/marked'
   },
   packages: [
      {
         name: 'URI',
         location: 'URIjs/src',
         main: 'URI'
      }
   ]
};
```

This will *not* work:
```js
window.require = {
  // this won't work ....
};
// or
require.config( {
   // this won't work, too ...
} );
```

When merging the configuration the `require_config.js` found in the application root is used as starting point.
Whenever in another configuration a `shim`, `deps` or `package` configuration is found, it is added to the resulting configuration.
Already existing entries will not be overwritten.
Hence the application always wins.

`paths` will be merged likewise, with the only difference, that a different path for an already configured module will be added as mapping under the path of the artifact.
If for example the application configures the path for `underscore` as `underscore/dist/underscore` but the widget (which is for example located under `includes/widgets/category/my-widget`) defines `underscore` as `lodash/dist/lodash`, the following mapping will be added:

```js
{
   'map': {
      'includes/widgets/category/my-widget' : {
         'underscore': 'lodash/dist/lodash'
      }
   }
}
```

Everything under `map` in the artifact configuration will prefixed with the path to the artifact before adding it to the resulting configuration.
This ensures it will only be enabled for the correct artifact.
The result looks similar to the example for paths above.

All other available *RequireJS* configuration will simply be added, if not set already.
If e.g. `baseUrl` is defined in the `require_config.js` of the application, a value from a widget's `require_config.js` will be ignored.
