/**
 * Copyright 2014 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
define( [
   '../page',
   'angular-mocks',
   '../../../utilities/assert',
   '../../../logging/log',
   '../../../testing/portal_mocks',
   '../../portal_assembler/widget_loader',
   '../../portal_assembler/layout_loader',
   '../../paths',
   '../portal_services',
   '../theme_manager',
   './spec_data'
], function(
   pageModule,
   angularMocks,
   assert,
   log,
   portalMocks,
   WidgetLoader,
   layoutLoader,
   pathsMock,
   portalServicesModule,
   themeManager,
   testData
) {
   'use strict';

   describe( 'A page module', function() {

      var runBlock;
      var layoutLoaderMock_;
      var configurationMock_;
      var q_;

      beforeEach( function() {
         q_ = portalMocks.mockQ();

         layoutLoaderMock_ = mockLayoutLoader();
         configurationMock_ = mockConfiguration();

         // NEEDS FIX C: prevent the module from calling its run method initially.
         runBlock = pageModule._runBlocks[0];
         pageModule._runBlocks = [];

         angularMocks.module( portalServicesModule.name );
         angularMocks.module( 'laxar.portal.page' );

         pathsMock.WIDGETS = '/includes/widgets/';

         jasmine.Clock.useMock();


         angularMocks.module( function( $provide ) {
            $provide.value( 'Configuration',  configurationMock_ );
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
         var mock = {
            resultMock: {
               html: '',
               css: '',
               className: ''
            },

            load: function( layout ) {
               return q_.when( layoutLoaderMock_.resultMock );
            }
         };

         spyOn( layoutLoader, 'create' ).andReturn( mock );
         return mock;
      }

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      describe( 'when bootstrapped', function() {

         var $injector;

         beforeEach( function() {
            angularMocks.inject( function( _$injector_ ) {
               $injector = _$injector_;
               spyOn( WidgetLoader, 'init' ).andCallThrough();
               $injector.invoke( runBlock );
            } );
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'initializes the widget loader', angularMocks.inject( function( ThemeManager, FileResourceProvider, $q ) {
            expect( WidgetLoader.init ).toHaveBeenCalledWith( ThemeManager, FileResourceProvider, $q );
         } ) );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         describe( 'defines a directive with controller', function() {

            function createMocks( $q ) {
               spyOn( WidgetLoader, 'resolveWidget' ).andCallFake( function( widget ) {
                  return $q.when( testData.resolvedWidgets[ widget ] );
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

            var $httpBackend;
            var eventBus;
            var controller;
            var scope;
            var $rootScope;

            beforeEach( angularMocks.inject( function( _$httpBackend_, _EventBus_, _$rootScope_, $compile, $controller, $q, $templateCache, LayoutLoader ) {
               $httpBackend = _$httpBackend_;
               $httpBackend.whenGET( testData.urls.step1 ).respond( clone( testData.pages.step1 ) );
               $httpBackend.whenGET( testData.urls.testWidget ).respond( clone( testData.widgets.testWidget ) );

               $templateCache.put( 'one_column/one_column.html', '<span></span>' );

               $rootScope = _$rootScope_;
               scope = _$rootScope_.$new();
               eventBus = _EventBus_;

               spyOn( eventBus, 'subscribe' ).andCallThrough();
               spyOn( eventBus, 'publish' ).andCallThrough();
               spyOn( eventBus, 'unsubscribe' ).andCallThrough();

               createMocks( $q, LayoutLoader );

               var element = document.createElement( 'div' );
               element.setAttribute( 'data-ax-page', '' );
               document.body.appendChild( element );
               $compile( document.body )( scope );


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
               var page = document.body.querySelector( '[data-ax-page]' );
               if( page ) {
                  document.body.removeChild( page );
               }
            } );

            //////////////////////////////////////////////////////////////////////////////////////////////////

            it( 'that subscribes to loadPageRequest events', function() {
               expect( eventBus.subscribe )
                  .toHaveBeenCalledWith( 'loadPageRequest', jasmine.any( Function ), 'PageController' );
            } );

            //////////////////////////////////////////////////////////////////////////////////////////////////

            var $timeout;

            beforeEach( angularMocks.inject( function( _$timeout_ ) {
               $timeout = _$timeout_;
            } ) );

            //////////////////////////////////////////////////////////////////////////////////////////////////

            function layoutLoadedWithWidgetAreaContent() {
               $timeout.flush();
               // Emulate existence of widget area 'content'
               scope.widgetAreas.push( 'content' );
               scope.layoutLoaded();
               $rootScope.$digest();
            }

            //////////////////////////////////////////////////////////////////////////////////////////////////

            describe( 'that on a loadPageRequest event', function() {

               beforeEach( function() {
                  layoutLoaderMock_.resultMock = {
                     html: 'one_column/one_column.html',
                     css: '',
                     className: 'one-column-layout'
                  };

                  eventBus.publish( 'loadPageRequest', { page: testData.pages.step1 } );
               } );

               ///////////////////////////////////////////////////////////////////////////////////////////////

               it( 'sends a willLoadPage event', function() {
                  $timeout.flush();
                  expect( eventBus.publish )
                     .toHaveBeenCalledWith( 'willLoadPage', { sender: 'PageController' } );
               } );

               ///////////////////////////////////////////////////////////////////////////////////////////////

               it( 'takes account of the configured theme', function() {
                  $timeout.flush();
                  expect( configurationMock_.get ).toHaveBeenCalledWith( 'theme' );
               } );

               ///////////////////////////////////////////////////////////////////////////////////////////////

               it( 'triggers loading the layout for the page', function() {
                  $timeout.flush();
                  jasmine.Clock.tick( 1 );

                  expect( scope.layout ).toEqual( 'one_column/one_column.html' );
                  expect( scope.layoutClass ).toEqual( 'one-column-layout' );
               } );

               ///////////////////////////////////////////////////////////////////////////////////////////////

               it( 'defines a loaded callback for the ngInclude directive', function() {
                  $timeout.flush();
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
                  $rootScope.$digest();

                  expect( $rootScope.allWidgetsLoaded ).toBe( true );
               } );

               ///////////////////////////////////////////////////////////////////////////////////////////////

               it( 'eventually calls didLoadPage', function() {
                  eventBus.publish.reset();

                  layoutLoadedWithWidgetAreaContent();
                  scope.$emit( 'axPortal.loadedWidget' );
                  $rootScope.$digest();

                  expect( eventBus.publish )
                     .toHaveBeenCalledWith( 'didLoadPage', { sender: 'PageController' } );
               } );

               ///////////////////////////////////////////////////////////////////////////////////////////////

               it( 'adds missing default widget areas (jira ATP-6172)', function() {
                  scope.layout = 'one_column/one_column.html';
                  layoutLoadedWithWidgetAreaContent();

                  var element = document.body.querySelector( '[data-ax-page]' );

                  expect( element.outerHTML ).toMatch( 'data-ax-widget-area="activities"' );
                  expect( element.outerHTML ).toMatch( 'data-ax-widget-area="popups"' );
                  expect( element.outerHTML ).toMatch( 'data-ax-widget-area="popovers"' );
               } );

            } );

            //////////////////////////////////////////////////////////////////////////////////////////////////

            describe( 'that on a loadPageRequest event with a non-existing widget area', function() {

               beforeEach( function() {
                  spyOn( log, 'error' );

                  eventBus.publish.reset();
                  eventBus.publish( 'loadPageRequest', { page: testData.pages.withError } );
                  $rootScope.$digest();
                  eventBus.publish.reset();
               } );

               ///////////////////////////////////////////////////////////////////////////////////////////////

               it( 'publishes didLoadPage with an error message', function() {
                  layoutLoadedWithWidgetAreaContent();

                  expect( eventBus.publish ).toHaveBeenCalledWith( 'didLoadPage', {
                     error : '1 widgets are in no existing widget area and thus cannot be loaded',
                     sender: 'PageController'
                  } );
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
