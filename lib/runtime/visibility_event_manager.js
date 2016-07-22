/**
 * Copyright 2016 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
const senderOptions = { sender: 'AxPageController', deliverToSender: false };
const subscriberOptions = { subscriber: 'AxPageController' };

//////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * The visibility event manager initializes and coordinates events for widget area visibility.
 *
 * It subscribes to all visibility changes and propagates them to nested widget areas
 * (if applicable). It is not concerned with the resulting DOM-visibility of individual controls:
 * the `axVisibilityService` takes care of that.
 *
 * @param {EventBus} eventBus
 *    an event bus instance
 * @return {Object}
 *    a function to trigger initialization of the manager and initial widget visibility
 */
export function create( eventBus ) {

   const exports = {
      initialize,
      setAreaHelper,
      unsubscribe
   };

   let areaHelper;
   let unsubscribeFromAreaVisibilityRequest = () => {};
   let unsubscribeFromWidgetVisibilityRequest = () => {};
   const ROOT = '';

   function setAreaHelper( _ ) {
      areaHelper = _;
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function initialize() {
      // broadcast visibility changes in individual widgets to their nested areas
      unsubscribeFromWidgetVisibilityRequest = eventBus.subscribe( 'changeWidgetVisibilityRequest', event => {
         const affectedAreas = areaHelper.areasInWidget( event.widget );
         const will = [ 'willChangeWidgetVisibility', event.widget, event.visible ].join( '.' );
         const did = [ 'didChangeWidgetVisibility', event.widget, event.visible ].join( '.' );

         eventBus.publish( will, event, senderOptions );

         Promise.all( ( affectedAreas || [] ).map( event.visible ? show : hide ) )
            .then( () => eventBus.publish( did, event, senderOptions ) );
      }, subscriberOptions );

      // broadcast visibility changes in widget areas to their nested areas
      unsubscribeFromAreaVisibilityRequest = eventBus.subscribe( 'changeAreaVisibilityRequest', event => {
         return initiateAreaChange( event.area, event.visible );
      }, subscriberOptions );

      return implementAreaChange( ROOT, true );
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function show( area ) {
      return requestAreaChange( area, true );
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function hide( area ) {
      return requestAreaChange( area, false );
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   /**
    * First, publish a `changeAreaVisibilityRequest` to ask if some widget would like to manage the
    * given area's visibility.
    * If no widget responds, self-issue a will/did-response to notify interested widgets in the area
    * of their new visibility status.
    * In either case, manage the propagation to nested areas and inform the area helper so that it
    * may compile and attach the templates of any newly visible widgets.
    *
    * @param {String} area
    *    the area whose visibility to update
    * @param {Boolean} visible
    *    the new visibility state of the given area, to the best knowledge of the client
    * @return {Promise}
    *    promise that is resolved after the change request is completed
    */
   function requestAreaChange( area, visible ) {
      const request = [ 'changeAreaVisibilityRequest', area ].join( '.' );
      const event = { area, visible };
      return eventBus.publishAndGatherReplies( request, event, senderOptions )
         .then( responses => {
            if( responses.length === 0 ) {
               // no one took responsibility, so the event manager determines visibility by area nesting
               return initiateAreaChange( area, visible );
            }
            // assume the first 'did'-response to be authoritative:
            const response = responses[ 0 ];
            return implementAreaChange( area, response.event.visible );
         } );
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   // eslint-disable-next-line valid-jsdoc
   /**
    * Set the new visibility state for the given area, then issue requests for the child areas.
    * Inform the area helper so that it may compile and attach the templates of any newly visible
    * widgets.
    */
   function initiateAreaChange( area, visible ) {
      const will = [ 'willChangeAreaVisibility', area, visible ].join( '.' );
      const event = { area, visible };
      return eventBus.publish( will, event, senderOptions )
         .then( () => implementAreaChange( area, visible ) )
         .then( () => {
            const did = [ 'didChangeAreaVisibility', area, visible ].join( '.' );
            return eventBus.publish( did, event, senderOptions );
         } );
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function implementAreaChange( ofArea, areaVisible ) {
      areaHelper.setVisibility( ofArea, areaVisible );
      const children = areaHelper.areasInArea( ofArea );
      if( !children ) {
         return Promise.resolve();
      }

      return Promise.all( children.map( areaVisible ? show : hide ) );
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function unsubscribe() {
      unsubscribeFromWidgetVisibilityRequest();
      unsubscribeFromAreaVisibilityRequest();
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   return exports;

}
