/**
 * Copyright 2014 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
define( [
   'angular'
], function( ng ) {
   'use strict';

   var module = ng.module( 'axPageFade', [] );

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   var directiveName = 'axPageFade';
   var directive =[ '$window', 'axGlobalEventBus', function( $window, eventBus ) {
      return function( scope, element ) {
         eventBus.subscribe( 'didNavigate', function() {
            $window.setTimeout( function() {
               element.fadeOut( 'fast' );
            }, 100 );
         } );

         eventBus.subscribe( 'endLifecycleRequest', function() {
            element.css( 'display', 'block' );
         } );
      };
   } ];

   module.directive( directiveName, directive );

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   return module;

} );
