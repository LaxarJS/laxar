/**
 * Copyright 2015 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
define( [
   'q_mock',
   '../utilities/assert',
   '../event_bus/event_bus',
   './matchers',
   './http_mock'
], function( qMock, assert, EventBus, matchers, httpMock ) {
   'use strict';

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function createQMock() {
      return qMock;
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function createTickMock() {
      var nextTick = function( callback, timeout ) {
         nextTick.spy();
         return window.setTimeout( callback, timeout || 0 );
      };
      nextTick.spy = jasmine.createSpy( 'nextTickSpy' );
      nextTick.cancel = function( tickRef ) {
         window.clearTimeout( tickRef );
      };
      return nextTick;
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function createEventBusMock() {
      EventBus.init( createQMock(), createTickMock(), createTickMock() );
      jasmine.Clock.useMock();
      var eventBus = EventBus.create();

      spyOn( eventBus, 'subscribe' ).andCallThrough();
      spyOn( eventBus, 'publish' ).andCallThrough();
      spyOn( eventBus, 'publishAndGatherReplies' ).andCallThrough();

      return eventBus;
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function createFileResourceProviderMock( filesByUri ) {
      assert( filesByUri ).hasType( Object ).isNotNull();

      var q = createQMock();
      var mock = {
         isAvailable: function( uri ) {
            return q.when( uri in filesByUri );
         },
         provide: function( uri ) {
            if( !(uri in filesByUri) ) {
               return q.reject();
            }
            var entry = filesByUri[ uri ];
            return q.when( typeof( entry ) === 'string' ? entry : JSON.parse( JSON.stringify( entry ) ) );
         }
      };

      spyOn( mock, 'isAvailable' ).andCallThrough();
      spyOn( mock, 'provide' ).andCallThrough();

      return mock;
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function createHeartbeatMock() {
      var nextTick = createTickMock();

      var beforeNext = [];
      var next = [];
      var afterNext = [];

      function run() {
         [ beforeNext, next, afterNext ].forEach( function( queue ) {
            while( queue.length ) { queue.shift()(); }
         } );
      }

      var mock = {
         onBeforeNext: function( f ) {
            beforeNext.push( f );
         },
         onNext: function( f ) {
            next.push( f );
            nextTick( run );
         },
         onAfterNext: function( f ) {
            afterNext.push( f );
         },
         // Mock only: reset internal state
         _reset: function() {
            beforeNext = [];
            next = [];
            afterNext = [];
         }
      };

      spyOn( mock, 'onNext' ).andCallThrough();
      spyOn( mock, 'onAfterNext' ).andCallThrough();
      spyOn( mock, 'onBeforeNext' ).andCallThrough();

      return mock;
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function createTimestampMock() {
      return jasmine.Clock.installed.nowMillis;
   }

   ////////////////////////////////////////////////////////////////////////////////////////////////////////

   function createControlsServiceMock( mockControls ) {
      mockControls = mockControls || {};
      return {
         load: jasmine.createSpy( 'axControls.load' ).andCallFake( function( controlRef ) {
            var mockDescriptor = mockControls[ controlRef ].descriptor;
            return qMock.when( mockDescriptor ).then( function() {
               return mockDescriptor;
            } );
         } ),
         descriptor: jasmine.createSpy( 'axControls.descriptor' ).andCallFake( function( controlRef ) {
            return mockControls[ controlRef ].descriptor;
         } ),
         provide: jasmine.createSpy( 'axControls.provide' ).andCallFake( function( controlRef ) {
            return mockControls[ controlRef ].module;
         } ),
         resolve: function( controlRef ) {
            return mockControls[ controlRef ].path;
         }
      };
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   return {
      mockQ: createQMock,
      mockTick: createTickMock,
      mockHttp: httpMock.create,
      mockControlsService: createControlsServiceMock,
      mockEventBus: createEventBusMock,
      mockFileResourceProvider: createFileResourceProviderMock,
      mockHeartbeat: createHeartbeatMock,
      mockTimestamp: createTimestampMock,

      any: function() { return matchers.ANY; },
      anyRemaining: function() { return matchers.ANY_REMAINING; },

      addMatchersTo: function( spec ) {
         matchers.addTo( spec );
      }
   };

} );
