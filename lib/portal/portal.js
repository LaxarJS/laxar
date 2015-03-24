/**
 * Copyright 2014 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
define( [
   'angular',
   'jquery',
   '../utilities/path',
   './paths'
], function( ng, $, path, paths ) {
   'use strict';

   var module = ng.module( 'axPortal', [] );

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   // Patching AngularJS with more aggressive scope destruction and memory leak prevention
   module.run( [ '$rootScope', '$window', function( $rootScope, $window ) {
      patchScopeDestroy( $rootScope );

      $( $window ).one( 'unload', function() {
         while( $rootScope.$$childHead ) {
            $rootScope.$$childHead.$destroy();
         }
         $rootScope.$destroy();
      } );
   } ] );

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   // Initialize the theme manager
   module.run( [ 'CssLoader', 'ThemeManager', function( CssLoader, themeManager ) {
      themeManager
         .urlProvider( path.join( paths.THEMES, '[theme]' ), paths.DEFAULT_THEME )
         .provide( [ 'css/theme.css' ] )
         .then( function( files ) {
            CssLoader.load( files[0] );
         } );
   } ] );

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   // Initialize i18n for i18n controls in non-i18n widgets
   module.run( [ '$rootScope', 'Configuration', function( $rootScope, configuration ) {
      $rootScope.i18n = {
         locale: 'default',
         tags: configuration.get( 'i18n.locales' )
      };
   } ] );

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   /**
    * Extends the original $destroy of angular 1.0.8 to delete scope properties more aggressively and
    * recursively. This helps to avoid some memory leaks in Chrome and Internet Explorer 8.
    * If GC in these browsers would work correctly, neither the recursion nor the deleting of individual keys
    * would be needed.
    *
    * @private
    */
   function patchScopeDestroy( $rootScope ) {
      var origNew = $rootScope.$new;
      $rootScope.$new = AxNew;

      function AxNew() {
         var child = origNew.apply( this, arguments );
         child.$new = AxNew;
         child.$destroy = function axDestroy() {
            // do not destroy a scope that has already been destroyed
            if( this.$$destroyed ) {
               return;
            }

            this.$broadcast( '$destroy' );
            clearRecursive( this );
         };
         return child;
      }

      // most of this is bogus code that works around Chrome's and MSIE's GC leaks
      // see: https://github.com/angular/angular.js/issues/1313#issuecomment-10378451
      function clearRecursive( scope ) {
         var parent = scope.$parent;
         scope.$$destroyed = true;
         while( scope.$$childHead ) {
            clearRecursive( scope.$$childHead );
         }
         if (parent.$$childHead === scope) { parent.$$childHead = scope.$$nextSibling; }
         if (parent.$$childTail === scope) { parent.$$childTail = scope.$$prevSibling; }
         if (scope.$$prevSibling) { scope.$$prevSibling.$$nextSibling = scope.$$nextSibling; }
         if (scope.$$nextSibling) { scope.$$nextSibling.$$prevSibling = scope.$$prevSibling; }

         scope.$parent = scope.$$nextSibling = scope.$$prevSibling = scope.$$childHead =
            scope.$$childTail = null;

         var keys = Object.keys( scope );
         keys.forEach( function( key ) {
            if( key.indexOf( '$' ) !== 0 ) {
               delete scope[ key ];
            }
         } );
      }

   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   return module;

} );
