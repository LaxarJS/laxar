/**
 * Copyright 2014 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
define( [
   '../widget_loader',
   '../../../testing/portal_mocks',
   '../../../logging/log',
   '../../paths',
   '../../modules/theme_manager',
   './data/widget_data'
], function( widgetLoaderModule, portalMocks, log, paths, themeManager, widgetData ) {
   'use strict';

   describe( 'A widgetLoader', function() {

      it( 'throws if create is missing some required argument', function() {
         expect( function() { widgetLoaderModule.create(); } ).toThrow();
         expect( function() { widgetLoaderModule.create( {} ); } ).toThrow();
         expect( function() { widgetLoaderModule.create( {}, {} ); } ).toThrow();
         expect( function() { widgetLoaderModule.create( {}, {}, {} ); } ).toThrow();
         expect( function() { widgetLoaderModule.create( {}, {}, {}, {} ); } ).toThrow();

         expect( function() { widgetLoaderModule.create( {}, {}, {}, { theme: 'default' } ); } ).not.toThrow();
      } );

   } );

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   describe( 'An initialized widgetLoader', function() {

      var widgetSpecification_;
      var widgetConfiguration_;
      var widgetLoaderConfiguration_;
      beforeEach( function() {
         paths.WIDGETS = 'the_widgets';
         widgetSpecification_ = widgetData.specification;
         widgetConfiguration_ = widgetData.configuration;
      } );

      var q_;
      var fileResourceProviderMock_;
      var eventBusMock_;
      var themeManager_;
      var http_;
      var widgetLoader_;

      var widgetAdapterModuleMock_;
      var widgetAdapterMock_;

      // arguments that the widget loader passes to the widget adapter are saved here for inspection
      var widgetAdapterModuleInput_;
      var widgetAdapterCreateControllerInput_;

      beforeEach( function() {

         jasmine.Clock.useMock();
         q_ = portalMocks.mockQ();
         http_ = portalMocks.mockHttp( q_ );

         fileResourceProviderMock_ = portalMocks.mockFileResourceProvider( {
            'the_widgets/test/test_widget/widget.json': widgetSpecification_
         } );

         themeManager_ = themeManager.create( fileResourceProviderMock_, q_ );
         themeManager_.setTheme( 'default' );

         eventBusMock_ = portalMocks.mockEventBus();

         widgetAdapterModuleMock_ = {
            create: jasmine.createSpy( 'adapterModule.create' ).andCallFake(
               function( q, fileResourceProvider, specification, features, widgetConfiguration, anchorElement ) {
                  widgetAdapterModuleInput_ = {
                     q: q,
                     fileResourceProvider: fileResourceProvider,
                     specification: specification,
                     features: features,
                     widgetConfiguration: widgetConfiguration,
                     anchorElement: anchorElement
                  };
                  widgetAdapterMock_ = {
                     createController: jasmine.createSpy( 'adapter.createController' ).andCallFake(
                        function( widgetServices, configuration ) {
                           widgetAdapterCreateControllerInput_ = {
                              widgetServices: widgetServices,
                              configuration: configuration
                           };
                        }
                     ),
                     domPrepare: jasmine.createSpy( 'adapter.domPrepare' ),
                     domAttachTo: jasmine.createSpy( 'adapter.domAttachTo' ),
                     domDetach: jasmine.createSpy( 'adapter.domDetach' ),
                     widgetId: jasmine.createSpy( 'adapter.widgetId' ),
                     destroy: jasmine.createSpy( 'adapter.destroy' )
                  };
                  return widgetAdapterMock_;
               }
            )
         };

         widgetLoaderConfiguration_ = {
            theme: 'default',
            stuffToPassThrough: 'xyz',
            adapters: {
               angular: widgetAdapterModuleMock_
            }
         };

         widgetLoader_ = widgetLoaderModule.create(
            q_, fileResourceProviderMock_, eventBusMock_, widgetLoaderConfiguration_
         );
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      describe( 'when creating a widget adapter', function() {

         beforeEach( function() {
            widgetLoader_.load( widgetConfiguration_ );
            jasmine.Clock.tick( 0 );
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'will pass the required dependencies', function() {
            expect( widgetAdapterModuleMock_.create ).toHaveBeenCalled();

            expect( widgetAdapterModuleInput_.q ).toBeDefined();
            expect( widgetAdapterModuleInput_.q.when ).toBeDefined();
            expect( widgetAdapterModuleInput_.fileResourceProvider ).toBeDefined();
            expect( widgetAdapterModuleInput_.fileResourceProvider.provide ).toBeDefined();
            expect( widgetAdapterModuleInput_.specification.name ).toEqual( widgetSpecification_.name );
            expect( widgetAdapterModuleInput_.features ).toBeDefined();
            expect( widgetAdapterModuleInput_.widgetConfiguration ).toEqual( widgetConfiguration_ );
            expect( widgetAdapterModuleInput_.anchorElement ).toBeDefined();
            expect( widgetAdapterModuleInput_.anchorElement.nodeName.toLowerCase() ).toEqual( 'div' );
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'will pass features after applying the schema (for defaults)', function() {
            expect( widgetAdapterModuleInput_.features ).toEqual( { myFeature: { myProp: 'x' } } );
         } );

      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      describe( 'when asking a widget adapter to create its controller', function() {

         beforeEach( function() {
            widgetLoader_.load( widgetConfiguration_ );
            jasmine.Clock.tick( 0 );
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'will pass a widget event bus to the widget instance', function() {
            expect( widgetAdapterMock_.createController ).toHaveBeenCalled();
            expect( widgetAdapterCreateControllerInput_.widgetServices ).toBeDefined();
            expect( widgetAdapterCreateControllerInput_.widgetServices.eventBus ).toBeDefined();
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'will pass an id generator to the widget instance', function() {
            expect( widgetAdapterMock_.createController ).toHaveBeenCalled();
            expect( widgetAdapterCreateControllerInput_.widgetServices ).toBeDefined();
            var idGenerator = widgetAdapterCreateControllerInput_.widgetServices.idGenerator;
            expect( idGenerator ).toBeDefined();
            expect( idGenerator ).toEqual( jasmine.any( Function ) );

            expect( idGenerator( 'myLocalId' ) ).toEqual( 'widget__myTestWidget_myLocalId' );
            expect( idGenerator( 5 ) ).toEqual( 'widget__myTestWidget_5' );
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'will pass through widget controller configuration', function() {
            expect( widgetAdapterMock_.createController ).toHaveBeenCalled();
            expect( widgetAdapterCreateControllerInput_.configuration ).toEqual( widgetLoaderConfiguration_ );
            expect( widgetAdapterCreateControllerInput_.configuration.stuffToPassThrough ).toEqual( 'xyz' );
         } );

      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      describe( 'when creating an event bus for a widget controller', function() {

         var widgetEventBus;
         var releaseServices;

         beforeEach( function() {
            widgetLoader_.load( widgetConfiguration_ );
            jasmine.Clock.tick( 0 );
            widgetEventBus = widgetAdapterCreateControllerInput_.widgetServices.eventBus;
            spyOn( widgetEventBus, 'release' ).andCallThrough();
            releaseServices = widgetAdapterCreateControllerInput_.widgetServices.release;
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'will pass a widget event bus to the widget instance', function() {
            var handler = function() {};
            widgetEventBus.subscribe( 'event', handler );
            expect( eventBusMock_.subscribe )
               .toHaveBeenCalledWith( 'event', handler, { subscriber: 'widget.TestWidget#myTestWidget' } );
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'where subscribe gets the widget as subscriber', function() {
            var handler = function() {};
            widgetEventBus.subscribe( 'event', handler );
            expect( eventBusMock_.subscribe )
               .toHaveBeenCalledWith( 'event', handler, { subscriber: 'widget.TestWidget#myTestWidget' } );
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'where publish gets the widget as sender', function() {
            widgetEventBus.publish( 'event' );
            expect( eventBusMock_.publish )
               .toHaveBeenCalledWith( 'event', undefined, { sender: 'widget.TestWidget#myTestWidget' } );
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'where additional properties on publish are merged with the sender', function() {
            widgetEventBus.publish( 'event', { item: 'value' } );
            expect( eventBusMock_.publish )
               .toHaveBeenCalledWith( 'event', { item: 'value' }, { sender: 'widget.TestWidget#myTestWidget' } );
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'where options on publish are passed on to the event bus', function() {
            widgetEventBus.publish( 'event', {}, { deliverToSender: false } );
            expect( eventBusMock_.publish )
               .toHaveBeenCalledWith( 'event', {}, {
                  sender: 'widget.TestWidget#myTestWidget',
                  deliverToSender: false
               } );
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'where publishAndGatherReplies gets the widget as sender', function() {
            widgetEventBus.publishAndGatherReplies( 'fakeRequest' );
            expect( eventBusMock_.publishAndGatherReplies )
               .toHaveBeenCalledWith( 'fakeRequest', undefined, { sender: 'widget.TestWidget#myTestWidget' } );
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'where options on publishAndGatherReplies are passed on to the event bus', function() {
            widgetEventBus.publishAndGatherReplies( 'fakeRequest', {}, { deliverToSender: false } );
            expect( eventBusMock_.publishAndGatherReplies )
               .toHaveBeenCalledWith( 'fakeRequest', {}, {
                  sender: 'widget.TestWidget#myTestWidget',
                  deliverToSender: false
               } );
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         describe( 'when a didUpdate event with data attribute is published', function() {

            beforeEach( function() {
               spyOn( log, 'develop' );
               widgetEventBus.publish( 'didUpdate.someResource', {
                  resource: 'someResource',
                  data: {
                     some: 'thing'
                  }
               } );
            } );

         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         describe( 'when widget-services are released', function() {

            beforeEach( function() {
               releaseServices();
            } );

            //////////////////////////////////////////////////////////////////////////////////////////////////

            it( 'will cancel all subscriptions', function() {
               expect( widgetEventBus.release ).toHaveBeenCalled();
            } );

         } );

      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      describe( 'for widgets that are marked as json patch compatible', function() {

         beforeEach( function() {
            spyOn( log, 'info' );
            widgetSpecification_.compatibility = [ 'json-patch' ];
            widgetLoader_.load( widgetConfiguration_ );
            jasmine.Clock.tick( 0 );
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'logs that this flag is obsolete now', function() {
            expect( log.info ).toHaveBeenCalledWith(
               'Found deprecated compatibility flag "json-patch" in specification of widget "[0]". ' +
               'As JSON-Patch compatibility is mandatory now, this flag should be removed.',
               'TestWidget'
            );
         } );

      } );

   } );

} );
