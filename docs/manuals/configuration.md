[« return to the manuals](index.md)

Preliminary readings:

* [Widgets and Activities](widgets_and_activities.md)

# LaxarJS Configuration in an Application

LaxarJS has a built-in configuration API which is available to libraries and widgets as `laxar.configuration`.
In contrast to the bower- and RequireJS-configuration, this configuration is designed to be used at application run time.


## What is LaxarJS Configuration Used for?

When writing widgets, it is generally recommended to avoid global configuration options in favor of widget feature configuration.
Sometimes however, a single setting must be respected across a large number of widgets:
For example, all widgets should use the same validation trigger (on change vs. on focus-out) to guarantee a consistent user experience.

In other cases, LaxarJS itself needs to be configured, for example to determine the theme, file listing URIs, available locales and so on.
The _LaxarJS Core_ configuration options are listed below.


## Configuration Structure

Configuration keys are simple JSON paths, reflecting a hierarchical configuration structure.
The configuration API looks for the configuration values within the `laxar` property of the global object (`window`).

Libraries, widgets and activities may define their own configuration keys, but must always use the `lib.` prefix, followed by a suitable module identifier (e.g. the name of the library vendor) to avoid name collisions.
For example, _LaxarJS UiKit_ controls use the prefix `lib.laxar_uikit.controls` for their configuration options.
Keys without the `lib.`-prefix are used by _LaxarJS Core_.


## The Configuration API

The LaxarJS configuration exposes a single method `laxar.configuration.get( key, fallback )`.
The `key`-parameter is the path within the configuration object (`window.laxar`), and the (optional) `fallback` is returned as a default value if the key was not set in the configuration.

For example, a module `my_module` may allow to enable some kind of compatibility behavior for a special _foo_ environment by exposing a boolean configuration `fooCompatibility`.
By default, the option should be disabled as compatibility with foo involves jumping through some hoops.
The module `my_module` would then access the option like this:

```js
define( [ 'laxar' ], function( ax ) {
  function setup() {
     var respectFoo = ax.configuration.get( 'lib.my_module.fooCompatibility', false );
     if( respectFoo ) {
        // ... jump though some hoops ...
        return { hoops: 'JUMPED' };
     }
     return {};
  }
} );
```

And the corresponding configuration block to enable foo-compatibility would then look like this:

```js
window.laxar = {
   // ...
   lib: {
      my_module: {
         fooCompatibility: true
      },
      // ...
   }
};
```


## Testing a Module that Uses Configuration

To test the behavior of a module with test-controlled configuration options, one can simply spy on the method `configuration.get`.
Here is an exemplary jasmine test for a module `my_module`, which tries to test the module behavior with foo-compatibility enabled.

```js
define( [ 'laxar/laxar_testing', 'my_module' ], function( ax, myModule ) {
   describe( 'a my_module with foo compatibility enabled', function() {
      beforeEach( function() {
         var origGet = ax.configuration.get;
         var hoops;
         spyOn( ax.configuration, 'get' ).andCallFake( function( key, fallback ) {
            return key === 'lib.my_module.fooCompatibility' ? true : origGet( key, fallback );
         } );
         hoops = setup();
      } );
      it( 'jumps through some hoops', function() {
           expect( hoops ).toBe( 'JUMPED' );
      } );
   } );
} );
```


## Injecting Configuration into an AngularJS module

Instead of using RequireJS, AngularJS modules such as widgets can have the configuration module injected by requesting the service `'Configuration'`.
In cases where configuration is injected, an `angularMocks.module` provider may be defined during testing instead of the approach described above.


## Available Configuration Keys in _LaxarJS Core_

The following configuration options are available in _LaxarJS Core_.
For options available in _LaxarJS UiKit_, have a look at the [respective documentation](https://github.com/LaxarJS/laxar_uikit/blob/master/docs/manuals/configuration.md).

| Key                                  | Default               | Description
| :----------------------------------- | :-------------------- | :------------------------------------------------------------------
| `name`                               | `''`                  | The name of the LaxarJS application
| `description`                        | `''`                  | A short application description
| `fileListings`                       | `{}`                  | A mapping from application directories to file listings. The listings help to save unnecessary HTTP 404 requests (for example, to determine if a widget has custom styles for the current theme), and are generated by [grunt-laxar](https://github.com/LaxarJS/grunt-laxar).
| `useEmbeddedFileListings`            | `false`               | Whole files may be embedded into the file listings by grunt-laxar to save even more HTTP-requests. During development, these embeddings may be stale and should not be used (use `false`) while in production, they are beneficial (use `true`).
| `eventBusTimeoutMs`                  | `120000`              | The maximum delay (in milliseconds) to wait for a `did...` event to be published, after it was announced by a `will...` event.
| `theme`                              | `'default'`           | Which theme to use for the application. The suffix `.theme` is added automatically.
| `useMergedCss`                       | `false`               | Similar to `useEmbeddedFileListings`, this option controls an optimization: If `true`, the runtime loads a concatenated CSS stylesheet produced by `grunt-laxar` instead of per-artifact stylesheets to improve performance. If `false`, CSS-files are requested individually, which is mostly useful during development. The value is automatically `true` if a `link` element with the `data-ax-merged-css` attribute exists on the page.
| `flow.entryPoint`                    | `null`                | If the browser URL cannot be controlled by the LaxarJS application (for example, when integrating with a legacy system), the target and place-parameters can be set here in the form `{ target: 'my_flow_target', parameters: { myParam: 'xyz' } }`.
| `flow.exitPoints`                    | `{}`                  | Allows to delegate handling of a navigation target to a different (legacy) system by specifying callbacks for individual navigation targets. Has the form `{ exitFnName: function( parameters ) { /* ... */ } }` where `exitFnName` matches the value specified as an `'exitFunction'` within the `flow.json`.
| `i18n.locales`                       | `{ 'default': 'en' }` | Which language tag to use for the default locale, and possibly for other locales.
| `logging.threshold`                  | `'INFO'`              | The log level which is required for messages to be logged (one of `TRACE`, `DEBUG`, `INFO`, `WARN`, `ERROR` or `FATAL`)
| `logging.levels`                     | `{}`                  | Additional log levels with name and severity, for example `{ NOTICE: 350 }`. The predefined severities reach from _100_ for `TRACE` to _600_ for `FATAL`.
| `logging.http.header`                | `null`                | If set, an `$http` interceptor is registered to add the log tags (such as PLCE for the current place and INST for the client instance ID) to outgoing `$http` requests, under the configured header field (e.g. `-x-myapp-tags`).
