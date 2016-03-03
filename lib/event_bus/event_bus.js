/**
 * Copyright 2016 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
/**
 * The *event_bus* module contains the implementation of the *LaxarJS EventBus*. In an application you'll
 * never use this module or instantiate an event bus instance directly. Instead within a widget the event bus
 * can be injected via service or accessed as property on the AngularJS `$scope` or `axContext` injections.
 *
 * @module event_bus
 */
import assert from '../utilities/assert';
import log from '../logging/log';
import * as object from '../utilities/object';

const WILDCARD = '*';
const SUBSCRIBER_FIELD = '.';
const INTERNAL_EVENTS_REGISTRY = 'ax__events';

const PART_SEPARATOR = '.';
const SUB_PART_SEPARATOR = '-';
const REQUEST_MATCHER = /^([^.])([^.]*)Request(\..+)?$/;

///////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Constructor for an event bus.
 *
 * @param {Function} nextTick
 *    a next tick function like `process.nextTick` or AngularJS' `$timeout`
 * @param {Function} timeoutFunction
 *    a timeout function like `window.setTimeout`  or AngularJS' `$timeout`
 * @param {Object} [optionalConfiguration]
 *    configuration for the event bus instance
 * @param {Number} optionalConfiguration.pendingDidTimeout
 *    the timeout in milliseconds used by {@link EventBus#publishAndGatherReplies}. Default is 120000ms
 *
 * @constructor
 * @private
 */
function EventBus( nextTick, timeoutFunction, optionalConfiguration ) {
   this.nextTick_ = f => nextTick( f );
   this.timeoutFunction_ = ( f, ms ) => timeoutFunction( f, ms );
   this.config_ = object.options( optionalConfiguration, {
      pendingDidTimeout: 120000
   } );

   this.cycleCounter_ = 0;
   this.eventQueue_ = [];
   this.subscriberTree_ = {};

   this.waitingPromiseResolves_ = [];
   this.currentCycle_ = -1;
   this.errorHandler_ = defaultErrorHandler;
   this.mediator_ = ensureFunction();
   this.inspectors_ = [];
}

///////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Sets a handler for all errors that may occur during event processing. It receives an error message as
 * first argument and a map with additional information on the problem as second argument. There may be
 * instances of `Error` as values within the map.
 * The default error handler simply logs all issues to `console.error` or `console.log` if available.
 *
 * @param {Function} errorHandler
 *    the error handler
 */
EventBus.prototype.setErrorHandler = function( errorHandler ) {
   this.errorHandler_ = ensureFunction( errorHandler, defaultErrorHandler );
};

///////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Sets a mediator, that has the chance to alter events shortly before their delivery to the according
 * subscribers. Its sole argument is the complete list of queued event items that should be delivered
 * during the current JavaScript event loop. It then needs to return this list, including optional
 * modifications, again. Event items may be added or deleted at will, but the return type needs to be an
 * array containing zero or more event item-like objects.
 *
 * An event item has these properties:
 * - `meta`: map with meta information for this event
 *   - `name`: full name of the published event
 *   - `cycleId`: the id of the cycle the event was published in
 *   - `sender`: name of sender (if available)
 *   - `initiator`: name of the sender initiating the current event cycle (if available)
 *   - `options`: map of options given when publishing the event
 * - `event`: the event payload it self as published by the sender
 *
 * @param {Function} mediator
 *    the mediator function
 */
EventBus.prototype.setMediator = function( mediator ) {
   this.mediator_ = ensureFunction( mediator );
};

///////////////////////////////////////////////////////////////////////////////////////////////////////////

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

///////////////////////////////////////////////////////////////////////////////////////////////////////////

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
 * Additionally *subtopics* are supported. A subtopic are fragments of a topic, separated from another by
 * simple dashes (`-`). Here only suffixes of subtopics may be omitted when subscribing. Thus subscribing
 * to `some.event` would match an event published with name `some.event-again` or even
 * `some.event-another.again`.
 *
 * When an event is delivered, the subscriber function receives two arguments:
 * The first one is the event object as it was published. If `clone` yields `true` this is a simple deep
 * copy of the object (note that only properties passing a JSON-(de)serialization remain). If `false` the
 * object is frozen using `Object.freeze` recursively in browsers that support freezing. In any other
 * browser this is just an identity operation.
 *
 * The second one is a meta object with these properties:
 *
 * - `unsubscribe`: A function to directly unsubscribe the called subscriber from further events
 * - `name`: The name of the event as it actually was published (i.e. without wildcards).
 * - `cycleId`: The id of the cycle the event was published (and delivered) in
 * - `sender`: The id of the event sender, may be `null`.
 * - `initiator`: The id of the initiator of the cycle. Currently not implemented, thus always `null`.
 * - `options`: The options that were passed to `publish` or `publishAndGatherReplies` respectively.
 *
 * Note that the subscriber function will receive a property `ax__events` to keep track of all events this
 * function was attached to. This is necessary to make {@link EventBus#unsubscribe} work.
 *
 * @param {String} eventName
 *    the name of the event to subscribe to
 * @param {Function} subscriber
 *    a function to call whenever an event matching `eventName` is published
 * @param {Object} [optionalOptions]
 *    additional options for the subscribe action
 * @param {String} optionalOptions.subscriber
 *    the id of the subscriber. Default is `null`
 * @param {Boolean} optionalOptions.clone
 *    if `false` the event will be send frozen to the subscriber, otherwise it will receive a deep copy.
 *    Default is `true`
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
      subscriber: subscriber,
      subscriberName: options.subscriber,
      subscriptionWeight: calculateSubscriptionWeight( eventName ),
      options: options
   };

   const parts = eventName.split( PART_SEPARATOR );
   let node = this.subscriberTree_;
   for( let i = 0; i < parts.length; ++i ) {
      const bucketName = parts[i].length ? parts[i] : WILDCARD;
      if( !( bucketName in node ) ) {
         node[ bucketName ] = {};
      }
      node = node[ bucketName ];
   }

   if( !( SUBSCRIBER_FIELD in node ) ) {
      node[ SUBSCRIBER_FIELD ] = [];
   }
   node[ SUBSCRIBER_FIELD ].push( subscriberItem );

   if( !subscriber.hasOwnProperty( INTERNAL_EVENTS_REGISTRY ) ) {
      subscriber[ INTERNAL_EVENTS_REGISTRY ] = [];
   }
   subscriber[ INTERNAL_EVENTS_REGISTRY ].push( eventName );

   notifyInspectors( this, {
      action: 'subscribe',
      source: options.subscriber,
      target: '-',
      event: eventName,
      cycleId: this.currentCycle_
   } );
};

