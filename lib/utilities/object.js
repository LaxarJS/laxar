/**
 * Copyright 2016 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */

/**
 * Utilities for dealing with objects.
 *
 * When requiring `laxar`, it is available as `laxar.object`.
 *
 * @module object
 */

//////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Returns all properties from `obj` with missing properties completed from `defaults`. If `obj` is `null`
 * or `undefined`, an empty object is automatically created. `obj` and `defaults` are not modified by this
 * function. This is very useful for optional map arguments, resembling some kind of configuration.
 *
 * Example:
 * ```js
 * object.options( { validate: true }, {
 *    validate: false,
 *    highlight: true
 * } );
 * // =>
 * // {
 * //    validate: true,
 * //    highlight: true
 * // }
 * ```
 *
 * @param {Object} obj
 *    the options object to use as source, may be `null` or `undefined`
 * @param {Object} defaults
 *    the defaults to take missing properties from
 *
 * @return {Object}
 *    the completed options object
 */
export function options( obj, defaults ) {
   return { ...defaults, ...obj };
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Iterates over the keys of an object and calls the given iterator function for each entry.
 * On each iteration the iterator function is passed the `value`, the `key` and the complete `object` as
 * arguments.
 * If `object` is an array, the native `Array.prototype.forEach` function is called.
 * In this case the keys are the indices of the array.
 *
 * Example:
 * ```
 * object.forEach( { name: Peter, age: 12 }, ( value, key ) => {
 *    console.log( `${key} = ${value}\n` );
 * });
 * // =>
 * // name = Peter
 * // age = 12
 * ```
 *
 * @param {Object} object
 *    the object to run the iterator function on
 * @param {Function} iteratorFunction
 *    the iterator function to run on each key-value pair
 */
export function forEach( object, iteratorFunction ) {
   if( Array.isArray( object ) ) {
      object.forEach( iteratorFunction );
      return;
   }

   for( const key in object ) {
      if( hasOwnProperty( object, key ) ) {
         iteratorFunction( object[ key ], key, object );
      }
   }
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Finds a property in a nested object structure by a given path. A path is a string of keys, separated
 * by a dot from each other, used to traverse that object and find the value of interest. An additional
 * default is returned, if otherwise the value would yield `undefined`.
 *
 * Note that `path()` must only be used in situations where all path segments are also valid
 * JavaScript identifiers, and should never be used with user-specified paths:
 *
 *  - there is no mechanism to escape '.' in path segments; a dot always separates keys,
 *  - an empty string as a path segment will abort processing and return the entire sub-object under the
 *    respective position. For historical reasons, the path interpretation differs from that performed by
 *    {@link #setPath()}.
 *
 *
 * Example:
 *
 * ```js
 * object.path( { one: { two: 3 } }, 'one.two' ); // => 3
 * object.path( { one: { two: 3 } }, 'one.three' ); // => undefined
 * object.path( { one: { two: 3 } }, 'one.three', 42 ); // => 42
 * object.path( { one: { two: 3 } }, 'one.' ); // => { two: 3 }
 * object.path( { one: { two: 3 } }, '' ); // => { one: { two: 3 } }
 * object.path( { one: { two: 3 } }, '.' ); // => { one: { two: 3 } }
 * ```
 *
 * @param {Object} obj
 *    the object to traverse
 * @param {String} thePath
 *    the path to search for
 * @param {*} [optionalDefault]
 *    the value to return instead of `undefined` if nothing is found
 *
 * @return {*}
 *    the value at the given path
 */
export function path( obj, thePath, optionalDefault = undefined ) {
   const pathArr = thePath.split( '.' );
   let node = obj;
   let key = pathArr.shift();

   while( key ) {
      if( node && typeof node === 'object' && hasOwnProperty( node, key ) ) {
         node = node[ key ];
         key = pathArr.shift();
      }
      else {
         return optionalDefault;
      }
   }

   return node;
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Sets a property in a nested object structure at a given path to a given value. A path is a string of
 * keys, separated by a dot from each other, used to traverse that object and find the place where the
 * value should be set. Any missing subtrees along the path are created.
 *
 * Note that `setPath()` must only be used in situations where all path segments are also valid
 * JavaScript identifiers, and should never be used with user-specified paths:
 *
 *  - there is no mechanism to escape '.' in path segments; a dot will always create separate keys,
 *  - an empty string as a path segment will create an empty string key in the object graph where missing.
 *    For historical reasons, this path interpretation differs from that performed by #path (see there).
 *
 *
 * Example:
 *
 * ```js
 * object.setPath( {}, 'name.first', 'Peter' ); // => { name: { first: 'Peter' } }
 * object.setPath( {}, 'pets.1', 'Hamster' ); // => { pets: [ null, 'Hamster' ] }
 * object.setPath( {}, '', 'Hamster' ); // => { '': 'Hamster' } }
 * object.setPath( {}, '.', 'Hamster' ); // => { '': { '': 'Hamster' } } }
 * ```
 *
 * @param {Object} obj
 *    the object to modify
 * @param {String} path
 *    the path to set a value at
 * @param {*} value
 *    the value to set at the given path
 *
 * @return {*}
 *    the full object (for chaining)
 */
export function setPath( obj, path, value ) {
   let node = obj;
   const pathArr = path.split( '.' );
   const last = pathArr.pop();

   pathArr.forEach( ( pathFragment, index ) => {
      if( !node[ pathFragment ] || typeof node[ pathFragment ] !== 'object' ) {
         const lookAheadFragment = pathArr[ index + 1 ] || last;
         if( lookAheadFragment.match( /^[0-9]+$/ ) ) {
            node[ pathFragment ] = [];
            fillArrayWithNull( node[ pathFragment ], parseInt( lookAheadFragment, 10 ) );
         }
         else {
            node[ pathFragment ] = {};
         }
      }

      node = node[ pathFragment ];
   } );

   if( Array.isArray( node ) && last > node.length ) {
      fillArrayWithNull( node, last );
   }

   node[ last ] = value;

   return obj;
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Returns a deep clone of the given object. Note that the current implementation is intended to be used
 * for simple object literals only. There is no guarantee that cloning objects instantiated via
 * constructor function works and cyclic references will lead to endless recursion.
 *
 * @param {*} object
 *    the object to clone
 *
 * @return {*}
 *    the clone
 */
export function deepClone( object ) {
   if( !object || typeof object !== 'object' ) {
      return object;
   }

   // Using plain for-loops here for performance-reasons.
   let result;
   if( Array.isArray( object ) ) {
      result = [];
      for( let i = 0, length = object.length; i < length; ++i ) {
         result[ i ] = deepClone( object[ i ] );
      }
   }
   else {
      result = {};
      for( const key in object ) {
         if( hasOwnProperty( object, key ) ) {
            result[ key ] = deepClone( object[ key ] );
         }
      }
   }

   return result;
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Creates a lookup table from a function and a list of inputs to the function.
 *
 * @param {Function} fn
 *    The callback to apply to all inputs
 * @param {String[]|Number[]|Boolean[]} keys
 *    The keys for the lookup table, and inputs to the function.
 *
 * @return {Object}
 *    An object mapping the given keys to their values under `fn`.
 */
export function tabulate( fn, keys ) {
   return keys.reduce(
      ( table, k ) => { table[ k ] = fn( k ); return table; },
      {}
   );
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////////

// eslint-disable-next-line valid-jsdoc
/**
 * Sets all entries of the given array to `null`.
 *
 * @private
 */
function fillArrayWithNull( arr, toIndex ) {
   for( let i = arr.length; i < toIndex; ++i ) {
      arr[ i ] = null;
   }
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////////

const hasOwnProp = Object.prototype.hasOwnProperty;
// eslint-disable-next-line valid-jsdoc
/**
 * @private
 */
function hasOwnProperty( object, property ) {
   return hasOwnProp.call( object, property );
}
