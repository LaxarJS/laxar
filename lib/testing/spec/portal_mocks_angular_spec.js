/**
 * Copyright 2014 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
define( [
   'angular',
   'jquery',
   '../portal_mocks',
   '../portal_mocks_angular',
   '../../utilities/fn'
], function( angular, $, portalMocks, portalMocksAngular, fn ) {
   'use strict';

   describe( 'For a ControllerTestBed which is set up', function() {

      var testBed;
      var watchSpy;
      var controllerSpy;

      beforeEach( function() {
         watchSpy = jasmine.createSpy( 'watchSpy' );
         controllerSpy = jasmine.createSpy( 'controllerSpy' );

         createAngularModule( watchSpy, controllerSpy );
         testBed = portalMocksAngular.createControllerTestBed( 'my-awesome-widget' );
         mockAjax( 'my-awesome-widget', testBed );
         testBed.setup();
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'the eventBus mock starts a $scope.$digest after calling subscribers', function() {
         testBed.eventBusMock.publish( 'message' );
         jasmine.Clock.tick( 0 );

         expect( watchSpy ).toHaveBeenCalled();
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'creates the id method for globally unique ids on the scope', function() {
         expect( testBed.scope.id ).toBeDefined();
         expect( testBed.scope.id( 'locallyUnique' ) ).toEqual( 'ax-testWidgetId-locallyUnique' );
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'links the widget event bus to the scope', function() {
         expect( testBed.scope.eventBus ).toBeDefined();
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'instantiates the controller with the testbed scope', function() {
         expect( controllerSpy ).toHaveBeenCalled();
         expect( controllerSpy.calls[ 0 ].args[ 0 ] ).toEqual( testBed.scope );
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'instantiates the controller with a q implementation', function() {
         expect( controllerSpy ).toHaveBeenCalled();
         expect( controllerSpy.calls[ 0 ].args[ 1 ].when ).toEqual( jasmine.any( Function ) );
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      describe( 'with message bus mock on the scope', function() {

         beforeEach( function() {
            testBed.eventBusMock.publish.reset();
            testBed.eventBusMock.publishAndGatherReplies.reset();
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'on publish passes all parameters to the underlying message bus mock (jira ATP-6747)', function() {
            testBed.scope.eventBus.publish( 'myMessage', {}, { deliverToSender: false } );

            expect( testBed.eventBusMock.publish )
               .toHaveBeenCalledWith( 'myMessage', {}, {
                  sender: jasmine.any( String ),
                  deliverToSender: false
               } );
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'on publishAndGatherReplies passes all parameters to the underlying message bus mock (jira ATP-6747)', function() {
            testBed.scope.eventBus.publishAndGatherReplies( 'myRequest', {}, { deliverToSender: false } );

            expect( testBed.eventBusMock.publishAndGatherReplies )
               .toHaveBeenCalledWith( 'myRequest', {}, {
                  sender: jasmine.any( String ),
                  deliverToSender: false
               }  );
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'copies the event before adding sender information on publish (jira ATP-7018)', function() {
            var event = {};
            testBed.scope.eventBus.publish( 'myMessage', event );

            expect( event.sender ).toBeUndefined();
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'copies the event before adding sender information on publishAndGatherReplies (jira ATP-7018)', function() {
            var event = {};
            testBed.scope.eventBus.publish( 'myMessage', event );

            expect( event.sender ).toBeUndefined();
         } );

      } );

   } );

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   describe( 'A ControllerTestBed with custom injections', function() {

      var testBed;
      var controllerSpy;

      beforeEach( function() {
         controllerSpy = jasmine.createSpy( 'controllerSpy' );
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'provides the scope as an injection', function() {
         createAngularModule( null, controllerSpy, [ '$scope' ] );
         testBed = portalMocksAngular.createControllerTestBed( 'my-awesome-widget' );
         mockAjax( 'my-awesome-widget', testBed );
         testBed.setup();
         expect( controllerSpy ).toHaveBeenCalledWith( testBed.scope );
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'supports old-school (pre LaxarJS/laxar#153) module and controller names', function() {
         createAngularModule( null, controllerSpy, [ '$scope' ], {
            moduleName: 'widgets.my.AwesomeWidget',
            controllerName: 'widgets.my.AwesomeWidget.Controller'
         } );
         testBed = portalMocksAngular.createControllerTestBed( 'widgets.my.AwesomeWidget' );
         mockAjax( 'my-awesome-widget', testBed );
         testBed.setup();
         expect( controllerSpy ).toHaveBeenCalledWith( testBed.scope );
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'provides a mocked widget event-bus as an injection', function() {
         createAngularModule( null, controllerSpy, [ 'axEventBus' ] );
         testBed = portalMocksAngular.createControllerTestBed( 'my-awesome-widget' );
         mockAjax( 'my-awesome-widget', testBed );
         testBed.setup();
         expect( controllerSpy ).toHaveBeenCalledWith( testBed.scope.eventBus );
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'provides a mocked timestamp function as an injection', function() {
         createAngularModule( null, controllerSpy, [ 'axTimestamp' ] );
         testBed = portalMocksAngular.createControllerTestBed( 'my-awesome-widget' );
         mockAjax( 'my-awesome-widget', testBed );
         testBed.setup();
         expect( controllerSpy ).toHaveBeenCalledWith( portalMocksAngular.mockTimestamp );
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'provides a mocked $timeout function as an injection', function() {
         createAngularModule( null, controllerSpy, [ '$timeout' ] );
         var callback = jasmine.createSpy( 'callback' );
         controllerSpy.andCallFake( function( $timeout ) {
            $timeout( callback, 3 ).cancel();
            $timeout( callback, 5 );
         } );

         testBed = portalMocksAngular.createControllerTestBed( 'my-awesome-widget' );
         mockAjax( 'my-awesome-widget', testBed );
         testBed.setup();
         expect( controllerSpy ).toHaveBeenCalled();

         jasmine.Clock.tick( 4 );
         expect( callback ).not.toHaveBeenCalled();
         jasmine.Clock.tick( 1 );
         expect( callback ).toHaveBeenCalled();
      } );

   } );

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   describe( 'A ControllerTestBed', function() {

      var testBed;
      var controllerSpy;
      var any;

      beforeEach( function() {
         any = jasmine.any( Object );
         controllerSpy = jasmine.createSpy( 'controllerSpy' );
         createAngularModule( null, controllerSpy );
         testBed = portalMocksAngular.createControllerTestBed( 'my-awesome-widget' );
         testBed.featuresMock = {
            myFeature: 12
         };
         mockAjax( 'my-awesome-widget', testBed );
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'creates a scope object', function() {
         expect( testBed.scope ).toBeUndefined();
         testBed.setup();
         expect( testBed.scope ).toBeDefined();
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'copies over mocked features to the widget scope', function() {
         testBed.setup();
         expect( testBed.scope.features.myFeature ).toEqual( 12 );
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'copies over a the id of a mock widget to the widget scope', function() {
         testBed.setup();
         expect( testBed.scope.widget )
            .toEqual( { id: 'testWidgetId', area: 'testArea', path: 'my-awesome-widget' } );
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'uses mocked injections for the controller', function() {
         var fakedQ = { faked: 'q' };
         testBed.injections = {
            $q: fakedQ
         };
         testBed.setup();
         expect( controllerSpy ).toHaveBeenCalledWith( any, fakedQ, any, any );
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'adds custom injections for the controller', function() {
         testBed.setup();

         // axContext
         expect( controllerSpy.calls[ 0 ].args[ 2 ] ).toEqual( {
            eventBus: testBed.scope.eventBus,
            features: testBed.scope.features,
            id: testBed.scope.id,
            widget: testBed.scope.widget
         } );
         // axEventBus
         expect( controllerSpy.calls[ 0 ].args[ 3 ] ).toBe( testBed.scope.eventBus );
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'provides injections for testing before creating the controller', function() {
         var injector = {};
         testBed.onBeforeControllerCreation = function( $injector ) {
            injector = $injector;
         };
         expect( injector ).toEqual( {} );
         testBed.setup();
         expect( injector.instantiate ).toEqual( jasmine.any( Function ) );
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'provides injections for testing before creating the controller, per setup', function() {
         var $httpBackend = {};
         testBed.setup( {
            onBeforeControllerCreation: function( _$httpBackend_ ) {
               $httpBackend = _$httpBackend_;
            }
         } );
         expect( $httpBackend.expectGET ).toEqual( jasmine.any( Function ) );
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'sets a default i18n object on the root scope (#6)', function() {
         testBed.setup();

         expect( testBed.scope.$root.i18n ).toEqual( {
            locale: 'default',
            tags: { 'default': 'en' }
         } );
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'sets a given default language tag for the i18n object on the root scope (#6)', function() {
         testBed.setup( { defaultLanguageTag: 'de_DE' } );

         expect( testBed.scope.$root.i18n ).toEqual( {
            locale: 'default',
            tags: { 'default': 'de_DE' }
         } );
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      describe( 'if asked to simulate runtime events (#17)', function() {

         describe( 'with default language tag', function() {

            beforeEach( function() {
               testBed.setup( { defaultLanguageTag: 'de_DE', simulatePortalEvents: true } );
               jasmine.Clock.tick( 0 );
            } );

            //////////////////////////////////////////////////////////////////////////////////////////////////

            it( 'publishes a given default language tag using didChangeLocale', function() {
               expect( testBed.eventBusMock.publish )
                  .toHaveBeenCalledWith( 'didChangeLocale.default', {
                     locale: 'default',
                     languageTag: 'de_DE'
                  }, { sender: 'AxFlowController' } );
            } );

         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         describe( 'without default language tag', function() {

            beforeEach( function() {
               testBed.setup( { defaultLanguageTag: null, simulatePortalEvents: true } );
               jasmine.Clock.tick( 0 );
            } );

            //////////////////////////////////////////////////////////////////////////////////////////////////

            it( 'does not publish didChangeLocale', function() {
               expect( testBed.eventBusMock.publish ).not.toHaveBeenCalledWith(
                  'didChangeLocale.default',
                  jasmine.any( Object ),
                  jasmine.any( Object ) );
            } );

         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         describe( 'by default', function() {

            beforeEach( function() {
               testBed.setup( { simulatePortalEvents: true } );
               jasmine.Clock.tick( 0 );
            } );

            //////////////////////////////////////////////////////////////////////////////////////////////////

            it( 'publishes didChangeLocale', function() {
               expect( testBed.eventBusMock.publish )
                  .toHaveBeenCalledWith( 'didChangeLocale.default', {
                     locale: 'default',
                     languageTag: 'en'
                  }, { sender: 'AxFlowController' } );
            } );

            //////////////////////////////////////////////////////////////////////////////////////////////////

            it( 'publishes didChangeTheme', function() {
               expect( testBed.eventBusMock.publish )
                  .toHaveBeenCalledWith( 'didChangeTheme.default', {
                     theme: 'default'
                  }, { sender: 'AxFlowController' } );
            } );

            //////////////////////////////////////////////////////////////////////////////////////////////////

            it( 'publishes beginLifeCycleRequest', function() {
               expect( testBed.eventBusMock.publishAndGatherReplies )
                  .toHaveBeenCalledWith( 'beginLifecycleRequest.default', {
                     lifecycleId: 'default'
                  }, { sender: 'AxFlowController' } );
            } );

            //////////////////////////////////////////////////////////////////////////////////////////////////

            it( 'publishes didNavigate', function() {
               expect( testBed.eventBusMock.publish )
                  .toHaveBeenCalledWith( 'didNavigate.default', {
                     target: 'default',
                     place: 'testPlace',
                     data: {}
                  }, { sender: 'AxFlowController' } );
            } );
         } );
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      describe( 'if not asked to simulate runtime events', function() {

         beforeEach( function() {
            testBed.setup( { defaultLanguageTag: 'de_DE' } );
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'does not publish anything on the event-bus mock', function() {
            expect( testBed.eventBusMock.publish ).not.toHaveBeenCalled();
         } );
      } );
   } );

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   describe( 'A ControllerTestBed using the widget specification file', function() {

      var testBed;
      var controllerSpy;

      beforeEach( function() {
         var names = { moduleName: 'myOtherAwesomeWidget', controllerName: 'MyOtherAwesomeWidgetController' };
         controllerSpy = jasmine.createSpy( 'controllerSpy' );
         createAngularModule( null, controllerSpy, null, names );

         // Use a different widget name so that the testBed XHR cache is invalidated.
         testBed = portalMocksAngular.createControllerTestBed( 'my-other-awesome-widget' );
         testBed.featuresMock = {
            myFeature: 12
         };
         var widgetJsonContent = {
            name: 'my-other-awesome-widget',
            integration: {
               type: 'angular'
            },
            features: {
               $schema: 'http://json-schema.org/draft-04/schema#',
               type: 'object',
               required: [ 'something' ],
               properties: {
                  something: {
                     required: [ 'action' ],
                     type: 'object',
                     properties: {
                        enabled: {
                           type: 'boolean',
                           'default': true
                        },
                        action: {
                           type: 'string'
                        }
                     }
                  }
               }
            }
         };

         spyOn( testBed.$, 'ajax' ).andCallFake( function( obj ) {
            obj.success( clone( widgetJsonContent ) );
         } );

      } );

      /////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'triggers validation on setup (with errors)', function() {
         expect( testBed.setup ).toThrow();
      } );

      /////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'triggers validation on setup (without errors)', function() {
         testBed.featuresMock = {
            something: {
               action: 'anything'
            }
         };
         expect( testBed.setup ).not.toThrow();
      } );
   } );

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   describe( 'mockQ', function() {

      var q;
      var scope;

      beforeEach( function() {
         scope = {
            $digest: jasmine.createSpy(),
            $$phase: null
         };
         q = portalMocksAngular.mockQ( scope );
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'the q mock starts a $scope.$digest on resolve', function() {
         var deferred = q.defer();
         deferred.resolve();

         expect( scope.$digest ).toHaveBeenCalled();
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'the q mock starts no $scope.$digest if already ongoing on resolve', function() {
         scope.$$phase = 'digest';
         var deferred = q.defer();
         deferred.resolve();

         expect( scope.$digest ).not.toHaveBeenCalled();
      } );

   } );

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   describe( 'mockDebounce', function() {

      var f;
      var fDebounced;
      var fImmediate;
      var fImmediateDebounced;

      beforeEach( function() {
         jasmine.Clock.useMock();
         portalMocksAngular.mockDebounce();

         f = jasmine.createSpy( 'debounced call' );
         fDebounced = fn.debounce( f, 100 );
         fDebounced( 'aaa' );
         fDebounced( 'bbb' );

         fImmediate = jasmine.createSpy( 'immediately debounced call' );
         fImmediateDebounced = fn.debounce( fImmediate, 100, true );
         fImmediateDebounced( 'xxx' );
         fImmediateDebounced( 'yyy' );
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'installs an underscore-compatible debounce function that uses the mock clock', function() {
         expect( fn.debounce ).toEqual( jasmine.any( Function ) );

         expect( f ).not.toHaveBeenCalled();
         expect( fImmediate ).toHaveBeenCalled();
         expect( fImmediate.calls.length ).toEqual( 1 );

         jasmine.Clock.tick( 99 );
         expect( f ).not.toHaveBeenCalled();
         jasmine.Clock.tick( 1 );
         expect( f ).toHaveBeenCalledWith( 'aaa' );
         expect( f.calls.length ).toEqual( 1 );

         fImmediateDebounced( 'zzz' );
         expect( fImmediate.calls.length ).toEqual( 2 );
         expect( fImmediate ).toHaveBeenCalledWith( 'xxx' );
         expect( fImmediate ).toHaveBeenCalledWith( 'zzz' );
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'allows to force debounced calls without tick, so without knowing the debounce delay', function() {
         expect( fn.debounce.force ).toEqual( jasmine.any( Function ) );

         expect( f ).not.toHaveBeenCalled();
         fn.debounce.force();
         expect( f ).toHaveBeenCalled();
         expect( f ).toHaveBeenCalledWith( 'aaa' );
         expect( f.calls.length ).toEqual( 1 );
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'allows to inspect the list of waiting calls', function() {
         expect( fn.debounce.waiting ).toEqual( jasmine.any( Array ) );

         expect( f ).not.toHaveBeenCalled();
         expect( fn.debounce.waiting.length ).toEqual( 1 );
         expect( fn.debounce.waiting[ 0 ].args[ 0 ] ).toEqual( 'aaa' );

         jasmine.Clock.tick( 100 );
         expect( fn.debounce.waiting.length ).toEqual( 0 );
      } );

   } );

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function createAngularModule( modelWatchSpy, controllerSpy, injections, names ) {
      names = names || { moduleName: 'myAwesomeWidget', controllerName: 'MyAwesomeWidgetController' };

      Controller.$inject = injections || [ '$scope', '$q', 'axContext', 'axEventBus' ];
      function Controller() {
         if( controllerSpy ) {
            controllerSpy.apply( {}, arguments );
         }

         if( Controller.$inject[ 0 ] === '$scope' ) {
            var $scope = arguments[ 0 ];
            $scope.myModel = 10;
            $scope.$watch( 'myModel', modelWatchSpy || function() {} );

            $scope.eventBus.subscribe( 'message', function() {
               $scope.myModel = 12;
            } );
         }
      }

      angular
         .module( names.moduleName, [] )
         .controller( names.controllerName, Controller );
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function clone( obj ) {
      return JSON.parse( JSON.stringify( obj ) );
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function mockAjax( widgetName, testBed ) {
      var widgetJsonContent = {
         name: widgetName,
         description: 'test widget',
         integration: {
            type: 'widget',
            technology: 'angular'
         },
         features: {
            $schema: 'http://json-schema.org/draft-04/schema#',
            type: 'object',
            additionalProperties: true
         }
      };
      spyOn( testBed.$, 'ajax' ).andCallFake( function( obj ) {
         obj.success( clone( widgetJsonContent ) );
      } );
   }

} );
