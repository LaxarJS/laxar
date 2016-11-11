/**
 * Copyright 2016 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
import { create as createFlowService } from './flow_service';

import { create as createBrowserMock } from '../../testing/configuration_mock';
import { create as createRouterMock } from './mocks/router_mock';

const anyFunc = jasmine.any( Function );

describe( 'A flow service', () => {

   let flowService;
   let browserMock;
   let routerMock;

   beforeEach( () => {
      browserMock = createBrowserMock();
      routerMock = createRouterMock();
      flowService = createFlowService( browserMock, routerMock.router );
   } );

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   it( 'provides a method to generate absolute URLs', () => {
      expect( flowService.constructAbsoluteUrl ).toEqual( anyFunc );
   } );

} );
