/**
 * Copyright 2016 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */

export function create( initialData ) {
   const mockControls = initialData || {};
   return {
      load: jasmine.createSpy( 'controlLoader.load' ).and.callFake( controlRef =>
         controlRef in mockControls ?
            Promise.resolve( mockControls[ controlRef ].descriptor ) :
            Promise.reject( new Error( `No such control: ${controlRef}` ) )
      ),
      provide: jasmine.createSpy( 'controlLoader.provide' ).and.callFake( controlRef => {
         if( controlRef in mockControls ) {
            return mockControls[ controlRef ].module;
         }
         throw new Error( `No such control module: ${controlRef}` );
      } )
   };
}
