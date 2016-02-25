/**
 * Copyright 2016 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
import { create as createHeartbeat } from '../heartbeat';

describe( 'A heartbeat', () => {

   let heartbeat;
   let pageController;

   let beforeNextSpy;
   let nextSpy;
   let afterNextSpy;

   beforeEach( () => {
      pageController = jasmine.createSpyObj( 'fakeController', [ 'applyViewChanges' ] );
      heartbeat = createHeartbeat( {
         controller() { return pageController; }
      } );

      beforeNextSpy = jasmine.createSpy( 'beforeNextSpy' );
      nextSpy = jasmine.createSpy( 'nextSpy' );
      afterNextSpy = jasmine.createSpy( 'afterNextSpy' );

      jasmine.clock().install();
   } );
   afterEach( () => jasmine.clock().uninstall() );

   ////////////////////////////////////////////////////////////////////////////////////////////////////////

   it( 'offers an "onNext" method whose callbacks are triggered on tick', () => {
      heartbeat.onNext( nextSpy );
      expect( nextSpy ).not.toHaveBeenCalled();
      jasmine.clock().tick( 0 );
      expect( nextSpy ).toHaveBeenCalled();
   } );

   ////////////////////////////////////////////////////////////////////////////////////////////////////////

   it( 'offers an "onBeforeNext" method whose callbacks are triggered on tick-after-onNext', () => {
      nextSpy.and.callFake( () => {
         expect( beforeNextSpy ).toHaveBeenCalled();
      } );

      heartbeat.onBeforeNext( beforeNextSpy );
      expect( beforeNextSpy ).not.toHaveBeenCalled();
      jasmine.clock().tick( 0 );
      heartbeat.onNext( nextSpy );
      expect( beforeNextSpy ).not.toHaveBeenCalled();
      jasmine.clock().tick( 0 );
      expect( nextSpy ).toHaveBeenCalled();
   } );

   ////////////////////////////////////////////////////////////////////////////////////////////////////////

   it( 'offers an "onAfterNext" method whose callbacks are triggered on tick-after-onNext', () => {
      nextSpy.and.callFake( () => {
         expect( beforeNextSpy ).not.toHaveBeenCalled();
      } );

      heartbeat.onAfterNext( afterNextSpy );
      expect( afterNextSpy ).not.toHaveBeenCalled();
      jasmine.clock().tick( 0 );
      heartbeat.onNext( nextSpy );
      expect( afterNextSpy ).not.toHaveBeenCalled();
      jasmine.clock().tick( 0 );
      expect( nextSpy ).toHaveBeenCalled();
      expect( afterNextSpy ).toHaveBeenCalled();
   } );

   ////////////////////////////////////////////////////////////////////////////////////////////////////////

   it( 'executes each callback exactly once', () => {
      heartbeat.onBeforeNext( beforeNextSpy );
      heartbeat.onAfterNext( afterNextSpy );
      heartbeat.onNext( nextSpy );
      jasmine.clock().tick( 0 );
      heartbeat.onNext( nextSpy );
      jasmine.clock().tick( 0 );
      heartbeat.onNext( nextSpy );
      jasmine.clock().tick( 0 );

      expect( nextSpy.calls.count() ).toEqual( 3 );
      expect( beforeNextSpy.calls.count() ).toEqual( 1 );
      expect( afterNextSpy.calls.count() ).toEqual( 1 );
   } );

   ////////////////////////////////////////////////////////////////////////////////////////////////////////

   it( 'calls applyViewChanges of the current page controller (#214)', () => {
      heartbeat.onNext( nextSpy );
      jasmine.clock().tick( 0 );

      expect( pageController.applyViewChanges ).toHaveBeenCalled();
   } );

} );
