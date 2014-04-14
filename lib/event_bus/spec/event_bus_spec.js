/**
 * Copyright 2014 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
define( [
   '../event_bus',
   '../../testing/portal_mocks'
], function( eventBusModule, portalMocks ) {
   'use strict';

   var nextTick;
   var eventBus;

   beforeEach( function() {
      jasmine.Clock.useMock();

      nextTick = portalMocks.mockTick();

      eventBusModule.init( portalMocks.mockQ(), nextTick, nextTick );
      eventBus = eventBusModule.create();
   } );

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   describe( 'An EventBus instance', function() {

      var mySpy;

      beforeEach( function() {
         mySpy = jasmine.createSpy();
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'calls a directly matching subscriber not during the current runloop', function() {
         eventBus.subscribe( 'message.subject', mySpy );
         eventBus.publish( 'message.subject' );

         expect( mySpy ).not.toHaveBeenCalled();
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'eventually calls a directly matching subscriber', function() {
         eventBus.subscribe( 'message.subject', mySpy );
         eventBus.publish( 'message.subject' );

         jasmine.Clock.tick( 0 );

         expect( mySpy ).toHaveBeenCalled();
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'never calls a subscriber that does not match', function() {
         eventBus.subscribe( 'message.other_subject', mySpy );
         eventBus.publish( 'message.subject' );

         jasmine.Clock.tick( 0 );

         expect( mySpy ).not.toHaveBeenCalled();
      } );

   } );

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   describe( 'EventBus publish when called with options', function() {

      describe( 'with option "deliverToSender"', function() {

         var senderSpy;
         var otherSpy;

         beforeEach( function() {
            senderSpy = jasmine.createSpy( 'senderSpy' );
            otherSpy = jasmine.createSpy( 'otherSpy' );

            eventBus.subscribe( 'messageRequest', senderSpy, 'leSender' );
            eventBus.subscribe( 'messageRequest', otherSpy, 'leOtherGuy' );
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'delivers the message to the sender when set to true', function() {
            eventBus.publish( 'messageRequest', { sender: 'leSender' }, { deliverToSender: true } );
            jasmine.Clock.tick( 0 );

            expect( senderSpy ).toHaveBeenCalled();
            expect( otherSpy ).toHaveBeenCalled();
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'delivers the message to the sender by default', function() {
            eventBus.publish( 'messageRequest', { sender: 'leSender' } );
            jasmine.Clock.tick( 0 );

            expect( senderSpy ).toHaveBeenCalled();
            expect( otherSpy ).toHaveBeenCalled();
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'doesn\'t send the message to the sender when set to false', function() {
            eventBus.publish( 'messageRequest', { sender: 'leSender' }, { deliverToSender: false } );
            jasmine.Clock.tick( 0 );

            expect( senderSpy ).not.toHaveBeenCalled();
            expect( otherSpy ).toHaveBeenCalled();
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'doesn\'t send the message to the sender when set to false for publishAndGatherReplies', function() {
            eventBus.publishAndGatherReplies( 'messageRequest', { sender: 'leSender' }, { deliverToSender: false } );
            jasmine.Clock.tick( 0 );

            expect( senderSpy ).not.toHaveBeenCalled();
            expect( otherSpy ).toHaveBeenCalled();
         } );

      } );

   } );

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   describe( 'Errors when calling subscribers', function() {

      var errorHandlerSpy;

      beforeEach( function() {
         errorHandlerSpy = jasmine.createSpy( 'errorHandler' );
         eventBus.setErrorHandler( errorHandlerSpy );
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'can be handled by a custom error handler', function() {
         eventBus.subscribe( 'myEvent', function() {
            throw new Error( 'this is an error' );
         } );
         eventBus.publish( 'myEvent' );

         jasmine.Clock.tick( 0 );

         expect( errorHandlerSpy ).toHaveBeenCalled();
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'do not prevent other subscribers from being called', function() {

         eventBus.subscribe( 'myEvent', function() {
            throw new Error( 'this is an error' );
         } );
         var mySpy = jasmine.createSpy();
         eventBus.subscribe( 'myEvent', mySpy );
         eventBus.publish( 'myEvent' );

         jasmine.Clock.tick( 0 );

         expect( mySpy ).toHaveBeenCalled();
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      describe( 'providing a set of useful information that', function() {

         var errorInformation;

         beforeEach( function() {
            eventBus.subscribe( 'myEvent', function() { throw new Error( 'this is an error' ); }, 'meThrowsError' );
            eventBus.publish( 'myEvent', { sender: 'itsMe!' } );
            jasmine.Clock.tick( 0 );

            errorInformation = errorHandlerSpy.calls[0].args;
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'contains a human readable error message', function() {
            expect( errorInformation[0] ).toEqual(
               'error while calling subscriber "meThrowsError" for event myEvent published by "itsMe!" (subscribed to: myEvent)'
            );
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'contains the exception that was thrown by the subscriber', function() {
            expect( errorInformation[1].Exception.message ).toEqual( 'this is an error' );
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'contains the original event item', function() {
            expect( errorInformation[1]['Published event'].name ).toEqual( 'myEvent' );
            expect( errorInformation[1]['Published event'].sender ).toEqual( 'itsMe!' );
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'contains the information about the subscriber that threw the error', function() {
            expect( errorInformation[1]['Caused by Subscriber'].subscriberName ).toEqual( 'meThrowsError' );
            expect( errorInformation[1]['Caused by Subscriber'].name ).toEqual( 'myEvent' );
         } );

      } );

   } );

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   describe( 'An event bus can have a mediator that', function() {

      it( 'is called before calling subscribers with the current set of queued event items in order they were published', function() {
         var mediatorSpy = jasmine.createSpy();
         eventBus.setMediator( mediatorSpy );

         eventBus.publish( 'myEvent.1' );
         eventBus.publish( 'myEvent.2' );
         eventBus.publish( 'myEvent.3' );

         jasmine.Clock.tick( 0 );

         expect( mediatorSpy ).toHaveBeenCalled();
         expect( mediatorSpy.calls[0].args[0][0].name ).toEqual( 'myEvent.1' );
         expect( mediatorSpy.calls[0].args[0][1].name ).toEqual( 'myEvent.2' );
         expect( mediatorSpy.calls[0].args[0][2].name ).toEqual( 'myEvent.3' );
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'can add event items', function() {
         var mySpy = jasmine.createSpy();

         eventBus.setMediator(  function( eventItems ) {
            return eventItems.concat( [ {
               name: 'myEvent.2',
               data: {
                  key: 'val'
               },
               options: {}
            } ] );
         } );
         eventBus.subscribe( 'myEvent.2', mySpy );
         eventBus.publish( 'myEvent.1' );

         jasmine.Clock.tick( 0 );

         expect( mySpy ).toHaveBeenCalled();
         expect( mySpy.calls[0].args[0].data.key ).toEqual( 'val' );
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'can remove event items', function() {
         var mySpy1 = jasmine.createSpy( 'mySpy1' );
         var mySpy2 = jasmine.createSpy( 'mySpy2' );
         var mySpy3 = jasmine.createSpy( 'mySpy3' );

         eventBus.setMediator( function( eventItems ) {
            var res = [];
            for( var i = 0; i < eventItems.length; ++i ) {
               if( eventItems[ i ].name !== 'myEvent.2' ) {
                  res.push( eventItems[ i ] );
               }
            }
            return res;
         } );
         eventBus.subscribe( 'myEvent.1', mySpy1 );
         eventBus.subscribe( 'myEvent.2', mySpy2 );
         eventBus.subscribe( 'myEvent.3', mySpy3 );
         eventBus.publish( 'myEvent.1' );
         eventBus.publish( 'myEvent.2' );
         eventBus.publish( 'myEvent.3' );

         jasmine.Clock.tick( 0 );

         expect( mySpy1 ).toHaveBeenCalled();
         expect( mySpy2 ).not.toHaveBeenCalled();
         expect( mySpy3 ).toHaveBeenCalled();
      } );

   } );

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   describe( 'an event bus can have an inspector', function() {

      var inspectorSpy;

      beforeEach( function() {
         inspectorSpy = jasmine.createSpy( 'inspector' );
         eventBus.setInspector( inspectorSpy );

         // set an error handler to prevent from spamming the console from internal error reporting
         eventBus.setErrorHandler( function() {} );
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'that is called for every new subscription', function() {
         eventBus.subscribe( 'someEvent', jasmine.createSpy(), 'subscriberX' );

         expect( inspectorSpy ).toHaveBeenCalled();
         expect( inspectorSpy.calls[0].args[0].action ).toEqual( 'subscribe' );
         expect( inspectorSpy.calls[0].args[0].source ).toEqual( 'subscriberX' );
         expect( inspectorSpy.calls[0].args[0].event ).toEqual( 'someEvent' );
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'that is called for every publish', function() {
         eventBus.publish( 'someEvent', {
            data: {
               some: 'payload'
            },
            sender: 'publisherX'
         } );

         expect( inspectorSpy ).toHaveBeenCalled();
         expect( inspectorSpy.calls[0].args[0].action ).toEqual( 'publish' );
         expect( inspectorSpy.calls[0].args[0].source ).toEqual( 'publisherX' );
         expect( inspectorSpy.calls[0].args[0].event ).toEqual( 'someEvent' );
         expect( inspectorSpy.calls[0].args[0].eventObject.data ).toEqual( { some: 'payload' } );
         expect( inspectorSpy.calls[0].args[0].cycleId ).toEqual( 0 );
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'that is called every time an event is delivered to a subscriber', function() {
         eventBus.subscribe( 'someEvent.withSubject', function() {
            throw new Error( 'I have to fail!' );
         }, 'subscriber1' );
         eventBus.subscribe( 'someEvent', jasmine.createSpy(), 'subscriber2' );
         eventBus.publish( 'someEvent.withSubject', {
            data: {
               some: 'payload'
            },
            sender: 'publisherX'
         } );

         jasmine.Clock.tick( 0 );

         expect( inspectorSpy ).toHaveBeenCalled();
         expect( inspectorSpy.calls[3].args[0].action ).toEqual( 'deliver' );
         expect( inspectorSpy.calls[3].args[0].source ).toEqual( 'publisherX' );
         expect( inspectorSpy.calls[3].args[0].target ).toEqual( 'subscriber1' );
         expect( inspectorSpy.calls[3].args[0].event ).toEqual( 'someEvent.withSubject' );
         expect( inspectorSpy.calls[3].args[0].subscribedTo ).toEqual( 'someEvent.withSubject' );
         expect( inspectorSpy.calls[3].args[0].cycleId ).toEqual( 0 );

         expect( inspectorSpy.calls[4].args[0].action ).toEqual( 'deliver' );
         expect( inspectorSpy.calls[4].args[0].source ).toEqual( 'publisherX' );
         expect( inspectorSpy.calls[4].args[0].target ).toEqual( 'subscriber2' );
         expect( inspectorSpy.calls[4].args[0].event ).toEqual( 'someEvent.withSubject' );
         expect( inspectorSpy.calls[4].args[0].subscribedTo ).toEqual( 'someEvent' );
         expect( inspectorSpy.calls[4].args[0].cycleId ).toEqual( 0 );
      } );

   } );

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   describe( 'Publishing without providing an event name', function() {

      it( 'throws an error', function() {
         expect( eventBus.publish ).toThrow();
      } );

   } );

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   describe( 'Subscribing without providing a callback', function() {

      it( 'throws an error', function() {
         expect( eventBus.subscribe ).toThrow();
         expect( function() {
            eventBus.subscribe( '' );
         } ).toThrow();
      } );

   } );

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   describe( 'publishing provides a promise', function() {

      var mySpy;

      beforeEach( function() {
         mySpy = jasmine.createSpy( 'promiseSpy' );
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'that is resolved when there was no matching subscriber', function() {
         var promise = eventBus.publish( 'myEvent' );
         promise.then( mySpy );

         jasmine.Clock.tick( 0 );

         expect( mySpy ).toHaveBeenCalled();
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'that is resolved when there was at least one matching subscriber', function() {
         eventBus.subscribe( 'myEvent', function() {} );
         eventBus.publish( 'myEvent' ).then( mySpy );

         jasmine.Clock.tick( 0 );

         expect( mySpy ).toHaveBeenCalled();
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'that is  only resolved after all subscribers had the chance to publish events on their own', function() {
         var subEventSubscriberCalled = false;
         eventBus.subscribe( 'event', function() {
            eventBus.publish( 'subEvent' );
         } );

         eventBus.subscribe( 'subEvent', function() {
            expect( mySpy ).not.toHaveBeenCalled();
            subEventSubscriberCalled = true;
         } );

         eventBus.publish( 'event' ).then( mySpy );

         jasmine.Clock.tick( 0 );

         expect( subEventSubscriberCalled ).toBe( true );
      } );

   } );

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   describe( 'An EventBus instance where events were published', function() {

      it( 'calls nextTick implementation exactly once during the runloop to schedule queue processing', function() {
         expect( nextTick.spy.callCount ).toEqual( 0 );

         eventBus.publish( 'myEvent' );
         expect( nextTick.spy.callCount ).toEqual( 1 );

         eventBus.publish( 'myEvent2' );
         expect( nextTick.spy.callCount ).toEqual( 1 );
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'should deliver the event object to the subscribers', function() {
         eventBus.subscribe( 'myEvent', function( event ) {
            expect( event ).toBeDefined();
         } );

         eventBus.publish( 'myEvent' );

         jasmine.Clock.tick( 0 );
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'should not deliver an unspecific event to a more specific subscriber', function() {
         var mySpy = jasmine.createSpy();
         eventBus.subscribe( 'firstLevel.secondLevel', mySpy );
         eventBus.publish( 'firstLevel' );

         jasmine.Clock.tick( 0 );

         expect( mySpy ).not.toHaveBeenCalled();
      } );

   } );

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   describe( 'An event object', function() {

      it( 'should contain data sent with publish', function() {
         eventBus.subscribe( 'myEvent', function( event ) {
            expect( event.data.myNumber ).toEqual( 12 );
            expect( event.data.myString ).toEqual( 'Hello' );
         } );

         eventBus.publish( 'myEvent', {
            data: {
               myNumber: 12,
               myString: 'Hello'
            }
         } );

         jasmine.Clock.tick( 0 );
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'should be deeply cloned for each delivery', function() {
         eventBus.subscribe( 'myEvent', function( event ) {
            event.data.x = 42;
         } );
         eventBus.subscribe( 'myEvent', function( event ) {
            expect( event.data.x ).toEqual( 12 );
         } );

         eventBus.publish( 'myEvent', {
            data: {
               x: 12
            }
         } );
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'should be deeply cloned on publish', function() {
         eventBus.subscribe( 'myEvent', function( event ) {
            expect( event.data.x ).toEqual( 12 );
         } );
         var event = {
            data: {
               x: 12
            }
         };
         eventBus.publish( 'myEvent', event );
         event.data.x = 42;
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      describe( 'has a cycleId', function() {

         var mySpy;

         beforeEach( function() {
            mySpy = jasmine.createSpy();

            eventBus.subscribe( 'myEvent', mySpy );
            eventBus.publish( 'myEvent' );
            eventBus.publish( 'myEvent' );

            jasmine.Clock.tick( 0 );
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'that is counted up on each publish', function() {
            expect( mySpy.callCount ).toEqual( 2 );

            expect( mySpy.calls[ 0 ].args[ 0 ].cycleId + 1 ).toEqual( mySpy.calls[ 1 ].args[ 0 ].cycleId );
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         describe( 'when triggered during a delivery', function() {
            var mySpy2;
            var cycleId;

            beforeEach( function() {
               mySpy2 = jasmine.createSpy();

               eventBus.subscribe( 'myEvent2', mySpy2 );
               eventBus.subscribe( 'myEvent1', function( event ) {
                  cycleId = event.cycleId;
                  eventBus.publish( 'myEvent2' );
               } );
               eventBus.publish( 'myEvent1' );

               jasmine.Clock.tick( 0 );
            } );

            //////////////////////////////////////////////////////////////////////////////////////////////////

            it( 'it must have the same cycle id as the event it was delivered on', function() {
               expect( mySpy2.calls[ 0 ].args[ 0 ].cycleId ).toBeDefined();
               expect( mySpy2.calls[ 0 ].args[ 0 ].cycleId ).toEqual( cycleId );
            } );

         } );

      } );

   } );

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   describe( 'An action object', function() {

      it( 'is always send to subscribers additionally to the event object', function() {
         var mySpy = jasmine.createSpy();
         eventBus.subscribe( 'myEvent', mySpy );
         eventBus.publish( 'myEvent' );

         jasmine.Clock.tick( 0 );

         expect( mySpy.calls[ 0 ].args.length ).toBe( 2 );
         expect( mySpy.calls[ 0 ].args[ 1 ] ).toBeDefined();
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'provides a way to directly unsubscribe the called subscriber from this event', function() {
         var calls = 0;
         eventBus.subscribe( 'myEvent', function( event, actions ) {
            ++calls;
            actions.unsubscribe();
         } );
         eventBus.publish( 'myEvent' );
         jasmine.Clock.tick( 0 );

         eventBus.publish( 'myEvent' );
         jasmine.Clock.tick( 0 );

         expect( calls ).toEqual( 1 );
      } );

   } );

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   describe( 'Subscribe allows wildcards', function() {

      var mySpy;

      beforeEach( function() {
         mySpy = jasmine.createSpy();
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'at the end of the event name', function() {
         eventBus.subscribe( 'firstLevel.secondLevel', mySpy );
         eventBus.publish( 'firstLevel.secondLevel.thirdLevel' );

         jasmine.Clock.tick( 0 );

         expect( mySpy ).toHaveBeenCalled();
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'at the beginning of the event name', function() {
         eventBus.subscribe( '.secondLevel.thirdLevel', mySpy );
         eventBus.publish( 'firstLevel.secondLevel.thirdLevel' );

         jasmine.Clock.tick( 0 );

         expect( mySpy ).toHaveBeenCalled();
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'anywhere in the event name', function() {
         eventBus.subscribe( 'firstLevel..thirdLevel', mySpy );
         eventBus.publish( 'firstLevel.secondLevel.thirdLevel' );

         jasmine.Clock.tick( 0 );

         expect( mySpy ).toHaveBeenCalled();
      } );

      ///////////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'as the empty string in the subscriber', function() {
         eventBus.subscribe( '', mySpy );
         eventBus.publish( 'myEvent' );

         jasmine.Clock.tick( 0 );

         expect( mySpy ).toHaveBeenCalled();
      } );

   } );

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   describe( 'Subscribe allows inner wildcards', function() {

      var mySpy;

      beforeEach( function() {
         mySpy = jasmine.createSpy();
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'using minus', function() {
         eventBus.subscribe( 'firstLevel.secondLevel.thirdLevel', mySpy );
         eventBus.publish( 'firstLevel-here.secondLevel.thirdLevel' );

         jasmine.Clock.tick( 0 );

         expect( mySpy ).toHaveBeenCalled();
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'using minus combined with wildcards', function() {
         eventBus.subscribe( 'firstLevel..thirdLevel', mySpy );
         eventBus.publish( 'firstLevel.secondLevel.thirdLevel-here' );

         jasmine.Clock.tick( 0 );

         expect( mySpy ).toHaveBeenCalled();
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'using minus with wildcards only', function() {
         eventBus.subscribe( 'firstLevel', mySpy );
         eventBus.publish( 'firstLevel.secondLevel.thirdLevel-here' );

         jasmine.Clock.tick( 0 );

         expect( mySpy ).toHaveBeenCalled();
      } );

   } );

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   describe( 'An event bus with different subscribers', function() {

      var calls;

      beforeEach( function() {
         calls = [];
         function subscribe( eventName ) {
            eventBus.subscribe( eventName,function() {
               calls.push( eventName );
            } );
         }

         subscribe( 'topic1.topic2' );
         subscribe( 'topic1' );
         subscribe( 'topic1.topic2-sub2.topic3' );
         subscribe( '' );
         subscribe( '.topic2' );
         subscribe( 'topic1.topic2.topic3-sub3' );
         subscribe( 'topic1-sub1.topic2-sub2' );
         subscribe( 'topic1-sub1.topic2' );
         subscribe( 'topic1.topic2.topic3' );

         eventBus.publish( 'topic1-sub1.topic2-sub2.topic3-sub3' );
         jasmine.Clock.tick( 0 );
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'delivers events to the most specific subscribers first', function() {
         var i = 0;
         expect( calls[i++] ).toEqual( 'topic1.topic2-sub2.topic3' );
         expect( calls[i++] ).toEqual( 'topic1.topic2.topic3-sub3' );
         expect( calls[i++] ).toEqual( 'topic1.topic2.topic3' );
         expect( calls[i++] ).toEqual( 'topic1-sub1.topic2-sub2' );
         expect( calls[i++] ).toEqual( 'topic1-sub1.topic2' );
         expect( calls[i++] ).toEqual( 'topic1.topic2' );
         expect( calls[i++] ).toEqual( 'topic1' );
         expect( calls[i++] ).toEqual( '.topic2' );
         expect( calls[i++] ).toEqual( '' );
      } );

   } );

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   describe( 'An event bus supports a request-will-did pattern', function() {

      var mySpy;

      beforeEach( function() {
         mySpy = jasmine.createSpy();

         eventBus.subscribe( 'doSomethingWrong', function() {
            eventBus.publish( 'willDoSomethingWrong' );
            eventBus.publish( 'didDoSomethingWrong' );
         } );
         eventBus.subscribe( 'doSomethingAsyncRequest', function() {
            eventBus.publish( 'willDoSomethingAsync', { sender: 'asyncSender' } );
            window.setTimeout( function() {
               eventBus.publish( 'didDoSomethingAsync.andItWorked', { sender: 'asyncSender' } );
            }, 10 );
         } );
         eventBus.subscribe( 'doSomethingSyncRequest', function() {
            eventBus.publish( 'willDoSomethingSync', { sender: 'syncSender' }  );
            eventBus.publish( 'didDoSomethingSync.andItWorked', { sender: 'syncSender' }  );
         } );
         eventBus.subscribe( 'doSomethingSyncRequest.subTopic', function() {
            eventBus.publish( 'willDoSomethingSync.subTopic', { sender: 'syncSender' }  );
            eventBus.publish( 'didDoSomethingSync.subTopic.andItWorked', { sender: 'syncSender' }  );
         } );
         eventBus.subscribe( 'doSomethingWithoutWillRequest', function() {
            eventBus.publish( 'willDoSomethingWithoutWill', { sender: 'asyncSender' } );
            window.setTimeout( function() {
               eventBus.publish( 'didDoSomethingWithoutWill.andItWorked', { sender: 'asyncSender' } );
            }, 10 );
            eventBus.publish( 'didDoSomethingWithoutWill.andItWorked', { sender: 'syncSender' }  );
         } );
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'throws when the event name does not end with "Request"', function() {
         expect( function() {
            eventBus.publishAndGatherReplies( 'wronglyNamedEvent' );
         } ).toThrow();
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'throws when a "will"-response comes without sender', function() {
         expect( function() {
            eventBus.publishAndGatherReplies( 'doSomethingWrong' );
         } ).toThrow();
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'accepts if there is a subject part after the "Request"', function() {
         expect( function() {
            eventBus.publishAndGatherReplies( 'mySimpleRequest.someSubject' );
         } ).not.toThrow();
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'whose promise is resolved only after all will-did replies were given asynchronously', function() {
         eventBus.publishAndGatherReplies( 'doSomethingAsyncRequest' ).then( mySpy );

         jasmine.Clock.tick( 11 );

         expect( mySpy ).toHaveBeenCalled();
         expect( mySpy.calls[0].args[0].length ).toEqual( 1 );
         expect( mySpy.calls[0].args[0][0].name ).toEqual( 'didDoSomethingAsync.andItWorked' );
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'whose promise is resolved only after all will-did replies were given synchronously', function() {
         eventBus.publishAndGatherReplies( 'doSomethingSyncRequest' ).then( mySpy );

         jasmine.Clock.tick( 0 );

         expect( mySpy ).toHaveBeenCalled();
         expect( mySpy.calls[0].args[0].length ).toEqual( 1 );
         expect( mySpy.calls[0].args[0][0].name ).toEqual( 'didDoSomethingSync.andItWorked' );
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'whose promise is resolved after synchronous dids without wills, combined with asynchronous dids', function() {
         eventBus.publishAndGatherReplies( 'doSomethingWithoutWillRequest' ).then( mySpy );

         jasmine.Clock.tick( 11 );

         expect( mySpy ).toHaveBeenCalled();
         expect( mySpy.calls[0].args[0].length ).toEqual( 2 );
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'only listens to did/will answers for the given subject', function() {
         eventBus.subscribe( 'doSomethingSyncRequest', function() {
            eventBus.publish( 'willDoSomethingSync.subTopic', { sender: 'syncSender' } );
            eventBus.publish( 'didDoSomethingSync.subTopic.andItDidntWork', { sender: 'syncSender' } );
         } );

         eventBus.publishAndGatherReplies( 'doSomethingSyncRequest.subTopic' ).then( mySpy );

         jasmine.Clock.tick( 0 );

         expect( mySpy ).toHaveBeenCalled();
         expect( mySpy.calls[0].args[0].length ).toEqual( 2 );
         expect( mySpy.calls[0].args[0][0].name ).toEqual( 'didDoSomethingSync.subTopic.andItWorked' );
         expect( mySpy.calls[0].args[0][1].name ).toEqual( 'didDoSomethingSync.subTopic.andItDidntWork' );
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'resolves even if no one answered the request', function() {
         eventBus.publishAndGatherReplies( 'myUnknownRequest' ).then( mySpy );

         jasmine.Clock.tick( 0 );

         expect( mySpy ).toHaveBeenCalled();
         expect( mySpy.calls[0].args[0].length ).toEqual( 0 );
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      describe( 'when a collaborator does not send a did after will within a given timeout', function() {

         var errorHandlerSpy;

         beforeEach( function() {
            errorHandlerSpy = jasmine.createSpy( 'errorHandlerSpy' );
            eventBus = eventBusModule.create( {
               pendingDidTimeout: 1000
            } );
            eventBus.setErrorHandler( errorHandlerSpy );

            eventBus.subscribe( 'doSomethingWithTimeoutRequest', function() {
               eventBus.publish( 'willDoSomethingWithTimeout', { sender: 'sender1' } );
               eventBus.publish( 'willDoSomethingWithTimeout', { sender: 'sender2' } );
               setTimeout( function() {
                  eventBus.publish( 'didDoSomethingWithTimeout', { sender: 'sender1' } );
               }, 10 );
            } );

            eventBus.publishAndGatherReplies( 'doSomethingWithTimeoutRequest' ).then( mySpy );
            jasmine.Clock.tick( 11 );
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'the promise is still resolved with all results available up to the timeout', function() {
            expect( mySpy ).not.toHaveBeenCalled();

            jasmine.Clock.tick( 1000 );

            expect( mySpy ).toHaveBeenCalled();
            expect( mySpy.calls[0].args[0].length ).toEqual( 1 );
            expect( mySpy.calls[0].args[0][0].sender ).toEqual( 'sender1' );
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'reports the issue to the error handler', function() {
            jasmine.Clock.tick( 1000 );

            expect( mySpy ).toHaveBeenCalled();
            expect( errorHandlerSpy ).toHaveBeenCalled();
         } );

      } );

   } );

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   describe( 'EventBus unsubscribing', function() {

      var subscriberSpy;

      beforeEach( function() {
         subscriberSpy = jasmine.createSpy();

         eventBus.subscribe( 'myEvent', subscriberSpy );
         eventBus.subscribe( 'myEvent.subitem', subscriberSpy );
         eventBus.subscribe( '.subitem', subscriberSpy );
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'throws if the callback is no function', function() {
         expect( eventBus.unsubscribe ).toThrow();
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'removes it from all subscribed events', function() {
         eventBus.unsubscribe( subscriberSpy );

         eventBus.publish( 'myEvent' );
         eventBus.publish( 'myEvent.subitem' );

         jasmine.Clock.tick( 0 );

         expect( subscriberSpy ).not.toHaveBeenCalled();
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'ignores successive calls to unsubscribe', function() {
         eventBus.unsubscribe( subscriberSpy );
         eventBus.unsubscribe( subscriberSpy );

         eventBus.publish( 'myEvent' );

         jasmine.Clock.tick( 0 );

         expect( subscriberSpy ).not.toHaveBeenCalled();
      } );

   } );

} );