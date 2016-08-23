/**
 * Copyright 2016 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
import * as flowServiceModule from '../flow_service';
import { create as createBrowserMock } from '../../testing/browser_mock';
import { create as createConfigurationMock } from '../../testing/configuration_mock';
import { create as createLogMock } from '../../testing/log_mock';
import { create as createTimerMock } from '../../testing/timer_mock';
import { create as createEventBusMock } from '../../testing/event_bus_mock';
import { create as createArtifactProviderMock } from '../../testing/artifact_provider_mock';
import { create as createPageRouterMock } from './mocks/page_router_mock';
import flowData from './data/flow_data';


describe( 'A flow service module', () => {

   it( 'defines a navigation target for the current placeName', () => {
      expect( flowServiceModule.TARGET_SELF ).toEqual( '_self' );
   } );

} );

//////////////////////////////////////////////////////////////////////////////////////////////////////////////

describe( 'A flow service instance', () => {

   let entryPlace;
   let backdoorPlace;
   let welcomePlace;
   let editorPlace;
   let evaluationPlace;
   let exitPlace;

   beforeEach( () => {
      entryPlace = flowData.processed.entryPlace;
      backdoorPlace = flowData.processed.backdoorPlace;
      welcomePlace = flowData.processed.welcomePlace;
      editorPlace = flowData.processed.editorPlace;
      evaluationPlace = flowData.processed.evaluationPlace;
      exitPlace = flowData.processed.exitPlace;
   } );

   let logMock;
   let timerMock;
   let artifactProviderMock;
   let eventBusMock;
   let pageRouterMock;
   let locationMock;
   let pageControllerMock;
   let flowService;
   let exitPointSpy;

   beforeEach( () => {
      exitPointSpy = jasmine.createSpy( 'exitPoint' );
      eventBusMock = createEventBusMock( { nextTick: f => { window.setTimeout( f, 0 ); } } );

      logMock = createLogMock();
      timerMock = createTimerMock();
      locationMock = {
         hash: '#!/editor',
         href: 'http://server:8080/path?q=13#!/editor',
         pathname: location.pathname
      };
      const browserMock = createBrowserMock( { locationMock } );

      artifactProviderMock = createArtifactProviderMock();
      artifactProviderMock.forFlow.mock( 'mainz', {
         definition: flowData.sourceData
      } );

      const configurationMock = createConfigurationMock( {
         'flow.name': 'mainz',
         'flow.entryPoint': {
            target: 'myEntry2',
            parameters: {
               dataId: '42',
               method: 'average'
            }
         },
         'flow.exitPoints.save': exitPointSpy
      } );

      pageRouterMock = createPageRouterMock( browserMock, eventBusMock, {
         '/entry': entryPlace,
         '/backdoor': backdoorPlace,
         '/welcome': welcomePlace,
         '/editor': editorPlace,
         [ `/${editorPlace.id}` ]: editorPlace,
         '/evaluation': evaluationPlace,
         '/evaluation/:dataId': evaluationPlace,
         [ `/${evaluationPlace.id}` ]: evaluationPlace,
         '/exit': exitPlace,
         '/exit/:dataId': exitPlace,
         [ `/${exitPlace.id}` ]: exitPlace
      } );
      pageControllerMock = {
         tearDownPage: jasmine.createSpy( 'tearDownPage' ).and.callFake( () => Promise.resolve() ),
         setupPage: jasmine.createSpy( 'setupPage' ).and.callFake( () => Promise.resolve() )
      };
      const pageServiceMock = { controller: () => pageControllerMock };
      flowService = flowServiceModule.create(
         logMock,
         timerMock,
         artifactProviderMock,
         eventBusMock,
         configurationMock,
         browserMock,
         pageServiceMock,
         pageRouterMock
      );
   } );

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   describe( 'with available places', () => {

      beforeEach( done => {
         flowService.controller().loadFlow()
            .then( () => pageRouterMock.initialNavigationPromise )
            .then( () => pageRouterMock._simulateNavigationTo( 'welcome', welcomePlace ) )
            .then( done, done.fail );
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'has a method to get a path to a given target and parameters', () => {
         expect( flowService.constructPath( 'next', { dataId: 42 } ) )
            .toEqual( '/editor/42' );
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'has a method to get an anchor to a given target and parameters', () => {
         expect( flowService.constructAnchor( 'next', { dataId: 42 } ) )
            .toEqual( '#!/editor/42' );
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'has a method to get an absolute url to a given target and parameters', () => {
         expect( flowService.constructAbsoluteUrl( 'next', { dataId: 42 } ) )
            .toEqual( 'http://server:8080/path#!/editor/42' );
      } );

   } );

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   describe( 'provides a flow controller', () => {

      let flowController;

      beforeEach( () => {
         flowController = flowService.controller();
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'that has no places when the flow is not loaded', () => {
         expect( flowController.places() ).toEqual( {} );
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'that subscribes to navigateRequest events', () => {
         expect( eventBusMock.subscribe ).toHaveBeenCalledWith(
            'navigateRequest',
            jasmine.any( Function ),
            { subscriber: 'AxFlowController' }
         );
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'that validates the flow data to load', done => {
         artifactProviderMock.forFlow.mock( 'mainz', {
            definition: { its: 'me' }
         } );
         flowController.loadFlow()
            .then( done.fail, err => {
               expect( err ).toEqual( new Error( 'Illegal flow.json format' ) );
               expect( logMock.error ).toHaveBeenCalledWith(
                  'Failed validating flow file:\n[0]',
                  ' - Missing required property: places. Path: "$.places".\n' +
                  ' - Additional properties not allowed: its. Path: "$.its".'
               );
            } )
            .then( done, done.fail );
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      describe( 'when the flow is loaded', () => {

         beforeEach( done => {
            flowController.loadFlow()
               .then( () => pageRouterMock.initialNavigationPromise )
               .then( done, done.fail );
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'provides the loaded places', () => {
            const places = flowController.places();
            expect( places[ 'entry' ] ).toEqual( entryPlace );
            expect( places[ 'backdoor' ] ).toEqual( backdoorPlace );
            expect( places[ 'entry' ] ).toEqual( entryPlace );
            expect( places[ 'welcome' ] ).toEqual( welcomePlace );
            expect( places[ 'editor' ] ).toEqual( editorPlace );
            expect( places[ 'editor/:dataId' ] ).toEqual( editorPlace );
            expect( places[ 'evaluation' ] ).toEqual( evaluationPlace );
            expect( places[ 'evaluation/:dataId' ] ).toEqual( evaluationPlace );
            expect( places[ 'evaluation/:dataId/:method' ] ).toEqual( evaluationPlace );
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'allows to return the place for a given navigation target or place', () => {
            const { placeNameForNavigationTarget } = flowController;
            expect( placeNameForNavigationTarget( 'next', welcomePlace ) ).toEqual( 'editor' );
            expect( placeNameForNavigationTarget( 'home', welcomePlace ) ).toEqual( 'entry' );
            expect( placeNameForNavigationTarget( '_self', welcomePlace ) ).toEqual( 'welcome' );
            expect( placeNameForNavigationTarget( 'editor', welcomePlace ) ).toEqual( 'editor' );
            expect( placeNameForNavigationTarget( 'next', editorPlace ) ).toEqual( 'evaluation' );
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'creates a redirect for the selected entry point', () => {
            expect( pageRouterMock.redirect ).toHaveBeenCalledWith( '/entry', '/evaluation/42/average' );
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'creates a redirect for places with redirectTo property', () => {
            expect( pageRouterMock.redirect ).toHaveBeenCalledWith( '/backdoor', '/editor' );
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'loads the place for the current url', () => {
            expect( flowController.place() ).toEqual( editorPlace );
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'sets the log tag for the place', () => {
            expect( logMock.setTag ).toHaveBeenCalledWith( 'PLCE', 'editor/:dataId' );
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'logs the time the navigation took to take place', () => {
            expect( timerMock.started ).toHaveBeenCalled();
         } );

      } );

   } );

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   describe( 'with completely set-up flow controller', () => {

      const PUBLISH_OPTIONS = { sender: 'AxFlowController' };
      let flowController;

      beforeEach( done => {
         locationMock.hash = '#!/editor/13';
         locationMock.href = `http://server:8080/${locationMock.hash}`;

         flowController = flowService.controller();
         flowController.loadFlow()
            .then( () => pageRouterMock.initialNavigationPromise )
            .then( () => {
               pageControllerMock.tearDownPage.calls.reset();
               pageControllerMock.setupPage.calls.reset();
            } )
            .then( done, done.fail );
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      describe( 'on navigate request to the currently active place and same parameters', () => {

         beforeEach( done => {
            eventBusMock.publishAndGatherReplies( `navigateRequest.${flowServiceModule.TARGET_SELF}`, {
               target: flowServiceModule.TARGET_SELF,
               data: {
                  dataId: 13
               }
            } ).then( done, done.fail );
            eventBusMock.publish.calls.reset();
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'does nothing', () => {
            expect( eventBusMock.publish ).not.toHaveBeenCalled();
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'logs this incident', () => {
            expect( logMock.trace ).toHaveBeenCalledWith(
               'Canceling navigation to "editor/:dataId". Already there with same parameters.'
            );
         } );

      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      describe( 'on navigate request to a different target', () => {

         beforeEach( done => {
            eventBusMock.publishAndGatherReplies( 'navigateRequest.welcome', {
               target: 'welcome'
            } ).then( done, done.fail );
            eventBusMock.publish.calls.reset();
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'sends a willNavigate event to indicate start of navigation', () => {
            expect( eventBusMock.publish ).toHaveBeenCalledWith( 'willNavigate.welcome', {
               target: 'welcome',
               place: 'welcome',
               data: {}
            }, PUBLISH_OPTIONS );
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'asks the page controller to tear down the current page', () => {
            expect( pageControllerMock.tearDownPage ).toHaveBeenCalled();
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'asks the page controller to setup the next page', () => {
            expect( pageControllerMock.setupPage ).toHaveBeenCalledWith( welcomePlace.page );
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'sends a didNavigate event to indicate end of navigation', () => {
            expect( eventBusMock.publish ).toHaveBeenCalledWith( 'didNavigate.welcome', {
               target: 'welcome',
               place: 'welcome',
               data: {}
            }, PUBLISH_OPTIONS );
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'changes the active place to the place navigated to', () => {
            expect( flowController.place() ).toEqual( welcomePlace );
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'sets the log tag for the place navigated to', () => {
            expect( logMock.setTag ).toHaveBeenCalledWith( 'PLCE', 'welcome' );
         } );

      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      describe( 'on navigate request to same target with different parameters', () => {

         beforeEach( done => {
            eventBusMock.publishAndGatherReplies( `navigateRequest.${flowServiceModule.TARGET_SELF}`, {
               target: flowServiceModule.TARGET_SELF,
               data: {
                  dataId: 1985
               }
            } ).then( done, done.fail );
            eventBusMock.publish.calls.reset();
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'sends a willNavigate event to indicate start of navigation', () => {
            expect( eventBusMock.publish ).toHaveBeenCalledWith( 'willNavigate._self', {
               target: '_self',
               place: 'editor/:dataId',
               data: { dataId: '1985' }
            }, PUBLISH_OPTIONS );
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

         it( 'sends a didNavigate event to indicate end of navigation', () => {
            expect( eventBusMock.publish ).toHaveBeenCalledWith( 'didNavigate._self', {
               target: '_self',
               place: 'editor/:dataId',
               data: { dataId: '1985' }
            }, PUBLISH_OPTIONS );
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'keeps the same place as before', () => {
            expect( flowController.place() ).toEqual( editorPlace );
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'sets the log tag to the same place as before', () => {
            expect( logMock.setTag ).toHaveBeenCalledWith( 'PLCE', 'editor/:dataId' );
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'stops the navigation timer', () => {
            expect( timerMock._mockTimer.stopAndLog ).toHaveBeenCalled();
         } );

      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      describe( 'on navigate request to a different target omitting parameters', () => {

         beforeEach( done => {
            eventBusMock.publishAndGatherReplies( 'navigateRequest.next', {
               target: 'next'
            } ).then( done, done.fail );
            eventBusMock.publish.calls.reset();
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'use previous values where available', () => {
            const { data } = eventBusMock.publish.calls.mostRecent().args[ 1 ];
            expect( data.dataId ).toEqual( '13' );
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'returns null otherwise', () => {
            const { data } = eventBusMock.publish.calls.mostRecent().args[ 1 ];
            expect( data.method ).toBe( null );
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'encoded null parameters using an underscore', () => {
            const [ url ] = pageRouterMock.calls.mostRecent().args;
            expect( url ).toEqual( '/evaluation/13/_' );
         } );

      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      describe( 'on navigate request to  place with exit point', () => {

         beforeEach( done => {
            eventBusMock.publishAndGatherReplies( 'navigateRequest.exit', {
               target: 'exit',
               data: {
                  dataId: '42'
               }
            } ).then( done, done.fail );
            eventBusMock.publish.calls.reset();
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'calls the correct exit point function with the provided parameters', () => {
            expect( exitPointSpy ).toHaveBeenCalledWith( {
               dataId: '42',
               method: null
            } );
         } );

      } );

   } );

} );
