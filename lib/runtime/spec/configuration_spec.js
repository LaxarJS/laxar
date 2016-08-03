/**
 * Copyright 2016 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
import { create as createConfiguration } from '../configuration';

describe( 'A configuration module', () => {

   it( 'allows to create a configuration object', () => {
      expect( createConfiguration( {} ) ).toBeDefined();
   } );

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   it( 'allows to create a configuration object with fallback values ', () => {
      expect( createConfiguration( {}, {} ) ).toBeDefined();
   } );

} );

//////////////////////////////////////////////////////////////////////////////////////////////////////////////

describe( 'a configuration object', () => {

   let configuration;

   beforeEach( () => {
      configuration = createConfiguration( {
         key: 'value',
         path: { to: 'leaf' },
         zero: 0,
         empty: ''
      } );
   } );

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   it( 'allows to get values', () => {
      expect( configuration.get( 'key' ) ).toEqual( 'value' );
      expect( configuration.get( 'path' ) ).toEqual( { to: 'leaf' } );
   } );

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   it( 'allows to get values using path-syntax', () => {
      expect( configuration.get( 'path.to' ) ).toEqual( 'leaf' );
   } );

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   it( 'supports passing individual fallback values', () => {
      expect( configuration.get( 'unknown.path', 'x1' ) ).toEqual( 'x1' );
      expect( configuration.get( 'path.nowhere', 'x2' ) ).toEqual( 'x2' );
      expect( configuration.get( 'what', 'x3' ) ).toEqual( 'x3' );
   } );

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   it( 'allows to require values', () => {
      expect( configuration.ensure( 'key' ) ).toEqual( 'value' );
      expect( configuration.ensure( 'path' ) ).toEqual( { to: 'leaf' } );
   } );

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   it( 'fails if required values are not available', () => {
      expect( () => { configuration.ensure( 'unknown.path' ); } ).toFail();
      expect( () => { configuration.ensure( 'path.nowhere' ); } ).toFail();
      expect( () => { configuration.ensure( 'what' ); } ).toFail();
   } );

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   it( 'does not fail if required values are available', () => {
      expect( () => { configuration.ensure( 'zero' ); } ).not.toFail();
      expect( () => { configuration.ensure( 'empty' ); } ).not.toFail();
   } );

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   describe( 'with default values', () => {

      beforeEach( () => {
         configuration = createConfiguration( {
            key: 'value',
            path: { to: 'leaf' }
         }, {
            key: 'default-value',
            other: '',
            path: { addition: 'another-leaf' }
         } );
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'uses default values when no user-defined values are given', () => {
         expect( configuration.ensure( 'other' ) ).toEqual( '' );
         expect( configuration.get( 'path.addition' ) ).toEqual( '' );
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'prefers user-defined values over default values', () => {
         expect( configuration.get( 'key' ) ).toEqual( 'value' );
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'does not try to merge user-defined values with default values', () => {
         expect( configuration.get( 'path' ) ).toEqual( { to: 'leaf' } );
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'prefers the default values over individual fallback values', () => {
         expect( configuration.get( 'other', 'not-me' ) ).toEqual( '' );
         expect( configuration.get( 'path.addition', 'not-me' ) ).toEqual( 'another-leaf' );
      } );

   } );

} );