///////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Removes all subscriptions of the given subscriber.
 *
 * @param {Function} subscriber
 *    the function to unsubscribe
 */
EventBus.prototype.unsubscribe = function( subscriber ) {
   assert( subscriber ).hasType( Function ).isNotNull();

   if( !subscriber.hasOwnProperty( INTERNAL_EVENTS_REGISTRY ) ||
       !Array.isArray( subscriber[ INTERNAL_EVENTS_REGISTRY ] ) ) {
      return;
   }

   const self = this;
   const subscriberTree = this.subscriberTree_;
   subscriber[ INTERNAL_EVENTS_REGISTRY ].forEach( function( eventName ) {
      unsubscribeRecursively( self, subscriberTree, eventName.split( PART_SEPARATOR ), subscriber );
   } );

   delete subscriber[ INTERNAL_EVENTS_REGISTRY ];
};

///////////////////////////////////////////////////////////////////////////////////////////////////////////

function unsubscribeRecursively( self, node, parts, subscriber ) {
   if( parts.length === 0 && Array.isArray( node[ SUBSCRIBER_FIELD ] ) ) {
      const subscribers = node[ SUBSCRIBER_FIELD ];
      for( let i = subscribers.length -1; i >= 0; --i ) {
         if( subscribers[i].subscriber === subscriber ) {
            notifyInspectors( self, {
               action: 'unsubscribe',
               source: subscribers[i].subscriberName,
               target: '-',
               event: subscribers[i].name,
               cycleId: self.currentCycle_
            } );
            subscribers.splice( i, 1 );
         }
      }
   }

   let part = parts.shift();
   if( part === '' ) {
      part = WILDCARD;
   }
   if( part in node ) {
      unsubscribeRecursively( self, node[ part ], parts, subscriber );
   }
}

