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

/**
 * Copies the properties from a set of source objects over to the target object. Properties of sources
 * later in the arguments list overwrite existing properties in the target and earlier source objects.
 *
 * @param {Object} target
 *    the target object to modify
 * @param {...Object} sources
 *    the source objects to copy over
 *
 * @return {Object}
 *    the modified target object
 *
 * @type {Function}
 */
export function extend( target, ...sources ) {
   return applyForAll( [ target, ...sources ], ( target, source, key ) => {
      target[ key ] = source[ key ];
   } );
}

///////////////////////////////////////////////////////////////////////////////////////////////////////////

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
   return extend( {}, defaults, obj );
}

///////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Iterates over the keys of an object and calls the given iterator function for each entry. On each
 * iteration the iterator function is passed the `value`, the `key` and the complete `object` as
 * arguments. If `object` is an array, the native `Array.prototype.forEach` function is called and hence
 * the keys are the numeric indices of the array.
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

///////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Finds a property in a nested object structure by a given path. A path is a string of keys, separated
 * by a dot from each other, used to traverse that object and find the value of interest. An additional
 * default is returned, if otherwise the value would yield `undefined`.
 *
 * Example.
 * ```js
 * object.path( { one: { two: 3 } }, 'one.two' ); // => 3
 * object.path( { one: { two: 3 } }, 'one.three' ); // => undefined
 * object.path( { one: { two: 3 } }, 'one.three', 42 ); // => 42
 *
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

///////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Sets a property in a nested object structure at a given path to a given value. A path is a string of
 * keys, separated by a dot from each other, used to traverse that object and find the place where the
 * value should be set. Any missing subtrees along the path are created.
 *
 * Example:
 * ```js
 * object.setPath( {}, 'name.first', 'Peter' ); // => { name: { first: 'Peter' } }
 * object.setPath( {}, 'pets.1', 'Hamster' ); // => { pets: [ null, 'Hamster' ] }
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

///////////////////////////////////////////////////////////////////////////////////////////////////////////

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

   // Not using underscore here for performance reasons. Plain for-loops are twice as fast as each and map
   // in all common browsers.
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

///////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Freezes an object, optionally recursively, in any browser capable of freezing objects. In any other
 * browser this method simply returns its first value, i.e. is an identity operation.
 *
 * @param {Object} obj
 *    the object to freeze
 * @param {Boolean} [optionalRecursive]
 *    freezes recursively if `true`. Default is `false`
 *
 * @return {Object}
 *    the input (possibly) frozen
 */
export function deepFreeze( obj, optionalRecursive ) {
   if( Object.isFrozen( obj ) ) {
      return obj;
   }

   if( optionalRecursive ) {
      forEach( obj, ( val, key ) => {
         if( typeof val === 'object' ) {
            obj[ key ] = deepFreeze( val, true );
         }
      } );
   }

   return Object.freeze( obj );
}

///////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Creates a lookup table from a function and a list of inputs to the function.
 *
 * @param {Function} fn
 *    The callback to apply to all inputs
 * @param {Array<String|Number|Boolean>} keys
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

///////////////////////////////////////////////////////////////////////////////////////////////////////////

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

///////////////////////////////////////////////////////////////////////////////////////////////////////////

// eslint-disable-next-line valid-jsdoc
/**
 * Takes a list of objects where the first entry is treated as target object and all other entries as
 * source objects. The callback then is called for each property of each source object. Finally target is
 * returned.
 *
 * @private
 */
function applyForAll( objects, callback ) {
   const target = objects[ 0 ];
   objects.slice( 1 ).forEach( source => {
      if( source ) {
         for( const key in source ) {
            if( hasOwnProperty( source, key ) ) {
               callback( target, source, key );
            }
         }
      }
   } );
   return target;
}

///////////////////////////////////////////////////////////////////////////////////////////////////////////

const hasOwnProp = Object.prototype.hasOwnProperty;
// eslint-disable-next-line valid-jsdoc
/**
 * @private
 */
function hasOwnProperty( object, property ) {
   return hasOwnProp.call( object, property );
}
