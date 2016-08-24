/**
 * Copyright 2016 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
/**
 * The controls loader helps to load control assets and implementations.
 *
 * @module controls_loader
 */
import { format } from '../utilities/string';

export function create( artifactProvider, cssLoader ) {

   const notDeclaredMessage =
      'Tried to load control reference [0] without declaration in widget.json.\nDetails: [1]';
   const errorInfoLink =
      'https://github.com/LaxarJS/laxar/blob/master/docs/manuals/providing_controls.md#compatibility';

   const aliases = {};
   const modules = {};

   return {
      load,
      provide
   };

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   /**
    * Provides the implementation module of the given control, for manual instantiation by a widget.
    *
    * Because the method must return synchronously, it may only be called for controls that have been
    * loaded before (using `load`)!
    *
    * @param {String} controlRef
    *   a valid control reference as used in the `widget.json`
    * @return {*}
    *   the module for the requested control reference
    */
   function provide( controlRef ) {
      const module = modules[ aliases[ controlRef ] ];
      if( !module ) {
         const message = format( `axControls: ${notDeclaredMessage}`, [ controlRef, errorInfoLink ] );
         throw new Error( message );
      }
      return module;
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   // eslint-disable-next-line valid-jsdoc
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
      const { assetUrlForTheme, descriptor, module } = artifactProvider.forControl( controlRef );
      return Promise.all( [ descriptor(), module() ] )
         .then( ([ descriptor, module ]) => {
            const { name } = descriptor;
            aliases[ controlRef ] = name;
            modules[ name ] = module;
            return assetUrlForTheme( descriptor.styleSource || `css/${name}.css` )
               .then( url => {
                  if( url ) {
                     cssLoader.load( url );
                  }
               } )
               .then( () => descriptor );
         } );
   }

}
