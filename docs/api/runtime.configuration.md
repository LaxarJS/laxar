
# <a id="configuration"></a>configuration

Module providing the Configuration factory.

To use the Configuration in a widget, request the [`axConfiguration`](runtime.widget_services.md#axConfiguration)
injection. In compatibility mode with LaxarJS v1.x, it is also available under `laxar.configuration`.

## Contents

**Types**

- [Configuration](#Configuration)
  - [Configuration.get()](#Configuration.get)
  - [Configuration.ensure()](#Configuration.ensure)

## Types

### <a id="Configuration"></a>Configuration

Provides access to the configuration that was passed during application bootstrapping.

A *Configuration* instance provides convenient readonly access to the underlying LaxarJS
application bootstrapping configuration. The configuration values are passed to
[`laxar#bootstrap()`](-unknown-#bootstrap) on startup (before LaxarJS v2.x, these configuration values were read from
`window.laxar`). When using the LaxarJS application template, the configuration values are set in the
file `application/application.js` under your project's root directory.

#### <a id="Configuration.get"></a>Configuration.get( key, optionalDefault )

Returns the configured value for the specified attribute path or `undefined` in case it wasn't
configured. If a default value was passed as second argument this is returned instead of `undefined`.

Services should use this to get configuration values for which there are universal fallback behaviors.

Examples:
```js
// ... inject `axConfiguration` as parameter `config` ...
config.get( 'logging.threshold' ); // -> 'INFO'
config.get( 'iDontExist' ); // -> undefined
config.get( 'iDontExist', 42 ); // -> 42
```

##### Parameters

| Property | Type | Description |
| -------- | ---- | ----------- |
| key | `String` |  a  path (using `.` as separator) to the property in the configuration object |
| _optionalDefault_ | `*` |  the value to return if no value was set for `key` |

##### Returns

| Type | Description |
| ---- | ----------- |
| `*` |  either the configured value, `undefined` or `optionalDefault` |

#### <a id="Configuration.ensure"></a>Configuration.ensure( key )

Retrieves a configuration value by key, failing if it is `undefined` or `null`.

Services should use this to get configuration values for which no universal default or fallback exists.

Examples:
```js
// ... inject `axConfiguration` as parameter `config` ...
config.ensure( 'logging.threshold' ); // -> 'INFO'
config.ensure( 'iDontExist' ); // -> throws
```

##### Parameters

| Property | Type | Description |
| -------- | ---- | ----------- |
| key | `String` |  a  path (using `.` as separator) to the property in the configuration object |

##### Returns

| Type | Description |
| ---- | ----------- |
| `*` |  the configured value (if `undefined` or `null`, an exception is thrown instead) |
