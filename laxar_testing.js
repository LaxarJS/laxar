/**
 * Copyright 2015 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
define( [
   './laxar',
   './lib/testing/testing'
], function( ax, testing ) {
   'use strict';

   function LaxarTesting() {
      this.testing = testing;
   }
   LaxarTesting.prototype = ax;

   return new LaxarTesting();

} );
