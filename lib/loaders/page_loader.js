/**
 * Copyright 2016 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
import assert from '../utilities/assert';

//////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Creates and returns a new page loader instance.
 *
 * @param {ArtifactProvider} artifactProvider
 *    an ArtifactProvider to load application assets
 * @param {EventBus} debugEventBus
 *
 * @return {PageLoader}
 *    a page loader instance
 *
 * @private
 */
export function create( artifactProvider, debugEventBus ) {
   assert( artifactProvider ).isNotNull();
   assert( debugEventBus ).isNotNull();

   return { load };

   /**
    * Loads a pre-assembled page definition. References to compositions, widgets and layouts have been
    * resolved at build-time. Schema-validation for the page itself and for the contained feature
    * configurations has also already been performed.
    *
    * @param {String} pageRef
    *    the page to load. Usually a path relative to the page base path, with the `.json` suffix omitted
    *
    * @return {Promise}
    *    the result promise
    *
    * @private
    */
   function load( pageRef ) {
      const { definition } = artifactProvider.forPage( pageRef );
      return definition().then( pageDefinition => {
         //TODO: debugEventBus;
         debugEventBus.publish( 'page', pageRef );
         return pageDefinition;
      } );
   }
}
