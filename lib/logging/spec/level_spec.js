/**
 * Copyright 2014 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
define( [
   '../level'
], function( level ) {
   'use strict';

   describe( 'level', function() {

      it( 'defines a set of log levels with increasing threshold', function() {
         var i = 0;

         expect( level.DEVELOP ).toBe( i++ );
         expect( level.DATA ).toBe( i++ );
         expect( level.TRACE ).toBe( i++ );
         expect( level.DEBUG ).toBe( i++ );
         expect( level.INFO ).toBe( i++ );
         expect( level.WARN ).toBe( i++ );
         expect( level.ERROR ).toBe( i++ );
         expect( level.FATAL ).toBe( i++ );
         expect( level.STATISTICS ).toBe( i++ );
         expect( level.ACCOUNT ).toBe( i++ );
         expect( level.AUDIT ).toBe( i++ );
      } );

   } );

} );