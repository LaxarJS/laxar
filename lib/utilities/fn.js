/**
 * Copyright 2014 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
define( [ 'underscore' ], function( _ ) {
   'use strict';

   return {
      /**
       * An underscore `debounce` compatible function, which supports mocking in tests.
       * @see http://underscorejs.org/#debounce
       */
      debounce: _.debounce
   };

} );
