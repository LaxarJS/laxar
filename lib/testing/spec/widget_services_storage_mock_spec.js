/**
 * Copyright 2016 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */

import { create as createWidgetServicesStorageMock } from '../widget_services_storage_mock';

describe( 'An axStorage mock', () => {

   let axStorageMock;

   beforeEach( () => {
      axStorageMock = createWidgetServicesStorageMock();
   } );

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   describe( 'asked for local and session storage', () => {

      beforeEach( () => {
         [ 'local', 'session' ].forEach( name => {
            axStorageMock[ name ].setItem( `test-${name}`, 'X' );
         } );
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'allows to get items', () => {
         [ 'local', 'session' ].forEach( name => {
            const store = axStorageMock[ name ];
            expect( store.getItem( `test-${name}` ) ).toEqual( 'X' );
         } );
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'allows to set items', () => {
         [ 'local', 'session' ].forEach( name => {
            const store = axStorageMock[ name ];
            store.setItem( `test-${name}`, 'Y' );
            expect( axStorageMock.mockBackends[ name ][ `test-${name}` ] ).toEqual( '"Y"' );
         } );
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'allows to remove items', () => {
         [ 'local', 'session' ].forEach( name => {
            const store = axStorageMock[ name ];
            store.removeItem( `test-${name}` );
            expect( axStorageMock.mockBackends[ name ] ).toEqual( {} );
         } );
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'uses distinct backends', () => {
         expect( axStorageMock.local.getItem( 'test-session' ) ).not.toBeDefined();
         expect( axStorageMock.session.getItem( 'test-local' ) ).not.toBeDefined();
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'spies on storage operations', () => {
         expect( axStorageMock.local.setItem ).toHaveBeenCalled();
         expect( axStorageMock.session.setItem ).toHaveBeenCalled();
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'reflects backend manipulation', () => {
         axStorageMock.mockBackends.local.key = '"value"';
         expect( axStorageMock.local.getItem( 'key' ) ).toEqual( 'value' );
      } );

   } );

} );
