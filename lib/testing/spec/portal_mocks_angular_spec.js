/**
 * Copyright 2014 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
define( [
   'angular',
   'jquery',
   '../portal_mocks_angular'
], function( angular, $, portalMocksAngular ) {
   'use strict';

   describe( 'For a ControllerTestBed which is set up', function() {

      var testBed;
      var watchSpy;
      var controllerSpy;

      beforeEach( function() {
         watchSpy = jasmine.createSpy( 'watchSpy' );
         controllerSpy = jasmine.createSpy( 'controllerSpy' );

         createAngularModule( watchSpy, controllerSpy );
         testBed = portalMocksAngular.createControllerTestBed( 'magic.fantasy_widget' );
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
         expect( testBed.scope.id( 'locallyUnique' ) ).toEqual( 'widget__testWidgetId_locallyUnique' );
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'links the message bus mock to the scope', function() {
         expect( testBed.scope.eventBus );
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'instantiates the controller with the testbed scope', function() {
         expect( controllerSpy ).toHaveBeenCalledWith( testBed.scope, jasmine.any( Object ) );
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
               .toHaveBeenCalledWith( 'myMessage', { sender: jasmine.any( String ) }, { deliverToSender: false } );
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'on publishAndGatherReplies passes all parameters to the underlying message bus mock (jira ATP-6747)', function() {
            testBed.scope.eventBus.publishAndGatherReplies( 'myRequest', {}, { deliverToSender: false } );

            expect( testBed.eventBusMock.publishAndGatherReplies )
               .toHaveBeenCalledWith( 'myRequest', { sender: jasmine.any( String ) }, { deliverToSender: false } );
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

   describe( 'A ControllerTestBed', function() {

      var testBed;
      var controllerSpy;

      beforeEach( function() {
         controllerSpy = jasmine.createSpy( 'controllerSpy' );

         createAngularModule( null, controllerSpy );

         testBed = portalMocksAngular.createControllerTestBed( 'magic.fantasy_widget' );
         testBed.featuresMock = {
            myFeature: 12
         };
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

      it( 'copies over a mocked widget to the widget scope', function() {
         testBed.widgetMock = { id: 'helloId', specification: { name: 'helloName'} };
         testBed.setup();
         expect( testBed.scope.widget ).toEqual( { id: 'helloId', specification: { name: 'helloName'} } );
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'uses mocked injections for the controller', function() {
         var fakedQ = { faked: 'q' };
         testBed.injections = {
            $q: fakedQ
         };
         testBed.setup();
         expect( controllerSpy ).toHaveBeenCalledWith( jasmine.any( Object ), fakedQ );
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      describe( 'when asked to use the real widget specification file', function() {

         var widgetJsonContent;

         beforeEach( function() {
            widgetJsonContent = {
               integration: {
                  type: 'angular'
               },
               features: {
                  something: {
                     type: 'object',
                     properties: {
                        enabled: {
                           type: 'boolean',
                           'default': true
                        },
                        action: {
                           type: 'string',
                           required: true
                        }
                     }
                  }
               }
            };

            spyOn( $, 'ajax' ).andCallFake( function( obj ) {
               obj.success( clone( widgetJsonContent ) );
            } );
            
            testBed.useWidgetJson();
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'populates the widget spec with the data found', function() {
            expect( testBed.widgetMock.specification ).toEqual( widgetJsonContent );
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

   describe( 'mockWidget', function() {

      var widgetMock;

      beforeEach( function() {
         widgetMock = portalMocksAngular.mockWidget();
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'returns a simple widget stub', function() {
         expect( widgetMock ).toEqual( {
            id: 'testWidgetId',
            specification: {
               name: 'test/test_widget',
               description: 'test widget',
               integration: {
                  type: 'angular'
               }
            }
         } );
      } );

   } );

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function createAngularModule( modelWatchSpy, controllerSpy ) {
      angular
         .module( 'magic.fantasy_widget', [] )
         .controller( 'magic.fantasy_widget.Controller', function( $scope, $q ) {
            if( controllerSpy ) {
               controllerSpy.apply( {}, arguments );
            }

            $scope.myModel = 10;
            $scope.$watch( 'myModel', modelWatchSpy || function() {} );

            $scope.eventBus.subscribe( 'message', function() {
               $scope.myModel = 12;
            } );
         } );
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function clone( obj ) {
      return JSON.parse( JSON.stringify( obj ) );
   }

} );