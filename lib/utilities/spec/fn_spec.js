/**
 * Copyright 2016 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
define( [
   '../fn'
], function( fn ) {
   'use strict';

   describe( 'Function utilities', function() {

      describe( 'debounce( f, waitMs [, immediate ] )', function() {

         var callCount;
         var debouncee;
         var wrapper;

         beforeEach( function() {
            // modifies effects of fn._setTimeout:
            jasmine.Clock.useMock();
            spyOn( fn, '_setTimeout' ).andCallThrough();

            spyOn( fn, '_nowMilliseconds' ).andCallFake( function() {
               return jasmine.Clock.installed.nowMillis;
            } );

            callCount = 0;
            debouncee = jasmine.createSpy( 'debouncee' ).andCallFake( function() {
               ++callCount;
            } );
         } );

         describe( 'asked to debounce a function with a wait interval of 500ms', function() {

            beforeEach( function() {
               wrapper = fn.debounce( debouncee, 500 );
            } );

            afterEach( function() {
               wrapper.cancel();
            } );

            //////////////////////////////////////////////////////////////////////////////////////////////////

            describe( 'and canceled immediately before calling, then waiting for 1s', function() {

               beforeEach( function() {
                  wrapper.cancel();
                  wrapper();
                  jasmine.Clock.tick( 1000 );
               } );

               it( 'never runs the debouncee', function() {
                  expect( callCount ).toEqual( 0 );
               } );

            } );

            //////////////////////////////////////////////////////////////////////////////////////////////////

            describe( 'and canceled immediately after calling, then waiting for 1s', function() {

               beforeEach( function() {
                  wrapper();
                  wrapper.cancel();
                  jasmine.Clock.tick( 1000 );
               } );

               it( 'never runs the debouncee', function() {
                  expect( callCount ).toEqual( 0 );
               } );

            } );

            //////////////////////////////////////////////////////////////////////////////////////////////////

            describe( 'and called once before waiting for 499ms', function() {

               beforeEach( function() {
                  wrapper();
                  jasmine.Clock.tick( 499 );
               } );

               it( 'never runs the debouncee', function() {
                  expect( callCount ).toEqual( 0 );
               } );

            } );

            //////////////////////////////////////////////////////////////////////////////////////////////////

            describe( 'and called once before waiting for 1s', function() {
               beforeEach( function() {
                  wrapper();
                  jasmine.Clock.tick( 1000 );
               } );

               it( 'runs the debouncee 1x total', function() {
                  expect( callCount ).toEqual( 1 );
               } );
            } );

            //////////////////////////////////////////////////////////////////////////////////////////////////

            describe( 'and called 2x before waiting for 500ms', function() {
               beforeEach( function() {
                  wrapper();
                  wrapper();
                  jasmine.Clock.tick( 500 );
               } );

               it( 'runs the debouncee 1x total', function() {
                  expect( callCount ).toEqual( 1 );
               } );

               describe( 'and called 3x within 300ms, then waiting for 200ms', function() {
                  beforeEach( function() {
                     jasmine.Clock.tick( 100 );
                     wrapper();
                     jasmine.Clock.tick( 100 );
                     wrapper();
                     jasmine.Clock.tick( 100 );
                     wrapper();
                     jasmine.Clock.tick( 200 );
                  } );

                  it( 'runs the debouncee 1x total', function() {
                     expect( callCount ).toEqual( 1 );
                  } );

                  describe( 'and then waiting for 299ms', function() {
                     beforeEach( function() {
                        jasmine.Clock.tick( 299 );
                     } );

                     it( 'runs the debouncee 1x total', function() {
                        expect( callCount ).toEqual( 1 );
                     } );
                  } );

                  describe( 'and then waiting for 300ms', function() {
                     beforeEach( function() {
                        jasmine.Clock.tick( 300 );
                     } );

                     it( 'runs the debouncee 2x total', function() {
                        expect( callCount ).toEqual( 2 );
                     } );
                  } );
               } );

               describe( 'and not called again before waiting for 500ms', function() {
                  beforeEach( function() {
                     jasmine.Clock.tick( 500 );
                  } );

                  it( 'runs the debouncee 1x total', function() {
                     expect( callCount ).toEqual( 1 );
                  } );
               } );
            } );

         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         describe( 'asked to debounce a function with a wait of 0ms', function() {

            beforeEach( function() {
               wrapper = fn.debounce( debouncee, 0 );
            } );

            afterEach( function() {
               wrapper.cancel();
            } );

            describe( 'and called 6x within 3ms', function() {
               beforeEach( function() {
                  wrapper( 'A' );
                  wrapper( 'X' );
                  jasmine.Clock.tick( 1 );
                  wrapper( 'B' );
                  wrapper( 'Y' );
                  jasmine.Clock.tick( 1 );
                  wrapper( 'C' );
                  wrapper( 'Z' );
                  jasmine.Clock.tick( 1 );
               } );

               it( 'runs the debouncee 3x total', function() {
                  expect( callCount ).toEqual( 3 );
               } );

               it( 'only applies the first call within each millisecond slot', function() {
                  expect( debouncee ).toHaveBeenCalledWith( 'A' );
                  expect( debouncee ).toHaveBeenCalledWith( 'B' );
                  expect( debouncee ).toHaveBeenCalledWith( 'C' );
                  expect( debouncee ).not.toHaveBeenCalledWith( 'X' );
                  expect( debouncee ).not.toHaveBeenCalledWith( 'Y' );
                  expect( debouncee ).not.toHaveBeenCalledWith( 'Z' );
               } );
            } );

         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         describe( 'asked to debounce a function with a wait of 500ms and immediate execution', function() {

            beforeEach( function() {
               wrapper = fn.debounce( debouncee, 500, true );
            } );

            afterEach( function() {
               wrapper.cancel();
            } );

            //////////////////////////////////////////////////////////////////////////////////////////////////

            describe( 'and canceled immediately before calling, then waiting for 1s', function() {

               beforeEach( function() {
                  wrapper.cancel();
                  wrapper();
                  jasmine.Clock.tick( 1000 );
               } );

               it( 'never runs the debouncee', function() {
                  expect( callCount ).toEqual( 0 );
               } );

            } );

            //////////////////////////////////////////////////////////////////////////////////////////////////

            describe( 'and canceled immediately after calling, then waiting for 1s', function() {

               beforeEach( function() {
                  wrapper();
                  wrapper.cancel();
                  jasmine.Clock.tick( 1000 );
               } );

               it( 'runs the debouncee 1x total', function() {
                  expect( callCount ).toEqual( 1 );
               } );

            } );

            //////////////////////////////////////////////////////////////////////////////////////////////////

            describe( 'and called once before waiting for 499ms', function() {

               beforeEach( function() {
                  wrapper();
                  jasmine.Clock.tick( 499 );
               } );

               it( 'runs the debouncee 1x total', function() {
                  expect( callCount ).toEqual( 1 );
               } );

            } );

            //////////////////////////////////////////////////////////////////////////////////////////////////

            describe( 'and called 2x before waiting for 500ms', function() {
               beforeEach( function() {
                  wrapper();
                  wrapper();
                  jasmine.Clock.tick( 500 );
               } );

               it( 'runs the debouncee 1x total', function() {
                  expect( callCount ).toEqual( 1 );
               } );

               describe( 'and called 3x within 300ms, then waiting for 200ms', function() {
                  beforeEach( function() {
                     jasmine.Clock.tick( 100 );
                     wrapper();
                     jasmine.Clock.tick( 100 );
                     wrapper();
                     jasmine.Clock.tick( 100 );
                     wrapper();
                     jasmine.Clock.tick( 200 );
                  } );

                  it( 'runs the debouncee 1x total', function() {
                     expect( callCount ).toEqual( 2 );
                  } );

                  describe( 'and then waiting for 299ms', function() {
                     beforeEach( function() {
                        jasmine.Clock.tick( 299 );
                     } );

                     it( 'runs the debouncee 1x total', function() {
                        expect( callCount ).toEqual( 2 );
                     } );
                  } );

                  describe( 'and then waiting for 300ms', function() {
                     beforeEach( function() {
                        jasmine.Clock.tick( 300 );
                     } );

                     it( 'runs the debouncee 2x total', function() {
                        expect( callCount ).toEqual( 2 );
                     } );
                  } );
               } );

               describe( 'and not called again before waiting for 500ms', function() {
                  beforeEach( function() {
                     jasmine.Clock.tick( 500 );
                  } );

                  it( 'runs the debouncee 1x total', function() {
                     expect( callCount ).toEqual( 1 );
                  } );
               } );
            } );

         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         describe( 'asked to debounce a function with a wait of 0ms and immediate execution', function() {

            beforeEach( function() {
               wrapper = fn.debounce( debouncee, 0, true );
            } );

            afterEach( function() {
               wrapper.cancel();
            } );

            describe( 'and called 6x within 3ms', function() {
               beforeEach( function() {
                  wrapper( 'A' );
                  wrapper( 'X' );
                  jasmine.Clock.tick( 1 );
                  wrapper( 'B' );
                  wrapper( 'Y' );
                  jasmine.Clock.tick( 1 );
                  wrapper( 'C' );
                  wrapper( 'Z' );
                  jasmine.Clock.tick( 1 );
               } );

               it( 'runs the debouncee 3x total', function() {
                  expect( callCount ).toEqual( 3 );
               } );

               it( 'only applies the first call within each millisecond slot', function() {
                  expect( debouncee ).toHaveBeenCalledWith( 'A' );
                  expect( debouncee ).toHaveBeenCalledWith( 'B' );
                  expect( debouncee ).toHaveBeenCalledWith( 'C' );
                  expect( debouncee ).not.toHaveBeenCalledWith( 'X' );
                  expect( debouncee ).not.toHaveBeenCalledWith( 'Y' );
                  expect( debouncee ).not.toHaveBeenCalledWith( 'Z' );
               } );
            } );

         } );

      } );

   } );

} );
