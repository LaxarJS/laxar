/**
 * Copyright 2014 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
define( [
   '../widget_adapters/angular_adapter',
   'angular',
   'angular-mocks',
   '../../../testing/portal_mocks',
   '../features_provider',
   '../../paths',
   './data/widget_data'
], function( angularWidgetAdapterModule, ng, ngMocks, portalMocks, features, paths, widgetData ) {
   'use strict';

   paths.WIDGETS = 'the_widgets';
   paths.THEMES = 'the_themes';

   var defaultCssAssetPath_ = 'the_themes/blue.theme/test/test_widget/css/test_widget.css';
   var themeCssAssetPath_ = 'the_themes/blue.theme/test/test_widget/css/test_widget.css';
   var htmlAssetPath_ = 'the_widgets/test/test_widget/default.theme/test_widget.html';
   var assets = {};
   assets[ themeCssAssetPath_ ] = 'h1 { color: blue }';
   assets[ defaultCssAssetPath_ ] = 'h1 { color: #ccc }';
   assets[ htmlAssetPath_ ] = '<h1>hello there<i ng-if="false"></i></h1>';

   var widgetSpec_;
   var widgetConfiguration_;
   var widgetFeatures_;
   var widgetLoaderConfiguration_;
   var anchor_;

   var q_;
   var fileResourceProvider_;
   var widgetServices_;
   var fakeControllerScope_ = {};

   beforeEach( function() {

      widgetSpec_ = widgetData.specification;
      widgetConfiguration_ = widgetData.configuration;

      function throwError( msg ) { throw new Error( msg ); }
      widgetFeatures_ = features.featuresForWidget( widgetSpec_, widgetConfiguration_, throwError );

      widgetLoaderConfiguration_ = {
         theme: 'blue',
         'anchorScope': {
            '$new': jasmine.createSpy( 'anchorScope.$new' ).andCallFake( function() {
               return fakeControllerScope_;
            } )
         }
      };

      anchor_ = document.createElement( 'DIV' );

      q_ = portalMocks.mockQ();

      fileResourceProvider_ = portalMocks.mockFileResourceProvider( assets );

      widgetServices_ = {
         idGenerator: function() { return 'fake-id'; },
         eventBus: portalMocks.mockEventBus(),
         release: jasmine.createSpy( 'widgetServices.release' )
      };
   } );

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   describe( 'An angular widget adapter module', function() {

      it( 'provides an AngularJS module representation', function() {
         expect( angularWidgetAdapterModule.module ).toBeDefined();
         expect( angularWidgetAdapterModule.module.name ).toBeDefined();
         expect( angularWidgetAdapterModule.create ).toBeDefined();
         expect( angularWidgetAdapterModule.create ).toEqual( jasmine.any( Function ) );
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'fails to create an adapter with missing dependencies', function() {
         var adapter = null;
         expect( function() {
            adapter = angularWidgetAdapterModule.create();
         } ).toThrow();
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'allows to create an adapter from dependencies', function() {
         var adapter = null;
         expect( function() {
            adapter = angularWidgetAdapterModule.create(
               q_, fileResourceProvider_, widgetSpec_, widgetFeatures_, widgetConfiguration_, anchor_
            );
         } ).not.toThrow();
         expect( adapter ).not.toBe( null );
         expect( adapter.createController ).toBeDefined();
      } );

   } );

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   describe( 'An angular widget adapter', function() {

      var adapter_;
      var controllerScope_;
      var injectedEventBus_;
      var mockThemeManager_;
      var mockCssLoader_;

      var Controller_ = function( $scope, axEventBus ) {
         controllerScope_ = $scope;
         injectedEventBus_ = axEventBus;
      };

      // This mock will provide the non-themed HTML and the themed CSS.
      function mockThemeManager() {
         var provideSpy = jasmine.createSpy( 'urlProvider.provide' ).andCallFake( function( paths ) {
            var results = {};
            results[ 'test_widget.html' ] = htmlAssetPath_;
            results[ 'css/test_widget.css' ] = themeCssAssetPath_;
            return q_.when( paths.map( function( _ ) { return results[ _ ]; } ) );
         } );

         var urlProviderSpy = jasmine.createSpy( 'themeManager.urlProvider' ).andCallFake( function() {
            return {
               provide: provideSpy
            };
         } );

         return {
            urlProvider: urlProviderSpy
         };
      }

      function mockCssLoader() {
         return {
            load: jasmine.createSpy( 'cssLoader.load' )
         };
      }

      beforeEach( function() {
         // widgets.test.test_widget.Controller
         var widgetModule = ng.module( 'widgets.test.test_widget', [] );
         widgetModule.controller( 'widgets.test.test_widget.Controller', Controller_ );
         ngMocks.module( 'widgets.test.test_widget' );
         ngMocks.module( 'laxar.portal.angular_adapter' );
         ngMocks.module( function( $provide ) {
            mockThemeManager_ = mockThemeManager();
            $provide.service( 'ThemeManager', function() {
               return mockThemeManager_;
            } );
            mockCssLoader_ = mockCssLoader();
            $provide.service( 'CssLoader', function() {
               return mockCssLoader_;
            } );
         } );

         ngMocks.inject( function() {
            adapter_ = angularWidgetAdapterModule.create(
               q_, fileResourceProvider_, widgetSpec_, widgetFeatures_, widgetConfiguration_, anchor_
            );
         } );
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      describe( 'asked to instantiate a widget controller', function() {

         beforeEach( function() {
            adapter_.createController( widgetServices_, widgetLoaderConfiguration_ );
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'instantiates the widget controller with a scope', function() {
            expect( controllerScope_ ).toEqual( fakeControllerScope_ );
            expect( controllerScope_.features ).toEqual( widgetFeatures_ );
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'injects the event bus instance for the widget as service (#107)', function() {
            expect( injectedEventBus_ ).toEqual( controllerScope_.eventBus );
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

         it( 'uses the correct search paths to resolve assets', function() {
            expect( promise_ ).toBeDefined();
            expect( mockThemeManager_.urlProvider ).toHaveBeenCalledWith(
               'the_themes/[theme]/widgets/test/test_widget',
               'the_widgets/test/test_widget/[theme]'
            );
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'correctly resolves the CSS and HTML assets', function() {
            expect( promise_ ).toBeDefined();
            expect( mockThemeManager_.urlProvider().provide ).toHaveBeenCalled();
            expect( fileResourceProvider_.provide ).toHaveBeenCalledWith( htmlAssetPath_ );
            expect( mockCssLoader_.load ).toHaveBeenCalledWith( defaultCssAssetPath_ );

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

         var elementThatWasAttached_;

         var resolveSpy = jasmine.createSpy( 'resolveSpy' ).andCallFake( function() {
            adapter_.domAttachTo( {
               appendChild: function( node ) {
               elementThatWasAttached_ = node;
            }
            } );
         } );
         var rejectSpy = jasmine.createSpy( 'rejectSpy' );
         var promise_;

         beforeEach( function() {
            mockAreaNode_= document.createElement( 'DIV' );
            adapter_.createController( widgetServices_, widgetLoaderConfiguration_ );
            promise_ = adapter_.domPrepare().then( function() {
               adapter_.domAttachTo( mockAreaNode_ );
            } );
            jasmine.Clock.tick( 0 );
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'links the widget template', function() {
            expect( ng.element( 'i', anchor_ ).length ).toEqual( 0 );
            expect( anchor_.innerHTML ).not.toEqual( '' );
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'attaches its representation to the given widget area', function() {
            expect( mockAreaNode_.children.length ).toBe( 1 );
            expect( mockAreaNode_.children[ 0 ] ).toBe( anchor_ );
            // anchor class is (mostly) managed externally
            expect( anchor_.className ).toEqual( 'ng-scope' );
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         describe( 'and then to detach it again', function() {

            beforeEach( function() {
               fakeControllerScope_.$destroy = jasmine.createSpy( '$destroy' );
               adapter_.domDetach();
            } );

            //////////////////////////////////////////////////////////////////////////////////////////////////

            it( 'detaches its dom node from the widget area', function() {
               expect( mockAreaNode_.children.length ).toBe( 0 );
            } );

            //////////////////////////////////////////////////////////////////////////////////////////////////

            it( 'retains its widget services and scope', function() {
               expect( widgetServices_.release ).not.toHaveBeenCalled();
               expect( fakeControllerScope_.$destroy ).not.toHaveBeenCalled();
            } );

         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         describe( 'and then to destroy itself', function() {

            beforeEach( function() {
               fakeControllerScope_.$destroy = jasmine.createSpy( '$destroy' );
               adapter_.destroy();
            } );

            //////////////////////////////////////////////////////////////////////////////////////////////////

            it( 'destroys the corresponding angular scope', function() {
               expect( fakeControllerScope_.$destroy ).toHaveBeenCalled();
            } );

            //////////////////////////////////////////////////////////////////////////////////////////////////

            it( 'releases its widget services', function() {
               adapter_.destroy();
               expect( widgetServices_.release ).toHaveBeenCalled();
            } );

         } );

      } );

   } );

} );
