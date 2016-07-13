/**
 * Copyright 2016 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
import { create as createControlsService } from '../controls_service';
import { create as createFrpMock } from '../../testing/file_resource_provider_mock';
import * as path from '../../utilities/path';

describe( 'The controls service', () => {

   let mockDescriptor;
   let controls;

   beforeEach( () => {
      mockDescriptor = {
         name: 'some-great-control',
         integration: { technology: 'plain' }
      };

      const frpMock = createFrpMock( {
         [ path.resolveAssetPath( '/some-control/control.json', 'includes/controls' ) ]: mockDescriptor
      } );
      controls = createControlsService( frpMock, 'includes/controls' );
   } );

    ////////////////////////////////////////////////////////////////////////////////////////////////////////

   it( 'returns an axControls service instance', () => {
      expect( controls.provide ).toEqual( jasmine.any( Function ) );
      expect( controls.load ).toEqual( jasmine.any( Function ) );
      expect( controls.resolve ).toEqual( jasmine.any( Function ) );
      expect( controls.descriptor ).toEqual( jasmine.any( Function ) );
   } );

    ////////////////////////////////////////////////////////////////////////////////////////////////////////

   it( 'allows to resolve a control path', () => {
      expect( controls.resolve( '/some-control' ) ).toMatch( '/some-control' );
   } );

   ////////////////////////////////////////////////////////////////////////////////////////////////////////

   describe( 'asked to load an existing control descriptor', () => {

      let descriptor;

      beforeEach( done => {
         controls.load( '/some-control' )
         .then( _ => { descriptor = _; } )
         .then( done );
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'fetches the descriptor from the file resource provider', () => {
         expect( descriptor ).toEqual( mockDescriptor );
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      describe( 'and then asked to provide the control descriptor', () => {

         beforeEach( () => {
            descriptor = controls.descriptor( '/some-control' );
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'synchronously hands out the descriptor', () => {
            expect( descriptor ).toEqual( mockDescriptor );
         } );
      } );
   } );

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   describe( 'asked to load a non-existing control descriptor', () => {

      let descriptor;

      beforeEach( done => {
         controls.load( '/missing-control' )
         .then( _ => { descriptor = _; } )
         .then( done );
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'synthesizes the descriptor', () => {
         expect( descriptor ).toEqual( {
            _compatibility_0x: true,
            name: 'missing-control',
            integration: { technology: 'angular' }
         } );
      } );
   } );

   ////////////////////////////////////////////////////////////////////////////////////////////////////////

   // TODO (#304) disabled for now, until we know how to really load control modules
   xdescribe( 'asked to provide a control implementation module', () => {

      let fakeModule;
      let provideResult;

      beforeEach( done => {
         // fakeModule = require( '/some-control/some-great-control' );
         System.import( 'lib/runtime/spec/mocks/control_mock' )
            .then( _ => { fakeModule = _; } )
            .then( () => controls.load( '/some-control' ) )
            .then( () => {
               // TODO (#304) crude hack for now. Control loading must be fixed before it's working again ...
               return controls.provide( '/some-control' );
            } )
            .then( result => { provideResult = result; } )
            .then( done, done.fail );
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'returns the matching module', () => {
         expect( provideResult ).toBe( fakeModule );
         expect( provideResult.createFakeControl() ).toEqual( 'FAKE' );
      } );

   } );

} );
