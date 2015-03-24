/**
 * Copyright 2014 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
define( [
   '../widget_area',
   'angular',
   'angular-mocks'
], function( widgetAreaModule, ng ) {
   'use strict';

   var angularMocks = ng.mock;

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   describe( 'A widget area module', function() {

      var register;
      var deregister;
      var controllerForScope;

      beforeEach( function() {

         deregister = jasmine.createSpy( 'deregister' );
         register = jasmine.createSpy( 'pageController.areas.register' ).andCallFake( function() {
            return deregister;
         } );
         controllerForScope = jasmine.createSpy( 'controllerForScope' ).andCallFake( function() {
            return {
               areas: {
                  register: register
               }
            };
         } );

         angularMocks.module( widgetAreaModule.name, function( $provide ) {
            $provide.service( 'axPageService', function() {
              return {
                  controllerForScope: controllerForScope
              };
            } );
         } );
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      describe( 'provides an axWidgetArea directive that', function() {

         var $compile;
         var $rootScope;
         var scope;

         beforeEach( function() {
            widgetAreaModule.controller( 'TestWidgetController', function( $scope ) { } );
         } );

         beforeEach( angularMocks.inject( function( _$compile_, _$rootScope_ ) {
            $compile = _$compile_;
            $rootScope = _$rootScope_;
            scope = $rootScope.$new();
            scope.boundArea = 'two';
         } ) );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'registers any named widget area with the page controller when linked', function() {
            var link = $compile( '<div data-ax-widget-area="one"></div>' );
            expect( register ).not.toHaveBeenCalled();
            var element = link( scope );
            expect( controllerForScope ).toHaveBeenCalledWith( scope );
            expect( register ).toHaveBeenCalledWith( 'one', element[ 0 ] );
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'registers any bound widget area with the page controller when linked', function() {
            var link = $compile( '<div data-ax-widget-area data-ax-widget-area-binding="boundArea"></div>' );
            expect( register ).not.toHaveBeenCalled();
            var element = link( scope );
            expect( controllerForScope ).toHaveBeenCalledWith( scope );
            expect( register ).toHaveBeenCalledWith( 'two', element[ 0 ] );
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'triggers an error when there is neither name nor binding', function() {
            expect( function() {
               $compile( '<div data-ax-widget-area></div>' )( scope );
            } ).toThrow();
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'deregisters any named area with the page controller when destroyed', function() {
            $compile( '<div data-ax-widget-area="one"></div>' )( scope );
            expect( deregister ).not.toHaveBeenCalled();
            scope.$destroy();
            expect( deregister ).toHaveBeenCalled();
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'deregisters any bound area with the page controller when destroyed', function() {
            $compile( '<div data-ax-widget-area data-ax-widget-area-binding="boundArea"></div>' )( scope );
            expect( deregister ).not.toHaveBeenCalled();
            scope.$destroy();
            expect( deregister ).toHaveBeenCalled();
         } );

      } );

   } );

} );
