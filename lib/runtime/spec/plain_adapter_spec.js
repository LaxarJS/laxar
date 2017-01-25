/**
 * Copyright 2016 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */

import * as plainAdapterModule from '../plain_adapter';
import { create as createEventBusMock } from '../../testing/event_bus_mock';
import { create as createAdapterUtilities } from '../adapter_utilities';
import widgetData from './data/widget_data';

const defaultCssAssetPath = 'the_themes/default.theme/test/test_widget/css/test_widget.css';
const themeCssAssetPath = 'the_themes/blue.theme/test/test_widget/css/test_widget.css';
const htmlAssetPath = 'the_widgets/test/test_widget/default.theme/test_widget.html';
const assets = {
   [ themeCssAssetPath ]: 'h1 { color: blue }',
   [ defaultCssAssetPath ]: 'h1 { color: #ccc }',
   [ htmlAssetPath ]: '<h1>hello there <%=user%></h1>'
};

let artifacts;

let widgetFeatures;
let anchor;

let testWidgetModule;
let testWidgetModuleCreateResult;
let environment;
let services;

beforeEach( () => {

   const { descriptor, widgetConfiguration } = widgetData;
   testWidgetModuleCreateResult = jasmine.createSpyObj( [ 'onDomAvailable' ] );
   testWidgetModule = {
      injections: [ 'axContext', 'axEventBus', 'axFeatures', 'axWithDom' ],
      create: jasmine.createSpy( 'create' ).and.callFake( () => testWidgetModuleCreateResult )
   };
   artifacts = { widgets: [ { descriptor, module: testWidgetModule } ], controls: [] };

   widgetFeatures = widgetConfiguration.features;
   anchor = document.createElement( 'DIV' );

   const context = {
      eventBus: createEventBusMock(),
      features: widgetFeatures,
      id: () => 'fake-id',
      widget: {
         area: widgetConfiguration.area,
         id: widgetConfiguration.id,
         path: widgetConfiguration.widget
      }
   };

   environment = {
      widgetName: descriptor.name,
      anchorElement: anchor,
      services: {
         axContext: context,
         axEventBus: context.eventBus,
         axFeatures: context.features
      },
      provideServices: jasmine.createSpy( 'provideServices' )
   };

   services = {
      flowService: {},
      adapterUtilities: createAdapterUtilities(),
      artifactProvider: {
         forWidget: widgetRef => ( widgetRef === descriptor.name ? {
            descriptor: () => Promise.resolve( descriptor ),
            module: () => Promise.resolve( testWidgetModule )
         } : {
            descriptor: () => Promise.reject(),
            module: () => Promise.reject()
         } )
      }
   };
} );

//////////////////////////////////////////////////////////////////////////////////////////////////////////////

describe( 'A plain widget adapter module', () => {

   it( 'provides a bootstrap method for context instantiation', () => {
      expect( plainAdapterModule.bootstrap ).toEqual( jasmine.any( Function ) );
      expect( plainAdapterModule.bootstrap( artifacts, services ) ).toBeDefined();
   } );

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   describe( 'when bootstrapped', () => {

      let factory;

      beforeEach( () => {
         factory = plainAdapterModule.bootstrap( artifacts, services );
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'allows to create an adapter factory from dependencies', done => {
         let adapter = null;
         expect( () => { adapter = factory.create( environment ); } ).not.toThrow();

         adapter.then( adapter => {
            expect( adapter ).not.toBe( null );
            expect( adapter.domAttachTo ).toBeDefined();
            expect( adapter.domDetach ).toBeDefined();
         } ).then( done, done );
      } );

   } );

} );

//////////////////////////////////////////////////////////////////////////////////////////////////////////////

describe( 'A plain widget adapter', () => {

   let adapter;

   beforeEach( done => {
      const factory = plainAdapterModule.bootstrap( artifacts, services );
      factory.create( environment )
         .then( a => {
            adapter = a;
            done();
         }, done );
   } );

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   describe( 'asked to instantiate a widget', () => {

      it( 'instantiates the widget controller with the requested injections', () => {
         expect( testWidgetModule.create ).toHaveBeenCalledWith(
            environment.services.axContext,
            environment.services.axEventBus,
            widgetFeatures,
            jasmine.any( Function )
         );
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'calls provideServices with injected services', () => {
         expect( environment.provideServices ).toHaveBeenCalled();

         const [ services ] = environment.provideServices.calls.argsFor( 0 );
         expect( services.axContext ).toBeDefined();
         expect( services.axEventBus ).toBeDefined();
      } );

   } );

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   describe( 'asked to attach its DOM representation', () => {

      let mockAreaNode;

      beforeEach( () => {
         mockAreaNode = document.createElement( 'DIV' );
         adapter.domAttachTo( mockAreaNode, assets[ htmlAssetPath ] );
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'attaches its representation to the given widget area', () => {
         expect( mockAreaNode.children.length ).toBe( 1 );
         expect( mockAreaNode.children[ 0 ] ).toBe( anchor );
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'informs the widget controller of the DOM node via the onDomAvailable hook', () => {
         expect( testWidgetModuleCreateResult.onDomAvailable ).toHaveBeenCalledWith( anchor );
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      describe( 'and then to detach it again', () => {

         beforeEach( () => {
            adapter.domDetach();
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'detaches its dom node from the widget area', () => {
            expect( mockAreaNode.children.length ).toBe( 0 );
         } );

      } );

   } );

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   describe( 'provides an axWithDom service', () => {

      let withDomSpy;
      let axWithDom;

      beforeEach( () => {
         withDomSpy = jasmine.createSpy( 'axWithDom' );
         axWithDom = testWidgetModule.create.calls.mostRecent().args[ 3 ];
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      describe( 'that before the DOM is attached', () => {

         beforeEach( () => {
            axWithDom( withDomSpy );
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'does not call its callback', () => {
            expect( withDomSpy ).not.toHaveBeenCalled();
         } );

      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      describe( 'that after the DOM is attached', () => {

         beforeEach( () => {
            adapter.domAttachTo( document.createElement( 'DIV' ), assets[ htmlAssetPath ] );
            axWithDom( withDomSpy );
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'calls its callback with the rendered element node', () => {
            expect( withDomSpy ).toHaveBeenCalledWith( anchor );
         } );

      } );

   } );

} );
