/**
 * Copyright 2014 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
define( [
   '../widget_adapters/plain_adapter',
   'angular',
   'angular-mocks',
   '../../../testing/portal_mocks',
   '../features_provider',
   '../../module_registry',
   './data/widget_data'
], function( plainAdapterModule, ng, ngMocks, portalMocks, features, moduleRegistry, widgetData ) {
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
   var widgetServices_;

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

      widgetServices_ = {
         idGenerator: function() { return 'fake-id'; },
         eventBus: portalMocks.mockEventBus(),
         release: jasmine.createSpy( 'widgetServices.release' )
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
            adapter = plainAdapterModule
               .create( assetResolver_, widgetSpec_, widgetFeatures_, widgetConfiguration_, anchor_ );
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
         adapter_ = plainAdapterModule
            .create( assetResolver_, widgetSpec_, widgetFeatures_, widgetConfiguration_, anchor_ );

         controller_ = {
            renderTo: jasmine.createSpy( 'renderTo' )
         };

         testWidgetModule_ = {
            name: 'MyTestWidget',
            injections: [ 'axEventBus', 'axFeatures', 'axId', 'axWidget', 'axTemplate' ],
            create: jasmine.createSpy( 'create' ).andReturn( controller_ )
         };

         spyOn( moduleRegistry, 'getModule' ).andReturn( testWidgetModule_ );
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      describe( 'asked to instantiate a widget controller', function() {

         beforeEach( function() {
            adapter_.createController( widgetServices_, widgetLoaderConfiguration_ );
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'instantiates the widget controller with the requested injections', function() {
            expect( testWidgetModule_.create ).toHaveBeenCalledWith(
               widgetServices_.eventBus,
               widgetFeatures_,
               widgetServices_.idGenerator,
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
            adapter_.createController( widgetServices_, widgetLoaderConfiguration_ );
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
            adapter_.createController( widgetServices_, widgetLoaderConfiguration_ );
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
               expect( widgetServices_.release ).not.toHaveBeenCalled();
            } );

         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         describe( 'and then to destroy itself', function() {

            beforeEach( function() {
               adapter_.destroy();
            } );

            //////////////////////////////////////////////////////////////////////////////////////////////////

            it( 'releases its widget services', function() {
               expect( widgetServices_.release ).toHaveBeenCalled();
            } );

         } );

      } );

   } );

} );
