/**
 * Copyright 2016 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
import ng from 'angular';
import { codeIsUnreachable } from '../utilities/assert';
import { join } from '../utilities/path';
import * as paths from '../loaders/paths';

var module = ng.module( 'axRuntime', [] );
var api = {
   provideQ: function() {
      codeIsUnreachable( 'Cannot provide q before AngularJS modules have been set up.' );
   }
};

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
      .urlProvider( join( paths.THEMES, '[theme]' ), null, [ paths.DEFAULT_THEME ] )
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
      tags: configuration.get( 'i18n.locales', { 'default': 'en' } )
   };
} ] );

///////////////////////////////////////////////////////////////////////////////////////////////////////////

// Provide q as a tooling API to make sure all clients see the same mocked version during testing
module.run( [ '$q', function( $q ) {
   api.provideQ = function() {
      return $q;
   };
} ] );

///////////////////////////////////////////////////////////////////////////////////////////////////////////

export default { module, api };
