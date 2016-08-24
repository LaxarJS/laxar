/**
 * Copyright 2016 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
import { create as createServices } from '../services';

describe( 'The services factory', () => {

   let configurationData;
   let assets;
   let services;

   beforeEach( () => {
      configurationData = {
         hello: {
            laxarjs: '4718'
         },
         theme: 'sparta'
      };
      assets = {
         aliases: {
            themes: { default: 0, sparta: 1 }
         },
         themes: [ {
            descriptor: {
               name: 'default.theme'
            }
         }, {
            descriptor: {
               name: 'sparta.theme'
            },
            assets: {
               'this/is': { content: 'SPARTA!!!' }
            }
         } ]
      };
      services = createServices( configurationData, assets );
   } );

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   describe( 'has a configuration property', () => {

      it( 'which reflects the configuration source passed to the create function', () => {
         expect( services.configuration ).toBeDefined();
         expect( services.configuration.get( 'hello.laxarjs' ) ).toEqual( '4718' );
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'which incorporates the documented default configuration', () => {
         expect( services.configuration.get( 'name' ) ).toEqual( 'unnamed' );
         expect( services.configuration.get( 'eventBusTimeoutMs' ) ).toEqual( 120 * 1000 );
      } );

   } );

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   describe( 'has a cssLoader property', () => {

      it( 'which is a css loader instance', () => {
         expect( services.cssLoader.load ).toEqual( jasmine.any( Function ) );
      } );

   } );

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   describe( 'has an artifactProvider property', () => {

      let artifactProvider;

      beforeEach( () => {
         artifactProvider = services.artifactProvider;
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'that is instantiated with the assets', done => {
         artifactProvider.forTheme().asset( 'this/is' )
            .then( result => {
               expect( result ).toEqual( 'SPARTA!!!' );
            } )
            .then( done, done.fail );
      } );

   } );

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   describe( 'has a flowService property', () => {

      it( 'which is a flow service instance', () => {
         expect( services.flowService.controller ).toEqual( jasmine.any( Function ) );
         expect( services.flowService.absoluteUrl ).toEqual( jasmine.any( Function ) );
         expect( services.flowService.constructAbsoluteUrl ).toBe( services.flowService.absoluteUrl );
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

} );
