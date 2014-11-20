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
   '../../../logging/log',
   '../../paths',
   './spec_data',
   '../portal_services'
], function( flowModule, ngMocks, EventBus, portalMocks, object, log, pathsMock, testData ) {
   'use strict';

   describe( 'A flow module', function() {

      var q_;
      var runBlock;
      var windowMock_;
      var pageControllerMock_;
      var fileResourceProviderMock_;
      var eventBus = null;

      var exitPointSpy;

      beforeEach( function() {

         // modify paths for mock-flow:
         pathsMock.FLOW_JSON = testData.urls.flow;

         jasmine.Clock.useMock();
         q_ = portalMocks.mockQ();

         runBlock = flowModule._runBlocks[ 0 ];

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         ngMocks.module( 'laxar.portal_services' );
         ngMocks.module( 'laxar.portal.flow' );
         ngMocks.module( function( $provide ) {
            pageControllerMock_ = {
               setupPage: jasmine.createSpy( 'pageController.setupPage' ).andCallFake( function() {
                  return q_.when();
               } ),
               tearDownPage: jasmine.createSpy( 'pageController.tearDownPage' ).andCallFake( function() {
                  return q_.when();
               } )
            };
            $provide.service( 'axPageService', function() {
               return {
                  controller: function() {
                     return pageControllerMock_;
                  }
               };
            } );
         } );

         ngMocks.module( function( $provide ) {
            var fileResources = {};
            fileResources[ testData.urls.flow ] = testData.flow;
            fileResourceProviderMock_ = portalMocks.mockFileResourceProvider( fileResources );
            $provide.value( 'FileResourceProvider', fileResourceProviderMock_ );

            windowMock_ = {
               laxar: {},
               location: { reload: jasmine.createSpy( 'reloadSpy' ) },
               navigator: window.navigator
            };
            exitPointSpy = jasmine.createSpy( 'exitPoint' );
            object.setPath( windowMock_.laxar, 'portal.flow.exitPoints', {
               exit1: exitPointSpy
            } );
            Object.keys( location ).forEach( function( key ) {
               if( key !== 'reload' ) {
                  windowMock_.location[ key ] = location[ key ];
               }
            } );
            $provide.value( '$window', windowMock_ );
            $provide.value( 'Configuration', {
               get: function( key, optionalDefault ) {
                  return object.path( windowMock_.laxar, key, optionalDefault );
               }
            } );

         } );

         EventBus.init( portalMocks.mockQ(), portalMocks.mockTick(), portalMocks.mockTick() );
         eventBus = EventBus.create();

         spyOn( eventBus, 'subscribe' ).andCallThrough();
         spyOn( eventBus, 'publish' ).andCallThrough();
         spyOn( eventBus, 'publishAndGatherReplies' ).andCallThrough();
         spyOn( eventBus, 'unsubscribe' ).andCallThrough();
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      describe( 'when bootstrapped', function() {

         var $injector;
         var $route;

         beforeEach( ngMocks.inject( function( _$injector_, _$route_ ) {
            $injector = _$injector_;
            $route = _$route_;
         } ) );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'loads the flow data', function() {
            $injector.invoke( runBlock );
            jasmine.Clock.tick( 0 );
            expect( fileResourceProviderMock_.provide ).toHaveBeenCalled();
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         describe( 'when the flow data was loaded', function() {

            beforeEach( function(  ) {
               spyOn( $route, 'reload' );

               object.setPath( windowMock_.laxar, 'portal.flow.entryPoint', {
                  target: 'myEntry2',
                  parameters: {
                     taskId: 'abc123',
                     // for everything apart from / we can rely on angular js to do the encoding
                     anotherThing: 'test/url/encoding'
                  }
               } );

               $injector.invoke( runBlock );
               jasmine.Clock.tick( 0 );
            } );

            //////////////////////////////////////////////////////////////////////////////////////////////////

            it( 'reloads the current route', function() {
               expect( $route.reload ).toHaveBeenCalled();
            } );

            //////////////////////////////////////////////////////////////////////////////////////////////////

            it( 'assembles all routes', function() {
               var routes = [
                  '/entry', '/stepOne', '/stepOne/:taskId', '/stepTwo', '/stepTwo/:taskId',
                  '/stepTwo/:taskId/:anotherThing', '/exit1', '/exit1/:taskId'
               ];

               for( var i = 0; i < routes.length; ++i ) {
                  expect( $route.routes[ routes[ i ] ] ).toBeDefined();
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

         function invokeRunBlock() {
            ngMocks.inject( function( $rootScope ) {
               $injector.invoke( runBlock );
               jasmine.Clock.tick( 0 );
               $rootScope.$digest();
            } );
         }

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         function simulateNavigationTo( placeName, parameters ) {
            ngMocks.inject( function( $controller ) {

               var defaultFlowInjections = {
                  EventBus: eventBus,
                  $routeParams: {},
                  ThemeManager: {
                     getTheme: function() { return 'myTheme'; }
                  }
               };

               $controller( 'portal.FlowController', object.options( {
                  place: $route.routes[ placeName ].resolve.place(),
                  $routeParams: parameters || {}
               }, defaultFlowInjections ) );
            } );

            jasmine.Clock.tick( 0 );
         }

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         describe( 'defines a controller', function() {

            var place;

            beforeEach( function() {
               invokeRunBlock();

               spyOn( log.context, 'setTag' );

               place = $route.routes[ '/stepTwo' ].resolve.place();

               simulateNavigationTo( '/stepTwo', { taskId: 345 } );
            } );

            //////////////////////////////////////////////////////////////////////////////////////////////////

            it( 'that initially sends a willNavigate event with target _self', function() {
               expect( eventBus.publish ).toHaveBeenCalledWith( 'willNavigate._self', {
                  target: '_self'
               }, { sender: 'FlowController' } );
            } );

            //////////////////////////////////////////////////////////////////////////////////////////////////

            it( 'that requests loading of the current page', function() {
               expect( pageControllerMock_.setupPage ).toHaveBeenCalledWith( place.page );
            } );

            //////////////////////////////////////////////////////////////////////////////////////////////////

            it( 'that eventually sends a didNavigate with the correct parameters', function() {
               expect( eventBus.publish ).toHaveBeenCalledWith( 'didNavigate._self', {
                  target: '_self',
                  place: 'stepTwo/:taskId/:anotherThing',
                  data: {
                     taskId: 345,
                     anotherThing: null
                  }
               }, { sender: 'FlowController' } );
            } );

            //////////////////////////////////////////////////////////////////////////////////////////////////

            it( 'that subscribes to navigateRequest events after navigation is complete', function() {
               expect( eventBus.publish ).toHaveBeenCalledWith( 'didNavigate._self', jasmine.any( Object ), jasmine.any( Object ) );
               expect( eventBus.subscribe )
                  .toHaveBeenCalledWith( 'navigateRequest', jasmine.any( Function ), { subscriber : 'FlowController' } );
            } );

            //////////////////////////////////////////////////////////////////////////////////////////////////

            it( 'sets a log tag for the current place (#77)', function() {
               expect( log.context.setTag ).toHaveBeenCalledWith( 'PLCE', 'stepTwo/:taskId/:anotherThing' );
            } );

            //////////////////////////////////////////////////////////////////////////////////////////////////

            it( 'that sends the target place with the event (#13)', function() {
               var calls = eventBus.publish.calls
                  .filter( function( _ ) { return _.args[0].indexOf( 'didNavigate' ) === 0; } );
               expect( calls[0].args[1].place ).toEqual( 'stepTwo/:taskId/:anotherThing' );
            } );

            ///////////////////////////////////////////////////////////////////////////////////////////////

            it( 'unsubscribes from navigateRequest events on manual location change (#66)', function() {
               var navigateRequestSubscriber = eventBus.subscribe.calls.filter( function( call ) {
                  return call.args[0] === 'navigateRequest';
               } )[0].args[1];

               simulateNavigationTo( '/stepOne', { taskId: '_' } );

               expect( eventBus.unsubscribe ).toHaveBeenCalledWith( navigateRequestSubscriber );
            } );

            //////////////////////////////////////////////////////////////////////////////////////////////////

            describe( 'that on further navigation', function() {

               var $location;

               beforeEach( ngMocks.inject( function( _$location_ ) {
                  $location = _$location_;
                  spyOn( $location, 'path' ).andCallThrough();
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

                  expect( windowMock_.location.href.split( '#' )[ 1 ] ).toEqual( '/stepThree/halloTaskId' );
                  expect( windowMock_.location.reload ).toHaveBeenCalled();
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

               it( 'unsubscribes from further navigateRequests events', function() {
                  var navigateRequestSubscriber = eventBus.subscribe.calls.filter( function( call ) {
                     return call.args[0] === 'navigateRequest';
                  } )[0].args[1];

                  eventBus.publish( 'navigateRequest.previous', {
                     target: 'previous'
                  } );
                  jasmine.Clock.tick( 0 );

                  expect( eventBus.unsubscribe ).toHaveBeenCalledWith( navigateRequestSubscriber );
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

               it( 'decodes url parameters correctly (jira ATP-6775)', function() {
                  eventBus.publish.reset();

                  simulateNavigationTo( '/stepOne', { taskId: 'xx%2F%&+ßä xx' } );

                  expect( eventBus.publish )
                     .toHaveBeenCalledWith( 'didNavigate.previous', {
                        target: 'previous',
                        place: 'stepOne/:taskId',
                        data: { taskId: 'xx/%&+ßä xx' }
                     }, { sender: 'FlowController' } );
               } );

               ///////////////////////////////////////////////////////////////////////////////////////////////

               it( 'encodes null parameters as underscore (#65)', function() {
                  eventBus.publish( 'navigateRequest.previous', {
                     target: 'previous',
                     data: {
                        taskId: null
                     }
                  } );
                  jasmine.Clock.tick( 0 );

                  expect( $location.path ).toHaveBeenCalledWith( '/stepOne/_' );
               } );

               ///////////////////////////////////////////////////////////////////////////////////////////////

               it( 'decodes underscores as null (#65)', function() {
                  eventBus.publish.reset();

                  simulateNavigationTo( '/stepOne', { taskId: '_' } );

                  expect( eventBus.publish )
                     .toHaveBeenCalledWith( 'didNavigate.previous', {
                        target: 'previous',
                        place: 'stepOne/:taskId',
                        data: { taskId: null }
                     }, { sender: 'FlowController' } );
               } );

               ///////////////////////////////////////////////////////////////////////////////////////////////

               describe( 'to the currently active place again', function() {

                  beforeEach( function() {
                     eventBus.publish( 'navigateRequest.entry', {
                        target: 'entry'
                     } );
                     jasmine.Clock.tick( 0 );
                  } );

                  ////////////////////////////////////////////////////////////////////////////////////////////

                  it( 'afterwards accepts new navigation requests (#14)', function() {
                     $location.path.reset();
                     eventBus.publish( 'navigateRequest.previous', {
                        target: 'previous',
                        data: {
                           taskId: 'halloTaskId'
                        }
                     } );
                     jasmine.Clock.tick( 0 );

                     expect( $location.path ).toHaveBeenCalledWith( '/stepOne/halloTaskId' );
                  } );

               } );

               ///////////////////////////////////////////////////////////////////////////////////////////////

               describe( 'when not the place but only parameter values change', function() {

                  beforeEach( function() {
                     eventBus.publish( 'navigateRequest.previous', {
                        target: 'previous',
                        data: {
                           taskId: 'halloTaskId'
                        }
                     } );
                     jasmine.Clock.tick( 0 );

                     pageControllerMock_.tearDownPage.reset();

                     simulateNavigationTo( '/stepTwo', {
                        taskId: 'bla',
                        anotherThing: 'blub'
                     } );
                  } );

                  ////////////////////////////////////////////////////////////////////////////////////////////

                  it( 'does not trigger loading of the page', function() {
                     expect( pageControllerMock_.tearDownPage ).not.toHaveBeenCalled();
                  } );

                  ////////////////////////////////////////////////////////////////////////////////////////////

                  it( 'propagates the new parameters', function() {
                     expect( eventBus.publish ).toHaveBeenCalledWith( 'didNavigate.previous', {
                        target: 'previous',
                        place: 'stepTwo/:taskId/:anotherThing',
                        data: {
                           taskId: 'bla',
                           anotherThing: 'blub'
                        }
                     }, { sender: 'FlowController' } );
                  } );

               } );

            } );

            //////////////////////////////////////////////////////////////////////////////////////////////////

            describe( 'on navigation to an exit point', function() {

               beforeEach( function() {
                  simulateNavigationTo( '/exit1', { taskId: 'bla' } );
               } );

               ///////////////////////////////////////////////////////////////////////////////////////////////

               it( 'calls the configured exit point function using the given arguments', function() {
                  expect( exitPointSpy ).toHaveBeenCalledWith( { taskId: 'bla' } );
               } );

            } );

         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         describe( 'defines a flow service', function() {

            var flowService;

            beforeEach( function() {

               invokeRunBlock();
               simulateNavigationTo( '/stepOne', { taskId: 'bla' } );

               ngMocks.inject( function( axFlowService ) {
                  flowService = axFlowService;
               } );
            } );

            //////////////////////////////////////////////////////////////////////////////////////////////////

            it( 'with a method to get a path to a given target and parameters', function() {
               expect( flowService.constructPath( 'next', { anotherThing: 42 } ) )
                  .toEqual( '/stepTwo/bla/42' );
            } );

            //////////////////////////////////////////////////////////////////////////////////////////////////

            it( 'with a method to get an anchor to a given target and parameters', function() {
               expect( flowService.constructAnchor( 'next', { anotherThing: 42 } ) )
                  .toEqual( '#/stepTwo/bla/42' );
            } );

            //////////////////////////////////////////////////////////////////////////////////////////////////

            it( 'with a method to get an anchor to a given target and parameters', function() {
               expect( flowService.constructAbsoluteUrl( 'next', { anotherThing: 42 } ) )
                  .toEqual( 'http://server/#/stepTwo/bla/42' );
            } );

            //////////////////////////////////////////////////////////////////////////////////////////////////

            it( 'with a method to get the currently active place', function() {
               expect( flowService.place() )
                  .toEqual( $route.routes[ '/stepOne' ].resolve.place() );
            } );

         } );

      } );

   } );

} );
