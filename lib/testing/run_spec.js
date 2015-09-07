/**
 * Copyright 2015 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
define( [
   'require',
   'jquery',
   'angular-mocks',
   '../utilities/path'
], function( require, $, angularMocks, path, paths ) {
   'use strict';

   function runSpec( laxarSpec, jasmineEnv ) {
      if( laxarSpec.title ) {
         document.title = laxarSpec.title;
      }

      var specUrl = laxarSpec.specUrl || dirname( window.location.href );
      var widgetJsonUrl = (typeof laxarSpec.widgetJson === 'undefined' || laxarSpec.widgetJson === true) ?
                          path.join( specUrl, '..', 'widget.json' ) :
                          laxarSpec.widgetJson && path.join( specUrl, laxarSpec.widgetJson );

      var specBase = path.relative( require.toUrl('.'), specUrl );
      var specPrefix = (specBase[0] !== '.') ? './' : '';

      var tests = laxarSpec.tests.map( function( test ) {
         return specPrefix + path.join( specBase, test );
      } );

      if( typeof jasmineEnv === 'undefined' ) {
         jasmineEnv = jasmine.getEnv();

         var htmlReporter = new jasmine.HtmlReporter();

         jasmineEnv.addReporter( htmlReporter );
         jasmineEnv.specFilter = function( spec ) {
            return htmlReporter.specFilter( spec );
         };
      }

      if( widgetJsonUrl ) {
         loadControls( widgetJsonUrl ).then( requireAndRunSpecs );
      } else {
         requireAndRunSpecs( [] );
      }

      function requireAndRunSpecs( controls ) {
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
      }

   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function loadControls( widgetJsonUrl ) {
      return $.getJSON( widgetJsonUrl ).then( function( widgetJson ) {
         return ( widgetJson && widgetJson.controls ) || [];
      }, function() {
         return $.when( [] );
      } ).then( function( controlReferences ) {
         // Poor man's $q.all:
         var results = [];
         return controlReferences.reduce( function( acc, ref ) {
            // By appending .json afterwards, trick RequireJS into generating the correct descriptor path when
            // loading from a 'package'.
            var url =  require.toUrl( ref + '/control' ) + '.json';
            return acc.then( function() {
               return $.getJSON( url ).then( function( controlJson ) {
                  results.push( ref + '/' + controlJson.name );
               }, function() {
                  results.push( ref );
                  return $.when();
               } );
            } );
         }, $.when() ).then( function() {
            return results;
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
