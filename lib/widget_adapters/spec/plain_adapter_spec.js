/**
 * Copyright 2016 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
import * as plainAdapterModule from '../plain_adapter';
import { create as createEventBusMock } from '../../testing/event_bus_mock';
import * as features from '../../loaders/features_provider';
import widgetData from './widget_data';

const defaultCssAssetPath = 'the_themes/default.theme/test/test_widget/css/test_widget.css';
const themeCssAssetPath = 'the_themes/blue.theme/test/test_widget/css/test_widget.css';
const htmlAssetPath = 'the_widgets/test/test_widget/default.theme/test_widget.html';
const assets = {
   [ themeCssAssetPath ]: 'h1 { color: blue }',
   [ defaultCssAssetPath ]: 'h1 { color: #ccc }',
   [ htmlAssetPath ]: '<h1>hello there <%=user%></h1>'
};

let widgetFeatures;
let anchor;

let environment;
let services;

beforeEach( () => {

   const widgetSpec = widgetData.specification;
   const widgetConfiguration = widgetData.configuration;

   function throwError( msg ) { throw new Error( msg ); }
   widgetFeatures = features.featuresForWidget( widgetSpec, widgetConfiguration, throwError );

   anchor = document.createElement( 'DIV' );

   environment = {
      anchorElement: anchor,
      context: {
         eventBus: createEventBusMock(),
         features: widgetFeatures,
         id: () => 'fake-id',
         widget: {
            area: widgetConfiguration.area,
            id: widgetConfiguration.id,
            path: widgetConfiguration.widget
         }
      },
      specification: widgetSpec
   };
   services = {
      flowService: {}
   };
} );

//////////////////////////////////////////////////////////////////////////////////////////////////////////////

describe( 'A plain widget adapter module', () => {

   it( 'provides a bootstrap method for context instantiation', () => {
      expect( plainAdapterModule.bootstrap ).toEqual( jasmine.any( Function ) );
      expect( plainAdapterModule.bootstrap( [], services ) ).toBeDefined();
   } );

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   describe( 'when bootstrapped', () => {

      let factory;

      beforeEach( function() {
         factory = plainAdapterModule.bootstrap( [], services );
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'allows to create an adapter factory from dependencies', () => {
         let adapter = null;
         expect( () => { adapter = factory.create( environment ); } ).not.toThrow();
         expect( adapter ).not.toBe( null );
         expect( adapter.createController ).toBeDefined();
      } );

   } );

} );

//////////////////////////////////////////////////////////////////////////////////////////////////////////////

describe( 'A plain widget adapter', () => {

   let adapter;
   let testWidgetModule;
   let controller;

   beforeEach( () => {
      controller = {
         renderTo: jasmine.createSpy( 'renderTo' )
      };

      testWidgetModule = {
         name: 'test-widget',
         injections: [ 'axContext', 'axEventBus', 'axFeatures' ],
         create: jasmine.createSpy( 'create' ).and.returnValue( controller )
      };

      const factory = plainAdapterModule.bootstrap( [ testWidgetModule ], services );
      adapter = factory.create( environment );
   } );

   ////////////////////////////////////////////////////////////////////////////////////////////////////////

   describe( 'asked to instantiate a widget controller', () => {

      let onBeforeControllerCreationSpy;

      beforeEach( () => {
         onBeforeControllerCreationSpy = jasmine.createSpy( 'onBeforeControllerCreationSpy' );
         adapter.createController( {
            onBeforeControllerCreation: onBeforeControllerCreationSpy
         } );
      } );

      /////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'instantiates the widget controller with the requested injections', () => {
         expect( testWidgetModule.create ).toHaveBeenCalledWith(
            environment.context,
            environment.context.eventBus,
            widgetFeatures
         );
      } );

      /////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'calls onBeforeControllerCreation with environment and injections', () => {
         expect( onBeforeControllerCreationSpy ).toHaveBeenCalled();

         const args = onBeforeControllerCreationSpy.calls.argsFor( 0 );
         expect( args[ 0 ] ).toEqual( environment );
         expect( Object.keys( args[ 1 ] ) ).toContain( 'axContext' );
         expect( Object.keys( args[ 1 ] ) ).toContain( 'axEventBus' );
      } );

   } );

   ////////////////////////////////////////////////////////////////////////////////////////////////////////

   describe( 'asked to attach its DOM representation', () => {

      let mockAreaNode;

      beforeEach( () => {
         mockAreaNode = document.createElement( 'DIV' );
         adapter.createController( { onBeforeControllerCreation: () => {} } );
         adapter.domAttachTo( mockAreaNode, assets[ htmlAssetPath ] );
      } );

      /////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'attaches its representation to the given widget area', () => {
         expect( mockAreaNode.children.length ).toBe( 1 );
         expect( mockAreaNode.children[ 0 ] ).toBe( anchor );
      } );

      /////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'calls the renderTo-method of the widget controller ', () => {
         expect( controller.renderTo ).toHaveBeenCalled();
      } );

      /////////////////////////////////////////////////////////////////////////////////////////////////////

      describe( 'and then to detach it again', () => {

         beforeEach( () => {
            adapter.domDetach();
         } );

         //////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'detaches its dom node from the widget area', () => {
            expect( mockAreaNode.children.length ).toBe( 0 );
         } );

      } );

   } );

} );
