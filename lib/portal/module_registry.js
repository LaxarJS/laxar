/**
 * Copyright 2014 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
define( [
   'angular'
], function( ng ) {
   'use strict';

   var registry = {};

   var module = ng.module( 'laxar.portal.module_registry', [] )
      .factory( function() {

         return {
            registerModule: registerModule,
            getModule: getModule
         };

      } );

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function getModule( technology, name ) {
      if( technology in registry ) {
         return registry[ technology ][ name ] || null;
      }

      return null;
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function registerModule( technology, module ) {
      if( !( technology in registry ) ) {
         registry[ technology ] = {};
      }

      registry[ technology ][ module.name ] = module;
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function bootstrapDependencies() {
      if( 'angular' in registry ) {
         return Object.keys( registry.angular );
      }

      return [];
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   return {
      registerModule: registerModule,
      getModule: getModule,
      bootstrapDependencies: bootstrapDependencies,
      module: module
   };

} );
