/**
 * Copyright 2014 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
define( [
   '../portal_services',
   'angular-mocks',
   '../../../logging/log',
   '../../../file_resource_provider/file_resource_provider',
   '../../../testing/jquery_mock',
   '../../../utilities/object',
   '../../../utilities/storage'
], function( portalServicesModule, angularMocks, log, fileResourceProvider, jqueryMock, object, storage ) {
   'use strict';

   describe( 'An EventBus factory', function() {

      beforeEach( function() {
         angularMocks.module( portalServicesModule.name );
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'returns an message bus instance', angularMocks.inject( function( EventBus ) {
         expect( EventBus.publish ).toBeDefined();
         expect( EventBus.subscribe ).toBeDefined();
      } ) );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'attaches an error handler to the message bus that uses the global logger ', angularMocks.inject( function( EventBus, $timeout ) {
         spyOn( log, 'error' );

         EventBus.subscribe( 'message', function() { throw new Error( 'error' ); } );
         EventBus.publish( 'message' );
         $timeout.flush();

         expect( log.error ).toHaveBeenCalled();
      } ) );
   } );

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   describe( 'A Configuration factory', function() {

      beforeEach( function() {
         angularMocks.module( portalServicesModule.name );
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'returns an configuration instance', angularMocks.inject( function( Configuration ) {
         expect( Configuration.get ).toBeDefined();
      } ) );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'populates the configuration instance with values from a configuration file', angularMocks.inject( function( Configuration ) {
         expect( Configuration.get( 'key_one' ) ).toEqual( 'value_one' );
         expect( Configuration.get( 'key_two' ) ).toEqual( 'value_two' );
      } ) );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'lets the configuration return null for non-existing keys', angularMocks.inject( function( Configuration ) {
         expect( Configuration.get( 'key_three' ) ).toEqual( null );
      } ) );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'lets the configuration return a default value for non-existing keys if given', angularMocks.inject( function( Configuration ) {
         expect( Configuration.get( 'key_three', 'my_default' ) ).toEqual( 'my_default' );
      } ) );

   } );

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   describe( 'A FileResourceProvider factory', function() {

      var windowMock_;

      beforeEach( function() {
         angularMocks.module( portalServicesModule.name );

         windowMock_ = {
            laxar: {},
            navigator: window.navigator
         };
         angularMocks.module( function( $provide ) {
            $provide.value( '$window', windowMock_ );
            $provide.value( 'Configuration', {
               get: function( key, optionalDefault ) {
                  return object.path( windowMock_.laxar, key, optionalDefault );
               }
            } );

         } );
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'returns a file resource provider instance', angularMocks.inject( function( FileResourceProvider ) {
         expect( FileResourceProvider.provide ).toBeDefined();
         expect( FileResourceProvider.isAvailable ).toBeDefined();
         expect( FileResourceProvider.setFileListingUri ).toBeDefined();
      } ) );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      describe( 'when there are file listings configured', function() {

         beforeEach( function() {

            windowMock_.laxar.fileListings = {
               'includes/widgets': '/var/listing/includes_widgets.json'
            };

            var proto = fileResourceProvider.create( '', '' ).constructor.prototype;

            spyOn( proto, 'setFileListingUri' );

         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'sets the given filelistings', angularMocks.inject( function( FileResourceProvider ) {
            expect( FileResourceProvider.setFileListingUri )
               .toHaveBeenCalledWith( 'includes/widgets', '/var/listing/includes_widgets.json' );
         } ) );

      } );

   } );

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   describe( 'A CssLoader factory', function() {

      var linkNodeMock;

      beforeEach( function() {
         angularMocks.module( portalServicesModule.name );

         linkNodeMock = {};
         jqueryMock.mockResult( 'filter', 'link', [ linkNodeMock ] );
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      afterEach( function() {
         jqueryMock.mockReset();
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'returns a css loader instance', angularMocks.inject( function( CssLoader ) {
         expect( CssLoader.load ).toBeDefined();
      } ) );

   } );

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   describe( 'An $exceptionHandler provider', function() {

      beforeEach( function() {
         angularMocks.module( portalServicesModule.name );
         spyOn( log, 'error' );
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      // no need to inject the provider here, as it automatically overwrites the internal one
      it( 'overwrites the internal one with an implementation delegating to log.error', angularMocks.inject( function( $timeout ) {
         // simple way to trigger the $exceptionHandler
         $timeout( function() {
            throw new Error( 'my error' );
         } );
         $timeout.flush();

         expect( log.error ).toHaveBeenCalledWith( 'There was an exception: my error, \nstack: ' );
         expect( log.error ).toHaveBeenCalledWith( '  Cause: undefined' );
      } ) );

   } );

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   describe( 'A ThemeManager factory', function() {

      var eventBus_;
      var configuration_;
      var $timeout_;
      var $rootScope_;
      var themeManager_;
      var sessionStorageSpy;

      beforeEach( function() {
         sessionStorageSpy = jasmine.createSpyObj( 'sessionStorageSpy', [ 'setItem', 'getItem', 'removeItem' ] );
         storage.init( {}, sessionStorageSpy );

         angularMocks.module( portalServicesModule.name );
      } );

      beforeEach( angularMocks.inject( function( EventBus, Configuration, $timeout, $rootScope ) {
         eventBus_ = EventBus;
         spyOn( eventBus_, 'subscribe' ).andCallThrough();
         spyOn( eventBus_, 'publish' ).andCallThrough();

         configuration_ = Configuration;
         spyOn( configuration_, 'get' ).andCallFake( function( key ) {
            return key === 'theme' ? 'fakeTheme' : '';
         } );

         $timeout_ = $timeout;
         $rootScope_ = $rootScope;
      } ) );

      beforeEach( angularMocks.inject( function( ThemeManager ) {
         themeManager_ = ThemeManager;
      } ) );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'creates the theme manager instance with the theme from configuration', function() {
         expect( themeManager_.getTheme() ).toEqual( 'fakeTheme' );
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'starts listening on changeThemeRequest events', function() {
         expect( eventBus_.subscribe ).toHaveBeenCalledWith( 'changeThemeRequest', jasmine.any( Function ) );
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      describe( 'when a changeThemeRequest event arrives', function() {

         beforeEach( function() {
            eventBus_.publish( 'changeThemeRequest.coolTheme', {
               theme: 'coolTheme'
            } );
            $timeout_.flush();
            $rootScope_.$digest();
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'announces its work with a willChangeTheme event', function() {
            expect( eventBus_.publish ).toHaveBeenCalledWith( 'willChangeTheme.coolTheme', {
               theme: 'coolTheme'
            } );
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'sets the requested theme in the theme manager and thus in session storage', function() {
            expect( sessionStorageSpy.setItem ).toHaveBeenCalledWith( 'ax.themeManager.theme', '"coolTheme"' );
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'triggers a navigateRequest event forcing a browser reload to _self', function() {
            expect( eventBus_.publish ).toHaveBeenCalledWith( 'navigateRequest._self', {
               target: '_self',
               triggerBrowserReload: true
            } );
         } );

      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      describe( 'when a changeThemeRequest event with target parameter arrives', function() {

         beforeEach( function() {
            eventBus_.publish( 'changeThemeRequest.coolTheme', {
               theme: 'coolTheme',
               target: 'firstPage'
            } );
            $timeout_.flush();
            $rootScope_.$digest();
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'triggers a navigateRequest event forcing a browser reload to the given target', function() {
            expect( eventBus_.publish ).toHaveBeenCalledWith( 'navigateRequest.firstPage', {
               target: 'firstPage',
               triggerBrowserReload: true
            } );
         } );

      } );

   } );

} );
