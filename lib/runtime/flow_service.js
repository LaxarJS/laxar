/**
 * Copyright 2016 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
/**
 * Module providing the FlowService factory.
 *
 * To access the FlowService in a widget, request the {@link widget_services#axFlowService axFlowService}
 * injection.
 *
 * @module flow_service
 */

/**
 * Creates a flow service backed by the given flow controller.
 *
 * @param {FlowController} flowController
 *    a flow controller, needed to respect default parameter values when generating URLs
 *
 * @return {FlowService}
 *    a flow service instance
 *
 * @private
 */
export function create( flowController ) {

   /**
    * Allows widgets to create valid URLs without knowledge about the current place, its routing patterns, or
    * about the actual routing implementation.
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
      return flowController.constructAbsoluteUrl( targetOrPlace, optionalParameters );
   }

}
