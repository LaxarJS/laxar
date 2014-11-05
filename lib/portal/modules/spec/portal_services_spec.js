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
   '../../../testing/portal_mocks',
   '../../../utilities/object',
   '../../../utilities/storage'
], function( portalServicesModule, angularMocks, log, fileResourceProvider, jqueryMock, portalMocks, object, storage ) {
   'use strict';

   describe( 'An EventBus factory', function() {

      var eventBus;

      beforeEach( function() {
         jasmine.Clock.useMock();
         angularMocks.module( portalServicesModule.name );

         angularMocks.inject( function( EventBus ) {
            eventBus = EventBus;
         } );
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'returns an event bus instance', function() {
         expect( eventBus.publish ).toBeDefined();
         expect( eventBus.subscribe ).toBeDefined();
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      describe( 'attaches an error handler to the event', function() {

         beforeEach( function() {
            spyOn( log, 'error' );

            eventBus.subscribe( 'message', function() { throw new Error( 'error' ); } );
            eventBus.publish( 'message', {
               data: ''
            } );
            jasmine.Clock.tick( 0 );
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'that uses the global logger ', function() {
            expect( log.error ).toHaveBeenCalled();
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'that marks the event object for anonymization in the log message', function() {
            var eventMessageCall = log.error.calls.filter( function( call ) {
               return call.args[1] === 'Published event';
            } ).pop();

            expect( eventMessageCall.args[0] ).toEqual( '   - [0]: [1:%o:anonymize]' );
         } );

      } );

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

            windowMock_.laxar.file_resource_provider = {
               fileListings: {
                  'includes/widgets': '/var/listing/includes_widgets.json'
               }
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

   describe( 'A timestamp function provided by the axTimestamp-factory', function() {

      var timestamp_;

      beforeEach( function() {
         angularMocks.module( portalServicesModule.name );
      } );

      beforeEach( angularMocks.inject( function( axTimestamp ) {
         timestamp_ = axTimestamp;
      } ) );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'provides a timestamp matching the EcmaScript environment time', function() {
         expect( timestamp_() ).toEqual( new Date().getTime() );
      } );

   } );

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   describe( 'A Heartbeat from an axHeartbeat-factory', function() {

      var heartbeat_;

      var beforeNextSpy_;
      var nextSpy_;
      var afterNextSpy_;

      beforeEach( function() {
         angularMocks.module( portalServicesModule.name );
      } );

      beforeEach( angularMocks.inject( function( axHeartbeat ) {
         jasmine.Clock.useMock();
         heartbeat_ = axHeartbeat;
         beforeNextSpy_ = jasmine.createSpy( 'beforeNext spy' );
         nextSpy_ = jasmine.createSpy( 'next spy' );
         afterNextSpy_ = jasmine.createSpy( 'afterNext spy' );
      } ) );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'offers an "onNext" method whose callbacks are triggered on tick', function() {
         heartbeat_.onNext( nextSpy_ );
         expect( nextSpy_ ).not.toHaveBeenCalled();
         jasmine.Clock.tick( 0 );
         expect( nextSpy_ ).toHaveBeenCalled();
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'offers an "onBeforeNext" method whose callbacks are triggered on tick-after-onNext', function() {
         nextSpy_ = jasmine.createSpy( 'next spy' ).andCallFake( function() {
            expect( beforeNextSpy_ ).toHaveBeenCalled();
         } );

         heartbeat_.onBeforeNext( beforeNextSpy_ );
         expect( beforeNextSpy_ ).not.toHaveBeenCalled();
         jasmine.Clock.tick( 0 );
         heartbeat_.onNext( nextSpy_ );
         expect( beforeNextSpy_ ).not.toHaveBeenCalled();
         jasmine.Clock.tick( 0 );
         expect( nextSpy_ ).toHaveBeenCalled();
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'offers an "onAfterNext" method whose callbacks are triggered on tick-after-onNext', function() {
         nextSpy_ = jasmine.createSpy( 'next spy' ).andCallFake( function() {
            expect( beforeNextSpy_ ).not.toHaveBeenCalled();
         } );

         heartbeat_.onAfterNext( afterNextSpy_ );
         expect( afterNextSpy_ ).not.toHaveBeenCalled();
         jasmine.Clock.tick( 0 );
         heartbeat_.onNext( nextSpy_ );
         expect( afterNextSpy_ ).not.toHaveBeenCalled();
         jasmine.Clock.tick( 0 );
         expect( nextSpy_ ).toHaveBeenCalled();
         expect( afterNextSpy_ ).toHaveBeenCalled();
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'executes each callback exactly once', function() {
         heartbeat_.onBeforeNext( beforeNextSpy_ );
         heartbeat_.onAfterNext( afterNextSpy_ );
         heartbeat_.onNext( nextSpy_ );
         jasmine.Clock.tick( 0 );
         heartbeat_.onNext( nextSpy_ );
         jasmine.Clock.tick( 0 );
         heartbeat_.onNext( nextSpy_ );
         jasmine.Clock.tick( 0 );
         expect( nextSpy_.calls.length ).toEqual( 3 );
         expect( beforeNextSpy_.calls.length ).toEqual( 1 );
         expect( afterNextSpy_.calls.length ).toEqual( 1 );
      } );


   } );


   ////////////////////////////////////////////////////////////////////////////////////////////////////////

   describe( 'provides a service for DOM visibility information (axVisibilityService)', function() {

      var heartbeatMock_;
      var $rootScope;
      var mockWidgetScope_;
      var nestedScope_;

      var visibilityService_;

      beforeEach( function() {
         jasmine.Clock.useMock();
         angularMocks.module( portalServicesModule.name );
      } );

      beforeEach( angularMocks.module( function( $provide ) {
         heartbeatMock_ = portalMocks.mockHeartbeat();
         $provide.value( 'axHeartbeat', heartbeatMock_ );
      } ) );

      beforeEach( angularMocks.inject( function( _$rootScope_, axVisibilityService ) {
         $rootScope = _$rootScope_;
         mockWidgetScope_ = _$rootScope_.$new();
         mockWidgetScope_.widget = { area: 'mockArea' };
         nestedScope_ = mockWidgetScope_.$new();

         visibilityService_ = axVisibilityService;
         visibilityService_._reset();
      } ) );

      /////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'that allows to query area visibility (isVisible)', function() {
         expect( visibilityService_.isVisible( 'mockArea' ) ).toBe( false );
         visibilityService_._updateState( 'mockArea', true );
         expect( visibilityService_.isVisible( 'mockArea' ) ).toBe( true );
      } );

      /////////////////////////////////////////////////////////////////////////////////////////////////////

      describe( 'that creates a visibility handler for a given scope (handlerFor)', function() {

         var visibilityHandler_;
         var onShowSpy_;
         var onHideSpy_;
         var onChangeSpy_;

         beforeEach( function() {
            onShowSpy_ = jasmine.createSpy( 'onShow spy' );
            onHideSpy_ = jasmine.createSpy( 'onHide spy' );
            onChangeSpy_ = jasmine.createSpy( 'onChange spy' );
            visibilityHandler_ = visibilityService_.handlerFor( nestedScope_ );
            visibilityHandler_.onShow( onShowSpy_ ).onHide( onHideSpy_ ).onChange( onChangeSpy_ );
            // also test multiple handlers:
            visibilityHandler_.onShow( onShowSpy_ );
         } );

         //////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'which allows to query widget visibility (isVisible)', function() {
            expect( visibilityHandler_.isVisible() ).toBe( false );
            visibilityService_._updateState( 'mockArea', true );
            expect( visibilityHandler_.isVisible() ).toBe( true );
         } );

         //////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'which informs any onShow handler when the widget has become visible', function() {
            expect( onShowSpy_ ).not.toHaveBeenCalled();
            // simulate an event that induces a visibility change:
            visibilityService_._updateState( 'mockArea', true );
            expect( heartbeatMock_.onAfterNext ).toHaveBeenCalled();
            simulateEventBusTick();
            expect( onShowSpy_ ).toHaveBeenCalledWith( true );
            expect( onShowSpy_.calls.length ).toEqual( 2 );
         } );

         //////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'which informs any onHide handler when the widget has become invisible', function() {
            expect( onHideSpy_ ).not.toHaveBeenCalled();
            visibilityService_._updateState( 'mockArea', false );
            simulateEventBusTick();
            expect( onHideSpy_ ).toHaveBeenCalledWith( false );
         } );

         //////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'which informs any onChange handler about any change', function() {
            expect( onChangeSpy_ ).not.toHaveBeenCalled();
            // simulate an event that induces a visibility change:
            visibilityService_._updateState( 'mockArea', true );
            simulateEventBusTick();
            expect( onChangeSpy_ ).toHaveBeenCalledWith( true );

            onChangeSpy_.reset();
            visibilityService_._updateState( 'mockArea', true );
            simulateEventBusTick();
            expect( onChangeSpy_ ).not.toHaveBeenCalled();

            onChangeSpy_.reset();
            visibilityService_._updateState( 'mockArea', false );
            simulateEventBusTick();
            expect( onChangeSpy_ ).toHaveBeenCalledWith( false );
         } );

         //////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'which allows to remove any registered handlers manually', function() {
            visibilityHandler_.clear();
            visibilityService_._updateState( 'mockArea', true );
            simulateEventBusTick();
            expect( onShowSpy_ ).not.toHaveBeenCalled();

            visibilityService_._updateState( 'mockArea', false );
            simulateEventBusTick();
            expect( onChangeSpy_ ).not.toHaveBeenCalled();
            expect( onHideSpy_ ).not.toHaveBeenCalled();
         } );

         //////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'which removes any registered handlers when the governing scope is destroyed', function() {
            mockWidgetScope_.$destroy();
            visibilityService_._updateState( 'mockArea', true );
            simulateEventBusTick();
            expect( onShowSpy_ ).not.toHaveBeenCalled();

            visibilityService_._updateState( 'mockArea', false );
            simulateEventBusTick();
            expect( onChangeSpy_ ).not.toHaveBeenCalled();
            expect( onHideSpy_ ).not.toHaveBeenCalled();
         } );

         //////////////////////////////////////////////////////////////////////////////////////////////////

         function simulateEventBusTick() {
            heartbeatMock_.onNext( function() {} );
            jasmine.Clock.tick( 0 );
         }

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
         jasmine.Clock.useMock();

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
            return key === 'portal.theme' ? 'fakeTheme' : '';
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
         expect( eventBus_.subscribe ).toHaveBeenCalledWith( 'changeThemeRequest', jasmine.any( Function ), {
            subscriber: 'ThemeManager'
         } );
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      describe( 'when a changeThemeRequest event arrives', function() {

         beforeEach( function() {
            eventBus_.publish( 'changeThemeRequest.coolTheme', {
               theme: 'coolTheme'
            } );
            jasmine.Clock.tick( 0 );
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
            jasmine.Clock.tick( 0 );
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
