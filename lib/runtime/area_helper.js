/**
 * Copyright 2016 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
import { forEach } from '../utilities/object';

/**
 * The area helper manages widget areas, their DOM representation and their nesting structure.
 *
 * It tracks widget area visibility in order to compile widgets and to attach them to their areas when
 * these become visible.
 * It does not interact with the event bus directly, but is consulted by the visibility event manager to
 * determine area nesting for visibility events.
 */

export function create( page, log ) {

   const exports = {
      isVisible,
      setVisibility,
      areasInArea,
      areasInWidget,
      register,
      exists,
      attachWidgets
   };

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   // all initially visible widgets should be attached together, to reduce jitter and unnecessary DOM ops
   let freeToAttach = false;

   // keep the dom element for each area, to attach widgets to
   const areaToElement = {};

   // track widget adapters waiting for their area to become available so that they may attach to its DOM
   const areaToWaitingAdapters = {};

   // track the visibility status of all areas
   const knownVisibilityState = {};

   // the containing area name for each widget
   const widgetIdToArea = {};
   forEach( page.areas, ( widgets, areaName ) => {
      widgets.forEach( widget => {
         widgetIdToArea[ widget.id ] = areaName;
      } );
   } );

   // for each widget with children, and each widget area with nested areas, store a list of child names
   const areasInAreaMap = {};
   const areasInWidgetMap = {};
   forEach( page.areas, ( widgetEntries, areaName ) => {
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

   function isVisible( areaName ) {
      return knownVisibilityState[ areaName ] || false;
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function setVisibility( areaName, visible ) {
      if( visible && freeToAttach ) {
         attachWaitingAdapters( areaName );
      }
      knownVisibilityState[ areaName ] = visible;
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
    * @param {String} [localName]
    *    the area name as used within the widget. Defaults to the qualified `name`
    *
    * @return {Function}
    *    removes the according area from the registry again
    */
   function register( name, element, localName ) {
      if( name in areaToElement ) {
         throw new Error( `The area "${name}" is defined twice.` );
      }

      if( !element.hasAttribute( 'data-ax-widget-area' ) && !element.hasAttribute( 'ax-widget-area' ) ) {
         element.setAttribute( 'data-ax-widget-area', localName || name );
      }
      areaToElement[ name ] = element;
      if( freeToAttach && isVisible( name ) ) {
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
      forEach( page.areas, ( widgets, areaName ) => {
         if( isVisible( areaName ) ) {
            attachWaitingAdapters( areaName );
         }
      } );
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   // eslint-disable-next-line valid-jsdoc
   /** @private */
   function attachWaitingAdapters( areaName ) {
      const waitingAdapters = areaToWaitingAdapters[ areaName ];
      if( !waitingAdapters || !waitingAdapters.length ) { return; }

      const element = areaToElement[ areaName ];
      if( !element ) { return; }

      // Only to have the context for error logging
      let currentAdapterRef = null;
      // Make sure that all assets are available before proceeding, so that DOM update happens en bloc.
      Promise.all( waitingAdapters.map( adapterRef => adapterRef.templatePromise ) )
         .then( htmlTemplates => {
            waitingAdapters.forEach( ( adapterRef, i ) => {
               currentAdapterRef = adapterRef;
               adapterRef.adapter.domAttachTo( element, htmlTemplates[ i ] );
            } );
         } )
         .catch( err => {
            log.error( 'An error occured while attaching some widgets to the DOM:' );
            log.error( `  - Widget ID: ${currentAdapterRef.id}` );
            log.error( `  - Widget Area: ${areaName}` );
            log.error( '  - Original error: [0]', err );
         } );

      delete areaToWaitingAdapters[ areaName ];
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   return exports;

}

//////////////////////////////////////////////////////////////////////////////////////////////////////////////

export function findWidgetAreas( rootElement ) {
   const areas = {};
   Array.from( rootElement.querySelectorAll( '[ax-widget-area],[data-ax-widget-area]' ) )
      .forEach( elem => {
         const name = elem.getAttribute( 'ax-widget-area' ) || elem.getAttribute( 'data-ax-widget-area' );

         areas[ name ] = elem;
      } );
   return areas;
}
