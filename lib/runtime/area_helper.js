/**
 * Copyright 2016 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
import ng from 'angular';

/**
 * The area helper manages widget areas, their DOM representation and their nesting structure.
 *
 * It tracks widget area visibility in order to compile widgets and to attach them to their areas when
 * these become visible. It also tells the visibility service when change handlers need to be run. It does
 * not interact with the event bus directly, but is consulted by the visibility manager to determine area
 * nesting for visibility events.
 */
export function create( q, page, visibilityService ) {

   const exports = {
      setVisibility: setVisibility,
      areasInArea: areasInArea,
      areasInWidget: areasInWidget,
      register: register,
      exists: exists,
      attachWidgets: attachWidgets
   };

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   // forget about any visibility handlers/state from a previous page
   visibilityService._reset();

   // all initially visible widgets should be attached together, to reduce jitter and unnecessary DOM ops
   let freeToAttach = false;

   // keep the dom element for each area, to attach widgets to
   const areaToElement = {};

   // track widget adapters waiting for their area to become available so that they may attach to its DOM
   const areaToWaitingAdapters = {};

   // the area name for each widget
   const widgetIdToArea = {};
   ng.forEach( page.areas, ( widgets, areaName ) => {
      widgets.forEach( widget => {
         widgetIdToArea[ widget.id ] = areaName;
      } );
   } );

   // for each widget with children, and each widget area with nested areas, store a list of child names
   const areasInAreaMap = {};
   const areasInWidgetMap = {};
   ng.forEach( page.areas, ( widgetEntries, areaName ) => {
      let containerName = '';
      if( areaName.indexOf( '.' ) !== -1 ) {
         const widgetId = areaName.split( '.' )[ 0 ];
         areasInWidgetMap[ widgetId ] = areasInWidgetMap[ widgetId ] || [];
         areasInWidgetMap[ widgetId ].push( areaName );
         containerName = widgetIdToArea[ widgetId ];
      }
      areasInAreaMap[ containerName ] = areasInAreaMap[ containerName ] || [];
      areasInAreaMap[ containerName ].push( areaName );
   } );

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function setVisibility( areaName, visible ) {
      if( visible && freeToAttach ) {
         attachWaitingAdapters( areaName );
      }
      visibilityService._updateState( areaName, visible );
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function areasInArea( containerName ) {
      return areasInAreaMap[ containerName ];
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function areasInWidget( widgetId ) {
      return areasInWidgetMap[ widgetId ];
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   /**
    * Register a widget area
    *
    * @param {String} name
    *    the area name as used in the page definition
    * @param {HTMLElement} element
    *    an HTML element representing the widget area
    *
    * @return {Function}
    *    removes the according area from the registry again
    */
   function register( name, element ) {
      if( name in areaToElement ) {
         throw new Error( `The area "${name}" is defined twice in the current layout.` );
      }

      areaToElement[ name ] = element;
      if( freeToAttach && visibilityService.isVisible( name ) ) {
         attachWaitingAdapters( name );
      }

      return () => {
         delete areaToElement[ name ];
      };
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function exists( name ) {
      return name in areaToElement;
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function attachWidgets( widgetAdapters ) {
      freeToAttach = true;
      widgetAdapters.forEach( adapterRef => {
         const areaName = widgetIdToArea[ adapterRef.id ];
         areaToWaitingAdapters[ areaName ] = areaToWaitingAdapters[ areaName ] || [];
         areaToWaitingAdapters[ areaName ].push( adapterRef );
      } );
      ng.forEach( page.areas, ( widgets, areaName ) => {
         if( visibilityService.isVisible( areaName ) ) {
            attachWaitingAdapters( areaName );
         }
      } );
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   /** @private */
   function attachWaitingAdapters( areaName ) {
      const waitingAdapters = areaToWaitingAdapters[ areaName ];
      if( !waitingAdapters || !waitingAdapters.length ) { return; }
      const element = areaToElement[ areaName ];
      if( !element ) { return; }

      // Make sure that all assets are available before proceeding, so that DOM update happens en bloc.
      q.all( waitingAdapters.map( adapterRef => adapterRef.templatePromise ) )
         .then( htmlTemplates => {
            // prepare first/last bootstrap classes for appending widgets
            const currentLast = element.lastChild;
            if( currentLast ) { ng.element( currentLast ).removeClass( 'last' ); }
            const currentFirst = element.firstChild;

            waitingAdapters.forEach( ( adapterRef, i ) => {
               adapterRef.adapter.domAttachTo( element, htmlTemplates[ i ] );
            } );

            // fix first/last bootstrap classes as needed
            if( !currentFirst ) {
               const first = element.firstChild;
               if( first ) { first.className += ' first'; }
            }
            const last = element.lastChild;
            if( last ) { last.className += ' last'; }
         } );

      delete areaToWaitingAdapters[ areaName ];
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   return exports;

}

//////////////////////////////////////////////////////////////////////////////////////////////////////////////

export function findWidgetAreas( rootElement ) {
   let areas = {};
   Array.from( rootElement.querySelectorAll( '[ax-widget-area],[data-ax-widget-area]' ) )
      .forEach( elem => {
         const name = elem.getAttribute( 'ax-widget-area' ) || elem.getAttribute( 'data-ax-widget-area' );

         areas[ name ] = elem;
      } );
   return areas;
}
