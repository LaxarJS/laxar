/**
 * Copyright 2016 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */

export function create() {

   const mock = {
      router: {
         navigateTo: jasmine.createSpy( 'navigateTo' ),
         registerRoutes: jasmine.createSpy( 'registerRoutes' ).and.callFake( storeRoutes ),
         constructAbsoluteUrl: jasmine.createSpy( 'constructAbsoluteUrl' )
      }
   };

   function storeRoutes( routeMap, fallbackHandler ) {
      mock.routeMap = routeMap;
      mock.fallbackHandler = fallbackHandler;
   }

   return mock;
}
