/**
 * Copyright 2014 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
define( [
   '../layout',
   'angular',
   'angular-mocks',
   '../../../testing/portal_mocks'
], function( axLayout, angular, unused, portalMocks ) {
   'use strict';

   var angularMocks = angular.mock;

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   describe( 'Directive ax-layout', function() {

      var scope_;
      var element_;
      var layoutLoaderMock_;
      var layoutDataMock_;
      var tracker_;
      var timeout_;
      var q_;

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      function createTracker() {
         var tracker = {
            track: [],
            spies: {}
         };

         tracker.createSpy = function( id ) {
            var spy = jasmine.createSpy( id );
            tracker.spies[ id ] = spy;

            return function() {
               tracker.track.push( { id: id, spy: spy } );
               spy.apply( spy, arguments );
            };
         };

         return tracker;
      }

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      beforeEach( function() {
         angularMocks.module( 'laxar.directives.layout' );

         tracker_ = createTracker();
         q_ = portalMocks.mockQ();

         layoutLoaderMock_ = { load: function() { return q_.when( layoutDataMock_ ); } };
         spyOn( layoutLoaderMock_, 'load' ).andCallThrough();

         layoutDataMock_ = {
            html: 'theHtmlFile',
            className: 'theCssClass'
         };

         angularMocks.module( function( $provide ) {
            $provide.provider( 'LayoutLoader', function() {
               return { $get: function() { return layoutLoaderMock_; } };
            } );

            $provide.provider( '$q', function() {
               return { $get: function() { return q_; } };
            } );
         } );

         jasmine.Clock.useMock();
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      beforeEach( angularMocks.inject( function( _$compile_, _$rootScope_, _$timeout_ ) {
         scope_ = _$rootScope_.$new();

         scope_.$on( 'axLayoutLoading', tracker_.createSpy( 'axLayoutLoadingSpy' ) );
         scope_.$on( 'axLayoutLoaded', tracker_.createSpy( 'axLayoutLoadedSpy' ) );

         scope_.model = { layout: 'theLayout' };
         element_ = _$compile_( '<div data-ax-layout="model.layout"/>' )( scope_ );
         scope_.$digest();

         timeout_ = _$timeout_;
      } ) );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      describe( 'when invoked', function() {

         it( 'emits an axLayoutLoading event', function() {
            expect( tracker_.spies.axLayoutLoadingSpy ).toHaveBeenCalled();
            expect( tracker_.track[ 0 ].id ).toEqual( 'axLayoutLoadingSpy' );
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'uses the LayoutLoader service to load the layout data', function() {
            expect( layoutLoaderMock_.load ).toHaveBeenCalledWith( 'theLayout' );
         } );

      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      describe( 'when the layout has been loaded', function() {

         it( 'emits a axLayoutLoaded event', function() {
            var scope = scope_.$$childHead;
            scope.layoutLoaded();

            expect( tracker_.spies.axLayoutLoadedSpy ).toHaveBeenCalled();
            expect( tracker_.track[ 1 ].id ).toEqual( 'axLayoutLoadedSpy' );
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'sets the respective html file name and the css class on the scope', function() {
            var scope = scope_.$$childHead;

            jasmine.Clock.tick( 1 );
            expect( scope.layoutUrl ).toEqual( layoutDataMock_.html );
            expect( scope.layoutClass ).toEqual( layoutDataMock_.className );
         } );

      } );

   } );

} );
