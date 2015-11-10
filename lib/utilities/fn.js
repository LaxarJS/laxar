/**
 * Copyright 2015 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
/**
 * Utilities for dealing with functions.
 *
 * When requiring `laxar`, it is available as `laxar.fn`.
 *
 * @module fn
 */
define( [], function() {
   'use strict';

   var api = {
      debounce: debounce,
      _nowMilliseconds: nowMilliseconds,
      _setTimeout: setTimeout
   };

   return api;

   /**
    * [Underscore `debounce`](http://underscorejs.org/#debounce) with the following modifications:
    *  - automatically mocked when accessed through `laxar/laxar_testing`
    *  - the generated function provides a `cancel()` method
    *
    * See [http://underscorejs.org/#debounce](http://underscorejs.org/#debounce) for detailed
    * documentation on the original version.
    *
    * ### Note on testing:
    *
    * You can set `laxar.fn._nowMilliseconds` and `laxar.fn._setTimout` to mock-functions in order to
    * help testing components that use `laxar.fn` or to test `laxar.fn` itself.
    *
    *
    * @param {Function} f
    *    the function to return a debounced version of
    * @param {Number} waitMs
    *    milliseconds to debounce before invoking `f`
    * @param {Boolean} immediate
    *    if `true` `f` is invoked prior to start waiting `waitMs` milliseconds. Otherwise `f` is invoked
    *    after the given debounce duration has passed. Default is `false`
    *
    * @return {Function}
    *    a debounced wrapper around the argument function f, with an additional method `cancel()`:
    *    After `cancel()` has been called, f will not be invoked anymore, no matter how often the wrapper\
    *    is called.
    */
   function debounce( f, waitMs, immediate ) {
      var MARK = {};
      var timeout, timestamp, result;
      var canceled = false;

      var debounced = function() {
         var context = this;
         var args = [].slice.call( arguments );
         timestamp = api._nowMilliseconds();
         var callNow = immediate && !timeout;

         if( !timeout ) {
            timeout = api._setTimeout( later, waitMs );
         }
         if( callNow && !canceled ) {
            result = f.apply( context, args );
         }

         return result;

         /**
          * Check if the debounced function is ready for execution, and do so if it is.
          * @param {Boolean} _force
          *    This is only relevant when mocking `fn._setTimeout` to implement a force/flush for tests.
          *    If the parameter is passed as `true`, no timing checks are performed prior to execution.
          */
         function later( _force ) {
            var sinceLast = api._nowMilliseconds() - timestamp;
            if( _force || sinceLast >= waitMs  ) {
               timeout = null;
               if( !immediate && !canceled ) {
                  result = f.apply( context, args );
                  if( !timeout ) {
                     context = args = null;
                  }
               }
               return;
            }
            timeout = api._setTimeout( later, waitMs - sinceLast );
         }
      };

      debounced.cancel = function() {
         canceled = true;
      };

      return debounced;
   }

   /**
    * Get the current time in milliseconds.
    * This API is intended to be used from tests only.
    *
    * @return {Number}
    *   the current time in milliseconds (`Date.now()`).
    *   Ovewrride this from tests for reproducible results.
    */
   function nowMilliseconds() {
     return Date.now();
   }

   /**
    * By default, invoke window.setTimeout with the given arguments.
    */
   function setTimout() {
     return window.setTimeout.apply( window, arguments );
   }

} );
