/**
 * Copyright 2014 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
define( [], function() {
   'use strict';

   return {
      /**
       * Underscore `debounce`, but with LaxarJS offering mocking in tests.
       * @see http://underscorejs.org/#debounce
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
