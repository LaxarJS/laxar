/**
 * Copyright 2015 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
import * as angularWidgetAdapterModule from '../angular_adapter';
import ng from 'angular';
import 'angular-mocks';
import * as q from 'q';
import { create as createEventBusMock } from '../../testing/event_bus_mock';
import { create as createFrpMock } from '../../testing/file_resource_provider_mock';
import * as features from '../../loaders/features_provider';
import paths from '../../loaders/paths';
import widgetData from './widget_data';

const { module, inject } = window;

paths.WIDGETS = 'the_widgets';
paths.THEMES = 'the_themes';

var defaultCssAssetPath_ = 'the_themes/default.theme/test/test_widget/css/test_widget.css';
var themeCssAssetPath_ = 'the_themes/blue.theme/test/test_widget/css/test_widget.css';
var htmlAssetPath_ = 'the_widgets/test/test_widget/default.theme/test_widget.html';
var assets = {
   [ themeCssAssetPath_ ]: 'h1 { color: blue }',
   [ defaultCssAssetPath_ ]: 'h1 { color: #ccc }',
   [ htmlAssetPath_ ]: '<h1>hello there<i ng-if="false"></i></h1>',
};

var widgetSpec_;
var widgetConfiguration_;
var widgetFeatures_;
var anchor_;

var fileResourceProvider_;
var assetResolver_;
var widgetServices_;

beforeEach( () => {

   widgetSpec_ = widgetData.specification;
   widgetConfiguration_ = widgetData.configuration;

   function throwError( msg ) { throw new Error( msg ); }
   widgetFeatures_ = features.featuresForWidget( widgetSpec_, widgetConfiguration_, throwError );

   anchor_ = document.createElement( 'DIV' );

   fileResourceProvider_ = createFrpMock( assets );
   assetResolver_ = {
      loadCss: jasmine.createSpy( 'loadCss' ),
      provide: jasmine.createSpy( 'provide' ).and.callFake( function( url ) {
         return fileResourceProvider_.provide( url );
      } ),
      resolve: jasmine.createSpy( 'resolve' ).and.callFake( () => {
         return q.when( {
            templateUrl: htmlAssetPath_,
            cssFileUrls: [ defaultCssAssetPath_, themeCssAssetPath_ ]
         } );
      } )
   };

   widgetServices_ = {
      idGenerator: () => { return 'fake-id'; },
      eventBus: createEventBusMock( q ),
      release: jasmine.createSpy( 'widgetServices.release' )
   };
} );

///////////////////////////////////////////////////////////////////////////////////////////////////////////

describe( 'An angular widget adapter module', () => {

   it( 'provides an AngularJS module representation', () => {
      expect( angularWidgetAdapterModule.bootstrap ).toBeDefined();
      expect( angularWidgetAdapterModule.technology ).toBeDefined();
      expect( angularWidgetAdapterModule.technology ).toEqual( 'angular' );
      expect( angularWidgetAdapterModule.create ).toBeDefined();
      expect( angularWidgetAdapterModule.create ).toEqual( jasmine.any( Function ) );
   } );

   ////////////////////////////////////////////////////////////////////////////////////////////////////////

   it( 'fails to create an adapter with missing dependencies', () => {
      var adapter = null;
      expect( () => {
         adapter = angularWidgetAdapterModule.create();
      } ).toThrow();
   } );

   ////////////////////////////////////////////////////////////////////////////////////////////////////////

   it( 'allows to create an adapter from dependencies', () => {
      var adapter = null;
      expect( () => {
         adapter = angularWidgetAdapterModule.create(
            assetResolver_, widgetSpec_, widgetFeatures_, widgetConfiguration_, anchor_
         );
      } ).not.toThrow();
      expect( adapter ).not.toBe( null );
      expect( adapter.createController ).toBeDefined();
   } );

} );

///////////////////////////////////////////////////////////////////////////////////////////////////////////

describe( 'An angular widget adapter', () => {

   var environment_;
   var adapter_;
   var controllerScope_;
   var injectedEventBus_;
   var injectedContext_;
   var mockThemeManager_;
   var mockCssLoader_;

   // This mock will provide the non-themed HTML and the themed CSS.
   function mockThemeManager() {
      var provideSpy = jasmine.createSpy( 'urlProvider.provide' ).and.callFake( paths => {
         var results = {};
         results[ 'test_widget.html' ] = htmlAssetPath_;
         results[ 'css/test_widget.css' ] = themeCssAssetPath_;
         return q.when( paths.map( _ => results[ _ ] ) );
      } );

      var urlProviderSpy = jasmine.createSpy( 'themeManager.urlProvider' ).and.callFake( () => {
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

   beforeEach( () => {
      // widgets.test.test_widget.Controller
      var widgetModule = ng.module( 'testWidget', [] );
      widgetModule.controller( 'TestWidgetController', [
         '$scope', 'axEventBus', 'axContext',
         ( $scope, axEventBus, axContext ) => {
            controllerScope_ = $scope;
            injectedEventBus_ = axEventBus;
            injectedContext_ = axContext;
         }
      ] );

      var angularAdapterModule = angularWidgetAdapterModule.bootstrap( [ widgetModule ] );

      module( angularAdapterModule.name );
      module( $provide => {
         $provide.value( '$rootScope', { $apply: jasmine.createSpy( '$rootScope.$apply' ) } );
         mockThemeManager_ = mockThemeManager();
         $provide.service( 'axThemeManager', () => {
            return mockThemeManager_;
         } );
         mockCssLoader_ = mockCssLoader();
         $provide.service( 'axCssLoader', () => {
            return mockCssLoader_;
         } );
      } );

      // fake start of the application
      ng.bootstrap( {}, [ angularAdapterModule.name ] );

      environment_ = {
         anchorElement: anchor_,
         context: {
            eventBus: widgetServices_.eventBus,
            features: widgetFeatures_,
            id: widgetServices_.idGenerator,
            widget: {
               area: widgetConfiguration_.area,
               id: widgetConfiguration_.id,
               path: widgetConfiguration_.widget
            }
         },
         specification: widgetSpec_
      };

      adapter_ = angularWidgetAdapterModule.create( environment_ );
   } );

   ////////////////////////////////////////////////////////////////////////////////////////////////////////

   it( 'for applyViewChanges() calls $apply on the $rootScope', () => {
      inject( $rootScope => {
         angularWidgetAdapterModule.applyViewChanges();

         expect( $rootScope.$apply ).toHaveBeenCalled();
      } );
   } );

   ////////////////////////////////////////////////////////////////////////////////////////////////////////

   describe( 'asked to instantiate a widget controller', () => {

      var onBeforeControllerCreationSpy;

      beforeEach( () => {
         onBeforeControllerCreationSpy = jasmine.createSpy( 'onBeforeControllerCreationSpy' );
         adapter_.createController( {
            onBeforeControllerCreation: onBeforeControllerCreationSpy
         } );
      } );

      /////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'instantiates the widget controller with a scope', () => {
         expect( controllerScope_.$new ).toBeDefined();
         expect( controllerScope_.features ).toEqual( widgetFeatures_ );
      } );

      /////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'injects the event bus instance for the widget as service (#107)', () => {
         expect( injectedEventBus_ ).toEqual( controllerScope_.eventBus );
      } );

      /////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'injects a context for the widget as service (#167)', () => {
         expect( injectedContext_ ).toEqual( environment_.context );
      } );

      /////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'calls onBeforeControllerCreation with environment and injections', () => {
         expect( onBeforeControllerCreationSpy ).toHaveBeenCalled();

         var args = onBeforeControllerCreationSpy.calls.argsFor( 0 );
         expect( args[ 0 ] ).toEqual( environment_ );
         expect( Object.keys( args[ 1 ] ) ).toContain( 'axContext' );
         expect( Object.keys( args[ 1 ] ) ).toContain( 'axEventBus' );
         expect( Object.keys( args[ 1 ] ) ).toContain( '$scope' );
      } );

   } );

   ////////////////////////////////////////////////////////////////////////////////////////////////////////

   describe( 'asked to attach its DOM representation', () => {

      var mockAreaNode_;

      var resolveSpy = jasmine.createSpy( 'resolveSpy' ).and.callFake( () => {
         adapter_.domAttachTo( {
            appendChild: node => {}
         } );
      } );
      var rejectSpy = jasmine.createSpy( 'rejectSpy' );

      beforeEach( () => {
         mockAreaNode_= document.createElement( 'DIV' );
         adapter_.createController( { onBeforeControllerCreation: () => {} } );
         adapter_.domAttachTo( mockAreaNode_, assets[ htmlAssetPath_ ] );
      } );

      /////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'links the widget template', () => {
         expect( document.querySelector( 'i', anchor_ ) ).toBe( null );
         expect( anchor_.innerHTML ).not.toEqual( '' );
      } );

      /////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'attaches its representation to the given widget area', () => {
         expect( mockAreaNode_.children.length ).toBe( 1 );
         expect( mockAreaNode_.children[ 0 ] ).toBe( anchor_ );
         // anchor class is (mostly) managed externally
         expect( anchor_.className ).toEqual( 'ng-scope' );
      } );

      /////////////////////////////////////////////////////////////////////////////////////////////////////

      describe( 'and then to detach it again', () => {

         beforeEach( () => {
            spyOn( controllerScope_, '$destroy' );
            adapter_.domDetach();
         } );

         //////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'detaches its dom node from the widget area', () => {
            expect( mockAreaNode_.children.length ).toBe( 0 );
         } );

         //////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'retains its widget services and scope', () => {
            expect( widgetServices_.release ).not.toHaveBeenCalled();
            expect( controllerScope_.$destroy ).not.toHaveBeenCalled();
         } );

      } );

      /////////////////////////////////////////////////////////////////////////////////////////////////////

      describe( 'and then to destroy itself', () => {

         beforeEach( () => {
            spyOn( controllerScope_, '$destroy' );
            adapter_.destroy();
         } );

         //////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'destroys the corresponding angular scope', () => {
            expect( controllerScope_.$destroy ).toHaveBeenCalled();
         } );

      } );

   } );

} );
