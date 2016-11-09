/**
 * Copyright 2016 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
import { create as createFlowService } from '../flow_service';

const anyFunc = jasmine.any( Function );

describe( 'A flow service', () => {

   let flowService;
   let flowControllerMock;
   let fakeUrl;

   beforeEach( () => {
      fakeUrl = 'https://fake.url/yo';

      flowControllerMock = {
         constructAbsoluteUrl: jasmine.createSpy( 'flowControllerMock.constructAbsoluteUrl' )
            .and.callFake( () => fakeUrl )
      };
      flowService = createFlowService( flowControllerMock );
   } );

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   it( 'provides a method to generate absolute URLs', () => {
      expect( flowService.constructAbsoluteUrl ).toEqual( anyFunc );
   } );

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   describe( 'asked to generate an absolute URL', () => {

      let url;

      beforeEach( () => {
         url = flowService.constructAbsoluteUrl( 'next', {
            param: 'a-param'
         } );
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'resolves the URL using the flow controller', () => {
         expect( flowControllerMock.constructAbsoluteUrl ).toHaveBeenCalledWith( 'next', {
            param: 'a-param'
         } );

         expect( url ).toEqual( 'https://fake.url/yo' );
      } );

   } );

} );
