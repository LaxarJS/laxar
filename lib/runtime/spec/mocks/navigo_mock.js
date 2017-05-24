/**
 * Copyright 2016 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
import assert from '../../../utilities/assert';

export function create( locationMock ) {

   const routeHandlers = {};

   const navigoInstance = jasmine.createSpyObj( 'navigoInstance', [
      'generate', 'link', 'navigate', 'on', 'pause', 'resolve', 'resume'
   ] );
   function Navigo( base = null, useHash = false, hash = '#' ) {
      navigoInstance.base = base;
      navigoInstance.useHash = useHash;
      navigoInstance.hash = hash;

      return navigoInstance;
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   const mock = {
      // the actual mock-constructor for use by the router
      Navigo,

      // the mock instance returned by the constructor
      instance: navigoInstance,

      // instrumentation properties for use in spec tests
      routeHandlers,
      configureRouteSpy: jasmine.createSpy( 'configureRouteSpy' ).and.callFake( ( routeName, handler ) => {
         routeHandlers[ routeName ] = handler;
      } ),
      triggerRoute( routeName, params = {}, querystring = '' ) {
         const handler = routeHandlers[ routeName ];
         const func = typeof handler === 'function' ? handler : handler.uses;
         assert( func, `${routeName} handler function not found` ).hasType( Function ).isNotNull();

         func( params, querystring );
      }
   };

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   navigoInstance.on.and.callFake( ( routeName, handler ) => {
      const t1 = typeof routeName;
      const t2 = typeof handler;
      if( t1 === 'object' && t2 === 'undefined' ) {
         Object.keys( routeName ).forEach( route => {
            mock.configureRouteSpy( route, routeName[ route ] );
         } );
      }
      else if( t1 === 'string' && ( t2 === 'function' || t2 === 'object' ) ) {
         mock.configureRouteSpy( routeName, handler );
      }
      else {
         assert.codeIsUnreachable( `navigo.on: Unsupported argument types ( ${t1}, ${t2} )` );
      }
      return navigoInstance;
   } );

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   navigoInstance.link.and.callFake( path => {
      if( navigoInstance.useHash ) {
         return `${locationMock.href.split( navigoInstance.hash )[ 0 ]}${path}`;
      }
      return navigoInstance.base.replace( /\/$/, '' ) + path;
   } );

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   return mock;

}
