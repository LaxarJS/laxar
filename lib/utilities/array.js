/**
 * Copyright 2014 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
define( [], function() {
   'use strict';

   function remove( array, item ) {
      var idx = array.indexOf( item );
      if( idx !== -1 ) {
         array.splice( idx, 1 );
         return true;
      }
      return false;
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function removeAll( array, item ) {
      var itemRemoved = false;
      while( remove( array, item ) ) {
         itemRemoved = true;
      }
      return itemRemoved;
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   return {

      /**
       * Removes the first occurrence of `item` in `array` from `array` and returns `true` if `item` was
       * removed, or `false` if it wasn't
       *
       * @param {Array} array
       *    the array from which to remove the `item`
       * @param {Object} item
       *    the item to remove from `array`
       *
       * @return {Boolean}
       *    `true` if item was removed, `false` otherwise
       */
      remove: remove,

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      /**
       * Removes all occurrences of `item` in `array` from `array` and returns `true` if at least one item was
       * removed, or `false` otherwise.
       *
       * @param {Array} array
       *    the array from which to remove the `item`
       * @param {Object} item
       *    the item to remove from `array`
       *
       * @return {Boolean}
       *    `true` if at least one item was removed, `false` otherwise
       */
      removeAll: removeAll

   };

} );
