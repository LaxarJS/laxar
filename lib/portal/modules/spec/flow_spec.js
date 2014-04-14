/**
 * Copyright 2014 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
define( [
   '../flow',
   'angular-mocks',
   '../../../event_bus/event_bus',
   '../../../testing/portal_mocks',
   '../../../utilities/object',
   '../../paths',
   './spec_data',
   '../portal_services'
], function( flowModule, angularMocks, EventBus, portalMocks, object, pathsMock, testData ) {
   'use strict';

   describe( 'A flow module', function() {
      var runBlock;
      var windowMock_;

      beforeEach( function() {
         // This prevents the module from calling its run method initially.  We need a setup $httpBackend
         // before the call to run can succeed and therefore call it manually later, when everything is setup.
         runBlock = flowModule._runBlocks[0];
         flowModule._runBlocks = [];

         angularMocks.module( 'laxar.portal_services' );
         angularMocks.module( 'laxar.portal.flow' );

         pathsMock.FLOW_JSON = '/application/flow/flow.json';
         pathsMock.PAGES = '/application/pages/';
         pathsMock.WIDGETS = '/includes/widgets/';

         angularMocks.module( function( $provide ) {
            windowMock_ = {
               laxar: {},
               location: { reload: jasmine.createSpy( 'reloadSpy' ) },
               navigator: window.navigator
            };
            for( var key in location ) {
               if( key !== 'reload' ) {
                  windowMock_.location[ key ] = location[ key ];
               }
            }
            $provide.value( '$window', windowMock_ );
            $provide.value( 'Configuration', {
               get: function( key, optionalDefault ) {
                  return object.path( windowMock_.laxar, key, optionalDefault );
               }
            } );

         } );
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      afterEach( function() {
         flowModule._runBlocks = [ runBlock ];
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      describe( 'when bootstrapped', function() {

         var $httpBackend;
         var $injector;

         beforeEach( angularMocks.inject( function( _$injector_, _$rootScope_ ) {
            $injector = _$injector_;
            $httpBackend = $injector.get( '$httpBackend' );
         } ) );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'loads the flow data', angularMocks.inject( function( $route ) {
            $httpBackend.expectGET( testData.urls.flow ).respond( object.deepClone( testData.flow ) );
            $httpBackend.expectGET( testData.urls.step1 ).respond( object.deepClone( testData.pages.step1 ) );
            $httpBackend.expectGET( testData.urls.step2 ).respond( object.deepClone( testData.pages.step2 ) );

            $injector.invoke( runBlock );
            $httpBackend.flush();
         } ) );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         describe( 'when the flow data was loaded', function() {

            var $route;

            beforeEach( angularMocks.inject( function( _$route_ ) {
               $route = _$route_;
               spyOn( $route, 'reload' );

               windowMock_.laxar.entryPoint = {
                  target: 'myEntry2',
                  parameters: {
                     taskId: 'abc123',
                     // for everything apart from / we can rely on angular js to do the encoding
                     anotherThing: 'test/url/encoding'
                  }
               };

               $httpBackend.whenGET( testData.urls.flow ).respond( object.deepClone( testData.flow ) );
               $httpBackend.whenGET( testData.urls.step1 ).respond( object.deepClone( testData.pages.step1 ) );
               $httpBackend.whenGET( testData.urls.step2 ).respond( object.deepClone( testData.pages.step2 ) );
               $httpBackend.whenGET( testData.urls.step3 ).respond( object.deepClone( testData.pages.step3 ) );

               $injector.invoke( runBlock );
               $httpBackend.flush();
            } ) );

            //////////////////////////////////////////////////////////////////////////////////////////////////

            it( 'reloads the current route', function() {
               expect( $route.reload ).toHaveBeenCalled();
            } );

            //////////////////////////////////////////////////////////////////////////////////////////////////

            it( 'assembles all routes', function() {
               var routes = [ '/entry',
                  '/stepOne', '/stepOne/:taskId',
                  '/stepTwo', '/stepTwo/:taskId', '/stepTwo/:taskId/:anotherThing',
                  '/exit1', '/exit1/:taskId' ];

               for( var i = 0; i < routes.length; ++i ) {
                  expect( $route.routes[routes[i]] ).toBeDefined();
               }
            } );

            //////////////////////////////////////////////////////////////////////////////////////////////////

            it( 'creates a redirect for the selected entry point', function() {
               // for everything apart from / we can rely on angular js to do the encoding
               expect( $route.routes[ '/entry' ].redirectTo ).toEqual( 'stepTwo/abc123/test%2Furl%2Fencoding' );
            } );

            //////////////////////////////////////////////////////////////////////////////////////////////////

            it( 'sets the flow controller as controller for simple places', function() {
               expect( $route.routes[ '/stepOne' ].controller ).toEqual( 'portal.FlowController' );
            } );

         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         describe( 'defines a controller', function() {

            var eventBus;
            var controller;
            var place;

            beforeEach( angularMocks.inject( function( $route, $controller ) {
               jasmine.Clock.useMock();

               $httpBackend.whenGET( testData.urls.flow ).respond( object.deepClone( testData.flow ) );
               $httpBackend.whenGET( testData.urls.step1 ).respond( object.deepClone( testData.pages.step1 ) );
               $httpBackend.whenGET( testData.urls.step2 ).respond( object.deepClone( testData.pages.step2 ) );
               $httpBackend.whenGET( testData.urls.step3 ).respond( object.deepClone( testData.pages.step3 ) );

               $injector.invoke( runBlock );
               $httpBackend.flush();

               EventBus.init( portalMocks.mockQ(), portalMocks.mockTick(), portalMocks.mockTick() );
               eventBus = EventBus.create();

               spyOn( eventBus, 'subscribe' ).andCallThrough();
               spyOn( eventBus, 'publish' ).andCallThrough();
               spyOn( eventBus, 'publishAndGatherReplies' ).andCallThrough();
               spyOn( eventBus, 'unsubscribe' ).andCallThrough();

               place = $route.routes[ '/stepTwo' ].resolve.place();
               controller = $controller( 'portal.FlowController', {
                  EventBus: eventBus,
                  place: place,
                  $routeParams: { taskId: 345 },
                  ThemeManager: {
                     getTheme: function() { return 'myTheme'; }
                  }
               } );
            } ) );

            //////////////////////////////////////////////////////////////////////////////////////////////////

            it( 'that subscribes to navigateRequest events', function() {
               expect( eventBus.subscribe )
                  .toHaveBeenCalledWith( 'navigateRequest', jasmine.any( Function ), 'FlowController' );
            } );

            //////////////////////////////////////////////////////////////////////////////////////////////////

            it( 'that adds the current place to the root scope (jira ATP-6795)', angularMocks.inject( function( $rootScope ) {
               expect( $rootScope.place ).toEqual( place );
            } ) );

            //////////////////////////////////////////////////////////////////////////////////////////////////

            it( 'that initially sends a willNavigate event with target _self', function() {
               jasmine.Clock.tick( 0 );

               expect( eventBus.publish ).toHaveBeenCalledWith( 'willNavigate._self', {
                  target: '_self',
                  sender: 'FlowController'
               } );
            } );

            //////////////////////////////////////////////////////////////////////////////////////////////////

            it( 'sends an endLifecycleRequest event with lifecycleId default', function() {
               jasmine.Clock.tick( 0 );

               expect( eventBus.publishAndGatherReplies ).toHaveBeenCalledWith( 'endLifecycleRequest.default', {
                  lifecycleId: 'default',
                  sender: 'FlowController'
               } );
            } );

            //////////////////////////////////////////////////////////////////////////////////////////////////

            it( 'waits for all widgets to finish end their lifecycle', function() {
               eventBus.publishAndGatherReplies.reset();
               eventBus.subscribe( 'endLifecycleRequest.default', function() {
                  eventBus.publish( 'willEndLifecycle.default', {
                     sender: 'Willi Widget'
                  } );
               } );

               jasmine.Clock.tick( 0 );

               expect( eventBus.publishAndGatherReplies )
                  .not.toHaveBeenCalledWith( 'loadPageRequest', jasmine.any( Object ) );

               eventBus.publish( 'didEndLifecycle.default', {
                  sender: 'Willi Widget'
               } );

               jasmine.Clock.tick( 0 );

               expect( eventBus.publishAndGatherReplies )
                  .toHaveBeenCalledWith( 'loadPageRequest', jasmine.any( Object ) );
            } );

            //////////////////////////////////////////////////////////////////////////////////////////////////

            it( 'that requests loading of the current page', function() {
               jasmine.Clock.tick( 0 );
               expect( eventBus.publishAndGatherReplies ).toHaveBeenCalledWith( 'loadPageRequest', {
                  page: place.page,
                  sender: 'FlowController'
               } );
            } );

            //////////////////////////////////////////////////////////////////////////////////////////////////

            it( 'that eventually asks all widgets to begin their lifecycle', function() {
               jasmine.Clock.tick( 0 );

               expect( eventBus.publishAndGatherReplies )
                  .toHaveBeenCalledWith( 'beginLifecycleRequest.default', {
                     lifecycleId: 'default',
                     sender: 'FlowController'
                  } );
            } );

            //////////////////////////////////////////////////////////////////////////////////////////////////

            it( 'waits for all widgets to finish beginning their lifecycle', function() {
               eventBus.publish.reset();
               eventBus.subscribe( 'beginLifecycleRequest.default', function() {
                  eventBus.publish( 'willBeginLifecycle.default', {
                     sender: 'Willi Widget'
                  } );
               } );

               jasmine.Clock.tick( 0 );

               expect( eventBus.publish ).not.toHaveBeenCalledWith( 'didNavigate._self', jasmine.any( Object ) );

               eventBus.publish( 'didBeginLifecycle.default', {
                  sender: 'Willi Widget'
               } );

               jasmine.Clock.tick( 0 );

               expect( eventBus.publish ).toHaveBeenCalledWith( 'didNavigate._self', jasmine.any( Object ) );
            } );

            //////////////////////////////////////////////////////////////////////////////////////////////////

            it( 'that sends a didChangeTheme event with the currently active theme', function() {
               jasmine.Clock.tick( 0 );

               expect( eventBus.publish ).toHaveBeenCalledWith( 'didChangeTheme.myTheme', {
                  theme: 'myTheme',
                  sender: 'FlowController'
               } );
            } );

            //////////////////////////////////////////////////////////////////////////////////////////////////

            it( 'that eventually sends a didNavigate with the correct parameters', function() {
               jasmine.Clock.tick( 0 );

               expect( eventBus.publish ).toHaveBeenCalledWith( 'didNavigate._self', {
                  target: '_self',
                  data: {
                     taskId: 345,
                     anotherThing: null
                  },
                  sender: 'FlowController'
               } );
            } );

            //////////////////////////////////////////////////////////////////////////////////////////////////

            describe( 'that on further navigation', function() {

               var $location;
               var $window;

               beforeEach( angularMocks.inject( function( _$location_, _$window_ ) {
                  $location = _$location_;
                  $window = _$window_;
                  
                  spyOn( $location, 'path' );
               } ) );

               ///////////////////////////////////////////////////////////////////////////////////////////////

               it( 'changes the url using the parameters provided', function() {
                  eventBus.publish( 'navigateRequest.previous', {
                     target: 'previous',
                     data: {
                        taskId: 'halloTaskId'
                     }
                  } );
                  jasmine.Clock.tick( 0 );

                  expect( $location.path ).toHaveBeenCalledWith( '/stepOne/halloTaskId' );
               } );

               ///////////////////////////////////////////////////////////////////////////////////////////////

               it( 'refreshes the page if configured (jira ATP-7932)', function() {
                  eventBus.publish( 'navigateRequest.next', {
                     target: 'next',
                     data: {
                        taskId: 'halloTaskId'
                     }
                  } );
                  jasmine.Clock.tick( 0 );

                  expect( $window.location.href.split( '#' )[ 1 ] ).toEqual( '/stepThree/halloTaskId' );
                  expect( $window.location.reload ).toHaveBeenCalled();
               } );

               ///////////////////////////////////////////////////////////////////////////////////////////////

               it( 'changes the url using the previous place parameters for missing parameters (jira ATP-6165)', function() {
                  eventBus.publish( 'navigateRequest.previous', {
                     target: 'previous'
                  } );
                  jasmine.Clock.tick( 0 );

                  expect( $location.path ).toHaveBeenCalledWith( '/stepOne/345' );
               } );

               ///////////////////////////////////////////////////////////////////////////////////////////////

               it( 'navigates to the current place again for the target _self (jira ATP-7080)', function() {
                  $location.path.reset();
                  eventBus.publish( 'navigateRequest._self', {
                     target: '_self',
                     data: {
                        taskId: 666,
                        anotherThing: 'this'
                     }
                  } );
                  jasmine.Clock.tick( 0 );

                  expect( $location.path ).toHaveBeenCalledWith( '/stepTwo/666/this' );
               } );

               ///////////////////////////////////////////////////////////////////////////////////////////////

               it( 'unsubscribes from further didNavigate events', function() {
                  eventBus.publish( 'navigateRequest.previous', {
                     target: 'previous'
                  } );
                  jasmine.Clock.tick( 0 );

                  // rather sloppy way to make the test for unsubscribe, but for now I see no better way
                  expect( eventBus.unsubscribe ).toHaveBeenCalled();
               } );

               ///////////////////////////////////////////////////////////////////////////////////////////////

               it( 'encodes url parameters correctly (jira ATP-6775)', function() {
                  eventBus.publish( 'navigateRequest.previous', {
                     target: 'previous',
                     data: {
                        taskId: 'xx/%&+ßä xx'
                     }
                  } );
                  jasmine.Clock.tick( 0 );

                  // for everything apart from / we can rely on angular js to do the encoding
                  expect( $location.path ).toHaveBeenCalledWith( '/stepOne/xx%2F%&+ßä xx' );
               } );

               ///////////////////////////////////////////////////////////////////////////////////////////////

               it( 'decodes url parameters correctly (jira ATP-6775)', angularMocks.inject( function( $route, $controller ) {
                  eventBus.publish.reset();
                  $controller( 'portal.FlowController', {
                     EventBus: eventBus,
                     place: $route.routes[ '/stepOne' ].resolve.place(),
                     // for everything apart from / we can rely on angular js to do the encoding
                     $routeParams: { taskId: 'xx%2F%&+ßä xx' },
                     ThemeManager: {
                        getTheme: function() { return 'myTheme'; }
                     }
                  } );
                  jasmine.Clock.tick( 0 );

                  expect( eventBus.publish )
                     .toHaveBeenCalledWith( 'didNavigate.previous', {
                        target: 'previous',
                        data: { taskId: 'xx/%&+ßä xx' },
                        sender: 'FlowController'
                     } );
               } ) );

               ///////////////////////////////////////////////////////////////////////////////////////////////

               describe( 'when not the place but only parameter values change', function() {

                  beforeEach( angularMocks.inject( function( $route, $controller, $rootScope ) {
                     eventBus.publish( 'navigateRequest.previous', {
                        target: 'previous',
                        data: {
                           taskId: 'halloTaskId'
                        }
                     } );
                     jasmine.Clock.tick( 0 );

                     eventBus.publishAndGatherReplies.reset();
                     eventBus.publish.reset();

                     $controller( 'portal.FlowController', {
                        EventBus: eventBus,
                        place: $route.routes[ '/stepTwo' ].resolve.place(),
                        // for everything apart from / we can rely on angular js to do the encoding
                        $routeParams: {
                           taskId: 'bla',
                           anotherThing: 'blub'
                        },
                        ThemeManager: {
                           getTheme: function() { return 'myTheme'; }
                        }
                     } );

                     jasmine.Clock.tick( 0 );
                     $rootScope.$digest();
                  } ) );

                  ////////////////////////////////////////////////////////////////////////////////////////////

                  it( 'does not trigger loading of the page', function() {
                     expect( eventBus.publishAndGatherReplies )
                        .not.toHaveBeenCalledWith( 'loadPageRequest', jasmine.any( Object ) );
                  } );

                  ////////////////////////////////////////////////////////////////////////////////////////////

                  it( 'does not trigger the end of a lifecycle', function() {
                     expect( eventBus.publishAndGatherReplies )
                        .not.toHaveBeenCalledWith( 'endLifecycleRequest.default', jasmine.any( Object ) );
                  } );

                  ////////////////////////////////////////////////////////////////////////////////////////////

                  it( 'does not trigger beginning of a lifecycle', function() {
                     expect( eventBus.publishAndGatherReplies )
                        .not.toHaveBeenCalledWith( 'beginLifecycleRequest.default', jasmine.any( Object ) );
                  } );

                  ////////////////////////////////////////////////////////////////////////////////////////////

                  it( 'propagates the new parameters', function() {
                     expect( eventBus.publish ).toHaveBeenCalledWith( 'didNavigate.previous', {
                        target: 'previous',
                        data: {
                           taskId: 'bla',
                           anotherThing: 'blub'
                        },
                        sender: 'FlowController'
                     } );
                  } );

               } );

            } );

         } );

      } );

   } );

} );
