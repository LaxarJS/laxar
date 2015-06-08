
# configuration

The *configuration* module provides convenient readonly access to all values configured for this application
under `window.laxar`. Most probably this configuration takes place in the JavaScript file
`application/application.js` under your project's root directory.

When requiring `laxar`, it is available as `laxar.configuration`.

## Contents

**Module Members**
- [get](#get)

## Module Members
#### <a name="get"></a>get( key, optionalDefault )
Returns the configured value for the specified attribute path or `undefined` in case it wasn't
configured. If a default value was passed as second argument this is returned instead of `undefined`.

Examples:
```js
define( [ 'laxar' ], function( ax ) {
   ax.configuration.get( 'logging.threshold' ); // -> 'INFO'
   ax.configuration.get( 'iDontExist' ); // -> undefined
   ax.configuration.get( 'iDontExist', 42 ); // -> 42
} );
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
