/**
 * Copyright 2016 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
export function create( flowController, router ) {

   return {
      constructAbsoluteUrl
   };

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   /**
    * Constructs an absolute URL to the given target or place using the given parameters. If a target is
    * given as first argument, it is resolved using the currently active place.
    *
    * @param {String} targetOrPlace
    *    the target or place ID to construct a URL for
    * @param {Object} [optionalParameters]
    *    optional map of place parameters. Missing parameters are taken from the parameters that were
    *    passed to the currently active place
    *
    * @return {string}
    *    the generated absolute URL
    *
    * @memberOf axFlowService
    */
   function constructAbsoluteUrl( targetOrPlace, optionalParameters = {} ) {
      const place = flowController.placeForTarget( targetOrPlace );
      return router.constructAbsoluteUrl(
         place.patterns,
         flowController.withoutRedundantParameters( place, optionalParameters )
      );
   }

}
