import assert from '../../../utilities/assert';

/**
 * Copyright 2016 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
export function create( browser, eventBus, routesToPlaces ) {

   const routeHandlers = {};
   const pageRouterMock = jasmine.createSpy( 'pageRouterMock' ).and.callFake( ( route, handler ) => {
      if( typeof route === 'string' ) {
         if( typeof handler === 'function' ) {
            routeHandlers[ route ] = handler;
         }
         else if( handler === undefined ) {
            const { routeHandler, parameters } = extractDataFromRoute( route );
            if( routeHandler ) {
               routeHandler( { params: parameters } );
            }
         }
      }
   } );
   pageRouterMock.base = jasmine.createSpy( 'pageRouterMock.base' );
   pageRouterMock.initialNavigationPromise = new Promise( resolve => {
      pageRouterMock.start = jasmine.createSpy( 'pageRouterMock.start' ).and.callFake( () => {
         const fullRoute = browser.location().hash.replace( /^#!/, '' );
         const { routeHandler, parameters } = extractDataFromRoute( fullRoute );
         if( routeHandler ) {
            eventBus.subscribe( 'didNavigate', ( event, meta ) => {
               meta.unsubscribe();
               resolve();
            } );
            routeHandler( { params: parameters } );
         }
      } );
   } );
   pageRouterMock.redirect = jasmine.createSpy( 'pageRouterMock.redirect' );

   pageRouterMock.simulateNavigationTo = ( placeName, parameters = {} ) => {
      return eventBus.publishAndGatherReplies( `navigateRequest.${placeName}`, {
         target: placeName,
         data: parameters
      } );
   };

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function extractDataFromRoute( fullRoute ) {
      let route = fullRoute;
      const parameterValues = [];
      while( !( route in routeHandlers ) ) {
         const slashIndex = route.lastIndexOf( '/' );
         assert.state( slashIndex > 0, `Could not find handler for route ${route} in page router mock!` );
         parameterValues.unshift( route.substr( slashIndex + 1 ) );
         route = route.substr( 0, slashIndex );
      }

      const place = routesToPlaces[ route ];
      const parameters = {};
      if( place ) {
         place.expectedParameters.forEach( ( key, index ) => {
            parameters[ key ] = parameterValues[ index ];
         } );
      }

      return {
         routeHandler: routeHandlers[ route ],
         place: routesToPlaces[ route ],
         parameters
      };
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   return pageRouterMock;

}
