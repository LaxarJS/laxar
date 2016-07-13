/**
 * Copyright 2016 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
/**
 * The controls service helps to lookup control assets and implementations.
 * It should be used via dependency injection as the *axControls* service.
 *
 * @module controls_service
 */
import * as path from '../utilities/path';
import { format } from '../utilities/string';

export function create( fileResourceProvider, controlsPath ) {

   const notDeclaredMessage =
      'Tried to load control reference [0] without declaration in widget.json.\nDetails: [1]';
   const missingDescriptorMessage =
      'Cannot use axControls service to load control [0] without descriptor.\nDetails: [1]';
   const errorInfoLink =
      'https://github.com/LaxarJS/laxar/blob/master/docs/manuals/providing_controls.md#compatibility';

   const descriptors = {};
   const descriptorPromises = {};

   return {
      load,
      provide,
      resolve,
      descriptor
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
      const resolvedControlPath = resolve( controlRef );
      const descriptor = descriptors[ resolvedControlPath ];
      if( !descriptor ) {
         fail( notDeclaredMessage );
      }
      if( descriptor._compatibility_0x ) {
         fail( missingDescriptorMessage );
      }

      // TODO (#304): stubbed out for now. We'll need to handle controls similar to widgets, by registering
      // their modules in laxar.bootstrap
      return Promise.resolve({});

      function fail( reason ) {
         const message = format( 'axControls: ' + reason, [ controlRef, errorInfoLink ] );
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
      const resolvedPath = resolve( controlRef );
      if( !descriptorPromises[ resolvedPath ] ) {
         const descriptorUrl = path.join( resolvedPath, 'control.json' );
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
      return path.resolveAssetPath( controlRef, controlsPath );
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
      const resolvedControlPath = resolve( controlRef );
      return descriptors[ resolvedControlPath ];
   }
}
