/**
 * Copyright 2016 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
import * as plainAdapterModule from '../plain_adapter';
import * as q from 'q';
import { create as createEventBusMock } from '../../testing/event_bus_mock';
import { create as createFrpMock } from '../../testing/file_resource_provider_mock';
import * as features from '../../loaders/features_provider';
import widgetData from './widget_data';

var defaultCssAssetPath_ = 'the_themes/default.theme/test/test_widget/css/test_widget.css';
var themeCssAssetPath_ = 'the_themes/blue.theme/test/test_widget/css/test_widget.css';
var htmlAssetPath_ = 'the_widgets/test/test_widget/default.theme/test_widget.html';
var assets = {
   [ themeCssAssetPath_ ]: 'h1 { color: blue }',
   [ defaultCssAssetPath_ ]: 'h1 { color: #ccc }',
   [ htmlAssetPath_ ]: '<h1>hello there <%=user%></h1>',
};

var widgetSpec_;
var widgetConfiguration_;
var widgetFeatures_;
var widgetLoaderConfiguration_;
var anchor_;

var fileResourceProvider_;
var assetResolver_;
var environment_;
var services_;

beforeEach( () => {

   widgetSpec_ = widgetData.specification;
   widgetConfiguration_ = widgetData.configuration;

   function throwError( msg ) { throw new Error( msg ); }
   widgetFeatures_ = features.featuresForWidget( widgetSpec_, widgetConfiguration_, throwError );

   widgetLoaderConfiguration_ = {};

   anchor_ = document.createElement( 'DIV' );

   fileResourceProvider_ = createFrpMock( assets );
   assetResolver_ = {
      loadCss: jasmine.createSpy( 'loadCss' ),
      provide: jasmine.createSpy( 'provide' ).and.callFake( url => fileResourceProvider_.provide( url ) ),
      resolve: jasmine.createSpy( 'resolve' ).and.callFake( () => {
         return q_.when( {
            templateUrl: htmlAssetPath_,
            cssFileUrls: [ defaultCssAssetPath_, themeCssAssetPath_ ]
         } );
      } )
   };

   environment_ = {
      anchorElement: anchor_,
      context: {
         eventBus: createEventBusMock( q ),
         features: widgetFeatures_,
         id: () => 'fake-id',
         widget: {
            area: widgetConfiguration_.area,
            id: widgetConfiguration_.id,
            path: widgetConfiguration_.widget
         }
      },
      specification: widgetSpec_
   };
   services_ = {
      axFlowService: {}
   };
} );

///////////////////////////////////////////////////////////////////////////////////////////////////////////

describe( 'A plain widget adapter module', () => {

   it( 'provides a custom module', () => {
      expect( plainAdapterModule.create ).toEqual( jasmine.any( Function ) );
   } );

   ////////////////////////////////////////////////////////////////////////////////////////////////////////

   it( 'allows to create an adapter from dependencies', () => {
      var adapter = null;
      expect( () => {
         adapter = plainAdapterModule.create( environment_, services_ );
      } ).not.toThrow();
      expect( adapter ).not.toBe( null );
      expect( adapter.createController ).toBeDefined();
   } );

} );

///////////////////////////////////////////////////////////////////////////////////////////////////////////

describe( 'A plain widget adapter', () => {

   var adapter_;
   var testWidgetModule_;
   var controller_;

   beforeEach( () => {
      controller_ = {
         renderTo: jasmine.createSpy( 'renderTo' )
      };

      testWidgetModule_ = {
         name: 'test-widget',
         injections: [ 'axContext', 'axEventBus', 'axFeatures' ],
         create: jasmine.createSpy( 'create' ).and.returnValue( controller_ )
      };

      plainAdapterModule.bootstrap( [ testWidgetModule_ ] );
      adapter_ = plainAdapterModule.create( environment_, services_ );
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

      it( 'instantiates the widget controller with the requested injections', () => {
         expect( testWidgetModule_.create ).toHaveBeenCalledWith(
            environment_.context,
            environment_.context.eventBus,
            widgetFeatures_
         );
      } );

      /////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'calls onBeforeControllerCreation with environment and injections', () => {
         expect( onBeforeControllerCreationSpy ).toHaveBeenCalled();

         var args = onBeforeControllerCreationSpy.calls.argsFor( 0 );
         expect( args[ 0 ] ).toEqual( environment_ );
         expect( Object.keys( args[ 1 ] ) ).toContain( 'axContext' );
         expect( Object.keys( args[ 1 ] ) ).toContain( 'axEventBus' );
      } );

   } );

   ////////////////////////////////////////////////////////////////////////////////////////////////////////

   describe( 'asked to attach its DOM representation', () => {

      var mockAreaNode_;

      beforeEach( () => {
         mockAreaNode_= document.createElement( 'DIV' );
         adapter_.createController( { onBeforeControllerCreation: () => {} } );
         adapter_.domAttachTo( mockAreaNode_, assets[ htmlAssetPath_ ] );
      } );

      /////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'attaches its representation to the given widget area', () => {
         expect( mockAreaNode_.children.length ).toBe( 1 );
         expect( mockAreaNode_.children[ 0 ] ).toBe( anchor_ );
      } );

      /////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'calls the renderTo-method of the widget controller ', () => {
         expect( controller_.renderTo ).toHaveBeenCalled();
      } );

      /////////////////////////////////////////////////////////////////////////////////////////////////////

      describe( 'and then to detach it again', () => {

         beforeEach( () => {
            adapter_.domDetach();
         } );

         //////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'detaches its dom node from the widget area', () => {
            expect( mockAreaNode_.children.length ).toBe( 0 );
         } );

      } );

   } );

} );
