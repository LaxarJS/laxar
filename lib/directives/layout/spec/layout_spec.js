/**
 * Copyright 2015 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
import { name as layoutModuleName } from '../layout';
import 'angular-mocks';

const { module, inject } = window;

///////////////////////////////////////////////////////////////////////////////////////////////////////////

describe( 'A layout module', () => {

   var scope_;
   var element_;
   var layoutLoaderMock_;

   beforeEach( () => {
      module( layoutModuleName,  ( $provide ) => {
         $provide.service( 'axLayoutLoader', () => {
            return layoutLoaderMock_;
         } );
      } );

      var layoutDataMock = {
         html: 'theHtmlFile',
         htmlContent: '<h1>I am {{ model.prop }}</h1>',
         className: 'theCssClass'
      };
      inject( $q => {
         layoutLoaderMock_ = {
            load: jasmine.createSpy( 'load' ).and.returnValue( $q.when( layoutDataMock ) )
         };
      } );
   } );

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   describe( 'provides an axLayout directive that', () => {

      var $rootScope;

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      beforeEach( inject( ( _$compile_, _$rootScope_ ) => {
         $rootScope = _$rootScope_;
         scope_ = _$rootScope_.$new();
         scope_.model = {
            layout: 'theLayout',
            prop: 'linked'
         };

         element_ = _$compile_( '<div data-ax-layout="model.layout"/>' )( scope_ );
      } ) );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      describe( 'when invoked', () => {

         it( 'uses the LayoutLoader service to load the layout data', () => {
            expect( layoutLoaderMock_.load ).toHaveBeenCalledWith( 'theLayout' );
         } );

      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      describe( 'when the layout has been loaded', () => {

         it( 'compiles and attaches the layout\'s html to the directive element', () => {
            scope_.$digest();

            var match = /<[^>]*class="([^"]*)"/.exec( element_.html() );
            expect( match ).toBeTruthy();

            var classes = match[1].split(' ');
            expect( classes ).toContain( 'ng-binding' );
            expect( classes ).toContain( 'ng-scope' );
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'sets the respective css class on the scope', () => {
            scope_.$digest();
            expect( element_[ 0 ].className ).toMatch( /\btheCssClass\b/ );
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'emits an AngularJS event `axLayoutLoaded` with the layout name', () => {
            var layoutName = null;
            $rootScope.$on( 'axLayoutLoaded', function( _, name ) {
               layoutName = name;
            } );
            scope_.$digest();
            expect( layoutName ).toEqual( 'theLayout' );
         } );

      } );

   } );

} );
