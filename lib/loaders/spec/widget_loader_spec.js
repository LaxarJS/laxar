/**
 * Copyright 2016 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
import { create as createWidgetLoader } from '../widget_loader';
import { create as createThemeManager } from '../../runtime/theme_manager';
import * as paths from '../paths';
import * as log from '../../logging/log';
import * as adapters from '../../widget_adapters/adapters';
import { create as createFrpMock } from '../../testing/file_resource_provider_mock';
import { create as createEventBusMock } from '../../testing/event_bus_mock';
import widgetData from './data/widget_data';

///////////////////////////////////////////////////////////////////////////////////////////////////////////

describe( 'An initialized widgetLoader', () => {

   let widgetSpecification_;
   let widgetConfiguration_;

   beforeEach( () => {
      paths.WIDGETS = 'the_widgets';
      widgetSpecification_ = widgetData.specification;
      widgetConfiguration_ = widgetData.configuration;
   } );

   let fileResourceProviderMock_;
   let eventBusMock_;
   let cssLoader_;
   let widgetLoader_;

   let widgetAdapterModuleMock_;

   // arguments that the widget loader passes to the widget adapter are saved here for inspection
   let widgetAdapterEnvironment_;

   beforeEach( () => {

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
         'the_widgets/test/test_widget/widget.json': widgetSpecification_,
         'the_widgets/test/test_widget/default.theme/test_widget.html': widgetData.htmlTemplate,
         'the_widgets/test/test_widget/default.theme/css/test_widget.css': 1,
         '/some/control/default.theme/css/control.css': 1,
         '/some/new-control/default.theme/css/my-new-ctrl.css': 1,
         [ normalizedRequireUrl( 'amd-referenced-widget/widget.json' ) ]: widgetData.amdWidgetSpecification
      };

      const controlsServiceMock_ = createControlsServiceMock( mockControls );
      fileResourceProviderMock_ = createFrpMock( fileResources );
      const themeManager_ = createThemeManager( fileResourceProviderMock_, 'default' );
      cssLoader_ = { load: jasmine.createSpy( 'load' ) };
      eventBusMock_ = createEventBusMock();

      widgetAdapterModuleMock_ = {
         create: jasmine.createSpy( 'adapterModule.create' ).and.callFake(
            function( environment ) {
               widgetAdapterEnvironment_ = environment;
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
      adapters.addAdapters( [ widgetAdapterModuleMock_ ] );

      widgetLoader_ = createWidgetLoader(
         fileResourceProviderMock_,
         eventBusMock_,
         controlsServiceMock_,
         cssLoader_,
         themeManager_
      );
   } );

   ////////////////////////////////////////////////////////////////////////////////////////////////////////

   describe( 'when creating a widget adapter', () => {

      let templateHtml_;

      beforeEach( done => {
         widgetLoader_.load( widgetConfiguration_ )
            .then( adapterRef => adapterRef.templatePromise )
            .then( html => templateHtml_ = html )
            .then( done );
      } );

      /////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'will pass the required dependencies', () => {
         expect( widgetAdapterModuleMock_.create ).toHaveBeenCalled();

         expect( widgetAdapterEnvironment_.anchorElement ).toBeDefined();
         expect( widgetAdapterEnvironment_.anchorElement.nodeName.toLowerCase() ).toEqual( 'div' );
         expect( widgetAdapterEnvironment_.context ).toBeDefined();
         expect( widgetAdapterEnvironment_.context.eventBus ).toBeDefined();
         expect( widgetAdapterEnvironment_.context.features ).toBeDefined();
         expect( widgetAdapterEnvironment_.context.id ).toBeDefined();
         expect( widgetAdapterEnvironment_.context.widget ).toBeDefined();
         expect( widgetAdapterEnvironment_.context.widget.area ).toBeDefined();
         expect( widgetAdapterEnvironment_.context.widget.id ).toBeDefined();
         expect( widgetAdapterEnvironment_.context.widget.path ).toBeDefined();
         expect( widgetAdapterEnvironment_.specification.name ).toEqual( widgetSpecification_.name );
      } );

      /////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'will pass features after applying the schema (for defaults)', () => {
         expect( widgetAdapterEnvironment_.context.features ).toEqual( { myFeature: { myProp: 'x' } } );
      } );

      /////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'will pass an id generator to the adapter instance', () => {
         const idGenerator = widgetAdapterEnvironment_.context.id;
         expect( idGenerator ).toBeDefined();
         expect( idGenerator ).toEqual( jasmine.any( Function ) );

         expect( idGenerator( 'myLocalId' ) ).toEqual( 'ax-myTestWidget-myLocalId' );
         expect( idGenerator( 5 ) ).toEqual( 'ax-myTestWidget-5' );
      } );

      /////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'correctly resolves the CSS assets for widgets', () => {
         expect( cssLoader_.load ).toHaveBeenCalledWith(
            'the_widgets/test/test_widget/default.theme/css/test_widget.css'
         );
      } );

      /////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'correctly resolves the CSS assets for old-style controls', () => {
         expect( cssLoader_.load ).toHaveBeenCalledWith(
            '/some/control/default.theme/css/control.css'
         );
      } );

      /////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'correctly resolves the CSS assets for new-style controls', () => {
         expect( cssLoader_.load ).toHaveBeenCalledWith(
            '/some/new-control/default.theme/css/my-new-ctrl.css'
         );
      } );

      /////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'loads the widget HTML template', () => {
         expect( templateHtml_ ).toEqual( widgetData.htmlTemplate );
      } );

   } );

   ////////////////////////////////////////////////////////////////////////////////////////////////////////

   describe( 'when creating an event bus for a widget controller', () => {

      let adapterRef_;
      let widgetEventBus;

      beforeEach( done => {
         widgetLoader_.load( widgetConfiguration_ )
            .then( adapterRef => adapterRef_ = adapterRef )
            .then( () => widgetEventBus = widgetAdapterEnvironment_.context.eventBus )
            .then( done );
      } );

      /////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'will pass a widget event bus to the widget instance', () => {
         const handler = () => {};
         widgetEventBus.subscribe( 'event', handler );
         expect( eventBusMock_.subscribe )
            .toHaveBeenCalledWith( 'event', handler, { subscriber: 'widget.TestWidget#myTestWidget' } );
      } );

      /////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'where subscribe gets the widget as subscriber', () => {
         const handler = () => {};
         widgetEventBus.subscribe( 'event', handler );
         expect( eventBusMock_.subscribe )
            .toHaveBeenCalledWith( 'event', handler, { subscriber: 'widget.TestWidget#myTestWidget' } );
      } );

      /////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'where publish gets the widget as sender', () => {
         widgetEventBus.publish( 'event' );
         expect( eventBusMock_.publish )
            .toHaveBeenCalledWith( 'event', undefined, { sender: 'widget.TestWidget#myTestWidget' } );
      } );

      /////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'where additional properties on publish are merged with the sender', () => {
         widgetEventBus.publish( 'event', { item: 'value' } );
         expect( eventBusMock_.publish )
            .toHaveBeenCalledWith( 'event', { item: 'value' }, { sender: 'widget.TestWidget#myTestWidget' } );
      } );

      /////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'where options on publish are passed on to the event bus', () => {
         widgetEventBus.publish( 'event', {}, { deliverToSender: false } );
         expect( eventBusMock_.publish )
            .toHaveBeenCalledWith( 'event', {}, {
               sender: 'widget.TestWidget#myTestWidget',
               deliverToSender: false
            } );
      } );

      /////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'where publishAndGatherReplies gets the widget as sender', () => {
         widgetEventBus.publishAndGatherReplies( 'fakeRequest' );
         expect( eventBusMock_.publishAndGatherReplies )
            .toHaveBeenCalledWith( 'fakeRequest', undefined, { sender: 'widget.TestWidget#myTestWidget' } );
      } );

      /////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'where options on publishAndGatherReplies are passed on to the event bus', () => {
         widgetEventBus.publishAndGatherReplies( 'fakeRequest', {}, { deliverToSender: false } );
         expect( eventBusMock_.publishAndGatherReplies )
            .toHaveBeenCalledWith( 'fakeRequest', {}, {
               sender: 'widget.TestWidget#myTestWidget',
               deliverToSender: false
            } );
      } );

      /////////////////////////////////////////////////////////////////////////////////////////////////////

      describe( 'and destroying the adapter again', () => {

         beforeEach( () => {
            spyOn( widgetEventBus, 'release' );
            adapterRef_.destroy();
         } );

         //////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'releases event bus subscriptions', () => {
            expect( widgetEventBus.release ).toHaveBeenCalled();
         } );

      } );

      /////////////////////////////////////////////////////////////////////////////////////////////////////

      describe( 'when a didUpdate event with data attribute is published', () => {

         beforeEach( () => {
            spyOn( log, 'develop' );
            widgetEventBus.publish( 'didUpdate.someResource', {
               resource: 'someResource',
               data: {
                  some: 'thing'
               }
            } );
         } );

      } );

   } );

   ////////////////////////////////////////////////////////////////////////////////////////////////////////

   describe( 'when loading a widget referenced as amd module', () => {

      let adapterRef_;
      let htmlUrl;
      let cssUrl;

      beforeEach( done => {
         htmlUrl = normalizedRequireUrl( 'amd-referenced-widget/default.theme/amd-referenced-widget.html' );
         cssUrl = normalizedRequireUrl( 'amd-referenced-widget/default.theme/css/amd-referenced-widget.css' );

         widgetConfiguration_.widget = 'amd:amd-referenced-widget';
         widgetLoader_.load( widgetData.amdWidgetConfiguration )
            .then( adapterRef => adapterRef_ = adapterRef )
            .then( done );
      } );

      /////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'successfully loads the according adapter', () => {
         expect( adapterRef_.id ).toEqual( 'myAmdWidget' );
         expect( adapterRef_.adapter ).toBeDefined();
      } );

      /////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'searches template and stylesheet at the correct locations', () => {
         const [ htmlRequestUrl] = fileResourceProviderMock_.isAvailable.calls.argsFor( 0 );
         const [ cssRequestUrl ] = fileResourceProviderMock_.isAvailable.calls.argsFor( 1 );

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
                  // TODO NEEDS FIX A: amd references should already be resolved by the grunt task
                  path: System.normalizeSync( controlRef ),
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
      // TODO NEEDS FIX A: amd references should already be resolved by the grunt task
      return System.normalizeSync( reference ).replace( /\.js$/, '' );
      // return normalize( require.toUrl( reference ) );
   }

} );
