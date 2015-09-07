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

   return {

      /**
       * [Underscore `debounce`](http://underscorejs.org/#debounce), but with LaxarJS offering mocking in
       * tests. See [http://underscorejs.org/#debounce](http://underscorejs.org/#debounce) for detailed
       * documentation.
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
       *    the debounced function
       */
      debounce: function( f, waitMs, immediate ) {
         var timeout, args, context, timestamp, result;
         return function() {
            context = this;
            args = arguments;
            timestamp = new Date();
            var later = function() {
               var last = (new Date()) - timestamp;
               if( last < waitMs ) {
                  timeout = setTimeout(later, waitMs - last);
               }
               else {
                  timeout = null;
                  if( !immediate ) {
                     result = f.apply(context, args);
                  }
               }
            };
            var callNow = immediate && !timeout;
            if( !timeout ) { timeout = setTimeout(later, waitMs); }
            if( callNow ) { result = f.apply(context, args); }
            return result;
         };
      }
   };

} );
