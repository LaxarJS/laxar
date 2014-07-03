/**
 * Copyright 2014 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
define( [
   '../page',
   'angular-mocks',
   'jquery',
   '../../../logging/log',
   '../../../testing/portal_mocks',
   '../../portal_assembler/widget_loader',
   '../../portal_assembler/layout_loader',
   '../../paths',
   '../portal_services',
   './spec_data'
], function(
   pageModule,
   ngMocks,
   $,
   log,
   portalMocks,
   WidgetLoader,
   layoutLoader,
   pathsMock,
   portalServicesModule,
   testData
) {
   'use strict';

   describe( 'A page module', function() {

      var runBlock;
      var layoutLoaderMock_;
      var fileResourceProviderMock_;
      var configurationMock_;
      var q_;

      beforeEach( function() {
         q_ = portalMocks.mockQ();

         layoutLoaderMock_ = mockLayoutLoader();
         fileResourceProviderMock_ = mockFileResourceProvider();
         configurationMock_ = mockConfiguration();

         // Prevent the module from calling its run method initially. We'll let it run later in a controlled
         // fashion. AngularJS currently provides no other way to achieve this then the way we do it here
         runBlock = pageModule._runBlocks[0];
         pageModule._runBlocks = [];

         ngMocks.module( portalServicesModule.name );
         ngMocks.module( 'laxar.portal.page' );

         pathsMock.WIDGETS = '/includes/widgets/';
         pathsMock.PAGES = '/application/pages/';

         jasmine.Clock.useMock();

         ngMocks.module( function( $provide ) {
            $provide.value( 'Configuration',  configurationMock_ );
            $provide.decorator( '$timeout', function() { return portalMocks.mockTick(); } );
            $provide.decorator( '$q', function() { return q_; } );
         } );
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      afterEach( function() {
         pageModule._runBlocks = [ runBlock ];
      } );

      ///////////////////////////////////////////////////////////////////////////////////////////////////////////

      function mockConfiguration() {
         var configuration = {
            get: function( key ) {
               switch( key ) {
                  case 'theme': return 'default';
                  case 'fileListings': return {};
                  default: return '';
               }
            }
         };

         spyOn( configuration, 'get' ).andCallThrough();

         return configuration;
      }

      ///////////////////////////////////////////////////////////////////////////////////////////////////////////

      function mockLayoutLoader() {
         return {
            resultMock: {
               html: '',
               css: '',
               className: ''
            },

            load: function( layout ) {
               return q_.when( layoutLoaderMock_.resultMock );
            }
         };
      }

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      function mockFileResourceProvider() {
         var fileResources = {};
         fileResources[ testData.urls.step1 ] = testData.pages.step1;
         fileResources[ testData.urls.testWidget ] = testData.widgets.testWidget;
         fileResources[ testData.urls.withError ] = testData.pages.withError;

         return {
            provide: jasmine.createSpy( 'provide' ).andCallFake( function( url ) {
               if( url in fileResources ) {
                  return q_.when( clone( fileResources[ url ] ) );
               }

               throw new Error( 'Mocked FileResourceProvider: Unknown requested url', url );
            } )
         };
      }

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      describe( 'when bootstrapped', function() {

         var $injector;

         beforeEach( function() {
            ngMocks.inject( function( _$injector_ ) {

               $injector = _$injector_;
               spyOn( WidgetLoader, 'init' ).andCallThrough();
               $injector.invoke( runBlock, {}, {
                  $q: q_,
                  LayoutLoader: layoutLoaderMock_,
                  FileResourceProvider: fileResourceProviderMock_
               } );
            } );
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'initializes the widget loader', ngMocks.inject( function() {
            expect( WidgetLoader.init ).toHaveBeenCalled();
         } ) );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         describe( 'defines a directive with controller', function() {

            function createMocks() {
               spyOn( WidgetLoader, 'resolveWidget' ).andCallFake( function( widget ) {
                  return q_.when( testData.resolvedWidgets[ widget ] );
               } );
               spyOn( WidgetLoader, 'featuresForWidget' ).andCallFake( function( widgetSpec, widgetConf ) {
                  return testData.widgetFeatures[ widgetConf.widget ];
               } );

               layoutLoaderMock_.resultMock = {
                  html: 'one_column/one_column.html',
                  className: 'one-column-layout'
               };
            }

            //////////////////////////////////////////////////////////////////////////////////////////////////

            var eventBus;
            var controller;
            var scope;
            var $rootScope;
            var $node;

            beforeEach( ngMocks.inject( function( _EventBus_, _$rootScope_, $compile, $controller, $templateCache ) {
               $templateCache.put( 'one_column/one_column.html', '<span></span>' );

               $rootScope = _$rootScope_;
               scope = _$rootScope_.$new();
               eventBus = _EventBus_;

               spyOn( eventBus, 'subscribe' ).andCallThrough();
               spyOn( eventBus, 'publish' ).andCallThrough();
               spyOn( eventBus, 'unsubscribe' ).andCallThrough();

               createMocks();

               $node = $( '<div id="container"></div>' ).appendTo( document.body );
               $compile( $( '<div data-ax-page></div>' ).appendTo( $node ) )( scope );


               // The directive creates a new child scope for the given scope that is shared with the
               // controller. Thus we need to emulate this here for testing purposes.
               scope = scope.$$childHead;

               controller = $controller( 'portal.PageController', {
                  $rootScope: $rootScope,
                  $scope: scope
               } );
            } ) );

            //////////////////////////////////////////////////////////////////////////////////////////////////

            afterEach( function() {
               $node.remove();
            } );

            //////////////////////////////////////////////////////////////////////////////////////////////////

            it( 'that subscribes to loadPageRequest events', function() {
               expect( eventBus.subscribe )
                  .toHaveBeenCalledWith( 'loadPageRequest', jasmine.any( Function ), { subscriber:
                     'PageController'
                  } );
            } );

            //////////////////////////////////////////////////////////////////////////////////////////////////

            function layoutLoadedWithWidgetAreaContent() {
               jasmine.Clock.tick( 0 );
               $rootScope.$digest();
               // Emulate existence of widget area 'content'
               scope.widgetAreas.push( 'content' );
               jasmine.Clock.tick( 0 );
               scope.layoutLoaded();
            }

            //////////////////////////////////////////////////////////////////////////////////////////////////

            describe( 'that on a loadPageRequest event', function() {

               beforeEach( function() {
                  layoutLoaderMock_.resultMock = {
                     html: 'one_column/one_column.html',
                     css: '',
                     className: 'one-column-layout'
                  };

                  eventBus.publish( 'loadPageRequest', { page: 'steps/step1' } );
               } );

               ///////////////////////////////////////////////////////////////////////////////////////////////

               it( 'sends a willLoadPage event', function() {
                  jasmine.Clock.tick( 0 );

                  expect( eventBus.publish )
                     .toHaveBeenCalledWith( 'willLoadPage', {}, { sender: 'PageController' } );
               } );

               ///////////////////////////////////////////////////////////////////////////////////////////////

               it( 'takes account of the configured theme', function() {
                  jasmine.Clock.tick( 0 );

                  expect( configurationMock_.get ).toHaveBeenCalledWith( 'theme' );
               } );

               ///////////////////////////////////////////////////////////////////////////////////////////////

               it( 'triggers loading of the page', function() {
                  jasmine.Clock.tick( 0 );

                  expect( fileResourceProviderMock_.provide ).toHaveBeenCalledWith( testData.urls.step1 );
               } );

               ///////////////////////////////////////////////////////////////////////////////////////////////

               it( 'triggers loading the layout for the page', function() {
                  jasmine.Clock.tick( 0 );

                  expect( scope.layout ).toEqual( 'one_column/one_column.html' );
                  expect( scope.layoutClass ).toEqual( 'one-column-layout' );
               } );

               ///////////////////////////////////////////////////////////////////////////////////////////////

               it( 'defines a loaded callback for the ngInclude directive', function() {
                  jasmine.Clock.tick( 0 );

                  expect( scope.layoutLoaded ).toBeDefined();
                  expect( typeof scope.layoutLoaded ).toEqual( 'function' );
               } );

               ///////////////////////////////////////////////////////////////////////////////////////////////

               it( 'populates a map with all widgets to load in the scope', function() {
                  layoutLoadedWithWidgetAreaContent();

                  expect( scope.widgets.content.length ).toEqual( 1 );
               } );

               ///////////////////////////////////////////////////////////////////////////////////////////////

               it( 'toggles a flag for the widget loading state on the root scope', function() {
                  expect( $rootScope.allWidgetsLoaded ).toBeFalsy();

                  layoutLoadedWithWidgetAreaContent();
                  scope.$emit( 'axPortal.loadedWidget' );
                  jasmine.Clock.tick( 0 );

                  expect( $rootScope.allWidgetsLoaded ).toBe( true );
               } );

               ///////////////////////////////////////////////////////////////////////////////////////////////

               it( 'eventually calls didLoadPage', function() {
                  eventBus.publish.reset();

                  layoutLoadedWithWidgetAreaContent();
                  scope.$emit( 'axPortal.loadedWidget' );
                  jasmine.Clock.tick( 0 );

                  expect( eventBus.publish )
                     .toHaveBeenCalledWith( 'didLoadPage', {}, { sender: 'PageController' } );
               } );

               ///////////////////////////////////////////////////////////////////////////////////////////////

               it( 'adds missing default widget areas (jira ATP-6172)', function() {
                  scope.layout = 'one_column/one_column.html';
                  layoutLoadedWithWidgetAreaContent();
                  scope.$emit( 'axPortal.loadedWidget' );

                  expect( $node.find( '[data-ax-widget-area="activities"]' ).length ).toBe( 1 );
                  expect( $node.find( '[data-ax-widget-area="popups"]' ).length ).toBe( 1 );
                  expect( $node.find( '[data-ax-widget-area="popovers"]' ).length ).toBe( 1 );
               } );

            } );

            //////////////////////////////////////////////////////////////////////////////////////////////////

            describe( 'that on a loadPageRequest event with a non-existing widget area', function() {

               beforeEach( function() {
                  spyOn( log, 'error' );

                  eventBus.publish.reset();
                  eventBus.publish( 'loadPageRequest', { page: testData.urls.withError } );
                  eventBus.publish.reset();
               } );

               ///////////////////////////////////////////////////////////////////////////////////////////////

               it( 'publishes didLoadPage with an error message', function() {
                  layoutLoadedWithWidgetAreaContent();

                  expect( eventBus.publish ).toHaveBeenCalledWith( 'didLoadPage', {
                     error: '1 widgets are in no existing widget area and thus cannot be loaded'
                  }, { sender: 'PageController' } );
               } );

               ///////////////////////////////////////////////////////////////////////////////////////////////

               it( 'logs the incident (jira ATP-5757)', function() {
                  layoutLoadedWithWidgetAreaContent();

                  expect( log.error ).toHaveBeenCalledWith(
                     'Some widgets are in no existing widget area and thus cannot be loaded: [0]',
                     jasmine.any( Array )
                  );
               } );

            } );

         } );

      } );

   } );

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function clone( obj ) {
      return JSON.parse( JSON.stringify( obj ) );
   }

} );
