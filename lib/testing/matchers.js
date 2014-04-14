/**
 * Copyright 2014 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
define( [], function() {
   'use strict';

   var ANY = {};
   var ANY_REMAINING = {};

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function toContainAllOf( expected ) {
      for( var i=0; i < expected.length; ++i ) {
         /*jshint validthis:true*/
         if( this.actual.indexOf( expected[ i ] ) === -1 ) {
            return false;
         }
      }

      return true;
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function objectsMatch( actual, expected ) {
      for( var key in expected ) {
         if( expected.hasOwnProperty( key ) ) {
            if( !matches( actual[ key ], expected[ key ] ) ) {
               return false;
            }
         }
      }

      for( key in actual ) {
         if( actual.hasOwnProperty( key ) && !expected.hasOwnProperty( key ) ) {
            return false;
         }
      }

      return true;
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function matches( actual, expected ) {
      if( ANY === expected ) {
         return true;
      }

      if( actual === expected ) {
         return true;
      }

      if( typeof expected === 'object' && expected ) {
         return objectsMatch( actual, expected ) ;
      }

      if( Array.isArray( expected ) ) {
         return arraysMatch( actual, expected );
      }

      return false;
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   // NEEDS FIX C: This method shadows jasmine's toMatch method for regular expressions and thus should be
   // renamed.
   function toMatch( expected ) {
      /*jshint validthis:true*/
      return matches( this.actual, expected );
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function arraysMatch( actualElements, expectedElements ) {

      if( !Array.isArray( actualElements ) ) {
         return false;
      }

      var expectedArgument;

      for( var i=0; i < expectedElements.length; ++i ) {
         expectedArgument = expectedElements[ i ];

         if( expectedArgument === ANY ) {
            continue;
         }

         if( expectedArgument === ANY_REMAINING ) {
            return true;
         }

         if( actualElements.length <= i ) {
            return false;
         }

         if( !matches( actualElements[ i ], expectedArgument ) ) {
            return false;
         }
      }

      return true;
   }

   ////////////////////////////////////////////////////////////////////////////////////////////////////////

   function toHaveBeenInvokedWith() {
      /*jshint validthis:true*/
      var calls = this.actual.calls;
      var argumentList = [].slice.call( arguments, 0 );

      for( var i=0; i < calls.length; ++i ) {
         if( arraysMatch( calls[ i ].args, argumentList ) ) {
            return true;
         }
      }

      return false;
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   return  {
      ANY: ANY,
      ANY_REMAINING: ANY_REMAINING,

      /**
       * @param {Object} spec
       *    the spec to add the matchers to
       */
      addTo: function( spec ) {
         spec.addMatchers( {
            toContainAllOf: toContainAllOf,
            toHaveBeenInvokedWith: toHaveBeenInvokedWith,
            toMatch: toMatch
         } );
      }
   };

} );
