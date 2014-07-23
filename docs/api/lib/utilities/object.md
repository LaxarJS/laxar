# Documentation

## extend( target, sources )
Copies the properties from a set of source objects over to the target object. Properties of sources
later in the arguments list overwrite existing properties in the target and earlier source objects.

### Parameters
- **target {Object}**: the target object to modify

- **sources {...Object}**: the source objects to copy over


### Returns
- **{Object}**: the modified target object



## options( options, defaults )
Returns all properties from `options` with missing properties completed from `defaults`. If `options`
is `null` or `undefined`, an empty object is automatically created. `options` and `defaults` are not
modified.

Example:
```javascript
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

### Parameters
- **options {Object}**: the options object to use as source, may be `null` or `undefined`

- **defaults {Object}**: the defaults to take missing properties from


### Returns
- **{Object}**: the completed options object


## map( object, mappingFunction )
Applies a given function to each entry in the object and returns a new objects reflecting the changes
made by the mapping function. On each iteration the mapping function is passed the `value`, the `key`
and the complete `object` as arguments. It then must return an array where the first item is the new
key and the second item the new value for the resulting object.

Example:
```javascript
object.map( { x: 1, y: 2 } , function( value, key ) {
   return [ key, value + 1 ];
} );
// => { x: 2, y: 3 }
```

### Parameters
- **object {Object}**: the object to run the mapping function on

- **mappingFunction {Function}**: the mapping function to run on each key-value pair


### Returns
- **{Object}**: a new object reflecting the results of the mapping


## forEach( object, iteratorFunction )
Iterates over the keys of an object and calls the given iterator function for each entry. On each
iteration the iterator function is passed the `value`, the `key` and the complete `object` as
arguments. If `object` is an array, the native `Array.prototype.forEach` function is called and hence
the keys are the numeric indices of the array.

### Parameters
- **object {Object}**: the object to run the iterator function on

- **iteratorFunction {Function}**: the iterator function to run on each key-value pair


## path( obj, path, [optionalDefault] )
Finds a property in a nested object structure by a given path. A path is a string of keys, separated
by a dot from each other, used to traverse that object and find the value of interest. An additional
default is returned, if otherwise the value would yield `undefined`.

### Parameters
- **obj {Object}**: the object to traverse

- **path {String}**: the path to search for

- **_optionalDefault_ {*}**: the value to return instead of `undefined` if nothing is found


### Returns
- **{*}**: the value at the given path


## setPath( obj, path, value )
Sets a property in a nested object structure at a given path to a given value. A path is a string of
keys, separated by a dot from each other, used to traverse that object and find the place where the
value should be set. Any missing subtrees along the path are created.

### Parameters
- **obj {Object}**: the object to modify

- **path {String}**: the path to set a value at

- **value {*}**: the value to set at the given path


### Returns
- **{*}**: the full object (for chaining)


## deepClone( obj )
Returns a deep clone of the given object. Note that the current implementation is intended to be
used for simple object literals only. There is no guarantee that cloning objects instantiated via
constructor function works and cyclic references will lead to endless recursion.

### Parameters
- **obj {*}**: the object to clone


### Returns
- **{*}**: the clone


## deepFreeze( obj, [optionalRecursive] )
Freezes an object, optionally recursively, in any browser capable of freezing objects. In any other
browser this method simply returns its first value, i.e. is an identity operation.

### Parameters
- **obj {Object}**: the object to freeze

- **_optionalRecursive_ {Boolean}**: freezes recursively if `true`. Default is `false`


### Returns
- **{Object}**: the input (possibly) frozen
