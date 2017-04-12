/**
 * Copyright 2016 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
/**
 * A module for compatibility with old LaxarJS tooling.
 *
 * @module pages
 */

export const FLAT = 'FLAT';
export const COMPACT = 'COMPACT';

export function create( tooling ) {
   const listeners = [];
   let pageInfo;

   function onChange( event ) {
      pageInfo = getPageInfo( event );
      listeners.forEach( callback => { callback( pageInfo ); } );
   }

   /**
    * @constructor
    * @name PagesTooling
    */
   return {
      /**
       * Start collecting page/composition data.
       * @memberof PagesTooling
       */
      enable() {
         tooling.unsubscribe( onChange );
         tooling.onChange( onChange );
      },

      /**
       * Stop collecting page/composition data.
       * @memberof PagesTooling
       */
      disable() {
         tooling.unsubscribe( onChange );
      },

      /**
       * Access the current page information.
       * Everything is returned as a copy, sothis object cannot be used to modify the host application.
       *
       * @return {Object}
       *   the current page information, with the following properties:
       *    - `pageDefinitions` {Object}
       *       both the original as well as the expanded/flattened page model for each available page
       *    - `compositionDefinitions` {Object}
       *       both the original as well as the expanded/flattened composition model for each composition of
       *       any available page
       *    - `widgetDescriptors` {Object}
       *       the widget descriptor for each widget that was referenced
       *    - `pageReference` {String}
       *       the reference for the current page, to lookup page/composition definitions
       * @memberof PagesTooling
       */
      current() {
         return pageInfo;
      },

      /**
       * Add a listener function to be notified whenever the page information changes.
       * As a side-effect, this also automatically enables collecting page/composition data.
       * Each listener will be delivered its own copy of the page information.
       *
       * @param {Function} callback
       *    The listener to add. Will be called with the current page information whenever that changes.
       * @memberof PagesTooling
       */
      addListener( callback ) {
         listeners.push( callback );
      },

      /**
       * Remove a page information listener function.
       *
       * @param {Function} callback
       *    The listener to remove
       * @memberof PagesTooling
       */
      removeListener( callback ) {
         let index;
         while( ( index = listeners.indexOf( callback ) ) >= 0 ) {
            listeners.splice( index, 1 );
         }
      }
   };
}

/**
 * Generate the "old" page info object from the debug info in the onChange event.
 *
 * @param {String} event
 *   the data received from the toolings onChange handler
 *
 * @return {Object} the page information
 * @private
 */
function getPageInfo( event ) {
   const pageDefinitions = {};
   const compositionDefinitions = {};
   const widgetDescriptors = {};

   let pageReference;

   Object.keys( event.pages ).forEach( ref => {
      const page = event.pages[ ref ];

      pageReference = ref;
      pageDefinitions[ ref ] = definitions( page );
      compositionDefinitions[ ref ] = {};

      page.compositions.forEach( composition => {
         compositionDefinitions[ ref ][ composition.id ] = definitions( composition );
      } );
   } );

   Object.keys( event.widgets ).forEach( ref => {
      const widget = event.widgets[ ref ];

      widgetDescriptors[ ref ] = widget.DESC;
   } );

   return {
      pageDefinitions,
      pageReference,
      compositionDefinitions,
      widgetDescriptors
   };

   function definitions( info ) {
      return {
         [ FLAT ]: info.FLAT,
         [ COMPACT ]: info.COMPACT
      };
   }
}

