/* eslint-disable prefer-rest-params */
// Polyfill based on:
// https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/Object/assign
if( !Object.prototype.assign ) {
   Object.assign = function( target ) {
      'use strict';
      // We must check against these specific cases.
      if( target === undefined || target === null ) {
         throw new TypeError( 'Cannot convert undefined or null to object' );
      }

      const output = Object( target );
      for( let index = 1; index < arguments.length; index++ ) {
         const source = arguments[ index ];
         if( source !== undefined && source !== null ) {
            for( const nextKey in source ) {
               // eslint-disable-next-line max-depth
               if( source.hasOwnProperty( nextKey ) ) {
                  output[ nextKey ] = source[ nextKey ];
               }
            }
         }
      }
      return output;
   };
}

