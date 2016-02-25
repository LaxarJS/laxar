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

   describe( 'has an axConfiguration property', () => {

      it( 'which is the configuration instance passed to the create function', () => {
         expect( services.axConfiguration ).toBe( configuration );
      } );

   } );

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   describe( 'has an axControls property', () => {

         it( 'which is a controls service instance', () => {
            expect( services.axControls.provide ).toEqual( jasmine.any( Function ) );
            expect( services.axControls.load ).toEqual( jasmine.any( Function ) );
            expect( services.axControls.resolve ).toEqual( jasmine.any( Function ) );
            expect( services.axControls.descriptor ).toEqual( jasmine.any( Function ) );
         } );

   } );

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   describe( 'has an axCssLoader property', () => {

         it( 'which is a css loader instance', () => {
            expect( services.axCssLoader.load ).toEqual( jasmine.any( Function ) );
         } );

   } );

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   describe( 'has an axFileResourceProvider property', () => {

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
         expect( services.axFileResourceProvider.setFileListingUri )
            .toHaveBeenCalledWith( 'includes/widgets', '/var/listing/includes_widgets.json' );
         expect( services.axFileResourceProvider.setFileListingContents )
            .toHaveBeenCalledWith( 'includes/themes', { 'default.theme': { css: { 'theme.css': 1 } } } );
      } );

   } );

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   describe( 'has an axFlowService property', () => {

      it( 'which is the flow service instance passed in on services creation', () => {
         expect( services.axFlowService ).toEqual( flowService );
      } );

   } );

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   describe( 'has an axGlobalEventBus property', () => {

      let eventBus;

      beforeEach( () => {
         eventBus = services.axGlobalEventBus;
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

   describe( 'has an axHeartbeat property', () => {

      it( 'which is a heartbeat instance', () => {
         expect( services.axHeartbeat.onBeforeNext ).toEqual( jasmine.any( Function ) );
         expect( services.axHeartbeat.onNext ).toEqual( jasmine.any( Function ) );
         expect( services.axHeartbeat.onAfterNext ).toEqual( jasmine.any( Function ) );
      } );

   } );

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   describe( 'has an axLayoutLoader property', () => {

      it( 'which is a layout loader instance', () => {
         expect( services.axLayoutLoader.load ).toEqual( jasmine.any( Function ) );
      } );

   } );

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   describe( 'has an axThemeManager property', () => {

      it( 'which is a theme manager instance', () => {
         expect( services.axThemeManager.getTheme ).toEqual( jasmine.any( Function ) );
         expect( services.axThemeManager.urlProvider ).toEqual( jasmine.any( Function ) );
      } );

   } );

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   describe( 'has an axTimeout property', () => {

      it( 'provides a timestamp matching the ECMAScript environment time', () => {
         const tolerance = 20;
         const exactDate = new Date().getTime();
         const result = services.axTimestamp();
         expect( exactDate ).toBeLessThan( result + tolerance );
         expect( exactDate ).toBeGreaterThan( result - tolerance );
      } );

   } );

} );
