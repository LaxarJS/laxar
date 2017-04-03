export const FLAT = 'FLAT';
export const COMPACT = 'COMPACT';

export function create( tooling, debugEventBus ) {
   const listeners = [];
   let debugInfo;

   tooling.whenDebugInfoAvailable( info => {
      debugInfo = info;
      notifyListeners( getPageInfo( debugInfo, currentPage() ) );
   } );

   debugEventBus.subscribe( 'didLoad.page', ( { page } ) => {
      notifyListeners( getPageInfo( debugInfo, page ) );
   } );

   function notifyListeners( pageInfo ) {
      listeners.forEach( callback => { callback( pageInfo ); } );
   }

   function currentPage() {
      const id = Object.keys( tooling.instanceState )[ 0 ];
      if( id && tooling.instanceState[ id ] ) {
         return tooling.instanceState[ id ].page[ 0 ];
      }
      return null;
   }

   return {
      enable() {},
      disable() {},
      current() {
         return getPageInfo( debugInfo, currentPage() );
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
 * Generate the "old" page info object from the `debugInfo` and a page reference.
 * This is mostly static, except the page reference is used for filtering pages
 * and compositions.
 *
 * @param {Object} debugInfo
 *   the debugInfo object provided when bootstrapping
 * @param {String} [pageReference]
 *   only output page definitions and compositions matching the given page reference
 *
 * @return {Object} the page information
 */
function getPageInfo( debugInfo, pageReference ) {
   const pageDefinitions = {};
   const compositionDefinitions = {};
   const widgetDescriptors = {};

   if( debugInfo && debugInfo.aliases ) {
      Object.keys( debugInfo.aliases.pages ).forEach( ref => {
         if( pageReference && pageReference !== ref ) {
            return;
         }

         const page = debugInfo.pages[ debugInfo.aliases.pages[ ref ] ];
         pageDefinitions[ ref ] = definitions( page );
         compositionDefinitions[ ref ] = {};

         page.compositions.forEach( composition => {
            compositionDefinitions[ ref ][ composition.id ] = definitions( composition );
         } );
      } );

      Object.keys( debugInfo.aliases.widgets ).forEach( ref => {
         const widget = debugInfo.widgets[ debugInfo.aliases.widgets[ ref ] ];
         widgetDescriptors[ ref ] = widget.DESC;
      } );
   }

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

