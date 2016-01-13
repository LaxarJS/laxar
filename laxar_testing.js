/**
 * Copyright 2016 aixigo AG
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
   ax._tooling.provideQ = function() { return testing.qMock; };
   LaxarTesting.prototype = ax;

   return new LaxarTesting();

} );
