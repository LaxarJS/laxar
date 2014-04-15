/**
 * Copyright 2014 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
define( [
   '../widget_area',
   'angular',
   'angular-mocks',
   'jquery',
   '../../../utilities/storage',
   '../../../portal/modules/portal_services',
   './spec_data'
], function( widgetAreaModule, ng, unused, $, storage, portalServicesModule, testData ) {
   'use strict';

   var angularMocks = ng.mock;

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   describe( 'A widget module', function() {

      beforeEach( function() {
         angularMocks.module( portalServicesModule.name );
         angularMocks.module( widgetAreaModule.name );

         this.addMatchers( {
            toHaveElementWithAttributes: function( element, attributesMap ) {
               var regExp = new RegExp( '<' + element + '[^>]*(/?)>', 'gi' );
               var m;
               while( ( m = regExp.exec( this.actual ) ) ) {
                  /*jshint loopfunc:true*/
                  var $el = $( m[0] + ( m[1].length ? '' : '</' + element + '>' ) );
                  if( Object.keys( attributesMap ).every( function( key ) {
                     return $el.attr( key ) === attributesMap[ key ];
                  } ) ) {
                     return true;
                  }
               }

               return false;
            }
         } );

      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      describe( 'defining an axWidgetArea directive', function() {

         var $compile;
         var $rootScope;
         var scope;

         beforeEach( angularMocks.inject( function( _$compile_, _$rootScope_ ) {
            $compile = _$compile_;
            $rootScope = _$rootScope_;
            $rootScope.widgets = {
               'one': [ { id: '1a', area: 'one' }, { id: '1b', area: 'one' } ],
               'two': [ { id: 2, area: 'two'} ]
            };
            $rootScope.widgetAreas = [];
            scope = $rootScope.$new();
         } ) );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'that compiles and links the template for the correct set of widgets', function() {
            var element = $compile( '<div data-ax-widget-area="one"></div>' )( scope );
            scope.$digest();

            expect( element.html() ).toHaveElementWithAttributes( 'div', {
               'ax-widget-loader': 'widget',
               'id': 'widget__1a'
            } );
            expect( element.html() ).toHaveElementWithAttributes( 'div', {
               'ax-widget-loader': 'widget',
               'id': 'widget__1b'
            } );
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'that creates its own scope', function() {
            expect( scope.$$childHead ).toBeNull();

            $compile( '<div data-ax-widget-area="one"></div>' )( scope );
            scope.$digest();

            expect( scope.$$childHead ).not.toBeNull();
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'that sets the area name on the scope for the filter to work', function() {
            $compile( '<div data-ax-widget-area="one"></div>' )( scope );
            scope.$digest();

            expect( scope.$$childHead.areaName ).toEqual( 'one' );
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         describe( 'when nested within another widget', function() {

            beforeEach( function() {
               scope.widget = { id: 'myNest' };
               $compile( '<div data-ax-widget-area="one"></div>' )( scope );
               scope.$digest();
            } );

            //////////////////////////////////////////////////////////////////////////////////////////////////

            it( 'prepends the area name with the widget\'s id', function() {
               expect( scope.$$childHead.areaName ).toEqual( 'myNest.one' );
            } );

         } );

      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      describe( 'defining an axWidgetLoader directive', function() {

         var $timeout;
         var $compile;
         var $rootScope;
         var $httpBackend;
         var CssLoader;
         var scope;
         var eventBus;
         var controllerSpy;
         var widgetLoadedSpy;
         var widgetScope;
         var widgetHtml;
         var exampleSubscriber;
         var testProperties;

         beforeEach( angularMocks.inject( function( _$timeout_, _$compile_, _$rootScope_, _$httpBackend_, _CssLoader_, EventBus ) {
            $timeout = _$timeout_;
            $compile = _$compile_;
            $rootScope = _$rootScope_;
            $httpBackend = _$httpBackend_;
            CssLoader = _CssLoader_;
            scope = $rootScope.$new();
            testProperties = {};

            spyOn( storage, 'getLocalStorage' )
               .andReturn( {
                  getItem: jasmine.createSpy( 'getItem' ).andReturn( { myKey: 'val' } ),
                  setItem: jasmine.createSpy( 'setItem' ),
                  removeItem: jasmine.createSpy( 'removeItem' )
               } );
            spyOn( CssLoader, 'load' );
            controllerSpy = jasmine.createSpy( 'controllerSpy' );
            widgetLoadedSpy = jasmine.createSpy( 'widgetLoadedSpy' );

            widgetAreaModule.controller( 'widgets.portal.test_widget.Controller', function( $scope ) {
               testProperties.scopeId = $scope.id( 'myLocalId' );
               controllerSpy( $scope );
            } );

            $rootScope.place = {
               id: '/some/place/:param'
            };

            scope.widget = clone( testData.resolvedWidgets['portal/test_widget'] );
            scope.widget._scopeProperties = {
               features: clone( testData.widgetFeatures['portal/test_widget'] ),
               messages: {}
            };
            scope.widget.id = 'myTestWidget';

            eventBus = EventBus;
            spyOn( eventBus, 'subscribe' );
            spyOn( eventBus, 'publish' );
            spyOn( eventBus, 'publishAndGatherReplies' );
            spyOn( eventBus, 'unsubscribe' );

            scope.$on( 'axPortal.loadedWidget', widgetLoadedSpy );

            $httpBackend.whenGET( scope.widget.includeUrl ).respond( '<div>Hello Test Widget</div>' );

            var element = $compile( '<div data-ax-widget-loader="widget" id="widget__{{widget.id}}"></div>' )( scope );
            scope.$digest();
            $httpBackend.flush();
            widgetHtml = element.html();
            widgetScope = scope.$$childHead;

            exampleSubscriber = function() {};
            widgetScope.eventBus.subscribe( 'someThing', exampleSubscriber );
         } ) );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'that makes a reference to the widget in its local scope', function() {
            expect( widgetScope.widget ).toBe( scope.widget );
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'that renders a widget\'s html code', function() {
            expect( widgetHtml ).toMatch( /<div [^>]*>Hello Test Widget<\/div>/i );
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'that loads the widget\'s css file', function() {
            expect( CssLoader.load ).toHaveBeenCalledWith( scope.widget.cssFileUrls[ 0 ] );
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'that sets the correct css class for the widget', function() {
            expect( widgetScope.widgetClass ).toEqual( 'test-widget' );
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         describe( 'that sets an message bus on the widget', function() {

            it( 'where subscribe gets the widget as subscriber', function() {
               var handler = function() {};
               widgetScope.eventBus.subscribe( 'message', handler );
               expect( eventBus.subscribe )
                  .toHaveBeenCalledWith( 'message', handler, { subscriber: 'widget.TestWidget#myTestWidget' } );
            } );

            //////////////////////////////////////////////////////////////////////////////////////////////////

            it( 'where publish gets the widget as sender', function() {
               widgetScope.eventBus.publish( 'message' );
               expect( eventBus.publish )
                  .toHaveBeenCalledWith( 'message', undefined, { sender: 'widget.TestWidget#myTestWidget' } );
            } );

            //////////////////////////////////////////////////////////////////////////////////////////////////

            it( 'where additional properties on publish are merged with the sender', function() {
               widgetScope.eventBus.publish( 'message', { item: 'value' } );
               expect( eventBus.publish )
                  .toHaveBeenCalledWith( 'message', { item: 'value' }, {
                     sender: 'widget.TestWidget#myTestWidget'
                  } );
            } );

            //////////////////////////////////////////////////////////////////////////////////////////////////

            it( 'where publishAndGatherReplies gets the widget as sender', function() {
               widgetScope.eventBus.publishAndGatherReplies( 'message' );
               expect( eventBus.publishAndGatherReplies )
                  .toHaveBeenCalledWith( 'message', undefined, { sender: 'widget.TestWidget#myTestWidget' } );
            } );
            
            //////////////////////////////////////////////////////////////////////////////////////////////////
            
            it( 'where subscriptions are stored for automatic unsubscription later', function() {
               expect( scope.widget.__subscriptions.length ).toBe( 1 );
               expect( scope.widget.__subscriptions[0] ).toBe( exampleSubscriber );
            } );

         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'that adds a method to create globally unique ids', function() {
            expect( widgetScope.id( 'myLocalId' ) ).toEqual( 'widget__myTestWidget_myLocalId' );
            expect( widgetScope.id( 5 ) ).toEqual( 'widget__myTestWidget_5' );
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'whose scope.id method escapes potentially malicious characters (jira ATP-7584)', function() {
            expect( widgetScope.id( 'b/&%+*~<ßäad' ) ).toEqual( 'widget__myTestWidget_bvmlrqwipuad' );
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'where the method to create unique ids already works in the controller function (jira ATP-7146)', function() {
            expect( testProperties.scopeId ).toEqual( 'widget__myTestWidget_myLocalId' );
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'that moves all items in _scopeProperties to the widget scope', function() {
            expect( widgetScope.features ).toEqual( testData.widgetFeatures['portal/test_widget'] );
            expect( widgetScope.messages ).toEqual( {} );
            expect( widgetScope._scopeProperties ).toBeUndefined();
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'that instantiates the widget\'s controller', function() {
            expect( controllerSpy ).toHaveBeenCalledWith( widgetScope );
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'that adds a method to the widget to access the scope again', function() {
            expect( widgetScope.widget.scope() ).toEqual( widgetScope );
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'that eventually emits an axPortal.loadedWidget event on the scope', function() {
            $timeout.flush();
            expect( widgetLoadedSpy ).toHaveBeenCalled();
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'that restores storage in the widget scope from local storage (jira ATP-6408)', function() {
            expect( storage.getLocalStorage ).toHaveBeenCalledWith( 'widgetStorage' );
            expect( storage.getLocalStorage().getItem )
               .toHaveBeenCalledWith( $rootScope.place.id + '#' + scope.widget.id );

            expect( widgetScope.storage ).toEqual( { myKey: 'val' } );
         } );

         //////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'that on $destroy persists the data in widget scope storage to local storage (jira ATP-6408)', function() {
            widgetScope.storage.myKey = 42;
            scope.$broadcast( '$destroy' );

            expect( storage.getLocalStorage().setItem )
               .toHaveBeenCalledWith( $rootScope.place.id + '#' + scope.widget.id, { myKey: 42 } );
         } );

         //////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'that on $destroy removes data in local storage if storage is null (jira ATP-6408)', function() {
            widgetScope.storage = null;
            scope.$broadcast( '$destroy' );

            expect( storage.getLocalStorage().removeItem )
               .toHaveBeenCalledWith( $rootScope.place.id + '#' + scope.widget.id );
         } );

         //////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'that on $destroy removes data in local storage if storage is empty (jira ATP-6408)', function() {
            widgetScope.storage = {};
            scope.$broadcast( '$destroy' );

            expect( storage.getLocalStorage().removeItem )
               .toHaveBeenCalledWith( $rootScope.place.id + '#' + scope.widget.id );
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         describe( 'on $scope.$destroy event', function() {

            beforeEach( function() {
               scope.$broadcast( '$destroy' );
            } );

            //////////////////////////////////////////////////////////////////////////////////////////////////

            it( 'automatically unsubscribes from previous subscriptions', function() {
               expect( eventBus.unsubscribe ).toHaveBeenCalledWith( exampleSubscriber );
            } );

         } );

      } );

   } );

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function clone( obj ) {
      return JSON.parse( JSON.stringify( obj ) );
   }

} );
