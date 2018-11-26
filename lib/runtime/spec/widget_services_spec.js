/**
 * Copyright 2016 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
import { create as createWidgetServices } from '../widget_services';
import { create as createArtifactProviderMock, MOCK_THEME } from '../../testing/artifact_provider_mock';
import { create as createEventBusMock } from '../../testing/event_bus_mock';
import { create as createConfigurationMock } from '../../testing/configuration_mock';
import { create as createControlLoaderMock } from '../../testing/control_loader_mock';
import { create as createLogMock } from '../../testing/log_mock';
import { create as createStorageMock } from '../../testing/storage_mock';
import { create as createToolingMock } from '../../testing/tooling_mock';
import { BLACKBOX } from '../../runtime/log';

describe( 'widget services', () => {

   let applicationServices;
   let areaHelperMock;
   let artifactProviderMock;
   let configurationMock;
   let controlLoaderMock;
   let debugEventBusMock;
   let eventBusMock;
   let flowServiceMock;
   let logMock;
   let heartbeatMock;
   let pageServiceMock;
   let storageMock;
   let toolingMock;

   let widgetSpecification;
   let widgetConfiguration;
   let features;

   let widgetServicesFactory;

   beforeEach( () => {
      areaHelperMock = {
         isVisible: jasmine.createSpy( 'isVisible' ).and.returnValue( false ),
         _deregister: jasmine.createSpy( 'deregister' ),
         register: jasmine.createSpy( 'register' ).and.callFake( () => areaHelperMock._deregister )
      };
      artifactProviderMock = createArtifactProviderMock();

      applicationServices = {
         simpleService: jasmine.createSpy( 'simpleService' )
            .and.callFake( () => ({ at: 'your service' }) ),
         serviceWithInjections: {
            injections: [ 'axConfiguration', 'axContext' ],
            create: jasmine.createSpy( 'serviceWithInjections' )
               .and.callFake( ( configuration, context ) => ({
                  configValue: configuration.get( 'i18n.fallback', 'de' ),
                  widgetId: context.widget.id
               }) )
         },
         serviceWithDestructor: {
            create() {},
            release: jasmine.createSpy( 'release' )
         }
      };
      configurationMock = createConfigurationMock( {
         'i18n.strict': false,
         'i18n.fallback': 'en',
         applicationServices
      } );

      controlLoaderMock = createControlLoaderMock( {
         'x': { module: 'moduleX' }
      } );
      debugEventBusMock = createEventBusMock();
      eventBusMock = createEventBusMock();
      flowServiceMock = { constructAbsoluteUrl() {} };
      logMock = createLogMock();
      heartbeatMock = {};
      pageServiceMock = {
         controller: () => ( { areaHelper: () => areaHelperMock } )
      };
      storageMock = createStorageMock();
      toolingMock = createToolingMock( debugEventBusMock, configurationMock, logMock );

      widgetSpecification = { name: 'test-widget' };
      widgetConfiguration = {
         area: 'content',
         widget: 'test/test-widget',
         id: 'testWidget-id0'
      };
      features = { x: 'y', i18n: { locale: 'en-GB' } };

      widgetServicesFactory = createWidgetServices(
         artifactProviderMock,
         configurationMock,
         controlLoaderMock,
         debugEventBusMock,
         eventBusMock,
         flowServiceMock,
         logMock,
         heartbeatMock,
         pageServiceMock,
         storageMock,
         toolingMock
      );
   } );

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   describe( 'provides injectable services with', () => {

      let widgetServices;
      let services;

      beforeEach( () => {
         widgetServices = widgetServicesFactory.forWidget(
            widgetSpecification, widgetConfiguration, features
         );
         services = widgetServices.services;
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      describe( 'axAreaHelper', () => {

         let mockNode;

         beforeEach( () => {
            mockNode = {};
            services.axAreaHelper.register( 'myArea', mockNode );
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'that forwards register calls with widget id to the currently active area helper', () => {
            expect( areaHelperMock.register )
               .toHaveBeenCalledWith( `${widgetConfiguration.id}.myArea`, mockNode, 'myArea' );
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         describe( 'when releasing the services again', () => {

            beforeEach( () => {
               widgetServices.releaseServices();
            } );

            //////////////////////////////////////////////////////////////////////////////////////////////////

            it( 'releases all registered areas', () => {
               expect( areaHelperMock._deregister ).toHaveBeenCalled();
            } );

         } );

      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      describe( 'axAssets', () => {

         beforeEach( () => {
            artifactProviderMock.forWidget.mock( widgetSpecification.name, {
               assets: {
                  'some.txt': { content: 'Hello, world!' },
                  'some.png': { url: 'path/to/my-images/some.png' },
                  [ MOCK_THEME ]: {
                     'any.txt': { content: 'Hello, colorful world!' },
                     'any.png': { url: 'path/to/my-images/any.png' }
                  }
               }
            } );
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'is a function resolving widget asset contents', done => {
            services.axAssets( 'some.txt' )
               .then( content => {
                  expect( content ).toEqual( 'Hello, world!' );
               } )
               .then( done, done.fail );
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'offers a function to resolve widget asset urls', done => {
            services.axAssets.url( 'some.png' )
               .then( content => {
                  expect( content ).toEqual( 'path/to/my-images/some.png' );
               } )
               .then( done, done.fail );
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'offers a function to themed resolve widget asset contents', done => {
            services.axAssets.forTheme( 'any.txt' )
               .then( content => {
                  expect( content ).toEqual( 'Hello, colorful world!' );
               } )
               .then( done, done.fail );
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'offers a function to themed resolve widget asset urls', done => {
            services.axAssets.urlForTheme( 'any.png' )
               .then( content => {
                  expect( content ).toEqual( 'path/to/my-images/any.png' );
               } )
               .then( done, done.fail );
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'that resolves to null for non existing assets', done => {
            Promise.all( [
               services.axAssets( 'unknown.txt' ),
               services.axAssets.url( 'unknown.txt' ),
               services.axAssets.forTheme( 'unknown.txt' ),
               services.axAssets.urlForTheme( 'unknown.txt' )
            ] ).then( ([ asset, assetUrl, assetForTheme, assetUrlForTheme ]) => {
               expect( asset ).toBe( null );
               expect( assetUrl ).toBe( null );
               expect( assetForTheme ).toBe( null );
               expect( assetUrlForTheme ).toBe( null );
            } )
            .then( done, done.fail );
         } );

      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      describe( 'axConfiguration', () => {

         it( 'that simply forwards to the global instance', () => {
            services.axConfiguration.get( 'x' );
            expect( configurationMock.get ).toHaveBeenCalledWith( 'x' );
         } );

      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      describe( 'axControls', () => {

         it( 'that simply forwards to the control loader', () => {
            expect( services.axControls.provide( 'x' ) ).toEqual( 'moduleX' );
            expect( controlLoaderMock.provide ).toHaveBeenCalledWith( 'x' );
         } );

      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      describe( 'axContext', () => {

         it( 'that is an object with context information', () => {
            const { axContext } = services;
            expect( axContext.eventBus ).toBe( services.axEventBus );
            expect( axContext.features ).toEqual( features );
            expect( axContext.id ).toBe( services.axId );
            expect( axContext.log ).toBe( services.axLog );
            expect( axContext.widget ).toEqual( {
               area: widgetConfiguration.area,
               id: widgetConfiguration.id,
               path: widgetConfiguration.widget
            } );
         } );

      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      describe( 'axEventBus', () => {

         let axEventBus;
         let axGlobalEventBus;
         let collaboratorId;

         beforeEach( () => {
            axEventBus = services.axEventBus;
            axGlobalEventBus = services.axGlobalEventBus;
            collaboratorId = `widget.${widgetSpecification.name}#${widgetConfiguration.id}`;
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'where subscribe gets the widget as subscriber', () => {
            const handler = () => {};
            axEventBus.subscribe( 'event', handler );
            expect( eventBusMock.subscribe )
               .toHaveBeenCalledWith( 'event', handler, { subscriber: collaboratorId } );
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'where publish gets the widget as sender', () => {
            axEventBus.publish( 'event' );
            expect( eventBusMock.publish )
               .toHaveBeenCalledWith( 'event', undefined, { sender: collaboratorId } );
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'where additional properties on publish are merged with the sender', () => {
            axEventBus.publish( 'event', { item: 'value' } );
            expect( eventBusMock.publish )
               .toHaveBeenCalledWith( 'event', { item: 'value' }, { sender: collaboratorId } );
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'where options on publish are passed on to the event bus', () => {
            axEventBus.publish( 'event', {}, { deliverToSender: false } );
            expect( eventBusMock.publish )
               .toHaveBeenCalledWith( 'event', {}, {
                  sender: collaboratorId,
                  deliverToSender: false
               } );
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'where publishAndGatherReplies gets the widget as sender', () => {
            axEventBus.publishAndGatherReplies( 'fakeRequest' );
            expect( eventBusMock.publishAndGatherReplies )
               .toHaveBeenCalledWith( 'fakeRequest', undefined, { sender: collaboratorId } );
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'where options on publishAndGatherReplies are passed on to the event bus', () => {
            axEventBus.publishAndGatherReplies( 'fakeRequest', {}, { deliverToSender: false } );
            expect( eventBusMock.publishAndGatherReplies )
               .toHaveBeenCalledWith( 'fakeRequest', {}, {
                  sender: collaboratorId,
                  deliverToSender: false
               } );
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         describe( 'and releasing the services again', () => {

            let mockUnsubscribeFunction;
            let mockRemoveFunction;

            beforeEach( () => {
               mockUnsubscribeFunction = jasmine.createSpy( 'unsubscribe' );
               axGlobalEventBus.subscribe.and.returnValue( mockUnsubscribeFunction );

               axEventBus.subscribe( 'something', () => {} );
               axEventBus.subscribe( 'something', () => {} );
               axEventBus.subscribe( 'something', () => {} );

               mockRemoveFunction = jasmine.createSpy( 'removeInspector' );
               axGlobalEventBus.addInspector.and.returnValue( mockRemoveFunction );

               axEventBus.addInspector( () => {} );
               axEventBus.addInspector( () => {} );

               spyOn( axEventBus, 'release' ).and.callThrough();
               widgetServices.releaseServices();
            } );

            //////////////////////////////////////////////////////////////////////////////////////////////////

            it( 'calls the event bus release method', () => {
               expect( axEventBus.release ).toHaveBeenCalled();
            } );

            //////////////////////////////////////////////////////////////////////////////////////////////////

            it( 'unsubscribes event bus subscriptions', () => {
               expect( mockUnsubscribeFunction ).toHaveBeenCalled();
               expect( mockUnsubscribeFunction.calls.count() ).toBe( 3 );
            } );

            //////////////////////////////////////////////////////////////////////////////////////////////////

            it( 'removes all added inspectors', () => {
               expect( mockRemoveFunction ).toHaveBeenCalled();
               expect( mockRemoveFunction.calls.count() ).toBe( 2 );
            } );

            //////////////////////////////////////////////////////////////////////////////////////////////////

            describe( 'and then publishing to the event bus again', () => {

               let publishResult = 'unknown';
               let publishAndGatherRepliesResult = 'unknown';

               beforeEach( done => {
                  eventBusMock.publish.calls.reset();
                  eventBusMock.publishAndGatherReplies.calls.reset();
                  const p1 = axEventBus.publish( 'event', {}, { deliverToSender: false } );
                  const p2 = axEventBus.publishAndGatherReplies( 'fakeRequest' );
                  Promise.all( [ p1, p2 ] )
                     .then( ([ r1, r2 ]) => {
                        publishResult = r1;
                        publishAndGatherRepliesResult = r2;
                     } )
                     .then( done );
               } );

               ///////////////////////////////////////////////////////////////////////////////////////////////

               it( 'does not forward publish calls to the global event bus anymore', () => {
                  expect( eventBusMock.publish ).not.toHaveBeenCalled();
                  expect( eventBusMock.publishAndGatherReplies ).not.toHaveBeenCalled();
               } );

               ///////////////////////////////////////////////////////////////////////////////////////////////

               it( 'resolves publish calls with a void promise', () => {
                  expect( publishResult ).toBe( undefined );
               } );

               ///////////////////////////////////////////////////////////////////////////////////////////////

               it( 'resolves publishAndGatherReplies calls with an empty list promise', () => {
                  expect( publishAndGatherRepliesResult ).toEqual( [] );
               } );

            } );

         } );

      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      describe( 'axFeatures', () => {

         it( 'that are the features determined for the widget', () => {
            expect( services.axFeatures ).toBe( features );
         } );

      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      describe( 'axFlowService', () => {

         it( 'that is equal to the global flow service instance without controller access', () => {
            expect( services.axFlowService.what ).toBe( flowServiceMock.what );
            expect( services.axFlowService.ever ).toBe( flowServiceMock.ever );
            expect( services.axFlowService.controller ).toBeUndefined();
         } );

      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      describe( 'axGlobalEventBus', () => {

         it( 'that is the global event bus instance', () => {
            expect( services.axGlobalEventBus ).toBe( eventBusMock );
         } );

      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      describe( 'axGlobalLog', () => {

         it( 'that is the global log instance', () => {
            expect( services.axGlobalLog ).toBe( logMock );
         } );

      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      describe( 'axGlobalStorage', () => {

         it( 'that is the global storage instance', () => {
            expect( services.axGlobalStorage ).toBe( storageMock );
         } );

      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      describe( 'axHeartbeat', () => {

         it( 'that is the global heartbeat instance', () => {
            expect( services.axHeartbeat ).toBe( heartbeatMock );
         } );

      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      describe( 'axI18n', () => {

         it( 'that is a widget-specific i18n instance', () => {
            expect( services.axI18n ).toBeDefined();
            expect( services.axI18n.localize ).toEqual( jasmine.any( Function ) );
            expect( services.axI18n.format ).toEqual( jasmine.any( Function ) );
            expect( services.axI18n.forFeature ).toEqual( jasmine.any( Function ) );
            expect( services.axI18n.languageTag ).toEqual( jasmine.any( Function ) );
            expect( services.axI18n.track ).toEqual( jasmine.any( Function ) );
            // ... (full test in separate spec)
         } );

      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      describe( 'axId', () => {

         it( 'that is an id generator for globally unique ids', () => {
            const { axId } = services;
            expect( axId( 'myLocalId' ) ).toEqual( `ax-${widgetConfiguration.id}-myLocalId` );
            expect( axId( 5 ) ).toEqual( `ax-${widgetConfiguration.id}-5` );
         } );

      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      describe( 'axLog', () => {

         it( 'that is wrapper forwarding to global log adding widget information', () => {
            const { axLog } = services;

            axLog.warn( 'hi' );
            expect( logMock.warn )
               .toHaveBeenCalledWith( 'test-widget: hi (widget-id: testWidget-id0)', BLACKBOX );

            axLog.log( 'ERROR', 'hui' );
            expect( logMock.log )
               .toHaveBeenCalledWith( 'ERROR', 'test-widget: hui (widget-id: testWidget-id0)', BLACKBOX );
         } );

      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      describe( 'axStorage', () => {

         let storage;

         beforeEach( () => {
            storage = services.axStorage;
            storage.local.setItem( 'x', 42 );
            storage.session.setItem( 'y', 23 );
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'that provides a session storage namespaced for the widget', () => {
            expect( storageMock.getSessionStorage ).toHaveBeenCalledWith( 'widget-testWidget-id0' );
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'that provides a local storage namespaced for the widget', () => {
            expect( storageMock.getLocalStorage ).toHaveBeenCalledWith( 'widget-testWidget-id0' );
         } );

      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      describe( 'axTooling', () => {

         it( 'that is the global tooling providers instance', () => {
            expect( services.axTooling ).toEqual( jasmine.any( Object ) );
         } );

      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      describe( 'axVisibility', () => {

         it( 'that is a widget-specific axVisibility instance', () => {
            expect( services.axVisibility ).toBeDefined();
            expect( services.axVisibility.isVisible ).toEqual( jasmine.any( Function ) );
            expect( services.axVisibility.track ).toEqual( jasmine.any( Function ) );
            expect( services.axVisibility.onShow ).toEqual( jasmine.any( Function ) );
            expect( services.axVisibility.updateAreaVisibility ).toEqual( jasmine.any( Function ) );
            // ... (full test in separate spec)
         } );

      } );

   } );

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   describe( 'when receiving decorators', () => {

      let services;

      beforeEach( () => {
         const widgetServices = widgetServicesFactory.forWidget(
            widgetSpecification, widgetConfiguration, features, {
               axId( id ) {
                  return suffix => `superPrefix--${id(suffix)}`;
               }
            }
         );
         services = widgetServices.services;
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'applies them to the widget services', () => {
         expect( services.axId( 'hey' ) ).toEqual( `superPrefix--ax-${widgetConfiguration.id}-hey` );
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'applies them to indirectly provided services', () => {
         expect( services.axContext.id( 'Ho' ) ).toEqual( `superPrefix--ax-${widgetConfiguration.id}-Ho` );
      } );

   } );

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   describe( 'provides application-defined injectable services that', () => {

      let widgetServices0;
      let widgetServices1;
      let instances0;
      let instances1;

      beforeEach( () => {
         widgetServices0 = widgetServicesFactory.forWidget(
            widgetSpecification, widgetConfiguration, features
         );
         instances0 = widgetServices0.services;

         widgetServices1 = widgetServicesFactory.forWidget( widgetSpecification, {
            area: 'content',
            widget: 'test/test-widget',
            id: 'testWidget-id1'
         }, features );
         instances1 = widgetServices1.services;
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'are not instantiated when unused', () => {
         expect( applicationServices.simpleService ).not.toHaveBeenCalled();
         expect( applicationServices.serviceWithInjections.create ).not.toHaveBeenCalled();
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      describe( 'when defined as plain functions', () => {

         it( 'are used as a factory', () => {
            expect( instances0.simpleService ).toEqual( { at: 'your service' } );
         } );

         it( 'are instantiated for each widget separately', () => {
            expect( instances0.simpleService ).toEqual( instances1.simpleService );
            expect( instances0.simpleService ).not.toBe( instances1.simpleService );
            expect( applicationServices.simpleService.calls.count() ).toEqual( 2 );
            expect( applicationServices.simpleService ).toHaveBeenCalledTimes( 2 );
         } );

      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      describe( 'when defined with injection requirements', () => {

         it( 'is provided with injections', () => {
            expect( instances0.serviceWithInjections )
               .toEqual( { configValue: 'en', widgetId: 'testWidget-id0' } );
            expect( instances1.serviceWithInjections )
               .toEqual( { configValue: 'en', widgetId: 'testWidget-id1' } );
         } );

      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      describe( 'when defined with a release-method, and the widget is destroyed', () => {

         let serviceWithDestructor;

         beforeEach( () => {
            // trigger instantiation:
            serviceWithDestructor = instances0.serviceWithDestructor;
            widgetServices0.releaseServices();
            // no release needed here:
            widgetServices1.releaseServices();
         } );

         ////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'is released', () => {
            expect( applicationServices.serviceWithDestructor.release )
               .toHaveBeenCalledWith( serviceWithDestructor );
         } );

         ////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'is only released when instantiated', () => {
            expect( applicationServices.serviceWithDestructor.release )
               .toHaveBeenCalledTimes( 1 );
         } );

      } );

   } );

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   describe( 'when trying to overwrite a service', () => {

      let widgetServices;
      let services;
      let getSpy;

      beforeEach( () => {
         widgetServices = widgetServicesFactory.forWidget(
            widgetSpecification, widgetConfiguration, features, {}
         );
         services = widgetServices.services;
         getSpy = jasmine.createSpy( 'getSpy' ).and.returnValue( 'FOO' );
         services.axFeatures = { test: 'ABC' };
         services.axConfiguration = { get: getSpy };
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'applies the override to the widget services', () => {
         expect( services.axConfiguration.get() ).toEqual( 'FOO' );
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'applies the override to indirectly provided services', () => {
         expect( services.axContext.features ).toEqual( { test: 'ABC' } );
      } );

   } );
} );
