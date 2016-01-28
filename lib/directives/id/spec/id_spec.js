/**
 * Copyright 2015 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
import { name as idModuleName } from '../id';
import 'angular-mocks';

const { module, inject } = window;
const PREFIX = 'ID_PREFIX_';
var scope;
var compile;
var $dom;


const setup = () => {
   module( idModuleName );

   inject( ( $rootScope, $compile ) => {
      scope = $rootScope.$new();
      compile = $compile;
   } );

   scope.id = jasmine.createSpy( 'id' ).and.callFake( localId => PREFIX + localId );
   scope.myLocalId = 'localId';
};

///////////////////////////////////////////////////////////////////////////////////////////////////////////

describe( 'An id directive', () => {

   beforeEach( setup );

   describe( 'with local id provided', () => {

      beforeEach( () => {
         $dom = compile( '<div ax-id="myLocalId"></div>' )( scope );
      } );

      /////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'calls the id method on the scope with the local id expression evaluated', () => {
         expect( scope.id ).toHaveBeenCalledWith( 'localId' );
      } );

      /////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'sets the result of calling scope.id as id attribute', () => {
         expect( $dom[0].id ).toEqual( PREFIX + 'localId' );
      } );

   } );

   ////////////////////////////////////////////////////////////////////////////////////////////////////////

   describe( 'with local id omitted', () => {

      it( 'throws an exception', () => {
         expect( () => {
            compile( '<div ax-id></div>' )( scope );
         } ).toThrow( new Error( 'Assertion error: State does not hold. Details: directive axId needs a non-empty local id, e.g. ax-id="\'myLocalId\'".' ) );
      } );

   } );

} );

///////////////////////////////////////////////////////////////////////////////////////////////////////////

describe( 'A for directive', () => {

   beforeEach( setup );

   describe( 'with local id provided', () => {

      beforeEach( () => {
         $dom = compile( '<div ax-for="myLocalId"></div>' )( scope );
      } );

      /////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'calls the id method on the scope with the local id expression evaluated', () => {
         expect( scope.id ).toHaveBeenCalledWith( 'localId' );
      } );

      /////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'sets the result of calling scope.id as for attribute', () => {
         expect( $dom.attr( 'for' ) ).toEqual( PREFIX + 'localId' );
      } );

   } );

   ////////////////////////////////////////////////////////////////////////////////////////////////////////

   describe( 'with local id omitted', () => {

      it( 'throws an exception', () => {
         expect( () => {
            compile( '<div ax-for></div>' )( scope );
         } ).toThrow( new Error( 'Assertion error: State does not hold. Details: directive axFor needs a non-empty local id, e.g. ax-for="\'myLocalId\'".' ) );
      } );

   } );

} );
