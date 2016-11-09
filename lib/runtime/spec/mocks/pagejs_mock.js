/**
 * Copyright 2016 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
import assert from '../../../utilities/assert';

export function create() {

   const routeHandlers = {};

   const page = jasmine.createSpy( 'pageRouterMock' ).and.callFake( normalizePageInvocation );
   page.redirect = jasmine.createSpy( 'pageRouterMock.redirect' );
   page.base = jasmine.createSpy( 'pageRouterMock.base' );
   page.start = jasmine.createSpy( 'pageRouterMock.start' );
   page.show = jasmine.createSpy( 'pageRouterMock.show' );

   const mock = {
      // the actual mock-implementation for use in the flow controller
      page,

      // instrumentation properties for use in spec tests
      routeHandlers,
      configureRouteSpy: jasmine.createSpy( 'configureRouteSpy' )
         .and.callFake( ( routeName, handler ) => {
            routeHandlers[ routeName ] = handler;
         } ),
      triggerRoute( routeName, handlerContext ) {
         routeHandlers[ routeName ]( handlerContext || { params: {} } );
      }
   };

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function normalizePageInvocation( a, b ) {
      if( typeof a === 'function' ) {
         if( b === undefined ) {
            return mock.configureRouteSpy( '*', a );
         }
      }

      if( typeof a === 'string' ) {
         if( typeof b === 'function' ) {
            return mock.configureRouteSpy( a, b );
         }
         if( typeof b === 'string' ) {
            return page.redirect( a, b );
         }
         if( b === undefined ) {
            return page.show( a );
         }
      }

      if( typeof a === 'object' ) {
         return page.start( a );
      }

      assert.codeIsUnreachable( `page.js invocation not recognized: ${a}, ${b}` );
      return null;
   }

   return mock;

}
