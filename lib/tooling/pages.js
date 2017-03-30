export const FLAT = 'FLAT';
export const COMPACT = 'COMPACT';

export function create( tooling, debugEventBus ) {
   const listeners = [];
   let pageInfo;

   tooling.whenDebugInfoAvailable( debugInfo => {
      pageInfo = getPageInfo( debugInfo );
      notifyListeners( tooling.instanceState.pages[ 0 ] );
   } );

   debugEventBus.subscribe( 'page', pageReference => {
      notifyListeners( pageReference );
   } );

   function notifyListeners( pageReference ) {
      if( pageInfo ) {
         listeners.forEach( callback => { callback( { ...pageInfo, pageReference } ); } );
      }
   }

   return {
      enable() {},
      disable() {},
      current() {
         return { ...pageInfo, pageReference: tooling.instanceState.pages[ 0 ] };
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

function getPageInfo( debugInfo ) {
   const pageDefinitions = {};
   const compositionDefinitions = {};
   const widgetDescriptors = {};

   if( debugInfo && debugInfo.aliases ) {
      Object.keys( debugInfo.aliases.pages ).forEach( ref => {
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

