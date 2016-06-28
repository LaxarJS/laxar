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
 * these become visible. It also tells the visibility service when change handlers need to be run. It does
 * not interact with the event bus directly, but is consulted by the visibility manager to determine area
 * nesting for visibility events.
 */
export function create( page ) {

   const exports = {
      setVisibility: setVisibility,
      areasInArea: areasInArea,
      areasInWidget: areasInWidget,
      register: register,
      exists: exists,
      attachWidgets: attachWidgets
   };

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   // all initially visible widgets should be attached together, to reduce jitter and unnecessary DOM ops
   let freeToAttach = false;

   // keep the dom element for each area, to attach widgets to
   const areaToElement = {};

   // track widget adapters waiting for their area to become available so that they may attach to its DOM
   const areaToWaitingAdapters = {};

   // the area name for each widget
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

   function setVisibility( areaName, visible ) {
      if( visible && freeToAttach ) {
         attachWaitingAdapters( areaName );
      }
      visibilityHelper.updateState( areaName, visible );
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
      if( freeToAttach && visibilityHelper.isVisible( name ) ) {
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
         if( visibilityHelper.isVisible( areaName ) ) {
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
      Promise.all( waitingAdapters.map( adapterRef => adapterRef.templatePromise ) )
         .then( htmlTemplates => {
            // prepare first/last bootstrap classes for appending widgets
            let children = childrenOf( element );
            const currentLast = children[ children.length - 1 ];
            if( currentLast ) { removeClass( currentLast, 'last' ); }
            const currentFirst = children[ 0 ];

            waitingAdapters.forEach( ( adapterRef, i ) => {
               adapterRef.adapter.domAttachTo( element, htmlTemplates[ i ] );
            } );

            // fix first/last bootstrap classes as needed
            children = childrenOf( element );
            if( !currentFirst ) {
               const first = children[ 0 ];
               if( first ) { addClass( first, 'first' ); }
            }
            const last = children[ children.length - 1 ];
            if( last ) { addClass( last, 'last' ); }
         } );

      delete areaToWaitingAdapters[ areaName ];
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   // TODO: (#309) For now taken from previous axVisibilityService. Perhaps this might be simplified.
   const knownState = {};
   const visibilityHelper = {

      isVisible( area ) {
         return knownState[ area ] || false;
      },

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      /**
       * Run all handlers registered for the given area and target state after the next heartbeat.
       * Also remove any handlers that have been cleared since the last run.
       * @private
       */
      updateState( area, targetState ) {
         knownState[ area ] = targetState;
      }

   };

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   return exports;

}

//////////////////////////////////////////////////////////////////////////////////////////////////////////////

function addClass( element, cssClass ) {
   if( element.classList ) {
      element.classList.add( cssClass );
      return;
   }
   element.className += ` ${cssClass}`;
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////////

function removeClass( element, cssClass ) {
   if( element.classList ) {
      element.classList.remove( cssClass );
      return;
   }
   element.className = element.className
      .split( ' ' )
      .map( c => c.trim() )
      .filter( c => c !== cssClass )
      .join( ' ' );
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////////

function childrenOf( element ) {
   // we are only interested in element nodes
   return Array.from( element.childNodes ).filter( _ => _.nodeType === 1 );
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
