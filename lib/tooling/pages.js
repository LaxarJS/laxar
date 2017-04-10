export const FLAT = 'FLAT';
export const COMPACT = 'COMPACT';

export function create( tooling ) {
   const listeners = [];
   let pageInfo;

   tooling.onChange( event => {
      pageInfo = getPageInfo( event );
      notifyListeners( pageInfo );
   } );

   function notifyListeners( pageInfo ) {
      listeners.forEach( callback => { callback( pageInfo ); } );
   }

   return {
      enable() {},
      disable() {},
      current() {
         return pageInfo;
      },
      addListener( callback ) {
         listeners.push( callback );
      },
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

