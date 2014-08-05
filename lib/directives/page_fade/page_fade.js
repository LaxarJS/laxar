/**
 * Copyright 2014 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
define( [
   'angular'
], function( ng ) {
   'use strict';

   var module = ng.module( 'laxar.directives.page_fade', [] );

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   var directiveName = 'axPageFade';
   var directive =[ '$timeout', 'EventBus', function( $timeout, eventBus ) {
      return function( scope, element, attrs ) {
         eventBus.subscribe( 'didNavigate', function() {
            $timeout( function() {
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