///////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Asynchronously publishes an event on the event bus. The returned promise will be queued as soon as this
 * event is delivered and, if during delivery a new event was enqueued, resolved after that new event was
 * delivered. If no new event is queued during delivery of this event, the promise is instantly resolved.
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
 * {@link EventBus#publishAndGatherReplies}.
 *
 * @param {String} eventName
 *    the name of the event to publish
 * @param {Object} [optionalEvent]
 *    the event to publish
 * @param {Object} [optionalOptions]
 *    additional options for the publish action
 * @param {String} optionalOptions.sender
 *    the id of the event sender. Default is `null`
 * @param {Boolean} optionalOptions.deliverToSender
 *    if `false` the event will not be send to subscribers whose subscriber name matches
 *    `optionalOptions.sender`, else all subscribers will receive the event. Default is `true`
 *
 * @return {Promise}
  *   the delivery promise
 */
EventBus.prototype.publish = function( eventName, optionalEvent, optionalOptions ) {
   assert( eventName ).hasType( String ).isNotNull();

   const event = JSON.parse( JSON.stringify( optionalEvent || {} ) );
   const options = object.options( optionalOptions, {
      deliverToSender: true,
      sender: event.sender || null
   } );

   if( event.sender ) {
      log.warn( 'Deprecation warning: The event sender should be set in the options, not the event itself.\n' +
         'Sender: [0], Eventname: [1]', event.sender, eventName );
   }

   return new Promise( resolve => {
      const eventItem = {
         meta: {
            name: eventName,
            cycleId: this.currentCycle_ > -1 ? this.currentCycle_ : this.cycleCounter_++,
            sender: options.sender,
            initiator: null,
            options: options
         },
         event: event,
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

///////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Publishes an event that follows the *request-will-did pattern* and awaits all replies. This pattern has
 * evolved over time and is of great use when handling the asynchronous nature of event bus events.
 *
 * Certain rules need to be fulfilled: First the initiator needs to call this method with an event whose
 * name has the suffix `Request`, e.g. `takeActionRequest`. All collaborators that want to react to this
 * event then either do so in the same event cycle by sending a `didTakeAction` event or announce that they
 * will do something asynchronously by publishing a `willTakeAction` event. In the latter case they need to
 * broadcast the fulfillment of their action by sending a `didTakeAction` event. Note that for both events
 * the same sender name needs to be given. Otherwise they cannot be mapped and the event bus doesn't know
 * if all asynchronous replies were already received.
 *
 * Additionally a timer is started using either the globally configured `pendingDidTimeout` ms value or the
 * value provided as option to this method. If that timer expires before all `did*` events to all given
 * `will*` events were received, the error handler is called to handle the incident and the promise is
 * rejected with all response received up to now.
 *
 * @param {String} eventName
 *    the name of the event to publish
 * @param {Object} [optionalEvent]
 *    the event to publish
 * @param {Object} [optionalOptions]
 *    additional options for the publish action
 * @param {String} optionalOptions.sender
 *    the id of the event sender. Default is `null`
 * @param {Number} optionalOptions.pendingDidTimeout
 *    the timeout in milliseconds for pending did* events
 *
 * @return {Promise}
 *   the delivery promise. It receives a list of all collected `did*` events and according meta information
 */
EventBus.prototype.publishAndGatherReplies = function( eventName, optionalEvent, optionalOptions ) {
   assert( eventName ).hasType( String ).isNotNull();

   const matches = REQUEST_MATCHER.exec( eventName );
   assert.state( !!matches, 'Expected eventName to end with "Request" but got ' + eventName );

   const self = this;
   const options = object.options( optionalOptions, {
      pendingDidTimeout: this.config_.pendingDidTimeout
   } );

   let eventNameSuffix = matches[1].toUpperCase() + matches[2];
   if( matches[3] ) {
      eventNameSuffix += matches[3];
   }
   const deferred = {};
   deferred.promise = new Promise( ( resolve, reject ) => {
      deferred.resolve = resolve;
      deferred.reject = reject;
   } );
   const willWaitingForDid = [];
   const givenDidResponses = [];
   let cycleFinished = false;

   function willCollector( event, meta ) {
      assert( meta.sender ).hasType( String )
         .isNotNull( 'A response with will to a request-event must contain a sender.' );

      willWaitingForDid.push( meta.sender );
   }
   this.subscribe( 'will' + eventNameSuffix, willCollector, { subscriber: options.sender } );

   function didCollector( event, meta ) {
      givenDidResponses.push( { event: event, meta: meta } );

      const senderIndex = willWaitingForDid.indexOf( meta.sender );
      if( senderIndex !== -1 ) {
         willWaitingForDid.splice( senderIndex, 1 );
      }

      if( willWaitingForDid.length === 0 && cycleFinished ) {
         finish();
      }
   }
   this.subscribe( 'did' + eventNameSuffix, didCollector, { subscriber: options.sender } );

   const timeoutRef = this.timeoutFunction_( function() {
      if( willWaitingForDid.length > 0 ) {
         const message = 'Timeout while waiting for pending did' + eventNameSuffix + ' on ' + eventName + '.';
         self.errorHandler_( message, {
            'Sender': options.sender,
            'After ms timeout': options.pendingDidTimeout,
            'Responses missing from': willWaitingForDid.join( ', ' )
         } );
         finish( true );
      }
   }, options.pendingDidTimeout );

   this.publish( eventName, optionalEvent, options ).then( function() {
      if( willWaitingForDid.length === 0 ) {
         // either there was no will or all did responses were already given in the same cycle as the will
         finish();
         return;
      }

      cycleFinished = true;
   } );

   function finish( wasCanceled ) {
      clearTimeout( timeoutRef );
      self.unsubscribe( willCollector );
      self.unsubscribe( didCollector );
      ( wasCanceled ? deferred.reject : deferred.resolve )( givenDidResponses );
   }

   return deferred.promise;
};

///////////////////////////////////////////////////////////////////////////////////////////////////////////

function enqueueEvent( self, eventItem ) {
   if( self.eventQueue_.length === 0 ) {
      self.nextTick_( function() {
         const queuedEvents = self.eventQueue_;

         self.eventQueue_ = [];

         processWaitingPublishPromises( self, processQueue( self, queuedEvents ) );
      } );
   }
   self.eventQueue_.push( eventItem );
}

///////////////////////////////////////////////////////////////////////////////////////////////////////////

function processQueue( self, queuedEvents ) {
   return self.mediator_( queuedEvents ).map( function( eventItem ) {
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

      subscribers.forEach( function( subscriberItem ) {
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
            subscriberItem.subscriber( event, object.options( meta, {
               unsubscribe: function() {
                  self.unsubscribe( subscriberItem.subscriber );
               }
            } ) );
         }
         catch( e ) {
            const message = 'error while calling subscriber "' + subscriberName + '"' +
               ' for event ' + meta.name +
               ' published by "' + senderName + '" (subscribed to: ' + subscriberItem.name + ')';
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

///////////////////////////////////////////////////////////////////////////////////////////////////////////

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

///////////////////////////////////////////////////////////////////////////////////////////////////////////

function findSubscribers( self, eventName ) {
   const subscribers = [];
   const parts = eventName.split( PART_SEPARATOR );
   const node = self.subscriberTree_;

   findSubscribersRecursively( node, parts, subscribers );
   subscribers.sort( function( a, b ) {
      const aWeight = a.subscriptionWeight;
      const bWeight = b.subscriptionWeight;
      if( aWeight[0] === bWeight[0] ) {
         return bWeight[1] - aWeight[1];
      }

      return bWeight[0] - aWeight[0];
   } );

   return subscribers;
}

///////////////////////////////////////////////////////////////////////////////////////////////////////////

function findSubscribersRecursively( node, parts, subscribers ) {
   if( Array.isArray( node[ SUBSCRIBER_FIELD ] ) ) {
      subscribers.push.apply( subscribers, node[ SUBSCRIBER_FIELD ] );
   }

   if( parts.length === 0 ) {
      return;
   }

   let part = parts[ 0 ];
   parts = parts.slice( 1 );

   if( part.indexOf( SUB_PART_SEPARATOR ) !== -1 ) {
      let index = part.length;
      do {
         part = part.substring( 0, index );
         if( part in node ) {
            findSubscribersRecursively( node[ part ], parts, subscribers );
         }
         index = part.lastIndexOf( SUB_PART_SEPARATOR );
      }
      while( index !== -1 );
   }
   else if( part in node ) {
      findSubscribersRecursively( node[ part ], parts, subscribers );
   }

   if( WILDCARD in node ) {
      findSubscribersRecursively( node[ WILDCARD ], parts, subscribers );
   }
}

///////////////////////////////////////////////////////////////////////////////////////////////////////////

function calculateSubscriptionWeight( eventName ) {
   const parts = eventName.split( PART_SEPARATOR );
   const weight = [ 0, 0 ];
   parts.forEach( function( part ) {
      if( part.length > 0 ) {
         weight[0]++;
         weight[1] += part.split( SUB_PART_SEPARATOR ).length - 1;
      }
   } );
   return weight;
}

///////////////////////////////////////////////////////////////////////////////////////////////////////////

function notifyInspectors( self, infoObject ) {
   self.inspectors_.forEach( function( inspector ) {
      inspector( infoObject );
   } );
}

///////////////////////////////////////////////////////////////////////////////////////////////////////////

function defaultErrorHandler( message, optionalErrorInformation ) {
   if( !window.console || !window.console.log ) {
      return;
   }

   const errFunc = !!window.console.error ? 'error' : 'log';
   window.console[ errFunc ]( message );

   if( optionalErrorInformation ) {
      Object.keys( optionalErrorInformation ).forEach( function( title ) {
         const info = optionalErrorInformation[ title ];
         window.console[ errFunc ]( '   - %s: %o', title, info );
         if( info instanceof Error && info.stack ) {
            window.console[ errFunc ]( '   - Stacktrace: %s', info.stack );
         }
      } );
   }
}

///////////////////////////////////////////////////////////////////////////////////////////////////////////

function ensureFunction( candidate, fallback ) {
   return typeof candidate === 'function' ? candidate : ( fallback || function( _ ) { return  _; } );
}

///////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Creates and returns a new event bus instance using the given configuration.
 *
 * @param {Function} nextTick
 *    a next tick function like `process.nextTick` or AngularJS' `$timeout`
 * @param {Function} timeoutFunction
 *    a timeout function like `window.setTimeout`  or AngularJS' `$timeout`
 * @param {Object} [optionalConfiguration]
 *    configuration for the event bus instance
 * @param {Number} optionalConfiguration.pendingDidTimeout
 *    the timeout in milliseconds used by {@link EventBus#publishAndGatherReplies}. Default is 120000ms
 *
 * @return {EventBus}
 */
export function create( nextTick, timeoutFunction, optionalConfiguration ) {
   assert( nextTick )
      .hasType( Function ).isNotNull( 'Need a next tick implementation like $timeout' );
   assert( timeoutFunction )
      .hasType( Function ).isNotNull( 'Need a timeout implementation like $timeout or setTimeout' );

   return new EventBus( nextTick, timeoutFunction, optionalConfiguration );
}
