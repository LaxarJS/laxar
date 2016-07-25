/**
 * Copyright 2016 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
import { create as createHeartbeat } from '../heartbeat';

describe( 'A heartbeat', () => {

   let heartbeat;

   let beforeNextSpy;
   let nextSpy;
   let afterNextSpy;

   beforeEach( () => {
      heartbeat = createHeartbeat();

      beforeNextSpy = jasmine.createSpy( 'beforeNextSpy' );
      nextSpy = jasmine.createSpy( 'nextSpy' );
      afterNextSpy = jasmine.createSpy( 'afterNextSpy' );
   } );

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   it( 'offers an "onNext" method whose callbacks are triggered right after tick', done => {
      heartbeat.onNext( nextSpy );
      expect( nextSpy ).not.toHaveBeenCalled();
      Promise.resolve()
         .then( () => {
            expect( nextSpy ).toHaveBeenCalled();
         } )
         .then( done, done.fail );
   } );

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   it( 'offers an "onBeforeNext" method whose callbacks are triggered on tick-before-onNext', done => {
      nextSpy.and.callFake( () => {
         expect( beforeNextSpy ).toHaveBeenCalled();
      } );

      heartbeat.onBeforeNext( beforeNextSpy );
      expect( beforeNextSpy ).not.toHaveBeenCalled();
      Promise.resolve()
         .then( () => {
            heartbeat.onNext( nextSpy );
            expect( beforeNextSpy ).not.toHaveBeenCalled();
         } )
         .then( () => {
            expect( nextSpy ).toHaveBeenCalled();
         } )
         .then( done, done.fail );
   } );

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   it( 'offers an "onAfterNext" method whose callbacks are triggered on tick-after-onNext', done => {
      nextSpy.and.callFake( () => {
         expect( beforeNextSpy ).not.toHaveBeenCalled();
      } );


      heartbeat.onAfterNext( afterNextSpy );
      expect( afterNextSpy ).not.toHaveBeenCalled();
      Promise.resolve()
         .then( () => {
            heartbeat.onNext( nextSpy );
         } )
         .then( () => {
            expect( nextSpy ).toHaveBeenCalled();
            expect( afterNextSpy ).not.toHaveBeenCalled();
         } )
         .then( () => {
            expect( afterNextSpy ).toHaveBeenCalled();
         } )
         .then( done, done.fail );
   } );

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   it( 'executes each callback exactly once', done => {
      heartbeat.onBeforeNext( beforeNextSpy );
      heartbeat.onAfterNext( afterNextSpy );
      heartbeat.onNext( nextSpy );

      Promise.resolve()
         .then( () => {
            heartbeat.onNext( nextSpy );
         } )
         .then( () => {
            heartbeat.onNext( nextSpy );
         } )
         .then( () => {
            expect( nextSpy.calls.count() ).toEqual( 3 );
            expect( beforeNextSpy.calls.count() ).toEqual( 1 );
            Promise.resolve().then( () => {
               expect( afterNextSpy.calls.count() ).toEqual( 1 );
            } );
         } )
         .then( done, done.fail );

   } );

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   describe( 'with heartbeat listeners', () => {

      let listener1;
      let listener2;
      let deregister1;
      beforeEach( () => {
         listener1 = jasmine.createSpy();
         listener2 = jasmine.createSpy();
         deregister1 = heartbeat.registerHeartbeatListener( listener1 );
         heartbeat.registerHeartbeatListener( listener2 );
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'calls them onNext *and* yielding', done => {
         heartbeat.onNext( nextSpy );
         expect( nextSpy ).not.toHaveBeenCalled();
         Promise.resolve()
            .then( () => {
               expect( nextSpy ).toHaveBeenCalled();
               expect( listener1 ).not.toHaveBeenCalled();
               Promise.resolve().then( () => {
                  expect( listener1 ).toHaveBeenCalled();
                  expect( listener2 ).toHaveBeenCalled();
               } );
            } )
            .then( done, done.fail );
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      describe( 'when one is deregistered', () => {

         beforeEach( () => {
            listener1.calls.reset();
            listener2.calls.reset();
            deregister1();
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'only calls the remaining one', done => {
            heartbeat.onNext( nextSpy );

            Promise.resolve()
               .then( () => {
                  Promise.resolve().then( () => {
                     expect( listener1 ).not.toHaveBeenCalled();
                     expect( listener2 ).toHaveBeenCalled();
                  } );
               } )
               .then( done, done.fail );
         } );

      } );

   } );

} );
