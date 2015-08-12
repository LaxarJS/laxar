/**
 * Copyright 2014 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
define( [
   '../plain_adapter',
   'angular',
   'angular-mocks',
   '../../testing/portal_mocks',
   '../../loaders/features_provider',
   './widget_data'
], function( plainAdapterModule, ng, ngMocks, portalMocks, features, widgetData ) {
   'use strict';

   var defaultCssAssetPath_ = 'the_themes/default.theme/test/test_widget/css/test_widget.css';
   var themeCssAssetPath_ = 'the_themes/blue.theme/test/test_widget/css/test_widget.css';
   var htmlAssetPath_ = 'the_widgets/test/test_widget/default.theme/test_widget.html';
   var assets = {};
   assets[ themeCssAssetPath_ ] = 'h1 { color: blue }';
   assets[ defaultCssAssetPath_ ] = 'h1 { color: #ccc }';
   assets[ htmlAssetPath_ ] = '<h1>hello there <%=user%></h1>';

   var widgetSpec_;
   var widgetConfiguration_;
   var widgetFeatures_;
   var widgetLoaderConfiguration_;
   var anchor_;

   var q_;
   var fileResourceProvider_;
   var assetResolver_;
   var environment_;

   beforeEach( function() {

      widgetSpec_ = widgetData.specification;
      widgetConfiguration_ = widgetData.configuration;

      function throwError( msg ) { throw new Error( msg ); }
      widgetFeatures_ = features.featuresForWidget( widgetSpec_, widgetConfiguration_, throwError );

      widgetLoaderConfiguration_ = {};

      anchor_ = document.createElement( 'DIV' );

      q_ = portalMocks.mockQ();

      fileResourceProvider_ = portalMocks.mockFileResourceProvider( assets );
      assetResolver_ = {
         loadCss: jasmine.createSpy( 'loadCss' ),
         provide: jasmine.createSpy( 'provide' ).andCallFake( function( url ) {
            return fileResourceProvider_.provide( url );
         } ),
         resolve: jasmine.createSpy( 'resolve' ).andCallFake( function() {
            return q_.when( {
               templateUrl: htmlAssetPath_,
               cssFileUrls: [ defaultCssAssetPath_, themeCssAssetPath_ ]
            } );
         } )
      };

      environment_ = {
         anchorElement: anchor_,
         context: {
            eventBus: portalMocks.mockEventBus(),
            features: widgetFeatures_,
            id: function() { return 'fake-id'; },
            widget: {
               area: widgetConfiguration_.area,
               id: widgetConfiguration_.id,
               path: widgetConfiguration_.widget
            }
         },
         specification: widgetSpec_
      };
   } );

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   describe( 'A plain widget adapter module', function() {

      it( 'provides a custom module', function() {
         expect( plainAdapterModule.create ).toEqual( jasmine.any( Function ) );
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'allows to create an adapter from dependencies', function() {
         var adapter = null;
         expect( function() {
            adapter = plainAdapterModule.create( environment_ );
         } ).not.toThrow();
         expect( adapter ).not.toBe( null );
         expect( adapter.createController ).toBeDefined();
      } );

   } );

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   describe( 'A plain widget adapter', function() {

      var adapter_;
      var testWidgetModule_;
      var controller_;

      beforeEach( function() {
         controller_ = {
            renderTo: jasmine.createSpy( 'renderTo' )
         };

         testWidgetModule_ = {
            name: 'test-widget',
            injections: [ 'axContext', 'axEventBus', 'axFeatures' ],
            create: jasmine.createSpy( 'create' ).andReturn( controller_ )
         };

         plainAdapterModule.bootstrap( [ testWidgetModule_ ] );
         adapter_ = plainAdapterModule.create( environment_ );
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      describe( 'asked to instantiate a widget controller', function() {

         var onBeforeControllerCreationSpy;

         beforeEach( function() {
            onBeforeControllerCreationSpy = jasmine.createSpy( 'onBeforeControllerCreationSpy' );
            adapter_.createController( {
               onBeforeControllerCreation: onBeforeControllerCreationSpy
            } );
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'instantiates the widget controller with the requested injections', function() {
            expect( testWidgetModule_.create ).toHaveBeenCalledWith(
               environment_.context,
               environment_.context.eventBus,
               widgetFeatures_
            );
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'calls onBeforeControllerCreation with environment and injections', function() {
            expect( onBeforeControllerCreationSpy ).toHaveBeenCalled();

            var args = onBeforeControllerCreationSpy.calls[ 0 ].args;
            expect( args[ 0 ] ).toEqual( environment_ );
            expect( Object.keys( args[ 1 ] ) ).toContain( 'axContext' );
            expect( Object.keys( args[ 1 ] ) ).toContain( 'axEventBus' );
         } );

      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      describe( 'asked to attach its DOM representation', function() {

         var mockAreaNode_;

         beforeEach( function() {
            mockAreaNode_= document.createElement( 'DIV' );
            adapter_.createController( { onBeforeControllerCreation: function() {} } );
            adapter_.domAttachTo( mockAreaNode_, assets[ htmlAssetPath_ ] );
            jasmine.Clock.tick( 0 );
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'attaches its representation to the given widget area', function() {
            expect( mockAreaNode_.children.length ).toBe( 1 );
            expect( mockAreaNode_.children[ 0 ] ).toBe( anchor_ );
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'calls the renderTo-method of the widget controller ', function() {
            expect( controller_.renderTo ).toHaveBeenCalled();
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         describe( 'and then to detach it again', function() {

            beforeEach( function() {
               adapter_.domDetach();
            } );

            //////////////////////////////////////////////////////////////////////////////////////////////////

            it( 'detaches its dom node from the widget area', function() {
               expect( mockAreaNode_.children.length ).toBe( 0 );
            } );

         } );

      } );

   } );

} );
