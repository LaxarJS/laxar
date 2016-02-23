/**
 * Copyright 2016 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
import runtimeServicesModule from '../runtime_services';
import pageModule from '../page';
import 'angular-mocks';
import log from '../../logging/log';
import * as fileResourceProvider from '../../file_resource_provider/file_resource_provider';
import { create as createFrpMock } from '../../testing/file_resource_provider_mock';
import { create as createHeartbeatMock } from '../../testing/heartbeat_mock';
import * as object from '../../utilities/object';
import paths from '../../loaders/paths';
import * as path from '../../utilities/path';

const { module, inject } = window;

describe( 'The axGlobalEventBus factory', () => {

   var eventBus;

   beforeEach( () => {
      module( runtimeServicesModule.name );
      module( pageModule.name );

      inject( axGlobalEventBus => eventBus = axGlobalEventBus );
   } );

   ////////////////////////////////////////////////////////////////////////////////////////////////////////

   it( 'returns an event bus instance', () => {
      expect( eventBus.publish ).toBeDefined();
      expect( eventBus.subscribe ).toBeDefined();
   } );

   ////////////////////////////////////////////////////////////////////////////////////////////////////////

   describe( 'attaches an error handler to the event', () => {

      beforeEach( done => {
         spyOn( log, 'error' );

         eventBus.subscribe( 'message', () => { throw new Error( 'error' ); } );
         eventBus.publish( 'message', {
            data: ''
         } )
         .then( done );
      } );

      /////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'that uses the global logger ', () => {
         expect( log.error ).toHaveBeenCalled();
      } );

      /////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'that marks the event object for anonymization in the log message', () => {
         var eventMessageCall = log.error.calls.all()
            .filter( call => call.args[1] === 'Published event' ).pop();

         expect( eventMessageCall.args[0] ).toEqual( '   - [0]: [1:%o:anonymize]' );
      } );

   } );

} );

///////////////////////////////////////////////////////////////////////////////////////////////////////////

describe( 'The axConfiguration factory', () => {

   var configuration;

   beforeEach( () => {
      window.laxar = {
         key_one: 'value_one',
         key_two: 'value_two'
      };
      module( runtimeServicesModule.name );
      inject( axConfiguration => configuration = axConfiguration );
   } );
   afterEach( () => delete window.laxar );

   ////////////////////////////////////////////////////////////////////////////////////////////////////////

   it( 'returns an configuration instance', () => {
      expect( configuration.get ).toBeDefined();
   } );

   ////////////////////////////////////////////////////////////////////////////////////////////////////////

   it( 'populates the configuration instance with values from a configuration file', () => {
      expect( configuration.get( 'key_one' ) ).toEqual( 'value_one' );
      expect( configuration.get( 'key_two' ) ).toEqual( 'value_two' );
   } );

   ////////////////////////////////////////////////////////////////////////////////////////////////////////

   it( 'lets the configuration return undefined for non-existing keys', () => {
      expect( configuration.get( 'key_three' ) ).toEqual( undefined );
   } );

   ////////////////////////////////////////////////////////////////////////////////////////////////////////

   it( 'lets the configuration return a default value for non-existing keys if given', () => {
      expect( configuration.get( 'key_three', 'my_default' ) ).toEqual( 'my_default' );
   } );

} );

///////////////////////////////////////////////////////////////////////////////////////////////////////////

describe( 'The axControls factory', () => {

   var mockDescriptor_;
   var controls;

   beforeEach( () => {
      mockDescriptor_ = {
         name: 'some-great-control',
         integration: { technology: 'plain' }
      };

      module( runtimeServicesModule.name );
      module( $provide => {
         $provide.value( 'axFileResourceProvider', createFrpMock( {
            [ path.resolveAssetPath( '/some-control/control.json', paths.CONTROLS ) ]: mockDescriptor_
         } ) );
      } );
      inject( axControls => controls = axControls );
   } );

   ////////////////////////////////////////////////////////////////////////////////////////////////////////

   it( 'returns an axControls service instance', () => {
      expect( controls.provide ).toEqual( jasmine.any( Function ) );
      expect( controls.load ).toEqual( jasmine.any( Function ) );
      expect( controls.resolve ).toEqual( jasmine.any( Function ) );
      expect( controls.descriptor ).toEqual( jasmine.any( Function ) );
   } );

   ////////////////////////////////////////////////////////////////////////////////////////////////////////

   it( 'allows to resolve a control path', () => {
      expect( controls.resolve( '/some-control' ) ).toMatch( '/some-control' );
   } );

   ////////////////////////////////////////////////////////////////////////////////////////////////////////

   describe( 'asked to load an existing control descriptor', () => {

      var descriptor_;

      beforeEach( done => {
         controls.load( '/some-control' )
            .then( descriptor => descriptor_ = descriptor )
            .then( done );
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'fetches the descriptor from the file resource provider', () => {
         expect( descriptor_ ).toEqual( mockDescriptor_ );
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      describe( 'and then asked to provide the control descriptor', () => {

         beforeEach( () => {
            descriptor_ = controls.descriptor( '/some-control' );
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'synchronously hands out the descriptor', () => {
            expect( descriptor_ ).toEqual( mockDescriptor_ );
         } );
      } );
   } );

   ////////////////////////////////////////////////////////////////////////////////////////////////////////

   describe( 'asked to load a non-existing control descriptor', () => {

      var descriptor_;

      beforeEach( done => {
         controls.load( '/missing-control' )
            .then( descriptor => descriptor_ = descriptor )
            .then( done );
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'synthesizes the descriptor', () => {
         expect( descriptor_ ).toEqual( {
            _compatibility_0x: true,
            name: 'missing-control',
            integration: { technology: 'angular' }
         } );
      } );
   } );

   ////////////////////////////////////////////////////////////////////////////////////////////////////////

   // TODO disabled for now, until we know how to really load control modules
   // describe( 'asked to provide a control implementation module', () => {
   //
   //    var fakeModule_;
   //    var provideResult_;
   //
   //    beforeEach( done => {
   //       // fakeModule_ = require( '/some-control/some-great-control' );
   //       System.import( 'lib/runtime/spec/mocks/control_mock' )
   //          .then( fakeModule => fakeModule_ = fakeModule )
   //          .then( () => controls.load( '/some-control' ) )
   //          .then( () => {
   //             // TODO crude hack for now. Control loading must be changed a bit before it's working again ...
   //             return controls.provide( '/some-control' );
   //          } )
   //          .then( result => provideResult_ = result )
   //          .then( done, done.fail );
   //    } );
   //
   //    ////////////////////////////////////////////////////////////////////////////////////////////////////////
   //
   //    it( 'returns the matching module', () => {
   //       expect( provideResult_ ).toBe( fakeModule_ );
   //       expect( provideResult_.createFakeControl() ).toEqual( 'FAKE' );
   //    } );
   //
   // } );

} );

///////////////////////////////////////////////////////////////////////////////////////////////////////////

describe( 'The axFileResourceProvider factory', () => {

   var windowMock_;

   beforeEach( () => {
      module( runtimeServicesModule.name );

      windowMock_ = {
         laxar: {},
         navigator: window.navigator
      };
      module( $provide => {
         $provide.value( '$window', windowMock_ );
         $provide.value( 'axConfiguration', {
            get: ( key, optionalDefault ) => object.path( windowMock_.laxar, key, optionalDefault )
         } );
      } );
   } );

   ////////////////////////////////////////////////////////////////////////////////////////////////////////

   it( 'returns a file resource provider instance', inject( function( axFileResourceProvider ) {
      expect( axFileResourceProvider.provide ).toBeDefined();
      expect( axFileResourceProvider.isAvailable ).toBeDefined();
      expect( axFileResourceProvider.setFileListingUri ).toBeDefined();
      expect( axFileResourceProvider.setFileListingContents ).toBeDefined();
   } ) );

   ////////////////////////////////////////////////////////////////////////////////////////////////////////

   describe( 'when there are file listings configured', () => {

      beforeEach( () => {

         windowMock_.laxar = {
            fileListings: {
               'includes/widgets': '/var/listing/includes_widgets.json',
               'includes/themes': { 'default.theme': { css: { 'theme.css': 1 } } }
            }
         };

         var proto = fileResourceProvider.create( {}, {}, '' ).constructor.prototype;
         spyOn( proto, 'setFileListingUri' );
         spyOn( proto, 'setFileListingContents' );
      } );

      /////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'sets the given filelistings', inject( axFileResourceProvider => {
         expect( axFileResourceProvider.setFileListingUri )
            .toHaveBeenCalledWith( 'includes/widgets', '/var/listing/includes_widgets.json' );
         expect( axFileResourceProvider.setFileListingContents )
            .toHaveBeenCalledWith( 'includes/themes', { 'default.theme': { css: { 'theme.css': 1 } } } );
      } ) );

   } );

} );

///////////////////////////////////////////////////////////////////////////////////////////////////////////

describe( 'A timestamp function from the axTimestamp-factory', () => {

   var timestamp_;

   beforeEach( () => {
      module( runtimeServicesModule.name );
   } );

   beforeEach( inject( axTimestamp => {
      timestamp_ = axTimestamp;
   } ) );

   ////////////////////////////////////////////////////////////////////////////////////////////////////////

   it( 'provides a timestamp matching the ECMAScript environment time', () => {
      var tolerance = 20;

      var exactDate = new Date().getTime();
      var result = timestamp_();
      expect( exactDate ).toBeLessThan( result + tolerance );
      expect( exactDate ).toBeGreaterThan( result - tolerance );
   } );

} );

///////////////////////////////////////////////////////////////////////////////////////////////////////////

describe( 'A heartbeat from the axHeartbeat-factory', () => {

   var $rootScope;
   var heartbeat_;
   var fakeController_;

   var beforeNextSpy_;
   var nextSpy_;
   var afterNextSpy_;

   beforeEach( () => {
      fakeController_ = {
         applyViewChanges: jasmine.createSpy( 'applyViewChanges' )
      };

      module( runtimeServicesModule.name );
      module( $provide => {
         $provide.value( 'axPageService', { controller: () => fakeController_ } );
      } );
   } );

   beforeEach( () => {
      jasmine.clock().install();

      inject( ( axHeartbeat, _$rootScope_, $window ) => {
         $rootScope = _$rootScope_;
         heartbeat_ = axHeartbeat;
         spyOn( $rootScope, '$digest' ).and.callThrough();
      } );

      beforeNextSpy_ = jasmine.createSpy( 'beforeNext spy' );
      nextSpy_ = jasmine.createSpy( 'next spy' );
      afterNextSpy_ = jasmine.createSpy( 'afterNext spy' );
   } );
   afterEach( () => jasmine.clock().uninstall() );

   ////////////////////////////////////////////////////////////////////////////////////////////////////////

   it( 'offers an "onNext" method whose callbacks are triggered on tick', () => {
      heartbeat_.onNext( nextSpy_ );
      expect( nextSpy_ ).not.toHaveBeenCalled();
      jasmine.clock().tick( 0 );
      expect( nextSpy_ ).toHaveBeenCalled();
   } );

   ////////////////////////////////////////////////////////////////////////////////////////////////////////

   it( 'offers an "onBeforeNext" method whose callbacks are triggered on tick-after-onNext', () => {
      nextSpy_ = jasmine.createSpy( 'next spy' ).and.callFake( () => {
         expect( beforeNextSpy_ ).toHaveBeenCalled();
      } );

      heartbeat_.onBeforeNext( beforeNextSpy_ );
      expect( beforeNextSpy_ ).not.toHaveBeenCalled();
      jasmine.clock().tick( 0 );
      heartbeat_.onNext( nextSpy_ );
      expect( beforeNextSpy_ ).not.toHaveBeenCalled();
      jasmine.clock().tick( 0 );
      expect( nextSpy_ ).toHaveBeenCalled();
   } );

   ////////////////////////////////////////////////////////////////////////////////////////////////////////

   it( 'offers an "onAfterNext" method whose callbacks are triggered on tick-after-onNext', () => {
      nextSpy_ = jasmine.createSpy( 'next spy' ).and.callFake( () => {
         expect( beforeNextSpy_ ).not.toHaveBeenCalled();
      } );

      heartbeat_.onAfterNext( afterNextSpy_ );
      expect( afterNextSpy_ ).not.toHaveBeenCalled();
      jasmine.clock().tick( 0 );
      heartbeat_.onNext( nextSpy_ );
      expect( afterNextSpy_ ).not.toHaveBeenCalled();
      jasmine.clock().tick( 0 );
      expect( nextSpy_ ).toHaveBeenCalled();
      expect( afterNextSpy_ ).toHaveBeenCalled();
   } );

   ////////////////////////////////////////////////////////////////////////////////////////////////////////

   it( 'executes each callback exactly once', () => {
      heartbeat_.onBeforeNext( beforeNextSpy_ );
      heartbeat_.onAfterNext( afterNextSpy_ );
      heartbeat_.onNext( nextSpy_ );
      jasmine.clock().tick( 0 );
      heartbeat_.onNext( nextSpy_ );
      jasmine.clock().tick( 0 );
      heartbeat_.onNext( nextSpy_ );
      jasmine.clock().tick( 0 );

      expect( nextSpy_.calls.count() ).toEqual( 3 );
      expect( beforeNextSpy_.calls.count() ).toEqual( 1 );
      expect( afterNextSpy_.calls.count() ).toEqual( 1 );
   } );

   ////////////////////////////////////////////////////////////////////////////////////////////////////////

   it( 'calls applyViewChanges of the current page controller (#214)', () => {
      heartbeat_.onNext( nextSpy_ );
      jasmine.clock().tick( 0 );

      expect( fakeController_.applyViewChanges ).toHaveBeenCalled();
   } );

   ////////////////////////////////////////////////////////////////////////////////////////////////////////

   it( 'starts a digest cycle if the page controller does not start one (#214)', () => {
      $rootScope.$digest.calls.reset();
      heartbeat_.onNext( nextSpy_ );
      jasmine.clock().tick( 0 );

      expect( $rootScope.$digest.calls.count() ).toBe( 1 );
   } );

   ////////////////////////////////////////////////////////////////////////////////////////////////////////

   it( 'does not start an extra digest cycle if the page controller started one (#214)', () => {
      $rootScope.$digest.calls.reset();
      fakeController_.applyViewChanges.and.callFake( () => {
         $rootScope.$apply();
      } );

      heartbeat_.onNext( nextSpy_ );
      jasmine.clock().tick( 0 );

      expect( $rootScope.$digest.calls.count() ).toBe( 1 );
   } );

} );

///////////////////////////////////////////////////////////////////////////////////////////////////////////

describe( 'The axVisibilityService', () => {

   var heartbeatMock_;
   var mockWidgetScope_;
   var nestedScope_;

   var visibilityService_;

   beforeEach( () => {
      heartbeatMock_ = createHeartbeatMock();

      module( runtimeServicesModule.name );
      module( $provide => {
         $provide.value( 'axHeartbeat', heartbeatMock_ );
      } );
   } );

   beforeEach( inject( ( $rootScope, axVisibilityService ) => {
      mockWidgetScope_ = $rootScope.$new();
      mockWidgetScope_.widget = { area: 'mockArea' };
      nestedScope_ = mockWidgetScope_.$new();

      visibilityService_ = axVisibilityService;
      visibilityService_._reset();
   } ) );

   ////////////////////////////////////////////////////////////////////////////////////////////////////////

   it( 'allows to query area visibility (isVisible)', () => {
      expect( visibilityService_.isVisible( 'mockArea' ) ).toBe( false );
      visibilityService_._updateState( 'mockArea', true );
      expect( visibilityService_.isVisible( 'mockArea' ) ).toBe( true );
   } );

   ////////////////////////////////////////////////////////////////////////////////////////////////////////

   describe( 'allows to create a visibility handler for a given scope (handlerFor)', () => {

      var visibilityHandler_;
      var onShowSpy_;
      var onHideSpy_;
      var onChangeSpy_;

      beforeEach( () => {
         onShowSpy_ = jasmine.createSpy( 'onShow spy' );
         onHideSpy_ = jasmine.createSpy( 'onHide spy' );
         onChangeSpy_ = jasmine.createSpy( 'onChange spy' );
         visibilityHandler_ = visibilityService_.handlerFor( nestedScope_ );
         visibilityHandler_.onShow( onShowSpy_ ).onHide( onHideSpy_ ).onChange( onChangeSpy_ );
         // also test multiple handlers:
         visibilityHandler_.onShow( onShowSpy_ );
      } );

      /////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'which allows to query widget visibility (isVisible)', () => {
         expect( visibilityHandler_.isVisible() ).toBe( false );
         visibilityService_._updateState( 'mockArea', true );
         expect( visibilityHandler_.isVisible() ).toBe( true );
      } );

      /////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'which informs any onShow handler when the widget has become visible', () => {
         expect( onShowSpy_ ).not.toHaveBeenCalled();
         // simulate an event that induces a visibility change:
         visibilityService_._updateState( 'mockArea', true );
         expect( heartbeatMock_.onAfterNext ).toHaveBeenCalled();
         simulateEventBusTick();
         expect( onShowSpy_ ).toHaveBeenCalledWith( true );
         expect( onShowSpy_.calls.count() ).toEqual( 2 );
      } );

      /////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'which informs any onHide handler when the widget has become invisible', () => {
         expect( onHideSpy_ ).not.toHaveBeenCalled();
         visibilityService_._updateState( 'mockArea', false );
         simulateEventBusTick();
         expect( onHideSpy_ ).toHaveBeenCalledWith( false );
      } );

      /////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'which informs any onChange handler about any change', () => {
         expect( onChangeSpy_ ).not.toHaveBeenCalled();
         // simulate an event that induces a visibility change:
         visibilityService_._updateState( 'mockArea', true );
         simulateEventBusTick();
         expect( onChangeSpy_ ).toHaveBeenCalledWith( true );

         onChangeSpy_.calls.reset();
         visibilityService_._updateState( 'mockArea', true );
         simulateEventBusTick();
         expect( onChangeSpy_ ).not.toHaveBeenCalled();

         onChangeSpy_.calls.reset();
         visibilityService_._updateState( 'mockArea', false );
         simulateEventBusTick();
         expect( onChangeSpy_ ).toHaveBeenCalledWith( false );
      } );

      /////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'which allows to remove any registered handlers manually', () => {
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

      it( 'which removes any registered handlers when the governing scope is destroyed', () => {
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
         heartbeatMock_.onNext( () => {} );
         heartbeatMock_.flush();
      }

   } );

} );

///////////////////////////////////////////////////////////////////////////////////////////////////////////

describe( 'The axCssLoader-factory', () => {

   var linkNodeMock;
   var cssLoader_;

   beforeEach( () => {
      module( runtimeServicesModule.name );

      inject( axCssLoader => {
         cssLoader_ = axCssLoader;
      } );
   } );

   ////////////////////////////////////////////////////////////////////////////////////////////////////////

   it( 'returns a css loader instance', () => {
      expect( cssLoader_.load ).toBeDefined();
   } );

} );

///////////////////////////////////////////////////////////////////////////////////////////////////////////

describe( 'An $exceptionHandler provider', () => {

   beforeEach( () => {
      module( runtimeServicesModule.name );
      spyOn( log, 'error' );
   } );

   ////////////////////////////////////////////////////////////////////////////////////////////////////////

   // no need to inject the provider here, as it automatically overwrites the internal one
   it( 'overwrites the internal one with an implementation delegating to log.error', inject( $timeout => {
      // simple way to trigger the $exceptionHandler
      $timeout( () => {
         throw new Error( 'my error' );
      } );
      $timeout.flush();

      expect( log.error ).toHaveBeenCalledWith( 'There was an exception: my error, \nstack: ' );
      expect( log.error ).toHaveBeenCalledWith( '  Cause: undefined' );
   } ) );

} );

///////////////////////////////////////////////////////////////////////////////////////////////////////////

describe( 'The axThemeManager-factory', () => {

   var themeManager_;

   beforeEach( () => {
      module( runtimeServicesModule.name );
      module( pageModule.name );
      module( $provide => {
         $provide.value( 'axConfiguration', {
            get: ( key, optionalDefault ) => key === 'theme' ? 'fakeTheme' : optionalDefault
         } );
      } );

      inject( axThemeManager => {
         themeManager_ = axThemeManager;
      } );
   } );

   ////////////////////////////////////////////////////////////////////////////////////////////////////////

   it( 'creates the theme manager instance with the theme from configuration', () => {
      expect( themeManager_.getTheme() ).toEqual( 'fakeTheme' );
   } );

} );

///////////////////////////////////////////////////////////////////////////////////////////////////////////

describe( 'An axLogHttpInterceptor', () => {

   var $httpBackend_;
   const global = new Function( 'return this' )();

   function configure( loggingHttpHeader ) {
      // TODO this since "get" is readonly since using es6 modules. This is obsolete as soon as
      // every module has to expose a create function for fresh creation and dependency injection
      object.setPath( global, 'laxar.logging.http.header', loggingHttpHeader );

      module( runtimeServicesModule.name );

      inject( $httpBackend => {
         $httpBackend_ = $httpBackend;
      } );

      // remove all existing tags that could interfere with out test
      Object.keys( log.gatherTags() ).forEach( tag => log.removeTag( tag ) );
   }

   afterEach( () => {
      delete global.laxar;
      $httpBackend_.verifyNoOutstandingExpectation();
   } );

   ////////////////////////////////////////////////////////////////////////////////////////////////////////

   describe( 'with configured header', () => {

      beforeEach( () => {
         configure( 'x-0815-tags' );
      } );

      /////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'intercepts requests', inject( axLogHttpInterceptor => {
         expect( axLogHttpInterceptor.request ).toEqual( jasmine.any( Function ) );
      } ) );

      /////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'generates the correct header', inject( $http => {
         log.addTag( 'MY_TAG', 'test' );
         $httpBackend_.expectGET( '/myService' ).respond( ( method, url, data, headers ) => {
            expect( headers[ 'x-0815-tags' ] ).toEqual( '[MY_TAG:test]' );
            return [ 200 ];
         } );
         $http.get( '/myService' );
         $httpBackend_.flush();
      } ) );

   } );

   ////////////////////////////////////////////////////////////////////////////////////////////////////////

   describe( 'without configured header', () => {

      beforeEach( () => {
         configure( null );
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'does not intercept requests', inject( axLogHttpInterceptor => {
         expect( axLogHttpInterceptor.request ).toBeUndefined();
      } ) );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'generates no additional header', inject( $http => {
         $httpBackend_.expectGET( '/myService' ).respond( ( method, url, data, headers ) => {
            expect( headers[ 'x-0815-tags' ] ).toEqual( undefined );

            return [ 200 ];
         } );
         $http.get( '/myService' );
         $httpBackend_.flush();
      } ) );

   } );

} );
