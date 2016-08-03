/**
 * Copyright 2016 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
import { create as createTimerMock } from '../timer_mock';

describe( 'A timer mock', () => {

   let timerMock;

   beforeEach( () => {
      timerMock = createTimerMock();
   } );

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   it( 'provides a `started` factory method', () => {
      expect( timerMock.started ).toEqual( jasmine.any( Function ) );
   } );

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   describe( 'when started', () => {

      let mockTimerStarted;

      beforeEach( () => {
         mockTimerStarted = timerMock.started();
         timerMock.started();
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'spies on the factory methods', () => {
         expect( timerMock.started ).toHaveBeenCalled();
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'provides a timer-like object', () => {
         expect( mockTimerStarted.stopAndLog ).toEqual( jasmine.any( Function ) );
         expect( mockTimerStarted.stop ).toEqual( jasmine.any( Function ) );
         expect( mockTimerStarted.splitTime ).toEqual( jasmine.any( Function ) );
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'spies on the a timer methods', () => {
         mockTimerStarted.stopAndLog();
         mockTimerStarted.stop();
         mockTimerStarted.splitTime();

         expect( mockTimerStarted.stopAndLog ).toHaveBeenCalled();
         expect( mockTimerStarted.stop ).toHaveBeenCalled();
         expect( mockTimerStarted.splitTime ).toHaveBeenCalled();
      } );

   } );

} );
