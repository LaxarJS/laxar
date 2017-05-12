/**
 * Copyright 2016 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
define( [
   '../flow',
   'angular-mocks',
   '../../event_bus/event_bus',
   '../../testing/portal_mocks',
   '../runtime_services',
   '../../utilities/object',
   '../../utilities/configuration',
   '../../logging/log',
   '../../loaders/paths',
   './spec_data'
], function( flowModule, ngMocks, EventBus, portalMocks, runtimeServicesModule, object, configuration, log, pathsMock, testData ) {
   'use strict';

   var origConfigurationGet_ = configuration.get;

   describe( 'The axFlow module', function() {

      var q_;
      var runBlock;
      var configMock_;
      var pageControllerMock_;
      var fileResourceProviderMock_;
      var eventBus = null;
      var exitPointSpy;

      var $route;
      var $injector;

      beforeEach( function() {

         configMock_ = {};
         configuration.get = function( key, optionalDefault ) {
            return object.path( configMock_, key, optionalDefault );
         };

         // modify paths for mock-flow:
         pathsMock.FLOW_JSON = testData.urls.flow;

         jasmine.Clock.useMock();
         q_ = portalMocks.mockQ();

         runBlock = runBlock || flowModule._runBlocks.pop();

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         ngMocks.module( runtimeServicesModule.name );
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

         EventBus.init( portalMocks.mockQ(), portalMocks.mockTick(), portalMocks.mockTick() );
         eventBus = EventBus.create();

         ngMocks.module( function( $provide ) {
            var fileResources = {};
            fileResources[ testData.urls.flow ] = testData.flow;
            fileResourceProviderMock_ = portalMocks.mockFileResourceProvider( fileResources );
            $provide.value( 'axFileResourceProvider', fileResourceProviderMock_ );
            $provide.value( 'axGlobalEventBus', eventBus );

            exitPointSpy = jasmine.createSpy( 'exitPoint' );
            object.setPath( configMock_, 'flow.exitPoints', {
               exit1: exitPointSpy
            } );
         } );

         spyOn( eventBus, 'subscribe' ).andCallThrough();
         spyOn( eventBus, 'publish' ).andCallThrough();
         spyOn( eventBus, 'publishAndGatherReplies' ).andCallThrough();
         spyOn( eventBus, 'unsubscribe' ).andCallThrough();
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      afterEach( function() {
         configuration.get = origConfigurationGet_;
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      describe( 'when bootstrapped in default (hash-based) mode', function() {

         beforeEach( function() {
            ngMocks.module( flowModule.name );
         } );

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

         describe( 'when configured with query-parameter support', function() {

            var flowService;

            beforeEach( function() {
               object.setPath( configMock_, 'flow.query.enabled', true );

               ngMocks.inject( function( $injector, $rootScope, $compile, axFlowService ) {
                 $compile( '<div ng-view></div>' )( $rootScope );
                 $injector.invoke( runBlock );
                 jasmine.Clock.tick( 0 );
                 $rootScope.$digest();
                 flowService = axFlowService;
               } );
            } );

            //////////////////////////////////////////////////////////////////////////////////////////////////

            it( 'allows to construct anchor-URLs with embedded query-parameters', function() {
               var url = flowService.constructAbsoluteUrl( 'stepOne', {
                  'optionA': true,
                  'param-b': 'e f&c'
               } );
               expect( url ).toEqual( 'http://server/#/stepOne/_?optionA&param-b=e%20f%26c' );
            } );

         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         describe( 'when the flow data was loaded', function() {

            beforeEach( function() {
               spyOn( $route, 'reload' );

               object.setPath( configMock_, 'flow.entryPoint', {
                  target: 'myEntry2',
                  parameters: {
                     taskId: 'abc123',
                     // for everything apart from / we can rely on angular js to do the encoding
                     anotherThing: 'test/url/enco:ding'
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
               // the / requires double encoding to allow AngularJS to match routes (#379)
               var redirectUrl = $route.routes[ '/entry' ].redirectTo;
               expect( redirectUrl ).toEqual( 'stepTwo/abc123/test%252Furl%252Fenco%3Ading' );
            } );

            //////////////////////////////////////////////////////////////////////////////////////////////////

            it( 'sets the flow controller as controller for simple places', function() {
               expect( $route.routes[ '/stepOne' ].controller ).toEqual( 'AxFlowController' );
            } );

         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         describe( 'defines a controller', function() {

            var place;

            beforeEach( function() {
               invokeRunBlock( $injector );

               spyOn( log, 'setTag' );

               place = $route.routes[ '/stepTwo' ].resolve.place();

               simulateNavigationTo( '/stepTwo', { taskId: 345 } );
            } );

            //////////////////////////////////////////////////////////////////////////////////////////////////

            it( 'that initially sends a willNavigate event with target _self', function() {
               expect( eventBus.publish ).toHaveBeenCalledWith( 'willNavigate._self', {
                  target: '_self'
               }, { sender: 'AxFlowController' } );
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
               }, { sender: 'AxFlowController' } );
            } );

            //////////////////////////////////////////////////////////////////////////////////////////////////

            it( 'that subscribes to navigateRequest events after navigation is complete', function() {
               expect( eventBus.publish ).toHaveBeenCalledWith( 'didNavigate._self', jasmine.any( Object ), jasmine.any( Object ) );
               expect( eventBus.subscribe )
                  .toHaveBeenCalledWith( 'navigateRequest', jasmine.any( Function ), { subscriber : 'AxFlowController' } );
            } );

            //////////////////////////////////////////////////////////////////////////////////////////////////

            it( 'that sets a log tag for the current place (#77)', function() {
               expect( log.setTag ).toHaveBeenCalledWith( 'PLCE', 'stepTwo/:taskId/:anotherThing' );
            } );

            //////////////////////////////////////////////////////////////////////////////////////////////////

            it( 'that sends the target place with the event (#13)', function() {
               var calls = eventBus.publish.calls
                  .filter( function( _ ) { return _.args[0].indexOf( 'didNavigate' ) === 0; } );
               expect( calls[0].args[1].place ).toEqual( 'stepTwo/:taskId/:anotherThing' );
            } );

            //////////////////////////////////////////////////////////////////////////////////////////////////

            it( 'that unsubscribes from navigateRequest events on manual location change (#66)', function() {
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
                  spyOn( $location, 'url' ).andCallThrough();
               } ) );

               ///////////////////////////////////////////////////////////////////////////////////////////////

               it( 'changes the URL using the parameters provided', function() {
                  eventBus.publish( 'navigateRequest.previous', {
                     target: 'previous',
                     data: {
                        taskId: 'halloTaskId'
                     }
                  } );
                  jasmine.Clock.tick( 0 );

                  expect( $location.url ).toHaveBeenCalledWith( '/stepOne/halloTaskId' );
               } );

               ///////////////////////////////////////////////////////////////////////////////////////////////

               it( 'changes the URL using a fragment if provided', function() {
                  eventBus.publish( 'navigateRequest.previous', {
                     target: 'previous',
                     data: {
                        taskId: 'halloTaskId'
                     },
                     fragment: 'frag'
                  } );
                  jasmine.Clock.tick( 0 );

                  expect( $location.url ).toHaveBeenCalledWith( '/stepOne/halloTaskId#frag' );
               } );

               ///////////////////////////////////////////////////////////////////////////////////////////////

               it( 'changes the URL using the previous place parameters for missing parameters (jira ATP-6165)', function() {
                  eventBus.publish( 'navigateRequest.previous', {
                     target: 'previous'
                  } );
                  jasmine.Clock.tick( 0 );

                  expect( $location.url ).toHaveBeenCalledWith( '/stepOne/345' );
               } );

               ///////////////////////////////////////////////////////////////////////////////////////////////

               it( 'navigates to the current place again for the target _self (jira ATP-7080)', function() {
                  $location.url.reset();
                  eventBus.publish( 'navigateRequest._self', {
                     target: '_self',
                     data: {
                        taskId: 666,
                        anotherThing: 'this'
                     }
                  } );
                  jasmine.Clock.tick( 0 );

                  expect( $location.url ).toHaveBeenCalledWith( '/stepTwo/666/this' );
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

               it( 'encodes URL parameters correctly', function() {
                  eventBus.publish( 'navigateRequest.previous', {
                     target: 'previous',
                     data: {
                        taskId: 'xx/%&+ßä xx'
                     }
                  } );
                  jasmine.Clock.tick( 0 );

                  expect( $location.url ).toHaveBeenCalledWith(
                     // double encoding of slashes, cf #379
                     '/stepOne/xx%2F%25%26%2B%C3%9F%C3%A4%20xx'.replace( /%2F/g, '%252F')
                  );
               } );

               ///////////////////////////////////////////////////////////////////////////////////////////////

               it( 'encodes the URL fragment correctly', function() {
                  eventBus.publish( 'navigateRequest.previous', {
                     target: 'previous',
                     fragment: 'xx/%&+ßä xx'
                  } );
                  jasmine.Clock.tick( 0 );

                  expect( $location.url ).toHaveBeenCalledWith(
                     // double encoding of slashes, cf #379
                     '/stepOne/345#xx%2F%25%26%2B%C3%9F%C3%A4%20xx'
                  );
               } );

               ///////////////////////////////////////////////////////////////////////////////////////////////

               it( 'decodes URL parameters correctly', function() {
                  eventBus.publish.reset();

                  simulateNavigationTo( '/stepOne', { taskId: 'xx%2F%&+ßä xx' } );

                  expect( eventBus.publish )
                     .toHaveBeenCalledWith( 'didNavigate._self', {
                        target: '_self',
                        place: 'stepOne/:taskId',
                        data: { taskId: 'xx/%&+ßä xx' }
                     }, { sender: 'AxFlowController' } );
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

                  expect( $location.url ).toHaveBeenCalledWith( '/stepOne/_' );
               } );

               ///////////////////////////////////////////////////////////////////////////////////////////////

               it( 'decodes underscores as null (#65)', function() {
                  eventBus.publish.reset();

                  simulateNavigationTo( '/stepOne', { taskId: '_' } );

                  expect( eventBus.publish )
                     .toHaveBeenCalledWith( 'didNavigate._self', {
                        target: '_self',
                        place: 'stepOne/:taskId',
                        data: { taskId: null }
                     }, { sender: 'AxFlowController' } );
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
                     $location.url.reset();
                     eventBus.publish( 'navigateRequest.previous', {
                        target: 'previous',
                        data: {
                           taskId: 'halloTaskId'
                        }
                     } );
                     jasmine.Clock.tick( 0 );

                     expect( $location.url ).toHaveBeenCalledWith( '/stepOne/halloTaskId' );
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
                     }, { sender: 'AxFlowController' } );
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

               invokeRunBlock( $injector );
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

            it( 'that escapes URL parameters using encodeURIComponent', function() {
               // double encoding of slashes for path segments (#379)
               expect( flowService.constructAbsoluteUrl( 'stepOne', { taskId: 'evil/manipulation' } ) )
                  .toEqual( 'http://server/#/stepOne/evil%252Fmanipulation' );
               expect( flowService.constructAnchor( 'stepOne', { taskId: 'nefarious hackery' } ) )
                  .toEqual( '#/stepOne/nefarious%20hackery' );
               expect( flowService.constructPath( 'stepOne', { taskId: 'insidious?tampering=true' } ) )
                  .toEqual( '/stepOne/insidious%3Ftampering%3Dtrue' );
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

            it( 'with a method to get an absolute URL to a given target/parameters and fragment', function() {
               expect( flowService.constructAbsoluteUrl( 'next', { anotherThing: 42 }, 'frag' ) )
                  .toEqual( 'http://server/#/stepTwo/bla/42#frag' );
            } );

            //////////////////////////////////////////////////////////////////////////////////////////////////

            it( 'with a method to get the currently active place', function() {
               expect( flowService.place() )
                  .toEqual( $route.routes[ '/stepOne' ].resolve.place() );
            } );

         } );

      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      describe( 'when bootstrapped in HTML5 mode', function() {

         beforeEach( function() {
            ngMocks.module( function( $provide ) {
               object.setPath( configMock_, 'flow.router.html5Mode', true );
            } );
            ngMocks.module( flowModule.name );
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         beforeEach( ngMocks.inject( function( _$injector_, _$route_, $rootScope, $compile ) {
            object.setPath( configMock_, 'flow.router.base', 'app/' );
            $injector = _$injector_;
            $route = _$route_;
            $injector.invoke( runBlock );

            $compile( '<div ng-view></div>' )( $rootScope );
            jasmine.Clock.tick( 0 );
            $rootScope.$digest();
         } ) );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         afterEach( function() {
            delete configMock_.routing;
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'augments the flow data, before assembling all routes', function() {
            var routes = [
               '/app/entry', '/app/stepOne', '/app/stepOne/:taskId', '/app/stepTwo',
               '/app/stepTwo/:taskId', '/app/stepTwo/:taskId/:anotherThing', '/app/exit1',
               '/app/exit1/:taskId'
            ];

            for( var i = 0; i < routes.length; ++i ) {
               expect( $route.routes[ routes[ i ] ] ).toBeDefined();
            }
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         describe( 'configures the controller so that it', function() {

            var $location;

            beforeEach( ngMocks.inject( function( _$location_, $rootScope, $compile ) {
               $location = _$location_;
               spyOn( $location, 'path' ).andCallThrough();
               jasmine.Clock.tick( 0 );
            } ) );

            //////////////////////////////////////////////////////////////////////////////////////////////////

            it( 'supports direct navigation', function() {
               simulateNavigationTo( '/app/stepTwo/:taskId/:anotherThing', { taskId: 'x' } );
               expect( eventBus.publish )
                  .toHaveBeenCalledWith( jasmine.any( String ), {
                     target: jasmine.any( String ),
                     place: 'app/stepTwo/:taskId/:anotherThing',
                     data: {
                        taskId: 'x',
                        anotherThing: null
                     }
                  }, { sender: 'AxFlowController' } );
            } );

            //////////////////////////////////////////////////////////////////////////////////////////////////

            describe( 'on further event-based navigation', function() {

               beforeEach( function() {
                  simulateNavigationTo( '/app/stepTwo/:taskId/:anotherThing', { taskId: 'x' } );
                  jasmine.Clock.tick( 0 );

                  eventBus.publish( 'navigateRequest.previous', {
                     target: 'previous'
                  } );
                  jasmine.Clock.tick( 0 );
               } );

               ///////////////////////////////////////////////////////////////////////////////////////////////

               it( 'changes the URL using the configured base prefix and provided parameters ', function() {
                  expect( $location.path ).toHaveBeenCalledWith( '/app/stepOne/x' );
               } );

            } );

         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         describe( 'with support for query parameters', function() {

            var $location;
            var $rootScope;

            beforeEach( function() {
               object.setPath( configMock_, 'flow.query.enabled', true );
               ngMocks.inject( function( $injector, $compile, _$location_, _$rootScope_ ) {
                 $location = _$location_;
                 $rootScope = _$rootScope_;
                 $injector.invoke( runBlock );
                 spyOn( $location, 'url' ).andCallThrough();
                 $compile( '<div ng-view></div>' )( $rootScope );
               } );
               jasmine.Clock.tick( 0 );
               $rootScope.$digest();
            } );

            describe( 'configures the controller so that it', function() {

               var lastData;
               var lastFragment;

               beforeEach( function() {
                  eventBus.subscribe( 'didNavigate', function( event ) {
                     lastData = event.data;
                     lastFragment = event.fragment;
                  } );
               } );

               ///////////////////////////////////////////////////////////////////////////////////////////////

               it( 'supports direct navigation and publishes defaults for query parameters', function() {
                  simulateBrowserNavigationTo( '/app/step-with-options/taskX' );
                  // TODO (#373) the event should be 'didNavigate' without target, but the flow controller
                  //             inserts a target based on the current place, so we use `jasmine.any`.
                  // TODO (#373) the place should be `step-with-options/:taskId` (`base` must be removed).
                  expect( eventBus.publish )
                     .toHaveBeenCalledWith( jasmine.any( String ), {
                        target: jasmine.any( String ),
                        place: 'app/step-with-options/:taskId',
                        data: {
                           taskId: 'taskX',
                           optionA: 'aDefault',
                           'param-b': null,
                           'c&d': 'some stuff'
                        }
                     }, { sender: 'AxFlowController' } );
               } );

               ///////////////////////////////////////////////////////////////////////////////////////////////

               it( 'supports navigation with query parameters', function() {
                  simulateBrowserNavigationTo( '/app/step-with-options/taskX?param-b=yeah' );
                  expect( lastData ).toEqual( {
                     taskId: 'taskX',
                     optionA: 'aDefault',
                     'param-b': 'yeah',
                     'c&d': 'some stuff'
                  } );
               } );

               ///////////////////////////////////////////////////////////////////////////////////////////////

               it( 'reads fragments from the browser location', function() {
                  simulateBrowserNavigationTo( '/app/step-with-options/taskX?param-b=yeah#test' );
                  expect( lastFragment ).toEqual( 'test' );
               } );

               ///////////////////////////////////////////////////////////////////////////////////////////////

               it( 'supports navigation with boolean place parameters', function() {
                  simulateBrowserNavigationTo( '/app/step-with-options/taskX?optionA' );
                  expect( lastData ).toEqual( {
                     taskId: 'taskX',
                     optionA: true,
                     'param-b': null,
                     'c&d': 'some stuff'
                  } );
               } );

               ///////////////////////////////////////////////////////////////////////////////////////////////

               it( 'supports navigation with URL-encoded parameters', function() {
                  simulateBrowserNavigationTo( '/app/step-with-options/taskX?c%26d=e%20f%26g' );
                  expect( lastData ).toEqual( {
                     taskId: 'taskX',
                     optionA: 'aDefault',
                     'param-b': null,
                     'c&d': 'e f&g'
                  } );
               } );

               ///////////////////////////////////////////////////////////////////////////////////////////////

               it( 'supports navigation with URL-encoded parameters', function() {
                  simulateBrowserNavigationTo( '/app/step-with-options/taskX?c%26d=e%20f%26g' );
                  expect( lastData ).toEqual( {
                     taskId: 'taskX',
                     optionA: 'aDefault',
                     'param-b': null,
                     'c&d': 'e f&g'
                  } );
               } );

               ///////////////////////////////////////////////////////////////////////////////////////////////

               it( 'URL-decodes fragments from the browser location', function() {
                  simulateBrowserNavigationTo( '/app/step-with-options/taskX#e%20f%26g' );
                  expect( lastFragment ).toEqual( 'e f&g' );
               } );

               ///////////////////////////////////////////////////////////////////////////////////////////////

               it( 'uses data from navigateRequests to update query parameters', function() {
                  simulateBrowserNavigationTo( '/app/stepOne' );
                  $location.url.reset();
                  lastData = null;

                  eventBus.publish( 'navigateRequest.step-with-options', {
                     target: 'step-with-options',
                     data: {
                        taskId: 'taskY',
                        optionA: true,
                        'param-b': false,
                        'c&d': 'x#y&z'
                     }
                  } );

                  // process event:
                  jasmine.Clock.tick( 0 );
                  $rootScope.$digest();

                  // create new flow controller after location change:
                  jasmine.Clock.tick( 0 );

                  expect( $location.url ).toHaveBeenCalledWith(
                     '/app/step-with-options/taskY?optionA&c%26d=x%23y%26z'
                  );
                  expect( lastData ).toEqual( {
                     taskId: 'taskY',
                     optionA: true,
                     'param-b': null,
                     'c&d': 'x#y&z'
                  } );
               } );

            } );

            //////////////////////////////////////////////////////////////////////////////////////////////////

            describe( 'allows to inject a flow service that', function() {

               var flowService;

               beforeEach( function() {
                  ngMocks.inject( function( axFlowService ) {
                     flowService = axFlowService;
                  } );
               } );

               ///////////////////////////////////////////////////////////////////////////////////////////////

               it( 'generates URLs with query parameters', function() {
                  var url = flowService.constructAbsoluteUrl( 'step-with-options', {
                     'taskId': 'taskX',
                     'param-b': 'Jürgen'
                  } );
                  expect( url ).toEqual( 'http://server/app/step-with-options/taskX?param-b=J%C3%BCrgen' );
               } );

                  ////////////////////////////////////////////////////////////////////////////////////////////

                  it( 'generates URLs with query parameters plus fragment', function() {
                     var url = flowService.constructAbsoluteUrl( 'step-with-options', {
                        'taskId': 'taskX',
                        'param-b': 'Jürgen'
                     }, 'Hi' );
                     expect( url )
                        .toEqual( 'http://server/app/step-with-options/taskX?param-b=J%C3%BCrgen#Hi' );
                  } );

               ///////////////////////////////////////////////////////////////////////////////////////////////

               it( 'generates value-less parameters for (true) boolean place parameters', function() {
                  var url = flowService.constructAbsoluteUrl( 'step-with-options', {
                     'taskId': 'taskX',
                     'param-b': true,
                     'optionA': true
                  } );
                  expect( url ).toEqual( 'http://server/app/step-with-options/taskX?param-b&optionA' );
               } );

               ///////////////////////////////////////////////////////////////////////////////////////////////

               it( 'adds additional parameters for places that do not define their own', function() {
                  var url = flowService.constructAbsoluteUrl( 'stepOne', {
                     'optionA': true,
                     'param-b': 'e f&c'
                  } );
                  expect( url ).toEqual( 'http://server/app/stepOne/_?optionA&param-b=e%20f%26c' );
               } );

            } );

            //////////////////////////////////////////////////////////////////////////////////////////////////

            function simulateBrowserNavigationTo( url ) {
               $location.url( url );
               $rootScope.$digest();
               jasmine.Clock.tick( 0 );
            }

         } );

      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      function invokeRunBlock( $injector ) {
         ngMocks.inject( function( $rootScope ) {
            $injector.invoke( runBlock );
            jasmine.Clock.tick( 0 );
            $rootScope.$digest();
         } );
      }

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      function simulateNavigationTo( placeName, parameters ) {
         ngMocks.inject( function( $controller ) {

            var defaultFlowInjections = {
               $routeParams: {},
               axGlobalEventBus: eventBus,
               axThemeManager: {
                  getTheme: function() { return 'myTheme'; }
               }
            };

            $controller( 'AxFlowController', object.options( {
               $routeParams: parameters || {},
               place: $route.routes[ placeName ].resolve.place()
            }, defaultFlowInjections ) );
         } );

         jasmine.Clock.tick( 0 );
      }

   } );

} );
