/**
 * Copyright 2016 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
import { when, reject } from 'q';
import assert from '../utilities/assert';

export function create( filesByUri ) {
   assert( filesByUri ).hasType( Object ).isNotNull();

   const mock = {
      isAvailable( uri ) {
         return when( uri in filesByUri );
      },
      provide( uri ) {
         if( !(uri in filesByUri) ) {
            return reject();
         }
         const entry = filesByUri[ uri ];
         return when( typeof entry === 'string' ? entry : JSON.parse( JSON.stringify( entry ) ) );
      }
   };

   spyOn( mock, 'isAvailable' ).and.callThrough();
   spyOn( mock, 'provide' ).and.callThrough();

   return mock;
}
