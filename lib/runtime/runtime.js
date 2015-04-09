/**
 * Copyright 2014 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
define( [
   'angular',
   '../utilities/path',
   '../loaders/paths'
], function( ng, path, paths ) {
   'use strict';

   var module = ng.module( 'axPortal', [] );

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   // Patching AngularJS with more aggressive scope destruction and memory leak prevention
   module.run( [ '$rootScope', '$window', function( $rootScope, $window ) {
      ng.element( $window ).one( 'unload', function() {
         while( $rootScope.$$childHead ) {
            $rootScope.$$childHead.$destroy();
         }
         $rootScope.$destroy();
      } );
   } ] );

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   // Initialize the theme manager
   module.run( [ 'axCssLoader', 'axThemeManager', function( CssLoader, themeManager ) {
      themeManager
         .urlProvider( path.join( paths.THEMES, '[theme]' ), paths.DEFAULT_THEME )
         .provide( [ 'css/theme.css' ] )
         .then( function( files ) {
            CssLoader.load( files[0] );
         } );
   } ] );

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   // Initialize i18n for i18n controls in non-i18n widgets
   module.run( [ '$rootScope', 'axConfiguration', function( $rootScope, configuration ) {
      $rootScope.i18n = {
         locale: 'default',
         tags: configuration.get( 'i18n.locales' )
      };
   } ] );

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   return module;

} );
