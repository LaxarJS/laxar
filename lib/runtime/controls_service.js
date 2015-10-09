/**
 * Copyright 2015 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
/**
 * The controls service helps to lookup control assets and implementations.
 * It should be used via dependency injection as the *axControls* service.
 *
 * @module controls_service
 */
define( [
   '../utilities/path',
   '../utilities/string',
   '../loaders/paths'
], function( path, string, paths ) {
   'use strict';

   return {
      create: create
   };

   function create( fileResourceProvider ) {

      var notDeclaredMessage =
         'Tried to load control reference [0] without declaration in widget.json.\nDetails: [1]';
      var missingDescriptorMessage =
         'Cannot use axControls service to load control [0] without descriptor.\nDetails: [1]';
      var errorInfoLink =
         'https://github.com/LaxarJS/laxar/blob/master/docs/manuals/providing_controls.md#compatibility';

      var descriptors = {};
      var descriptorPromises = {};

      return {
         load: load,
         provide: provide,
         resolve: resolve,
         descriptor: descriptor
      };

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      /**
       * Provides the implementation module of the given control, for manual instantiation by a widget.
       *
       * Because the method must return synchronously, it may only be called for controls that have been
       * loaded before (using `load`)!
       *
       * @param {String} controlRef
       *   a valid control reference as used in the `widget.json`
       * @return {*}
       *   the AMD module for the requested control reference
       */
      function provide( controlRef ) {
         var resolvedControlPath = resolve( controlRef );
         var descriptor = descriptors[ resolvedControlPath ];
         if( !descriptor ) {
            fail( notDeclaredMessage );
         }
         if( descriptor._compatibility_0x ) {
            fail( missingDescriptorMessage );
         }

         var amdControlRef = path.extractScheme( controlRef ).ref;
         return require( path.join( amdControlRef, descriptor.name ) );

         function fail( reason ) {
            var message = string.format( 'axControls: ' + reason, [ controlRef, errorInfoLink ] );
            throw new Error( message );
         }
      }

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      /**
       * Fetches the descriptor for a given control reference, and saves it as a side-effect.
       * This is part of the internal API used by the widget loader.
       *
       * This process must be completed before the descriptor or the module for a control can be provided.
       * For this reason, `load` is called by the widget-loader, using information from the `widet.json`.
       *
       * For backward-compatibility, missing descriptors are synthesized.
       *
       * @return {Promise}
       *   A promise for the (fetched or synthesized) control descriptor.
       *
       * @private
       */
      function load( controlRef ) {
         // By appending a path now and .json afterwards, 'help' RequireJS to generate the
         // correct descriptor path when loading from a 'package'.
         var resolvedPath = resolve( controlRef );
         if( !descriptorPromises[ resolvedPath ] ) {
            var descriptorUrl = path.join( resolvedPath, 'control.json' );
            descriptorPromises[ resolvedPath ] = fileResourceProvider
               .provide( descriptorUrl )
               .catch( function() {
                  // LaxarJS 0.x style (no control.json): generate descriptor
                  return {
                     _compatibility_0x: true,
                     name: controlRef.split( '/' ).pop(),
                     integration: { technology: 'angular' }
                  };
               } )
               .then( function( descriptor ) {
                  descriptors[ resolvedPath ] = descriptor;
                  return descriptor;
               } );
         }
         return descriptorPromises[ resolvedPath ];
      }

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      /**
       * Takes a control reference and resolves it to a URL.
       * This is part of the internal API used by the widget loader.
       *
       * @param {String} controlRef
       *   a valid control reference as used in the `widget.json`
       * @return {String}
       *   the url under which the `control.json` should be found
       *
       * @private
       */
      function resolve( controlRef ) {
         return path.resolveAssetPath( controlRef, paths.CONTROLS );
      }

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      /**
       * Gets the (previously loaded) descriptor for a widget reference.
       * This is part of the internal API used by the widget loader.
       *
       * @param controlRef
       *   a valid control referenceas used in the `widget.json`
       * @return {Object}
       *   The control descriptor.
       *
       * @private
       */
      function descriptor( controlRef ) {
         var resolvedControlPath = resolve( controlRef );
         return descriptors[ resolvedControlPath ];
      }
   }

} );