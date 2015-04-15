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
         assetResolver: assetResolver_,
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
         release: jasmine.createSpy( 'widgetServices.release' ),
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
         testWidgetModule_ = {
            name: 'widgets.test.test_widget',
            injections: [ 'axContext', 'axEventBus', 'axFeatures', 'axId', 'axWidget', 'axTemplate' ],
            create: jasmine.createSpy( 'create' ).andReturn( controller_ )
         };
         plainAdapterModule.bootstrap( [ testWidgetModule_ ] );

         adapter_ = plainAdapterModule.create( environment_ );

         controller_ = {
            renderTo: jasmine.createSpy( 'renderTo' )
         };
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      describe( 'asked to instantiate a widget controller', function() {

         beforeEach( function() {
            adapter_.createController();
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'instantiates the widget controller with the requested injections', function() {
            expect( testWidgetModule_.create ).toHaveBeenCalledWith(
               environment_.context,
               environment_.context.eventBus,
               widgetFeatures_,
               environment_.context.id,
               {
                  area: widgetConfiguration_.area,
                  id: widgetConfiguration_.id,
                  path: widgetConfiguration_.widget
               },
               { load: jasmine.any( Function ) }
            );
         } );

      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      describe( 'asked to prepare its DOM representation', function() {

         var resolveSpy = jasmine.createSpy( 'resolveSpy' );
         var rejectSpy = jasmine.createSpy( 'rejectSpy' );
         var promise_;

         beforeEach( function() {
            adapter_.createController();
            promise_ = adapter_.domPrepare().then( resolveSpy, rejectSpy );
            jasmine.Clock.tick( 0 );
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'asks the asset resolver to resolve all relevant assets', function() {
            expect( assetResolver_.resolve ).toHaveBeenCalled();
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'correctly resolves the CSS assets', function() {
            expect( promise_ ).toBeDefined();
            expect( assetResolver_.loadCss ).toHaveBeenCalledWith( defaultCssAssetPath_ );

            expect( rejectSpy ).not.toHaveBeenCalled();
            expect( resolveSpy ).toHaveBeenCalled();
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'does not link its anchor dom node', function() {
            expect( anchor_.innerHTML ).toEqual( '' );
         } );

      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      describe( 'asked to attach its DOM representation', function() {

         var mockAreaNode_;

         beforeEach( function() {
            mockAreaNode_= document.createElement( 'DIV' );
            adapter_.createController();
            adapter_.domPrepare().then( function() {
               adapter_.domAttachTo( mockAreaNode_ );
            } );
            jasmine.Clock.tick( 0 );
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'attaches its representation to the given widget area', function() {
            expect( mockAreaNode_.children.length ).toBe( 1 );
            expect( mockAreaNode_.children[ 0 ] ).toBe( anchor_ );
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

            //////////////////////////////////////////////////////////////////////////////////////////////////

            it( 'retains its widget services', function() {
               expect( environment_.release ).not.toHaveBeenCalled();
            } );

         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         describe( 'and then to destroy itself', function() {

            beforeEach( function() {
               adapter_.destroy();
            } );

            //////////////////////////////////////////////////////////////////////////////////////////////////

            it( 'releases its widget services', function() {
               expect( environment_.release ).toHaveBeenCalled();
            } );

         } );

      } );

   } );

} );
