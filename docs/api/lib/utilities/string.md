# Documentation

## endsWith( inputString, suffix, [optionalIgnoreCase] )
Returns `true` if the first argument ends with the string given as second argument.

### Parameters
- **inputString {String}**: test subject

- **suffix {String}**: string to find as tail

- **_optionalIgnoreCase_ {Boolean}**: if `true` case insensitive matching takes place. Default is `false`


### Returns
- **{Boolean}**: `true` if suffix is the tail of inputString


## upperCaseToCamelCase( inputString, [removeAllUnderscores] )
Expects an upper-case string with underscores and creates a new string in the corresponding camel-
case notation, i.e. `SOME_NICE_FEATURE` will be converted to `someNiceFeature`. If there are n
successive underscores for n > 1, they will be transformed to n-1 underscores in the resulting string.
This can be prevented by passing the `removeAllUnderscores` parameter as `true`. In that case the
first character is always transformed to lower case.

### Parameters
- **inputString {String}**: the uppercase-underscore string

- **_removeAllUnderscores_ {Boolean}**: if `true` all underscores will be removed


### Returns
- **{String}**: the string transformed to camelcase


## removeUnderscoresFromCamelCase( inputString )
Removes all underscores from an otherwise camel-case formatted string. Those strings result e.g. from
generated id's, where there is a prefix taken from a component type, combined with an generated id,
separated by `__`. Example: `accordion_widget__id0` will result in `accordionWidgetId0`

### Parameters
- **inputString {String}**: the camel-case string to remove all underscores from


### Returns
- **{String}**: the camel case string with all underscores removed


## capitalize( inputString )
Returns a new string that equals the `inputString` where the first character is upper-case.

### Parameters
- **inputString {String}**: the string to capitalize


### Returns
- **{String}**: the capitalized string


## format( string, [optionalIndexedReplacements], [optionalNamedReplacements] )
<a name="format"></a>
Substitutes all unescaped placeholders in the given string for a given indexed or named value.
A placeholder is written as a pair of brackets around the key of the placeholder. An example of an
indexed placeholder is `[0]` and a named placeholder would look like this `[replaceMe]`. If no
replacement for a key exists, the placeholder will simply not be substituted.

Some examples:
```javascript
string.format( 'Hello [0], how do you like [1]?', [ 'Peter', 'Cheeseburgers' ] );
// => 'Hello Peter, how do you like Cheeseburgers?'
```
```javascript
string.format( 'Hello [name] and [partner], how do you like [0]?', [ 'Pizza' ], {
   name: 'Hans',
   partner: 'Roswita'
} );
// => 'Hello Hans and Roswita, how do you like Pizza?'
```
If a pair of brackets should not be treated as a placeholder, the opening bracket can simply be escaped
by backslashes (thus to get an actual backslash, it needs to be written as double backslash):
```javascript
string.format( 'A [something] should eventually only have \\[x].', {
   something: 'checklist'
} );
// => 'A checklist should eventually only have [x].'
```
A placeholder key can be any character string besides `[`, `]` and `:` to keep parsing simple and fast.
Using `:` as separator it is possible to provide a type specifier for string serialization. Known types
are:

- `%d` / `%i`: Format the given numeric value as integer. Decimal places are removed.
- `%f`: Format the given numeric value as floating point value. This specifier supports precision as
  sub-specifier (e.g. `%.2f` for 2 decimal places).
- `%s`: use simple string serialization using `toString`.
- `%o`: Format complex objects using `JSON.stringify`.

When no specifier is provided, by default `%s` is assumed.

Example:
```javascript
string.format( 'Hello [0:%s], you owe me [1:%.2f] euros.', [ 'Peter', 12.1243 ] );
// => 'Hello Peter, you owe me 12.12 euros.'
```

### Parameters
- **string {String}**: the string to replace placeholders in

- **_optionalIndexedReplacements_ {Array}**: an optional array of indexed replacements

- **_optionalNamedReplacements_ {Object}**: an optional map of named replacements


### Returns
- **{String}**: the string with placeholders substituted for their according replacements


## createFormatter( typeFormatters )
Creates a new format function having the same api as [`format()`](#format) but without the default
formatters for specifiers. Instead the specifiers of interest have to be passed to this function as map
from specifier (omitting the `%`) to formatting function. A formatting function receives the value to
format and the sub-specifier (if any) as arguments. For example for the format specifier `%.2f` the
sub-specifier would be `.2` where for `%s` it would simply be the empty string.

Example:
```javascript
var format = string.createFormatter( {
   'm': function( value ) {
      return value.amount + ' ' + value.currency;
   },
   'p': function( value, subSpecifier ) {
      return Math.pow( value, parseInt( subSpecifier, 10 ) );
   }
} );

format( 'You owe me [0:%m].', [ { amount: 12, currency: 'EUR' } ] );
// => 'You owe me 12 EUR.'

format( '[0]^3 = [0:%3p]', [ 2 ] );
// => '2^3 = 8'
```

### Parameters
- **typeFormatters {Object}**: map from format specifier (single letter without leading `%`) to formatting function


### Returns
- **{Function}**: A function having the same api as [`format()`](#format)
