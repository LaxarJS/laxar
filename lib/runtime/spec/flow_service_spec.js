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

const configOverrides = {};

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

   beforeEach( () => {
      entryPlace = flowData.processed.entryPlace;
      backdoorPlace = flowData.processed.backdoorPlace;
      welcomePlace = flowData.processed.welcomePlace;
      editorPlace = flowData.processed.editorPlace;
      evaluationPlace = flowData.processed.evaluationPlace;
   } );

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   let artifactProviderMock;
   let browserMock;
   let configurationData;
   let configurationMock;
   let eventBusMock;
   let exitPointSpy;
   let flowService;
   let locationMock;
   let logMock;
   let pageServiceMock;
   let pageRouterMock;
   let pageControllerMock;
   let timerMock;

   beforeEach( () => {
      exitPointSpy = jasmine.createSpy( 'exitPoint' );
      eventBusMock = createEventBusMock( { nextTick: f => { window.setTimeout( f, 0 ); } } );

      logMock = createLogMock();
      timerMock = createTimerMock();
      locationMock = createLocationMock();
      browserMock = createBrowserMock( { locationMock } );

      artifactProviderMock = createArtifactProviderMock();
      artifactProviderMock.forFlow.mock( 'mainz', {
         definition: flowData.sourceData
      } );

      configurationData = { ...createMockConfigurationData(), ...configOverrides };
      configurationMock = createConfigurationMock( configurationData );

      pageRouterMock = createPageRouterMock();
      pageControllerMock = {
         tearDownPage: jasmine.createSpy( 'tearDownPage' ).and.callFake( () => Promise.resolve() ),
         setupPage: jasmine.createSpy( 'setupPage' ).and.callFake( () => Promise.resolve() )
      };
      pageServiceMock = { controller: () => pageControllerMock };
   } );

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function createLocationMock() {
      return {
         hash: '#!/editor',
         href: 'https://server:4711/path?q=13#!/editor',
         pathname: '/path',
         hostname: 'server',
         port: 4711,
         protocol: 'https'
      };
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function createMockConfigurationData() {
      return {
         'flow.router': {
            hashbang: true
         },
         'flow.name': 'mainz',
         'flow.entryPoint': {
            target: 'myEntry2',
            parameters: {
               dataId: '42',
               method: 'average'
            }
         },
         'flow.exitPoints.save': exitPointSpy
      };
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function createFlowService() {
      return flowServiceModule.create(
         logMock,
         timerMock,
         artifactProviderMock,
         eventBusMock,
         configurationMock,
         browserMock,
         pageServiceMock,
         pageRouterMock.page
      );
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function startAtRoute( routeName ) {
      return flowService.controller().loadFlow()
         .then( pageRouterMock.awaitStart )
         .then( () => pageRouterMock.triggerRoute( routeName ) )
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

   describe( 'using hashbang URLs, at a given place', () => {

      beforeEach( done => {
         flowService = createFlowService();
         startAtRoute( '/welcome' ).then( done, done.fail );
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'calculates absolute URLs from target and parameters, using a hashbang fragment', () => {
         expect( flowService.constructAbsoluteUrl( 'next', { dataId: 42 } ) )
            .toEqual( 'https://server:4711/path#!/editor/42' );
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'calculates absolute URLs from place name and parameters, using a hashbang fragment', () => {
         expect( flowService.constructAbsoluteUrl( 'editor', { dataId: 42 } ) )
            .toEqual( 'https://server:4711/path#!/editor/42' );
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'calculates absolute URLs from place name without parameters, using a hashbang fragment', () => {
         expect( flowService.constructAbsoluteUrl( 'editor', {} ) )
            .toEqual( 'https://server:4711/path#!/editor/_' );
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'escapes parameters when calculating a hashbang fragment', () => {
         expect( flowService.constructAbsoluteUrl( 'editor', { dataId: 'evil/manipulation' } ) )
            .toEqual( 'https://server:4711/path#!/editor/evil%2Fmanipulation' );
         expect( flowService.constructAbsoluteUrl( 'editor', { dataId: 'nefarious hackery' } ) )
            .toEqual( 'https://server:4711/path#!/editor/nefarious%20hackery' );
         expect( flowService.constructAbsoluteUrl( 'editor', { dataId: 'insiduous?tampering=true' } ) )
            .toEqual( 'https://server:4711/path#!/editor/insiduous%3Ftampering%3Dtrue' );
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      describe( 'with query-support enabled', () => {

         overrideConfig( 'flow.query.enabled', true );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'encodes additional place parameters into the query string', () => {
            expect( flowService.constructAbsoluteUrl( 'editor', {
               dataId: 'theUsual',
               aKey: 'some-value',
               x: 'y'
            } ) )
               .toEqual( 'https://server:4711/path#!/editor/theUsual?aKey=some-value&x=y' );
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'escapes URL syntax in parameters and values', () => {
            expect( flowService.constructAbsoluteUrl( 'editor', {
               dataId: 'theUsual',
               'oth/er key': 's&me vALu/e'
            } ) )
               .toEqual( 'https://server:4711/path#!/editor/theUsual?oth%2Fer%20key=s%26me%20vALu%2Fe' );
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'encodes boolean values as value-less parameters', () => {
            expect( flowService.constructAbsoluteUrl( 'editor', {
               dataId: 'theUse', aFlag: true, bFlag: false
            } ) )
               .toEqual( 'https://server:4711/path#!/editor/theUse?aFlag' );
         } );

      } );

   } );

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   describe( 'using pushState/HTML5 URLs with explicit base, at a given place', () => {

      beforeEach( done => {
         configurationData[ 'flow.router.hashbang' ] = false;
         configurationData[ 'flow.router.base' ] = 'http://server:9001/some/path';
         flowService = createFlowService();
         startAtRoute( '/welcome' ).then( done, done.fail );
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'calculates absolute URLs from target and parameters, without hashbang fragment', () => {
         expect( flowService.constructAbsoluteUrl( 'next', { dataId: 42 } ) )
            .toEqual( 'http://server:9001/some/path/editor/42' );
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'calculates absolute URLs from place name and parameters, without hashbang fragment', () => {
         expect( flowService.constructAbsoluteUrl( 'editor', { dataId: 42 } ) )
            .toEqual( 'http://server:9001/some/path/editor/42' );
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'calculates absolute URLs from place name without parameters, without hashbang fragment', () => {
         expect( flowService.constructAbsoluteUrl( 'editor', {} ) )
            .toEqual( 'http://server:9001/some/path/editor/_' );
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'escapes parameters when calculating the path', () => {
         expect( flowService.constructAbsoluteUrl( 'editor', { dataId: 'evil/manipulation' } ) )
            .toEqual( 'http://server:9001/some/path/editor/evil%2Fmanipulation' );
         expect( flowService.constructAbsoluteUrl( 'editor', { dataId: 'nefarious hackery' } ) )
            .toEqual( 'http://server:9001/some/path/editor/nefarious%20hackery' );
         expect( flowService.constructAbsoluteUrl( 'editor', { dataId: 'insiduous?tampering=true' } ) )
            .toEqual( 'http://server:9001/some/path/editor/insiduous%3Ftampering%3Dtrue' );
      } );

   } );

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   describe( 'using hashbang, with explicit base', () => {

      beforeEach( done => {
         configurationData[ 'flow.router.base' ] = 'http://server:9001/some/path';
         flowService = createFlowService();
         startAtRoute( '/welcome' ).then( done, done.fail );
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'uses the document base URL to calculate absolute URLs from place name and parameters', () => {
         expect( flowService.constructAbsoluteUrl( 'editor', { dataId: 42 } ) )
            .toEqual( 'http://server:9001/some/path#!/editor/42' );
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'uses the document base URL to calculate URLs from place name without parameters', () => {
         expect( flowService.constructAbsoluteUrl( 'editor', {} ) )
            .toEqual( 'http://server:9001/some/path#!/editor/_' );
      } );

   } );

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   describe( 'using pushState/HTML5 URLs, without explicit base', () => {

      const fakeBase = 'https://otherserver:9101/other/path';

      beforeEach( done => {
         configurationData[ 'flow.router.hashbang' ] = false;
         // fake an external base href
         browserMock.resolve.and.callFake( ( url, base ) => {
            browserMock.resolve.and.callFake( ( url, base ) => {
               expect( url ).toEqual( fakeBase );
               expect( base ).toEqual( 'https://server:4711' );
               return url;
            } );
            expect( url ).toEqual( '.' );
            expect( base ).not.toBeDefined();
            return fakeBase;
         } );
         flowService = createFlowService();
         startAtRoute( '/welcome' ).then( done, done.fail );
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'uses the document base URL to calculate absolute URLs from place name and parameters', () => {
         expect( browserMock.resolve.calls.count() ).toEqual( 2 );
         expect( flowService.constructAbsoluteUrl( 'editor', { dataId: 42 } ) )
            .toEqual( 'https://otherserver:9101/other/path/editor/42' );
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'uses the document base URL to calculate URLs from place name without parameters', () => {
         expect( flowService.constructAbsoluteUrl( 'editor', {} ) )
            .toEqual( 'https://otherserver:9101/other/path/editor/_' );
      } );

   } );

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   describe( 'provides a flow controller', () => {

      beforeEach( () => {
         flowService = createFlowService();
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'that has no places when the flow is not loaded', () => {
         expect( flowService.controller().places() ).toEqual( {} );
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
         flowService.controller().loadFlow()
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

      describe( 'that when the flow is loaded', () => {

         beforeEach( done => {
            startAtRoute( '/editor/:dataId' ).then( done, done.fail );
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'provides the loaded places', () => {
            const places = flowService.controller().places();
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
            const { placeNameForNavigationTarget } = flowService.controller();
            expect( placeNameForNavigationTarget( 'next', welcomePlace ) ).toEqual( 'editor' );
            expect( placeNameForNavigationTarget( 'home', welcomePlace ) ).toEqual( 'entry' );
            expect( placeNameForNavigationTarget( '_self', welcomePlace ) ).toEqual( 'welcome' );
            expect( placeNameForNavigationTarget( 'editor', welcomePlace ) ).toEqual( 'editor' );
            expect( placeNameForNavigationTarget( 'next', editorPlace ) ).toEqual( 'evaluation' );
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'creates a redirect for the selected entry point', () => {
            expect( pageRouterMock.page.redirect ).toHaveBeenCalledWith( '/entry', '/evaluation/42/average' );
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'creates a redirect for places with redirectTo property', () => {
            expect( pageRouterMock.page.redirect ).toHaveBeenCalledWith( '/backdoor', '/editor' );
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'loads the place for the currently resolved route', () => {
            expect( flowService.controller().place() ).toEqual( editorPlace );
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'sets the log tag for the place', () => {
            expect( logMock.setTag ).toHaveBeenCalledWith( 'PLCE', 'editor/:dataId' );
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'logs the time the navigation took to take place', () => {
            expect( timerMock.started ).toHaveBeenCalled();
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         describe( 'when a different place is entered through the router (e.g. because of a link)', () => {

            beforeEach( done => {
               eventBusMock.publish.calls.reset();
               awaitDidNavigate().then( done, done.fail );
               pageRouterMock.triggerRoute( '/evaluation' );
            } );

            //////////////////////////////////////////////////////////////////////////////////////////////////

            it( 'publishes a corresponding willNavigate event', () => {
               // TODO (#373) the event should be 'willNavigate' without target, but the flow controller
               //             inserts a target based on the current place, so we have to use `jasmine.any`.
               // TODO (#373) the place should be `step-with-options/:taskId` (`base` must be removed).
               expect( eventBusMock.publish ).toHaveBeenCalledWith( jasmine.any( String ), {
                  target: jasmine.any( String ),
                  place: 'evaluation/:dataId/:method',
                  data: {}
               }, jasmine.any( Object ) );
            } );

            //////////////////////////////////////////////////////////////////////////////////////////////////

            it( 'eventually publishes a dNavigate event', () => {
               // TODO (#373) the event should be 'didNavigate' without target, but the flow controller
               //             inserts a target based on the current place, so we have to use `jasmine.any`.
               expect( eventBusMock.publish ).toHaveBeenCalledWith( jasmine.any( String ), {
                  target: jasmine.any( String ),
                  place: 'evaluation/:dataId/:method',
                  data: {}
               }, jasmine.any( Object ) );
            } );

         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         describe( 'with support for query parameters', () => {

            overrideConfig( 'flow.query.enabled', true );

            let lastData;
            beforeEach( () => {
               eventBusMock.subscribe( 'didNavigate', event => {
                  lastData = event.data;
               } );
            } );

            //////////////////////////////////////////////////////////////////////////////////////////////////

            it( 'publishes defaults for query parameters upon direct navigation', done => {
               pageRouterMock.triggerRoute( '/step-with-options' );
               awaitDidNavigate()
                  .then( () => {
                     expect( lastData ).toEqual( {
                        'optionA': 'aDefault',
                        'param-b': null,
                        'c&d': 'some stuff'
                     } );
                  } )
                  .then( done, done.fail );
            } );

            //////////////////////////////////////////////////////////////////////////////////////////////////

            it( 'supports navigation with query parameters', done => {
               pageRouterMock.triggerRoute( '/step-with-options/:taskId', {
                  params: { taskId: 'taskX' },
                  querystring: 'param-b=yeah'
               } );

               awaitDidNavigate()
                  .then( () => {
                     expect( lastData ).toEqual( {
                        taskId: 'taskX',
                        optionA: 'aDefault',
                        'param-b': 'yeah',
                        'c&d': 'some stuff'
                     } );
                  } )
                  .then( done, done.fail );
            } );

            //////////////////////////////////////////////////////////////////////////////////////////////////

            it( 'supports navigation with boolean place parameters', done => {
               pageRouterMock.triggerRoute( '/step-with-options/:taskId', {
                  params: { taskId: 'taskX' },
                  querystring: 'optionA'
               } );

               awaitDidNavigate()
                  .then( () => {
                     expect( lastData ).toEqual( {
                        taskId: 'taskX',
                        optionA: true,
                        'param-b': null,
                        'c&d': 'some stuff'
                     } );
                  } )
                  .then( done, done.fail );
            } );

            //////////////////////////////////////////////////////////////////////////////////////////////////

            it( 'supports navigation with url-encoded parameters', done => {
               pageRouterMock.triggerRoute( '/step-with-options/:taskId', {
                  params: { taskId: 'taskX' },
                  querystring: 'c%26d=e%20f%26g'
               } );

               awaitDidNavigate()
                  .then( () => {
                     expect( lastData ).toEqual( {
                        taskId: 'taskX',
                        optionA: 'aDefault',
                        'param-b': null,
                        'c&d': 'e f&g'
                     } );
                  } )
                  .then( done, done.fail );
            } );

         } );

      } );

   } );

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   describe( 'with completely set-up flow controller', () => {

      const PUBLISH_OPTIONS = { sender: 'AxFlowController' };

      beforeEach( done => {
         flowService = createFlowService();
         locationMock.hash = '#!/editor/13';
         locationMock.href = `http://server:8080/${locationMock.hash}`;

         flowService.controller().loadFlow()
            .then( pageRouterMock.awaitStart )
            .then( () => pageRouterMock.triggerRoute( '/editor/:dataId', { params: { dataId: '13' } } ) )
            .then( awaitDidNavigate )
            .then( () => {
               pageControllerMock.tearDownPage.calls.reset();
               pageControllerMock.setupPage.calls.reset();
            } )
            .then( done, done.fail );
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      describe( 'on navigate request to the currently active place and same parameters', () => {

         beforeEach( done => {
            pageRouterMock.awaitShow( '/editor/13' )
               .then( () => {
                  eventBusMock.publish.calls.reset();
                  pageRouterMock.triggerRoute( '/editor/:dataId', { params: { dataId: '13' } } );
               } )
               .then( done, done.fail );

            eventBusMock.publishAndGatherReplies( `navigateRequest.${flowServiceModule.TARGET_SELF}`, {
               target: flowServiceModule.TARGET_SELF,
               data: { dataId: 13 }
            } );
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
            pageRouterMock.awaitShow( '/welcome' )
               .then( () => {
                  eventBusMock.publish.calls.reset();
                  pageRouterMock.triggerRoute( '/welcome' );
               } )
               .then( awaitDidNavigate )
               .then( done, done.fail );

            eventBusMock.publishAndGatherReplies( 'navigateRequest.welcome', { target: 'welcome' } );
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
            expect( flowService.controller().place() ).toEqual( welcomePlace );
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'sets the log tag for the place navigated to', () => {
            expect( logMock.setTag ).toHaveBeenCalledWith( 'PLCE', 'welcome' );
         } );

      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      describe( 'on navigate request to same target with different parameters', () => {

         beforeEach( done => {
            pageRouterMock.awaitShow()
               .then( () => {
                  eventBusMock.publish.calls.reset();
                  pageRouterMock.triggerRoute( '/editor/:dataId', {
                     params: { dataId: 'potentially/evil?data' }
                  } );
               } )
               .then( awaitDidNavigate )
               .then( done, done.fail );

            eventBusMock.publishAndGatherReplies( `navigateRequest.${flowServiceModule.TARGET_SELF}`, {
               target: flowServiceModule.TARGET_SELF,
               data: {
                  dataId: 'potentially/evil?data'
               }
            } );
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'sends a willNavigate event to indicate start of navigation', () => {
            expect( eventBusMock.publish ).toHaveBeenCalledWith( 'willNavigate._self', {
               target: '_self',
               place: 'editor/:dataId',
               data: { dataId: 'potentially/evil?data' }
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
               data: { dataId: 'potentially/evil?data' }
            }, PUBLISH_OPTIONS );
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'keeps the same place as before', () => {
            expect( flowService.controller().place() ).toEqual( editorPlace );
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'sets the log tag to the same place as before', () => {
            expect( logMock.setTag ).toHaveBeenCalledWith( 'PLCE', 'editor/:dataId' );
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'stops the navigation timer', () => {
            expect( timerMock._mockTimer.stopAndLog ).toHaveBeenCalled();
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'encodes URI syntax in parameters values', () => {
            const [ url ] = pageRouterMock.page.show.calls.mostRecent().args;
            expect( url ).toEqual( '/editor/potentially%2Fevil%3Fdata' );
         } );

      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      describe( 'on navigate request to a different target omitting parameters', () => {

         beforeEach( done => {
            pageRouterMock.awaitShow()
               .then( () => {
                  pageRouterMock.triggerRoute( '/evaluation/:dataId/:method', {
                     params: { dataId: '13', method: '_' }
                  } );
               } )
               .then( awaitDidNavigate )
               .then( done, done.fail );

            eventBusMock.publishAndGatherReplies( 'navigateRequest.next', { target: 'next' } );
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'encodes null parameters using an underscore', () => {
            const [ url ] = pageRouterMock.page.show.calls.mostRecent().args;
            expect( url ).toEqual( '/evaluation/13/_' );
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'uses previous parameter values where available', () => {
            const { data } = eventBusMock.publish.calls.mostRecent().args[ 1 ];
            expect( data.dataId ).toEqual( '13' );
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'returns null otherwise', () => {
            const { data } = eventBusMock.publish.calls.mostRecent().args[ 1 ];
            expect( data.method ).toBe( null );
         } );

      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      describe( 'on navigate request to a place with exit point', () => {

         beforeEach( done => {

            pageRouterMock.awaitShow( '/exit/42/_' )
               .then( () => {
                  eventBusMock.publish.calls.reset();
                  pageRouterMock.routeHandlers[ '/exit/:dataId' ]( {
                     params: { dataId: '42', method: null }
                  } );
               } )
               .then( done, done.fail );

            eventBusMock.publishAndGatherReplies( 'navigateRequest.exit', {
               target: 'exit',
               data: {
                  dataId: '42'
               }
            } );

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

function overrideConfig( path, value ) {
   beforeAll( () => {
      configOverrides[ path ] = value;
   } );
   afterAll( () => {
      delete configOverrides[ path ];
   } );
}
