/**
 * Copyright 2016 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
define( [
   'angular',
   'angular-mocks',
   '../pages',
   '../external_api',
   '../../utilities/configuration',
   '../../logging/log'
], function( ng, ngMocks, pageTooling, externalApi, configuration, log ) {
   'use strict';

   describe( 'The page tooling API', function() {

      beforeEach( function() {
         pageTooling.enable();
         pageTooling.setPageDefinition( 'p', { name: 'my page' }, pageTooling.FLAT );
         pageTooling.setWidgetDescriptor( 'w', { name: 'w' } );
         pageTooling.setCurrentPage( 'p' );
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'allows to access page definitions by reference', function() {
         expect( pageTooling.current().pageDefinitions.p[ pageTooling.FLAT ] ).toEqual( { name: 'my page' } );
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'allows to access widget descriptors by reference', function() {
         expect( pageTooling.current().widgetDescriptors.w ).toEqual( { name: 'w' } );
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'allows to access the current page reference', function() {
         expect( pageTooling.current().pageReference ).toEqual( 'p' );
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      describe( 'with registered listeners, on page change', function() {

         var observedPageInfo_;

         beforeEach( function() {
            pageTooling.addListener( function( pageInfo ) {
               observedPageInfo_ = pageInfo;
            } );
            pageTooling.setPageDefinition( 'x', { name: 'x' }, pageTooling.FLAT );
            pageTooling.setCurrentPage( 'x' );
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'notifies listeners', function() {
            expect( observedPageInfo_ ).toBeDefined();
            expect( observedPageInfo_.pageReference ).toEqual( 'x' );
         } );

         it( 'cleans up data of previous pages', function() {
            expect( pageTooling.current().pageDefinitions.p ).not.toBeDefined();
         } );

      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      afterEach( function() {
         pageTooling.disable();
      } );

   } );

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   describe( 'The external tooling API', function() {

      beforeEach( function() {
         pageTooling.enable();
         pageTooling.setPageDefinition( 'p', { name: 'my page' }, pageTooling.FLAT );
         pageTooling.setCurrentPage( 'p' );
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      describe( 'with configured tooling enabled ', function() {

         var globalEventBus;
         var spyInspector;
         var spyAddLogChannel;
         var testEvent;
         var messageObject;

         beforeEach( function() {
            spyInspector = jasmine.createSpy( 'addInspector' );
            spyAddLogChannel = jasmine.createSpy( 'addLogChannel' );
            testEvent = {
               action: 'testEvent',
               source: 'spec test',
               target: '-'
            };
            messageObject = {
               id: 0,
               level: 'INFO',
               text: 'Test logging'
            };

            spyOn( configuration, 'get' ).andCallFake( function( key, fallback ) {
               return key === 'tooling.enabled' ? true : fallback;
            } );

            spyOn( log, 'addLogChannel' ).andCallFake( function( channel ) {
               spyAddLogChannel();
               channel( messageObject );
            } );

            ngMocks.module( externalApi.name, function( $provide ) {
               $provide.value( 'axGlobalEventBus', {
                  addInspector: function( inspector ) {
                     spyInspector();
                     inspector( testEvent );
                     return function(){};
                  }
               } );
            } );

            ngMocks.inject( function( axGlobalEventBus ) {
               globalEventBus = axGlobalEventBus;
            } );
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         afterEach( function() {
             window.laxarDeveloperToolsApi = undefined;
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'provides the external API', function() {
            expect( window.laxarDeveloperToolsApi ).toBeDefined();
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'adds an inspector', function() {
            expect( spyInspector ).toHaveBeenCalled();
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'saves events in the buffer', function() {
            var action = JSON.parse( window.laxarDeveloperToolsApi.buffers.events[ 0 ].json ).action;
            expect( action ).toEqual( testEvent.action );
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'adds a log channel', function() {
            expect( spyAddLogChannel ).toHaveBeenCalled();
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'saves log messages in the buffer', function() {
            var log = window.laxarDeveloperToolsApi.buffers.log[ 0 ];
            expect( log.json ).toEqual( JSON.stringify( messageObject ) );
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'provides the pageInfo', function() {
            expect( window.laxarDeveloperToolsApi.pageInfo ).toEqual( getPageInfo() );
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         function getPageInfo() {
            return {
               pageReference : 'p',
               pageDefinitions : {
                  p : {
                     FLAT : {
                        name: 'my page'
                     },
                     COMPACT : null
                  }
               },
               compositionDefinitions : {},
               widgetDescriptors : {}
            };
         }

      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      afterEach( function() {
         pageTooling.disable();
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      describe( 'with configured tooling not enabled', function() {

         var globalEventBus;
         var spyInspector;
         var spyAddLogChannel;

         beforeEach( function() {
            spyInspector = jasmine.createSpy( 'addInspector' );
            spyAddLogChannel = jasmine.createSpy( 'addLogChannel' );

            spyOn( configuration, 'get' ).andCallFake( function( key, fallback ) {
               return key === 'tooling.enabled' ? false : fallback;
            } );

            spyOn( log, 'addLogChannel' ).andCallFake( function( channel ) {
               spyAddLogChannel();
            } );

            ngMocks.module( externalApi.name, function( $provide ) {
               $provide.value( 'axGlobalEventBus', {
                  addInspector: function( inspector ) {
                     spyInspector();
                     return function(){};
                  }
               } );
            } );

            ngMocks.inject( function( axGlobalEventBus ) {
               globalEventBus = axGlobalEventBus;
            } );
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'doesn\'t provides the external API', function() {
            expect( window.laxarDeveloperToolsApi ).not.toBeDefined();
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'doesn\'t add an inspector', function() {
            expect( spyInspector ).not.toHaveBeenCalled();
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'doesn\'t add a log channel', function() {
            expect( spyAddLogChannel ).not.toHaveBeenCalled();
         } );

      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      describe( 'when \'window.laxarDeveloperToolsExtensionLoaded\' is true', function() {
         var globalEventBus;

         beforeEach( function() {
            window.laxarDeveloperToolsExtensionLoaded = true;

            ngMocks.module( externalApi.name, function( $provide ) {
               $provide.value( 'axGlobalEventBus', {
                  addInspector: function( inspector ) {
                     return function(){};
                  }
               } );
            } );

            ngMocks.inject( function( axGlobalEventBus ) {
               globalEventBus = axGlobalEventBus;
            } );
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'provides the external API', function() {
            expect( window.laxarDeveloperToolsApi ).toBeDefined();
         } );

      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      describe( 'when documentElement has attribute \'data-laxar-developer-tools-extension\'', function() {
         var globalEventBus;

         beforeEach( function() {
            document.documentElement.setAttribute( 'data-laxar-developer-tools-extension', {} );

            ngMocks.module( externalApi.name, function( $provide ) {
               $provide.value( 'axGlobalEventBus', {
                  addInspector: function( inspector ) {
                     return function(){};
                  }
               } );
            } );

            ngMocks.inject( function( axGlobalEventBus ) {
               globalEventBus = axGlobalEventBus;
            } );
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'provides the external API', function() {
            expect( window.laxarDeveloperToolsApi ).toBeDefined();
         } );

      } );
   } );

} );
