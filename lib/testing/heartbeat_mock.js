/**
 * Copyright 2016 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */

export function create() {
   let beforeNext = [];
   let next = [];
   let afterNext = [];

   const mock = {
      onBeforeNext( f ) {
         beforeNext.push( f );
      },
      onNext( f ) {
         next.push( f );
      },
      onAfterNext( f ) {
         afterNext.push( f );
      },
      // Mock only: reset internal state
      reset() {
         beforeNext = [];
         next = [];
         afterNext = [];
      },
      flush() {
         if( next.length === 0 ) {
            return;
         }
         [ beforeNext, next, afterNext ].forEach( queue => {
            while( queue.length ) { queue.shift()(); }
         } );
      }
   };

   spyOn( mock, 'onNext' ).and.callThrough();
   spyOn( mock, 'onAfterNext' ).and.callThrough();
   spyOn( mock, 'onBeforeNext' ).and.callThrough();

   return mock;
}
