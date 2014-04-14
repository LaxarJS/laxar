/**
 * Copyright 2014 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
define( [
   '../object_formatter'
], function( ObjectFormatter ) {
   'use strict';

   describe( 'An object formatter', function() {

      it( 'can be created via its module\'s create method', function() {
         expect( ObjectFormatter ).toBeDefined();
         expect( ObjectFormatter.create() ).toBeDefined();
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'implements the common formatter interface', function() {
         expect( ObjectFormatter.create().format ).toBeDefined();
      } );

      describe( 'instance', function() {

         var formatter;

         beforeEach( function() {
            formatter = ObjectFormatter.create();
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'formats primitive types using JSON.stringify', function() {
            expect( formatter.format( 'A string' ) ).toEqual( '"A string"' );
            expect( formatter.format( 12 ) ).toEqual( '12' );
            expect( formatter.format( null ) ).toEqual( 'null' );
            expect( formatter.format( true ) ).toEqual( 'true' );
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'formats a plain object using JSON.stringify', function() {
            var obj = {
               name: 'Hans',
               age: 67,
               address: {
                  street: 'Parkwaydrive 12'
               }
            };

            expect( formatter.format( obj ) ).toEqual( JSON.stringify( obj ) );
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'formats an array using JSON.stringify', function() {
            var arr = [ 1, 2, 3 ];

            expect( formatter.format( arr ) ).toEqual( JSON.stringify( arr ) );
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'formats an instance of Error manually', function() {
            var err = new Error();
            var errObj = {};

            // Not the most beautiful kind of test but we need to do the checks for these properties here
            // because not every browser supports each of these and thus would fail a hardcoded test.
            [ 'name', 'message', 'stack' ].forEach( function( prop ) {
               if( prop in err ) {
                  errObj[ prop ] = err[ prop ];
               }
            } );

            expect( formatter.format( err ) ).toEqual( JSON.stringify( errObj ) );
         } );

      } );

   } );

} );