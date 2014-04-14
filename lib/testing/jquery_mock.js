/**
 * Copyright 2014 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
define( [
   'jquery'
], function( $ ) {
   'use strict';

   var origMethods = {};

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   /**
    * Mocks the result to a jQuery method call. The mocked result is only returned if `selectorOrElement`
    * matches either the selector or the DOM element the jQuery object was created with.
    *
    * @param {String} method
    *    name of the method to mock the result for
    * @param {String|HTMLElement} selectorOrElement
    *    the selector or DOM element for which the mocked result is returned
    * @param {*} result
    *    the mocked result
    */
   $.mockResult = function( method, selectorOrElement, result ) {
      var callOrigMethod = $.fn[ method ];
      if( !( method in origMethods ) ) {
         origMethods[ method ] = $.fn[ method ];
      }

      $.fn[ method ] = function() {
         // if no selector was set, the jquery object was initialized using a DOM element.
         var compareWith = this.selector ? this.selector : this[0];
         if( compareWith === selectorOrElement ) {
            return result;
         }

         return callOrigMethod.apply( this, arguments );
      };
   };

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   /**
    * Mocks the call to a jQuery method. The mock method is only called if `selectorOrElement` matches either
    * the selector or the DOM element the jQuery object was created with.
    *
    * @param {String} method
    *    name of the method to mock the result for
    * @param {String|HTMLElement} selectorOrElement
    *    the selector or DOM element for which the mocked result is returned
    * @param {Function} mockMethod
    *    the function to call instead of the original one
    */
   $.mockMethod = function( method, selectorOrElement, mockMethod ) {
      var callOrigMethod = $.fn[ method ];
      if( !( method in origMethods ) ) {
         origMethods[ method ] = $.fn[ method ];
      }

      $.fn[ method ] = function() {
         // if no selector was set, the jquery object was initialized using a DOM element.
         var compareWith = this.selector ? this.selector : this[0];
         if( compareWith === selectorOrElement ) {
            return mockMethod.apply( this, arguments );
         }

         return callOrigMethod.apply( this, arguments );
      };
   };

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   /**
    * Removes all mocked methods and results from jQuery and reattaches the original implementations.
    */
   $.mockReset = function() {
      for( var method in origMethods ) {
         if( origMethods.hasOwnProperty( method ) ) {
            $.fn[ method ] = origMethods[ method ];
         }
      }
   };

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   return $;

} );