/**
 * Copyright 2016 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
import { create as createServices } from '../services';
import * as fileResourceProvider from '../../file_resource_provider/file_resource_provider';
import log from '../../logging/log';
import q from 'q';

describe( 'The services factory', () => {

   const flowService = { just: 'aMock' };
   let configurationData;
   let configuration;
   let services;

   beforeEach( () => {
      configurationData = {};
      configuration = {
         get( key, defaultValue ) {
            return key in configurationData ? configurationData[ key ] : defaultValue;
         }
      };
      services = createServices( configuration, q, {}, flowService );
   } );

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   describe( 'has a configuration property', () => {

      it( 'which is the configuration instance passed to the create function', () => {
         expect( services.configuration ).toBe( configuration );
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

      beforeEach( () => {
         const proto = fileResourceProvider.create( {}, {}, '' ).constructor.prototype;
         spyOn( proto, 'setFileListingUri' );
         spyOn( proto, 'setFileListingContents' );

         configurationData[ 'fileListings' ] = {
            'includes/widgets': '/var/listing/includes_widgets.json',
            'includes/themes': { 'default.theme': { css: { 'theme.css': 1 } } }
         };
         services = createServices( configuration, q, { get: () => q.when() }, {} );
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'that receives the configured file listings', () => {
         expect( services.fileResourceProvider.setFileListingUri )
            .toHaveBeenCalledWith( 'includes/widgets', '/var/listing/includes_widgets.json' );
         expect( services.fileResourceProvider.setFileListingContents )
            .toHaveBeenCalledWith( 'includes/themes', { 'default.theme': { css: { 'theme.css': 1 } } } );
      } );

   } );

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   describe( 'has a flowService property', () => {

      it( 'which is the flow service instance passed in on services creation', () => {
         expect( services.flowService ).toEqual( flowService );
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

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      describe( 'and attaches an error handler to the event', () => {

         beforeEach( done => {
            spyOn( log, 'error' );

            eventBus.subscribe( 'message', () => { throw new Error( 'error' ); } );
            eventBus.publish( 'message', { data: '' } )
               .then( done );
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'that uses the global logger ', () => {
            expect( log.error ).toHaveBeenCalled();
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'that marks the event object for anonymization in the log message', () => {
            const eventMessageCall = log.error.calls.all()
               .filter( call => call.args[1] === 'Published event' ).pop();

            expect( eventMessageCall.args[0] ).toEqual( '   - [0]: [1:%o:anonymize]' );
         } );

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
