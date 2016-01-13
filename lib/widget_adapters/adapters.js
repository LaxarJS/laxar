/**
 * Copyright 2016 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
define( [
   './plain_adapter',
   './angular_adapter'
], function( plainAdapter, angularAdapter ) {
   'use strict';

   var adapters = {};
   adapters[ plainAdapter.technology ] = plainAdapter;
   adapters[ angularAdapter.technology ] = angularAdapter;

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   return {

      getFor: function( technology ) {
         return adapters[ technology ];
      },

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      getSupportedTechnologies: function() {
         return Object.keys( adapters );
      },

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      addAdapters: function( additionalAdapters ) {
         additionalAdapters.forEach( function( adapter ) {
            adapters[ adapter.technology ] = adapter;
         } );
      }

   };

} );
