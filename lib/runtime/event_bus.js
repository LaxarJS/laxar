/**
 * Copyright 2016 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
/**
 * The *event_bus* module contains the implementation of the *LaxarJS EventBus*.
 * In an application you'll never use this module or instantiate an event bus instance directly.
 * Instead within a widget the event bus can be injected as `axEventBus` or accessed as property on the
 * `axContext` injection.
 *
 * @module event_bus
 */
import assert from '../utilities/assert';
import * as object from '../utilities/object';

const WILDCARD = '*';
const SUBSCRIBER_FIELD = '.';

const TOPIC_SEPARATOR = '.';
const SUB_TOPIC_SEPARATOR = '-';
const REQUEST_MATCHER = /^([^.])([^.]*)Request(\..+)?$/;

//////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * @param {Object} configuration
 *    configuration for the event bus instance.
 *    The key `eventBusTimeoutMs` is used to determine the will/did timeout.
 * @param {Object} log
 *    a logger instance for error reporting
 * @param {Function} nextTick
 *    a next tick function like `process.nextTick`, `setImmediate` or AngularJS' `$timeout`
 * @param {Function} timeoutFunction
 *    a timeout function like `window.setTimeout` or AngularJS' `$timeout`
 * @param {Function} [errorHandler]
 *    a custom handler for thrown exceptions. By default exceptions are logged using the global logger.
 *
 * @constructor
 * @private
 */
