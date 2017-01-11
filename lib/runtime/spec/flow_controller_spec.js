/**
 * Copyright 2016 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
import * as flowControllerModule from '../flow_controller';
import { deepClone, setPath } from '../../utilities/object';
import { create as createConfigurationMock } from '../../testing/configuration_mock';
import { create as createLogMock } from '../../testing/log_mock';
import { create as createTimerMock } from '../../testing/timer_mock';
import { create as createEventBusMock } from '../../testing/event_bus_mock';
import { create as createArtifactProviderMock } from '../../testing/artifact_provider_mock';
import { create as createRouterMock } from './mocks/router_mock';

import flowDataSource from './data/flow_data';

const anyFunc = jasmine.any( Function );

const configOverrides = {};
const flowDataOverrides = {};

describe( 'A flow controller module', () => {

   it( 'defines a navigation target for the current placeName', () => {
      expect( flowControllerModule.TARGET_SELF ).toEqual( '_self' );
   } );

} );

//////////////////////////////////////////////////////////////////////////////////////////////////////////////

describe( 'A flow controller instance', () => {

   let flowData;
   let artifactProviderMock;
   let configurationData;
   let configurationMock;
   let eventBusMock;
   let flowController;
   let logMock;
   let pageControllerMock;
   let routerMock;
   let timerMock;

   beforeEach( () => {
      flowData = deepClone( flowDataSource );
      Object.keys( flowDataOverrides ).forEach( _ => {
         setPath( flowData, _, flowDataOverrides[ _ ] );
      } );
      artifactProviderMock = createArtifactProviderMock();
      artifactProviderMock.forFlow.mock( 'mainz', { definition: flowData } );

      configurationData = { 'flow.name': 'mainz', ...configOverrides };
      configurationMock = createConfigurationMock( configurationData );

      eventBusMock = createEventBusMock( { nextTick: f => { window.setTimeout( f, 0 ); } } );

      logMock = createLogMock();

      pageControllerMock = {
         tearDownPage: jasmine.createSpy( 'tearDownPage' ).and.callFake( () => Promise.resolve() ),
         setupPage: jasmine.createSpy( 'setupPage' ).and.callFake( () => Promise.resolve() )
      };
      const pageServiceMock = { controller: () => pageControllerMock };

      routerMock = createRouterMock();

      timerMock = createTimerMock();

      flowController = flowControllerModule.create(
         artifactProviderMock,
         configurationMock,
         eventBusMock,
         logMock,
         pageServiceMock,
         routerMock.router,
         timerMock
      );
   } );

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function startAtRoute( routeName, optionalContext = {} ) {
      return flowController.loadFlow()
         .then( routerMock.awaitRegisterRoutes )
         .then( () => routerMock.triggerRouteHandler( routeName, optionalContext ) )
         .then( awaitDidNavigate );
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function awaitDidNavigate() {
      return new Promise( resolve => {
         const unsubscribe = eventBusMock.subscribe( 'didNavigate', event => {
            resolve( event );
            unsubscribe();
         } );
      } );
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   it( 'subscribes to navigateRequest events', () => {
      expect( eventBusMock.subscribe ).toHaveBeenCalledWith(
         'navigateRequest',
         jasmine.any( Function ),
         { subscriber: 'AxFlowController' }
      );
   } );

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   describe( 'when the flow is loaded', () => {

      beforeEach( done => {
         startAtRoute( '/editor/:dataId' ).then( done, done.fail );
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'registers router-handlers for places with the `redirectTo` property', () => {
         expect( routerMock.routeMap[ '/entry' ] ).toEqual( anyFunc );
         expect( routerMock.routeMap[ '/backdoor' ] ).toEqual( anyFunc );
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'registers route-handlers for patterns of places with the `page` property', () => {
         expect( routerMock.routeMap[ '/editor/:dataId' ] ).toEqual( anyFunc );
         expect( routerMock.routeMap[ '/evaluation/:dataId/method/:method' ] ).toEqual( anyFunc );
         expect( routerMock.routeMap[ '/evaluation/:dataId' ] ).toEqual( anyFunc );
         expect( routerMock.routeMap[ '/step-with-options/:taskId' ] ).toEqual( anyFunc );
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'uses a simple fallback pattern for places without explicit URL pattern', () => {
         expect( routerMock.routeMap[ '/welcome' ] ).toEqual( anyFunc );
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'loads the page for the currently resolved route', () => {
         expect( pageControllerMock.setupPage ).toHaveBeenCalledWith( 'editor' );
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'sets the log tag for the current place', () => {
         expect( logMock.setTag ).toHaveBeenCalledWith( 'PLCE', 'editor' );
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'logs the time that the navigation took to take place', () => {
         expect( timerMock.started ).toHaveBeenCalled();
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      describe( 'and then asked to construct a URL', () => {

         let url;
         let routerCall;

         beforeEach( () => {
            routerMock.router.constructAbsoluteUrl.and.callFake( () => {
               return 'http://myserver/path';
            } );

            url = flowController.constructAbsoluteUrl( 'step-with-options', {
               param: 'a-param',
               optionA: 'aDefault'
            } );
            routerCall = routerMock.router.constructAbsoluteUrl.calls.mostRecent();
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'resolves the URL based on the current place', () => {
            expect( routerCall.args[ 0 ] ).toEqual( [
               '/step-with-options/:taskId'
            ] );
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'resolves the URL using the target place parameters (without defaults)', () => {
            expect( routerCall.args[ 1 ] ).toEqual( {
               param: 'a-param'
            } );
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'returns the URL as resolved by the router', () => {
            expect( url ).toEqual( 'http://myserver/path' );
         } );

      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      describe( 'and a different place is entered by the router', () => {

         beforeEach( done => {
            eventBusMock.publish.calls.reset();
            routerMock.triggerRouteHandler( '/evaluation/:dataId/method/:method' );
            awaitDidNavigate().then( done, done.fail );
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'publishes a corresponding willNavigate event', () => {
            expect( eventBusMock.publish ).toHaveBeenCalledWith( 'willNavigate.evaluation', {
               target: 'evaluation',
               place: 'evaluation',
               data: {}
            }, jasmine.any( Object ) );
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'eventually publishes a didNavigate event', () => {
            expect( eventBusMock.publish ).toHaveBeenCalledWith( 'didNavigate.evaluation', {
               target: 'evaluation',
               place: 'evaluation',
               data: {}
            }, jasmine.any( Object ) );
         } );

      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      describe( 'and the currently active place is entered by the router, with the same parameters', () => {

         beforeEach( () => {
            eventBusMock.publish.calls.reset();
            routerMock.triggerRouteHandler( '/editor/:dataId' );
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'does nothing', () => {
            expect( eventBusMock.publish ).not.toHaveBeenCalled();
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'logs this incident', () => {
            expect( logMock.trace ).toHaveBeenCalledWith(
               'Canceling navigation to "editor". Already there with same parameters.'
            );
         } );

      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      describe( 'and a place with parameter-defaults is entered by the router', () => {

         beforeEach( done => {
            eventBusMock.publish.calls.reset();
            routerMock.triggerRouteHandler( '/step-with-options/:taskId', { taskId: 'X' } );
            awaitDidNavigate().then( done, done.fail );
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'publishes a corresponding willNavigate event, filling in default values', () => {
            expect( eventBusMock.publish ).toHaveBeenCalledWith( 'willNavigate.step-with-options', {
               target: 'step-with-options',
               place: 'step-with-options',
               data: {
                  taskId: 'X',
                  optionA: 'aDefault',
                  'param-b': null,
                  'c&d': 'some stuff'
               }
            }, jasmine.any( Object ) );
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'eventually publishes a didNavigate event, filling in default values', () => {
            expect( eventBusMock.publish ).toHaveBeenCalledWith( 'didNavigate.step-with-options', {
               target: 'step-with-options',
               place: 'step-with-options',
               data: {
                  taskId: 'X',
                  optionA: 'aDefault',
                  'param-b': null,
                  'c&d': 'some stuff'
               }
            }, jasmine.any( Object ) );
         } );

      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      describe( 'on navigate request to same target with different parameters', () => {

         beforeEach( done => {
            pageControllerMock.tearDownPage.calls.reset();
            pageControllerMock.setupPage.calls.reset();
            eventBusMock.publish.calls.reset();

            routerMock.router.navigateTo.and.callFake( () => {
               // simulate an URL change
               routerMock.triggerRouteHandler( '/editor/:dataId', { dataId: 'some data' } );
            } );

            eventBusMock.publishAndGatherReplies( 'navigateRequest._self', {
               target: '_self',
               data: {
                  dataId: 'some data'
               }
            } ).then( done );
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'asks the router to navigate to the current place patterns, with the new parameters', () => {
            expect( routerMock.router.navigateTo ).toHaveBeenCalledWith( [ '/editor/:dataId' ], {
               dataId: 'some data'
            }, false );
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'does not ask the page controller to tear down the current page', () => {
            expect( pageControllerMock.tearDownPage ).not.toHaveBeenCalled();
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'does not ask the page controller to setup a page', () => {
            expect( pageControllerMock.setupPage ).not.toHaveBeenCalled();
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'sends a willNavigate event to indicate the start of navigation', () => {
            expect( eventBusMock.publish ).toHaveBeenCalledWith( 'willNavigate._self', {
               target: '_self',
               place: 'editor',
               data: { dataId: 'some data' }
            }, { sender: 'AxFlowController' } );
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'eventually sends a didNavigate event to indicate end of navigation', () => {
            expect( eventBusMock.publish ).toHaveBeenCalledWith( 'didNavigate._self', {
               target: '_self',
               place: 'editor',
               data: { dataId: 'some data' }
            }, { sender: 'AxFlowController' } );
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'keeps the same page as before', () => {
            expect( pageControllerMock.setupPage ).not.toHaveBeenCalled();
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'stops the navigation timer', () => {
            expect( timerMock._mockTimer.stopAndLog ).toHaveBeenCalled();
         } );

      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      describe( 'on navigate request to a different target', () => {

         beforeEach( done => {
            pageControllerMock.tearDownPage.calls.reset();
            pageControllerMock.setupPage.calls.reset();
            eventBusMock.publish.calls.reset();

            routerMock.router.navigateTo.and.callFake( () => {
               // simulate an URL change
               routerMock.triggerRouteHandler( '/welcome', {} );
            } );

            eventBusMock.publishAndGatherReplies( 'navigateRequest.welcome', {
               target: 'welcome',
               data: {}
            } ).then( done );
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'sends a willNavigate event to indicate the start of navigation', () => {
            expect( eventBusMock.publish ).toHaveBeenCalledWith( 'willNavigate.welcome', {
               target: 'welcome',
               place: 'welcome',
               data: {}
            }, { sender: 'AxFlowController' } );
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'asks the page controller to tear down the current page', () => {
            expect( pageControllerMock.tearDownPage ).toHaveBeenCalled();
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'sends a didNavigate event to indicate the end of navigation', () => {
            expect( eventBusMock.publish ).toHaveBeenCalledWith( 'didNavigate.welcome', {
               target: 'welcome',
               place: 'welcome',
               data: {}
            }, { sender: 'AxFlowController' } );
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'changes the active page to the requested target\'s page', () => {
            expect( pageControllerMock.setupPage ).toHaveBeenCalledWith( 'dir/welcome' );
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'sets the log tag for the new place to', () => {
            expect( logMock.setTag ).toHaveBeenCalledWith( 'PLCE', 'welcome' );
         } );

      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      describe( 'on navigate request to a different target omitting parameters', () => {

         beforeEach( done => {
            routerMock.triggerRouteHandler( '/editor/:dataId', { dataId: 100 } );
            eventBusMock.publish.calls.reset();

            awaitDidNavigate()
               .then( () => {
                  routerMock.router.navigateTo.and.callFake( ( patterns, params ) => {
                     // simulate the URL change
                     routerMock.triggerRouteHandler( patterns[ 0 ], params );
                  } );

                  return eventBusMock.publishAndGatherReplies( 'navigateRequest.next', {
                     target: 'next',
                     data: {}
                  } );
               } )
               .then( done, done.fail );
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'uses previous parameter values where available', () => {
            const { data } = eventBusMock.publish.calls.mostRecent().args[ 1 ];
            expect( data.dataId ).toEqual( 100 );
         } );

      } );

   } );

} );
