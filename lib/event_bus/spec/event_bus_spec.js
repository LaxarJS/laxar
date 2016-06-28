/**
 * Copyright 2016 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
import { create as createEventBus, createLogErrorHandler } from '../event_bus';
import { create as createBrowserMock } from '../../testing/browser_mock';
import { create as createLogMock } from '../../testing/log_mock';

let nextTick;
let browserMock;
let eventBus;

const setup = () => {
   nextTick = jasmine.createSpy( 'nextTick' ).and.callFake( f => setTimeout( f, 0 ) );
   browserMock = createBrowserMock();
   eventBus = createEventBus( nextTick, setTimeout, browserMock );
};

///////////////////////////////////////////////////////////////////////////////////////////////////////////

describe( 'An EventBus instance', () => {

   beforeEach( setup );

   let mySpy;

   beforeEach( () => {
      mySpy = jasmine.createSpy();
   } );

   ////////////////////////////////////////////////////////////////////////////////////////////////////////

   it( 'calls a directly matching subscriber not during the current runloop', () => {
      eventBus.subscribe( 'message.subject', mySpy );
      eventBus.publish( 'message.subject' );

      expect( mySpy ).not.toHaveBeenCalled();
   } );

   ////////////////////////////////////////////////////////////////////////////////////////////////////////

   it( 'eventually calls a directly matching subscriber', done => {
      eventBus.subscribe( 'message.subject', mySpy );
      eventBus.publish( 'message.subject' )
         .then( () => { expect( mySpy ).toHaveBeenCalled(); } )
         .then( done );
   } );

   ////////////////////////////////////////////////////////////////////////////////////////////////////////

   it( 'never calls a subscriber that does not match', done => {
      eventBus.subscribe( 'message.other_subject', mySpy );
      eventBus.publish( 'message.subject' )
         .then( () => { expect( mySpy ).not.toHaveBeenCalled(); } )
         .then( done );
   } );

} );

///////////////////////////////////////////////////////////////////////////////////////////////////////////

describe( 'EventBus publish when called with options', () => {

   beforeEach( setup );

   describe( 'with option "deliverToSender"', () => {

      let senderSpy;
      let otherSpy;

      beforeEach( () => {
         senderSpy = jasmine.createSpy( 'senderSpy' );
         otherSpy = jasmine.createSpy( 'otherSpy' );

         eventBus.subscribe( 'messageRequest', senderSpy, { subscriber: 'leSender' } );
         eventBus.subscribe( 'messageRequest', otherSpy, { subscriber: 'leOtherGuy' } );
      } );

      /////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'delivers the message to the sender when set to true', done => {
         eventBus.publish( 'messageRequest', {}, {
            sender: 'leSender',
            deliverToSender: true
         } )
         .then( () => {
            expect( senderSpy ).toHaveBeenCalled();
            expect( otherSpy ).toHaveBeenCalled();
         } )
         .then( done );
      } );

      /////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'delivers the message to the sender by default', done => {
         eventBus.publish( 'messageRequest', {}, {
            sender: 'leSender'
         } )
         .then( () => {
            expect( senderSpy ).toHaveBeenCalled();
            expect( otherSpy ).toHaveBeenCalled();
         } )
         .then( done );
      } );

      /////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'doesn\'t send the message to the sender when set to false', done => {
         eventBus.publish( 'messageRequest', {}, {
            deliverToSender: false,
            sender: 'leSender'
         } )
         .then( () => {
            expect( senderSpy ).not.toHaveBeenCalled();
            expect( otherSpy ).toHaveBeenCalled();
         } )
         .then( done );
      } );

      /////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'doesn\'t send the message to the sender when set to false for publishAndGatherReplies', done => {
         eventBus.publishAndGatherReplies( 'messageRequest', {}, {
            deliverToSender: false,
            sender: 'leSender'
         } )
         .then( () => {
            expect( senderSpy ).not.toHaveBeenCalled();
            expect( otherSpy ).toHaveBeenCalled();
         } )
         .then( done, done.fail );
      } );

   } );

} );

///////////////////////////////////////////////////////////////////////////////////////////////////////////

describe( 'Errors when calling subscribers', () => {

   beforeEach( setup );

   let errorHandlerSpy;

   beforeEach( () => {
      errorHandlerSpy = jasmine.createSpy( 'errorHandler' );
      eventBus.setErrorHandler( errorHandlerSpy );
   } );

   ////////////////////////////////////////////////////////////////////////////////////////////////////////

   it( 'can be handled by a custom error handler', done => {
      eventBus.subscribe( 'myEvent', () => {
         throw new Error( 'this is an error' );
      } );
      eventBus.publish( 'myEvent' )
         .then( () => { expect( errorHandlerSpy ).toHaveBeenCalled(); } )
         .then( done );
   } );

   ////////////////////////////////////////////////////////////////////////////////////////////////////////

   it( 'do not prevent other subscribers from being called', done => {
      eventBus.subscribe( 'myEvent', () => {
         throw new Error( 'this is an error' );
      } );
      const mySpy = jasmine.createSpy();
      eventBus.subscribe( 'myEvent', mySpy );
      eventBus.publish( 'myEvent' )
         .then( () => { expect( mySpy ).toHaveBeenCalled(); } )
         .then( done );
   } );

   ////////////////////////////////////////////////////////////////////////////////////////////////////////

   describe( 'include a set of useful information that', () => {

      let errorInformation;

      beforeEach( done => {
         eventBus.subscribe( 'myEvent', () => {
            throw new Error( 'this is an error' );
         }, { subscriber: 'meThrowsError' } );
         eventBus.publish( 'myEvent', { payload: true }, { sender: 'itsMe!' } )
            .then( () => { errorInformation = errorHandlerSpy.calls.argsFor( 0 ); } )
            .then( done );
      } );

      /////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'contains a human readable error message', () => {
         expect( errorInformation[0] ).toEqual(
            'error while calling subscriber "meThrowsError" for event myEvent published by "itsMe!" (subscribed to: myEvent)'
         );
      } );

      /////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'contains the exception that was thrown by the subscriber', () => {
         expect( errorInformation[1].Exception.message ).toEqual( 'this is an error' );
      } );

      /////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'contains the original event item', () => {
         expect( errorInformation[1]['Published event'] ).toEqual( { payload: true } );
      } );

      /////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'contains the meta information', () => {
         expect( errorInformation[1]['Event meta information'] ).toEqual( {
            cycleId: 0,
            initiator: null,
            name: 'myEvent',
            options: {
               deliverToSender: true,
               sender: 'itsMe!'
            },
            sender: 'itsMe!'
         } );
      } );

      /////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'contains the information about the subscriber that threw the error', () => {
         expect( errorInformation[1]['Caused by Subscriber'].subscriberName ).toEqual( 'meThrowsError' );
         expect( errorInformation[1]['Caused by Subscriber'].name ).toEqual( 'myEvent' );
      } );

   } );

   ////////////////////////////////////////////////////////////////////////////////////////////////////////

   describe( 'can be processed by a log-using error handler', () => {

      let logMock;

      beforeEach( done => {
         logMock = createLogMock();
         const handler = createLogErrorHandler( logMock );
         eventBus.setErrorHandler( handler );
         eventBus.subscribe( 'message', () => { throw new Error( 'error' ); } );
         eventBus.publish( 'message', { data: '' } )
            .then( done );
      } );

      /////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'that uses the (services) logger ', () => {
         expect( logMock.error ).toHaveBeenCalled();
      } );

      /////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'that marks the event object for anonymization in the log message', () => {
         const eventMessageCall = logMock.error.calls.all()
            .filter( call => call.args[1] === 'Published event' ).pop();

         expect( eventMessageCall.args[0] ).toEqual( '   - [0]: [1:%o:anonymize]' );
      } );

   } );

} );

///////////////////////////////////////////////////////////////////////////////////////////////////////////

describe( 'An event bus can have a mediator that', () => {

   beforeEach( setup );

   it( 'is called before calling subscribers with the current set of queued event items in order they were published', done => {
      const mediatorSpy = jasmine.createSpy().and.callFake( _ => _ );
      eventBus.setMediator( mediatorSpy );

      Promise.all( [
         eventBus.publish( 'myEvent.1' ),
         eventBus.publish( 'myEvent.2' ),
         eventBus.publish( 'myEvent.3' ),
      ] )
      .then( () => {
         const [ callOne, callTwo, callThree ] = mediatorSpy.calls.argsFor(0);
         expect( mediatorSpy ).toHaveBeenCalled();
         expect( callOne.meta.name ).toEqual( 'myEvent.1' );
         expect( callTwo.meta.name ).toEqual( 'myEvent.2' );
         expect( callThree.meta.name ).toEqual( 'myEvent.3' );
      } )
      .then( done, done );
   } );

   ////////////////////////////////////////////////////////////////////////////////////////////////////////

   it( 'can add event items', done => {
      const mySpy = jasmine.createSpy();

      eventBus.setMediator( eventItems => {
         return eventItems.concat( [ {
            meta: {
               name: 'myEvent.2',
               options: {}
            },
            event: {
               data: {
                  key: 'val'
               }
            },
            resolvePublish: () => {}
         } ] );
      } );
      eventBus.subscribe( 'myEvent.2', mySpy );
      eventBus.publish( 'myEvent.1' )
         .then( () => {
            expect( mySpy ).toHaveBeenCalled();
            expect( mySpy.calls.argsFor( 0 )[0].data.key ).toEqual( 'val' );
         } )
         .then( done );
   } );

   ////////////////////////////////////////////////////////////////////////////////////////////////////////

   it( 'can remove event items', done => {
      const mySpy1 = jasmine.createSpy( 'mySpy1' );
      const mySpy2 = jasmine.createSpy( 'mySpy2' );
      const mySpy3 = jasmine.createSpy( 'mySpy3' );

      eventBus.setMediator( eventItems => {
         return eventItems.filter( item => item.meta.name !== 'myEvent.2' );
      } );
      eventBus.subscribe( 'myEvent.1', mySpy1 );
      eventBus.subscribe( 'myEvent.2', mySpy2 );
      eventBus.subscribe( 'myEvent.3', mySpy3 );

      // TODO (#308) deferred of this event will never be resolved, since the mediator removes it from
      // the queue. For LaxarJS 2.0.0 we want to remove the mediator api, hence this quirky test will vanish
      eventBus.publish( 'myEvent.2' );
      Promise.all( [
         eventBus.publish( 'myEvent.1' ),
         eventBus.publish( 'myEvent.3' ),
      ] )
      .then( () => {
         expect( mySpy1 ).toHaveBeenCalled();
         expect( mySpy2 ).not.toHaveBeenCalled();
         expect( mySpy3 ).toHaveBeenCalled();
      } )
      .then( done );
   } );

} );

///////////////////////////////////////////////////////////////////////////////////////////////////////////

describe( 'an event bus can have inspectors', () => {

   beforeEach( setup );

   let inspectorSpy1;
   let inspectorSpy2;
   let removeFunction;
   let eventObject;

   beforeEach( () => {
      inspectorSpy1 = jasmine.createSpy( 'inspector1' );
      inspectorSpy2 = jasmine.createSpy( 'inspector2' );
      removeFunction = eventBus.addInspector( inspectorSpy1 );
      eventBus.addInspector( inspectorSpy2 );

      // set an error handler to prevent from spamming the console from internal error reporting
      eventBus.setErrorHandler( () => {} );

      eventObject = {
         data: {
            some: 'payload'
         }
      };
   } );

   ////////////////////////////////////////////////////////////////////////////////////////////////////////

   it( 'that are called for every new subscription', () => {
      eventBus.subscribe( 'someEvent', jasmine.createSpy(), { subscriber: 'subscriberX' } );

      const inspectionObject = {
         action: 'subscribe',
         source: 'subscriberX',
         target: '-',
         event: 'someEvent',
         cycleId: jasmine.any( Number )
      };
      expect( inspectorSpy1 ).toHaveBeenCalledWith( inspectionObject );
      expect( inspectorSpy2 ).toHaveBeenCalledWith( inspectionObject );
   } );

   ////////////////////////////////////////////////////////////////////////////////////////////////////////

   it( 'that are called for every publish', () => {
      eventBus.publish( 'someEvent', eventObject, { sender: 'publisherX' } );

      const inspectionObject = {
         action: 'publish',
         source: 'publisherX',
         target: '-',
         event: 'someEvent',
         eventObject: eventObject,
         cycleId: jasmine.any( Number )
      };
      expect( inspectorSpy1 ).toHaveBeenCalledWith( inspectionObject );
      expect( inspectorSpy2 ).toHaveBeenCalledWith( inspectionObject );
   } );

   ////////////////////////////////////////////////////////////////////////////////////////////////////////

   it( 'that are called every time an event is delivered to a subscriber', done => {
      const inspectionObject = {
         action: 'deliver',
         source: 'publisherX',
         target: 'subscriber1',
         event: 'someEvent.withSubject',
         eventObject: eventObject,
         subscribedTo: 'someEvent.withSubject',
         cycleId: jasmine.any( Number )
      };

      eventBus.subscribe( 'someEvent.withSubject', () => {
         throw new Error( 'I have to fail!' );
      }, { subscriber: 'subscriber1' } );
      eventBus.subscribe( 'someEvent', jasmine.createSpy(), { subscriber: 'subscriber2' } );
      eventBus.publish( 'someEvent.withSubject', eventObject, { sender: 'publisherX' } )
         .then( () => {
            expect( inspectorSpy1 ).toHaveBeenCalledWith( inspectionObject );
            expect( inspectorSpy2 ).toHaveBeenCalledWith( inspectionObject );
         } )
         .then( () => {
            inspectionObject.target = 'subscriber2';
            inspectionObject.subscribedTo = 'someEvent';

            expect( inspectorSpy1 ).toHaveBeenCalledWith( inspectionObject );
            expect( inspectorSpy2 ).toHaveBeenCalledWith( inspectionObject );
         } )
         .then( done );
   } );

   ////////////////////////////////////////////////////////////////////////////////////////////////////////

   it( 'that are called on every unsubscribe (#20)', () => {
      const subscriber = jasmine.createSpy();
      eventBus.subscribe( 'someEvent', subscriber, { subscriber: 'subscriberX' } );

      eventBus.unsubscribe( subscriber );

      const inspectionObject = {
         action: 'unsubscribe',
         source: 'subscriberX',
         target: '-',
         event: 'someEvent',
         cycleId: jasmine.any( Number )
      };
      expect( inspectorSpy1 ).toHaveBeenCalledWith( inspectionObject );
      expect( inspectorSpy2 ).toHaveBeenCalledWith( inspectionObject );
   } );

   ////////////////////////////////////////////////////////////////////////////////////////////////////////

   it( 'that can be removed via its remove function', () => {
      removeFunction();

      eventBus.subscribe( 'someEvent', jasmine.createSpy(), { subscriber: 'subscriberX' } );

      const inspectionObject = {
         action: 'subscribe',
         source: 'subscriberX',
         target: '-',
         event: 'someEvent',
         cycleId: jasmine.any( Number )
      };
      expect( inspectorSpy1 ).not.toHaveBeenCalled();
      expect( inspectorSpy2 ).toHaveBeenCalledWith( inspectionObject );
   } );

} );

///////////////////////////////////////////////////////////////////////////////////////////////////////////

describe( 'Publishing without providing an event name', () => {

   beforeEach( setup );

   it( 'throws an error', () => {
      expect( eventBus.publish ).toThrow();
   } );

} );

///////////////////////////////////////////////////////////////////////////////////////////////////////////

describe( 'Subscribing without providing a callback', () => {

   beforeEach( setup );

   it( 'throws an error', () => {
      expect( eventBus.subscribe ).toThrow();
      expect( () => {
         eventBus.subscribe( '' );
      } ).toThrow();
   } );

} );

///////////////////////////////////////////////////////////////////////////////////////////////////////////

describe( 'publishing provides a promise', () => {

   beforeEach( setup );

   let mySpy;

   beforeEach( () => {
      mySpy = jasmine.createSpy( 'promiseSpy' );
   } );

   ////////////////////////////////////////////////////////////////////////////////////////////////////////

   it( 'that is resolved when there was no matching subscriber', done => {
      eventBus.publish( 'myEvent' )
         .then( mySpy )
         .then( () => {
            expect( mySpy ).toHaveBeenCalled();
         } )
         .then( done );
   } );

   ////////////////////////////////////////////////////////////////////////////////////////////////////////

   it( 'that is resolved when there was at least one matching subscriber', done => {
      eventBus.subscribe( 'myEvent', () => {} );
      eventBus.publish( 'myEvent' )
         .then( mySpy )
         .then( () => {
            expect( mySpy ).toHaveBeenCalled();
         } )
         .then( done );
   } );

   ////////////////////////////////////////////////////////////////////////////////////////////////////////

   it( 'that is only resolved after all subscribers had the chance to publish events on their own', done => {
      let subEventSubscriberCalled = false;
      eventBus.subscribe( 'event', () => {
         eventBus.publish( 'subEvent' );
      } );

      eventBus.subscribe( 'subEvent', () => {
         expect( mySpy ).not.toHaveBeenCalled();
         subEventSubscriberCalled = true;
      } );

      eventBus.publish( 'event' )
         .then( mySpy )
         .then( () => { expect( subEventSubscriberCalled ).toBe( true ); } )
         .then( done );
   } );

} );

///////////////////////////////////////////////////////////////////////////////////////////////////////////

describe( 'An EventBus instance where events were published', () => {

   beforeEach( setup );

   it( 'calls nextTick implementation exactly once during the runloop to schedule queue processing', () => {
      expect( nextTick.calls.count() ).toEqual( 0 );

      eventBus.publish( 'myEvent' );
      expect( nextTick.calls.count() ).toEqual( 1 );

      eventBus.publish( 'myEvent2' );
      expect( nextTick.calls.count() ).toEqual( 1 );
   } );

   ////////////////////////////////////////////////////////////////////////////////////////////////////////

   it( 'should deliver the event object to the subscribers', done => {
      eventBus.subscribe( 'myEvent', function( event ) {
         expect( event ).toBeDefined();
         done();
      } );
      eventBus.publish( 'myEvent' );
   } );

   ////////////////////////////////////////////////////////////////////////////////////////////////////////

   it( 'should not deliver an unspecific event to a more specific subscriber', done => {
      const mySpy = jasmine.createSpy();
      eventBus.subscribe( 'firstLevel.secondLevel', mySpy );
      eventBus.publish( 'firstLevel' )
         .then( () => { expect( mySpy ).not.toHaveBeenCalled(); } )
         .then( done );
   } );

} );

///////////////////////////////////////////////////////////////////////////////////////////////////////////

describe( 'An event object', () => {

   beforeEach( setup );

   it( 'should contain data sent with publish', done => {
      eventBus.subscribe( 'myEvent', function( event ) {
         expect( event.data.myNumber ).toEqual( 12 );
         expect( event.data.myString ).toEqual( 'Hello' );
         done();
      } );
      eventBus.publish( 'myEvent', {
         data: {
            myNumber: 12,
            myString: 'Hello'
         }
      } );
   } );

   ////////////////////////////////////////////////////////////////////////////////////////////////////////

   it( 'should be deeply cloned on publish', done => {
      eventBus.subscribe( 'myEvent', function( event ) {
         expect( event.data.x ).toEqual( 12 );
         done();
      } );
      const event = {
         data: {
            x: 12
         }
      };
      eventBus.publish( 'myEvent', event );
      event.data.x = 42;
   } );

   ////////////////////////////////////////////////////////////////////////////////////////////////////////

   describe( 'where the subscriber requests cloning', () => {

      let data;
      beforeEach( () => {
         eventBus.subscribe( 'myEvent', function( event ) {
            event.data.x = 42;
         }, { clone: true } );
         eventBus.subscribe( 'myEvent', function( event ) {
            data = event.data;
         }, { clone: true } );
      } );

      /////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'should be deeply cloned for each delivery', done => {
         eventBus.publish( 'myEvent', { data: { x: 12 } } )
            .then( () => { expect( data ).toEqual( { x: 12  } ); } )
            .then( done );
      } );

   } );

   ////////////////////////////////////////////////////////////////////////////////////////////////////////

   describe( 'where the subscriber doesn\'t request a clone', () => {

      let data;
      beforeEach( () => {
         eventBus.subscribe( 'myEvent', function( event ) {
            data = event.data;
         }, { clone: false } );
      } );

      /////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'gets a frozen event in a browser supporting Object.freeze', done => {
         eventBus.publish( 'myEvent', { data: { x: 12  } } )
            .then( () => { expect( Object.isFrozen( data ) ).toBe( true ); } )
            .then( done );
      } );

   } );
} );

///////////////////////////////////////////////////////////////////////////////////////////////////////////

describe( 'A meta object', () => {

   beforeEach( setup );

   it( 'is always send to subscribers additionally to the event object', done => {
      const mySpy = jasmine.createSpy();
      eventBus.subscribe( 'myEvent', mySpy );
      eventBus.publish( 'myEvent' )
         .then( () => {
            expect( mySpy.calls.argsFor( 0 ).length ).toBe( 2 );
            expect( mySpy.calls.argsFor( 0 )[ 1 ] ).toBeDefined();
         } )
         .then( done );
   } );

   ////////////////////////////////////////////////////////////////////////////////////////////////////////

   it( 'provides a way to directly unsubscribe the called subscriber from this event', done => {
      let calls = 0;
      eventBus.subscribe( 'myEvent', function( event, meta ) {
         ++calls;
         meta.unsubscribe();
      } );
      Promise.all( [
         eventBus.publish( 'myEvent' ),
         eventBus.publish( 'myEvent' ),
      ] )
      .then( () => { expect( calls ).toEqual( 1 ); } )
      .then( done );
   } );

   ////////////////////////////////////////////////////////////////////////////////////////////////////////

   describe( 'has a cycleId', () => {

      let mySpy;

      beforeEach( done => {
         mySpy = jasmine.createSpy();

         eventBus.subscribe( 'myEvent', mySpy );
         eventBus.publish( 'myEvent' )
            .then( () => eventBus.publish( 'myOtherEvent' ) )
            .then( () => eventBus.publish( 'myEvent' ) )
            .then( done );
      } );

      /////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'that is counted up on each publish', () => {
         expect( mySpy.calls.count() ).toEqual( 2 );
         expect( mySpy.calls.argsFor( 0 )[ 1 ].cycleId + 2 ).toEqual( mySpy.calls.argsFor( 1 )[ 1 ].cycleId );
      } );

      /////////////////////////////////////////////////////////////////////////////////////////////////////

      describe( 'when triggered during a delivery', () => {
         let mySpy2;
         let cycleId;

         beforeEach( done => {
            mySpy2 = jasmine.createSpy();

            eventBus.subscribe( 'myEvent2', mySpy2 );
            eventBus.subscribe( 'myEvent1', function( event, meta ) {
               cycleId = meta.cycleId;
               eventBus.publish( 'myEvent2' );
            } );
            eventBus.publish( 'myEvent1' ).then( done );
         } );

         //////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'it must have the same cycle id as the event it was delivered on', () => {
            expect( mySpy2.calls.argsFor( 0 )[ 1 ].cycleId ).toBeDefined();
            expect( mySpy2.calls.argsFor( 0 )[ 1 ].cycleId ).toEqual( cycleId );
         } );

      } );

   } );

} );

///////////////////////////////////////////////////////////////////////////////////////////////////////////

describe( 'Subscribe allows wildcards', () => {

   beforeEach( setup );

   let mySpy;

   beforeEach( () => {
      mySpy = jasmine.createSpy();
   } );

   ////////////////////////////////////////////////////////////////////////////////////////////////////////

   it( 'at the end of the event name', done => {
      eventBus.subscribe( 'firstLevel.secondLevel', mySpy );
      eventBus.publish( 'firstLevel.secondLevel.thirdLevel' )
         .then( () => { expect( mySpy ).toHaveBeenCalled(); } )
         .then( done );
   } );

   ////////////////////////////////////////////////////////////////////////////////////////////////////////

   it( 'at the beginning of the event name', done => {
      eventBus.subscribe( '.secondLevel.thirdLevel', mySpy );
      eventBus.publish( 'firstLevel.secondLevel.thirdLevel' )
         .then( () => { expect( mySpy ).toHaveBeenCalled(); } )
         .then( done );
   } );

   ////////////////////////////////////////////////////////////////////////////////////////////////////////

   it( 'anywhere in the event name', done => {
      eventBus.subscribe( 'firstLevel..thirdLevel', mySpy );
      eventBus.publish( 'firstLevel.secondLevel.thirdLevel' )
         .then( () => { expect( mySpy ).toHaveBeenCalled(); } )
         .then( done );
   } );

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   it( 'as the empty string in the subscriber', done => {
      eventBus.subscribe( '', mySpy );
      eventBus.publish( 'myEvent' )
         .then( () => { expect( mySpy ).toHaveBeenCalled(); } )
         .then( done );
   } );

} );

///////////////////////////////////////////////////////////////////////////////////////////////////////////

describe( 'Subscribe allows inner wildcards', () => {

   beforeEach( setup );

   let mySpy;

   beforeEach( () => {
      mySpy = jasmine.createSpy();
   } );

   ////////////////////////////////////////////////////////////////////////////////////////////////////////

   it( 'using minus', done => {
      eventBus.subscribe( 'firstLevel.secondLevel.thirdLevel', mySpy );
      eventBus.publish( 'firstLevel-here.secondLevel.thirdLevel' )
         .then( () => { expect( mySpy ).toHaveBeenCalled(); } )
         .then( done );
   } );

   ////////////////////////////////////////////////////////////////////////////////////////////////////////

   it( 'using minus combined with wildcards', done => {
      eventBus.subscribe( 'firstLevel..thirdLevel', mySpy );
      eventBus.publish( 'firstLevel.secondLevel.thirdLevel-here' )
         .then( () => { expect( mySpy ).toHaveBeenCalled(); } )
         .then( done );
   } );

   ////////////////////////////////////////////////////////////////////////////////////////////////////////

   it( 'using minus with wildcards only', done => {
      eventBus.subscribe( 'firstLevel', mySpy );
      eventBus.publish( 'firstLevel.secondLevel.thirdLevel-here' )
         .then( () => { expect( mySpy ).toHaveBeenCalled(); } )
         .then( done );
   } );

} );

///////////////////////////////////////////////////////////////////////////////////////////////////////////

describe( 'An event bus with different subscribers', () => {

   beforeEach( setup );

   let calls;

   beforeEach( done => {
      calls = [];
      function subscribe( eventName ) {
         eventBus.subscribe( eventName,() => {
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

      eventBus.publish( 'topic1-sub1.topic2-sub2.topic3-sub3' )
         .then( done );
   } );

   ////////////////////////////////////////////////////////////////////////////////////////////////////////

   it( 'delivers events to the most specific subscribers first', () => {
      let i = 0;
      expect( calls[i++] ).toEqual( 'topic1.topic2-sub2.topic3' );
      expect( calls[i++] ).toEqual( 'topic1.topic2.topic3-sub3' );
      expect( calls[i++] ).toEqual( 'topic1.topic2.topic3' );
      expect( calls[i++] ).toEqual( 'topic1-sub1.topic2-sub2' );
      expect( calls[i++] ).toEqual( 'topic1-sub1.topic2' );
      expect( calls[i++] ).toEqual( 'topic1.topic2' );
      expect( calls[i++] ).toEqual( 'topic1' );
      expect( calls[i++] ).toEqual( '.topic2' );
      expect( calls[i] ).toEqual( '' );
   } );

} );

///////////////////////////////////////////////////////////////////////////////////////////////////////////

describe( 'and when multiple will-responses are completed with a single did', () => {

   let errorHandlerSpy;
   let rejectSpy;
   let numRequests;
   let numReplies;

   beforeEach( done => {
      errorHandlerSpy = jasmine.createSpy( 'errorHandlerSpy' );
      rejectSpy = jasmine.createSpy( 'rejectSpy' );
      browserMock = createBrowserMock();
      eventBus = createEventBus( nextTick, setTimeout, browserMock, {
         pendingDidTimeout: 1000
      } );
      eventBus.setErrorHandler( errorHandlerSpy );

      numRequests = 0;
      numReplies = 0;
      eventBus.subscribe( 'workAsyncRequest', () => {
         eventBus.publish( 'willWorkAsync', {}, { sender: 'asyncSender' } );
         if( numRequests === 0 ) {
            window.setTimeout( () => {
               eventBus.publish( 'didWorkAsync', {}, { sender: 'asyncSender' } ).then( done );
            }, 10 );
         }
         ++numRequests;
      } );

      eventBus.publishAndGatherReplies( 'workAsyncRequest' )
         .then( () => { ++numReplies; }, rejectSpy );
      eventBus.publishAndGatherReplies( 'workAsyncRequest' )
         .then( () => { ++numReplies; }, rejectSpy );
   } );

   /////////////////////////////////////////////////////////////////////////////////////////////////////

   it( 'completes all requests', () => {
      expect( numReplies ).toEqual( 2 );
   } );

   /////////////////////////////////////////////////////////////////////////////////////////////////////

   it( 'does not run into a timeout', done => {
      window.setTimeout( () => {
         expect( rejectSpy ).not.toHaveBeenCalled();
         expect( errorHandlerSpy ).not.toHaveBeenCalled();
         done();
      }, 1000 );
   } );

} );

///////////////////////////////////////////////////////////////////////////////////////////////////////////

describe( 'An event bus supports a request-will-did pattern', () => {

   beforeEach( setup );

   beforeEach( () => {

      eventBus.subscribe( 'doSomethingWrong', () => {
         eventBus.publish( 'willDoSomethingWrong' );
         eventBus.publish( 'didDoSomethingWrong' );
      } );
      eventBus.subscribe( 'doSomethingAsyncRequest', () => {
         eventBus.publish( 'willDoSomethingAsync', {}, { sender: 'asyncSender' } );
         window.setTimeout( () => {
            eventBus.publish( 'didDoSomethingAsync.andItWorked', {}, { sender: 'asyncSender' } );
         }, 10 );
      } );
      eventBus.subscribe( 'doSomethingSyncRequest', () => {
         eventBus.publish( 'willDoSomethingSync', {}, { sender: 'syncSender' }  );
         eventBus.publish( 'didDoSomethingSync.andItWorked', {}, { sender: 'syncSender' }  );
      } );
      eventBus.subscribe( 'doSomethingSyncRequest.subTopic', () => {
         eventBus.publish( 'willDoSomethingSync.subTopic', {}, { sender: 'syncSender' }  );
         eventBus.publish( 'didDoSomethingSync.subTopic.andItWorked', {}, { sender: 'syncSender' }  );
      } );
      eventBus.subscribe( 'doSomethingWithoutWillRequest', () => {
         eventBus.publish( 'willDoSomethingWithoutWill', {}, { sender: 'asyncSender' } );
         window.setTimeout( () => {
            eventBus.publish( 'didDoSomethingWithoutWill.andItWorked', {}, { sender: 'asyncSender' } );
         }, 10 );
         eventBus.publish( 'didDoSomethingWithoutWill.andItWorked', {}, { sender: 'syncSender' }  );
      } );
   } );

   ////////////////////////////////////////////////////////////////////////////////////////////////////////

   it( 'throws when the event name does not end with "Request"', () => {
      expect( () => {
         eventBus.publishAndGatherReplies( 'wronglyNamedEvent' );
      } ).toThrow();
   } );

   ////////////////////////////////////////////////////////////////////////////////////////////////////////

   it( 'throws when a "will"-response comes without sender', () => {
      expect( () => {
         eventBus.publishAndGatherReplies( 'doSomethingWrong' );
      } ).toThrow();
   } );

   ////////////////////////////////////////////////////////////////////////////////////////////////////////

   it( 'accepts if there is a subject part after the "Request"', () => {
      expect( () => {
         eventBus.publishAndGatherReplies( 'mySimpleRequest.someSubject' );
      } ).not.toThrow();
   } );

   ////////////////////////////////////////////////////////////////////////////////////////////////////////

   it( 'whose promise is resolved only after all will-did replies were given asynchronously', done => {
      eventBus.publishAndGatherReplies( 'doSomethingAsyncRequest' )
         .then( replies => {
            expect( replies.length ).toEqual( 1 );
            expect( replies[0].meta.name ).toEqual( 'didDoSomethingAsync.andItWorked' );
         } )
         .then( done, done.fail );
   } );

   ////////////////////////////////////////////////////////////////////////////////////////////////////////

   it( 'whose promise is resolved only after all will-did replies were given synchronously', done => {
      eventBus.publishAndGatherReplies( 'doSomethingSyncRequest' )
         .then( replies => {
            expect( replies.length ).toEqual( 1 );
            expect( replies[0].meta.name ).toEqual( 'didDoSomethingSync.andItWorked' );
         } )
         .then( done, done.fail );
   } );

   ////////////////////////////////////////////////////////////////////////////////////////////////////////

   it( 'whose promise is resolved after synchronous dids without wills, combined with asynchronous dids', done => {
      eventBus.publishAndGatherReplies( 'doSomethingWithoutWillRequest' )
         .then( replies => {
            expect( replies.length ).toEqual( 2 );
         } )
         .then( done, done.fail );
   } );

   ////////////////////////////////////////////////////////////////////////////////////////////////////////

   it( 'only listens to did/will answers for the given subject', done => {
      eventBus.subscribe( 'doSomethingSyncRequest', () => {
         eventBus.publish( 'willDoSomethingSync.subTopic', {}, { sender: 'syncSender' } );
         eventBus.publish( 'didDoSomethingSync.subTopic.andItDidntWork', {}, { sender: 'syncSender' } );
      } );

      eventBus.publishAndGatherReplies( 'doSomethingSyncRequest.subTopic' )
         .then( replies => {
            expect( replies.length ).toBe( 2 );
            expect( replies[0].meta.name ).toEqual( 'didDoSomethingSync.subTopic.andItWorked' );
            expect( replies[1].meta.name ).toEqual( 'didDoSomethingSync.subTopic.andItDidntWork' );
         } )
         .then( done, done.fail );
   } );

   ////////////////////////////////////////////////////////////////////////////////////////////////////////

   it( 'works with topics that contain the string "Request"', done => {
      eventBus.subscribe( 'validateRequest.exportRequest', () => {
         eventBus.publish( 'willValidate.exportRequest', {}, { sender: 'syncSender' } );
         eventBus.publish( 'didValidate.exportRequest', {}, { sender: 'syncSender' } );
      } );

      eventBus.publishAndGatherReplies( 'validateRequest.exportRequest' )
         .then( replies => {
            expect( replies.length ).toBe( 1 );
            expect( replies[0].meta.name ).toEqual( 'didValidate.exportRequest' );
         } )
         .then( done, done.fail );
   } );

   ////////////////////////////////////////////////////////////////////////////////////////////////////////

   it( 'resolves even if no one answered the request', done => {
      eventBus.publishAndGatherReplies( 'myUnknownRequest' )
         .then( replies => {
            expect( replies.length ).toBe( 0 );
         } )
         .then( done, done.fail );
   } );

   ////////////////////////////////////////////////////////////////////////////////////////////////////////

   describe( 'when a collaborator does not send a did after will within a given timeout', () => {

      let errorHandlerSpy;

      beforeEach( () => {
         errorHandlerSpy = jasmine.createSpy( 'errorHandlerSpy' );
         browserMock = createBrowserMock();
         eventBus = createEventBus( nextTick, setTimeout, browserMock, {
            pendingDidTimeout: 1000
         } );
         eventBus.setErrorHandler( errorHandlerSpy );

         eventBus.subscribe( 'doSomethingWithTimeoutRequest', () => {
            eventBus.publish( 'willDoSomethingWithTimeout', {}, { sender: 'sender1' } );
            eventBus.publish( 'willDoSomethingWithTimeout', {}, { sender: 'sender2' } );
            setTimeout( () => {
               eventBus.publish( 'didDoSomethingWithTimeout', {}, { sender: 'sender1' } );
            }, 10 );
         } );
      } );

      /////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'the promise is rejected with all results available up to the timeout', done => {
         eventBus.publishAndGatherReplies( 'doSomethingWithTimeoutRequest' )
            .then( done.fail, replies => {
               expect( replies.length ).toEqual( 1 );
               expect( replies[0].meta.sender ).toEqual( 'sender1' );
            } )
            .then( done );
      } );

      /////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'reports the issue to the error handler', done => {
         eventBus.publishAndGatherReplies( 'doSomethingWithTimeoutRequest' )
            .then( done.fail, () => { expect( errorHandlerSpy ).toHaveBeenCalled(); } )
            .then( done );
      } );

   } );

} );

///////////////////////////////////////////////////////////////////////////////////////////////////////////

describe( 'EventBus unsubscribing', () => {

   beforeEach( setup );

   let subscriberSpy;

   beforeEach( () => {
      subscriberSpy = jasmine.createSpy();

      eventBus.subscribe( 'myEvent', subscriberSpy );
      eventBus.subscribe( 'myEvent.subitem', subscriberSpy );
      eventBus.subscribe( '.subitem', subscriberSpy );
   } );

   ////////////////////////////////////////////////////////////////////////////////////////////////////////

   it( 'throws if the callback is no function', () => {
      expect( eventBus.unsubscribe ).toThrow();
   } );

   ////////////////////////////////////////////////////////////////////////////////////////////////////////

   it( 'removes it from all subscribed events', done => {
      eventBus.unsubscribe( subscriberSpy );

      Promise.all( [
         eventBus.publish( 'myEvent' ),
         eventBus.publish( 'myEvent.subitem' ),
      ] )
      .then( () => { expect( subscriberSpy ).not.toHaveBeenCalled(); } )
      .then( done );
   } );

   ////////////////////////////////////////////////////////////////////////////////////////////////////////

   it( 'ignores successive calls to unsubscribe', done => {
      eventBus.unsubscribe( subscriberSpy );
      eventBus.unsubscribe( subscriberSpy );

      eventBus.publish( 'myEvent' )
         .then( () => { expect( subscriberSpy ).not.toHaveBeenCalled(); } )
         .then( done );
   } );

} );
