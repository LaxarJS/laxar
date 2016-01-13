/**
 * Copyright 2016 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
define( [
   '../runtime_services',
   '../page',
   'angular-mocks',
   '../../logging/log',
   '../../file_resource_provider/file_resource_provider',
   '../../testing/jquery_mock',
   '../../testing/portal_mocks',
   '../../utilities/configuration',
   '../../utilities/object'
], function( runtimeServicesModule, pageModule, ngMocks, log, fileResourceProvider, jqueryMock, portalMocks, configuration, object ) {
   'use strict';

   describe( 'The axGlobalEventBus factory', function() {

      var eventBus;

      beforeEach( function() {
         jasmine.Clock.useMock();
         ngMocks.module( runtimeServicesModule.name );
         ngMocks.module( pageModule.name );

         ngMocks.inject( function( axGlobalEventBus ) {
            eventBus = axGlobalEventBus;
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

   describe( 'The axConfiguration factory', function() {

      beforeEach( function() {
         ngMocks.module( runtimeServicesModule.name );
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'returns an configuration instance', ngMocks.inject( function( axConfiguration ) {
         expect( axConfiguration.get ).toBeDefined();
      } ) );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'populates the configuration instance with values from a configuration file', ngMocks.inject( function( axConfiguration ) {
         expect( axConfiguration.get( 'key_one' ) ).toEqual( 'value_one' );
         expect( axConfiguration.get( 'key_two' ) ).toEqual( 'value_two' );
      } ) );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'lets the configuration return null for non-existing keys', ngMocks.inject( function( axConfiguration ) {
         expect( axConfiguration.get( 'key_three' ) ).toEqual( null );
      } ) );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'lets the configuration return a default value for non-existing keys if given', ngMocks.inject( function( axConfiguration ) {
         expect( axConfiguration.get( 'key_three', 'my_default' ) ).toEqual( 'my_default' );
      } ) );

   } );

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   describe( 'The axControls factory', function() {

      var mockDescriptor_;

      beforeEach( function() {
         jasmine.Clock.useMock();
         mockDescriptor_ = {
            name: 'some-great-control',
            integration: { technology: 'plain' }
         };

         ngMocks.module( runtimeServicesModule.name );
         ngMocks.module( function( $provide ) {
            $provide.value( 'axFileResourceProvider', portalMocks.mockFileResourceProvider({
               '/some-control/control.json': mockDescriptor_
            }) );
         } );
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'returns an axControls service instance', ngMocks.inject( function( axControls ) {
         expect( axControls.provide ).toEqual( jasmine.any( Function ) );
         expect( axControls.load ).toEqual( jasmine.any( Function ) );
         expect( axControls.resolve ).toEqual( jasmine.any( Function ) );
         expect( axControls.descriptor ).toEqual( jasmine.any( Function ) );
      } ) );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'allows to resolve a control path', ngMocks.inject( function( axControls ) {
         expect( axControls.resolve( '/some-control' ) ).toEqual( '/some-control' );
      } ) );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      describe( 'asked to load an existing control descriptor', function() {
         var descriptor_;
         beforeEach( ngMocks.inject( function( axControls ) {
            axControls.load( '/some-control' ).then( function( descriptor ) { descriptor_ = descriptor; } );
            jasmine.Clock.tick( 0 );
         } ) );

         it( 'fetches the descriptor from the file resource provider', function() {
            expect( descriptor_ ).toEqual( mockDescriptor_ );
         } );

         ////////////////////////////////////////////////////////////////////////////////////////////////////////

         describe( 'and then asked to provide the control descriptor', function() {

            beforeEach( ngMocks.inject( function( axControls ) {
               descriptor_ = axControls.descriptor( '/some-control' );
            } ) );

            it( 'synchronously hands out the descriptor', function() {
               expect( descriptor_ ).toEqual( mockDescriptor_ );
            } );
         } );
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      describe( 'asked to load a non-existing control descriptor', function() {
         var descriptor_;
         beforeEach( ngMocks.inject( function( axControls ) {
            axControls.load( '/missing-control' ).then( function( descriptor ) { descriptor_ = descriptor; } );
            jasmine.Clock.tick( 0 );
         } ) );

         it( 'synthesizes the descriptor', function() {
            expect( descriptor_ ).toEqual( {
               _compatibility_0x: true,
               name: 'missing-control',
               integration: { technology: 'angular' }
            } );
         } );
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      describe( 'asked to provide a control implementation module', function() {
         var fakeModule_;
         var provideResult_;
         beforeEach( ngMocks.inject( function( axControls ) {
            fakeModule_ = require( '/some-control/some-great-control' );
            axControls.load( '/some-control' ).then( function() {
               provideResult_ = axControls.provide( '/some-control' );
            } );
            jasmine.Clock.tick( 0 );
         } ) );

         it( 'returns the matching module', function() {
            expect( provideResult_ ).toBe( fakeModule_ );
            expect( provideResult_.createFakeControl() ).toEqual( 'FAKE' );
         } );
      } );

   } );

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   describe( 'The axFileResourceProvider factory', function() {

      var windowMock_;

      beforeEach( function() {
         ngMocks.module( runtimeServicesModule.name );

         windowMock_ = {
            laxar: {},
            navigator: window.navigator
         };
         ngMocks.module( function( $provide ) {
            $provide.value( '$window', windowMock_ );
            $provide.value( 'axConfiguration', {
               get: function( key, optionalDefault ) {
                  return object.path( windowMock_.laxar, key, optionalDefault );
               }
            } );
         } );
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'returns a file resource provider instance', ngMocks.inject( function( axFileResourceProvider ) {
         expect( axFileResourceProvider.provide ).toBeDefined();
         expect( axFileResourceProvider.isAvailable ).toBeDefined();
         expect( axFileResourceProvider.setFileListingUri ).toBeDefined();
         expect( axFileResourceProvider.setFileListingContents ).toBeDefined();
      } ) );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      describe( 'when there are file listings configured', function() {

         beforeEach( function() {

            windowMock_.laxar = {
               fileListings: {
                  'includes/widgets': '/var/listing/includes_widgets.json',
                  'includes/themes': { 'default.theme': { css: { 'theme.css': 1 } } }
               }
            };

            var proto = fileResourceProvider.create( '', '' ).constructor.prototype;
            spyOn( proto, 'setFileListingUri' );
            spyOn( proto, 'setFileListingContents' );
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'sets the given filelistings', ngMocks.inject( function( axFileResourceProvider ) {
            expect( axFileResourceProvider.setFileListingUri )
               .toHaveBeenCalledWith( 'includes/widgets', '/var/listing/includes_widgets.json' );
            expect( axFileResourceProvider.setFileListingContents )
               .toHaveBeenCalledWith( 'includes/themes', { 'default.theme': { css: { 'theme.css': 1 } } } );
         } ) );

      } );

   } );

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   describe( 'A timestamp function from the axTimestamp-factory', function() {

      var timestamp_;

      beforeEach( function() {
         ngMocks.module( runtimeServicesModule.name );
      } );

      beforeEach( ngMocks.inject( function( axTimestamp ) {
         timestamp_ = axTimestamp;
      } ) );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'provides a timestamp matching the ECMAScript environment time', function() {
         var tolerance = 20;

         var exactDate = new Date().getTime();
         var result = timestamp_();
         expect( exactDate ).toBeLessThan( result + tolerance );
         expect( exactDate ).toBeGreaterThan( result - tolerance );
      } );

   } );

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   describe( 'A heartbeat from the axHeartbeat-factory', function() {

      var $rootScope;
      var heartbeat_;
      var fakeController_;

      var beforeNextSpy_;
      var nextSpy_;
      var afterNextSpy_;

      beforeEach( function() {
         fakeController_ = {
            applyViewChanges: jasmine.createSpy( 'applyViewChanges' )
         };

         ngMocks.module( runtimeServicesModule.name );
         ngMocks.module( function( $provide ) {
            $provide.value( 'axPageService', { controller: function() { return fakeController_; } } );
         } );
      } );

      beforeEach( function() {
         jasmine.Clock.useMock();

         ngMocks.inject( function( axHeartbeat, _$rootScope_ ) {
            jasmine.Clock.useMock();

            $rootScope = _$rootScope_;
            heartbeat_ = axHeartbeat;
            spyOn( $rootScope, '$digest' ).andCallThrough();
         } );

         beforeNextSpy_ = jasmine.createSpy( 'beforeNext spy' );
         nextSpy_ = jasmine.createSpy( 'next spy' );
         afterNextSpy_ = jasmine.createSpy( 'afterNext spy' );
      } );

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

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'calls applyViewChanges of the current page controller (#214)', function() {
         heartbeat_.onNext( nextSpy_ );
         jasmine.Clock.tick( 0 );

         expect( fakeController_.applyViewChanges ).toHaveBeenCalled();
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'starts a digest cycle if the page controller does not start one (#214)', function() {
         $rootScope.$digest.reset();
         heartbeat_.onNext( nextSpy_ );
         jasmine.Clock.tick( 0 );

         expect( $rootScope.$digest.calls.length ).toBe( 1 );
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'does not start an extra digest cycle if the page controller started one (#214)', function() {
         $rootScope.$digest.reset();
         fakeController_.applyViewChanges.andCallFake( function() {
            $rootScope.$apply();
         } );

         heartbeat_.onNext( nextSpy_ );
         jasmine.Clock.tick( 0 );

         expect( $rootScope.$digest.calls.length ).toBe( 1 );
      } );

   } );


   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   describe( 'The axVisibilityService', function() {

      var heartbeatMock_;
      var $rootScope;
      var mockWidgetScope_;
      var nestedScope_;

      var visibilityService_;

      beforeEach( function() {
         jasmine.Clock.useMock();
         ngMocks.module( runtimeServicesModule.name );
      } );

      beforeEach( ngMocks.module( function( $provide ) {
         heartbeatMock_ = portalMocks.mockHeartbeat();
         $provide.value( 'axHeartbeat', heartbeatMock_ );
      } ) );

      beforeEach( ngMocks.inject( function( _$rootScope_, axVisibilityService ) {
         $rootScope = _$rootScope_;
         mockWidgetScope_ = _$rootScope_.$new();
         mockWidgetScope_.widget = { area: 'mockArea' };
         nestedScope_ = mockWidgetScope_.$new();

         visibilityService_ = axVisibilityService;
         visibilityService_._reset();
      } ) );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'allows to query area visibility (isVisible)', function() {
         expect( visibilityService_.isVisible( 'mockArea' ) ).toBe( false );
         visibilityService_._updateState( 'mockArea', true );
         expect( visibilityService_.isVisible( 'mockArea' ) ).toBe( true );
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      describe( 'allows to create a visibility handler for a given scope (handlerFor)', function() {

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

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'which allows to query widget visibility (isVisible)', function() {
            expect( visibilityHandler_.isVisible() ).toBe( false );
            visibilityService_._updateState( 'mockArea', true );
            expect( visibilityHandler_.isVisible() ).toBe( true );
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'which informs any onShow handler when the widget has become visible', function() {
            expect( onShowSpy_ ).not.toHaveBeenCalled();
            // simulate an event that induces a visibility change:
            visibilityService_._updateState( 'mockArea', true );
            expect( heartbeatMock_.onAfterNext ).toHaveBeenCalled();
            simulateEventBusTick();
            expect( onShowSpy_ ).toHaveBeenCalledWith( true );
            expect( onShowSpy_.calls.length ).toEqual( 2 );
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'which informs any onHide handler when the widget has become invisible', function() {
            expect( onHideSpy_ ).not.toHaveBeenCalled();
            visibilityService_._updateState( 'mockArea', false );
            simulateEventBusTick();
            expect( onHideSpy_ ).toHaveBeenCalledWith( false );
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

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

         /////////////////////////////////////////////////////////////////////////////////////////////////////

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

         /////////////////////////////////////////////////////////////////////////////////////////////////////

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

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         function simulateEventBusTick() {
            heartbeatMock_.onNext( function() {} );
            jasmine.Clock.tick( 0 );
         }

      } );

   } );

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   describe( 'The axCssLoader-factory', function() {

      var linkNodeMock;

      beforeEach( function() {
         ngMocks.module( runtimeServicesModule.name );

         linkNodeMock = {};
         jqueryMock.mockResult( 'filter', 'link', [ linkNodeMock ] );
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      afterEach( function() {
         jqueryMock.mockReset();
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'returns a css loader instance', ngMocks.inject( function( axCssLoader ) {
         expect( axCssLoader.load ).toBeDefined();
      } ) );

   } );

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   describe( 'An $exceptionHandler provider', function() {

      beforeEach( function() {
         ngMocks.module( runtimeServicesModule.name );
         spyOn( log, 'error' );
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      // no need to inject the provider here, as it automatically overwrites the internal one
      it( 'overwrites the internal one with an implementation delegating to log.error', ngMocks.inject( function( $timeout ) {
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

   describe( 'The axThemeManager-factory', function() {

      var eventBus_;
      var $timeout_;
      var $rootScope_;
      var themeManager_;

      beforeEach( function() {
         jasmine.Clock.useMock();

         ngMocks.module( runtimeServicesModule.name );
         ngMocks.module( pageModule.name );
         ngMocks.module( function( $provide ) {
            $provide.value( 'axConfiguration', {
               get: function( key, optionalDefault ) {
                  return key === 'theme' ? 'fakeTheme' : optionalDefault;
               }
            } );
         } );
      } );

      beforeEach( ngMocks.inject( function( $timeout, $rootScope, axGlobalEventBus ) {
         eventBus_ = axGlobalEventBus;
         spyOn( eventBus_, 'subscribe' ).andCallThrough();
         spyOn( eventBus_, 'publish' ).andCallThrough();

         $timeout_ = $timeout;
         $rootScope_ = $rootScope;

         ngMocks.inject( function( axThemeManager ) {
            themeManager_ = axThemeManager;
         } );
      } ) );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'creates the theme manager instance with the theme from configuration', function() {
         expect( themeManager_.getTheme() ).toEqual( 'fakeTheme' );
      } );

   } );

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   describe( 'An axLogHttpInterceptor', function() {

      var $httpBackend_;

      function configure( loggingHttpHeader ) {
         var origGet_ = configuration.get;
         spyOn( configuration, 'get' ).andCallFake( function( key ) {
            return key === 'logging.http.header' ? loggingHttpHeader : origGet_( key );
         } );

         ngMocks.module( runtimeServicesModule.name );

         ngMocks.inject( function( $httpBackend ) {
            $httpBackend_ = $httpBackend;
         } );
      }

      afterEach( function() {
         $httpBackend_.verifyNoOutstandingExpectation();
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      describe( 'with configured header', function() {

         beforeEach( function() {
            configure( 'x-0815-tags' );
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         afterEach( function() {
            $httpBackend_.verifyNoOutstandingExpectation();
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'intercepts requests', ngMocks.inject( function( axLogHttpInterceptor ) {
            expect( axLogHttpInterceptor.request ).toEqual( jasmine.any( Function ) );
         } ) );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'generates the correct header', ngMocks.inject( function( $http ) {
            log.addTag( 'MY_TAG', 'test' );
            $httpBackend_.expectGET( '/myService' ).respond( function( method, url, data, headers ) {
               expect( headers[ 'x-0815-tags' ] ).toEqual( '[MY_TAG:test]' );
               return [ 200 ];
            } );
            $http.get( '/myService' );
            $httpBackend_.flush();
         } ) );

      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      describe( 'without configured header', function() {

         beforeEach( function() {
            configure( null );
         } );

         it( 'does not intercept requests', ngMocks.inject( function( axLogHttpInterceptor ) {
            expect( axLogHttpInterceptor.request ).toBeUndefined();
         } ) );

         it( 'generates no additional header', ngMocks.inject( function( $http ) {
            $httpBackend_.expectGET( '/myService' ).respond( function( method, url, data, headers ) {
               expect( headers[ 'x-0815-tags' ] ).toEqual( null );

               return [ 200 ];
            } );
            $http.get( '/myService' );
            $httpBackend_.flush();
         } ) );

      } );

   } );


} );
