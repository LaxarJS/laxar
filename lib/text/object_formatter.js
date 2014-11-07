/**
 * Copyright 2014 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
define( [], function() {
   'use strict';

   var objectFormatter = {

      format: function( value, genericFormat ) {
         if( value instanceof Error ) {
            return formatError( value );
         }

         return JSON.stringify( value );
      }

   };

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function formatError( err ) {
      var errObj = {};
      [ 'name', 'message', 'stack' ].forEach( function( prop ) {
         if( prop in err ) {
            errObj[ prop ] = err[ prop ];
         }
      } );

      return JSON.stringify( errObj );
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   return {

      create: function() {
         return objectFormatter;
      }

   };

} );