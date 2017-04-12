/**
 * Copyright 2016 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */

import { deepClone } from '../../utilities/object';

import { create as createWidgetLoader } from '../widget_loader';
import { create as createLogMock } from '../../testing/log_mock';
import { create as createControlLoaderMock } from '../../testing/control_loader_mock';
import { create as createEventBusMock } from '../../testing/event_bus_mock';
import { create as createArtifactProviderMock, MOCK_THEME } from '../../testing/artifact_provider_mock';
import widgetData from './data/widget_data';

//////////////////////////////////////////////////////////////////////////////////////////////////////////////

describe( 'An initialized widgetLoader', () => {

   let widgetDescriptor;
   let widgetConfiguration;

   beforeEach( () => {
      widgetDescriptor = deepClone( widgetData.descriptor );
      widgetConfiguration = deepClone( widgetData.configuration );
   } );

   let artifactProviderMock;
   let controlLoaderMock;
   let debugEventBusMock;
   let widgetLoader;
   let widgetServicesMock;
   let widgetServicesFactoryMock;
   let widgetAdapterModuleMock;

   // arguments that the widget loader passes to the widget adapter are saved here for inspection
   let widgetAdapterEnvironment;

   beforeEach( () => {

      const mockControls = {
         'new-control': { module: {}, descriptor: { name: 'new-control' } },
         '/some/control': { module: {}, descriptor: { name: 'control' } }
      };

      artifactProviderMock = createArtifactProviderMock();
      artifactProviderMock.forWidget.mock( 'test/test_widget', {
         descriptor: widgetDescriptor,
         assets: {
            [ MOCK_THEME ]: {
               'test-widget.html': { content: widgetData.htmlTemplate },
               'css/test-widget.css': { url: 'path/to/css/test-widget.css' }
            }
         }
      } );

      controlLoaderMock = createControlLoaderMock( mockControls );
      debugEventBusMock = createEventBusMock();

      widgetAdapterModuleMock = {
         create: jasmine.createSpy( 'adapterModule.create' ).and.callFake(
            environment => {
               widgetAdapterEnvironment = environment;
               widgetAdapterEnvironment.provideServices( { mockServiceName: 'mock service' } );
               return {
                  domAttachTo: jasmine.createSpy( 'adapter.domAttachTo' ),
                  domDetach: jasmine.createSpy( 'adapter.domDetach' ),
                  destroy: jasmine.createSpy( 'adapter.destroy' )
               };
            }
         )
      };
      widgetServicesMock = {
         services: { axContext: {} },
         releaseServices: jasmine.createSpy( 'releaseServices' )
      };
      widgetServicesFactoryMock = jasmine.createSpy( 'widgetServicesFactoryMock' )
         .and.returnValue( widgetServicesMock );

      widgetLoader = createWidgetLoader(
         createLogMock(),
         artifactProviderMock,
         debugEventBusMock,
         controlLoaderMock,
         widgetServicesFactoryMock
      );
      widgetLoader.registerWidgetAdapters( { mock: widgetAdapterModuleMock } );
   } );

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   describe( 'asked to load a widget', () => {

      let templateHtml;

      beforeEach( done => {
         widgetLoader.load( widgetConfiguration )
            .then( adapterRef => adapterRef.templatePromise )
            .then( html => { templateHtml = html; } )
            .then( done, done.fail );
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'creates the services for the widget', () => {
         expect( widgetServicesFactoryMock ).toHaveBeenCalledWith(
            widgetDescriptor, widgetConfiguration, { myFeature: { myProp: 'x' } }, {}, {}
         );
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'will pass the required dependencies', () => {
         expect( widgetAdapterModuleMock.create ).toHaveBeenCalled();

         expect( widgetAdapterEnvironment.anchorElement ).toBeDefined();
         expect( widgetAdapterEnvironment.anchorElement.nodeName.toLowerCase() ).toEqual( 'div' );
         expect( widgetAdapterEnvironment.services ).toBe( widgetServicesMock.services );
         expect( widgetAdapterEnvironment.widgetName ).toEqual( widgetDescriptor.name );
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'asks the control loader to load the widget\'s controls', () => {
         expect( controlLoaderMock.load.calls.count() ).toEqual( 2 );
         expect( controlLoaderMock.load.calls.argsFor( 0 )[ 0 ] ).toEqual( '/some/control' );
         expect( controlLoaderMock.load.calls.argsFor( 1 )[ 0 ] ).toEqual( 'new-control' );
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'loads the widget HTML template', () => {
         expect( templateHtml ).toEqual( widgetData.htmlTemplate );
      } );

   } );

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   describe( 'asked to load a widget and to make its services available', () => {

      let whenServicesAvailable;

      beforeEach( done => {
         whenServicesAvailable = jasmine.createSpy( 'whenServicesAvailable' );
         widgetLoader.load( widgetConfiguration, { whenServicesAvailable } )
            .then( done, done.fail );
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'invokes the given callback with services provided by the adapter', () => {
         expect( whenServicesAvailable ).toHaveBeenCalledWith( { mockServiceName: 'mock service' } );
      } );

   } );

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   describe( 'asked to load a widget with alternative style and template sources', () => {

      let templateHtml;

      beforeEach( done => {
         const descriptor = deepClone( widgetData.descriptor );
         descriptor.name = 'alternative-widget';
         descriptor.styleSource = 'scss/alt.less';
         descriptor.templateSource = 'needs-preprocessing.html';

         artifactProviderMock.forWidget.mock( descriptor.name, {
            descriptor,
            module: {},
            assets: {
               [ MOCK_THEME ]: {
                  'needs-preprocessing.html': { content: '<h1>I was compiled or something</h1>' },
                  'scss/alt.less': { url: 'path/to/compiled-less.css' }
               }
            }
         } );

         widgetConfiguration.widget = descriptor.name;
         widgetLoader.load( widgetConfiguration )
            .then( adapterRef => adapterRef.templatePromise )
            .then( html => { templateHtml = html; } )
            .then( done, done.fail );
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'loads the alterative stylesheet', () => {
         expect( templateHtml ).toEqual( '<h1>I was compiled or something</h1>' );
      } );

   } );


} );
