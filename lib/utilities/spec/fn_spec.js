/**
 * Copyright 2015 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
import * as fn from '../fn';

describe( 'Function utilities', () => {

   describe( 'debounce( f, waitMs [, immediate ] )', () => {

      var debouncee;
      var wrapper;

      beforeEach( () => {
         // modifies effects of fn._tooling.setTimeout:
         jasmine.clock().install();
         // ensures Date#getTime() returns values based on tick() calls
         jasmine.clock().mockDate();

         spyOn( fn._tooling, 'setTimeout' ).and.callThrough();
         spyOn( fn._tooling, 'nowMilliseconds' ).and.callFake( () => new Date().getTime() );

         debouncee = jasmine.createSpy( 'debouncee' );
      } );
      afterEach( () => jasmine.clock().uninstall() );

      describe( 'asked to debounce a function with a wait interval of 500ms', () => {

         beforeEach( () => {
            wrapper = fn.debounce( debouncee, 500 );
         } );

         afterEach( () => {
            wrapper.cancel();
         } );

         //////////////////////////////////////////////////////////////////////////////////////////////////

         describe( 'and canceled immediately before calling, then waiting for 1s', () => {

            beforeEach( () => {
               wrapper.cancel();
               wrapper();
               jasmine.clock().tick( 1000 );
            } );

            it( 'never runs the debouncee', () => {
               expect( debouncee.calls.count() ).toEqual( 0 );
            } );

         } );

         //////////////////////////////////////////////////////////////////////////////////////////////////

         describe( 'and canceled immediately after calling, then waiting for 1s', () => {

            beforeEach( () => {
               wrapper();
               wrapper.cancel();
               jasmine.clock().tick( 1000 );
            } );

            it( 'never runs the debouncee', () => {
               expect( debouncee.calls.count() ).toEqual( 0 );
            } );

         } );

         //////////////////////////////////////////////////////////////////////////////////////////////////

         describe( 'and called once before waiting for 499ms', () => {

            beforeEach( () => {
               wrapper();
               jasmine.clock().tick( 499 );
            } );

            it( 'never runs the debouncee', () => {
               expect( debouncee.calls.count() ).toEqual( 0 );
            } );

         } );

         //////////////////////////////////////////////////////////////////////////////////////////////////

         describe( 'and called once before waiting for 1s', () => {
            beforeEach( () => {
               wrapper();
               jasmine.clock().tick( 1000 );
            } );

            it( 'runs the debouncee 1x total', () => {
               expect( debouncee.calls.count() ).toEqual( 1 );
            } );
         } );

         //////////////////////////////////////////////////////////////////////////////////////////////////

         describe( 'and called 2x before waiting for 500ms', () => {
            beforeEach( () => {
               wrapper();
               wrapper();
               jasmine.clock().tick( 500 );
            } );

            it( 'runs the debouncee 1x total', () => {
               expect( debouncee.calls.count() ).toEqual( 1 );
            } );

            describe( 'and called 3x within 300ms, then waiting for 200ms', () => {
               beforeEach( () => {
                  jasmine.clock().tick( 100 );
                  wrapper();
                  jasmine.clock().tick( 100 );
                  wrapper();
                  jasmine.clock().tick( 100 );
                  wrapper();
                  jasmine.clock().tick( 200 );
               } );

               it( 'runs the debouncee 1x total', () => {
                  expect( debouncee.calls.count() ).toEqual( 1 );
               } );

               describe( 'and then waiting for 299ms', () => {
                  beforeEach( () => {
                     jasmine.clock().tick( 299 );
                  } );

                  it( 'runs the debouncee 1x total', () => {
                     expect( debouncee.calls.count() ).toEqual( 1 );
                  } );
               } );

               describe( 'and then waiting for 300ms', () => {
                  beforeEach( () => {
                     jasmine.clock().tick( 300 );
                  } );

                  it( 'runs the debouncee 2x total', () => {
                     expect( debouncee.calls.count() ).toEqual( 2 );
                  } );
               } );
            } );

            describe( 'and not called again before waiting for 500ms', () => {
               beforeEach( () => {
                  jasmine.clock().tick( 500 );
               } );

               it( 'runs the debouncee 1x total', () => {
                  expect( debouncee.calls.count() ).toEqual( 1 );
               } );
            } );
         } );

      } );

      /////////////////////////////////////////////////////////////////////////////////////////////////////

      describe( 'asked to debounce a function with a wait of 0ms', () => {

         beforeEach( () => {
            wrapper = fn.debounce( debouncee, 0 );
         } );

         afterEach( () => {
            wrapper.cancel();
         } );

         describe( 'and called 6x within 3ms', () => {
            beforeEach( () => {
               wrapper( 'A' );
               wrapper( 'X' );
               jasmine.clock().tick( 1 );
               wrapper( 'B' );
               wrapper( 'Y' );
               jasmine.clock().tick( 1 );
               wrapper( 'C' );
               wrapper( 'Z' );
               jasmine.clock().tick( 1 );
            } );

            it( 'runs the debouncee 3x total', () => {
               expect( debouncee.calls.count() ).toEqual( 3 );
            } );

            it( 'only applies the first call within each millisecond slot', () => {
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

      describe( 'asked to debounce a function with a wait of 500ms and immediate execution', () => {

         beforeEach( () => {
            wrapper = fn.debounce( debouncee, 500, true );
         } );

         afterEach( () => {
            wrapper.cancel();
         } );

         //////////////////////////////////////////////////////////////////////////////////////////////////

         describe( 'and canceled immediately before calling, then waiting for 1s', () => {

            beforeEach( () => {
               wrapper.cancel();
               wrapper();
               jasmine.clock().tick( 1000 );
            } );

            it( 'never runs the debouncee', () => {
               expect( debouncee.calls.count() ).toEqual( 0 );
            } );

         } );

         //////////////////////////////////////////////////////////////////////////////////////////////////

         describe( 'and canceled immediately after calling, then waiting for 1s', () => {

            beforeEach( () => {
               wrapper();
               wrapper.cancel();
               jasmine.clock().tick( 1000 );
            } );

            it( 'runs the debouncee 1x total', () => {
               expect( debouncee.calls.count() ).toEqual( 1 );
            } );

         } );

         //////////////////////////////////////////////////////////////////////////////////////////////////

         describe( 'and called once before waiting for 499ms', () => {

            beforeEach( () => {
               wrapper();
               jasmine.clock().tick( 499 );
            } );

            it( 'runs the debouncee 1x total', () => {
               expect( debouncee.calls.count() ).toEqual( 1 );
            } );

         } );

         //////////////////////////////////////////////////////////////////////////////////////////////////

         describe( 'and called 2x before waiting for 500ms', () => {
            beforeEach( () => {
               wrapper();
               wrapper();
               jasmine.clock().tick( 500 );
            } );

            it( 'runs the debouncee 1x total', () => {
               expect( debouncee.calls.count() ).toEqual( 1 );
            } );

            describe( 'and called 3x within 300ms, then waiting for 200ms', () => {
               beforeEach( () => {
                  jasmine.clock().tick( 100 );
                  wrapper();
                  jasmine.clock().tick( 100 );
                  wrapper();
                  jasmine.clock().tick( 100 );
                  wrapper();
                  jasmine.clock().tick( 200 );
               } );

               it( 'runs the debouncee 1x total', () => {
                  expect( debouncee.calls.count() ).toEqual( 2 );
               } );

               describe( 'and then waiting for 299ms', () => {
                  beforeEach( () => {
                     jasmine.clock().tick( 299 );
                  } );

                  it( 'runs the debouncee 1x total', () => {
                     expect( debouncee.calls.count() ).toEqual( 2 );
                  } );
               } );

               describe( 'and then waiting for 300ms', () => {
                  beforeEach( () => {
                     jasmine.clock().tick( 300 );
                  } );

                  it( 'runs the debouncee 2x total', () => {
                     expect( debouncee.calls.count() ).toEqual( 2 );
                  } );
               } );
            } );

            describe( 'and not called again before waiting for 500ms', () => {
               beforeEach( () => {
                  jasmine.clock().tick( 500 );
               } );

               it( 'runs the debouncee 1x total', () => {
                  expect( debouncee.calls.count() ).toEqual( 1 );
               } );
            } );
         } );

      } );

      /////////////////////////////////////////////////////////////////////////////////////////////////////

      describe( 'asked to debounce a function with a wait of 0ms and immediate execution', () => {

         beforeEach( () => {
            wrapper = fn.debounce( debouncee, 0, true );
         } );

         afterEach( () => {
            wrapper.cancel();
         } );

         describe( 'and called 6x within 3ms', () => {
            beforeEach( () => {
               wrapper( 'A' );
               wrapper( 'X' );
               jasmine.clock().tick( 1 );
               wrapper( 'B' );
               wrapper( 'Y' );
               jasmine.clock().tick( 1 );
               wrapper( 'C' );
               wrapper( 'Z' );
               jasmine.clock().tick( 1 );
            } );

            it( 'runs the debouncee 3x total', () => {
               expect( debouncee.calls.count() ).toEqual( 3 );
            } );

            it( 'only applies the first call within each millisecond slot', () => {
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
