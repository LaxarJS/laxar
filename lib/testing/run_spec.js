/**
 * Copyright 2014 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
define( [
   'jquery',
   'angular-mocks',
   '../utilities/path'
], function( $, angularMocks, path ) {
   'use strict';

   var PATH_SEPARATOR = '/';

   function runSpec( laxarSpec, jasmineEnv ) {
      if( laxarSpec.title ) {
         document.title = laxarSpec.title;
      }

      var baseUrl = resolve( laxarSpec.requireConfig.baseUrl ) + PATH_SEPARATOR;
      var specUrl = laxarSpec.specUrl || dirname( window.location.href );

      if( typeof jasmineEnv === 'undefined' ) {
         jasmineEnv = jasmine.getEnv();

         var htmlReporter = new jasmine.HtmlReporter();

         jasmineEnv.addReporter( htmlReporter );
         jasmineEnv.specFilter = function( spec ) {
            return htmlReporter.specFilter( spec );
         };
      }

      if( specUrl.substr( 0, baseUrl.length ) !== baseUrl ) {
         // window.location.href should start with the require baseUrl ...
         throw new Error( 'expected spec URL to start with ' + baseUrl );
      }

      var specBase = specUrl.substr( baseUrl.length );
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
      return file.substr( 0, file.lastIndexOf( PATH_SEPARATOR ) );
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function resolve( file ) {
      if( /^([a-z]+:\/\/|\/)/.test( file ) ) {
         /* starts with a slash or protocol */
         return path.normalize( file );
      }
      return path.join( dirname( window.location.pathname ), file);
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   return runSpec;

} );
