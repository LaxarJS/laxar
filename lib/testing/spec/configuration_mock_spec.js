/**
 * Copyright 2016 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
import { create as createConfigurationMock } from '../configuration_mock';

describe( 'A configuration mock', () => {

   let configurationMock;
   let configurationData;

   beforeEach( () => {
      configurationData = {
         'direct.path.mock': 1,
         nested: {
            path: {
               mock: 2
            }
         }
      };
      configurationMock = createConfigurationMock( configurationData );
   } );

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   describe( 'asked for configuration using path-based syntax', () => {

      let pathMockResult;
      let objectMockResult;
      let missingResult;

      beforeEach( () => {
         pathMockResult = configurationMock.get( 'direct.path' );
         objectMockResult = configurationMock.get( 'nested.path' );
         missingResult = configurationMock.get( 'nested.missing', 'MISSING' );
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'resolves path-based mocks', () => {
         expect( pathMockResult ).toEqual( { mock: 1 } );
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'resolves object-based mocks', () => {
         expect( objectMockResult ).toEqual( { mock: 2 } );
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'resolves missing mocks', () => {
         expect( missingResult ).toEqual( 'MISSING' );
      } );

   } );

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   describe( 'asked for configuration using object-based syntax', () => {

      let pathMockResult;
      let objectMockResult;
      let missingResult;

      beforeEach( () => {
         pathMockResult = configurationMock.get( 'direct' ).path;
         objectMockResult = configurationMock.get( 'nested' ).path;
         missingResult = configurationMock.get( 'missing', 'MISSING' );
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'resolves path-based mocks', () => {
         expect( pathMockResult ).toEqual( { mock: 1 } );
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'resolves object-based mocks', () => {
         expect( objectMockResult ).toEqual( { mock: 2 } );
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'resolves missing mocks', () => {
         expect( missingResult ).toEqual( 'MISSING' );
      } );

   } );

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   describe( 'when the configuration source-mock is modified after creation', () => {

      let pathMockResult;
      let objectMockResult;

      beforeEach( () => {
         configurationData[ 'direct.path.mock' ] = 7;
         configurationData.nested.path.mock = 8;
         pathMockResult = configurationMock.get( 'direct' ).path;
         objectMockResult = configurationMock.get( 'nested' ).path;
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'resolves path-based mocks to the new value', () => {
         expect( pathMockResult ).toEqual( { mock: 7 } );
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'resolves object-based mocks to the new value', () => {
         expect( objectMockResult ).toEqual( { mock: 8 } );
      } );

   } );

} );
