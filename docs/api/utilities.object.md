
# <a id="object"></a>object

Utilities for dealing with objects.

When requiring `laxar`, it is available as `laxar.object`.

## Contents

**Module Members**

- [extend()](#extend)
- [options()](#options)
- [forEach()](#forEach)
- [path()](#path)
- [setPath()](#setPath)
- [deepClone()](#deepClone)
- [deepFreeze()](#deepFreeze)
- [tabulate()](#tabulate)

## Module Members

#### <a id="extend"></a>extend( target, sources )

Copies the properties from a set of source objects over to the target object. Properties of sources
later in the arguments list overwrite existing properties in the target and earlier source objects.

TODO: remove this function: https://github.com/LaxarJS/laxar/issues/395

##### Parameters

| Property | Type | Description |
| -------- | ---- | ----------- |
| target | `Object` |  the target object to modify |
| sources... | `Object` |  the source objects to copy over |

##### Returns

| Type | Description |
| ---- | ----------- |
| `Object` |  the modified target object |

#### <a id="options"></a>options( obj, defaults )

Returns all properties from `obj` with missing properties completed from `defaults`. If `obj` is `null`
or `undefined`, an empty object is automatically created. `obj` and `defaults` are not modified by this
function. This is very useful for optional map arguments, resembling some kind of configuration.

Example:
```js
object.options( { validate: true }, {
   validate: false,
   highlight: true
} );
// =>
// {
//    validate: true,
//    highlight: true
// }
```

##### Parameters

| Property | Type | Description |
| -------- | ---- | ----------- |
| obj | `Object` |  the options object to use as source, may be `null` or `undefined` |
| defaults | `Object` |  the defaults to take missing properties from |

##### Returns

| Type | Description |
| ---- | ----------- |
| `Object` |  the completed options object |

#### <a id="forEach"></a>forEach( object, iteratorFunction )

Iterates over the keys of an object and calls the given iterator function for each entry.
On each iteration the iterator function is passed the `value`, the `key` and the complete `object` as
arguments.
If `object` is an array, the native `Array.prototype.forEach` function is called.
In this case the keys are the indices of the array.

Example:
```
object.forEach( { name: Peter, age: 12 }, ( value, key ) => {
   console.log( `${key} = ${value}\n` );
});
// =>
// name = Peter
// age = 12
```

##### Parameters

| Property | Type | Description |
| -------- | ---- | ----------- |
| object | `Object` |  the object to run the iterator function on |
| iteratorFunction | `Function` |  the iterator function to run on each key-value pair |

#### <a id="path"></a>path( obj, thePath, optionalDefault )

Finds a property in a nested object structure by a given path. A path is a string of keys, separated
by a dot from each other, used to traverse that object and find the value of interest. An additional
default is returned, if otherwise the value would yield `undefined`.

Note that `path()` must only be used in situations where all path segments are also valid
JavaScript identifiers, and should never be used with user-specified paths:

 - there is no mechanism to escape '.' in path segments; a dot always separates keys,
 - an empty string as a path segment will abort processing and return the entire sub-object under the
   respective position. For historical reasons, the path interpretation differs from that performed by
   [`#setPath()`](#setPath).

Example:

```js
object.path( { one: { two: 3 } }, 'one.two' ); // => 3
object.path( { one: { two: 3 } }, 'one.three' ); // => undefined
object.path( { one: { two: 3 } }, 'one.three', 42 ); // => 42
object.path( { one: { two: 3 } }, 'one.' ); // => { two: 3 }
object.path( { one: { two: 3 } }, '' ); // => { one: { two: 3 } }
object.path( { one: { two: 3 } }, '.' ); // => { one: { two: 3 } }
```

##### Parameters

| Property | Type | Description |
| -------- | ---- | ----------- |
| obj | `Object` |  the object to traverse |
| thePath | `String` |  the path to search for |
| _optionalDefault_ | `*` |  the value to return instead of `undefined` if nothing is found |

##### Returns

| Type | Description |
| ---- | ----------- |
| `*` |  the value at the given path |

#### <a id="setPath"></a>setPath( obj, path, value )

Sets a property in a nested object structure at a given path to a given value. A path is a string of
keys, separated by a dot from each other, used to traverse that object and find the place where the
value should be set. Any missing subtrees along the path are created.

Note that `setPath()` must only be used in situations where all path segments are also valid
JavaScript identifiers, and should never be used with user-specified paths:

 - there is no mechanism to escape '.' in path segments; a dot will always create separate keys,
 - an empty string as a path segment will create an empty string key in the object graph where missing.
   For historical reasons, this path interpretation differs from that performed by #path (see there).

Example:

```js
object.setPath( {}, 'name.first', 'Peter' ); // => { name: { first: 'Peter' } }
object.setPath( {}, 'pets.1', 'Hamster' ); // => { pets: [ null, 'Hamster' ] }
object.setPath( {}, '', 'Hamster' ); // => { '': 'Hamster' } }
object.setPath( {}, '.', 'Hamster' ); // => { '': { '': 'Hamster' } } }
```

##### Parameters

| Property | Type | Description |
| -------- | ---- | ----------- |
| obj | `Object` |  the object to modify |
| path | `String` |  the path to set a value at |
| value | `*` |  the value to set at the given path |

##### Returns

| Type | Description |
| ---- | ----------- |
| `*` |  the full object (for chaining) |

#### <a id="deepClone"></a>deepClone( object )

Returns a deep clone of the given object. Note that the current implementation is intended to be used
for simple object literals only. There is no guarantee that cloning objects instantiated via
constructor function works and cyclic references will lead to endless recursion.

##### Parameters

| Property | Type | Description |
| -------- | ---- | ----------- |
| object | `*` |  the object to clone |

##### Returns

| Type | Description |
| ---- | ----------- |
| `*` |  the clone |

#### <a id="deepFreeze"></a>deepFreeze( obj, optionalRecursive )

Freezes an object, optionally recursively, in any browser capable of freezing objects. In any other
browser this method simply returns its first value, i.e. is an identity operation.

TODO: remove this function: https://github.com/LaxarJS/laxar/issues/395

##### Parameters

| Property | Type | Description |
| -------- | ---- | ----------- |
| obj | `Object` |  the object to freeze |
| _optionalRecursive_ | `Boolean` |  freezes recursively if `true`. Default is `false` |

##### Returns

| Type | Description |
| ---- | ----------- |
| `Object` |  the input (possibly) frozen |

#### <a id="tabulate"></a>tabulate( fn, keys )

Creates a lookup table from a function and a list of inputs to the function.

##### Parameters

| Property | Type | Description |
| -------- | ---- | ----------- |
| fn | `Function` |  The callback to apply to all inputs |
| keys | `Array.<String>`, `Array.<Number>`, `Array.<Boolean>` |  The keys for the lookup table, and inputs to the function. |

##### Returns

| Type | Description |
| ---- | ----------- |
| `Object` |  An object mapping the given keys to their values under `fn`. |
