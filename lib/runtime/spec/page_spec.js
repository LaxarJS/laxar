/**
 * Copyright 2015 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
import pageModule from '../page';
import 'angular-mocks';
import * as q from 'q';
import * as widgetLoaderModule from '../../loaders/widget_loader';
import paths from '../../loaders/paths';
import runtimeServicesModule from '../runtime_services';
import * as layoutWidgetAdapter from '../layout_widget_adapter';
import { create as createEventBusMock } from '../../testing/event_bus_mock';
import { create as createFrpMock } from '../../testing/file_resource_provider_mock';
import testData from './spec_data';

const { module, inject } = window;


describe( 'The axPage module', () => {

   var theme_ = 'blue';

   var configurationMock_;
   var eventBusMock_;
   var fileResourceProviderMock_;
   var heartbeatMock_;
   var layoutLoaderMock_;
   var themeManagerMock_;

   var widgetLoaderMock_;
   var widgetAdapterMocks_;
   var pageServiceMock_;

   beforeEach( () => {

      eventBusMock_ = createEventBusMock();
      configurationMock_ = mockConfiguration();
      layoutLoaderMock_ = mockLayoutLoader();
      fileResourceProviderMock_ = mockFileResourceProvider();
      themeManagerMock_ = mockThemeManager();
      widgetLoaderMock_ = mockWidgetLoader();
      widgetAdapterMocks_ = {};

      pageServiceMock_ = mockPageService();
      spyOn( widgetLoaderModule, 'create' ).and.returnValue( widgetLoaderMock_ );
      spyOn( layoutWidgetAdapter, 'create' ).and.callThrough();

      module( runtimeServicesModule.name );
      module( pageModule.name );

      var fakeServices = {
         $q: q,
         $timeout: ( cb, ms ) => setTimeout( cb, ms || 0 ),
         axPageService: pageServiceMock_,
         axConfiguration: configurationMock_,
         axLayoutLoader: layoutLoaderMock_,
         axGlobalEventBus: eventBusMock_,
         axFileResourceProvider: fileResourceProviderMock_,
         axThemeManager: themeManagerMock_
      };

      module( $provide => {
         Object.keys( fakeServices ).forEach( name => $provide.value( name, fakeServices[ name ] ) );
      } );
   } );

   ////////////////////////////////////////////////////////////////////////////////////////////////////////

   describe( 'defines a page directive with controller', () => {

      var renderLayoutSpy_;
      var controller;
      var scope;
      var $rootScope;

      beforeEach( inject( ( _$rootScope_, $compile, $controller ) => {

         $rootScope = _$rootScope_;
         scope = _$rootScope_.$new();

         layoutLoaderMock_.resultMock = {
            html: 'one_column/one_column.html',
            className: 'one-column-layout'
         };

         controller = $controller( 'AxPageController', {
            $scope: scope
         } );

         // have a spy act as the page directive:
         renderLayoutSpy_ = jasmine.createSpy( 'axPage.renderLayout' );
         controller.registerLayoutRenderer( renderLayoutSpy_ );
      } ) );

      /////////////////////////////////////////////////////////////////////////////////////////////////////

      describe( 'that when asked to load a page', () => {

         var setupCompleteSpy_;
         var setupFailedSpy_;

         function setupPage( page ) {
            setupCompleteSpy_ = jasmine.createSpy( 'setupComplete' );
            setupFailedSpy_ = jasmine.createSpy( 'setupFailed' );

            return controller.setupPage( 'steps/step1' )
               .then( setupCompleteSpy_, setupFailedSpy_ );
         }

         beforeEach( () => {
            layoutLoaderMock_.resultMock = {
               html: 'one_column/one_column.html',
               css: '',
               className: 'one-column-layout'
            };
         } );

         //////////////////////////////////////////////////////////////////////////////////////////////////

         describe( 'with widget areas', () => {

            var meta_;
            var subscriberOptions_;
            beforeEach( () => {
               meta_ = { sender: 'AxPageController', deliverToSender: false };
               subscriberOptions_ = { subscriber: 'AxPageController' };
            } );

            ///////////////////////////////////////////////////////////////////////////////////////////////

            it( 'processes area- and widget visibility requests', done => {
               setupPage( 'steps/step1' )
                  .then( () => {
                     expect( eventBusMock_.subscribe ).toHaveBeenCalledWith(
                        'changeWidgetVisibilityRequest', jasmine.any( Function ), subscriberOptions_ );
                     expect( eventBusMock_.subscribe ).toHaveBeenCalledWith(
                        'changeAreaVisibilityRequest', jasmine.any( Function ), subscriberOptions_ );
                  } )
                  .then( done );
            } );

            ///////////////////////////////////////////////////////////////////////////////////////////////

            it( 'initializes area-visibility', done => {
               setupPage( 'steps/step1' )
                  .then( () => {
                     expect( eventBusMock_.publish ).toHaveBeenCalledWith(
                        'didChangeAreaVisibility.content.true', { area: 'content', visible: true }, meta_ );
                     expect( eventBusMock_.publish ).toHaveBeenCalledWith(
                        'didChangeAreaVisibility.test123.nested.true', {
                           area: 'test123.nested',
                           visible: true
                        }, meta_ );
                  } )
                  .then( done );
            } );

            ///////////////////////////////////////////////////////////////////////////////////////////////

            describe( 'that contain widgets with nested areas', () => {

               var targetVisibility_;
               // A visibility handler such as might be installed by a widget that manages nested areas:
               var fakeWidgetAreaHandler_;

               beforeEach( () => {
                  targetVisibility_ = false;
                  fakeWidgetAreaHandler_ = jasmine.createSpy( 'fake test123 visibility handler' )
                     .and.callFake( event => {
                        eventBusMock_.publish( 'didChangeAreaVisibility.test123.nested.' + targetVisibility_, {
                           area: 'test123.nested',
                           visible: targetVisibility_
                        } );
                     } );
                  eventBusMock_.subscribe( 'changeAreaVisibilityRequest.test123', fakeWidgetAreaHandler_ );
               } );

               ////////////////////////////////////////////////////////////////////////////////////////////

               it( 'allows those widgets to control the visibility of their areas', done => {
                  setupPage( 'steps/step1' )
                     .then( () => {
                        expect( fakeWidgetAreaHandler_ ).toHaveBeenCalledWith( {
                           area: 'test123.nested',
                           visible: true
                        }, jasmine.any( Object ) );
                        expect( fakeWidgetAreaHandler_.calls.count() ).toBe( 1 );

                        expect( eventBusMock_.publish ).not.toHaveBeenCalledWith(
                           'didChangeAreaVisibility.test123.nested.true', {
                              area: 'test123.nested',
                              visible: true
                           }, meta_ );
                     } )
                     .then( done );
               } );

               ////////////////////////////////////////////////////////////////////////////////////////////

               describe( 'that change the visibility of their area', () => {

                  beforeEach( done => {
                     targetVisibility_ = true;
                     // simulate a widget that wants to update the nested areas' visibility:
                     setupPage( 'steps/step1' )
                        .then( () => {
                           return eventBusMock_.publish( 'changeWidgetVisibilityRequest.test123', {
                              widget: 'test123',
                              visible: true
                           } );
                        } )
                        .then( done );
                  } );

                  /////////////////////////////////////////////////////////////////////////////////////////

                  it( 'allows those widgets to implement the visibility change', () => {
                     expect( fakeWidgetAreaHandler_.calls.count() ).toBe( 2 );
                     expect( eventBusMock_.publish ).toHaveBeenCalledWith(
                        'didChangeAreaVisibility.test123.nested.true', {
                           area: 'test123.nested',
                           visible: true
                        } );
                  } );

               } );

            } );

         } );

         //////////////////////////////////////////////////////////////////////////////////////////////////

         describe( 'after setup and attaching widgets', () => {

            beforeEach( done => {
               setupPage( 'steps/step1' ).then( done );
            } );

            ///////////////////////////////////////////////////////////////////////////////////////////////

            it( 'takes account of any configured locale(s)', () => {
               expect( eventBusMock_.publish ).toHaveBeenCalledWith(
                  'didChangeLocale.default', { locale: 'default', languageTag: 'en' }, jasmine.any( Object ) );
            } );

            ///////////////////////////////////////////////////////////////////////////////////////////////

            it( 'takes account of the configured theme', () => {
               expect( themeManagerMock_.getTheme ).toHaveBeenCalled();
               expect( eventBusMock_.publish ).toHaveBeenCalledWith(
                  'didChangeTheme.' + theme_, { theme: theme_ }, jasmine.any( Object ) );
            } );

            ///////////////////////////////////////////////////////////////////////////////////////////////

            it( 'triggers loading of the page', () => {
               expect( fileResourceProviderMock_.provide ).toHaveBeenCalledWith( testData.urls.step1 );
            } );

            ///////////////////////////////////////////////////////////////////////////////////////////////

            it( 'triggers loading the layout for the page', () => {
               expect( renderLayoutSpy_ ).toHaveBeenCalledWith( layoutLoaderMock_.resultMock );
            } );

            ///////////////////////////////////////////////////////////////////////////////////////////////

            it( 'loads adapters for all widgets on the page', () => {
               expect( widgetLoaderMock_.load ).toHaveBeenCalled();
               expect( Object.keys( widgetAdapterMocks_ ).length ).toBeGreaterThan( 0 );
            } );

            ///////////////////////////////////////////////////////////////////////////////////////////////

            it( 'creates a layout widget adapter for embedded layouts (#193)', () => {
               expect( layoutWidgetAdapter.create ).toHaveBeenCalledWith( {
                  html: 'one_column/one_column.html',
                  css: '',
                  className: 'one-column-layout'
               }, {
                  area: 'content',
                  id: 'myEmbeddedLayout',
                  path: 'one_column'
               } );
            } );

            ///////////////////////////////////////////////////////////////////////////////////////////////

            it( 'eventually resolves the load promise after all controllers are instantiated', () => {
               expect( setupCompleteSpy_ ).toHaveBeenCalled();
            } );

            ///////////////////////////////////////////////////////////////////////////////////////////////

            it( 'that eventually asks all widgets to begin their lifecycle', () => {
               expect( eventBusMock_.publishAndGatherReplies )
                  .toHaveBeenCalledWith( 'beginLifecycleRequest.default', {
                     lifecycleId: 'default'
                  }, { sender: 'AxPageController' } );
            } );

            ///////////////////////////////////////////////////////////////////////////////////////////////

            it( 'that throws if an area is added more than once (#81)', () => {
               controller.areas.register( 'test', {} );
               controller.areas.register( 'test2', {} );

               expect( () => controller.areas.register( 'test', {} ) )
                  .toThrow( new Error( 'The area "test" is defined twice in the current layout.' ) );
            } );

            ///////////////////////////////////////////////////////////////////////////////////////////////

            describe( 'with widgets that perform operations on beginLifecycleRequest', () => {

               var setupPromise;

               beforeEach( done => {
                  setupCompleteSpy_.calls.reset();

                  eventBusMock_.subscribe( 'beginLifecycleRequest.default', () => {
                     return eventBusMock_.publish( 'willBeginLifecycle.default', {}, {
                        sender: 'Willi Widget'
                     } ).then( done );
                  } );

                  setupPromise = setupPage( 'steps/step1' );
               } );

               ////////////////////////////////////////////////////////////////////////////////////////////

               it( 'waits for all widgets to finish beginning their lifecycle', done => {
                  expect( setupCompleteSpy_ ).not.toHaveBeenCalled();

                  eventBusMock_.publish( 'didBeginLifecycle.default', {}, {
                     sender: 'Willi Widget'
                  } )
                  .then( () => setupPromise )
                  .then( () => expect( setupCompleteSpy_ ).toHaveBeenCalled() )
                  .then( done );
               } );
            } );

            ///////////////////////////////////////////////////////////////////////////////////////////////

            describe( 'and then to tear it down again', () => {

               var areaVisibilityChangeHandler_;
               var widgetVisibilityChangeHandler_;

               var tearDownCompleteSpy_ = jasmine.createSpy( 'tearDownComplete' );
               var tearDownFailedSpy_ = jasmine.createSpy( 'tearDownFailed' );

               beforeEach( done => {
                  widgetVisibilityChangeHandler_ = eventBusMock_.subscribe.calls.all()
                     .filter( call => {
                        return call.args[ 0 ] === 'changeWidgetVisibilityRequest' &&
                               call.args[ 2 ].subscriber === 'AxPageController';
                     } )[ 0 ].args[ 1 ];

                  areaVisibilityChangeHandler_ = eventBusMock_.subscribe.calls.all()
                     .filter( call => {
                        return call.args[ 0 ] === 'changeAreaVisibilityRequest' &&
                               call.args[ 2 ].subscriber === 'AxPageController';
                     } )[ 0 ].args[ 1 ];

                  layoutLoaderMock_.resultMock = {
                     html: 'one_column/one_column.html',
                     css: '',
                     className: 'one-column-layout'
                  };

                  setupPage( 'steps/step1' )
                     .then( () => controller.tearDownPage() )
                     .then( tearDownCompleteSpy_, tearDownFailedSpy_ )
                     .then( done );
               } );

               ////////////////////////////////////////////////////////////////////////////////////////////

               it( 'sends an endLifecycleRequest event with lifecycleId default', () => {
                  expect( eventBusMock_.publishAndGatherReplies ).toHaveBeenCalledWith( 'endLifecycleRequest.default', {
                     lifecycleId: 'default'
                  }, { sender: 'AxPageController' } );
               } );

               ////////////////////////////////////////////////////////////////////////////////////////////

               it( 'eventually resolves the tearDown-promise', () => {
                  expect( tearDownCompleteSpy_ ).toHaveBeenCalled();
               } );

               ////////////////////////////////////////////////////////////////////////////////////////////

               it( 'unsubscribes from visibility events', () => {
                  expect( eventBusMock_.unsubscribe ).toHaveBeenCalledWith( areaVisibilityChangeHandler_ );
                  expect( eventBusMock_.unsubscribe ).toHaveBeenCalledWith( widgetVisibilityChangeHandler_ );
               } );

               ////////////////////////////////////////////////////////////////////////////////////////////

               describe( 'with widgets that perform operations on endLifecycleRequest', () => {

                  var tearDownPromise;

                  beforeEach( done => {
                     tearDownCompleteSpy_.calls.reset();
                     eventBusMock_.publishAndGatherReplies.calls.reset();
                     eventBusMock_.subscribe( 'endLifecycleRequest.default', () => {
                        eventBusMock_.publish( 'willEndLifecycle.default', {}, {
                           sender: 'Willi Widget'
                        } )
                        .then( done );
                     } );

                     tearDownPromise = controller.tearDownPage().then( tearDownCompleteSpy_, tearDownFailedSpy_ );
                  } );

                  /////////////////////////////////////////////////////////////////////////////////////////

                  it( 'waits for all widgets to finish ending their lifecycle', done => {
                     expect( tearDownCompleteSpy_ ).not.toHaveBeenCalled();

                     eventBusMock_.publish( 'didEndLifecycle.default', {}, {
                        sender: 'Willi Widget'
                     } )
                     .then( () => tearDownPromise )
                     .then( () => expect( tearDownCompleteSpy_ ).toHaveBeenCalled() )
                     .then( done );
                  } );

               } );

            } );

         } );

      } );

   } );

   ////////////////////////////////////////////////////////////////////////////////////////////////////////

   function mockConfiguration() {
      var configuration = {
         get: key => {
            switch( key ) {
               case 'theme': return theme_;
               case 'fileListings': return {};
               case 'i18n.locales': return { 'default' : 'en' };
               default: return '';
            }
         }
      };

      spyOn( configuration, 'get' ).and.callThrough();

      return configuration;
   }

   ////////////////////////////////////////////////////////////////////////////////////////////////////////

   function mockLayoutLoader() {
      return {
         resultMock: {
            html: '',
            css: '',
            className: ''
         },
         load: jasmine.createSpy( 'layoutLoader.load' )
            .and.callFake( () => q.when( layoutLoaderMock_.resultMock ) )
      };
   }

   ////////////////////////////////////////////////////////////////////////////////////////////////////////

   function mockThemeManager() {
      return {
         getTheme: jasmine.createSpy( 'themeManager.getTheme' ).and.callFake( () => theme_ )
      };
   }

   ////////////////////////////////////////////////////////////////////////////////////////////////////////

   function mockFileResourceProvider() {
      return createFrpMock( {
         [ testData.urls.step1 ]: testData.pages.step1,
         [ testData.urls.testWidget ]: testData.widgets.testWidget,
         [ testData.urls.withError ]: testData.pages.withError
      } );
   }

   ////////////////////////////////////////////////////////////////////////////////////////////////////////

   function mockWidgetLoader() {
      return {
         load: jasmine.createSpy( 'widgetLoader.load' ).and.callFake( widgetConfiguration => {
            widgetAdapterMocks_[ widgetConfiguration.id ] = mockWidgetAdapter( widgetConfiguration );
            return q.when( widgetAdapterMocks_[ widgetConfiguration.id ] );
         } )
      };
   }

   ////////////////////////////////////////////////////////////////////////////////////////////////////////

   function mockWidgetAdapter( widgetConfiguration ) {
      var id = widgetConfiguration.id;
      expect( id ).toBeDefined();
      var prefix = 'widgetAdapter.' + id + '.';
      return {
         domPrepare: jasmine.createSpy( prefix + 'domPrepare' ),
         domAttachTo: jasmine.createSpy( prefix + 'domAttachTo' ),
         domDetach: jasmine.createSpy( prefix + 'domDetach' ),
         widgetId: jasmine.createSpy( prefix + 'widgetId' ).and.callFake( () => id ),
         destroy: jasmine.createSpy( prefix + 'destroy' )
      };
   }

   ////////////////////////////////////////////////////////////////////////////////////////////////////////

   function mockPageService() {
      return {
         registerPageController( controller ) {
            pageServiceMock_.registeredController = controller;
            pageServiceMock_.cleanup = jasmine.createSpy( 'pageService.cleanup' ).and.callFake( () => {
               pageServiceMock_.registeredController = null;
               pageServiceMock_.cleanup = null;
            } );
            return pageServiceMock_.cleanup;
         },
         // not to be called by the page controller...
         controller: () => { expect( true ).toBe( false ); },
         controllerForScope: () => { expect( true ).toBe( false ); }
      };
   }

} );
