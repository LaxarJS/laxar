/**
 * Copyright 2014 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
define( [
   '../widget_loader',
   '../../testing/portal_mocks',
   '../../logging/log',
   '../paths',
   '../../runtime/theme_manager',
   '../../widget_adapters/adapters',
   './data/widget_data'
], function( widgetLoaderModule, portalMocks, log, paths, themeManager, adapters, widgetData ) {
   'use strict';

   describe( 'A widgetLoader', function() {

      it( 'throws if create is missing some required argument', function() {
         expect( function() { widgetLoaderModule.create(); } ).toThrow();
         expect( function() { widgetLoaderModule.create( {} ); } ).toThrow();
         expect( function() { widgetLoaderModule.create( {}, {} ); } ).toThrow();
         expect( function() { widgetLoaderModule.create( {}, {}, {} ); } ).toThrow();
         expect( function() { widgetLoaderModule.create( {}, {}, {}, {} ); } ).toThrow();
      } );

   } );

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   describe( 'An initialized widgetLoader', function() {

      var widgetSpecification_;
      var widgetConfiguration_;

      beforeEach( function() {
         paths.WIDGETS = 'the_widgets';
         widgetSpecification_ = widgetData.specification;
         widgetConfiguration_ = widgetData.configuration;
      } );

      var q_;
      var fileResourceProviderMock_;
      var eventBusMock_;
      var themeManager_;
      var cssLoader_;
      var http_;
      var widgetLoader_;

      var widgetAdapterModuleMock_;
      var widgetAdapterMock_;

      // arguments that the widget loader passes to the widget adapter are saved here for inspection
      var widgetAdapterEnvironment_;

      beforeEach( function() {

         jasmine.Clock.useMock();
         q_ = portalMocks.mockQ();
         http_ = portalMocks.mockHttp( q_ );

         fileResourceProviderMock_ = portalMocks.mockFileResourceProvider( {
            'the_widgets/test/test_widget/widget.json': widgetSpecification_
         } );

         themeManager_ = themeManager.create( fileResourceProviderMock_, q_ );
         themeManager_.setTheme( 'default' );

         cssLoader_ = { load: jasmine.createSpy( 'load' ) };

         eventBusMock_ = portalMocks.mockEventBus();

         widgetAdapterModuleMock_ = {
            create: jasmine.createSpy( 'adapterModule.create' ).andCallFake(
               function( environment ) {
                  widgetAdapterEnvironment_ = environment;
                  widgetAdapterMock_ = {
                     createController: jasmine.createSpy( 'adapter.createController' ),
                     domPrepare: jasmine.createSpy( 'adapter.domPrepare' ),
                     domAttachTo: jasmine.createSpy( 'adapter.domAttachTo' ),
                     domDetach: jasmine.createSpy( 'adapter.domDetach' ),
                     widgetId: jasmine.createSpy( 'adapter.widgetId' ),
                     destroy: jasmine.createSpy( 'adapter.destroy' )
                  };
                  return widgetAdapterMock_;
               }
            ),
            technology: 'angular'
         };
         adapters.addAdapters( [ widgetAdapterModuleMock_ ] );

         widgetLoader_ = widgetLoaderModule.create(
            q_, fileResourceProviderMock_, themeManager_, cssLoader_, eventBusMock_
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

            expect( widgetAdapterEnvironment_.anchorElement ).toBeDefined();
            expect( widgetAdapterEnvironment_.anchorElement.nodeName.toLowerCase() ).toEqual( 'div' );
            expect( widgetAdapterEnvironment_.assetResolver ).toBeDefined();
            expect( widgetAdapterEnvironment_.assetResolver.loadCss ).toBeDefined();
            expect( widgetAdapterEnvironment_.context ).toBeDefined();
            expect( widgetAdapterEnvironment_.context.eventBus ).toBeDefined();
            expect( widgetAdapterEnvironment_.context.features ).toBeDefined();
            expect( widgetAdapterEnvironment_.context.id ).toBeDefined();
            expect( widgetAdapterEnvironment_.context.widget ).toBeDefined();
            expect( widgetAdapterEnvironment_.context.widget.area ).toBeDefined();
            expect( widgetAdapterEnvironment_.context.widget.id ).toBeDefined();
            expect( widgetAdapterEnvironment_.context.widget.path ).toBeDefined();
            expect( widgetAdapterEnvironment_.release ).toBeDefined();
            expect( widgetAdapterEnvironment_.specification.name ).toEqual( widgetSpecification_.name );
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'will pass features after applying the schema (for defaults)', function() {
            expect( widgetAdapterEnvironment_.context.features ).toEqual( { myFeature: { myProp: 'x' } } );
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'will pass an id generator to the adapter instance', function() {
            var idGenerator = widgetAdapterEnvironment_.context.id;
            expect( idGenerator ).toBeDefined();
            expect( idGenerator ).toEqual( jasmine.any( Function ) );

            expect( idGenerator( 'myLocalId' ) ).toEqual( 'widget__myTestWidget_myLocalId' );
            expect( idGenerator( 5 ) ).toEqual( 'widget__myTestWidget_5' );
         } );

      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      describe( 'when creating an event bus for a widget controller', function() {

         var widgetEventBus;
         var releaseServices;

         beforeEach( function() {
            widgetLoader_.load( widgetConfiguration_ );
            jasmine.Clock.tick( 0 );
            widgetEventBus = widgetAdapterEnvironment_.context.eventBus;
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

         it( 'adds a release method to release event bus subscriptions', function() {
            // fuzzy but sufficient test, that must be improved on major changes anyways
            expect( widgetEventBus.release ).toBe( widgetAdapterEnvironment_.release );
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

      } );

   } );

} );
