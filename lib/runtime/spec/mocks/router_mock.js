/**
 * Copyright 2016 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */

export function create() {

   let resolveRoutes;
   const routeMapAvailablePromise = new Promise( _ => { resolveRoutes = _; } );

   const mock = {
      router: {
         navigateTo: jasmine.createSpy( 'navigateTo' ),
         navigateToPath: jasmine.createSpy( 'navigateToPath' ),
         registerRoutes: jasmine.createSpy( 'registerRoutes' ).and.callFake( storeRoutes ),
         constructAbsoluteUrl: jasmine.createSpy( 'constructAbsoluteUrl' )
      },
      awaitRegisterRoutes() {
         return routeMapAvailablePromise;
      },
      triggerRouteHandler( routePattern, parameters ) {
         mock.routeMap[ routePattern ]( parameters );
      },
      triggerFallbackHandler( path ) {
         mock.fallbackHandler( path );
      }
   };

   function storeRoutes( routeMap, fallbackHandler ) {
      mock.routeMap = routeMap;
      mock.fallbackHandler = fallbackHandler;
      resolveRoutes();
   }

   return mock;
}
