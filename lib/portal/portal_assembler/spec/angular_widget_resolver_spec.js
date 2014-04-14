/**
 * Copyright 2014 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
define( [
   '../widget_resolvers/angular_widget_resolver',
   '../../../file_resource_provider/file_resource_provider',
   '../../../testing/portal_mocks',
   '../../modules/theme_manager',
   './data/angular_widget_resolver_data'
], function( angularWidgetResolver, fileResourceProvider, portalMocks, themeManager, specData ) {
   'use strict';

   describe( 'An angular widget resolver', function() {

      it( 'throws if init is missing some required argument', function() {
         expect( function() {
            angularWidgetResolver.init();
         } ).toThrow();
         expect( function() {
            angularWidgetResolver.init( {} );
         } ).toThrow();
         expect( function() {
            angularWidgetResolver.init( {}, {} );
         } ).not.toThrow();
      } );

   } );

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   describe( 'An initialized angular widget resolver', function() {

      var q_;
      var http_;
      var fileResourceProvider_;
      var themeManager_;

      beforeEach( function() {
         jasmine.Clock.useMock();
         
         q_ = portalMocks.mockQ();
         http_ = portalMocks.mockHttp();
         http_.respondWith( 'GET', 'var/listing/testing_widgets.json', specData );

         fileResourceProvider.init( q_, http_ );
         fileResourceProvider_ = fileResourceProvider.create( '' );
         fileResourceProvider_.setFileListingUri( 'mocked', 'var/listing/testing_widgets.json' );

         themeManager_ = themeManager.create( fileResourceProvider_, q_ );
         themeManager_.setTheme( 'default' );

         angularWidgetResolver.init( themeManager_, q_ );
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      describe( 'when asked to resolve a widget using the default theme', function() {

         var promiseSpy;

         beforeEach( function() {
            promiseSpy = jasmine.createSpy();
            angularWidgetResolver.resolve( 'portal/super_default_widget', {}, 'default' )
               .then( promiseSpy );

            jasmine.Clock.tick( 0 );
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'correctly resolves it', function() {
            expect( promiseSpy ).toHaveBeenCalledWith( {
               specification: {},
               includeUrl: 'mocked/widgets/portal/super_default_widget/default.theme/super_default_widget.html',
               controllerName: 'widgets.portal.super_default_widget.Controller',
               cssFileUrls: [ 'mocked/widgets/portal/super_default_widget/default.theme/css/super_default_widget.css' ]
            } );
         } );

      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      describe( 'when asked to resolve a widget using the green theme', function() {

         var resolveSpy;

         beforeEach( function() {
            themeManager_.setTheme( 'green' );
            resolveSpy = jasmine.createSpy( 'resolveSpy' );
            angularWidgetResolver.resolve( 'portal/super_green_widget', {} )
               .then( resolveSpy );

            jasmine.Clock.tick( 0 );
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'correctly resolves it', function() {
            expect( resolveSpy ).toHaveBeenCalledWith( {
               specification: {},
               includeUrl: 'mocked/themes/green.theme/widgets/portal/super_green_widget/super_green_widget.html',
               controllerName: 'widgets.portal.super_green_widget.Controller',
               cssFileUrls: [ 'mocked/themes/green.theme/widgets/portal/super_green_widget/css/super_green_widget.css' ]
            } );
         } );

      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      describe( 'when asked to resolve an activity', function() {

         var promiseSpy;

         beforeEach( function() {
            promiseSpy = jasmine.createSpy();
            angularWidgetResolver.resolve( 'portal/super_activity', {} )
               .then( promiseSpy );

            jasmine.Clock.tick( 0 );
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'correctly resolves it', function() {
            expect( promiseSpy ).toHaveBeenCalledWith( {
               specification: {},
               includeUrl: '',
               controllerName: 'widgets.portal.super_activity.Controller',
               cssFileUrls: []
            } );
         } );

      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      describe( 'when asked to resolve a widget that is only partly themed', function() {

         var promiseSpy;

         beforeEach( function() {
            themeManager_.setTheme( 'green' );
            promiseSpy = jasmine.createSpy();
            angularWidgetResolver.resolve( 'portal/mixed_widget', {} )
               .then( promiseSpy );

            jasmine.Clock.tick( 0 );
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'uses missing parts from the default theme', function() {
            expect( promiseSpy ).toHaveBeenCalledWith( {
               specification: {},
               includeUrl: 'mocked/widgets/portal/mixed_widget/default.theme/mixed_widget.html',
               controllerName: 'widgets.portal.mixed_widget.Controller',
               cssFileUrls: [ 'mocked/themes/green.theme/widgets/portal/mixed_widget/css/mixed_widget.css' ]
            } );
         } );

      } );

   } );

} );