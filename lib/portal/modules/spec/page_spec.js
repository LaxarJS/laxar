/**
 * Copyright 2014 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
define( [
   '../page',
   'angular-mocks',
   'jquery',
   '../../../logging/log',
   '../../../testing/portal_mocks',
   '../../portal_assembler/widget_loader',
   '../../portal_assembler/layout_loader',
   '../../paths',
   '../portal_services',
   './spec_data'
], function(
   pageModule,
   ngMocks,
   $,
   log,
   portalMocks,
   widgetLoaderModule,
   layoutLoader,
   pathsMock,
   portalServicesModule,
   testData
) {
   'use strict';

   describe( 'A page module', function() {

      var theme_ = 'blue';

      var configurationMock_;
      var q_;
      var eventBusMock_;
      var fileResourceProviderMock_;
      var heartbeatMock_;
      var layoutLoaderMock_;
      var themeManagerMock_;

      var widgetLoaderMock_;
      var widgetAdapterMocks_;
      var pageServiceMock_;

      beforeEach( function() {
         jasmine.Clock.useMock();
         q_ = portalMocks.mockQ();
         eventBusMock_ = portalMocks.mockEventBus();

         configurationMock_ = mockConfiguration();
         layoutLoaderMock_ = mockLayoutLoader();
         fileResourceProviderMock_ = mockFileResourceProvider();
         heartbeatMock_ = portalMocks.mockHeartbeat();
         themeManagerMock_ = mockThemeManager();

         widgetLoaderMock_ = mockWidgetLoader();
         widgetAdapterMocks_ = {};

         pageServiceMock_ = mockPageService();
         spyOn( widgetLoaderModule, 'create' ).andCallFake( function() {
            return widgetLoaderMock_;
         } );


         ngMocks.module( portalServicesModule.name );
         ngMocks.module( pageModule.name );

         var controllerInjections = {
            axHeartbeat: heartbeatMock_,
            pageService: pageServiceMock_,
            $q: q_,
            Configuration: configurationMock_,
            LayoutLoader: layoutLoaderMock_,
            EventBus: eventBusMock_,
            FileResourceProvider: fileResourceProviderMock_,
            ThemeManager: themeManagerMock_,
            $timeout: portalMocks.mockTick
         };

         ngMocks.module( function( $provide ) {
            Object.keys( controllerInjections ).forEach( function( name ) {
               $provide.value( name, controllerInjections[ name ] );
            } );
         } );

         pathsMock.WIDGETS = '/includes/widgets/';
         pathsMock.PAGES = '/application/pages/';
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      describe( 'defines a page directive with controller', function() {

         var renderLayoutSpy_;
         var controller;
         var scope;
         var $rootScope;

         beforeEach( ngMocks.inject( function( _EventBus_, _$rootScope_, $compile, $controller ) {

            $rootScope = _$rootScope_;
            scope = _$rootScope_.$new();

            layoutLoaderMock_.resultMock = {
               html: 'one_column/one_column.html',
               className: 'one-column-layout'
            };

            controller = $controller( 'axPageController', {
               $scope: scope
            } );

            // have a spy act as the page directive:
            renderLayoutSpy_ = jasmine.createSpy( 'axPage.renderLayout' );
            controller.registerLayoutRenderer( renderLayoutSpy_ );

         } ) );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         describe( 'that when asked to load a page', function() {

            var setupCompleteSpy_;
            var setupFailedSpy_;

            beforeEach( function() {
               setupCompleteSpy_ = jasmine.createSpy( 'setupComplete' );
               setupFailedSpy_ = jasmine.createSpy( 'setupFailed' );

               layoutLoaderMock_.resultMock = {
                  html: 'one_column/one_column.html',
                  css: '',
                  className: 'one-column-layout'
               };

               controller.setupPage( 'steps/step1' ).then( setupCompleteSpy_, setupFailedSpy_ );
            } );

            //////////////////////////////////////////////////////////////////////////////////////////////////

            describe( 'with widget areas', function() {

               var meta_;
               var subscriberOptions_;
               beforeEach( function() {
                  meta_ = { sender: 'axPageController', deliverToSender: false };
                  subscriberOptions_ = { subscriber: 'axPageController' };
               } );

               ///////////////////////////////////////////////////////////////////////////////////////////////

               it( 'processes area- and widget visibility requests', function() {
                  jasmine.Clock.tick( 0 );

                  expect( eventBusMock_.subscribe ).toHaveBeenCalledWith(
                     'changeWidgetVisibilityRequest', jasmine.any( Function ), subscriberOptions_ );

                  expect( eventBusMock_.subscribe ).toHaveBeenCalledWith(
                     'changeAreaVisibilityRequest', jasmine.any( Function ), subscriberOptions_ );

               } );

               ///////////////////////////////////////////////////////////////////////////////////////////////

               it( 'initializes area-visibility', function() {
                  jasmine.Clock.tick( 0 );
                  expect( eventBusMock_.publish ).toHaveBeenCalledWith(
                     'didChangeAreaVisibility.content.true', { area: 'content', visible: true }, meta_ );

                  expect( eventBusMock_.publish ).toHaveBeenCalledWith(
                     'didChangeAreaVisibility.test123.nested.true', {
                        area: 'test123.nested',
                        visible: true
                     }, meta_ );
               } );

               ///////////////////////////////////////////////////////////////////////////////////////////////

               describe( 'that contain widgets with nested areas', function() {

                  var targetVisibility_;
                  // A visibility handler such as might be installed by a widget that manages nested areas:
                  var fakeWidgetAreaHandler_;

                  beforeEach( function() {
                     targetVisibility_ = false;
                     fakeWidgetAreaHandler_ = jasmine.createSpy( 'fake test123 visibility handler' )
                        .andCallFake( function( event ) {
                           eventBusMock_.publish( 'didChangeAreaVisibility.test123.nested.' + targetVisibility_, {
                              area: 'test123.nested',
                              visible: targetVisibility_
                           } );
                        } );
                     eventBusMock_.subscribe( 'changeAreaVisibilityRequest.test123', fakeWidgetAreaHandler_ );
                     jasmine.Clock.tick( 0 );
                  } );

                  ////////////////////////////////////////////////////////////////////////////////////////////

                  it( 'allows those widgets to control the visibility of their areas', function() {
                     expect( fakeWidgetAreaHandler_ ).toHaveBeenCalledWith( {
                        area: 'test123.nested',
                        visible: true
                     }, jasmine.any( Object ) );
                     expect( fakeWidgetAreaHandler_.calls.length ).toBe( 1 );

                     expect( eventBusMock_.publish ).not.toHaveBeenCalledWith(
                        'didChangeAreaVisibility.test123.nested.true', {
                           area: 'test123.nested',
                           visible: true
                        }, meta_ );
                  } );

                  ////////////////////////////////////////////////////////////////////////////////////////////

                  describe( 'that change the visibility of their area', function() {

                     beforeEach( function() {
                        targetVisibility_ = true;
                        // simulate a widget that wants to update the nested areas' visibility:
                        eventBusMock_.publish( 'changeWidgetVisibilityRequest.test123', {
                           widget: 'test123',
                           visible: true
                        } );
                        jasmine.Clock.tick( 0 );
                     } );

                     /////////////////////////////////////////////////////////////////////////////////////////

                     it( 'allows those widgets to implement the visibility change', function() {
                        expect( fakeWidgetAreaHandler_.calls.length ).toBe( 2 );

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

            describe( 'and ticking', function() {

               // This must be in sync with the page controller
               var WIDGET_ATTACH_DELAY_MS = 5;

               beforeEach( function() {
                  jasmine.Clock.tick( WIDGET_ATTACH_DELAY_MS );
               } );

               ///////////////////////////////////////////////////////////////////////////////////////////////

               it( 'takes account of any configured locale(s)', function() {
                  expect( eventBusMock_.publish ).toHaveBeenCalledWith(
                     'didChangeLocale.default', { locale: 'default', languageTag: 'en' }, jasmine.any( Object ) );
               } );

               ///////////////////////////////////////////////////////////////////////////////////////////////

               it( 'takes account of the configured theme', function() {
                  expect( themeManagerMock_.getTheme ).toHaveBeenCalled();
                  expect( eventBusMock_.publish ).toHaveBeenCalledWith(
                     'didChangeTheme.' + theme_, { theme: theme_ }, jasmine.any( Object ) );
               } );

               ///////////////////////////////////////////////////////////////////////////////////////////////

               it( 'triggers loading of the page', function() {
                  expect( fileResourceProviderMock_.provide ).toHaveBeenCalledWith( testData.urls.step1 );
               } );

               ///////////////////////////////////////////////////////////////////////////////////////////////

               it( 'triggers loading the layout for the page', function() {
                  expect( renderLayoutSpy_ ).toHaveBeenCalledWith( layoutLoaderMock_.resultMock );
               } );

               ///////////////////////////////////////////////////////////////////////////////////////////////

               it( 'loads adapters for all widgets on the page', function() {
                  expect( widgetLoaderMock_.load ).toHaveBeenCalled();
                  expect( Object.keys( widgetAdapterMocks_ ).length ).toBeGreaterThan( 0 );
               } );

               ///////////////////////////////////////////////////////////////////////////////////////////////

               it( 'eventually resolves the load promise after all controllers are instantiated', function() {
                  expect( setupCompleteSpy_ ).toHaveBeenCalled();
               } );

               ///////////////////////////////////////////////////////////////////////////////////////////////

               it( 'that eventually asks all widgets to begin their lifecycle', function() {
                  expect( eventBusMock_.publishAndGatherReplies )
                     .toHaveBeenCalledWith( 'beginLifecycleRequest.default', {
                        lifecycleId: 'default'
                     }, { sender: 'axPageController' } );
               } );

               ///////////////////////////////////////////////////////////////////////////////////////////////

               it( 'that throws if an area is added more than once (#81)', function() {
                  controller.areas.register( 'test', {} );
                  controller.areas.register( 'test2', {} );

                  expect( function() {
                     controller.areas.register( 'test', {} );
                  } ).toThrow( 'The area "test" is defined twice in the current layout.' );
               } );

               ///////////////////////////////////////////////////////////////////////////////////////////////

               describe( 'with widgets that perform operations on beginLifecycleRequest', function() {

                  beforeEach( function() {
                     setupCompleteSpy_.reset();

                     eventBusMock_.subscribe( 'beginLifecycleRequest.default', function() {
                        eventBusMock_.publish( 'willBeginLifecycle.default', {}, {
                           sender: 'Willi Widget'
                        } );
                     } );
                     controller.setupPage( 'steps/step1' ).then( setupCompleteSpy_, setupFailedSpy_ );
                     jasmine.Clock.tick( 0 );
                  } );

                  ////////////////////////////////////////////////////////////////////////////////////////////

                  it( 'waits for all widgets to finish beginning their lifecycle', function() {
                     jasmine.Clock.tick( 0 );
                     expect( setupCompleteSpy_ ).not.toHaveBeenCalled();

                     eventBusMock_.publish( 'didBeginLifecycle.default', {}, {
                        sender: 'Willi Widget'
                     } );
                     jasmine.Clock.tick( 0 );
                     expect( setupCompleteSpy_ ).toHaveBeenCalled();
                  } );
               } );

               ///////////////////////////////////////////////////////////////////////////////////////////////

               describe( 'and then to tear it down again', function() {

                  var areaVisibilityChangeHandler_;
                  var widgetVisibilityChangeHandler_;

                  var tearDownCompleteSpy_ = jasmine.createSpy( 'tearDownComplete' );
                  var tearDownFailedSpy_ = jasmine.createSpy( 'tearDownFailed' );

                  beforeEach( function() {

                     widgetVisibilityChangeHandler_ = eventBusMock_.subscribe.calls.filter( function( call ) {
                        return call.args[ 0 ] === 'changeWidgetVisibilityRequest' &&
                               call.args[ 2 ].subscriber === 'axPageController';
                     } )[ 0 ].args[ 1 ];

                     areaVisibilityChangeHandler_ = eventBusMock_.subscribe.calls.filter( function( call ) {
                        return call.args[ 0 ] === 'changeAreaVisibilityRequest' &&
                               call.args[ 2 ].subscriber === 'axPageController';
                     } )[ 0 ].args[ 1 ];

                     spyOn( eventBusMock_, 'unsubscribe' ).andCallThrough();

                     layoutLoaderMock_.resultMock = {
                        html: 'one_column/one_column.html',
                        css: '',
                        className: 'one-column-layout'
                     };

                     controller.tearDownPage().then( tearDownCompleteSpy_, tearDownFailedSpy_ );
                     jasmine.Clock.tick( 0 );
                  } );

                  ////////////////////////////////////////////////////////////////////////////////////////////

                  it( 'sends an endLifecycleRequest event with lifecycleId default', function() {
                     expect( eventBusMock_.publishAndGatherReplies ).toHaveBeenCalledWith( 'endLifecycleRequest.default', {
                        lifecycleId: 'default'
                     }, { sender: 'axPageController' } );
                  } );

                  ////////////////////////////////////////////////////////////////////////////////////////////

                  it( 'eventually resolves the tearDown-promise', function() {
                     expect( tearDownCompleteSpy_ ).toHaveBeenCalled();
                  } );

                  ////////////////////////////////////////////////////////////////////////////////////////////

                  it( 'unsubscribes from visibility events', function() {
                     expect( eventBusMock_.unsubscribe ).toHaveBeenCalledWith( areaVisibilityChangeHandler_ );
                     expect( eventBusMock_.unsubscribe ).toHaveBeenCalledWith( widgetVisibilityChangeHandler_ );
                  } );

                  ////////////////////////////////////////////////////////////////////////////////////////////

                  describe( 'with widgets that perform operations on endLifecycleRequest', function() {

                     beforeEach( function() {
                        tearDownCompleteSpy_.reset();
                        eventBusMock_.publishAndGatherReplies.reset();
                        eventBusMock_.subscribe( 'endLifecycleRequest.default', function() {
                           eventBusMock_.publish( 'willEndLifecycle.default', {}, {
                              sender: 'Willi Widget'
                           } );
                        } );

                        controller.tearDownPage().then( tearDownCompleteSpy_, tearDownFailedSpy_ );
                        jasmine.Clock.tick( 0 );
                     } );

                     /////////////////////////////////////////////////////////////////////////////////////////

                     it( 'waits for all widgets to finish ending their lifecycle', function() {
                        expect( tearDownCompleteSpy_ ).not.toHaveBeenCalled();
                        eventBusMock_.publish( 'didEndLifecycle.default', {}, {
                           sender: 'Willi Widget'
                        } );
                        jasmine.Clock.tick( 0 );
                        expect( tearDownCompleteSpy_ ).toHaveBeenCalled();
                     } );

                  } );

               } );

            } );


         } );

      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      function mockConfiguration() {
         var configuration = {
            get: function( key, fallback ) {
               switch( key ) {
                  case 'portal.theme': return theme_;
                  case 'file_resource_provider.fileListings': return {};
                  case 'i18n.locales': return { 'default' : 'en' };
                  default: return '';
               }
            }
         };

         spyOn( configuration, 'get' ).andCallThrough();

         return configuration;
      }

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      function mockLayoutLoader() {
         function load() {
            return q_.when( layoutLoaderMock_.resultMock );
         }

         return {
            resultMock: {
               html: '',
               css: '',
               className: ''
            },

            load: jasmine.createSpy( 'layoutLoader.load' ).andCallFake( load )
         };
      }

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      function mockThemeManager() {
         return {
            getTheme: jasmine.createSpy( 'themeManager.getTheme' ).andCallFake( function() {
               return theme_;
            } )
         };
      }

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      function mockFileResourceProvider() {
         var fileResources = {};
         fileResources[ testData.urls.step1 ] = testData.pages.step1;
         fileResources[ testData.urls.testWidget ] = testData.widgets.testWidget;
         fileResources[ testData.urls.withError ] = testData.pages.withError;

         return portalMocks.mockFileResourceProvider( fileResources );
      }

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      function mockWidgetLoader() {
         return {
            load: jasmine.createSpy( 'widgetLoader.load' ).andCallFake( function( widgetConfiguration ) {
               widgetAdapterMocks_[ widgetConfiguration.id ] = mockWidgetAdapter( widgetConfiguration );
               return q_.when( widgetAdapterMocks_[ widgetConfiguration.id ] );
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
            widgetId: jasmine.createSpy( prefix + 'widgetId' ).andCallFake( function() {
               return id;
            } ),
            destroy: jasmine.createSpy( prefix + 'destroy' )
         };
      }

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      function mockPageService() {
         return {
            registerPageController: function( controller ) {
               pageServiceMock_.registeredController = controller;
               pageServiceMock_.cleanup = jasmine.createSpy( 'pageService.cleanup' ).andCallFake( function() {
                  pageServiceMock_.registeredController = null;
                  pageServiceMock_.cleanup = null;
               } );
               return pageServiceMock_.cleanup;
            },
            // not to be called by the page controller...
            controller: function() { expect( true ).toBe( false ); },
            controllerForScope: function() { expect( true ).toBe( false ); }
         };
      }

   } );

} );
