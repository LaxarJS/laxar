# LaxarJS Configuration in an Application

[« return to the manuals](index.md)

LaxarJS has a built-in configuration API which is available to libraries and widgets as `laxar.configuration`.
In contrast to the bower- and RequireJS-configuration, this configuration is designed to be used at application run time.

Preliminary readings:

* [Widgets and Activities](widgets_and_activities.md)


## What is LaxarJS Configuration Used for?

When writing widgets, it is generally recommended to avoid global configuration options in favor of widget feature configuration, placed in the page definitions.
Sometimes however, a single setting must be respected across a large number of widgets:
For example, all widgets should use the same validation trigger (on change vs. on focus-out) to guarantee a consistent user experience.

In other cases, LaxarJS itself needs to be configured, for example to determine the theme, file listing URIs, available locales and so on.
The _LaxarJS Core_ configuration options are listed below.


## Configuration Structure

Configuration keys are simple JSON paths, reflecting a hierarchical configuration structure.
The configuration API looks for the configuration values within the `laxar` property of the global object (`window`).

Libraries, widgets and activities may define their own configuration keys, but must always use the `lib.` prefix, followed by a suitable module identifier (e.g. the name of the library vendor) to avoid name collisions.
For example, _LaxarJS UiKit_ controls use the prefix `lib.laxar-uikit.controls` for their configuration options.
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
define( [ 'laxar', 'my_module' ], function( ax, myModule ) {
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
For options available in _LaxarJS UiKit_, have a look at the [respective documentation](https://github.com/LaxarJS/laxar-uikit/blob/master/docs/manuals/configuration.md).

| Key                                  | Default               | Description
| :----------------------------------- | :-------------------- | :------------------------------------------------------------------
| `name`                               | `'unnamed'`           | The name of the LaxarJS application
| `description`                        | `''`                  | A short application description
| `theme`                              | `'default'`           | Which theme to use for the application. The suffix `.theme` is added automatically.
| :----------------------------------- | :-------------------- | :------------------------------------------------------------------
| `eventBusTimeoutMs`                  | `120000`              | The maximum delay (in milliseconds) to wait for a `did...` event to be published, after it was announced by a `will...` event.
| `i18n.locales`                       | `{ 'default': 'en' }` | Which language tag to use for the default locale, and possibly for other locales.
| `logging.instanceId`                 | `true`                | If set to a function, that function is used to calculate the value of the INST log tag. If set to `true` (default), the current UNIX timestamp plus a small random offset is used. If set to `false`, no INST log-tag is generated.
| `logging.levels`                     | `{}`                  | Additional log levels with name and severity, for example `{ NOTICE: 350 }`. The predefined severities reach from _100_ for `TRACE` to _600_ for `FATAL`.
| `logging.threshold`                  | `'INFO'`              | The log level which is required for messages to be logged (one of `TRACE`, `DEBUG`, `INFO`, `WARN`, `ERROR` or `FATAL`)
| `router.pagejs`                      | {}                    | Options to override the page.js default options (passed to `pagejs.start`), such as `hashbang` and `popstate`.
| `router.base`                        | null                  | Override the document base `href` for routing.
| `router.query.enabled`               | `false`               | If `true`, query parameters are automatically transformed into additional place parameters and vice versa.
| `storagePrefix`                      | `null`                | Allows to set a prefix for local- and session-storage keys when using `laxar.storage`. If `null` a prefix is generated from the configured `name`.
| `tooling.enabled`                    | `false`               | If `true` some services are exposed on the global object (i.e. `window`) for tooling purposes. These published services are: `configuration`, `globalEventBus`, `heartbeat`, `i18n`, `log`, `pageService`, `storage` and `tooling`
| `useEmbeddedFileListings`            | `true`                | Whole files may be embedded into the file listings by the laxarjs webpack plugin or by `grunt-laxar` to save even more HTTP-requests. When using grunt-laxar during development, these embeddings may be stale and should not be used (use `false`) while when using webpack or workin in production, they are beneficial (use `true`).
| `useMergedCss`                       | `true`                | Similar to `useEmbeddedFileListings`, this option controls an optimization: If `true`, the runtime loads a concatenated CSS style sheet produced by webpack (or, for older projects, `grunt-laxar`) instead of per-artifact style sheets to improve performance. If `false`, CSS-files are requested individually, which is mostly useful during development. The value is automatically `true` if a `link` element with the `data-ax-merged-css` attribute exists on the page.
