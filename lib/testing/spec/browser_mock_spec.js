/**
 * Copyright 2016 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
import { create as createBrowserMock } from '../browser_mock';

describe( 'A browser mock', () => {

   let browserMock;

   beforeEach( () => {
      browserMock = createBrowserMock();
      spyOn( console, 'info' );
   } );

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   it( 'offers a method to access the window.location property', () => {
      expect( browserMock.location ).toEqual( jasmine.any( Function ) );
   } );

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   it( 'has a method to access the browser console', () => {
      expect( browserMock.console ).toEqual( jasmine.any( Function ) );
   } );

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   it( 'offers a `fetch` method', () => {
      expect( browserMock.fetch ).toEqual( jasmine.any( Function ) );
   } );

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   it( 'does not log to the actual browser console', () => {
      browserMock.console().info( 'hello' );
      expect( window.console.info ).not.toHaveBeenCalled();
   } );

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   describe( 'created with a fake environment', () => {

      let fakeConsole;
      let fakeWindow;

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      beforeEach( () => {
         fakeConsole = jasmine.createSpyObj( 'fakeConsole', [ 'info' ] );
         fakeWindow = { location: 'http://example.com' };
         browserMock = createBrowserMock( {
            console: fakeConsole,
            window: fakeWindow
         } );
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'logs to the console provided therein', () => {
         browserMock.console().info( 'hello' );
         expect( fakeConsole.info ).toHaveBeenCalled();
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'returns the location provided therein', () => {
         browserMock.console().info( 'hello' );
         expect( fakeWindow.location ).toEqual( 'http://example.com' );
      } );

   } );

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   describe( 'configured with mock responses', () => {

      beforeEach( () => {
         browserMock.respondWith( 'http://example.com/resourceA', { resource: 'A' } );
         browserMock.respondWith( './resourceB', 'Hello' );
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'spies on the `fetch` method', () => {
         browserMock.fetch( 'http://example.com/resourceA' );
         expect( browserMock.fetch ).toHaveBeenCalled();
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'responds with their JSON representation when `fetch` is used', done => {
         browserMock.fetch( 'http://example.com/resourceA' )
            .then( _ => _.text() )
            .then( _ => { expect( JSON.parse( _ ) ).toEqual( { resource: 'A' } ); } )
            .then( () => browserMock.fetch( './resourceB' ) )
            .then( _ => _.text() )
            .then( _ => { expect( JSON.parse( _ ) ).toEqual( 'Hello' ); } )
            .then( done, done.fail );
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'allows to reset the fetch mock', done => {
         browserMock.reset();
         browserMock.fetch( 'http://example.com/resourceA' )
            .then( done.fail, _ => {
               expect( () => _.text() ).toThrow();
            } )
            .then( done );
      } );

   } );

} );
