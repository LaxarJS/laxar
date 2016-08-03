/**
 * Copyright 2016 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
import { create as createTimerFactory } from '../timer';
import { create as createLogMock } from '../../testing/log_mock';

describe( 'A timer module', () => {

   let logMock;
   let timerFactory;
   let startTime;

   beforeEach( () => {
      jasmine.clock().install();
      jasmine.clock().mockDate( new Date( '2016-06-11' ) );
      startTime = Date.now();

      spyOn( Date, 'now' ).and.callThrough();
      logMock = createLogMock();
      timerFactory = createTimerFactory( logMock );
   } );

   afterEach( () => {
      jasmine.clock().uninstall();
   } );

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   it( 'creates a timer by starting it', () => {
      const timer = timerFactory.started();
      expect( Date.now ).toHaveBeenCalled();
      expect( timer.start ).toBeDefined();
      expect( timer.stop ).toBeDefined();
      expect( timer.splitTime ).toBeDefined();
      expect( timer.getData ).toBeDefined();
   } );

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   it( 'creates a timer with generated label if the option is omitted', () => {
      const timer = timerFactory.started();
      expect( timer.getData().label ).toEqual( 'timer0' );
   } );

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   describe( 'creates a started timer', () => {

      let timer;
      let initialData;

      beforeEach( () => {
         timer = timerFactory.started( { label: 'my-checkpoint-1' } );
         initialData = timer.getData();
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'that uses the provided label', () => {
         expect( initialData.label ).toEqual( 'my-checkpoint-1' );
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'that initially only has a start time and no end time or split times', () => {
         expect( initialData.startTime ).toEqual( startTime );
         expect( initialData.stopTime ).toBe( null );
         expect( initialData.splitTimes ).toEqual( [] );
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      describe( 'that when some time is passed', () => {

         beforeEach( () => {
            jasmine.clock().tick( 300 );
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'on call to stop stores the time but does not log it', () => {
            timer.stop();
            expect( timer.getData().stopTime ).toEqual( startTime + 300 );
            expect( logMock.info ).not.toHaveBeenCalled();
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'on call to stopAndLog stores the time and logs it with the given label', () => {
            timer.stopAndLog( 'my-checkpoint-2' );
            expect( timer.getData().stopTime ).toEqual( startTime + 300 );
            expect( logMock.info ).toHaveBeenCalledWith(
               'Timer "my-checkpoint-1": start at 2016-06-11T00:00:00.000Z (client), ' +
               'my-checkpoint-2 after 300ms (checkpoints: "my-checkpoint-2"=300ms)'
            );
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'uses a generated label for logging if stopAndLog is called without label', () => {
            timer.stopAndLog();
            expect( logMock.info ).toHaveBeenCalledWith(
               'Timer "my-checkpoint-1": start at 2016-06-11T00:00:00.000Z (client), ' +
               'Timer Stopped after 300ms (checkpoints: "Timer Stopped"=300ms)'
            );
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         describe( 'when splitTime is called with label', () => {

            beforeEach( () => {
               timer.splitTime( 'my-checkpoint-x' );
            } );

            //////////////////////////////////////////////////////////////////////////////////////////////////

            it( 'adds a split time record to the data', () => {
               expect( timer.getData().splitTimes.length ).toBe( 1 );
               expect( timer.getData().splitTimes ).toEqual( [ {
                  time: startTime + 300,
                  label: 'my-checkpoint-x'
               } ] );
            } );

            //////////////////////////////////////////////////////////////////////////////////////////////////

            describe( 'and when splitTime is called again, this time without label', () => {

               beforeEach( () => {
                  jasmine.clock().tick( 200 );
                  timer.splitTime();
               } );

               ///////////////////////////////////////////////////////////////////////////////////////////////

               it( 'adds another split time record to the data with generated label', () => {
                  expect( timer.getData().splitTimes.length ).toBe( 2 );
                  expect( timer.getData().splitTimes[ 1 ] ).toEqual( {
                     time: startTime + 500,
                     label: 'split1'
                  } );
               } );

               ///////////////////////////////////////////////////////////////////////////////////////////////

               describe( 'when stopAndLog is called', () => {

                  beforeEach( () => {
                     jasmine.clock().tick( 50 );
                     timer.stopAndLog( 'the-end');
                  } );

                  ////////////////////////////////////////////////////////////////////////////////////////////

                  it( 'sets the stop time in the data record', () => {
                     expect( timer.getData().stopTime ).toEqual( startTime + 550 );
                  } );

                  ////////////////////////////////////////////////////////////////////////////////////////////

                  it( 'logs the start, stop and split time info', () => {
                     expect( logMock.info ).toHaveBeenCalledWith(
                        'Timer "my-checkpoint-1": start at 2016-06-11T00:00:00.000Z (client), ' +
                        'the-end after 550ms ' +
                        '(checkpoints: "my-checkpoint-x"=300ms, "split1"=200ms, "the-end"=50ms)'
                     );
                  } );

               } );

            } );

         } );
      } );

   } );

} );
