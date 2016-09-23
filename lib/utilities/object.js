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
define( [], function() {
   'use strict';

   var slice = Array.prototype.slice;

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
   function extend( target, sources ) {
      return applyForAll( slice.call( arguments, 0 ), function( target, source, key ) {
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
   function options( obj, defaults ) {
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
   function forEach( object, iteratorFunction ) {
      if( Array.isArray( object ) ) {
         object.forEach( iteratorFunction );
         return;
      }

      for( var key in object ) {
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
    * Note that `object.path` must only be used in situations where all path segments are also valid
    * JavaScript identifiers, and should never be used with user-specified paths:
    *
    *  - there is no mechanism to escape '.' in path segments; a dot always separates keys,
    *  - an empty string as a path segment will abort processing and return the entire sub-object under the
    *    respective position. For historical reasons, the path interpretation differs from that performed by
    *    #setPath (see there).
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
   function path( obj, thePath, optionalDefault ) {
      var defaultResult = arguments.length === 3 ? optionalDefault : undefined;

      var pathArr = thePath.split( '.' );
      var node = obj;
      var key = pathArr.shift();

      while( key ) {
         if( node && typeof node === 'object' && hasOwnProperty( node, key ) ) {
            node = node[ key ];
            key = pathArr.shift();
         }
         else {
            return defaultResult;
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
    * Note that `object.path` must only be used in situations where all path segments are also valid
    * JavaScript identifiers, and should never be used with user-specified paths:
    *
    *  - there is no mechanism to escape '.' in path segments; a dot will always create separate keys,
    *  - an empty string as a path segment will create an empty string key in the object graph where missing.
    *    For historical reasons, the path interpretation differs from that performed by #path (see there).
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
   function setPath( obj, path, value ) {
      var node = obj;
      var pathArr = path.split( '.' );
      var last = pathArr.pop();

      pathArr.forEach( function( pathFragment, index ) {
         if( !node[ pathFragment ] || typeof node[ pathFragment ] !== 'object' ) {
            var lookAheadFragment = pathArr[ index + 1 ] || last;
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
   function deepClone( object ) {
      if( !object || typeof object !== 'object' ) {
         return object;
      }

      // Not using underscore here for performance reasons. Plain for-loops are twice as fast as each and map
      // in all common browsers.
      var result;
      if( Array.isArray( object ) ) {
         result = [];
         for( var i = 0, length = object.length; i < length; ++i ) {
            result[ i ] = deepClone( object[ i ] );
         }
      }
      else {
         result = {};
         for( var key in object ) {
            if( hasOwnProperty( object, key ) )  {
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
   function deepFreeze( obj, optionalRecursive ) {
      if( Object.isFrozen( obj ) ) {
         return obj;
      }

      if( optionalRecursive ) {
         forEach( obj, function( val, key ) {
            if( typeof val === 'object' ) {
               obj[ key ] = deepFreeze( val, true );
            }
         } );
      }

      return Object.freeze( obj );
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   /**
    * Sets all entries of the given array to `null`.
    *
    * @private
    */
   function fillArrayWithNull( arr, toIndex ) {
      for( var i = arr.length; i < toIndex; ++i ) {
         arr[ i ] = null;
      }
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   /**
    * Takes a list of objects where the first entry is treated as target object and all other entries as
    * source objects. The callback then is called for each property of each source object. Finally target is
    * returned.
    *
    * @private
    */
   function applyForAll( objects, callback ) {
      var target = objects[0];
      objects.slice( 1 ).forEach( function( source ) {
         if( source ) {
            for( var key in source ) {
               if( hasOwnProperty( source, key ) ) {
                  callback( target, source, key );
               }
            }
         }
      } );
      return target;
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   /**
    *
    * @private
    */
   function hasOwnProperty( object, property ) {
      return hasOwnProp.call( object, property );
   }
   var hasOwnProp = Object.prototype.hasOwnProperty;

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   return {
      extend: extend,
      options: options,
      forEach: forEach,
      path: path,
      setPath: setPath,
      deepClone: deepClone,
      deepFreeze: typeof Object.freeze === 'function' ? deepFreeze : function( _ ) { return _; }
   };

} );
