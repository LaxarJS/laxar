/**
 * Copyright 2016 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
import assert from '../utilities/assert';

export function create( filesByUri ) {
   assert( filesByUri ).hasType( Object ).isNotNull();

   const mock = {
      isAvailable( uri ) {
         return Promise.resolve( uri in filesByUri );
      },
      provide( uri ) {
         if( !(uri in filesByUri) ) {
            return Promise.reject();
         }
         const entry = filesByUri[ uri ];
         return Promise.resolve( typeof entry === 'string' ? entry : JSON.parse( JSON.stringify( entry ) ) );
      }
   };

   spyOn( mock, 'isAvailable' ).and.callThrough();
   spyOn( mock, 'provide' ).and.callThrough();

   return mock;
}
