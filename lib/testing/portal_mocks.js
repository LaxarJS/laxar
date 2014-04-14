/**
 * Copyright 2014 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
define( [
   'q_mock',
   '../event_bus/event_bus',
   './matchers',
   './http_mock'
], function( qMock, EventBus, matchers, httpMock ) {
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

   return {
      mockQ: createQMock,
      mockTick: createTickMock,
      mockHttp: httpMock.create,
      mockEventBus: createEventBusMock,

      any: function() { return matchers.ANY; },
      anyRemaining: function() { return matchers.ANY_REMAINING; },

      addMatchersTo: function( spec ) {
         matchers.addTo( spec );
      }
   };

} );
