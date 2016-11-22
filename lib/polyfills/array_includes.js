// Polyfill based on:
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/includes
// Alternatives seem to cause problems with MSIE (e.g. by relying on a `global` object).
if( !Array.prototype.includes ) {
   // eslint-disable-next-line no-extend-native
   Array.prototype.includes = function( searchElement, optionalFromIndex ) {
      'use strict';
      if( this == null ) {
         throw new TypeError( 'Array.prototype.includes called on null or undefined' );
      }
      const list = Object( this );
      const n = parseInt( list.length, 10 ) || 0;
      if( n === 0 ) { return false; }

      const start = parseInt( optionalFromIndex, 10 ) || 0;
      let k = start >= 0 ? start : Math.max( 0, n + start );

      // detect special case (only NaN !== NaN):
      // eslint-disable-next-line no-self-compare
      if( searchElement !== searchElement ) {
         while( k < n ) {
            if( list[ k ] !== list[ k ] ) { return true; }
            k++;
         }
         return false;
      }

      while( k < n ) {
         if( searchElement === list[ k ] ) { return true; }
         k++;
      }
      return false;
   };
}

