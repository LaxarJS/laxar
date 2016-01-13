/**
 * Copyright 2016 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
define( [], function() {
   'use strict';

   var senderOptions = { sender: 'AxPageController', deliverToSender: false };
   var subscriberOptions = { subscriber: 'AxPageController' };

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   /**
    * The visibility event manager initializes and coordinates events for widget area visibility.
    *
    * It subscribes to all visibility changes and propagates them to nested widget areas
    * (if applicable). It is not concerned with the resulting DOM-visibility of individual controls:
    * the `axVisibilityService` takes care of that.
    *
    * @return {{initialize: Function}}
    *    a function to trigger initialization of the manager and initial widget visibility
    */
   function create( $q, eventBus ) {

      var exports = {
         initialize: initialize,
         setAreaHelper: setAreaHelper,
         unsubscribe: unsubscribe
      };

      var areaHelper_;
      var ROOT = '';

      function setAreaHelper( areaHelper ) {
         areaHelper_ = areaHelper;
      }

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      function initialize() {
         // broadcast visibility changes in individual widgets to their nested areas
         eventBus.subscribe( 'changeWidgetVisibilityRequest', handleChangeWidgetRequest, subscriberOptions );

         // broadcast visibility changes in widget areas to their nested areas
         eventBus.subscribe( 'changeAreaVisibilityRequest', handleChangeAreaRequest, subscriberOptions );

         implementAreaChange( ROOT, true );
      }

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      function handleChangeWidgetRequest( event ) {
         var affectedAreas = areaHelper_.areasInWidget( event.widget );
         var will = [ 'willChangeWidgetVisibility', event.widget, event.visible ].join( '.' );
         var did = [ 'didChangeWidgetVisibility', event.widget, event.visible ].join( '.' );

         eventBus.publish( will, event, senderOptions );

         $q.all( ( affectedAreas || [] ).map( event.visible ? show : hide ) )
            .then( function() {
               eventBus.publish( did, event, senderOptions );
            } );
      }

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      function handleChangeAreaRequest( event ) {
         return initiateAreaChange( event.area, event.visible );
      }

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      function show( area ) {
         return requestAreaChange( area, true );
      }

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      function hide( area ) {
         return requestAreaChange( area, false );
      }

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

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
       */
      function requestAreaChange( area, visible ) {
         var request = [ 'changeAreaVisibilityRequest', area ].join( '.' );
         var event = { area: area, visible: visible };
         return eventBus.publishAndGatherReplies( request, event, senderOptions )
            .then( function( responses ) {
               if( responses.length === 0 ) {
                  // no one took responsibility, so the event manager determines visibility by area nesting
                  return initiateAreaChange( area, visible );
               }
               // assume the first 'did'-response to be authoritative:
               var response = responses[ 0 ];
               return implementAreaChange( area, response.event.visible );
            } );
      }

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      /**
       * Set the new visibility state for the given area, then issue requests for the child areas.
       * Inform the area helper so that it may compile and attach the templates of any newly visible
       * widgets.
       */
      function initiateAreaChange( area, visible ) {
         var will = [ 'willChangeAreaVisibility', area, visible ].join( '.' );
         var event = { area: area, visible: visible };
         eventBus.publish( will, event, senderOptions )
            .then( function() {
               return implementAreaChange( area, visible );
            } )
            .then( function() {
               var did = [ 'didChangeAreaVisibility', area, visible ].join( '.' );
               return eventBus.publish( did, event, senderOptions );
            } );
      }

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      function implementAreaChange( ofArea, areaVisible ) {
         areaHelper_.setVisibility( ofArea, areaVisible );
         var children = areaHelper_.areasInArea( ofArea );
         if( !children ) {
            return $q.when();
         }

         return $q.all( children.map( areaVisible ? show : hide ) );
      }

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      function unsubscribe() {
         eventBus.unsubscribe( handleChangeAreaRequest );
         eventBus.unsubscribe( handleChangeWidgetRequest );
      }

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      return exports;

   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   return create;

} );
