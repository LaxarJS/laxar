/**
 * Copyright 2016 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
import flowModule from '../flow';
import 'angular-mocks';
import * as q from 'q';
import { create as createEventBusMock } from '../../testing/event_bus_mock';
import { create as createFrpMock } from '../../testing/file_resource_provider_mock';
import { name as runtimeServicesModuleName } from '../runtime_services';
import * as paths from '../../loaders/paths';
import * as object from '../../utilities/object';
import log from '../../logging/log';
import { log as consoleChannel } from '../../logging/console_channel';
import testData from './spec_data';

const { module, inject } = window;

describe( 'The axFlow module', () => {

   var runBlock;
   var windowMock_;
   var pageControllerMock_;
   var fileResourceProviderMock_;
   var eventBus = null;

   var exitPointSpy;

   beforeEach( () => {
      // prevent console spamming
      log.removeLogChannel( consoleChannel );

      runBlock = flowModule._runBlocks[ 0 ];

      module( runtimeServicesModuleName );
      module( flowModule.name );
      module( $provide => {
         pageControllerMock_ = {
            setupPage: jasmine.createSpy( 'pageController.setupPage' ).and.callFake( () => q.when() ),
            tearDownPage: jasmine.createSpy( 'pageController.tearDownPage' ).and.callFake( () => q.when() )
         };
         $provide.service( 'axPageService', () => {
            return {
               controller: () => pageControllerMock_
            };
         } );
      } );

      module( $provide => {
         var fileResources = { [ paths.FLOW_JSON ]: testData.flow };
         fileResourceProviderMock_ = createFrpMock( fileResources );
         $provide.value( 'axFileResourceProvider', fileResourceProviderMock_ );

         windowMock_ = {
            laxar: {}
         };
         exitPointSpy = jasmine.createSpy( 'exitPoint' );
         object.setPath( windowMock_.laxar, 'flow.exitPoints', {
            exit1: exitPointSpy
         } );
         $provide.value( '$window', windowMock_ );
         $provide.value( 'axConfiguration', {
            get: function( key, optionalDefault ) {
               return object.path( windowMock_.laxar, key, optionalDefault );
            }
         } );

      } );

      eventBus = createEventBusMock();
   } );

   ////////////////////////////////////////////////////////////////////////////////////////////////////////

   describe( 'when bootstrapped', () => {

      var $injector;
      var $route;

      beforeEach( inject( ( _$injector_, _$route_ ) => {
         $injector = _$injector_;
         $route = _$route_;
      } ) );

      /////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'loads the flow data', () => {
         $injector.invoke( runBlock );
         expect( fileResourceProviderMock_.provide ).toHaveBeenCalled();
      } );

      /////////////////////////////////////////////////////////////////////////////////////////////////////

      describe( 'when the flow data was loaded', () => {

         var routeReloadCalledPromise;

         beforeEach( done => {
            // This is a bit quirky, since we later expect it to be called, but otherwise it's diffcult
            // to know when the runBlock has completed its tasks.
            spyOn( $route, 'reload' ).and.callFake( done );

            object.setPath( windowMock_.laxar, 'flow.entryPoint', {
               target: 'myEntry2',
               parameters: {
                  taskId: 'abc123',
                  // for everything apart from / we can rely on angular js to do the encoding
                  anotherThing: 'test/url/encoding'
               }
            } );

            $injector.invoke( runBlock );
         } );

         //////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'reloads the current route', () => {
            expect( $route.reload ).toHaveBeenCalled();
         } );

         //////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'assembles all routes', () => {
            var routes = [
               '/entry', '/stepOne', '/stepOne/:taskId', '/stepTwo', '/stepTwo/:taskId',
               '/stepTwo/:taskId/:anotherThing', '/exit1', '/exit1/:taskId'
            ];

            for( var i = 0; i < routes.length; ++i ) {
               expect( $route.routes[ routes[ i ] ] ).toBeDefined();
            }
         } );

         //////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'creates a redirect for the selected entry point', () => {
            // for everything apart from / we can rely on angular js to do the encoding
            expect( $route.routes[ '/entry' ].redirectTo ).toEqual( 'stepTwo/abc123/test%2Furl%2Fencoding' );
         } );

         //////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'sets the flow controller as controller for simple places', () => {
            expect( $route.routes[ '/stepOne' ].controller ).toEqual( 'AxFlowController' );
         } );

      } );

      /////////////////////////////////////////////////////////////////////////////////////////////////////

      function invokeRunBlock() {
         // This is a bit quirky, since we later expect it to be called, but otherwise it's diffcult
         // to know when the runBlock has completed its tasks.
         var deferred = q.defer();
         const origReload = $route.reload;
         spyOn( $route, 'reload' ).and.callFake( () => {
            deferred.resolve();
            origReload.call( $route );
         } );
         $injector.invoke( runBlock );
         return deferred.promise.then( () => inject( $rootScope => $rootScope.$digest() ) );
      }

      /////////////////////////////////////////////////////////////////////////////////////////////////////

      function simulateNavigationTo( placeName, parameters ) {
         const navigationFinishedDeferred = q.defer();
         eventBus.subscribe( 'didNavigate', ( event, meta ) => {
            meta.unsubscribe();
            navigationFinishedDeferred.resolve();
         } );
         inject( $controller => {
            var defaultFlowInjections = {
               $routeParams: {},
               axGlobalEventBus: eventBus,
               axThemeManager: {
                  getTheme: () => 'myTheme'
               }
            };

            $controller( 'AxFlowController', object.options( {
               $routeParams: parameters || {},
               place: $route.routes[ placeName ].resolve.place()
            }, defaultFlowInjections ) );
         } );
         return navigationFinishedDeferred.promise;
      }

      /////////////////////////////////////////////////////////////////////////////////////////////////////

      describe( 'defines a controller', () => {

         var place;

         beforeEach( done => {
            spyOn( log, 'setTag' );
            invokeRunBlock()
               .then( () => {
                  place = $route.routes[ '/stepTwo' ].resolve.place();

                  return simulateNavigationTo( '/stepTwo', { taskId: 345 } );
               } )
               .then( done );
         } );

         //////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'that initially sends a willNavigate event with target _self', () => {
            expect( eventBus.publish ).toHaveBeenCalledWith( 'willNavigate._self', {
               target: '_self'
            }, { sender: 'AxFlowController' } );
         } );

         //////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'that requests loading of the current page', () => {
            expect( pageControllerMock_.setupPage ).toHaveBeenCalledWith( place.page );
         } );

         //////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'that eventually sends a didNavigate with the correct parameters', () => {
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

         it( 'that subscribes to navigateRequest events after navigation is complete', () => {
            expect( eventBus.publish ).toHaveBeenCalledWith( 'didNavigate._self', jasmine.any( Object ), jasmine.any( Object ) );
            expect( eventBus.subscribe )
               .toHaveBeenCalledWith( 'navigateRequest', jasmine.any( Function ), { subscriber : 'AxFlowController' } );
         } );

         //////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'that sets a log tag for the current place (#77)', () => {
            expect( log.setTag ).toHaveBeenCalledWith( 'PLCE', 'stepTwo/:taskId/:anotherThing' );
         } );

         //////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'that sends the target place with the event (#13)', () => {
            var [ call ] = eventBus.publish.calls.all()
               .filter( _ => _.args[0].indexOf( 'didNavigate' ) === 0 );
            expect( call.args[1].place ).toEqual( 'stepTwo/:taskId/:anotherThing' );
         } );

         ///////////////////////////////////////////////////////////////////////////////////////////////

         it( 'that unsubscribes from navigateRequest events on manual location change (#66)', () => {
            var navigateRequestSubscriber = eventBus.subscribe.calls.all()
               .filter( _ => _.args[0] === 'navigateRequest' )[0].args[1];

            simulateNavigationTo( '/stepOne', { taskId: '_' } );

            expect( eventBus.unsubscribe ).toHaveBeenCalledWith( navigateRequestSubscriber );
         } );

         //////////////////////////////////////////////////////////////////////////////////////////////////

         describe( 'that on further navigation', () => {

            var $location;

            beforeEach( inject( function( _$location_ ) {
               $location = _$location_;
               spyOn( $location, 'path' ).and.callThrough();
            } ) );

            ///////////////////////////////////////////////////////////////////////////////////////////////

            it( 'changes the url using the parameters provided', done => {
               eventBus.publish( 'navigateRequest.previous', {
                  target: 'previous',
                  data: {
                     taskId: 'halloTaskId'
                  }
               } )
               .then( () => {
                  expect( $location.path ).toHaveBeenCalledWith( '/stepOne/halloTaskId' );
               } )
               .then( done );
            } );

            ///////////////////////////////////////////////////////////////////////////////////////////////

            it( 'changes the url using the previous place parameters for missing parameters (jira ATP-6165)', done => {
               eventBus.publish( 'navigateRequest.previous', {
                  target: 'previous'
               } )
               .then( () => {
                  expect( $location.path ).toHaveBeenCalledWith( '/stepOne/345' );
               } )
               .then( done );
            } );

            ///////////////////////////////////////////////////////////////////////////////////////////////

            it( 'navigates to the current place again for the target _self (jira ATP-7080)', done => {
               $location.path.calls.reset();
               eventBus.publish( 'navigateRequest._self', {
                  target: '_self',
                  data: {
                     taskId: 666,
                     anotherThing: 'this'
                  }
               } )
               .then( () => {
                  expect( $location.path ).toHaveBeenCalledWith( '/stepTwo/666/this' );
               } )
               .then( done );
            } );

            ///////////////////////////////////////////////////////////////////////////////////////////////

            it( 'unsubscribes from further navigateRequests events', done => {
               var navigateRequestSubscriber = eventBus.subscribe.calls.all()
                  .filter( _ => _.args[0] === 'navigateRequest' )[0].args[1];

               eventBus.publish( 'navigateRequest.previous', {
                  target: 'previous'
               } )
               .then( () => {
                  expect( eventBus.unsubscribe ).toHaveBeenCalledWith( navigateRequestSubscriber );
               } )
               .then( done );
            } );

            ///////////////////////////////////////////////////////////////////////////////////////////////

            it( 'encodes url parameters correctly (jira ATP-6775)', done => {
               eventBus.publish( 'navigateRequest.previous', {
                  target: 'previous',
                  data: {
                     taskId: 'xx/%&+ßä xx'
                  }
               } )
               .then( () => {
                  // for everything apart from / we can rely on angular js to do the encoding
                  expect( $location.path ).toHaveBeenCalledWith( '/stepOne/xx%2F%&+ßä xx' );
               } )
               .then( done );
            } );

            ///////////////////////////////////////////////////////////////////////////////////////////////

            it( 'decodes url parameters correctly (jira ATP-6775)', done => {
               eventBus.publish.calls.reset();

               simulateNavigationTo( '/stepOne', { taskId: 'xx%2F%&+ßä xx' } )
                  .then( () => {
                     expect( eventBus.publish )
                        .toHaveBeenCalledWith( 'didNavigate.previous', {
                           target: 'previous',
                           place: 'stepOne/:taskId',
                           data: { taskId: 'xx/%&+ßä xx' }
                        }, { sender: 'AxFlowController' } );
                  } )
                  .then( done );
            } );

            ///////////////////////////////////////////////////////////////////////////////////////////////

            it( 'encodes null parameters as underscore (#65)', done => {
               eventBus.publish( 'navigateRequest.previous', {
                  target: 'previous',
                  data: {
                     taskId: null
                  }
               } )
               .then( () => {
                  expect( $location.path ).toHaveBeenCalledWith( '/stepOne/_' );
               } )
               .then( done );
            } );

            ///////////////////////////////////////////////////////////////////////////////////////////////

            it( 'decodes underscores as null (#65)', done => {
               eventBus.publish.calls.reset();

               simulateNavigationTo( '/stepOne', { taskId: '_' } )
                  .then( () => {
                     expect( eventBus.publish )
                        .toHaveBeenCalledWith( 'didNavigate.previous', {
                           target: 'previous',
                           place: 'stepOne/:taskId',
                           data: { taskId: null }
                        }, { sender: 'AxFlowController' } );
                  } )
                  .then( done );
            } );

            ///////////////////////////////////////////////////////////////////////////////////////////////

            describe( 'to the currently active place again', () => {

               beforeEach( done => {
                  eventBus.publish( 'navigateRequest.entry', {
                     target: 'entry'
                  } )
                  .then( done );
               } );

               ////////////////////////////////////////////////////////////////////////////////////////////

               it( 'afterwards accepts new navigation requests (#14)', done => {
                  $location.path.calls.reset();
                  eventBus.publish( 'navigateRequest.previous', {
                     target: 'previous',
                     data: {
                        taskId: 'halloTaskId'
                     }
                  } )
                  .then( () => {
                     expect( $location.path ).toHaveBeenCalledWith( '/stepOne/halloTaskId' );
                  } )
                  .then( done );
               } );

            } );

            ///////////////////////////////////////////////////////////////////////////////////////////////

            describe( 'when not the place but only parameter values change', () => {

               beforeEach( done => {
                  eventBus.publish( 'navigateRequest.previous', {
                     target: 'previous',
                     data: {
                        taskId: 'halloTaskId'
                     }
                  } )
                  .then( () => {
                     pageControllerMock_.tearDownPage.calls.reset();
                     return simulateNavigationTo( '/stepTwo', {
                        taskId: 'bla',
                        anotherThing: 'blub'
                     } );
                  } )
                  .then( done );
               } );

               ////////////////////////////////////////////////////////////////////////////////////////////

               it( 'does not trigger loading of the page', () => {
                  expect( pageControllerMock_.tearDownPage ).not.toHaveBeenCalled();
               } );

               ////////////////////////////////////////////////////////////////////////////////////////////

               it( 'propagates the new parameters', () => {
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

         describe( 'on navigation to an exit point', () => {

            beforeEach( () => {
               simulateNavigationTo( '/exit1', { taskId: 'bla' } );
            } );

            ///////////////////////////////////////////////////////////////////////////////////////////////

            it( 'calls the configured exit point function using the given arguments', () => {
               expect( exitPointSpy ).toHaveBeenCalledWith( { taskId: 'bla' } );
            } );

         } );

      } );

      /////////////////////////////////////////////////////////////////////////////////////////////////////

      describe( 'defines a flow service', () => {

         var flowService;

         beforeEach( done => {
            inject( function( axFlowService ) {
               flowService = axFlowService;
            } );

            invokeRunBlock()
               .then( () => simulateNavigationTo( '/stepOne', { taskId: 'bla' } ) )
               .then( done );
         } );

         //////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'with a method to get a path to a given target and parameters', () => {
            expect( flowService.constructPath( 'next', { anotherThing: 42 } ) )
               .toEqual( '/stepTwo/bla/42' );
         } );

         //////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'with a method to get an anchor to a given target and parameters', () => {
            expect( flowService.constructAnchor( 'next', { anotherThing: 42 } ) )
               .toEqual( '#/stepTwo/bla/42' );
         } );

         //////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'with a method to get an anchor to a given target and parameters', () => {
            expect( flowService.constructAbsoluteUrl( 'next', { anotherThing: 42 } ) )
               .toEqual( 'http://server/#/stepTwo/bla/42' );
         } );

         //////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'with a method to get the currently active place', () => {
            expect( flowService.place() )
               .toEqual( $route.routes[ '/stepOne' ].resolve.place() );
         } );

      } );

   } );

} );
