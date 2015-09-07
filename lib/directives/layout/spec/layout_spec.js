/**
 * Copyright 2015 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
define( [
   '../layout',
   'angular',
   '../../../testing/portal_mocks',
   'angular-mocks'
], function( axLayout, angular, portalMocks ) {
   'use strict';

   var angularMocks = angular.mock;

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   describe( 'A layout module', function() {

      var scope_;
      var element_;
      var layoutLoaderMock_;

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      beforeEach( function() {
         angularMocks.module( axLayout.name,  function( $provide ) {
            $provide.service( 'axLayoutLoader', function() {
               return layoutLoaderMock_;
            } );
         } );
         jasmine.Clock.useMock();
         var q = portalMocks.mockQ();

         var layoutDataMock = {
            html: 'theHtmlFile',
            htmlContent: '<h1>I am {{ model.prop }}</h1>',
            className: 'theCssClass'
         };
         layoutLoaderMock_ = {
            load: jasmine.createSpy( 'load' ).andCallFake(
               function() { return q.when( layoutDataMock ); }
            )
         };
      } );

      describe( 'provides an axLayout directive that', function() {

         var $rootScope;

         ////////////////////////////////////////////////////////////////////////////////////////////////////////

         beforeEach( angularMocks.inject( function( _$compile_, _$rootScope_ ) {
            $rootScope = _$rootScope_;
            scope_ = _$rootScope_.$new();
            scope_.model = {
               layout: 'theLayout',
               prop: 'linked'
            };

            element_ = _$compile_( '<div data-ax-layout="model.layout"/>' )( scope_ );
         } ) );

         ////////////////////////////////////////////////////////////////////////////////////////////////////////

         describe( 'when invoked', function() {

            it( 'uses the LayoutLoader service to load the layout data', function() {
               expect( layoutLoaderMock_.load ).toHaveBeenCalledWith( 'theLayout' );
            } );

         } );

         ////////////////////////////////////////////////////////////////////////////////////////////////////////

         describe( 'when the layout has been loaded', function() {

            it( 'compiles and attaches the layout\'s html to the directive element', function() {
               jasmine.Clock.tick( 0 );
               scope_.$digest();

               var match = /<[^>]*class="([^"]*)"/.exec( element_.html() );
               expect( match ).toBeTruthy();

               var classes = match[1].split(' ');
               expect( classes ).toContain( 'ng-binding' );
               expect( classes ).toContain( 'ng-scope' );
            } );

            /////////////////////////////////////////////////////////////////////////////////////////////////////

            it( 'sets the respective css class on the scope', function() {
               jasmine.Clock.tick( 0 );
               scope_.$digest();
               expect( element_[ 0 ].className ).toMatch( /\btheCssClass\b/ );
            } );

            /////////////////////////////////////////////////////////////////////////////////////////////////////

            it( 'emits an AngularJS event `axLayoutLoaded` with the layout name', function() {
               var layoutName = null;
               $rootScope.$on( 'axLayoutLoaded', function( _, name ) {
                  layoutName = name;
               } );
               jasmine.Clock.tick( 0 );
               scope_.$digest();
               expect( layoutName ).toEqual( 'theLayout' );
            } );

         } );

      } );

   } );

} );
