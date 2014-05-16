/**
 * Copyright 2014 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
define( [
   'require',
   'jquery',
   'angular-mocks',
   '../utilities/path'
], function( require, $, angularMocks, path ) {
   'use strict';

   function runSpec( laxarSpec, jasmineEnv ) {
      if( laxarSpec.title ) {
         document.title = laxarSpec.title;
      }

      var specUrl = laxarSpec.specUrl || dirname( window.location.href );

      if( typeof jasmineEnv === 'undefined' ) {
         jasmineEnv = jasmine.getEnv();

         var htmlReporter = new jasmine.HtmlReporter();

         jasmineEnv.addReporter( htmlReporter );
         jasmineEnv.specFilter = function( spec ) {
            return htmlReporter.specFilter( spec );
         };
      }

      var specBase = path.relative( require.toUrl('.'), specUrl );
      var widgetJsonUrl = path.join( specUrl, '..', 'widget.json' );
      $.getJSON( widgetJsonUrl ).then( function( widgetJson ) {
         return ( widgetJson && widgetJson.controls ) || [];
      }, function() {
         return $.when( [] );
      } )
      .then( function( controls ) {
         var tests = laxarSpec.tests.map( function( test ) {
            return path.join( specBase, test );
         } );
         var requirements = controls.concat( tests );
         require( requirements, function() {
            var controlModules = [].slice.call( arguments, 0, controls.length );
            jasmineEnv.beforeEach( function() {
               controlModules.forEach( function( _ ) {
                  angularMocks.module( _.name );
               } );
            } );
            jasmineEnv.execute();
         } );
      } );

   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function dirname( file ) {
      return file.substr( 0, file.lastIndexOf( '/' ) );
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   return runSpec;

} );
