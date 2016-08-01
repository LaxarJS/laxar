/**
 * Copyright 2016 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
import { create as createControlLoaderMock } from '../control_loader_mock';

describe( 'A controlLoader mock', () => {

   let controlLoaderMock;
   let fakeModule;
   let fakeDescriptor;

   beforeEach( () => {
      fakeDescriptor = { name: 'control' };
      fakeModule = {};
      controlLoaderMock = createControlLoaderMock( {
         './path/some-control': {
            descriptor: fakeDescriptor,
            module: fakeModule
         }
      } );
   } );

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   describe( 'asked to "load" a faked control', () => {

      let result;

      beforeEach( done => {
         controlLoaderMock.load( './path/some-control' )
            .then( _ => { result = _; } )
            .then( done, done.fail );
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'provides the mocked descriptor', () => {
         expect( result ).toEqual( fakeDescriptor );
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'spies on the `load` call', () => {
         expect( controlLoaderMock.load ).toHaveBeenCalled();
      } );

   } );

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   describe( 'asked to "load" an unmocked control', () => {

      let rejectSpy;

      beforeEach( done => {
         rejectSpy = jasmine.createSpy( 'rejectSpy' );
         controlLoaderMock.load( 'does-not-exist' )
            .then( done.fail, rejectSpy ).then( done );
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'rejects the load-request with an error', () => {
         expect( rejectSpy ).toHaveBeenCalledWith( jasmine.any( Error ) );
      } );

   } );

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   describe( 'asked for a mocked control\'s implementation module', () => {

      let result;

      beforeEach( () => {
         result = controlLoaderMock.provide( './path/some-control' );
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'synchronously provides the mocked module', () => {
         expect( result ).toBe( fakeModule );
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'spies on the `provide` call', () => {
         expect( controlLoaderMock.provide ).toHaveBeenCalled();
      } );

   } );

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   describe( 'asked to "provide" an unmocked control', () => {

      let result;

      beforeEach( () => {
         try {
            controlLoaderMock.module( 'does-not-exist' );
         }
         catch( e ) {
            result = e;
         }
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'synchronously fails the provide-request by throwing an error', () => {
         expect( result ).toEqual( jasmine.any( Error ) );
      } );

   } );

} );
