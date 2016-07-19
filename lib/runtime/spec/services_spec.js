/**
 * Copyright 2016 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
import { create as createServices } from '../services';

describe( 'The services factory', () => {

   let configurationData;
   let resources;
   let services;

   beforeEach( () => {
      configurationData = {
         hello: {
            laxarjs: '4718'
         }
      };
      resources = {
         'this': {
            'is': {
               'sparta.html': 1
            }
         }
      };
      services = createServices( configurationData, resources );
   } );

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   describe( 'has a configuration property', () => {

      it( 'which reflects the configuration source passed to the create function', () => {
         expect( services.configuration ).toBeDefined();
         expect( services.configuration.get( 'hello.laxarjs' ) ).toEqual( '4718' );
      } );

   } );

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   describe( 'has a controls property', () => {

      it( 'which is a controls service instance', () => {
         expect( services.controls.provide ).toEqual( jasmine.any( Function ) );
         expect( services.controls.load ).toEqual( jasmine.any( Function ) );
         expect( services.controls.resolve ).toEqual( jasmine.any( Function ) );
         expect( services.controls.descriptor ).toEqual( jasmine.any( Function ) );
      } );

   } );

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   describe( 'has a cssLoader property', () => {

      it( 'which is a css loader instance', () => {
         expect( services.cssLoader.load ).toEqual( jasmine.any( Function ) );
      } );

   } );

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   describe( 'has a fileResourceProvider property', () => {

      let fileResourceProvider;

      beforeEach( () => {
         fileResourceProvider = services.fileResourceProvider;
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'that is instantiated with the the given listing', done => {
         fileResourceProvider.isAvailable( 'this/is/sparta.html' )
            .then( _ => expect( _ ).toBe( true ), done.fail )
            .then( done );
      } );

   } );

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   describe( 'has a flowService property', () => {

      it( 'which is a flow service instance', () => {
         expect( services.flowService.controller ).toEqual( jasmine.any( Function ) );
         expect( services.flowService.constructPath ).toEqual( jasmine.any( Function ) );
         expect( services.flowService.constructAnchor ).toEqual( jasmine.any( Function ) );
         expect( services.flowService.constructAbsoluteUrl ).toEqual( jasmine.any( Function ) );
      } );

   } );

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   describe( 'has a globalEventBus property', () => {

      let eventBus;

      beforeEach( () => {
         eventBus = services.globalEventBus;
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'which is an event bus instance', () => {
         expect( eventBus.publish ).toBeDefined();
         expect( eventBus.subscribe ).toBeDefined();
      } );

   } );

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   describe( 'has a heartbeat property', () => {

      it( 'which is a heartbeat instance', () => {
         expect( services.heartbeat.onBeforeNext ).toEqual( jasmine.any( Function ) );
         expect( services.heartbeat.onNext ).toEqual( jasmine.any( Function ) );
         expect( services.heartbeat.onAfterNext ).toEqual( jasmine.any( Function ) );
      } );

   } );

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   describe( 'has a layoutLoader property', () => {

      it( 'which is a layout loader instance', () => {
         expect( services.layoutLoader.load ).toEqual( jasmine.any( Function ) );
      } );

   } );

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   describe( 'has a pageService property', () => {

      it( 'which is a page service instance', () => {
         expect( services.pageService.createControllerFor ).toEqual( jasmine.any( Function ) );
         expect( services.pageService.controller ).toEqual( jasmine.any( Function ) );
      } );

   } );

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   describe( 'has a paths property', () => {

      it( 'which is a map of importent paths', () => {
         expect( services.paths ).toEqual( {
            PRODUCT: '',
            THEMES: 'includes/themes',
            LAYOUTS: 'application/layouts',
            CONTROLS: 'includes/controls',
            WIDGETS: 'includes/widgets',
            PAGES: 'application/pages',
            FLOW_JSON: 'application/flow/flow.json',
            DEFAULT_THEME: 'includes/themes/default.theme'
         } );
      } );

   } );

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   describe( 'has a themeManager property', () => {

      it( 'which is a theme manager instance', () => {
         expect( services.themeManager.getTheme ).toEqual( jasmine.any( Function ) );
         expect( services.themeManager.urlProvider ).toEqual( jasmine.any( Function ) );
      } );

   } );

} );
