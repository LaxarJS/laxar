/**
 * Copyright 2016 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */

import { create as createFlowServiceMock } from '../flow_service_mock';

describe( 'A flowService mock', () => {

   let flowServiceMock;

   beforeEach( () => {
      flowServiceMock = createFlowServiceMock();
   } );

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   describe( 'asked for the default mock URL components', () => {

      let path;
      let anchor;
      let url;

      beforeEach( () => {
         path = flowServiceMock.constructPath( 'myPlace', { param: 'v1' } );
         anchor = flowServiceMock.constructAnchor( 'myPlace', { param: 'v2' } );
         url = flowServiceMock.constructAbsoluteUrl( 'myPlace', { param: 'v3' } );
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'returns the pre-configured mock path', () => {
         expect( path ).toEqual( '/mockPath' );
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'returns a mock-anchor based on the pre-configured mock path', () => {
         expect( anchor ).toEqual( '#/mockPath' );
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'returns a mock-url based on the pre-configured mock path', () => {
         expect( url.replace( /^[^/]*\/\/[^/]*\/(.*)$/, '$1' ) ).toEqual( 'mockPath' );
      } );

   } );

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   describe( 'asked for customized mock URL components', () => {

      let path;
      let anchor;
      let url;

      beforeEach( () => {
         flowServiceMock = createFlowServiceMock( {
            browser: {
               location() {
                  return {
                     protocol: 'https',
                     host: 'myhost'
                  };
               }
            }
         } );

         flowServiceMock.constructPath.and.callFake( (place, { param }) => `/${place}/${param}` );
         path = flowServiceMock.constructPath( 'myPlace', { param: 'v1' } );
         anchor = flowServiceMock.constructAnchor( 'myPlace', { param: 'v2' } );
         url = flowServiceMock.constructAbsoluteUrl( 'myPlace', { param: 'v3' } );
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'returns the re-configured mock path', () => {
         expect( path ).toEqual( '/myPlace/v1' );
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'returns a mock-anchor based on the re-configured mock path', () => {
         expect( anchor ).toEqual( '#/myPlace/v2' );
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'returns a mock-url based on the re-configured mock path and location', () => {
         expect( url ).toEqual( 'https://myhost/myPlace/v3' );
      } );

   } );

} );
