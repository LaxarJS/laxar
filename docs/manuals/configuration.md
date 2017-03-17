# LaxarJS Configuration in an Application

[« return to the manuals](index.md)

LaxarJS has a built-in configuration API which is available to libraries and widgets through the `axConfiguration` injection.
Not to be confused with the `laxar.config.js` which is only used at build-time by tools such as the laxar-loader, _this_ configuration is designed to be used at application run time.

Preliminary readings:

* [Widgets and Activities](widgets_and_activities.md)


## What is LaxarJS Configuration Used for?

First, the configuration is used to customize the behavior of a LaxarJS bootstrapping instance.
This includes deployment-specific options such as the log-level, so you may want to prepare the configuration outside of the `init.js`

When writing widgets, it is generally recommended to avoid global configuration options in favor of widget feature configuration, placed in the page definitions.
Sometimes however, a single setting must be respected across a large number of widgets:
For example, all widgets should use the same validation trigger (on change vs. on focus-out) to guarantee a consistent user experience.

In other cases, LaxarJS itself needs to be configured, for example to determine the theme, file listing URIs, available locales and so on.
The _LaxarJS Core_ configuration options are listed below.


## Configuration Structure

Configuration keys are simple attribute paths, reflecting the hierarchical configuration structure.
The configuration is passed to LaxarJS bootstrap when launching your application instance, usually in the `init.js`:


```js
import { bootstrap } from 'laxar';
bootstrap( /* dom element */, {
   // ... artifacts, widget adapters ...
   configuration: {
      // ... other config options, e.g. logging level ...
      name: 'My App',
      description: 'A well-configured application',
      theme: 'default',
      flow: {
         name: 'main'
      },
      logging: {
         level: 'WARN'
      }
   }
} );
```

Libraries, widgets and activities may define their own configuration keys, but must always use the `lib.` prefix, followed by a suitable module identifier (e.g. the name of the library vendor) to avoid name collisions.
For example, _LaxarJS UiKit_ controls use the prefix `lib.laxar-uikit.controls` for their configuration options.
Keys without the `lib.`-prefix are used by _LaxarJS Core_.


## The Configuration Service

The LaxarJS configuration is exposed as the widget service injection `axConfiguration` with a single method `get( key, fallback )`.
The `key`-parameter is the path within the configuration object (passed to `laxar.bootstrap`), and the (optional) `fallback` is returned as a default value if the key was not set in the configuration.

For example, let us assume that the controller of a `"plain"` activity called `my-activity` wants to enable some kind of compatibility behavior for a special _foo_ environment by exposing a boolean configuration `fooMode`.
By default, the option should be disabled, as compatibility with foo involves jumping through some hoops.

The widget implementation module would then access the option like this:

```js
export const injections = [ 'axConfiguration' ];
export function create( configuration ) {
   const respectFoo = configuration.get( 'widgets.my-activity.fooMode', false );
   if( respectFoo ) {
      // ... jump though some hoops ...
   }
}
```

The corresponding configuration block to enable foo-compatibility would then look like this:

```js
import { bootstrap } from 'laxar';
bootstrap( /* dom element */, {
   // ... artifacts, widget adapters ...
   configuration: {
      // ... other config options, e.g. logging level ...
      widgets: {
         'my-activity': {
            fooMode: true
         }
      }
   }
} );
```

No special magic is attached to the `widgets` sub-key of the configuration, except that it is never used by LaxarJS core or libraries.


## Testing a Module that Uses Configuration

To simplify testing, [LaxarJS Mocks](http://laxarjs.org/docs/laxar-mocks-v2-latest/) always uses a mock configuration instance when loading widgets in spec-tests.
Refer to the [Configuration Mock API docs](../api/testing.configuration_mock.md#create) or to the [LaxarJS Mocks API docs] for details.


## Available Configuration Keys

The following configuration options are defined by _LaxarJS Core_.

| Key                                  | Default               | Description
| :----------------------------------- | :-------------------- | :------------------------------------------------------------------
| `name`                               | `'unnamed'`           | The name of the LaxarJS application
| `description`                        | `''`                  | A short application description
| `theme`                              | `'default'`           | Which theme to use for the application. The suffix `.theme` is added automatically.
| :----------------------------------- | :-------------------- | :------------------------------------------------------------------
| `controls.*`                         | `null`                | Sub-configuration for use by controls (using the artifact name as second-level key is recommended).
| `eventBusTimeoutMs`                  | `120000`              | The maximum delay (in milliseconds) to wait for a `did...` event to be published, after it was announced by a `will...` event.
| `i18n.locales`                       | `{ 'default': 'en' }` | Which language tag to use for the default locale, and possibly for other locales.
| `logging.instanceId`                 | `true`                | If set to a function, that function is used to calculate the value of the INST log tag. If set to `true` (default), the current UNIX timestamp plus a small random offset is used. If set to `false`, no INST log-tag is generated.
| `logging.levels`                     | `{}`                  | Additional log levels with name and severity, for example `{ NOTICE: 350 }`. The predefined severities reach from _100_ for `TRACE` to _600_ for `FATAL`.
| `logging.threshold`                  | `'INFO'`              | The log level which is required for messages to be logged (one of `TRACE`, `DEBUG`, `INFO`, `WARN`, `ERROR` or `FATAL`)
| `flow.name`                          | null                  | The flow to use for routing. **Note:** if this is not specified, no flow will be loaded!
| `router.navigo.useHash`              | false                 | Selects if the Navigo router uses hash-based URLs for navigation (`true`), or path-based URLs that rely on the `pushState` browser feature (`false`).
| `router.base`                        | null                  | Override the document base `href` for routing.
| `router.query.enabled`               | `false`               | If `true`, query parameters are automatically transformed into additional place parameters and vice versa.
| `storagePrefix`                      | `null`                | Allows to set a prefix for local- and session-storage keys when using `laxar.storage`. If `null`, a prefix is generated based on the configured `name`.
| `tooling.enabled`                    | `false`               | If `true` some services are exposed on the global object (i.e. `window`) for tooling purposes.
| `widgets.*`                          | `null`                | Sub-configuration for use by widgets and activities (using the artifact name as second-level key is recommended).
