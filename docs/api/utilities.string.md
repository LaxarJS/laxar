
# <a id="string"></a>string

Utilities for dealing with strings.

When requiring `laxar`, it is available as `laxar.string`.

## Contents

**Module Members**

- [DEFAULT_FORMATTERS](#DEFAULT_FORMATTERS)
- [format()](#format)
- [createFormatter()](#createFormatter)

## Module Members

#### <a id="DEFAULT_FORMATTERS"></a>DEFAULT_FORMATTERS `Object`

A map of all available default format specifiers to their respective formatter function.
The following specifiers are available:

- `%d` / `%i`: Format the given numeric value as integer. Decimal places are removed
- `%f`: Format the given numeric value as floating point value. This specifier supports precision as
  sub-specifier (e.g. `%.2f` for 2 decimal places)
- `%s`: use simple string serialization using `toString`
- `%o`: Format complex objects using `JSON.stringify`

#### <a id="format"></a>format( string, optionalIndexedReplacements, optionalNamedReplacements )

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
by backslashes (thus to get an actual backslash in a JavaScript string literal, which is then treated as
an escape symbol, it needs to be written as double backslash):
```javascript
string.format( 'A [something] should eventually only have \\[x].', {
   something: 'checklist'
} );
// => 'A checklist should eventually only have [x].'
```
A placeholder key can be any character string besides `[`, `]` and `:` to keep parsing simple and fast.
By using `:` as separator it is possible to provide a type specifier for string serialization or other
additional mapping functions for the value to insert. Type specifiers always begin with an `%` and end
with the specifier type. Builtin specifiers and their according formatter functions are defined
as [`DEFAULT_FORMATTERS`](utilities.string.md).

When no specifier is provided, by default `%s` is assumed.

Example:
```javascript
string.format( 'Hello [0:%s], you owe me [1:%.2f] euros.', [ 'Peter', 12.1243 ] );
// => 'Hello Peter, you owe me 12.12 euros.'
```

Mapping functions should instead consist of simple strings and may not begin with a `%` character. It is
advised to use the same naming rules as for simple JavaScript functions. Type specifiers and mapping
functions are applied in the order they appear within the placeholder.

An example, where we assume that the mapping functions `flip` and `double` where defined by the user
when creating the `formatString` function using [`#createFormatter()`](#createFormatter):
```javascript
formatString( 'Hello [0:%s:flip], you owe me [1:double:%.2f] euros.', [ 'Peter', 12 ] );
// => 'Hello reteP, you owe me 24.00 euros.'
```

Note that there currently exist no builtin mapping functions.

If a type specifier is used that doesn't exist, an exception is thrown. In contrast to that the use of
an unknown mapping function results in a no-op. This is on purpose to be able to use filter-like
functions that, in case they are defined for a formatter, transform a value as needed and in all other
cases simply are ignored and don't alter the value.

##### Parameters

| Property | Type | Description |
| -------- | ---- | ----------- |
| string | `String` |  the string to replace placeholders in |
| _optionalIndexedReplacements_ | `Array` |  an optional array of indexed replacements |
| _optionalNamedReplacements_ | `Object` |  an optional map of named replacements |

##### Returns

| Type | Description |
| ---- | ----------- |
| `String` |  the string with placeholders substituted for their according replacements |

#### <a id="createFormatter"></a>createFormatter( typeFormatters, optionalValueMappers )

Creates a new format function having the same api as [`#format()`](#format). If the first argument is
omitted or `null`, the default formatters for type specifiers are used. Otherwise only the provided map
of specifiers is available to the returned format function. Each key of the map is a specifier character
where the `%` is omitted and the value is the formatting function. A formatting function receives the
value to format (i.e. serialize) and the sub-specifier (if any) as arguments. For example for the format
specifier `%.2f` the sub-specifier would be `.2` where for `%s` it would simply be the empty string.

Example:
```js
const format = string.createFormatter( {
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

The second argument is completely additional to the behavior of the default [`#format()`](#format)
function. Here a map from mapping function id to actual mapping function can be passed in. Whenever the
id of a mapping function is found within the placeholder, that mapping function is called with the
current value and its return value is either passed to the next mapping function or rendered
instead of the placeholder if there are no more mapping function ids or type specifiers within the
placeholder string.

```javascript
const format = string.createFormatter( null, {
   flip: function( value ) {
      return ( '' + s ).split( '' ).reverse().join( '' );
   },
   double: function( value ) {
      return value * 2;
   }
} );

format( 'Hello [0:%s:flip], you owe me [1:double:%.2f] euros.', [ 'Peter', 12 ] );
// => 'Hello reteP, you owe me 24.00 euros.'
```

##### Parameters

| Property | Type | Description |
| -------- | ---- | ----------- |
| typeFormatters | `Object` |  map from format specifier (single letter without leading `%`) to formatting function |
| _optionalValueMappers_ | `Object` |  map from mapping identifier to mapping function |

##### Returns

| Type | Description |
| ---- | ----------- |
| `Function` |  a function having the same api as [`#format()`](#format) |
