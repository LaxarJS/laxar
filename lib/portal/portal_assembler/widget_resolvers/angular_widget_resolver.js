/**
 * Copyright 2014 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
define( [
   'require',
   '../../../utilities/assert',
   '../../../utilities/path',
   '../../paths'
], function( require, assert, path, paths ) {
   'use strict';

   var themeManager_;
   var q_;
   var widgetRoot_ = paths.WIDGETS;
   var themeRoot_ = paths.THEMES;

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function resolve( widgetSpecificationPath, specification ) {
      var technicalName = widgetSpecificationPath.split( '/' ).pop();
      var widgetPath = path.join( widgetRoot_, widgetSpecificationPath );
      var htmlFile = technicalName + '.html';
      var cssFile = path.join( 'css/', technicalName + '.css' );
      var controllerName = 'widgets.' + widgetSpecificationPath.replace( /\//g, '.' ) + '.Controller';

      var promises = [];
      promises.push( themeManager_.urlProvider(
         path.join( themeRoot_, '[theme]', 'widgets', widgetSpecificationPath ),
         path.join( widgetPath, '[theme]' )
      ).provide( [ htmlFile, cssFile ] ) );

      promises = promises.concat( ( specification.controls || [] ).map( function( controlReference ) {
         var name = controlReference.split( '/' ).pop();
         return themeManager_.urlProvider(
            path.join( themeRoot_, '[theme]', controlReference ),
            path.join( require.toUrl( controlReference ), '[theme]' )
         ).provide( [ path.join( 'css/', name + '.css' ) ] );
      } ) );

      return q_.all( promises )
         .then( function( results ) {
            var widgetUrls = results[ 0 ];
            var cssUrls = results.slice( 1 )
               .map( function( urls ) { return urls[ 0 ]; } )
               .concat( widgetUrls.slice( 1 ) )
               .filter( function( url ) { return !!url; } );

            return {
               specification: specification,
               includeUrl: widgetUrls[0] || '',
               controllerName: controllerName,
               cssFileUrls: cssUrls
            };
         } );
   }
   
   ///////////////////////////////////////////////////////////////////////////////////////////////////////////
   
   return {

      resolve: resolve,

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      init: function( themeManager, q ) {
         assert( themeManager ).isNotNull( 'Need a theme manager.' );
         assert( q ).isNotNull( 'Need a promise factory implementation conforming to $q' );

         themeManager_ = themeManager;
         q_ = q;
      }

   };
   
} );