function EventBus(
   configuration,
   log,
   nextTick,
   timeoutFunction,
   errorHandler = createLogErrorHandler( log )
) {
   this.nextTick_ = f => nextTick( f );
   this.timeoutFunction_ = ( f, ms ) => timeoutFunction( f, ms );
   this.timeoutMs_ = configuration.ensure( 'eventBusTimeoutMs' );
   this.errorHandler_ = errorHandler;

   this.cycleCounter_ = 0;
   this.eventQueue_ = [];
   this.subscriberTree_ = {};

   this.waitingPromiseResolves_ = [];
   this.currentCycle_ = -1;
   this.inspectors_ = [];
   this.log_ = log;
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Adds an inspector, that gets notified when certain actions within the event bus take place. Currently
 * these actions may occur:
 *
 * - `subscribe`: a new subscriber registered for an event
 * - `publish`: an event is published but not yet delivered
 * - `deliver`: an event is actually delivered to a subscriber
 *
 * An inspector receives a map with the following properties:
 *
 * - `action`: one of the actions from above
 * - `source`: the origin of the `action`
 * - `target`: the name of the event subscriber (`deliver` action only)
 * - `event`: the full name of the event or the subscribed event (`subscribe` action only)
 * - `eventObject`: the published event item (`publish` action only)
 * - `subscribedTo`: the event, possibly with omissions, the subscriber subscribed to (`deliver` action only)
 * - `cycleId`: the id of the event cycle
 *
 * The function returned by this method can be called to remove the inspector again and prevent it from
 * being called for future event bus actions.
 *
 * @param {Function} inspector
 *    the inspector function to add
 *
 * @return {Function}
 *    a function to remove the inspector
 */
EventBus.prototype.addInspector = function( inspector ) {
   assert( inspector ).hasType( Function ).isNotNull();

   this.inspectors_.push( inspector );
   return function() {
      const index = this.inspectors_.indexOf( inspector );
      if( index !== -1 ) {
         this.inspectors_.splice( index, 1 );
      }
   }.bind( this );
};

//////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Subscribes to an event by name. An event name consists of so called *topics*, where each topic is
 * separated from another by dots (`.`). If a topic is omitted, this is treated as a wildcard. Note that
 * two dots in the middle or one dot at the beginning of an event name must remain, whereas a dot at the
 * end may be omitted. As such every event name has an intrinsic wildcard at its end. For example these are
 * all valid event names:
 *
 * - `some.event`: matches `some.event`, `some.event.again`
 * - `.event`: matches `some.event`, `any.event`, `any.event.again`
 * - `some..event`: matches `some.fancy.event`, `some.special.event`
 *
 * Additionally *subtopics* are supported. Subtopics are fragments of a topic, separated from another by
 * simple dashes (`-`). Here only suffixes of subtopics may be omitted when subscribing. Thus subscribing
 * to `some.event` would match an event published with name `some.event-again` or even
 * `some.event-another.again`.
 *
 * **The subscriber function**
 *
 * When an event is delivered, the subscriber function receives two arguments:
 * The first one is the event object as it was published. If `optionalOptions.clone` yields `true` this is a
 * simple deep copy of the object (note that only properties passing a JSON-(de)serialization remain). If
 * `false` the object is frozen using `Object.freeze` recursively.
 *
 * The second one is a meta object with these properties:
 *
 * - `name`: The name of the event as it actually was published (i.e. without wildcards).
 * - `cycleId`: The id of the cycle the event was published (and delivered) in
 * - `sender`: The id of the event sender, may be `null`.
 * - `initiator`: The id of the initiator of the cycle. Currently not implemented, thus always `null`.
 * - `options`: The options that were passed to `publish` or `publishAndGatherReplies` respectively.
 *
 * @param {String} eventName
 *    the name of the event to subscribe to
 * @param {Function} subscriber
 *    a function to call whenever an event matching `eventName` is published
 * @param {Object} [optionalOptions]
 *    additional options for the subscribe action
 * @param {String} [optionalOptions.subscriber=null]
 *    the id of the subscriber. Default is `null`
 * @param {Boolean} [optionalOptions.clone=true]
 *    if `false` the event will be send frozen to the subscriber, otherwise it will receive a deep copy.
 *    Default is `true`
 *
 * @return {Function}
 *    a function that when called unsubscribes from this subscription again
 */
EventBus.prototype.subscribe = function( eventName, subscriber, optionalOptions ) {
   assert( eventName ).hasType( String ).isNotNull();
   assert( subscriber ).hasType( Function ).isNotNull();

   const options = object.options( optionalOptions, {
      subscriber: null,
      clone: true
   } );
   const subscriberItem = {
      name: eventName,
      subscriber,
      subscriberName: options.subscriber,
      subscriptionWeight: calculateSubscriptionWeight( eventName ),
      options
   };

   const eventNameParts = eventName.split( TOPIC_SEPARATOR );
   const node = eventNameParts.reduce( ( node, eventNamePart ) => {
      const bucketName = eventNamePart || WILDCARD;
      if( !( bucketName in node ) ) {
         node[ bucketName ] = {};
      }
      return node[ bucketName ];
   }, this.subscriberTree_ );

   if( !( SUBSCRIBER_FIELD in node ) ) {
      node[ SUBSCRIBER_FIELD ] = [];
   }
   node[ SUBSCRIBER_FIELD ].push( subscriberItem );

   notifyInspectors( this, {
      action: 'subscribe',
      source: options.subscriber,
      target: '-',
      event: eventName,
      cycleId: this.currentCycle_
   } );

   return () => {
      unsubscribeRecursively( this, this.subscriberTree_, eventNameParts, subscriber );
   };
};

//////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Asynchronously publishes an event on the event bus. The returned promise will be enqueued as soon as this
 * event is delivered and, if during delivery a new event was enqueued, resolved after that new event was
 * delivered. If no new event is published during delivery of this event, the promise is instantly resolved.
 * To make this a bit clearer, lets assume we publish and thus enqueue an event at time `t`. It then will
 * be delivered at time `t+1`. At that precise moment the promise is enqueued to be resolved soon. We then
 * distinguish between two cases:
 *
 * - At time `t+1` no subscriber publishes (i.e. enqueues) an event: Thus there is no event in the same
 *   cycle and the promise is also resolved at time `t+1`.
 * - At least one subscriber publishes an event at time `t+1`: The promise is then scheduled to be resolved
 *   as soon as this event is delivered at time `t+2`.
 *
 * The implication of this is the following:
 *
 * We have two collaborators, A and B. A listens to event b and B listens to event a.
 * Whenever A publishes a and B than instantly (i.e. in the same event cycle of the JavaScript runtime
 * where its subscriber function was called) *responds* by publishing b, b arrives at the subscriber
 * function of A, before the promise of A's publish action is resolved.
 * It is hence possible to observe possible effects of an event sent by oneself, under the conditions
 * mentioned above. Practically this is used internally for the implementation of
 * {@link #EventBus.publishAndGatherReplies()}.
 *
 * @param {String} eventName
 *    the name of the event to publish
 * @param {Object} [optionalEvent]
 *    the event to publish
 * @param {Object} [optionalOptions]
 *    additional options for the publish action
 * @param {String} [optionalOptions.sender=null]
 *    the id of the event sender. Default is `null`
 * @param {Boolean} [optionalOptions.deliverToSender=true]
 *    if `false` the event will not be send to subscribers whose subscriber name matches
 *    `optionalOptions.sender`, else all subscribers will receive the event. Default is `true`
 *
 * @return {Promise}
  *   the delivery promise
 */
EventBus.prototype.publish = function( eventName, optionalEvent = {}, optionalOptions = {} ) {
   assert( eventName ).hasType( String ).isNotNull();

   const event = JSON.parse( JSON.stringify( optionalEvent ) );
   const options = { deliverToSender: true, sender: null, ...optionalOptions };

   return new Promise( resolve => {
      const eventItem = {
         meta: {
            name: eventName,
            cycleId: this.currentCycle_ > -1 ? this.currentCycle_ : this.cycleCounter_++,
            sender: options.sender,
            initiator: null,
            options
         },
         event,
         resolvePublish: resolve
      };
      enqueueEvent( this, eventItem );

      notifyInspectors( this, {
         action: 'publish',
         source: options.sender,
         target: '-',
         event: eventName,
         eventObject: event,
         cycleId: eventItem.meta.cycleId
      } );
   } );
};

//////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Publishes an event that follows the *request-will-did pattern* and awaits all replies. This pattern has
 * evolved over time and is of great use when handling the asynchronous nature of event bus events.
 *
 * Certain rules need to be fulfilled: First the initiator needs to call this method with an event whose
 * name has the suffix `Request`, e.g. `takeActionRequest`. All collaborators that want to react to this
 * event then either do so in the same event cycle by sending a `didTakeAction` event or announce that they
 * will do something asynchronously by publishing a `willTakeAction` event. In the latter case they need to
 * broadcast the fulfillment of their action some time later by sending a `didTakeAction` event. Note that for
 * both events the same sender name needs to be given. Otherwise they cannot be mapped and the event bus
 * doesn't know if all asynchronous replies were already received.
 *
 * Additionally a timer is started using either the globally configured `pendingDidTimeout` ms value or the
 * value provided as option to this method. If that timer expires before all `did*` events to all given
 * `will*` events were received, the error handler is called to handle the incident and the promise is
 * rejected with all responses received up to now.
 *
 * @param {String} eventName
 *    the name of the event to publish
 * @param {Object} [optionalEvent]
 *    the event to publish
 * @param {Object} [optionalOptions]
 *    additional options for the publish action
 * @param {String} [optionalOptions.sender=null]
 *    the id of the event sender. Default is `null`
 * @param {Number} [optionalOptions.pendingDidTimeout]
 *    the timeout in milliseconds for pending did* events. Default is the timeout option used when the
 *    event bus instance was created
 *
 * @return {Promise}
 *   the delivery promise. It receives a list of all collected `did*` events and according meta information
 */
EventBus.prototype.publishAndGatherReplies = function( eventName, optionalEvent, optionalOptions ) {
   assert( eventName ).hasType( String ).isNotNull();

   const matches = REQUEST_MATCHER.exec( eventName );
   assert.state( !!matches, `Expected eventName to end with "Request" but got ${eventName}` );

   const options = { pendingDidTimeout: this.timeoutMs_, ...optionalOptions };

   let eventNameSuffix = matches[ 1 ].toUpperCase() + matches[ 2 ];
   if( matches[ 3 ] ) {
      eventNameSuffix += matches[ 3 ];
   }
   const deferred = {};
   deferred.promise = new Promise( ( resolve, reject ) => {
      deferred.resolve = resolve;
      deferred.reject = reject;
   } );
   const willWaitingForDid = [];
   const givenDidResponses = [];
   let cycleFinished = false;

   const unsubscribeWillCollector = this.subscribe( `will${eventNameSuffix}`, ( event, meta ) => {
      assert( meta.sender ).hasType( String )
         .isNotNull( 'A response with will to a request-event must contain a sender.' );

      willWaitingForDid.push( meta.sender );
   }, { subscriber: options.sender } );

   const unsubscribeDidCollector = this.subscribe( `did${eventNameSuffix}`, ( event, meta ) => {
      givenDidResponses.push( { event, meta } );
      let senderIndex;
      do {
         senderIndex = willWaitingForDid.indexOf( meta.sender );
         if( senderIndex !== -1 ) {
            willWaitingForDid.splice( senderIndex, 1 );
         }
      } while( senderIndex !== -1 );

      if( willWaitingForDid.length === 0 && cycleFinished ) {
         finish();
      }
   }, { subscriber: options.sender } );


   const timeoutRef = this.timeoutFunction_( () => {
      if( willWaitingForDid.length > 0 ) {
         const message = `Timeout while waiting for pending did${eventNameSuffix} on ${eventName}.`;
         this.errorHandler_( message, {
            'Sender': options.sender,
            'After ms timeout': options.pendingDidTimeout,
            'Responses missing from': willWaitingForDid.join( ', ' )
         } );
         finish( true );
      }
   }, options.pendingDidTimeout );

   this.publish( eventName, optionalEvent, options )
      .then( () => {
         unsubscribeWillCollector();
         if( willWaitingForDid.length === 0 ) {
            // either there was no will or all did responses were already given in the same cycle as the will
            finish();
            return;
         }
         cycleFinished = true;
      } );

   function finish( wasCanceled ) {
      clearTimeout( timeoutRef );
      unsubscribeDidCollector();
      ( wasCanceled ? deferred.reject : deferred.resolve )( givenDidResponses );
   }

   return deferred.promise;
};

//////////////////////////////////////////////////////////////////////////////////////////////////////////////

function enqueueEvent( self, eventItem ) {
   if( self.eventQueue_.length === 0 ) {
      self.nextTick_( () => {
         const queuedEvents = self.eventQueue_;

         self.eventQueue_ = [];

         processWaitingPublishPromises( self, processQueue( self, queuedEvents ) );
      } );
   }
   self.eventQueue_.push( eventItem );
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////////

function processQueue( self, queuedEvents ) {
   return queuedEvents.map( eventItem => {
      const meta = eventItem.meta;
      self.currentCycle_ = meta.cycleId;

      const subscribers = findSubscribers( self, meta.name );
      if( subscribers.length === 0 ) {
         self.currentCycle_ = -1;
         return eventItem.resolvePublish;
      }

      let serializedEvent = null;
      if( subscribers.length > 1 ) {
         serializedEvent = JSON.stringify( eventItem.event );
      }

      const senderName = meta.sender;
      const options = meta.options;

      subscribers.forEach( subscriberItem => {
         const subscriberName = subscriberItem.subscriberName;
         if( !options.deliverToSender && senderName && senderName === subscriberName ) {
            return;
         }

         try {
            let event;
            if( subscriberItem.options.clone ) {
               event = serializedEvent ? JSON.parse( serializedEvent ) : eventItem.event;
            }
            else {
               event = object.deepFreeze( eventItem.event, true );
            }
            subscriberItem.subscriber( event, meta );
         }
         catch( e ) {
            const message = `error while calling subscriber "${subscriberName}"` +
               ` for event ${meta.name}` +
               ` published by "${senderName}" (subscribed to: ${subscriberItem.name})`;
            self.errorHandler_( message, {
               'Exception': e,
               'Published event': eventItem.event,
               'Event meta information': meta,
               'Caused by Subscriber': subscriberItem
            } );
         }

         notifyInspectors( self, {
            action: 'deliver',
            source: senderName,
            target: subscriberName,
            event: meta.name,
            eventObject: eventItem.event,
            subscribedTo: subscriberItem.name,
            cycleId: meta.cycleId
         } );
      } );

      self.currentCycle_ = -1;

      return eventItem.resolvePublish;
   } );
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////////

function processWaitingPublishPromises( self, newPromiseResolves ) {
   const waitingResolves = self.waitingPromiseResolves_;
   self.waitingPromiseResolves_ = newPromiseResolves;

   waitingResolves.forEach( resolve => resolve() );

   if( self.eventQueue_.length === 0 ) {
      // nothing was queued by any subscriber. The publishers can instantly be notified of delivery.
      newPromiseResolves.forEach( resolve => resolve() );
      self.waitingPromiseResolves_ = [];
   }
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////////

function unsubscribeRecursively( self, node, parts, subscriber ) {
   if( parts.length === 0 && Array.isArray( node[ SUBSCRIBER_FIELD ] ) ) {
      const subscribers = node[ SUBSCRIBER_FIELD ];
      for( let i = subscribers.length - 1; i >= 0; --i ) {
         if( subscribers[ i ].subscriber === subscriber ) {
            notifyInspectors( self, {
               action: 'unsubscribe',
               source: subscribers[ i ].subscriberName,
               target: '-',
               event: subscribers[ i ].name,
               cycleId: self.currentCycle_
            } );
            subscribers.splice( i, 1 );
         }
      }
   }

   const [ part, ...rest ] = parts;
   const searchPart = part || WILDCARD;
   if( searchPart in node ) {
      unsubscribeRecursively( self, node[ searchPart ], rest, subscriber );
   }
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////////

function findSubscribers( self, eventName ) {
   const subscribers = [];
   const parts = eventName.split( TOPIC_SEPARATOR );
   const node = self.subscriberTree_;

   findSubscribersRecursively( node, parts, subscribers );
   subscribers.sort( ( a, b ) => {
      const aWeight = a.subscriptionWeight;
      const bWeight = b.subscriptionWeight;
      if( aWeight[ 0 ] === bWeight[ 0 ] ) {
         return bWeight[ 1 ] - aWeight[ 1 ];
      }

      return bWeight[ 0 ] - aWeight[ 0 ];
   } );

   return subscribers;
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////////

function findSubscribersRecursively( node, parts, subscribers ) {
   if( Array.isArray( node[ SUBSCRIBER_FIELD ] ) ) {
      subscribers.push( ...node[ SUBSCRIBER_FIELD ] );
   }

   if( parts.length === 0 ) {
      return;
   }

   const [ part, ...remainder ] = parts;
   if( part.indexOf( SUB_TOPIC_SEPARATOR ) !== -1 ) {
      let index = part.length;
      let currentPart = part;
      do {
         currentPart = currentPart.substring( 0, index );
         if( currentPart in node ) {
            findSubscribersRecursively( node[ currentPart ], remainder, subscribers );
         }
         index = currentPart.lastIndexOf( SUB_TOPIC_SEPARATOR );
      }
      while( index !== -1 );
   }
   else if( part in node ) {
      findSubscribersRecursively( node[ part ], remainder, subscribers );
   }

   if( WILDCARD in node ) {
      findSubscribersRecursively( node[ WILDCARD ], remainder, subscribers );
   }
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////////

function calculateSubscriptionWeight( eventName ) {
   const parts = eventName.split( TOPIC_SEPARATOR );
   const weight = [ 0, 0 ];
   parts.forEach( part => {
      if( part.length > 0 ) {
         weight[ 0 ]++;
         weight[ 1 ] += part.split( SUB_TOPIC_SEPARATOR ).length - 1;
      }
   } );
   return weight;
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////////

function notifyInspectors( self, infoObject ) {
   self.inspectors_.forEach( inspector => {
      inspector( infoObject );
   } );
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////////

function createLogErrorHandler( log ) {
   return ( message, optionalErrorInformation ) => {
      const sensitiveData = [ 'Published event' ];

      log.error( `EventBus: ${message}` );

      if( optionalErrorInformation ) {
         object.forEach( optionalErrorInformation, ( info, title ) => {
            let formatString = '   - [0]: [1:%o]';
            if( sensitiveData.indexOf( title ) !== -1 ) {
               formatString = '   - [0]: [1:%o:anonymize]';
            }

            log.error( formatString, title, info );

            if( info instanceof Error && info.stack ) {
               log.error( `   - Stacktrace: ${info.stack}` );
            }
         } );
      }
   };
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Creates and returns a new event bus instance using the given configuration.
 *
 * @param {Object} configuration
 *    configuration for the event bus instance.
 *    The key `eventBusTimeoutMs` is used to determine the will/did timeout.
 * @param {Object} log
 *    a logger to use for error reporting
 * @param {Function} nextTick
 *    a next tick function like `process.nextTick` or AngularJS' `$timeout`
 * @param {Function} timeoutFunction
 *    a timeout function like `window.setTimeout` or AngularJS' `$timeout`
 * @param {Function} [errorHandler]
 *    a custom handler for thrown exceptions. By default exceptions are logged using the global logger.
 *
 * @return {EventBus}
 *    an event bus instance
 */
export function create( configuration, log, nextTick, timeoutFunction, errorHandler ) {
   assert( configuration.ensure ).hasType( Function ).isNotNull();
   assert( log.error ).hasType( Function ).isNotNull();
   assert( nextTick ).hasType( Function ).isNotNull();
   assert( timeoutFunction ).hasType( Function ).isNotNull();
   assert( errorHandler ).hasType( Function );

   return new EventBus( configuration, log, nextTick, timeoutFunction, errorHandler );
}
