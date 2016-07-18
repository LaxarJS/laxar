/**
 * Copyright 2016 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
import { create as createWidgetLoader } from '../widget_loader';
import { create as createThemeManager } from '../../runtime/theme_manager';
import { create as createFrpMock } from '../../testing/file_resource_provider_mock';
import { createCollectors as createCollectorsMock } from '../../testing/tooling_mock';
import widgetData from './data/widget_data';

//////////////////////////////////////////////////////////////////////////////////////////////////////////////

describe( 'An initialized widgetLoader', () => {

   let widgetSpecification;
   let widgetConfiguration;

   beforeEach( () => {
      widgetSpecification = widgetData.specification;
      widgetConfiguration = widgetData.configuration;
   } );

   let fileResourceProviderMock;
   let cssLoader;
   let widgetLoader;
   let pagesCollectorMock;
   let widgetServicesMock;
   let widgetServicesFactoryMock;
   let widgetAdapterModuleMock;

   // arguments that the widget loader passes to the widget adapter are saved here for inspection
   let widgetAdapterEnvironment;

   beforeEach( () => {

      const log = {
         debug(){},
         info(){},
         warn(){},
         error(){}
      };

      const mockControls = {
         'new-control': {
            path: '/some/new-control',
            descriptor: {
               name: 'my-new-ctrl',
               integration: { technology: 'plain' }
            }
         },
         '/some/control': {
            path: '/some/control',
            descriptor: {
               _compatibility_0x: true,
               name: 'control',
               integration: { technology: 'angular' }
            }
         }
      };

      const fileResources = {
         'the_widgets/test/test_widget/widget.json': widgetSpecification,
         'the_widgets/test/test_widget/default.theme/test_widget.html': widgetData.htmlTemplate,
         'the_widgets/test/test_widget/default.theme/css/test_widget.css': 1,
         '/some/control/default.theme/css/control.css': 1,
         '/some/new-control/default.theme/css/my-new-ctrl.css': 1,
         [ normalizedRequireUrl( 'amd-referenced-widget/widget.json' ) ]: widgetData.amdWidgetSpecification
      };

      const controlsServiceMock = createControlsServiceMock( mockControls );
      fileResourceProviderMock = createFrpMock( fileResources );
      const themeManager = createThemeManager( fileResourceProviderMock, 'default' );
      cssLoader = { load: jasmine.createSpy( 'load' ) };
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
         log,
         fileResourceProviderMock,
         controlsServiceMock,
         cssLoader,
         themeManager,
         'includes/themes',
         'the_widgets',
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
            .then( done );
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'creates the services for the widget', () => {
         expect( widgetServicesFactoryMock )
            .toHaveBeenCalledWith( widgetSpecification, widgetConfiguration, { myFeature: { myProp: 'x' } } );
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'will pass the required dependencies', () => {
         expect( widgetAdapterModuleMock.create ).toHaveBeenCalled();

         expect( widgetAdapterEnvironment.anchorElement ).toBeDefined();
         expect( widgetAdapterEnvironment.anchorElement.nodeName.toLowerCase() ).toEqual( 'div' );
         expect( widgetAdapterEnvironment.context ).toBe( widgetServicesMock.services.axContext );
         expect( widgetAdapterEnvironment.services ).toBe( widgetServicesMock.services );
         expect( widgetAdapterEnvironment.specification.name ).toEqual( widgetSpecification.name );
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'correctly resolves the CSS assets for widgets', () => {
         expect( cssLoader.load ).toHaveBeenCalledWith(
            'the_widgets/test/test_widget/default.theme/css/test_widget.css'
         );
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'correctly resolves the CSS assets for old-style controls', () => {
         expect( cssLoader.load ).toHaveBeenCalledWith(
            '/some/control/default.theme/css/control.css'
         );
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'correctly resolves the CSS assets for new-style controls', () => {
         expect( cssLoader.load ).toHaveBeenCalledWith(
            '/some/new-control/default.theme/css/my-new-ctrl.css'
         );
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'loads the widget HTML template', () => {
         expect( templateHtml ).toEqual( widgetData.htmlTemplate );
      } );

   } );

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   // TODO (#304) fix or remove
   xdescribe( 'when loading a widget referenced as amd module', () => {

      let adapterRef;
      let htmlUrl;
      let cssUrl;

      beforeEach( done => {
         htmlUrl = normalizedRequireUrl( 'amd-referenced-widget/default.theme/amd-referenced-widget.html' );
         cssUrl = normalizedRequireUrl( 'amd-referenced-widget/default.theme/css/amd-referenced-widget.css' );

         widgetConfiguration.widget = 'amd:amd-referenced-widget';
         widgetLoader.load( widgetData.amdWidgetConfiguration )
            .then( ref => { adapterRef = ref; } )
            .then( done );
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'successfully loads the according adapter', () => {
         expect( adapterRef.id ).toEqual( 'myAmdWidget' );
         expect( adapterRef.adapter ).toBeDefined();
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'searches template and stylesheet at the correct locations', () => {
         const [ htmlRequestUrl ] = fileResourceProviderMock.isAvailable.calls.argsFor( 0 );
         const [ cssRequestUrl ] = fileResourceProviderMock.isAvailable.calls.argsFor( 1 );

         expect( htmlRequestUrl ).toEqual( htmlUrl );
         expect( cssRequestUrl ).toEqual( cssUrl );
      } );

   } );

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function createControlsServiceMock( initialData ) {
      const mockControls = initialData || {};
      return {
         load: jasmine.createSpy( 'axControls.load' ).and.callFake( controlRef => {
            if( !mockControls[ controlRef ] ) {
               mockControls[ controlRef ] = {
                  descriptor: {
                     name: controlRef.split( '/' ).pop(),
                     integration: { technology: 'plain' }
                  },
                  path: controlRef,
                  module: {}
               };
            }
            return Promise.resolve( mockControls[ controlRef ].descriptor );
         } ),
         descriptor: jasmine.createSpy( 'axControls.descriptor' )
            .and.callFake( controlRef => mockControls[ controlRef ].descriptor ),
         provide: jasmine.createSpy( 'axControls.provide' )
            .and.callFake( controlRef => mockControls[ controlRef ].module ),
         resolve: controlRef => mockControls[ controlRef ].path
      };
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function normalizedRequireUrl( reference ) {
      // require.toUrl returns non-normalized paths, while the widget loader requests normalized ones.
      // Hence we have to use urls for mocking in a normalized form.
      // TODO (#304): module references should already be resolved by the grunt task
      return reference.replace( /^amd:/, 'bower_components/' ).replace( /\.js$/, '' );
      // return normalize( require.toUrl( reference ) );
   }

} );
