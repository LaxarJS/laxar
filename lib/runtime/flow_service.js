/**
 * Copyright 2016 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */

/**
 * Module providing the flow service factory.
 *
 * @module flow_service
 */

/**
 * Creates a flow service that allows widgets to create valid URLs without knowledge about the current place,
 * its routing patterns, or about the routing implementation.
 *
 * @param {FlowController} flowController
 *    a flow controller, needed to respect default parameter values when generating URLs
 * @param {Router} router
 *    a router instance, to create URLs that can be resolved afterwards
 *
 * @return {FlowService}
 *    a flow service instance
 */
export function create( flowController, router ) {

   /**
    * Creates and returns a new flow service instance from its dependencies.
    *
    * @name FlowService
    * @constructor
    */
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
    *    optional map of place parameters. Missing parameters are filled base on the parameters that were
    *    passed to the currently active place
    *
    * @return {String}
    *    the generated absolute URL
    *
    * @memberof FlowService
    */
   function constructAbsoluteUrl( targetOrPlace, optionalParameters = {} ) {
      const place = flowController.placeForTarget( targetOrPlace );
      return router.constructAbsoluteUrl(
         place.patterns,
         flowController.withoutRedundantParameters( place, optionalParameters )
      );
   }

}
