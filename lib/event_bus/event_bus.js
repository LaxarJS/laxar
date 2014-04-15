/**
 * Copyright 2014 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
define( [
   '../utilities/assert',
   '../utilities/object',
   '../logging/log'
], function( assert, object, log ) {
   'use strict';

   var q_;
   var nextTick_;
   var timeoutFunction_;

   var WILDCARD = '*';
   var SUBSCRIBER_FIELD = '.';
   var INTERNAL_EVENTS_REGISTRY = 'ax__events';

   var PART_SEPARATOR = '.';
   var SUB_PART_SEPARATOR = '-';
   var REQUEST_MATCHER = /^(.)(.*)Request(\..+)?$/;

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   /**
    * @param {Object=} optionalConfiguration
    *    configuration for the event bus instance
    * @param {Number} optionalConfiguration.pendingDidTimeout
    *    the timeout in milliseconds used by {@link EventBus#publishAndGatherReplies}. Default is 120000ms
    * @constructor
    */
   function EventBus( optionalConfiguration ) {
      this.config_ = object.options( optionalConfiguration, {
         pendingDidTimeout: 120000
      } );

      this.cycleCounter_ = 0;
      this.eventQueue_ = [];
      this.subscriberTree_ = {};

      this.waitingDeferreds_ = [];
      this.currentCycle_ = -1;
      this.errorHandler_ = defaultErrorHandler;
      this.mediator_ = ensureFunction();
      this.inspectors_ = [];
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   /**
    * Sets an handler for all errors that may occur during event processing. It receives an error message as
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
    * subscribers. Its sole argument is the complete list of queued events, that should be delivered during
    * the current JavaScript event loop. It then needs to return this optionally modified list again. Events
    * may be added or deleted at will, but the return type needs to be an array containing zero or more event-
    * like objects.
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
    * this includes the following actions:
    * - `subscribe`: a new subscriber registered for an event
    * - `publish`: an event is published but not yet delivered
    * - `deliver`: an event is actually delivered to a subscriber
    *
    * An inspector receives a map with the following properties:
    * - `action`: one of the actions from above
    * - `source`: the origin of the `action`
    * - `target`: the name of the event subscriber (`deliver` action)
    * - `event`: the full name of the event or the subscribed event (`subscribe` action)
    * - `eventObject`: the published event item (`publish` action)
    * - `subscribedTo`: the event, possibly with omissions, the subscriber subscribed to (`deliver` action)
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
         var index = this.inspectors_.indexOf( inspector );
         if( index !== -1 ) {
            this.inspectors_.splice( index, 1 );
         }
      }.bind( this );
   };

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   /**
    * Subscribes to an event by name. An event name consists of so called _topics_, where each topic is
    * separated from another by dots (`.`). If a topic is omitted, this is treated as a wildcard. Note that
    * two dots in the middle or one dot at the beginning of an event name must remain, whereas a dot at the
    * end may be omitted. As such every event name has kind of wildcard at its end. For example these are
    * all valid event names:
    * - `some.event`: matches `some.event`, `some.event.again`
    * - `.event`: matches `some.event`, `any.event`, `any.event.again`
    * - `some..event`: matches `some.fancy.event`, `some.special.event`
    *
    * Additionally subtopics are supported. A subtopic are fragments within a topic, separated from another by
    * simple dashes (`-`). Here only suffixes of subtopics may be omitted when subscribing. Thus subscribing
    * to `some.event` would match an event published with name `some.event-again` or even
    * `some.event-another.again`.
    *
    * When an event is delivered, the subscriber function receives two arguments: First the event object
    * augmented by some properties and as second an actions object, that currently only provides an
    * `unsubscribe` method to be able to easily unsubscribe from further events.
    *
    * NEEDS FIX B: In order to prevent from collisions when augmenting the event object, all additional meta
    * information should be moved to the actions object (which should then be renamed). The event should only
    * contain the information supplied on publish.
    *
    * @param {String} eventName
    *    the name of the event to subscribe to
    * @param {Function} subscriber
    *    a function to call whenever an event matching the name is published
    * @param {String=} optionalSubscriberName
    *    a name for the subscriber (for debugging purpose)
    */
   EventBus.prototype.subscribe = function( eventName, subscriber, optionalSubscriberName ) {
      assert( eventName ).hasType( String ).isNotNull();
      assert( subscriber ).hasType( Function ).isNotNull();

      var subscriberName = typeof optionalSubscriberName  === 'string' ? optionalSubscriberName : '';
      var subscriberItem = {
         name: eventName,
         subscriber: subscriber,
         subscriberName: subscriberName,
         subscriptionWeight: calculateSubscriptionWeight( eventName )
      };

      var parts = eventName.split( PART_SEPARATOR );
      var node = this.subscriberTree_;
      for( var i = 0; i < parts.length; ++i ) {
         var bucketName = parts[i].length ? parts[i] : WILDCARD;
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
         source: subscriberName,
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

      var subscriberTree = this.subscriberTree_;
      subscriber[ INTERNAL_EVENTS_REGISTRY ].forEach( function( eventName ) {
         unsubscribeRecursively( subscriberTree, eventName.split( PART_SEPARATOR ), subscriber );
      } );

      delete subscriber[ INTERNAL_EVENTS_REGISTRY ];
   };

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function unsubscribeRecursively( node, parts, subscriber ) {
      if( parts.length === 0 && Array.isArray( node[ SUBSCRIBER_FIELD ] ) ) {
         var subscribers = node[ SUBSCRIBER_FIELD ];
         for( var i = subscribers.length -1; i >= 0; --i ) {
            if( subscribers[i].subscriber === subscriber ) {
               subscribers.splice( i, 1 );
            }
         }
      }

      var part = parts.shift();
      if( part === '' ) {
         part = WILDCARD;
      }
      if( part in node ) {
         unsubscribeRecursively( node[ part ], parts, subscriber );
      }
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   /**
    * Asynchronously publishes an event on the event bus. The returned promise will be queued as soon as this
    * event is delivered and, if during delivery a new event was enqueued, resolved after that new event was
    * delivered. If no new event is queued during delivery of this event, the promise is instantly resolved.
    * To make it a bit clearer, lets assume we publish and thus enqueue an event at time `t`. It then will be
    * delivered at time `t+1`. At that precise moment the promise is enqueued to be resolved soon. We then
    * distinguish between two cases:
    * - At time `t+1` no subscriber publishes (i.e. enqueues) an event: Thus there is no event in the same
    *   cycle and the promise is also resolved at time `t+1`.
    * - At least one subscriber publishes an event at time `t+1`: The promise is then scheduled to be resolved
    *   as soon as this event is delivered at time `t+2`.
    * The implication of this is the following:
    * We have two collaborators, A and B. A listens to event b and b listens to event A.
    * Whenever A publishes a and B than instantly (i.e. in the same event cycle of the JavaScript runtime its
    * subscriber function was called) "responds" by publishing b, b arrives at the subscriber function of A
    * before the promise of A's publish action is resolved.
    * It is hence possible to observe possible effects of an event send by oneself,under the conditions
    * mentioned above.
    *
    * @param {String} eventName
    *    the name of the event to publish
    * @param {Object=} optionalEvent
    *    the event to publish
    * @param {Object=} optionalOptions
    *    additional options for the publish action
    * @param {Boolean} optionalOptions.deliverToSender
    *    if `false` the event will not be send to subscribers whose subscriber name matches `event.sender`,
    *    else all subscribers will receive the event. Default is `true`.
    *
    * @return {Promise}
     *   the delivery promise
    */
   EventBus.prototype.publish = function( eventName, optionalEvent, optionalOptions ) {
      assert( eventName ).hasType( String ).isNotNull();

      var event = JSON.parse( JSON.stringify( optionalEvent || {} ) );
      var options = object.options( optionalOptions, {
         deliverToSender: true,
         sender: event.sender || null
      } );

      if( event.sender ) {
         log.warn( 'Deprecation warning: The event sender should be set in the options, not the event itself.\n' +
            'Sender: [0], Eventname: [1]', event.sender, eventName );
      }

      var eventItem = {
         meta: {
            name: eventName,
            cycleId: this.currentCycle_ > -1 ? this.currentCycle_ : this.cycleCounter_++,
            sender: options.sender,
            initiator: null,
            options: options
         },
         event: event,
         publishedDeferred: q_.defer()
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

      return eventItem.publishedDeferred.promise;
   };

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   /**
    * Publishes an event that follows the request-will-did pattern and awaits all replies. This pattern has
    * evolved over time and is of great use when handling the asynchronous nature of event bus events.
    *
    * Certain rules need to be fulfilled: First the initiator needs to call this method with an event whose
    * name has the suffix `Request`, e.g. `takeActionRequest`. All collaborators that want to react to this
    * event then either do so in the same event cycle by sending a `didTakeAction` event or announce that they
    * will do something asynchronously by publishing a `willTakeAction` event. In the latter case they need to
    * broadcast the end of their action by sending a `didTakeAction` event. Note that for both events the same
    * sender name needs to be given. Otherwise they cannot be mapped and the event bus doesn't know if all
    * asynchronous replies were already received.
    *
    * Additionally a timer is started using either the globally configured `pendingDidTimeout` ms value or the
    * value provided as option to this method. If that timer expires before all did* events to all given will*
    * events were received, the error handler is called to handle the incident and the promise is resolved as
    * normally.
    *
    * @param {String} eventName
    *    the name of the event to publish
    * @param {Object=} optionalEvent
    *    the event to publish
    * @param {Object=} optionalOptions
    *    additional options for the publish action
    * @param {Number} optionalOptions.pendingDidTimeout
    *    the timeout in milliseconds for pending did* events
    *
    * @return {Promise}
    */
   EventBus.prototype.publishAndGatherReplies = function( eventName, optionalEvent, optionalOptions ) {
      assert( eventName ).hasType( String ).isNotNull();

      var matches = REQUEST_MATCHER.exec( eventName );
      assert.state( !!matches, 'Expected eventName to end with "Request" but got ' + eventName );

      var self = this;
      var options = object.options( optionalOptions, {
         pendingDidTimeout: this.config_.pendingDidTimeout
      } );

      var eventNameSuffix = matches[1].toUpperCase() + matches[2];
      if( matches[3] ) {
         eventNameSuffix += matches[3];
      }
      var deferred = q_.defer();
      var willWaitingForDid = [];
      var givenDidResponses = [];
      var cycleFinished = false;

      function willCollector( event, meta ) {
         assert( meta.sender ).hasType( String )
            .isNotNull( 'A response with will to a request-event must contain a sender.' );

         willWaitingForDid.push( meta.sender );
      }
      this.subscribe( 'will' + eventNameSuffix, willCollector, options.sender );

      function didCollector( event, meta ) {
         givenDidResponses.push( { event: event, meta: meta } );

         var senderIndex = willWaitingForDid.indexOf( meta.sender );
         if( senderIndex !== -1 ) {
            willWaitingForDid.splice( senderIndex, 1 );
         }

         if( willWaitingForDid.length === 0 && cycleFinished ) {
            finish();
         }
      }
      this.subscribe( 'did' + eventNameSuffix, didCollector, options.sender );

      var timeoutRef = timeoutFunction_( function() {
         if( willWaitingForDid.length > 0 ) {
            var message = 'Timeout while waiting for pending did' + eventNameSuffix + ' on ' + eventName + '.';
            self.errorHandler_( message, {
               'Sender': options.sender,
               'After ms timeout': options.pendingDidTimeout,
               'Responses missing from': willWaitingForDid.join( ', ' )
            } );
            finish();
         }
      }, options.pendingDidTimeout );

      this.publish( eventName, optionalEvent, options ).then( function() {
         if( willWaitingForDid.length === 0 ) {
            // either there was no will or all did responses were already given in the same cycle as the will
            return finish();
         }

         cycleFinished = true;
      } );

      function finish() {
         clearTimeout( timeoutRef );
         self.unsubscribe( willCollector );
         self.unsubscribe( didCollector );
         deferred.resolve( givenDidResponses );
      }

      return deferred.promise;
   };

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function enqueueEvent( self, eventItem ) {
      if( self.eventQueue_.length === 0 ) {
         nextTick_( function() {
            var queuedEvents = self.eventQueue_;

            self.eventQueue_ = [];

            processWaitingDeferreds( self, processQueue( self, queuedEvents ) );
         } );
      }
      self.eventQueue_.push( eventItem );
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function processQueue( self, queuedEvents ) {
      return self.mediator_( queuedEvents ).map( function( eventItem ) {
         var meta = eventItem.meta;
         self.currentCycle_ = meta.cycleId;

         var subscribers = findSubscribers( self, meta.name );
         if( subscribers.length === 0 ) {
            return eventItem.publishedDeferred;
         }
         var serializedEvent = null;
         if( subscribers.length > 1 ) {
            serializedEvent = JSON.stringify( eventItem.event );
         }

         var senderName = meta.sender;
         var options = meta.options;

         subscribers.forEach( function( subscriberItem ) {
            var subscriberName = subscriberItem.subscriberName;
            if( !options.deliverToSender && senderName && senderName === subscriberName ) {
               return;
            }

            notifyInspectors( self, {
               action: 'deliver',
               source: senderName,
               target: subscriberName,
               event: meta.name,
               subscribedTo: subscriberItem.name,
               cycleId: meta.cycleId
            } );

            try {
               var event = serializedEvent ? JSON.parse( serializedEvent ) : eventItem.event;
               subscriberItem.subscriber( event, object.options( meta, {
                  unsubscribe: function() {
                     self.unsubscribe( subscriberItem.subscriber );
                  }
               } ) );
            }
            catch( e ) {
               var message = 'error while calling subscriber "' + subscriberName + '"' +
                  ' for event ' + meta.name +
                  ' published by "' + senderName + '" (subscribed to: ' + subscriberItem.name + ')';
               self.errorHandler_( message, {
                  'Exception': e,
                  'Published event': eventItem.event,
                  'Event meta information': meta,
                  'Caused by Subscriber': subscriberItem
               } );
            }
         } );

         self.currentCycle_ = -1;

         return eventItem.publishedDeferred;
      } );
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function processWaitingDeferreds( self, newDeferreds ) {
      var waitingDeferreds = self.waitingDeferreds_;
      self.waitingDeferreds_ = newDeferreds;

      waitingDeferreds.forEach( function( deferred ) {
         deferred.resolve();
      } );

      if( self.eventQueue_.length === 0 ) {
         // nothing was queued by any subscriber. The publishers can instantly be notified of delivery.
         newDeferreds.forEach( function( deferred ) {
            deferred.resolve();
         } );
         self.waitingDeferreds_ = [];
      }
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function findSubscribers( self, eventName ) {
      var subscribers = [];
      var parts = eventName.split( PART_SEPARATOR );
      var node = self.subscriberTree_;

      findSubscribersRecursively( node, parts, subscribers );
      subscribers.sort( function( a, b ) {
         var aWeight = a.subscriptionWeight;
         var bWeight = b.subscriptionWeight;
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

      var part = parts[ 0 ];
      parts = parts.slice( 1 );

      if( part.indexOf( SUB_PART_SEPARATOR ) !== -1 ) {
         var index = part.length;
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
      var parts = eventName.split( PART_SEPARATOR );
      var weight = [ 0, 0 ];
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

      var console = window.console;
      var errFunc = !!console.error ? 'error' : 'log';
      console[ errFunc ]( message );

      if( optionalErrorInformation ) {
         Object.keys( optionalErrorInformation ).forEach( function( title ) {
            var info = optionalErrorInformation[ title ];
            console[ errFunc ]( '   - %s: %o', title, info );
            if( info instanceof Error && info.stack ) {
               console[ errFunc ]( '   - Stacktrace: %s', info.stack );
            }
         } );
      }
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   /** @private */
   function ensureFunction( candidate, fallback ) {
      return typeof candidate === 'function' ? candidate : ( fallback || function( _ ) { return  _; } );
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   return {

      /**
       * Creates and returns a new event bus instance using the given configuration.
       *
       * @param {Object=} optionalConfiguration
       *    configuration for the event bus instance
       * @param {Number} optionalConfiguration.pendingDidTimeout
       *    the timeout in milliseconds used by {@link EventBus#publishAndGatherReplies}. Default is 120000ms
       *
       * @return {EventBus}
       */
      create: function( optionalConfiguration ) {
         assert( q_ ).isNotNull( 'Need a promise implementation like $q or Q' );
         assert( nextTick_ )
            .hasType( Function ).isNotNull( 'Need a next tick implementation like $timeout' );
         assert( timeoutFunction_ )
            .hasType( Function ).isNotNull( 'Need a timeout implementation like $timeout or setTimeout' );

         return new EventBus( optionalConfiguration );
      },

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      /**
       * Initializes the module.
       *
       * @param {Object} q
       *    a promise library like AngularJS' $q
       * @param {Function} nextTick
       *    a next tick function like process.nextTick or AngularJS' $timeout
       * @param {Function} timeoutFunction
       *    a timeout function like window.setTimeout  or AngularJS' $timeout
       */
      init: function( q, nextTick, timeoutFunction ) {
         q_ = q;
         nextTick_ = nextTick;
         timeoutFunction_ = timeoutFunction;
      }

   };

} );
