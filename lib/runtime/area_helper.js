/**
 * Copyright 2015 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
define( [
   'angular'
], function( ng ) {
   'use strict';

   /**
    * The area helper manages widget areas, their DOM representation and their nesting structure.
    *
    * It tracks widget area visibility in order to compile widgets and to attach them to their areas when
    * these become visible. It also tells the visibility service when change handlers need to be run. It does
    * not interact with the event bus directly, but is consulted by the visibility manager to determine area
    * nesting for visibility events.
    */
   function create( q, page, visibilityService ) {

      var exports = {
         setVisibility: setVisibility,
         areasInArea: areasInArea,
         areasInWidget: areasInWidget,
         register: register,
         exists: exists,
         attachWidgets: attachWidgets
      };

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      // forget about any visibility handlers/state from a previous page
      visibilityService._reset();

      // all initially visible widgets should be attached together, to reduce jitter and unnecessary DOM ops
      var freeToAttach = false;

      // keep the dom element for each area, to attach widgets to
      var areaToElement = {};

      // track widget adapters waiting for their area to become available so that they may attach to its DOM
      var areaToWaitingAdapters = {};

      // the area name for each widget
      var widgetIdToArea = {};
      ng.forEach( page.areas, function( widgets, areaName ) {
         widgets.forEach( function( widget ) {
            widgetIdToArea[ widget.id ] = areaName;
         } );
      } );

      // for each widget with children, and each widget area with nested areas, store a list of child names
      var areasInAreaMap = {};
      var areasInWidgetMap = {};
      ng.forEach( page.areas, function( widgetEntries, areaName ) {
         var containerName = '';
         if( areaName.indexOf( '.' ) !== -1 ) {
            var widgetId = areaName.split( '.' )[ 0 ];
            areasInWidgetMap[ widgetId ] = areasInWidgetMap[ widgetId ] || [];
            areasInWidgetMap[ widgetId ].push( areaName );
            containerName = widgetIdToArea[ widgetId ];
         }
         areasInAreaMap[ containerName ] = areasInAreaMap[ containerName ] || [];
         areasInAreaMap[ containerName ].push( areaName );
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      function setVisibility( areaName, visible ) {
         if( visible && freeToAttach ) {
            attachWaitingAdapters( areaName );
         }
         visibilityService._updateState( areaName, visible );
      }

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      function areasInArea( containerName ) {
         return areasInAreaMap[containerName];
      }

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      function areasInWidget( widgetId ) {
         return areasInWidgetMap[ widgetId ];
      }

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      /**
       * Register a widget area
       *
       * @param {String} name
       *    the area name as used in the page definition
       * @param {HTMLElement} element
       *    an HTML element representing the widget area
       */
      function register( name, element ) {
         if( name in areaToElement ) {
            throw new Error( 'The area "' + name + '" is defined twice in the current layout.' );
         }

         areaToElement[ name ] = element;
         if( freeToAttach && visibilityService.isVisible( name ) ) {
            attachWaitingAdapters( name );
         }
         return function() {
            delete areaToElement[ name ];
         };
      }

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      function exists( name ) {
         return name in areaToElement;
      }

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      function attachWidgets( widgetAdapters ) {
         freeToAttach = true;
         widgetAdapters.forEach( function( adapterRef ) {
            var areaName = widgetIdToArea[ adapterRef.id ];
            areaToWaitingAdapters[ areaName ] = areaToWaitingAdapters[ areaName ] || [];
            areaToWaitingAdapters[ areaName ].push( adapterRef );
         } );
         ng.forEach( page.areas, function( widgets, areaName ) {
            if( visibilityService.isVisible( areaName ) ) {
               attachWaitingAdapters( areaName );
            }
         } );
      }

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      /** @private */
      function attachWaitingAdapters( areaName ) {
         var waitingAdapters = areaToWaitingAdapters[ areaName ];
         if( !waitingAdapters || !waitingAdapters.length ) { return; }
         var element = areaToElement[ areaName ];
         if( !element ) { return; }

         q.all( waitingAdapters.map( function( adapterRef ) {
            // Make sure that all assets are available before proceeding, so that DOM update happens en bloc.
            return adapterRef.templatePromise;
         } ) )
            .then( function( htmlTemplates ) {
               // prepare first/last bootstrap classes for appending widgets
               var currentLast = element.lastChild;
               if( currentLast ) { ng.element( currentLast ).removeClass( 'last' ); }
               var currentFirst = element.firstChild;

               waitingAdapters.forEach( function( adapterRef, i ) {
                  adapterRef.adapter.domAttachTo( element, htmlTemplates[ i ] );
               } );

               // fix first/last bootstrap classes as needed
               if( !currentFirst ) {
                  var first = element.firstChild;
                  if( first ) { first.className += ' first'; }
               }
               var last = element.lastChild;
               if( last ) { last.className += ' last'; }
            } );

         delete areaToWaitingAdapters[ areaName ];
      }

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      return exports;

   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   return create;

} );
