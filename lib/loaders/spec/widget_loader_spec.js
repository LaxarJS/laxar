/**
 * Copyright 2016 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
import { create as createWidgetLoader } from '../widget_loader';
import { create as createThemeManager } from '../../runtime/theme_manager';
import { create as createFrpMock } from '../../testing/file_resource_provider_mock';
import { create as createEventBusMock } from '../../testing/event_bus_mock';
import { createCollectors as createCollectorsMock } from '../../testing/tooling_mock';
import widgetData from './data/widget_data';

///////////////////////////////////////////////////////////////////////////////////////////////////////////

describe( 'An initialized widgetLoader', () => {

   let widgetSpecification;
   let widgetConfiguration;

   beforeEach( () => {
      widgetSpecification = widgetData.specification;
      widgetConfiguration = widgetData.configuration;
   } );

   let fileResourceProviderMock;
   let eventBusMock;
   let cssLoader;
   let widgetLoader;
   let pagesCollectorMock;

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
               _compatibility0x: true,
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
      eventBusMock = createEventBusMock();
      pagesCollectorMock = createCollectorsMock().pages;

      widgetAdapterModuleMock = {
         create: jasmine.createSpy( 'adapterModule.create' ).and.callFake(
            function( environment ) {
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

      widgetLoader = createWidgetLoader(
         log,
         fileResourceProviderMock,
         eventBusMock,
         controlsServiceMock,
         cssLoader,
         themeManager,
         'includes/themes',
         'the_widgets',
         pagesCollectorMock
      );
      widgetLoader.registerWidgetAdapters( [ widgetAdapterModuleMock ] );
   } );

   ////////////////////////////////////////////////////////////////////////////////////////////////////////

   describe( 'when creating a widget adapter', () => {

      let templateHtml;

      beforeEach( done => {
         widgetLoader.load( widgetConfiguration )
            .then( adapterRef => adapterRef.templatePromise )
            .then( html => { templateHtml = html; } )
            .then( done );
      } );

      /////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'will pass the required dependencies', () => {
         expect( widgetAdapterModuleMock.create ).toHaveBeenCalled();

         expect( widgetAdapterEnvironment.anchorElement ).toBeDefined();
         expect( widgetAdapterEnvironment.anchorElement.nodeName.toLowerCase() ).toEqual( 'div' );
         expect( widgetAdapterEnvironment.context ).toBeDefined();
         expect( widgetAdapterEnvironment.context.eventBus ).toBeDefined();
         expect( widgetAdapterEnvironment.context.features ).toBeDefined();
         expect( widgetAdapterEnvironment.context.id ).toBeDefined();
         expect( widgetAdapterEnvironment.context.widget ).toBeDefined();
         expect( widgetAdapterEnvironment.context.widget.area ).toBeDefined();
         expect( widgetAdapterEnvironment.context.widget.id ).toBeDefined();
         expect( widgetAdapterEnvironment.context.widget.path ).toBeDefined();
         expect( widgetAdapterEnvironment.specification.name ).toEqual( widgetSpecification.name );
      } );

      /////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'will pass features after applying the schema (for defaults)', () => {
         expect( widgetAdapterEnvironment.context.features ).toEqual( { myFeature: { myProp: 'x' } } );
      } );

      /////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'will pass an id generator to the adapter instance', () => {
         const idGenerator = widgetAdapterEnvironment.context.id;
         expect( idGenerator ).toBeDefined();
         expect( idGenerator ).toEqual( jasmine.any( Function ) );

         expect( idGenerator( 'myLocalId' ) ).toEqual( 'ax-myTestWidget-myLocalId' );
         expect( idGenerator( 5 ) ).toEqual( 'ax-myTestWidget-5' );
      } );

      /////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'correctly resolves the CSS assets for widgets', () => {
         expect( cssLoader.load ).toHaveBeenCalledWith(
            'the_widgets/test/test_widget/default.theme/css/test_widget.css'
         );
      } );

      /////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'correctly resolves the CSS assets for old-style controls', () => {
         expect( cssLoader.load ).toHaveBeenCalledWith(
            '/some/control/default.theme/css/control.css'
         );
      } );

      /////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'correctly resolves the CSS assets for new-style controls', () => {
         expect( cssLoader.load ).toHaveBeenCalledWith(
            '/some/new-control/default.theme/css/my-new-ctrl.css'
         );
      } );

      /////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'loads the widget HTML template', () => {
         expect( templateHtml ).toEqual( widgetData.htmlTemplate );
      } );

   } );

   ////////////////////////////////////////////////////////////////////////////////////////////////////////

   describe( 'when creating an event bus for a widget controller', () => {

      let adapterRef;
      let widgetEventBus;

      beforeEach( done => {
         widgetLoader.load( widgetConfiguration )
            .then( ref => {
               adapterRef = ref;
               widgetEventBus = widgetAdapterEnvironment.context.eventBus;
            } )
            .then( done );
      } );

      /////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'will pass a widget event bus to the widget instance', () => {
         const handler = () => {};
         widgetEventBus.subscribe( 'event', handler );
         expect( eventBusMock.subscribe )
            .toHaveBeenCalledWith( 'event', handler, { subscriber: 'widget.TestWidget#myTestWidget' } );
      } );

      /////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'where subscribe gets the widget as subscriber', () => {
         const handler = () => {};
         widgetEventBus.subscribe( 'event', handler );
         expect( eventBusMock.subscribe )
            .toHaveBeenCalledWith( 'event', handler, { subscriber: 'widget.TestWidget#myTestWidget' } );
      } );

      /////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'where publish gets the widget as sender', () => {
         widgetEventBus.publish( 'event' );
         expect( eventBusMock.publish )
            .toHaveBeenCalledWith( 'event', undefined, { sender: 'widget.TestWidget#myTestWidget' } );
      } );

      /////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'where additional properties on publish are merged with the sender', () => {
         widgetEventBus.publish( 'event', { item: 'value' } );
         expect( eventBusMock.publish )
            .toHaveBeenCalledWith( 'event', { item: 'value' }, { sender: 'widget.TestWidget#myTestWidget' } );
      } );

      /////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'where options on publish are passed on to the event bus', () => {
         widgetEventBus.publish( 'event', {}, { deliverToSender: false } );
         expect( eventBusMock.publish )
            .toHaveBeenCalledWith( 'event', {}, {
               sender: 'widget.TestWidget#myTestWidget',
               deliverToSender: false
            } );
      } );

      /////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'where publishAndGatherReplies gets the widget as sender', () => {
         widgetEventBus.publishAndGatherReplies( 'fakeRequest' );
         expect( eventBusMock.publishAndGatherReplies )
            .toHaveBeenCalledWith( 'fakeRequest', undefined, { sender: 'widget.TestWidget#myTestWidget' } );
      } );

      /////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'where options on publishAndGatherReplies are passed on to the event bus', () => {
         widgetEventBus.publishAndGatherReplies( 'fakeRequest', {}, { deliverToSender: false } );
         expect( eventBusMock.publishAndGatherReplies )
            .toHaveBeenCalledWith( 'fakeRequest', {}, {
               sender: 'widget.TestWidget#myTestWidget',
               deliverToSender: false
            } );
      } );

      /////////////////////////////////////////////////////////////////////////////////////////////////////

      describe( 'and destroying the adapter again', () => {

         beforeEach( () => {
            spyOn( widgetEventBus, 'release' );
            adapterRef.destroy();
         } );

         //////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'releases event bus subscriptions', () => {
            expect( widgetEventBus.release ).toHaveBeenCalled();
         } );

      } );

   } );

   ////////////////////////////////////////////////////////////////////////////////////////////////////////

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

      /////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'successfully loads the according adapter', () => {
         expect( adapterRef.id ).toEqual( 'myAmdWidget' );
         expect( adapterRef.adapter ).toBeDefined();
      } );

      /////////////////////////////////////////////////////////////////////////////////////////////////////

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
