/**
 * Copyright 2016 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
import { create as createWidgetLoader } from '../widget_loader';
import { create as createLogMock } from '../../testing/log_mock';
import { create as createCssLoaderMock } from '../../testing/css_loader_mock';
import { create as createControlLoaderMock } from '../../testing/control_loader_mock';
import { create as createArtifactProviderMock, MOCK_THEME } from '../../testing/artifact_provider_mock';
import { createCollectors as createCollectorsMock } from '../../testing/tooling_mock';
import widgetData from './data/widget_data';

//////////////////////////////////////////////////////////////////////////////////////////////////////////////

describe( 'An initialized widgetLoader', () => {

   let widgetDescriptor;
   let widgetConfiguration;

   beforeEach( () => {
      widgetDescriptor = widgetData.descriptor;
      widgetConfiguration = widgetData.configuration;
   } );

   let artifactProviderMock;
   let controlLoaderMock;
   let cssLoaderMock;
   let widgetLoader;
   let pagesCollectorMock;
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
      cssLoaderMock = createCssLoaderMock();
      pagesCollectorMock = createCollectorsMock().pages;

      widgetAdapterModuleMock = {
         create: jasmine.createSpy( 'adapterModule.create' ).and.callFake(
            environment => {
               widgetAdapterEnvironment = environment;
               return {
                  createController: jasmine.createSpy( 'adapter.createController' ),
                  domAttachTo: jasmine.createSpy( 'adapter.domAttachTo' ),
                  domDetach: jasmine.createSpy( 'adapter.domDetach' ),
                  destroy: jasmine.createSpy( 'adapter.destroy' )
               };
            }
         ),
         technology: 'angular'
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
         controlLoaderMock,
         cssLoaderMock,
         pagesCollectorMock,
         widgetServicesFactoryMock
      );
      widgetLoader.registerWidgetAdapters( [ widgetAdapterModuleMock ] );
   } );

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   describe( 'when creating a widget adapter', () => {

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
            widgetDescriptor, widgetConfiguration, { myFeature: { myProp: 'x' } }, {}
         );
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'will pass the required dependencies', () => {
         expect( widgetAdapterModuleMock.create ).toHaveBeenCalled();

         expect( widgetAdapterEnvironment.anchorElement ).toBeDefined();
         expect( widgetAdapterEnvironment.anchorElement.nodeName.toLowerCase() ).toEqual( 'div' );
         expect( widgetAdapterEnvironment.services ).toBe( widgetServicesMock.services );
         expect( widgetAdapterEnvironment.specification.name ).toEqual( widgetDescriptor.name );
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'correctly resolves CSS assets for widgets', () => {
         expect( cssLoaderMock.load ).toHaveBeenCalledWith(
            'path/to/css/test-widget.css'
         );
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

} );
