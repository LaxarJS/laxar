/**
 * Copyright 2016 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
import { create as createControlsService } from '../controls_service';
import { create as createFrpMock } from '../../testing/file_resource_provider_mock';
import * as path from '../../utilities/path';

 describe( 'The controls service', () => {

    let mockDescriptor_;
    let controls;

    beforeEach( () => {
       mockDescriptor_ = {
          name: 'some-great-control',
          integration: { technology: 'plain' }
       };

       const frpMock = createFrpMock( {
          [ path.resolveAssetPath( '/some-control/control.json', 'includes/controls' ) ]: mockDescriptor_
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

       let descriptor_;

       beforeEach( done => {
          controls.load( '/some-control' )
             .then( descriptor => descriptor_ = descriptor )
             .then( done );
       } );

       ////////////////////////////////////////////////////////////////////////////////////////////////////////

       it( 'fetches the descriptor from the file resource provider', () => {
          expect( descriptor_ ).toEqual( mockDescriptor_ );
       } );

       ////////////////////////////////////////////////////////////////////////////////////////////////////////

       describe( 'and then asked to provide the control descriptor', () => {

          beforeEach( () => {
             descriptor_ = controls.descriptor( '/some-control' );
          } );

          /////////////////////////////////////////////////////////////////////////////////////////////////////

          it( 'synchronously hands out the descriptor', () => {
             expect( descriptor_ ).toEqual( mockDescriptor_ );
          } );
       } );
    } );

    ////////////////////////////////////////////////////////////////////////////////////////////////////////

    describe( 'asked to load a non-existing control descriptor', () => {

       let descriptor_;

       beforeEach( done => {
          controls.load( '/missing-control' )
             .then( descriptor => descriptor_ = descriptor )
             .then( done );
       } );

       ////////////////////////////////////////////////////////////////////////////////////////////////////////

       it( 'synthesizes the descriptor', () => {
          expect( descriptor_ ).toEqual( {
             _compatibility_0x: true,
             name: 'missing-control',
             integration: { technology: 'angular' }
          } );
       } );
    } );

    ////////////////////////////////////////////////////////////////////////////////////////////////////////

    // TODO disabled for now, until we know how to really load control modules
    // describe( 'asked to provide a control implementation module', () => {
    //
    //    var fakeModule_;
    //    var provideResult_;
    //
    //    beforeEach( done => {
    //       // fakeModule_ = require( '/some-control/some-great-control' );
    //       System.import( 'lib/runtime/spec/mocks/control_mock' )
    //          .then( fakeModule => fakeModule_ = fakeModule )
    //          .then( () => controls.load( '/some-control' ) )
    //          .then( () => {
    //             // TODO crude hack for now. Control loading must be changed a bit before it's working again ...
    //             return controls.provide( '/some-control' );
    //          } )
    //          .then( result => provideResult_ = result )
    //          .then( done, done.fail );
    //    } );
    //
    //    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    //
    //    it( 'returns the matching module', () => {
    //       expect( provideResult_ ).toBe( fakeModule_ );
    //       expect( provideResult_.createFakeControl() ).toEqual( 'FAKE' );
    //    } );
    //
    // } );

 } );
