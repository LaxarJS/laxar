/**
 * Copyright 2016 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
import { create as createCssLoaderMock } from '../css_loader_mock';

describe( 'A cssLoader mock', () => {

   let cssLoaderMock;

   beforeEach( () => {
      cssLoaderMock = createCssLoaderMock();
   } );

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   it( 'provides a `load` method', () => {
      expect( cssLoaderMock.load ).toEqual( jasmine.any( Function ) );
   } );

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   it( 'spies on the `load` method', () => {
      cssLoaderMock.load();
      expect( cssLoaderMock.load ).toHaveBeenCalled();
   } );

} );
