System.register("lib/utilities/fn.js", [], function (_export) {/**
                                                                * Copyright 2015 aixigo AG
                                                                * Released under the MIT license.
                                                                * http://laxarjs.org/license
                                                                */
   /**
    * Utilities for dealing with functions.
    *
    * When requiring `laxar`, it is available as `laxar.fn`.
    *
    * @module fn
    */

   /**
    * [Underscore `debounce`](http://underscorejs.org/#debounce) with the following modifications:
    *  - automatically mocked when accessed through `laxar/laxar_testing`
    *  - the generated function provides a `cancel()` method
    *
    * See [http://underscorejs.org/#debounce](http://underscorejs.org/#debounce) for detailed
    * documentation on the original version.
    *
    * ### Note on testing:
    *
    * You can set `laxar.fn._nowMilliseconds` and `laxar.fn._setTimout` to mock-functions in order to
    * help testing components that use `laxar.fn` or to test `laxar.fn` itself.
    *
    *
    * @param {Function} f
    *    the function to return a debounced version of
    * @param {Number} waitMs
    *    milliseconds to debounce before invoking `f`
    * @param {Boolean} immediate
    *    if `true` `f` is invoked prior to start waiting `waitMs` milliseconds. Otherwise `f` is invoked
    *    after the given debounce duration has passed. Default is `false`
    *
    * @return {Function}
    *    a debounced wrapper around the argument function f, with an additional method `cancel()`:
    *    After `cancel()` has been called, f will not be invoked anymore, no matter how often the wrapper\
    *    is called.
    */"use strict";var 



















































   _tooling; //////////////////////////////////////////////////////////////////////////////////////////////////////////////
   _export("debounce", debounce);function debounce(f, waitMs, immediate) {var MARK = {};var timeout, timestamp, result;var canceled = false;var debounced = function debounced() {var context = this;var args = [].slice.call(arguments);timestamp = _tooling.nowMilliseconds();var callNow = immediate && !timeout;if (!timeout) {timeout = _tooling.setTimeout(later, waitMs);}if (callNow && !canceled) {result = f.apply(context, args);}return result; /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                             * Check if the debounced function is ready for execution, and do so if it is.
                                                                                                                                                                                                                                                                                                                                                                                                                                                             * @param {Boolean} _force
                                                                                                                                                                                                                                                                                                                                                                                                                                                             *    This is only relevant when mocking `fn._setTimeout` to implement a force/flush for tests.
                                                                                                                                                                                                                                                                                                                                                                                                                                                             *    If the parameter is passed as `true`, no timing checks are performed prior to execution.
                                                                                                                                                                                                                                                                                                                                                                                                                                                             */function later(_force) {var sinceLast = _tooling.nowMilliseconds() - timestamp;if (_force || sinceLast >= waitMs) {timeout = null;if (!immediate && !canceled) {result = f.apply(context, args);if (!timeout) {context = args = null;}}return;}timeout = _tooling.setTimeout(later, waitMs - sinceLast);}};debounced.cancel = function () {canceled = true;};return debounced;}return { setters: [], execute: function () {_tooling = { /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        * Get the current time in milliseconds.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        * This API is intended to be used from tests only.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        *
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        * @return {Number}
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        *   the current time in milliseconds (`Date.now()`).
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        *   Ovewrride this from tests for reproducible results.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        */nowMilliseconds: function nowMilliseconds() {return Date.now();}, 
            /**
             * By default, invoke window.setTimeout with the given arguments.
             */
            setTimeout: function setTimeout() {
               return window.setTimeout.apply(window, arguments);} };_export("_tooling", _tooling);} };});

System.register('lib/runtime/runtime.js', ['angular', '../utilities/assert', '../utilities/path', '../loaders/paths'], function (_export) {/**
                                                                                                                                            * Copyright 2015 aixigo AG
                                                                                                                                            * Released under the MIT license.
                                                                                                                                            * http://laxarjs.org/license
                                                                                                                                            */'use strict';var ng, codeIsUnreachable, join, paths, 





   _module, 
   api;return { setters: [function (_angular) {ng = _angular['default'];}, function (_utilitiesAssert) {codeIsUnreachable = _utilitiesAssert.codeIsUnreachable;}, function (_utilitiesPath) {join = _utilitiesPath.join;}, function (_loadersPaths) {paths = _loadersPaths;}], execute: function () {_module = ng.module('axRuntime', []);api = { 
            provideQ: function provideQ() {
               codeIsUnreachable('Cannot provide q before AngularJS modules have been set up.');} };



         ///////////////////////////////////////////////////////////////////////////////////////////////////////////

         // Patching AngularJS with more aggressive scope destruction and memory leak prevention
         _module.run(['$rootScope', '$window', function ($rootScope, $window) {
            ng.element($window).one('unload', function () {
               while ($rootScope.$$childHead) {
                  $rootScope.$$childHead.$destroy();}

               $rootScope.$destroy();});}]);



         ///////////////////////////////////////////////////////////////////////////////////////////////////////////

         // Initialize the theme manager
         _module.run(['axCssLoader', 'axThemeManager', function (CssLoader, themeManager) {
            themeManager.
            urlProvider(join(paths.THEMES, '[theme]'), null, [paths.DEFAULT_THEME]).
            provide(['css/theme.css']).
            then(function (files) {
               CssLoader.load(files[0]);});}]);



         ///////////////////////////////////////////////////////////////////////////////////////////////////////////

         // Initialize i18n for i18n controls in non-i18n widgets
         _module.run(['$rootScope', 'axConfiguration', function ($rootScope, configuration) {
            $rootScope.i18n = { 
               locale: 'default', 
               tags: configuration.get('i18n.locales', { 'default': 'en' }) };}]);



         ///////////////////////////////////////////////////////////////////////////////////////////////////////////

         // Provide q as a tooling API to make sure all clients see the same mocked version during testing
         _module.run(['$q', function ($q) {
            api.provideQ = function () {
               return $q;};}]);



         ///////////////////////////////////////////////////////////////////////////////////////////////////////////
         _export('default', 
         { module: _module, api: api });} };});

System.register('lib/event_bus/event_bus.js', ['npm:babel-runtime@5.8.34/core-js/object/keys', '../utilities/assert', '../logging/log', '../utilities/object'], function (_export) {var _Object$keys, assert, log, object, 















   q_, 
   nextTick_, 
   timeoutFunction_, 

   WILDCARD, 
   SUBSCRIBER_FIELD, 
   INTERNAL_EVENTS_REGISTRY, 

   PART_SEPARATOR, 
   SUB_PART_SEPARATOR, 
   REQUEST_MATCHER;

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   /**
    * Constructor for an event bus.
    *
    * @param {Object} [optionalConfiguration]
    *    configuration for the event bus instance
    * @param {Number} optionalConfiguration.pendingDidTimeout
    *    the timeout in milliseconds used by {@link EventBus#publishAndGatherReplies}. Default is 120000ms
    *
    * @constructor
    * @private
    */
   function EventBus(optionalConfiguration) {
      this.config_ = object.options(optionalConfiguration, { 
         pendingDidTimeout: 120000 });


      this.cycleCounter_ = 0;
      this.eventQueue_ = [];
      this.subscriberTree_ = {};

      this.waitingDeferreds_ = [];
      this.currentCycle_ = -1;
      this.errorHandler_ = defaultErrorHandler;
      this.mediator_ = ensureFunction();
      this.inspectors_ = [];}


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




























































































































































































   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function unsubscribeRecursively(self, node, parts, subscriber) {
      if (parts.length === 0 && Array.isArray(node[SUBSCRIBER_FIELD])) {
         var subscribers = node[SUBSCRIBER_FIELD];
         for (var i = subscribers.length - 1; i >= 0; --i) {
            if (subscribers[i].subscriber === subscriber) {
               notifyInspectors(self, { 
                  action: 'unsubscribe', 
                  source: subscribers[i].subscriberName, 
                  target: '-', 
                  event: subscribers[i].name, 
                  cycleId: self.currentCycle_ });

               subscribers.splice(i, 1);}}}




      var part = parts.shift();
      if (part === '') {
         part = WILDCARD;}

      if (part in node) {
         unsubscribeRecursively(self, node[part], parts, subscriber);}}



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


















































































































































   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function enqueueEvent(self, eventItem) {
      if (self.eventQueue_.length === 0) {
         nextTick_(function () {
            var queuedEvents = self.eventQueue_;

            self.eventQueue_ = [];

            processWaitingDeferreds(self, processQueue(self, queuedEvents));});}


      self.eventQueue_.push(eventItem);}


   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function processQueue(self, queuedEvents) {
      return self.mediator_(queuedEvents).map(function (eventItem) {
         var meta = eventItem.meta;
         self.currentCycle_ = meta.cycleId;

         var subscribers = findSubscribers(self, meta.name);
         if (subscribers.length === 0) {
            self.currentCycle_ = -1;
            return eventItem.publishedDeferred;}


         var serializedEvent = null;
         if (subscribers.length > 1) {
            serializedEvent = JSON.stringify(eventItem.event);}


         var senderName = meta.sender;
         var options = meta.options;

         subscribers.forEach(function (subscriberItem) {
            var subscriberName = subscriberItem.subscriberName;
            if (!options.deliverToSender && senderName && senderName === subscriberName) {
               return;}


            try {
               var event;
               if (subscriberItem.options.clone) {
                  event = serializedEvent ? JSON.parse(serializedEvent) : eventItem.event;} else 

               {
                  event = object.deepFreeze(eventItem.event, true);}

               subscriberItem.subscriber(event, object.options(meta, { 
                  unsubscribe: function unsubscribe() {
                     self.unsubscribe(subscriberItem.subscriber);} }));} 



            catch (e) {
               var message = 'error while calling subscriber "' + subscriberName + '"' + 
               ' for event ' + meta.name + 
               ' published by "' + senderName + '" (subscribed to: ' + subscriberItem.name + ')';
               self.errorHandler_(message, { 
                  'Exception': e, 
                  'Published event': eventItem.event, 
                  'Event meta information': meta, 
                  'Caused by Subscriber': subscriberItem });}



            notifyInspectors(self, { 
               action: 'deliver', 
               source: senderName, 
               target: subscriberName, 
               event: meta.name, 
               eventObject: eventItem.event, 
               subscribedTo: subscriberItem.name, 
               cycleId: meta.cycleId });});



         self.currentCycle_ = -1;

         return eventItem.publishedDeferred;});}



   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function processWaitingDeferreds(self, newDeferreds) {
      var waitingDeferreds = self.waitingDeferreds_;
      self.waitingDeferreds_ = newDeferreds;

      waitingDeferreds.forEach(function (deferred) {
         deferred.resolve();});


      if (self.eventQueue_.length === 0) {
         // nothing was queued by any subscriber. The publishers can instantly be notified of delivery.
         newDeferreds.forEach(function (deferred) {
            deferred.resolve();});

         self.waitingDeferreds_ = [];}}



   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function findSubscribers(self, eventName) {
      var subscribers = [];
      var parts = eventName.split(PART_SEPARATOR);
      var node = self.subscriberTree_;

      findSubscribersRecursively(node, parts, subscribers);
      subscribers.sort(function (a, b) {
         var aWeight = a.subscriptionWeight;
         var bWeight = b.subscriptionWeight;
         if (aWeight[0] === bWeight[0]) {
            return bWeight[1] - aWeight[1];}


         return bWeight[0] - aWeight[0];});


      return subscribers;}


   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function findSubscribersRecursively(node, parts, subscribers) {
      if (Array.isArray(node[SUBSCRIBER_FIELD])) {
         subscribers.push.apply(subscribers, node[SUBSCRIBER_FIELD]);}


      if (parts.length === 0) {
         return;}


      var part = parts[0];
      parts = parts.slice(1);

      if (part.indexOf(SUB_PART_SEPARATOR) !== -1) {
         var index = part.length;
         do {
            part = part.substring(0, index);
            if (part in node) {
               findSubscribersRecursively(node[part], parts, subscribers);}

            index = part.lastIndexOf(SUB_PART_SEPARATOR);} while (

         index !== -1);} else 

      if (part in node) {
         findSubscribersRecursively(node[part], parts, subscribers);}


      if (WILDCARD in node) {
         findSubscribersRecursively(node[WILDCARD], parts, subscribers);}}



   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function calculateSubscriptionWeight(eventName) {
      var parts = eventName.split(PART_SEPARATOR);
      var weight = [0, 0];
      parts.forEach(function (part) {
         if (part.length > 0) {
            weight[0]++;
            weight[1] += part.split(SUB_PART_SEPARATOR).length - 1;}});


      return weight;}


   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function notifyInspectors(self, infoObject) {
      self.inspectors_.forEach(function (inspector) {
         inspector(infoObject);});}



   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function defaultErrorHandler(message, optionalErrorInformation) {
      if (!window.console || !window.console.log) {
         return;}


      var errFunc = !!window.console.error ? 'error' : 'log';
      window.console[errFunc](message);

      if (optionalErrorInformation) {
         _Object$keys(optionalErrorInformation).forEach(function (title) {
            var info = optionalErrorInformation[title];
            window.console[errFunc]('   - %s: %o', title, info);
            if (info instanceof Error && info.stack) {
               window.console[errFunc]('   - Stacktrace: %s', info.stack);}});}}





   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function ensureFunction(candidate, fallback) {
      return typeof candidate === 'function' ? candidate : fallback || function (_) {return _;};}


   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   /**
    * Creates and returns a new event bus instance using the given configuration.
    *
    * @param {Object} [optionalConfiguration]
    *    configuration for the event bus instance
    * @param {Number} optionalConfiguration.pendingDidTimeout
    *    the timeout in milliseconds used by {@link EventBus#publishAndGatherReplies}. Default is 120000ms
    *
    * @return {EventBus}
    */
   function create(optionalConfiguration) {
      assert(q_).isNotNull('Need a promise implementation like $q or Q');
      assert(nextTick_).
      hasType(Function).isNotNull('Need a next tick implementation like $timeout');
      assert(timeoutFunction_).
      hasType(Function).isNotNull('Need a timeout implementation like $timeout or setTimeout');

      return new EventBus(optionalConfiguration);}


   ////////////////////////////////////////////////////////////////////////////////////////////////////////

   /**
    * Initializes the module.
    *
    * @param {Object} q
    *    a promise library like AngularJS' `$q`
    * @param {Function} nextTick
    *    a next tick function like `process.nextTick` or AngularJS' `$timeout`
    * @param {Function} timeoutFunction
    *    a timeout function like `window.setTimeout`  or AngularJS' `$timeout`
    */
   function init(q, nextTick, timeoutFunction) {
      q_ = q;
      nextTick_ = nextTick;
      timeoutFunction_ = timeoutFunction;}return { setters: [function (_babelRuntimeCoreJsObjectKeys) {_Object$keys = _babelRuntimeCoreJsObjectKeys['default'];}, function (_utilitiesAssert) {assert = _utilitiesAssert['default'];}, function (_loggingLog) {log = _loggingLog['default'];}, function (_utilitiesObject) {object = _utilitiesObject;}], execute: function () {/**
                                                                                                                                                                                                                                                                                                                                                                                 * Copyright 2015 aixigo AG
                                                                                                                                                                                                                                                                                                                                                                                 * Released under the MIT license.
                                                                                                                                                                                                                                                                                                                                                                                 * http://laxarjs.org/license
                                                                                                                                                                                                                                                                                                                                                                                 */ /**
                                                                                                                                                                                                                                                                                                                                                                                     * The *event_bus* module contains the implementation of the *LaxarJS EventBus*. In an application you'll
                                                                                                                                                                                                                                                                                                                                                                                     * never use this module or instantiate an event bus instance directly. Instead within a widget the event bus
                                                                                                                                                                                                                                                                                                                                                                                     * can be injected via service or accessed as property on the AngularJS `$scope` or `axContext` injections.
                                                                                                                                                                                                                                                                                                                                                                                     *
                                                                                                                                                                                                                                                                                                                                                                                     * @module event_bus
                                                                                                                                                                                                                                                                                                                                                                                     */'use strict';_export('create', create);_export('init', init);WILDCARD = '*';SUBSCRIBER_FIELD = '.';INTERNAL_EVENTS_REGISTRY = 'ax__events';PART_SEPARATOR = '.';SUB_PART_SEPARATOR = '-';REQUEST_MATCHER = /^([^.])([^.]*)Request(\..+)?$/;EventBus.prototype.setErrorHandler = function (errorHandler) {this.errorHandler_ = ensureFunction(errorHandler, defaultErrorHandler);}; ///////////////////////////////////////////////////////////////////////////////////////////////////////////
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
          */EventBus.prototype.setMediator = function (mediator) {this.mediator_ = ensureFunction(mediator);}; ///////////////////////////////////////////////////////////////////////////////////////////////////////////
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
          */EventBus.prototype.addInspector = function (inspector) {assert(inspector).hasType(Function).isNotNull();this.inspectors_.push(inspector);return (function () {var index = this.inspectors_.indexOf(inspector);if (index !== -1) {this.inspectors_.splice(index, 1);}}).bind(this);}; ///////////////////////////////////////////////////////////////////////////////////////////////////////////
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
          */EventBus.prototype.subscribe = function (eventName, subscriber, optionalOptions) {assert(eventName).hasType(String).isNotNull();assert(subscriber).hasType(Function).isNotNull();var options = object.options(optionalOptions, { subscriber: null, clone: true });var subscriberItem = { name: eventName, subscriber: subscriber, subscriberName: options.subscriber, subscriptionWeight: calculateSubscriptionWeight(eventName), options: options };var parts = eventName.split(PART_SEPARATOR);var node = this.subscriberTree_;for (var i = 0; i < parts.length; ++i) {var bucketName = parts[i].length ? parts[i] : WILDCARD;if (!(bucketName in node)) {node[bucketName] = {};}node = node[bucketName];}if (!(SUBSCRIBER_FIELD in node)) {node[SUBSCRIBER_FIELD] = [];}node[SUBSCRIBER_FIELD].push(subscriberItem);if (!subscriber.hasOwnProperty(INTERNAL_EVENTS_REGISTRY)) {subscriber[INTERNAL_EVENTS_REGISTRY] = [];}subscriber[INTERNAL_EVENTS_REGISTRY].push(eventName);notifyInspectors(this, { action: 'subscribe', source: options.subscriber, target: '-', event: eventName, cycleId: this.currentCycle_ });}; ///////////////////////////////////////////////////////////////////////////////////////////////////////////
         /**
          * Removes all subscriptions of the given subscriber.
          *
          * @param {Function} subscriber
          *    the function to unsubscribe
          */EventBus.prototype.unsubscribe = function (subscriber) {assert(subscriber).hasType(Function).isNotNull();if (!subscriber.hasOwnProperty(INTERNAL_EVENTS_REGISTRY) || !Array.isArray(subscriber[INTERNAL_EVENTS_REGISTRY])) {return;}var self = this;var subscriberTree = this.subscriberTree_;subscriber[INTERNAL_EVENTS_REGISTRY].forEach(function (eventName) {unsubscribeRecursively(self, subscriberTree, eventName.split(PART_SEPARATOR), subscriber);});delete subscriber[INTERNAL_EVENTS_REGISTRY];};EventBus.prototype.publish = function (eventName, optionalEvent, optionalOptions) {assert(eventName).hasType(String).isNotNull();var event = JSON.parse(JSON.stringify(optionalEvent || {}));var options = object.options(optionalOptions, { deliverToSender: true, sender: event.sender || null });if (event.sender) {log.warn('Deprecation warning: The event sender should be set in the options, not the event itself.\n' + 'Sender: [0], Eventname: [1]', event.sender, eventName);}var eventItem = { meta: { name: eventName, cycleId: this.currentCycle_ > -1 ? this.currentCycle_ : this.cycleCounter_++, sender: options.sender, initiator: null, options: options }, event: event, publishedDeferred: q_.defer() };enqueueEvent(this, eventItem);notifyInspectors(this, { action: 'publish', source: options.sender, target: '-', event: eventName, eventObject: event, cycleId: eventItem.meta.cycleId });return eventItem.publishedDeferred.promise;}; ///////////////////////////////////////////////////////////////////////////////////////////////////////////
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
          */EventBus.prototype.publishAndGatherReplies = function (eventName, optionalEvent, optionalOptions) {assert(eventName).hasType(String).isNotNull();var matches = REQUEST_MATCHER.exec(eventName);assert.state(!!matches, 'Expected eventName to end with "Request" but got ' + eventName);var self = this;var options = object.options(optionalOptions, { pendingDidTimeout: this.config_.pendingDidTimeout });var eventNameSuffix = matches[1].toUpperCase() + matches[2];if (matches[3]) {eventNameSuffix += matches[3];}var deferred = q_.defer();var willWaitingForDid = [];var givenDidResponses = [];var cycleFinished = false;function willCollector(event, meta) {assert(meta.sender).hasType(String).isNotNull('A response with will to a request-event must contain a sender.');willWaitingForDid.push(meta.sender);}this.subscribe('will' + eventNameSuffix, willCollector, { subscriber: options.sender });function didCollector(event, meta) {givenDidResponses.push({ event: event, meta: meta });var senderIndex = willWaitingForDid.indexOf(meta.sender);if (senderIndex !== -1) {willWaitingForDid.splice(senderIndex, 1);}if (willWaitingForDid.length === 0 && cycleFinished) {finish();}}this.subscribe('did' + eventNameSuffix, didCollector, { subscriber: options.sender });var timeoutRef = timeoutFunction_(function () {if (willWaitingForDid.length > 0) {var message = 'Timeout while waiting for pending did' + eventNameSuffix + ' on ' + eventName + '.';self.errorHandler_(message, { 'Sender': options.sender, 'After ms timeout': options.pendingDidTimeout, 'Responses missing from': willWaitingForDid.join(', ') });finish(true);}}, options.pendingDidTimeout);this.publish(eventName, optionalEvent, options).then(function () {if (willWaitingForDid.length === 0) {// either there was no will or all did responses were already given in the same cycle as the will
                  finish();return;}cycleFinished = true;});function finish(wasCanceled) {clearTimeout(timeoutRef);self.unsubscribe(willCollector);self.unsubscribe(didCollector);(wasCanceled ? deferred.reject : deferred.resolve)(givenDidResponses);}return deferred.promise;};} };});

System.register('lib/i18n/i18n.js', ['npm:babel-runtime@5.8.34/core-js/object/keys', '../utilities/assert', '../utilities/string', '../utilities/configuration'], function (_export) {var _Object$keys, assert, string, configuration, 















   localize, 



   primitives, 





   fallbackTag, 

   normalize, 






   format, 
   keys;









   /**
    * Shortcut to {@link localizeRelaxed}.
    *
    * @name localize
    * @type {Function}
    */

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   /**
    * Localize the given internationalized object using the given languageTag.
    *
    * @param {String} languageTag
    *    the languageTag to lookup a localization with. Maybe `undefined`, if the value is not i18n (app does
    *    not use i18n)
    * @param {*} i18nValue
    *    a possibly internationalized value:
    *    - when passing a primitive value, it is returned as-is
    *    - when passing an object, the languageTag is used as a key within that object
    * @param {*} [optionalFallback]
    *    a value to use if no localization is available for the given language tag
    *
    * @return {*}
    *    the localized value if found, `undefined` otherwise
    */
   function localizeStrict(languageTag, i18nValue, optionalFallback) {
      assert(languageTag).hasType(String);
      if (!i18nValue || primitives[typeof i18nValue]) {
         // Value is not i18n
         return i18nValue;}

      assert(languageTag).isNotNull();

      // Try one direct lookup before scanning the input keys,
      // assuming that language-tags are written in consistent style.
      var value = i18nValue[languageTag];
      if (value !== undefined) {
         return value;}


      var lookupKey = normalize(languageTag);
      var availableTags = keys(i18nValue);
      var n = availableTags.length;
      for (var i = 0; i < n; ++i) {
         var t = availableTags[i];
         if (normalize(t) === lookupKey) {
            return i18nValue[t];}}



      return optionalFallback;}


   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   /**
    * For controls (such as a date-picker), we cannot anticipate all required language tags, as they may be
    * app-specific. The relaxed localize behaves like localize if an exact localization is available. If not,
    * the language tag is successively generalized by stripping off the rightmost sub-tags until a
    * localization is found. Eventually, a fallback ('en') is used.
    *
    * @param {String} languageTag
    *    the languageTag to lookup a localization with. Maybe `undefined`, if the value is not i18n (app does
    *    not use i18n)
    * @param {*} i18nValue
    *    a possibly internationalized value:
    *    - when passing a primitive value, it is returned as-is
    *    - when passing an object, the `languageTag` is used to look up a localization within that object
    * @param {*} [optionalFallback]
    *    a value to use if no localization is available for the given language tag
    *
    * @return {*}
    *    the localized value if found, the fallback `undefined` otherwise
    */
   function localizeRelaxed(languageTag, i18nValue, optionalFallback) {
      assert(languageTag).hasType(String);
      if (!i18nValue || primitives[typeof i18nValue]) {
         // Value is not i18n (app does not use it)
         return i18nValue;}


      var tagParts = languageTag ? languageTag.replace(/-/g, '_').split('_') : [];
      while (tagParts.length > 0) {
         var currentLocaleTag = tagParts.join('-');
         var value = localizeStrict(currentLocaleTag, i18nValue);
         if (value !== undefined) {
            return value;}

         tagParts.pop();}


      if (fallbackTag === undefined) {
         fallbackTag = configuration.get('i18n.fallback', 'en');}


      return fallbackTag && localizeStrict(fallbackTag, i18nValue) || optionalFallback;}


   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   /**
    * Encapsulate a given languageTag in a partially applied localize function.
    *
    * @param {String} languageTag
    *    the languageTag to lookup localizations with
    * @param {*} [optionalFallback]
    *    a value to use by the localizer function whenever no localization is available for the language tag
    *
    * @return {Localizer}
    *    A single-arg localize-Function, which always uses the given language-tag. It also has a `.format`
    *    -method, which can be used as a shortcut to `string.format( localize( x ), args )`
    */
   function localizer(languageTag, optionalFallback) {

      /**
       * @name Localizer
       * @private
       */
      function partial(i18nValue) {
         return localize(languageTag, i18nValue, optionalFallback);}


      /**
       * Shortcut to string.format, for simple chaining to the localizer.
       *
       * These are equal:
       * - `string.format( i18n.localizer( tag )( i18nValue ), numericArgs, namedArgs )`
       * - `i18n.localizer( tag ).format( i18nValue, numericArgs, namedArgs )`.
       *
       * @param {String} i18nValue
       *    the value to localize and then format
       * @param {Array} [optionalIndexedReplacements]
       *    replacements for any numeric placeholders in the localized value
       * @param {Object} [optionalNamedReplacements]
       *    replacements for any named placeholders in the localized value
       *
       * @return {String}
       *    the formatted string, taking i18n into account
       *
       * @memberOf Localizer
       */
      partial.format = function (i18nValue, optionalIndexedReplacements, optionalNamedReplacements) {
         var formatString = localize(languageTag, i18nValue);
         if (formatString === undefined) {
            return optionalFallback;}

         return format(formatString, optionalIndexedReplacements, optionalNamedReplacements);};


      return partial;}


   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   /**
    * Retrieve the language tag of the current locale from an i18n model object, such as used on the scope.
    *
    * @param {{locale: String, tags: Object<String, String>}} i18n
    *    an internationalization model, with reference to the currently active locale and a map from locales
    *    to language tags
    * @param {*} [optionalFallbackLanguageTag]
    *    a language tag to use if no tags are found on the given object
    *
    * @return {String}
    *    the localized value if found, `undefined` otherwise
    */
   function languageTagFromI18n(i18n, optionalFallbackLanguageTag) {
      if (!i18n || !i18n.hasOwnProperty('tags')) {
         return optionalFallbackLanguageTag;}

      return i18n.tags[i18n.locale] || optionalFallbackLanguageTag;}


   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function memoize(f) {
      var cache = {};
      return function (key) {
         var value = cache[key];
         if (value === undefined) {
            value = f(key);
            cache[key] = value;}

         return value;};}return { setters: [function (_babelRuntimeCoreJsObjectKeys) {_Object$keys = _babelRuntimeCoreJsObjectKeys['default'];}, function (_utilitiesAssert) {assert = _utilitiesAssert['default'];}, function (_utilitiesString) {string = _utilitiesString;}, function (_utilitiesConfiguration) {configuration = _utilitiesConfiguration;}], execute: function () {/**
                                                                                                                                                                                                                                                                                                                                                                                       * Copyright 2015 aixigo AG
                                                                                                                                                                                                                                                                                                                                                                                       * Released under the MIT license.
                                                                                                                                                                                                                                                                                                                                                                                       * http://laxarjs.org/license
                                                                                                                                                                                                                                                                                                                                                                                       */ /**
                                                                                                                                                                                                                                                                                                                                                                                           * Utilities for dealing with internationalization (i18n).
                                                                                                                                                                                                                                                                                                                                                                                           *
                                                                                                                                                                                                                                                                                                                                                                                           * When requiring `laxar`, it is available as `laxar.i18n`.
                                                                                                                                                                                                                                                                                                                                                                                           *
                                                                                                                                                                                                                                                                                                                                                                                           * @module i18n
                                                                                                                                                                                                                                                                                                                                                                                           */'use strict';localize = localizeRelaxed; ///////////////////////////////////////////////////////////////////////////////////////////////////////////
         primitives = { string: true, number: true, boolean: true };normalize = memoize(function (languageTag) {return languageTag.toLowerCase().replace(/[-]/g, '_');}); ///////////////////////////////////////////////////////////////////////////////////////////////////////////
         // Shortcuts: it is assumed that this module is used heavily (or not at all).
         format = string.format;keys = _Object$keys;_export('localize', localize);_export('localizeStrict', localizeStrict);_export('localizeRelaxed', localizeRelaxed);_export('localizer', localizer);_export('languageTagFromI18n', languageTagFromI18n);} };});

System.register('lib/file_resource_provider/file_resource_provider.js', ['npm:babel-runtime@5.8.34/core-js/object/keys', '../utilities/assert', '../utilities/string', '../utilities/path', '../utilities/configuration'], function (_export) {var _Object$keys, assert, string, path, configuration, 





















   q_, 
   httpClient_, 
   BORDER_SLASHES_MATCHER, 
   ENTRY_TYPE_FILE;

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   /**
    * A provider for file resources that tries to minimize the amount of 404 errors when requesting files that
    * are not available. To achieve this it is backed by one or more directory tree mappings that already list
    * which files are available on the server. For any file being located at a path that is not supported by a
    * mapping, a HEAD request takes place, that might or might not result in a 404 error. If a file is
    * located at a path supported by a mapping, but is not found in that mapping (because it was added later),
    * it is assumed to be nonexistent.
    *
    * @param {String} rootPath
    *    the path to the root of the application. It is needed to prefix relative paths found in a listing
    *    with an absolute prefix
    *
    * @constructor
    * @private
    */
   function FileResourceProvider(rootPath) {
      this.useEmbedded_ = configuration.get('useEmbeddedFileListings', false);
      this.rootPath_ = path.normalize(rootPath);
      this.fileListings_ = {};
      this.fileListingUris_ = {};

      this.httpGets_ = {};
      this.httpHeads_ = {};
      this.httpHeadCache_ = {};}


   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   /**
    * If available, resolves the returned promise with the requested file's contents. Otherwise the promise is
    * rejected. It uses the file mapping prior to fetching the contents to prevent from 404 errors. In the
    * optimal case the contents are already embedded in the listing and simply need to be returned. If no
    * listing for the path is available, a request simply takes place and either succeeds or fails.
    *
    * @param {String} url
    *    the uri to the resource to provide
    *
    * @return {Promise}
    *    resolved with the file's content or rejected when the file could not be fetched
    */






































































   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   /**
    * Try to lookup a file resource in the provider's listings.
    *
    * @return {Promise}
    *    Resolves to `true` (listed but not embedded), to `false` (file is not listed), or to a string
    *    (embedded content for a listed file).
    *
    * @private
    */
   function entry(provider, resourcePath) {
      var usablePrefixes = _Object$keys(provider.fileListingUris_).filter(function (prefix) {
         return resourcePath.indexOf(prefix) === 0;});


      if (usablePrefixes.length) {
         var prefix = usablePrefixes[0];
         return fetchListingForPath(provider, prefix).then(function (listing) {
            return q_.when(lookup(provider, resourcePath, listing));});}



      return q_.reject();

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      function lookup(self, file, listing) {
         var parts = file.replace(self.rootPath_, '').replace(BORDER_SLASHES_MATCHER, '').split('/');
         for (var i = 0, len = parts.length; i < len; ++i) {
            if (i === len - 1) {
               var value = listing[parts[i]];
               if (self.useEmbedded_) {
                  return typeof value === 'string' ? value : value === ENTRY_TYPE_FILE;} else 

               {
                  return typeof value === 'string' || value === ENTRY_TYPE_FILE;}}



            listing = listing[parts[i]];
            if (typeof listing !== 'object') {
               return false;}}}}





   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function resourceTransform(path) {
      return (/\.json$/.test(path) ? 
         function (contents) {return JSON.parse(contents);} : 
         function (contents) {return contents;});}


   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function fetchListingForPath(self, path) {
      if (self.fileListings_[path]) {
         return q_.when(self.fileListings_[path]);}


      var listingUri = self.fileListingUris_[path];
      return httpGet(self, listingUri).
      then(resourceTransform(listingUri)).
      then(function (listing) {
         self.fileListings_[path] = listing;
         return listing;});}



   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   /**
    * @param {FileResourceProvider} self
    * @param {String} url A url to get
    *
    * @return {Promise<String>} Resolved to the file contents if the request succeeds
    *
    * @private
    */
   function httpGet(self, url) {
      if (url in self.httpGets_) {
         return self.httpGets_[url];}


      var promise = self.httpGets_[url] = httpClient_.
      get(url, { transformResponse: [] }).
      then(function (response) {
         return q_.when(response.data);});


      // Free memory when the response is complete:
      promise.then(function () {
         delete self.httpGets_[url];});


      return promise;}


   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   /**
    * @param {FileResourceProvider} self
    * @param {String} url A url to check using a HEAD request
    *
    * @return {Promise<Boolean>} Resolved to `true` if a HEAD-request to the url succeeds, else to `false`.
    *
    * @private
    */
   function httpHead(self, url) {
      if (url in self.httpHeadCache_) {
         return q_.when(self.httpHeadCache_[url]);}

      if (url in self.httpHeads_) {
         return self.httpHeads_[url];}


      var promise = self.httpHeads_[url] = httpClient_.head(url).
      then(function () {
         return true;}, 
      function () {
         return false;});


      // Free memory and cache result when the response is complete:
      promise.then(function (result) {
         self.httpHeadCache_[url] = result;
         delete self.httpHeads_[url];});


      return promise;}


   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   /**
    * Creates and returns a new instance.
    *
    * @param {String} rootPath
    *    the path to the root of the application. It is needed to prefix relative paths found in a listing
    *    with an absolute prefix
    *
    * @return {FileResourceProvider}
    *    a new instance
    */
   function create(rootPath) {
      assert(q_).isNotNull('Need a promise implementation like $q or Q');
      assert(httpClient_).isNotNull('Need a http client implementation like $http');

      return new FileResourceProvider(rootPath);}


   ////////////////////////////////////////////////////////////////////////////////////////////////////////

   /**
    * Initializes the module.
    *
    * @param {Object} q
    *    a promise library like AngularJS' `$q`
    * @param {Object} httpClient
    *    a http client whose api conforms to AngularJS' `$http` service
    */
   function init(q, httpClient) {
      q_ = q;
      httpClient_ = httpClient;}return { setters: [function (_babelRuntimeCoreJsObjectKeys) {_Object$keys = _babelRuntimeCoreJsObjectKeys['default'];}, function (_utilitiesAssert) {assert = _utilitiesAssert['default'];}, function (_utilitiesString) {string = _utilitiesString;}, function (_utilitiesPath) {path = _utilitiesPath;}, function (_utilitiesConfiguration) {configuration = _utilitiesConfiguration;}], execute: function () {/**
                                                                                                                                                                                                                                                                                                                                                                                                                                                  * Copyright 2015 aixigo AG
                                                                                                                                                                                                                                                                                                                                                                                                                                                  * Released under the MIT license.
                                                                                                                                                                                                                                                                                                                                                                                                                                                  * http://laxarjs.org/license
                                                                                                                                                                                                                                                                                                                                                                                                                                                  */ /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                      * The *file_resource_provider* module defines a mechanism to load static assets from the web server of the
                                                                                                                                                                                                                                                                                                                                                                                                                                                      * LaxarJS application efficiently. Whenever a file should be requested from the server, the file resource
                                                                                                                                                                                                                                                                                                                                                                                                                                                      * provider should be used in favor of manual http requests, due to two reasons: During development it reduces
                                                                                                                                                                                                                                                                                                                                                                                                                                                      * the amount of `404` status replies for files that may or may not exist, and when making a release build,
                                                                                                                                                                                                                                                                                                                                                                                                                                                      * file contents may optionally be embedded in the build bundle. This makes further http requests redundant,
                                                                                                                                                                                                                                                                                                                                                                                                                                                      * which is especially relevant in high-latency networks, such as cellular networks.
                                                                                                                                                                                                                                                                                                                                                                                                                                                      *
                                                                                                                                                                                                                                                                                                                                                                                                                                                      * This module should not be used directly, but via the `axFileResourceProvider` service provided by LaxarJS.
                                                                                                                                                                                                                                                                                                                                                                                                                                                      *
                                                                                                                                                                                                                                                                                                                                                                                                                                                      * @module file_resource_provider
                                                                                                                                                                                                                                                                                                                                                                                                                                                      */'use strict';_export('create', create);_export('init', init);BORDER_SLASHES_MATCHER = /^\/|\/$/g;ENTRY_TYPE_FILE = 1;FileResourceProvider.prototype.provide = function (url) {var self = this;return entry(this, url).then(function (knownEntry) {if (typeof knownEntry === 'string') {return q_.when(knownEntry).then(resourceTransform(url));}return knownEntry !== false ? httpGet(self, url).then(resourceTransform(url)) : q_.reject();}, function () {return httpGet(self, url).then(resourceTransform(url));});}; ///////////////////////////////////////////////////////////////////////////////////////////////////////////
         /**
          * Resolves the returned promise with `true` as argument, if the requested resource is available and
          * `false` otherwise.  If no listing for the path is available, a HEAD request takes place and either
          * succeeds or fails.
          *
          * @param {String} url
          *    the uri to check for availability
          *
          * @return {Promise}
          *    a promise that is always resolved with a boolean value
          */FileResourceProvider.prototype.isAvailable = function isAvailable(url) {var self = this;return entry(self, url).then(function (knownEntry) {return q_.when(knownEntry !== false);}, function () {return httpHead(self, url).then(function (knownAvailable) {return q_.when(knownAvailable);});});}; ///////////////////////////////////////////////////////////////////////////////////////////////////////////
         /**
          * Sets the uri to a file listing file for a given path.
          *
          * @param {String} directory
          *    the directory the file listing is valid for
          * @param {String} listingUri
          *    the uri to the listing file
          */FileResourceProvider.prototype.setFileListingUri = function (directory, listingUri) {var filePathPrefix = path.join(this.rootPath_, directory);this.fileListingUris_[filePathPrefix] = path.join(this.rootPath_, listingUri);this.fileListings_[filePathPrefix] = null;fetchListingForPath(this, filePathPrefix);}; ///////////////////////////////////////////////////////////////////////////////////////////////////////////
         /**
          * Sets the contents of a file listing file to the given object. This a useful alternative to
          * {@link FileResourceProvider#setFileListingUri}, to avoid an additional round-trip during production.
          *
          * @param {String} directory
          *    the directory the file listing is valid for
          * @param {String} listing
          *    the actual file listing
          */FileResourceProvider.prototype.setFileListingContents = function (directory, listing) {var filePathPrefix = path.join(this.rootPath_, directory);this.fileListingUris_[filePathPrefix] = '#';this.fileListings_[filePathPrefix] = listing;};} };});

System.register('lib/loaders/layout_loader.js', ['../utilities/path'], function (_export) {/**
                                                                                            * Copyright 2015 aixigo AG
                                                                                            * Released under the MIT license.
                                                                                            * http://laxarjs.org/license
                                                                                            */'use strict';var path;_export('create', create);


   function create(layoutsRoot, themesRoot, cssLoader, themeManager, fileResourceProvider, cache) {
      return { 
         load: function load(layout) {
            return resolveLayout(layout).then(
            function (layoutInfo) {
               if (layoutInfo.css) {
                  cssLoader.load(layoutInfo.css);}

               if (layoutInfo.html) {
                  return fileResourceProvider.provide(layoutInfo.html).then(function (htmlContent) {
                     layoutInfo.htmlContent = htmlContent;
                     if (cache) {
                        cache.put(layoutInfo.html, htmlContent);}

                     return layoutInfo;});}


               return layoutInfo;});} };





      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      function resolveLayout(layout) {
         var layoutPath = path.join(layoutsRoot, layout);
         var layoutName = layoutPath.substr(layoutPath.lastIndexOf('/') + 1);
         var layoutFile = layoutName + '.html';
         var cssFile = 'css/' + layoutName + '.css';

         return themeManager.urlProvider(
         path.join(layoutPath, '[theme]'), 
         path.join(themesRoot, '[theme]', 'layouts', layout)).
         provide([layoutFile, cssFile]).then(
         function (results) {
            return { 
               html: results[0], 
               css: results[1], 
               className: layoutName.replace(/\//g, '').replace(/_/g, '-') + '-layout' };});}}return { setters: [function (_utilitiesPath) {path = _utilitiesPath;}], execute: function () {} };});

System.register('lib/runtime/runtime_services.js', ['angular', '../event_bus/event_bus', '../i18n/i18n', '../file_resource_provider/file_resource_provider', '../logging/log', '../utilities/object', '../utilities/path', '../loaders/layout_loader', '../loaders/paths', '../utilities/configuration', './controls_service', './theme_manager'], function (_export) {/**
                                                                                                                                                                                                                                                                                                                                                                        * Copyright 2015 aixigo AG
                                                                                                                                                                                                                                                                                                                                                                        * Released under the MIT license.
                                                                                                                                                                                                                                                                                                                                                                        * http://laxarjs.org/license
                                                                                                                                                                                                                                                                                                                                                                        */
   /**
    * This module provides some services for AngularJS DI. Although it is fine to use these services in widgets,
    * most of them are primarily intended to be used internally by LaxarJS. Documentation is nevertheless of use
    * when e.g. they need to be mocked during tests.
    *
    * @module axRuntimeServices
    */




   // TODO: should be changed to "import * as log" as soon as default export in log is removed
   'use strict';var ng, eventBus, i18n, fileResourceProvider, log, object, path, layoutLoader, paths, configuration, controlsService, themeManager, 








   _module, 



   $qProvider_, 












































































































































































































































































































































































































































































































































































































































































































   CONFIG_KEY_HTTP_LOGGING_HEADER, 

























   sensitiveData, 





















   name;function eventBusErrorHandler(message, optionalErrorInformation) {log.error('EventBus: ' + message);if (optionalErrorInformation) {ng.forEach(optionalErrorInformation, function (info, title) {var formatString = '   - [0]: [1:%o]';if (sensitiveData.indexOf(title) !== -1) {formatString = '   - [0]: [1:%o:anonymize]';}log.error(formatString, title, info);if (info instanceof Error && info.stack) {log.error('   - Stacktrace: ' + info.stack);}});}} ///////////////////////////////////////////////////////////////////////////////////////////////////////////
   return { setters: [function (_angular) {ng = _angular['default'];}, function (_event_busEvent_bus) {eventBus = _event_busEvent_bus;}, function (_i18nI18n) {i18n = _i18nI18n;}, function (_file_resource_providerFile_resource_provider) {fileResourceProvider = _file_resource_providerFile_resource_provider;}, function (_loggingLog) {log = _loggingLog['default'];}, function (_utilitiesObject) {object = _utilitiesObject;}, function (_utilitiesPath) {path = _utilitiesPath;}, function (_loadersLayout_loader) {layoutLoader = _loadersLayout_loader;}, function (_loadersPaths) {paths = _loadersPaths;}, function (_utilitiesConfiguration) {configuration = _utilitiesConfiguration;}, function (_controls_service) {controlsService = _controls_service;}, function (_theme_manager) {themeManager = _theme_manager;}], execute: function () {_module = ng.module('axRuntimeServices', []); ///////////////////////////////////////////////////////////////////////////////////////////////////////////
         _module.config(['$qProvider', '$httpProvider', function ($qProvider, $httpProvider) {$qProvider_ = $qProvider;if (configuration.get(CONFIG_KEY_HTTP_LOGGING_HEADER)) {$httpProvider.interceptors.push('axLogHttpInterceptor');}}]); ///////////////////////////////////////////////////////////////////////////////////////////////////////////
         /**
          * This is a scheduler for asynchronous tasks (like nodejs' `process.nextTick`)  trimmed for performance.
          * It is intended for use cases where many tasks are scheduled in succession within one JavaScript event
          * loop. It integrates into the AngularJS *$digest* cycle, while trying to minimize the amount of full
          * *$digest* cycles.
          *
          * For example in LaxarJS the global event bus instance ({@link axGlobalEventBus}) uses this service.
          *
          * @name axHeartbeat
          * @injection
          */_module.factory('axHeartbeat', ['$window', '$rootScope', 'axPageService', function ($window, $rootScope, pageService) {var nextQueue = [];var beatRequested = false;var rootScopeDigested = false;$rootScope.$watch(function () {rootScopeDigested = true;}); /**
                                                                                                                                                                                                                                                                           * Schedules a function for the next heartbeat. If no heartbeat was triggered yet, it will be
                                                                                                                                                                                                                                                                           * requested now.
                                                                                                                                                                                                                                                                           *
                                                                                                                                                                                                                                                                           * @param {Function} func
                                                                                                                                                                                                                                                                           *    a function to schedule for the next tick
                                                                                                                                                                                                                                                                           *
                                                                                                                                                                                                                                                                           * @memberOf axHeartbeat
                                                                                                                                                                                                                                                                           */function onNext(func) {if (!beatRequested) {beatRequested = true;$window.setTimeout(function () {while (beforeQueue.length) {beforeQueue.shift()();} // The outer loop handles events published from apply-callbacks (watchers, promises).
                     do {while (nextQueue.length) {nextQueue.shift()();}rootScopeDigested = false;var pageController = pageService.controller();if (pageController) {pageController.applyViewChanges();} // Since LaxarJS itself still heavily depends on AngularJS and its digest cycle concept,
                        // we need to make sure that a digest cycle is triggered, even if there is no widget
                        // based on angular technology requesting it. This can be removed as soon as
                        // https://github.com/LaxarJS/laxar/issues/216 is fixed
                        if (!rootScopeDigested) {$rootScope.$apply();}} while (nextQueue.length);while (afterQueue.length) {afterQueue.shift()();}beatRequested = false;}, 0);}nextQueue.push(func);}var beforeQueue = []; /**
                                                                                                                                                                                                                            * Schedules a function to be called before the next heartbeat occurs. Note that `func` may never be
                                                                                                                                                                                                                            * called, if there is no next heartbeat.
                                                                                                                                                                                                                            *
                                                                                                                                                                                                                            * @param {Function} func
                                                                                                                                                                                                                            *    a function to call before the next heartbeat
                                                                                                                                                                                                                            *
                                                                                                                                                                                                                            * @memberOf axHeartbeat
                                                                                                                                                                                                                            */function onBeforeNext(func) {beforeQueue.push(func);}var afterQueue = []; /**
                                                                                                                                                                                                                                                                                                         * Schedules a function to be called after the next heartbeat occured. Note that `func` may never be
                                                                                                                                                                                                                                                                                                         * called, if there is no next heartbeat.
                                                                                                                                                                                                                                                                                                         *
                                                                                                                                                                                                                                                                                                         * @param {Function} func
                                                                                                                                                                                                                                                                                                         *    a function to call after the next heartbeat
                                                                                                                                                                                                                                                                                                         *
                                                                                                                                                                                                                                                                                                         * @memberOf axHeartbeat
                                                                                                                                                                                                                                                                                                         */function onAfterNext(func) {afterQueue.push(func);}return { onBeforeNext: onBeforeNext, onNext: onNext, onAfterNext: onAfterNext };}]); ///////////////////////////////////////////////////////////////////////////////////////////////////////////
         /**
          * A timestamp function, provided as a service to support the jasmine mock clock during testing. The
          * mock-free implementation simply uses `new Date().getTime()`. Whenever a simple timestamp is needed in a
          * widget, this service can be used to allow for hassle-free testing.
          *
          * Example:
          * ```js
          * Controller.$inject = [ 'axTimestamp' ];
          * function Controller( axTimestamp ) {
          *    var currentTimestamp = axTimestamp();
          * };
          * ```
          *
          * @name axTimestamp
          * @injection
          */_module.factory('axTimestamp', function () {return function () {return new Date().getTime();};}); ///////////////////////////////////////////////////////////////////////////////////////////////////////////
         /**
          * Provides access to the control-implementation-modules used by a widget.
          * Further documentation on the api can be found at the *controls_service* module api doc.
          *
          * @name axControls
          * @injection
          */_module.factory('axControls', ['axFileResourceProvider', function (fileResourceProvider) {return controlsService.create(fileResourceProvider);}]); ///////////////////////////////////////////////////////////////////////////////////////////////////////////
         /**
          * The global event bus instance provided by the LaxarJS runtime. Widgets **should never** use this, as
          * subscriptions won't be removed when a widget is destroyed. Instead widgets should always either use the
          * `eventBus` property on their local `$scope` object or the service `axEventBus`. These take care of all
          * subscriptions on widget destructions and thus prevent from leaking memory and other side effects.
          *
          * This service instead can be used by other services, that live throughout the whole lifetime of an
          * application or take care of unsubscribing from events themselves. Further documentation on the api can
          * be found at the *event_bus* module api doc.
          *
          * @name axGlobalEventBus
          * @injection
          */_module.factory('axGlobalEventBus', ['$injector', '$window', 'axHeartbeat', 'axConfiguration', function ($injector, $window, heartbeat, configuration) {// LaxarJS/laxar#48: Use event bus ticks instead of $apply to run promise callbacks
            var $q = $injector.invoke($qProvider_.$get, $qProvider_, { $rootScope: { $evalAsync: heartbeat.onNext } });eventBus.init($q, heartbeat.onNext, function (f, t) {// MSIE Bug, we have to wrap set timeout to pass assertion
               $window.setTimeout(f, t);});var bus = eventBus.create({ pendingDidTimeout: configuration.get('eventBusTimeoutMs', 120 * 1000) });bus.setErrorHandler(eventBusErrorHandler);return bus;}]); ///////////////////////////////////////////////////////////////////////////////////////////////////////////
         /**
          * Provides access to the global configuration, otherwise accessible via the *configuration* module.
          * Further documentation can be found there.
          *
          * @name axConfiguration
          * @injection
          */_module.factory('axConfiguration', [function () {return configuration;}]); ///////////////////////////////////////////////////////////////////////////////////////////////////////////
         /**
          * Provides access to the i18n api, otherwise accessible via the *i18n* module. Further documentation can
          * be found there.
          *
          * @name axI18n
          * @injection
          */_module.factory('axI18n', [function () {return i18n;}]); ///////////////////////////////////////////////////////////////////////////////////////////////////////////
         /**
          * A global, pre-configured file resource provider instance. Further documentation on the api can
          * be found at the *file_resource_provider* module api doc.
          *
          * This service has already all the file listings configured under `window.laxar.fileListings`. These can
          * either be uris to listing JSON files or already embedded JSON objects of the directory tree.
          *
          * @name axFileResourceProvider
          * @injection
          */_module.factory('axFileResourceProvider', ['$q', '$http', 'axConfiguration', function ($q, $http, configuration) {fileResourceProvider.init($q, $http);var provider = fileResourceProvider.create(paths.PRODUCT);var listings = configuration.get('fileListings');if (listings) {ng.forEach(listings, function (value, key) {if (typeof value === 'string') {provider.setFileListingUri(key, value);} else {provider.setFileListingContents(key, value);}});}return provider;}]); ///////////////////////////////////////////////////////////////////////////////////////////////////////////
         /**
          * Provides access to the configured theme and theme relevant assets via a theme manager instance. Further
          * documentation on the api can be found at the *theme_manager* module api doc.
          *
          * @name axThemeManager
          * @injection
          */_module.factory('axThemeManager', ['$q', 'axConfiguration', 'axFileResourceProvider', function ($q, configuration, fileResourceProvider) {var theme = configuration.get('theme');var manager = themeManager.create(fileResourceProvider, $q, theme);return { getTheme: manager.getTheme.bind(manager), urlProvider: manager.urlProvider.bind(manager) };}]); ///////////////////////////////////////////////////////////////////////////////////////////////////////////
         /**
          * Loads a layout relative to the path `laxar-path-root` configured via RequireJS (by default
          * `/application/layouts`), taking the configured theme into account. If a CSS file is found, it will
          * directly be loaded into the page. A HTML template will instead get returned for manual insertion at the
          * correct DOM location. For this service there is also the companion directive *axLayout* available.
          *
          * Example:
          * ```js
          * myNgModule.directive( [ 'axLayoutLoader', function( axLayoutLoader ) {
          *    return {
          *       link: function( scope, element, attrs ) {
          *          axLayoutLoader.load( 'myLayout' )
          *             .then( function( layoutInfo ) {
          *                element.html( layoutInfo.html );
          *             } );
          *       }
          *    };
          * } ] );
          * ```
          *
          * @name axLayoutLoader
          * @injection
          */_module.factory('axLayoutLoader', ['$templateCache', 'axCssLoader', 'axThemeManager', 'axFileResourceProvider', function ($templateCache, cssLoader, themeManager, fileResourceProvider) {return layoutLoader.create(paths.LAYOUTS, paths.THEMES, cssLoader, themeManager, fileResourceProvider, $templateCache);}]); ///////////////////////////////////////////////////////////////////////////////////////////////////////////
         /**
          * A service to load css files on demand during development. If a merged release css file has already been
          * loaded (marked with a `data-ax-merged-css` html attribute at the according `link` tag) or `useMergedCss`
          * is configured as `true`, the `load` method will simply be a noop. In the latter case the merged css file
          * will be loaded once by this service.
          *
          * @name axCssLoader
          * @injection
          */_module.factory('axCssLoader', ['axConfiguration', 'axThemeManager', function (configuration, themeManager) {var mergedCssFileLoaded = [].some.call(document.getElementsByTagName('link'), function (link) {return link.hasAttribute('data-ax-merged-css');});if (mergedCssFileLoaded) {return { load: function load() {} };}var loadedFiles = [];var loader = { /**
                                                                                                                                                                                                                                                                                                                                                                              * If not already loaded, loads the given file into the current page by appending a `link` element to
                                                                                                                                                                                                                                                                                                                                                                              * the document's `head` element.
                                                                                                                                                                                                                                                                                                                                                                              *
                                                                                                                                                                                                                                                                                                                                                                              * Additionally it works around a
                                                                                                                                                                                                                                                                                                                                                                              * [style sheet limit](http://support.microsoft.com/kb/262161) in older Internet Explorers
                                                                                                                                                                                                                                                                                                                                                                              * (version < 10). The workaround is based on
                                                                                                                                                                                                                                                                                                                                                                              * [this test](http://john.albin.net/ie-css-limits/993-style-test.html).
                                                                                                                                                                                                                                                                                                                                                                              *
                                                                                                                                                                                                                                                                                                                                                                              * @param {String} url
                                                                                                                                                                                                                                                                                                                                                                              *    the url of the css file to load
                                                                                                                                                                                                                                                                                                                                                                              *
                                                                                                                                                                                                                                                                                                                                                                              * @memberOf axCssLoader
                                                                                                                                                                                                                                                                                                                                                                              */load: function load(url) {if (loadedFiles.indexOf(url) === -1) {if (hasStyleSheetLimit()) {// Here we most probably have an Internet Explorer having the limit of at most 31 stylesheets
                        // per page. As a workaround we use style tags with import statements. Each style tag may
                        // have 31 import statement. This gives us 31 * 31 = 961 possible stylesheets to include ...
                        // Link to the problem on microsoft.com: http://support.microsoft.com/kb/262161
                        // Solution based on ideas found here: http://john.albin.net/css/ie-stylesheets-not-loading
                        var styleManagerId = 'cssLoaderStyleSheet' + Math.floor(loadedFiles.length / 30);if (!document.getElementById(styleManagerId)) {addHeadElement('style', { type: 'text/css', id: styleManagerId });}document.getElementById(styleManagerId).styleSheet.addImport(url);} else {addHeadElement('link', { type: 'text/css', id: 'cssLoaderStyleSheet' + loadedFiles.length, rel: 'stylesheet', href: url });}loadedFiles.push(url);}} };if (configuration.get('useMergedCss', false)) {loader.load(path.join(paths.PRODUCT, 'var/static/css', themeManager.getTheme() + '.theme.css'));return { load: function load() {} };}return loader; ////////////////////////////////////////////////////////////////////////////////////////////////////////
            function hasStyleSheetLimit() {if (typeof hasStyleSheetLimit.result !== 'boolean') {hasStyleSheetLimit.result = false;if (document.createStyleSheet) {var uaMatch = navigator.userAgent.match(/MSIE ?(\d+(\.\d+)?)[^\d]/i);if (!uaMatch || parseFloat(uaMatch[1]) < 10) {// There is no feature test for this problem without running into it. We therefore test
                        // for a browser knowing document.createStyleSheet (should only be IE) and afterwards check,
                        // if it is a version prior to 10 as the problem is fixed since that version. In any other
                        // case we assume the worst case and trigger the hack for limited browsers.
                        hasStyleSheetLimit.result = true;}}}return hasStyleSheetLimit.result;} ////////////////////////////////////////////////////////////////////////////////////////////////////////
            function addHeadElement(elementName, attributes) {var element = document.createElement(elementName);ng.forEach(attributes, function (val, key) {element[key] = val;});document.getElementsByTagName('head')[0].appendChild(element);}}]); ///////////////////////////////////////////////////////////////////////////////////////////////////////////
         /**
          * Directives should use this service to stay informed about visibility changes to their widget.
          * They should not attempt to determine their visibility from the event bus (no DOM information),
          * nor poll it from the browser (too expensive).
          *
          * In contrast to the visibility events received over the event bus, these handlers will fire _after_ the
          * visibility change has been implemented in the DOM, at which point in time the actual browser rendering
          * state should correspond to the information conveyed in the event.
          *
          * The visibility service allows to register for onShow/onHide/onChange. When cleared, all handlers for
          * the given scope will be cleared. Handlers are automatically cleared as soon as the given scope is
          * destroyed. Handlers will be called whenever the given scope's visibility changes due to the widget
          * becoming visible/invisible. Handlers will _not_ be called on state changes originating _from within_ the
          * widget such as those caused by `ngShow`.
          *
          * If a widget becomes visible at all, the corresponding handlers for onChange and onShow are guaranteed
          * to be called at least once.
          *
          * @name axVisibilityService
          * @injection
          */_module.factory('axVisibilityService', ['axHeartbeat', '$rootScope', function (heartbeat, $rootScope) {/**
                                                                                                                    * Create a DOM visibility handler for the given scope.
                                                                                                                    *
                                                                                                                    * @param {Object} scope
                                                                                                                    *    the scope from which to infer visibility. Must be a widget scope or nested in a widget scope
                                                                                                                    *
                                                                                                                    * @return {axVisibilityServiceHandler}
                                                                                                                    *    a visibility handler for the given scope
                                                                                                                    *
                                                                                                                    * @memberOf axVisibilityService
                                                                                                                    */function handlerFor(scope) {var handlerId = scope.$id;scope.$on('$destroy', clear); // Find the widget scope among the ancestors:
               var widgetScope = scope;while (widgetScope !== $rootScope && !(widgetScope.widget && widgetScope.widget.area)) {widgetScope = widgetScope.$parent;}var areaName = widgetScope.widget && widgetScope.widget.area;if (!areaName) {throw new Error('axVisibilityService: could not determine widget area for scope: ' + handlerId);} /**
                                                                                                                                                                                                                                                                                                                                                  * A scope bound visibility handler.
                                                                                                                                                                                                                                                                                                                                                  *
                                                                                                                                                                                                                                                                                                                                                  * @name axVisibilityServiceHandler
                                                                                                                                                                                                                                                                                                                                                  */var api = { /**
                                                                                                                                                                                                                                                                                                                                                                 * Determine if the governing widget scope's DOM is visible right now.
                                                                                                                                                                                                                                                                                                                                                                 *
                                                                                                                                                                                                                                                                                                                                                                 * @return {Boolean}
                                                                                                                                                                                                                                                                                                                                                                 *    `true` if the widget associated with this handler is visible right now, else `false`
                                                                                                                                                                                                                                                                                                                                                                 *
                                                                                                                                                                                                                                                                                                                                                                 * @memberOf axVisibilityServiceHandler
                                                                                                                                                                                                                                                                                                                                                                 */isVisible: function isVisible() {return _isVisible(areaName);}, //////////////////////////////////////////////////////////////////////////////////////////////////
                  /**
                   * Schedule a handler to be called with the new DOM visibility on any DOM visibility change.
                   *
                   * @param {Function<Boolean>} handler
                   *    the callback to process visibility changes
                   *
                   * @return {axVisibilityServiceHandler}
                   *    this visibility handler (for chaining)
                   *
                   * @memberOf axVisibilityServiceHandler
                   */onChange: function onChange(handler) {addHandler(handlerId, areaName, handler, true);addHandler(handlerId, areaName, handler, false);return api;}, //////////////////////////////////////////////////////////////////////////////////////////////////
                  /**
                   * Schedule a handler to be called with the new DOM visibility when it has changed to `true`.
                   *
                   * @param {Function<Boolean>} handler
                   *    the callback to process visibility changes
                   *
                   * @return {axVisibilityServiceHandler}
                   *    this visibility handler (for chaining)
                   *
                   * @memberOf axVisibilityServiceHandler
                   */onShow: function onShow(handler) {addHandler(handlerId, areaName, handler, true);return api;}, //////////////////////////////////////////////////////////////////////////////////////////////////
                  /**
                   * Schedule a handler to be called with the new DOM visibility when it has changed to `false`.
                   *
                   * @param {Function<Boolean>} handler
                   *    the callback to process visibility changes
                   *
                   * @return {axVisibilityServiceHandler}
                   *    this visibility handler (for chaining)
                   *
                   * @memberOf axVisibilityServiceHandler
                   */onHide: function onHide(handler) {addHandler(handlerId, areaName, handler, false);return api;}, //////////////////////////////////////////////////////////////////////////////////////////////////
                  /**
                   * Removes all visibility handlers.
                   *
                   * @return {axVisibilityServiceHandler}
                   *    this visibility handler (for chaining)
                   *
                   * @memberOf axVisibilityServiceHandler
                   */clear: clear };return api; /////////////////////////////////////////////////////////////////////////////////////////////////////
               function clear() {clearHandlers(handlerId);return api;}} ////////////////////////////////////////////////////////////////////////////////////////////////////////
            // track state to inform handlers that register after visibility for a given area was initialized
            var knownState; // store the registered show/hide-handlers by governing widget area
            var showHandlers;var hideHandlers; // secondary lookup-table to track removal, avoiding O(n^2) cost for deleting n handlers in a row
            var handlersById;return { isVisible: _isVisible, handlerFor: handlerFor, // runtime-internal api for use by the page controller
               _updateState: updateState, _reset: reset }; ////////////////////////////////////////////////////////////////////////////////////////////////////////
            function reset() {knownState = {};showHandlers = {};hideHandlers = {};handlersById = {};} ////////////////////////////////////////////////////////////////////////////////////////////////////////
            /**
             * Determine if the given area's content DOM is visible right now.
             * @param {String} area
             *    the full name of the widget area to query
             *
             * @return {Boolean}
             *    `true` if the area is visible right now, else `false`.
             *
             * @memberOf axVisibilityService
             */function _isVisible(area) {return knownState[area] || false;} ////////////////////////////////////////////////////////////////////////////////////////////////////////
            /**
             * Run all handlers registered for the given area and target state after the next heartbeat.
             * Also remove any handlers that have been cleared since the last run.
             * @private
             */function updateState(area, targetState) {if (knownState[area] === targetState) {return;}knownState[area] = targetState;heartbeat.onAfterNext(function () {var areaHandlers = (targetState ? showHandlers : hideHandlers)[area];if (!areaHandlers) {return;}for (var i = areaHandlers.length - 1; i >= 0; --i) {var handlerRef = areaHandlers[i];if (handlerRef.handler === null) {areaHandlers.splice(i, 1);} else {handlerRef.handler(targetState);}}});} ////////////////////////////////////////////////////////////////////////////////////////////////////////
            /**
             * Add a show/hide-handler for a given area and visibility state. Execute the handler right away if the
             * state is already known.
             * @private
             */function addHandler(id, area, handler, targetState) {var handlerRef = { handler: handler };handlersById[id] = handlersById[id] || [];handlersById[id].push(handlerRef);var areaHandlers = targetState ? showHandlers : hideHandlers;areaHandlers[area] = areaHandlers[area] || [];areaHandlers[area].push(handlerRef); // State already known? In that case, initialize:
               if (area in knownState && knownState[area] === targetState) {handler(targetState);}} ////////////////////////////////////////////////////////////////////////////////////////////////////////
            function clearHandlers(id) {if (handlersById[id]) {handlersById[id].forEach(function (matchingHandlerRef) {matchingHandlerRef.handler = null;});}}}]); ///////////////////////////////////////////////////////////////////////////////////////////////////////////
         _module.factory('axLogHttpInterceptor', ['axConfiguration', function (configuration) {var headerKey = configuration.get(CONFIG_KEY_HTTP_LOGGING_HEADER, null);return headerKey ? { request: function request(config) {var headerValue = '';ng.forEach(log.gatherTags(), function (tagValue, tagName) {headerValue += '[' + tagName + ':' + tagValue + ']';});if (headerValue) {if (config.headers[headerKey]) {log.warn('axLogHttpInterceptor: Overwriting existing header "[0]"', headerKey);}config.headers[headerKey] = headerValue;}return config;} } : {};}]);CONFIG_KEY_HTTP_LOGGING_HEADER = 'logging.http.header'; ///////////////////////////////////////////////////////////////////////////////////////////////////////////
         /**
          * Overrides the default `$exceptionHandler` service of AngularJS, using the LaxarJS logger for output.
          *
          * @name $exceptionHandler
          * @injection
          * @private
          */_module.provider('$exceptionHandler', function () {var handler = function handler(exception, cause) {var msg = exception.message || exception;log.error('There was an exception: ' + msg + ', \nstack: ');log.error(exception.stack + ', \n');log.error('  Cause: ' + cause);};this.$get = [function () {return handler;}];}); ///////////////////////////////////////////////////////////////////////////////////////////////////////////
         sensitiveData = ['Published event'];name = _module.name;_export('name', name);_export('default', _module);} };});

System.register("static/schemas/page.js", [], function (_export) {/**
                                                                   * Copyright 2016 aixigo AG
                                                                   * Released under the MIT license.
                                                                   * http://laxarjs.org/license
                                                                   */"use strict";return { setters: [], execute: function () {_export("default", 
         { 
            "$schema": "http://json-schema.org/draft-04/schema#", 
            "type": "object", 
            "properties": { 

               "layout": { 
                  "type": "string", 
                  "description": "The layout to use. May be omitted if another page in the extension hierarchy defines one." }, 


               "extends": { 
                  "type": "string", 
                  "description": "The name of the page to extend." }, 


               "areas": { 
                  "type": "object", 
                  "description": "A map from area name to a list of widgets to display within that area.", 
                  "patternProperties": { 
                     "^[a-z][\\.a-zA-Z0-9_]*$": { 
                        "type": "array", 
                        "items": { 
                           "type": "object", 
                           "properties": { 

                              "widget": { 
                                 "type": "string", 
                                 "description": "Path to the widget that should be rendered." }, 

                              "composition": { 
                                 "type": "string", 
                                 "description": "Path to the composition that should be included." }, 

                              "layout": { 
                                 "type": "string", 
                                 "description": "Path to the layout that should be inserted." }, 

                              "id": { 
                                 "type": "string", 
                                 "pattern": "^[a-z][a-zA-Z0-9_]*$", 
                                 "description": "ID of the widget or composition. Will be generated if missing." }, 

                              "insertBeforeId": { 
                                 "type": "string", 
                                 "description": "The ID of the widget this widget or composition should be inserted before." }, 

                              "features": { 
                                 "type": "object", 
                                 "description": "Configuration of the features defined by the widget or composition." }, 

                              "enabled": { 
                                 "type": "boolean", 
                                 "default": true, 
                                 "description": "Set to false to omit widgets e.g. for debugging purposes." } }, 



                           "additionalProperties": false } } }, 



                  "additionalProperties": false } }, 



            "additionalProperties": false });} };});

System.register('lib/loaders/page_loader.js', ['npm:babel-runtime@5.8.34/core-js/object/keys', '../utilities/assert', '../utilities/object', '../utilities/string', '../utilities/path', '../json/validator', './features_provider', '../../static/schemas/page'], function (_export) {var _Object$keys, assert, object, string, path, jsonValidator, featuresProvider, pageSchema, 












   SEGMENTS_MATCHER, 

   ID_SEPARATOR, 
   ID_SEPARATOR_MATCHER, 
   SUBTOPIC_SEPARATOR, 

   JSON_SUFFIX_MATCHER, 
   COMPOSITION_EXPRESSION_MATCHER, 
   COMPOSITION_TOPIC_PREFIX;

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function PageLoader(q, httpClient, baseUrl, fileResourceProvider) {
      this.q_ = q;
      this.httpClient_ = httpClient;
      this.baseUrl_ = baseUrl;
      this.fileResourceProvider_ = fileResourceProvider;
      this.idCounter_ = 0;}


   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   /**
    * Loads a page specification and resolves all extension and compositions. The result is a page were all
    * referenced page fragments are merged in to one JavaScript object. As loading of all relevant files is
    * already asynchronous, this method is also asynchronous and thus returns a promise that is either
    * resolved with the constructed page or rejected with a JavaScript `Error` instance.
    *
    * @param {String} pageName
    *    the page to load. This is in fact a path relative to the base url this page loader was instantiated
    *    with and the `.json` suffix omitted
    *
    * @returns {Promise}
    *    the result promise
    *
    * @private
    */




   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function loadPageRecursively(self, pageName, extensionChain) {
      var page;
      var pageSelfLink = assetUrl(self.baseUrl_, pageName);

      if (extensionChain.indexOf(pageName) !== -1) {
         throwError(
         { name: pageName }, 
         'Cycle in page extension detected: ' + extensionChain.concat([pageName]).join(' -> '));}



      return load(self, pageSelfLink).
      then(function (foundPage) {
         validatePage(foundPage, pageName);

         page = foundPage;
         page.name = pageName.replace(JSON_SUFFIX_MATCHER, '');
         page.selfLink = pageSelfLink;

         if (!page.areas) {
            page.areas = {};}}, 

      function () {
         throwError({ name: pageName }, 'Page could not be found at location "' + pageSelfLink + '"');}).

      then(function () {
         return processExtends(self, page, extensionChain);}).

      then(function () {
         return processCompositions(self, page, [], page);}).

      then(function () {
         return postProcessWidgets(self, page);}).

      then(function () {
         return page;});}



   ///////////////////////////////////////////////////////////////////////////////////////////////////////////
   //
   // Processing inheritance (i.e. the `extends` keyword)
   //
   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function processExtends(self, page, extensionChain) {
      if (has(page, 'extends')) {
         return loadPageRecursively(self, page['extends'], extensionChain.concat([page.name])).
         then(function (basePage) {
            mergePageWithBasePage(page, basePage);});}}




   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function mergePageWithBasePage(page, basePage) {
      var extendingAreas = page.areas;
      var mergedPageAreas = object.deepClone(basePage.areas);
      if (has(basePage, 'layout')) {
         if (has(page, 'layout')) {
            throwError(page, string.format('Page overwrites layout set by base page "[name]', basePage));}

         page.layout = basePage.layout;}


      object.forEach(extendingAreas, function (widgets, areaName) {
         if (!(areaName in mergedPageAreas)) {
            mergedPageAreas[areaName] = widgets;
            return;}


         mergeWidgetLists(mergedPageAreas[areaName], widgets, page);});


      page.areas = mergedPageAreas;}


   ///////////////////////////////////////////////////////////////////////////////////////////////////////////
   //
   // Processing compositions
   //
   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function processCompositions(self, page, compositionChain, topPage) {
      var promise = self.q_.when();
      var seenCompositionIdCount = {};

      object.forEach(page.areas, function (widgets) {
         /*jshint loopfunc:true*/
         for (var i = widgets.length - 1; i >= 0; --i) {
            (function (widgetSpec, index) {
               if (has(widgetSpec, 'composition')) {
                  if (widgetSpec.enabled === false) {
                     return;}


                  var compositionName = widgetSpec.composition;
                  if (compositionChain.indexOf(compositionName) !== -1) {
                     var message = 'Cycle in compositions detected: ' + 
                     compositionChain.concat([compositionName]).join(' -> ');
                     throwError(topPage, message);}


                  if (!has(widgetSpec, 'id')) {
                     var escapedCompositionName = 
                     widgetSpec.composition.replace(SEGMENTS_MATCHER, dashToCamelcase);
                     widgetSpec.id = nextId(self, escapedCompositionName);}


                  if (widgetSpec.id in seenCompositionIdCount) {
                     seenCompositionIdCount[widgetSpec.id]++;} else 

                  {
                     seenCompositionIdCount[widgetSpec.id] = 1;}


                  // Loading compositionUrl can be started asynchronously, but replacing the according widgets
                  // in the page needs to take place in order. Otherwise the order of widgets could be messed up.
                  promise = promise.
                  then(function () {
                     return load(self, assetUrl(self.baseUrl_, compositionName));}).

                  then(function (composition) {
                     return prefixCompositionIds(composition, widgetSpec);}).

                  then(function (composition) {
                     return processCompositionExpressions(composition, widgetSpec, throwError.bind(null, topPage));}).

                  then(function (composition) {
                     var chain = compositionChain.concat(compositionName);
                     return processCompositions(self, composition, chain, topPage).
                     then(function () {
                        return composition;});}).


                  then(function (composition) {
                     mergeCompositionAreasWithPageAreas(composition, page, widgets, index);});}})(


            widgets[i], i);}});



      checkForDuplicateCompositionIds(page, seenCompositionIdCount);

      return promise;}


   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function mergeCompositionAreasWithPageAreas(composition, page, widgets, index) {
      object.forEach(composition.areas, function (compositionAreaWidgets, areaName) {
         if (areaName === '.') {
            replaceEntryAtIndexWith(widgets, index, compositionAreaWidgets);
            return;}


         if (!(areaName in page.areas)) {
            page.areas[areaName] = compositionAreaWidgets;
            return;}


         mergeWidgetLists(page.areas[areaName], compositionAreaWidgets, page);});}



   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function prefixCompositionIds(composition, widgetSpec) {
      var prefixedAreas = {};
      object.forEach(composition.areas, function (widgets, areaName) {
         widgets.forEach(function (widget) {
            if (has(widget, 'id')) {
               widget.id = widgetSpec.id + ID_SEPARATOR + widget.id;}});



         if (areaName.indexOf('.') > 0) {
            // All areas prefixed with a local widget id need to be prefixed as well
            prefixedAreas[widgetSpec.id + ID_SEPARATOR + areaName] = widgets;
            return;}


         prefixedAreas[areaName] = widgets;});

      composition.areas = prefixedAreas;
      return composition;}


   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function processCompositionExpressions(composition, widgetSpec, throwPageError) {
      var expressionData = {};

      // feature definitions in compositions may contain generated topics for default resource names or action
      // topics. As such these are generated before instantiating the composition's features.
      composition.features = iterateOverExpressions(composition.features || {}, replaceExpression);
      expressionData.features = featuresProvider.featuresForWidget(composition, widgetSpec, throwPageError);

      if (typeof composition.mergedFeatures === 'object') {
         var mergedFeatures = iterateOverExpressions(composition.mergedFeatures, replaceExpression);

         _Object$keys(mergedFeatures).forEach(function (featurePath) {
            var currentValue = object.path(expressionData.features, featurePath, []);
            var values = mergedFeatures[featurePath];
            object.setPath(expressionData.features, featurePath, values.concat(currentValue));});}



      composition.areas = iterateOverExpressions(composition.areas, replaceExpression);

      function replaceExpression(subject) {
         var matches = subject.match(COMPOSITION_EXPRESSION_MATCHER);
         if (!matches) {
            return subject;}


         var possibleNegation = matches[1];
         var expression = matches[2];
         var result;
         if (expression.indexOf(COMPOSITION_TOPIC_PREFIX) === 0) {
            result = topicFromId(widgetSpec.id) + 
            SUBTOPIC_SEPARATOR + expression.substr(COMPOSITION_TOPIC_PREFIX.length);} else 

         {
            result = object.path(expressionData, expression);}


         return typeof result === 'string' && possibleNegation ? possibleNegation + result : result;}


      return composition;}


   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function iterateOverExpressions(obj, replacer) {
      if (obj === null) {
         return obj;}


      if (Array.isArray(obj)) {
         return obj.map(function (value) {
            if (typeof value === 'object') {
               return iterateOverExpressions(value, replacer);}


            return typeof value === 'string' ? replacer(value) : value;}).
         filter(function (item) {
            return typeof item !== 'undefined';});}



      var result = {};
      object.forEach(obj, function (value, key) {
         var replacedKey = replacer(key);
         if (typeof value === 'object') {
            result[replacedKey] = iterateOverExpressions(value, replacer);
            return;}


         var replacedValue = typeof value === 'string' ? replacer(value) : value;
         if (typeof replacedValue !== 'undefined') {
            result[replacedKey] = replacedValue;}});



      return result;}


   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function checkForDuplicateCompositionIds(page, idCount) {
      var duplicates = _Object$keys(idCount).filter(function (compositionId) {
         return idCount[compositionId] > 1;});


      if (duplicates.length) {
         throwError(page, 'Duplicate composition ID(s): ' + duplicates.join(', '));}}



   ///////////////////////////////////////////////////////////////////////////////////////////////////////////
   //
   // Additional Tasks
   //
   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function postProcessWidgets(self, page) {
      var idCount = {};

      object.forEach(page.areas, function (widgetList, index) {
         page.areas[index] = widgetList.filter(function (widgetSpec) {
            if (widgetSpec.enabled === false) {
               return false;}


            if (has(widgetSpec, 'widget')) {
               if (!has(widgetSpec, 'id')) {
                  var widgetName = widgetSpec.widget.split('/').pop();
                  widgetSpec.id = nextId(self, widgetName.replace(SEGMENTS_MATCHER, dashToCamelcase));}


               idCount[widgetSpec.id] = idCount[widgetSpec.id] ? idCount[widgetSpec.id] + 1 : 1;}

            return true;});});



      var duplicates = _Object$keys(idCount).filter(function (widgetId) {
         return idCount[widgetId] > 1;});


      if (duplicates.length) {
         throwError(page, 'Duplicate widget ID(s): ' + duplicates.join(', '));}}



   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function validatePage(foundPage, pageName) {
      var result = jsonValidator.create(pageSchema).validate(foundPage);
      if (result.errors.length) {
         var errorString = result.errors.reduce(function (errorString, errorItem) {
            return errorString + '\n - ' + errorItem.message;}, 
         '');

         throwError({ name: pageName }, 'Schema validation failed: ' + errorString);}}



   ///////////////////////////////////////////////////////////////////////////////////////////////////////////
   //
   // Common functionality and utility functions
   //
   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function mergeWidgetLists(targetList, sourceList, page) {
      sourceList.forEach(function (widgetConfiguration) {
         if (widgetConfiguration.insertBeforeId) {
            for (var i = 0, length = targetList.length; i < length; ++i) {
               if (targetList[i].id === widgetConfiguration.insertBeforeId) {
                  targetList.splice(i, 0, widgetConfiguration);
                  return;}}



            throwError(page, 
            string.format(
            'No id found that matches insertBeforeId value "[insertBeforeId]"', 
            widgetConfiguration));}




         targetList.push(widgetConfiguration);});}



   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function assetUrl(base, asset) {
      if (!asset.match(JSON_SUFFIX_MATCHER)) {
         asset += '.json';}

      return path.join(base, asset);}


   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function has(object, what) {
      return typeof object[what] === 'string' && object[what].length;}


   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function load(self, url) {
      if (!self.fileResourceProvider_) {
         return self.httpClient_.get(url).then(function (response) {
            return response.data;});}


      return self.fileResourceProvider_.provide(url);}


   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function nextId(self, prefix) {
      return prefix + ID_SEPARATOR + 'id' + self.idCounter_++;}


   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function dashToCamelcase(segmentStart) {
      return segmentStart.charAt(1).toUpperCase();}


   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function topicFromId(id) {
      return id.replace(ID_SEPARATOR_MATCHER, SUBTOPIC_SEPARATOR).replace(SEGMENTS_MATCHER, dashToCamelcase);}


   function replaceEntryAtIndexWith(arr, index, replacements) {
      arr.splice.apply(arr, [index, 1].concat(replacements));}


   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function throwError(page, message) {
      var text = string.format('Error loading page "[name]": [0]', [message], page);
      throw new Error(text);}


   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   /**
    * Creates and returns a new page loader instance.
    *
    * @param {Object} q
    *    a Promise library conforming to $q from AngularJS
    * @param {Object} httpClient
    *    a http client conforming to $http from AngularJS
    * @param {String} baseUrl
    *    the url where all pages are located
    * @param {FileResourceProvider} fileResourceProvider
    *    a FileResourceProvider as a smarter alternative to httpClient, used if provided
    * @returns {PageLoader}
    *    a page loader instance
    *
    * @private
    */
   function create(q, httpClient, baseUrl, fileResourceProvider) {
      assert(q).isNotNull();
      if (fileResourceProvider === null) {
         assert(httpClient).isNotNull();}

      assert(baseUrl).isNotNull();
      return new PageLoader(q, httpClient, baseUrl, fileResourceProvider);}return { setters: [function (_babelRuntimeCoreJsObjectKeys) {_Object$keys = _babelRuntimeCoreJsObjectKeys['default'];}, function (_utilitiesAssert) {assert = _utilitiesAssert['default'];}, function (_utilitiesObject) {object = _utilitiesObject;}, function (_utilitiesString) {string = _utilitiesString;}, function (_utilitiesPath) {path = _utilitiesPath;}, function (_jsonValidator) {jsonValidator = _jsonValidator;}, function (_features_provider) {featuresProvider = _features_provider;}, function (_staticSchemasPage) {pageSchema = _staticSchemasPage['default'];}], execute: function () {/**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          * Copyright 2015 aixigo AG
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          * Released under the MIT license.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          * http://laxarjs.org/license
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          */'use strict';_export('create', create);SEGMENTS_MATCHER = /[_/-]./g;ID_SEPARATOR = '-';ID_SEPARATOR_MATCHER = /\-/g;SUBTOPIC_SEPARATOR = '+';JSON_SUFFIX_MATCHER = /\.json$/;COMPOSITION_EXPRESSION_MATCHER = /^(!?)\$\{([^}]+)\}$/;COMPOSITION_TOPIC_PREFIX = 'topic:';PageLoader.prototype.loadPage = function (pageName) {return loadPageRecursively(this, pageName, []);};} };});

System.register('lib/loaders/features_provider.js', ['npm:babel-runtime@5.8.34/core-js/object/keys', '../json/validator', '../utilities/object', '../utilities/string'], function (_export) {var _Object$keys, jsonValidator, object, string, 









   TOPIC_IDENTIFIER, 
   SUB_TOPIC_FORMAT, 
   TOPIC_FORMAT, 
   FLAG_TOPIC_FORMAT, 


   LANGUAGE_TAG_FORMAT;

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function featuresForWidget(widgetSpecification, widgetConfiguration, throwError) {
      if (!widgetSpecification.features) {
         return {};}


      var featureConfiguration = widgetConfiguration.features || {};
      var featuresSpec = widgetSpecification.features;
      if (!('$schema' in featuresSpec)) {
         // we assume an "old style" feature specification (i.e. first level type specification is omitted)
         // if no schema version was defined.
         featuresSpec = { 
            $schema: 'http://json-schema.org/draft-03/schema#', 
            type: 'object', 
            properties: widgetSpecification.features };}



      object.forEach(featuresSpec.properties, function (feature, name) {
         // ensure that simple object/array features are at least defined
         if (name in featureConfiguration) {
            return;}


         if (feature.type === 'object') {
            featureConfiguration[name] = {};} else 

         if (feature.type === 'array') {
            featureConfiguration[name] = [];}});



      var validator = createFeaturesValidator(featuresSpec);
      var report = validator.validate(featureConfiguration);

      if (report.errors.length > 0) {
         var message = 'Validation for widget features failed. Errors: ';

         report.errors.forEach(function (error) {
            message += '\n - ' + error.message.replace(/\[/g, '\\[');});


         throwError(message);}


      return featureConfiguration;}


   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function createFeaturesValidator(featuresSpec) {
      var validator = jsonValidator.create(featuresSpec, { 
         prohibitAdditionalProperties: true, 
         useDefault: true });


      // allows 'mySubTopic0815', 'MY_SUB_TOPIC+OK' and variations:
      validator.addFormat('sub-topic', function (subTopic) {
         return typeof subTopic !== 'string' || SUB_TOPIC_FORMAT.test(subTopic);});


      // allows 'myTopic', 'myTopic-mySubTopic-SUB_0815+OK' and variations:
      validator.addFormat('topic', function (topic) {
         return typeof topic !== 'string' || TOPIC_FORMAT.test(topic);});


      // allows 'myTopic', '!myTopic-mySubTopic-SUB_0815+OK' and variations:
      validator.addFormat('flag-topic', function (flagTopic) {
         return typeof flagTopic !== 'string' || FLAG_TOPIC_FORMAT.test(flagTopic);});


      // allows 'de_DE', 'en-x-laxarJS' and such:
      validator.addFormat('language-tag', function (languageTag) {
         return typeof languageTag !== 'string' || LANGUAGE_TAG_FORMAT.test(languageTag);});


      // checks that object keys have the 'topic' format
      validator.addFormat('topic-map', function (topicMap) {
         return typeof topicMap !== 'object' || _Object$keys(topicMap).every(function (topic) {
            return TOPIC_FORMAT.test(topic);});});



      // checks that object keys have the 'language-tag' format
      validator.addFormat('localization', function (localization) {
         return typeof localization !== 'object' || _Object$keys(localization).every(function (tag) {
            return LANGUAGE_TAG_FORMAT.test(tag);});});



      return validator;}


   ///////////////////////////////////////////////////////////////////////////////////////////////////////////
   return { setters: [function (_babelRuntimeCoreJsObjectKeys) {_Object$keys = _babelRuntimeCoreJsObjectKeys['default'];}, function (_jsonValidator) {jsonValidator = _jsonValidator;}, function (_utilitiesObject) {object = _utilitiesObject;}, function (_utilitiesString) {string = _utilitiesString;}], execute: function () {/**
                                                                                                                                                                                                                                                                                                                                    * Copyright 2015 aixigo AG
                                                                                                                                                                                                                                                                                                                                    * Released under the MIT license.
                                                                                                                                                                                                                                                                                                                                    * http://laxarjs.org/license
                                                                                                                                                                                                                                                                                                                                    */ // JSON schema formats:
         'use strict';TOPIC_IDENTIFIER = '([a-z][+a-zA-Z0-9]*|[A-Z][+A-Z0-9]*)';SUB_TOPIC_FORMAT = new RegExp('^' + TOPIC_IDENTIFIER + '$');TOPIC_FORMAT = new RegExp('^(' + TOPIC_IDENTIFIER + '(-' + TOPIC_IDENTIFIER + ')*)$');FLAG_TOPIC_FORMAT = new RegExp('^[!]?(' + TOPIC_IDENTIFIER + '(-' + TOPIC_IDENTIFIER + ')*)$'); // simplified RFC-5646 language-tag matcher with underscore/dash relaxation:
         // the parts are: language *("-"|"_" script|region|variant) *("-"|"_" extension|privateuse)
         LANGUAGE_TAG_FORMAT = /^[a-z]{2,8}([-_][a-z0-9]{2,8})*([-_][a-z0-9][-_][a-z0-9]{2,8})*$/i;_export('featuresForWidget', featuresForWidget);} };});

System.register('lib/loaders/widget_loader.js', ['../utilities/assert', '../logging/log', '../utilities/path', '../utilities/object', '../utilities/string', './paths', './features_provider', '../widget_adapters/adapters'], function (_export) {/**
                                                                                                                                                                                                                                                    * Copyright 2015 aixigo AG
                                                                                                                                                                                                                                                    * Released under the MIT license.
                                                                                                                                                                                                                                                    * http://laxarjs.org/license
                                                                                                                                                                                                                                                    */'use strict';var assert, log, path, object, string, paths, featuresProvider, adapters, 









   TYPE_WIDGET, 
   TYPE_ACTIVITY, 
   TECHNOLOGY_ANGULAR, 

   DEFAULT_INTEGRATION, 

   ID_SEPARATOR, 
   INVALID_ID_MATCHER;


















































































































































































































   ///////////////////////////////////////////////////////////////////////////////////////////////////////////
   _export('create', create); /**
                               * @param {Q} q
                               *    a promise library
                               * @param {Object} services
                               *    all services available to the loader an widgets
                               *
                               * @returns {{load: Function}}
                               */function create(q, services) {var controlsService = services.axControls;var fileResourceProvider = services.axFileResourceProvider;var themeManager = services.axThemeManager;var cssLoader = services.axCssLoader;var eventBus = services.axGlobalEventBus;return { load: load }; ////////////////////////////////////////////////////////////////////////////////////////////////////////
      /**
       * Load a widget using an appropriate adapter
       *
       * First, get the given widget's specification to validate and instantiate the widget features.
       * Then, instantiate a widget adapter matching the widget's technology. Using the adapter, create the
       * widget controller. The adapter is returned and can be used to attach the widget to the DOM, or to
       * destroy it.
       *
       * @param {Object} widgetConfiguration
       *    a widget instance configuration (as used in page definitions) to instantiate the widget from
       * @param {Object} [optionalOptions]
       *    map of additonal options
       * @param {Function} optionalOptions.onBeforeControllerCreation
       *    a function to call just before the controller is set up. It receives environment and adapter
       *    specific injections as arguments
       *
       * @return {Promise} a promise for a widget adapter, with an already instantiated controller
       */function load(widgetConfiguration, optionalOptions) {var resolvedWidgetPath = path.resolveAssetPath(widgetConfiguration.widget, paths.WIDGETS, 'local');var widgetJsonPath = path.join(resolvedWidgetPath, 'widget.json');var options = object.options(optionalOptions, { onBeforeControllerCreation: function onBeforeControllerCreation() {} });return fileResourceProvider.provide(widgetJsonPath).then(function (specification) {// The control-descriptors must be loaded prior to controller creation.
            // This allows the widget controller to synchronously instantiate controls.
            return q.all((specification.controls || []).map(controlsService.load)).then(function (descriptors) {descriptors.forEach(checkTechnologyCompatibility(specification));return specification;});}).then(function (specification) {var integration = object.options(specification.integration, DEFAULT_INTEGRATION);var type = integration.type;var technology = integration.technology; // Handle legacy widget code:
            if (type === TECHNOLOGY_ANGULAR) {type = TYPE_WIDGET;}if (type !== TYPE_WIDGET && type !== TYPE_ACTIVITY) {throwError(widgetConfiguration, 'unknown integration type ' + type);}var throwWidgetError = throwError.bind(null, widgetConfiguration);var features = featuresProvider.featuresForWidget(specification, widgetConfiguration, throwWidgetError);var anchorElement = document.createElement('DIV');anchorElement.className = normalizeClassName(specification.name);anchorElement.id = 'ax' + ID_SEPARATOR + widgetConfiguration.id;var widgetEventBus = createEventBusForWidget(eventBus, specification, widgetConfiguration);var adapterFactory = adapters.getFor(technology);var adapter = adapterFactory.create({ anchorElement: anchorElement, context: { eventBus: widgetEventBus, features: features, id: createIdGeneratorForWidget(widgetConfiguration.id), widget: { area: widgetConfiguration.area, id: widgetConfiguration.id, path: widgetConfiguration.widget } }, specification: specification }, services);adapter.createController(options);return { id: widgetConfiguration.id, adapter: adapter, destroy: function destroy() {widgetEventBus.release();adapter.destroy();}, applyViewChanges: adapterFactory.applyViewChanges || null, templatePromise: loadAssets(resolvedWidgetPath, integration, specification, widgetConfiguration) };}, function (err) {var message = 'Could not load spec for widget [0] from [1]: [2]';log.error(message, widgetConfiguration.widget, widgetJsonPath, err);});} ////////////////////////////////////////////////////////////////////////////////////////////////////////
      /**
       * Locates and loads the widget HTML template for this widget (if any) as well as any CSS stylesheets
       * used by this widget or its controls.
       *
       * @param widgetPath
       *    The path suffix used to look up the widget, as given in the instance configuration.
       * @param integration
       *    Details on the integration type and technology: Activities do not require assets.
       * @param widgetSpecification
       *    The widget specification, used to find out if any controls need to be loaded.
       * @param widgetConfiguration
       *    The widget instance configuration
       *
       * @return {Promise<String>}
       *    A promise that will be resolved with the contents of any HTML template for this widget, or with
       *    `null` if there is no template (for example, if this is an activity).
       */function loadAssets(widgetPath, integration, widgetSpecification, widgetConfiguration) {return integration.type === TYPE_ACTIVITY ? q.when(null) : resolve().then(function (urls) {urls.cssFileUrls.forEach(function (url) {cssLoader.load(url);});return urls.templateUrl ? fileResourceProvider.provide(urls.templateUrl) : null;}); /////////////////////////////////////////////////////////////////////////////////////////////////////
         function resolve() {// the name from the widget.json
            var specifiedName = widgetSpecification.name;var specifiedHtmlFile = specifiedName + '.html';var specifiedCssFile = path.join('css/', specifiedName + '.css'); // for backward compatibility: the name inferred from the reference
            var technicalName = widgetPath.split('/').pop();var technicalHtmlFile = technicalName + '.html';var technicalCssFile = path.join('css/', technicalName + '.css');var refPath = path.extractScheme(widgetConfiguration.widget).ref;var promises = [];promises.push(themeManager.urlProvider(path.join(widgetPath, '[theme]'), path.join(paths.THEMES, '[theme]', 'widgets', specifiedName), [path.join(paths.THEMES, '[theme]', 'widgets', refPath)]).provide([specifiedHtmlFile, specifiedCssFile, technicalHtmlFile, technicalCssFile]));promises = promises.concat(loadControlAssets());return q.all(promises).then(function (results) {var widgetUrls = results[0];var cssUrls = results.slice(1).map(function (urls) {return urls[0];}).concat(widgetUrls[1] || widgetUrls[3]).filter(function (url) {return !!url;});return { templateUrl: widgetUrls[0] || widgetUrls[2] || '', cssFileUrls: cssUrls };});} /////////////////////////////////////////////////////////////////////////////////////////////////////
         function loadControlAssets() {return (widgetSpecification.controls || []).map(function (controlRef) {var descriptor = controlsService.descriptor(controlRef);var resolvedPath = controlsService.resolve(controlRef);var name = descriptor.name;var cssPathInControl = path.join(resolvedPath, '[theme]');var cssPathInTheme = path.join(paths.THEMES, '[theme]', 'controls', name);if (descriptor._compatibility_0x) {// LaxarJS v0.x compatibility: use compatibility paths to load CSS.
                  log.warn('Deprecation: Control is missing control.json descriptor: [0]', controlRef);cssPathInTheme = path.join(paths.THEMES, '[theme]', controlRef);}return themeManager.urlProvider(cssPathInControl, cssPathInTheme).provide([path.join('css/', name + '.css')]);});}}}function checkTechnologyCompatibility(widgetDescriptor) {return function (controlDescriptor) {var controlTechnology = (controlDescriptor.integration || DEFAULT_INTEGRATION).technology;if (controlTechnology === 'plain') {// plain is always compatible
            return;}var widgetTechnology = (widgetDescriptor.integration || DEFAULT_INTEGRATION).technology;if (widgetTechnology === controlTechnology) {return;}log.warn('Incompatible integration technologies: widget [0] ([1]) cannot use control [2] ([3])', widgetDescriptor.name, widgetTechnology, controlDescriptor.name, controlTechnology);};} ///////////////////////////////////////////////////////////////////////////////////////////////////////////
   function normalizeClassName(str) {return str.replace(/([a-z0-9])([A-Z])/g, function ($_, $0, $1) {return $0 + '-' + $1;}).replace(/_/g, '-').toLowerCase();} ///////////////////////////////////////////////////////////////////////////////////////////////////////////
   function throwError(widgetConfiguration, message) {throw new Error(string.format('Error loading widget "[widget]" (id: "[id]"): [0]', [message], widgetConfiguration));} ///////////////////////////////////////////////////////////////////////////////////////////////////////////
   function createIdGeneratorForWidget(widgetId) {var charCodeOfA = 'a'.charCodeAt(0);function fixLetter(l) {// We map invalid characters deterministically to valid lower case letters. Thereby a collision of
         // two ids with different invalid characters at the same positions is less likely to occur.
         return String.fromCharCode(charCodeOfA + l.charCodeAt(0) % 26);}var prefix = 'ax' + ID_SEPARATOR + widgetId.replace(INVALID_ID_MATCHER, fixLetter) + ID_SEPARATOR;return function (localId) {return prefix + ('' + localId).replace(INVALID_ID_MATCHER, fixLetter);};} ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function createEventBusForWidget(eventBus, widgetSpecification, widgetConfiguration) {

      var collaboratorId = 'widget.' + widgetSpecification.name + '#' + widgetConfiguration.id;

      function forward(to) {
         return function () {
            return eventBus[to].apply(eventBus, arguments);};}



      function augmentOptions(optionalOptions) {
         return object.options(optionalOptions, { sender: collaboratorId });}


      var subscriptions = [];
      function unsubscribe(subscriber) {
         eventBus.unsubscribe(subscriber);}


      return { 
         addInspector: forward('addInspector'), 
         setErrorHandler: forward('setErrorHandler'), 
         setMediator: forward('setMediator'), 
         unsubscribe: unsubscribe, 
         subscribe: function subscribe(eventName, subscriber, optionalOptions) {
            subscriptions.push(subscriber);

            var options = object.options(optionalOptions, { subscriber: collaboratorId });

            eventBus.subscribe(eventName, subscriber, options);}, 

         publish: function publish(eventName, optionalEvent, optionalOptions) {
            return eventBus.publish(eventName, optionalEvent, augmentOptions(optionalOptions));}, 

         publishAndGatherReplies: function publishAndGatherReplies(eventName, optionalEvent, optionalOptions) {
            return eventBus.publishAndGatherReplies(eventName, optionalEvent, augmentOptions(optionalOptions));}, 

         release: function release() {
            subscriptions.forEach(unsubscribe);} };}return { setters: [function (_utilitiesAssert) {assert = _utilitiesAssert['default'];}, function (_loggingLog) {log = _loggingLog['default'];}, function (_utilitiesPath) {path = _utilitiesPath;}, function (_utilitiesObject) {object = _utilitiesObject;}, function (_utilitiesString) {string = _utilitiesString;}, function (_paths) {paths = _paths;}, function (_features_provider) {featuresProvider = _features_provider;}, function (_widget_adaptersAdapters) {adapters = _widget_adaptersAdapters;}], execute: function () {TYPE_WIDGET = 'widget';TYPE_ACTIVITY = 'activity';TECHNOLOGY_ANGULAR = 'angular';DEFAULT_INTEGRATION = { type: TYPE_WIDGET, technology: TECHNOLOGY_ANGULAR };ID_SEPARATOR = '-';INVALID_ID_MATCHER = /[^A-Za-z0-9_\.-]/g;} };});

System.register('lib/runtime/layout_widget_adapter.js', ['angular'], function (_export) {/**
                                                                                          * Copyright 2015 aixigo AG
                                                                                          * Released under the MIT license.
                                                                                          * http://laxarjs.org/license
                                                                                          */'use strict';var ng, 


   $compile, 
   $rootScope, 
   _module, 







   name;_export('create', create);
   function create(layout, widget) {

      var exports = { 
         createController: createController, 
         domAttachTo: domAttachTo, 
         domDetach: domDetach, 
         destroy: destroy };

      var layoutElement;
      var scope;

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      function createController() {}
      // noop


      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      function domAttachTo(areaElement, htmlTemplate) {
         scope = $rootScope.$new();
         scope.widget = widget;

         var layoutNode = document.createElement('div');
         layoutNode.id = widget.id;
         layoutNode.className = layout.className;
         layoutNode.innerHTML = htmlTemplate;

         layoutElement = $compile(layoutNode)(scope);
         areaElement.appendChild(layoutNode);}


      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      function domDetach() {
         layoutElement.remove();}


      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      function destroy() {
         if (scope) {
            scope.$destroy();}

         scope = null;}


      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      return exports;}return { setters: [function (_angular) {ng = _angular['default'];}], execute: function () {_module = ng.module('axLayoutWidgetAdapter', []).run(['$compile', '$rootScope', function (_$compile_, _$rootScope_) {$compile = _$compile_;$rootScope = _$rootScope_;}]); ///////////////////////////////////////////////////////////////////////////////////////////////////////////
         name = _module.name;_export('name', name);} };});

System.registerDynamic("npm:jjv@1.0.2/lib/jjv", [], true, function($__require, exports, module) {
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  "format cjs";
  (function() {
    var clone = function(obj) {
      if (obj === null || typeof obj !== 'object')
        return obj;
      var copy;
      if (obj instanceof Date) {
        copy = new Date();
        copy.setTime(obj.getTime());
        return copy;
      }
      if (obj instanceof RegExp) {
        copy = new RegExp(obj);
        return copy;
      }
      if (obj instanceof Array) {
        copy = [];
        for (var i = 0,
            len = obj.length; i < len; i++)
          copy[i] = clone(obj[i]);
        return copy;
      }
      if (obj instanceof Object) {
        copy = {};
        for (var attr in obj) {
          if (obj.hasOwnProperty(attr))
            copy[attr] = clone(obj[attr]);
        }
        return copy;
      }
      throw new Error("Unable to clone object!");
    };
    var clone_stack = function(stack) {
      var new_stack = [clone(stack[0])],
          key = new_stack[0].key,
          obj = new_stack[0].object;
      for (var i = 1,
          len = stack.length; i < len; i++) {
        obj = obj[key];
        key = stack[i].key;
        new_stack.push({
          object: obj,
          key: key
        });
      }
      return new_stack;
    };
    var copy_stack = function(new_stack, old_stack) {
      var stack_last = new_stack.length - 1,
          key = new_stack[stack_last].key;
      old_stack[stack_last].object[key] = new_stack[stack_last].object[key];
    };
    var handled = {
      'type': true,
      'not': true,
      'anyOf': true,
      'allOf': true,
      'oneOf': true,
      '$ref': true,
      '$schema': true,
      'id': true,
      'exclusiveMaximum': true,
      'exclusiveMininum': true,
      'properties': true,
      'patternProperties': true,
      'additionalProperties': true,
      'items': true,
      'additionalItems': true,
      'required': true,
      'default': true,
      'title': true,
      'description': true,
      'definitions': true,
      'dependencies': true
    };
    var fieldType = {
      'null': function(x) {
        return x === null;
      },
      'string': function(x) {
        return typeof x === 'string';
      },
      'boolean': function(x) {
        return typeof x === 'boolean';
      },
      'number': function(x) {
        return typeof x === 'number' && x === x;
      },
      'integer': function(x) {
        return typeof x === 'number' && x % 1 === 0;
      },
      'object': function(x) {
        return x && typeof x === 'object' && !Array.isArray(x);
      },
      'array': function(x) {
        return Array.isArray(x);
      },
      'date': function(x) {
        return x instanceof Date;
      }
    };
    var fieldFormat = {
      'alpha': function(v) {
        return (/^[a-zA-Z]+$/).test(v);
      },
      'alphanumeric': function(v) {
        return (/^[a-zA-Z0-9]+$/).test(v);
      },
      'identifier': function(v) {
        return (/^[-_a-zA-Z0-9]+$/).test(v);
      },
      'hexadecimal': function(v) {
        return (/^[a-fA-F0-9]+$/).test(v);
      },
      'numeric': function(v) {
        return (/^[0-9]+$/).test(v);
      },
      'date-time': function(v) {
        return !isNaN(Date.parse(v)) && v.indexOf('/') === -1;
      },
      'uppercase': function(v) {
        return v === v.toUpperCase();
      },
      'lowercase': function(v) {
        return v === v.toLowerCase();
      },
      'hostname': function(v) {
        return v.length < 256 && (/^([a-zA-Z0-9]|[a-zA-Z0-9][a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])(\.([a-zA-Z0-9]|[a-zA-Z0-9][a-zA-Z0-9\-]{0,61}[a-zA-Z0-9]))*$/).test(v);
      },
      'uri': function(v) {
        return (/[-a-zA-Z0-9@:%_\+.~#?&//=]{2,256}\.[a-z]{2,4}\b(\/[-a-zA-Z0-9@:%_\+.~#?&//=]*)?/).test(v);
      },
      'email': function(v) {
        return (/^(?:[\w\!\#\$\%\&\'\*\+\-\/\=\?\^\`\{\|\}\~]+\.)*[\w\!\#\$\%\&\'\*\+\-\/\=\?\^\`\{\|\}\~]+@(?:(?:(?:[a-zA-Z0-9](?:[a-zA-Z0-9\-](?!\.)){0,61}[a-zA-Z0-9]?\.)+[a-zA-Z0-9](?:[a-zA-Z0-9\-](?!$)){0,61}[a-zA-Z0-9]?)|(?:\[(?:(?:[01]?\d{1,2}|2[0-4]\d|25[0-5])\.){3}(?:[01]?\d{1,2}|2[0-4]\d|25[0-5])\]))$/).test(v);
      },
      'ipv4': function(v) {
        if ((/^(\d?\d?\d)\.(\d?\d?\d)\.(\d?\d?\d)\.(\d?\d?\d)$/).test(v)) {
          var parts = v.split('.').sort();
          if (parts[3] <= 255)
            return true;
        }
        return false;
      },
      'ipv6': function(v) {
        return (/^((?=.*::)(?!.*::.+::)(::)?([\dA-F]{1,4}:(:|\b)|){5}|([\dA-F]{1,4}:){6})((([\dA-F]{1,4}((?!\3)::|:\b|$))|(?!\2\3)){2}|(((2[0-4]|1\d|[1-9])?\d|25[0-5])\.?\b){4})$/).test(v);
      }
    };
    var fieldValidate = {
      'readOnly': function(v, p) {
        return false;
      },
      'minimum': function(v, p, schema) {
        return !(v < p || schema.exclusiveMinimum && v <= p);
      },
      'maximum': function(v, p, schema) {
        return !(v > p || schema.exclusiveMaximum && v >= p);
      },
      'multipleOf': function(v, p) {
        return (v / p) % 1 === 0 || typeof v !== 'number';
      },
      'pattern': function(v, p) {
        if (typeof v !== 'string')
          return true;
        var pattern,
            modifiers;
        if (typeof p === 'string')
          pattern = p;
        else {
          pattern = p[0];
          modifiers = p[1];
        }
        var regex = new RegExp(pattern, modifiers);
        return regex.test(v);
      },
      'minLength': function(v, p) {
        return v.length >= p || typeof v !== 'string';
      },
      'maxLength': function(v, p) {
        return v.length <= p || typeof v !== 'string';
      },
      'minItems': function(v, p) {
        return v.length >= p || !Array.isArray(v);
      },
      'maxItems': function(v, p) {
        return v.length <= p || !Array.isArray(v);
      },
      'uniqueItems': function(v, p) {
        var hash = {},
            key;
        for (var i = 0,
            len = v.length; i < len; i++) {
          key = JSON.stringify(v[i]);
          if (hash.hasOwnProperty(key))
            return false;
          else
            hash[key] = true;
        }
        return true;
      },
      'minProperties': function(v, p) {
        if (typeof v !== 'object')
          return true;
        var count = 0;
        for (var attr in v)
          if (v.hasOwnProperty(attr))
            count = count + 1;
        return count >= p;
      },
      'maxProperties': function(v, p) {
        if (typeof v !== 'object')
          return true;
        var count = 0;
        for (var attr in v)
          if (v.hasOwnProperty(attr))
            count = count + 1;
        return count <= p;
      },
      'constant': function(v, p) {
        return JSON.stringify(v) == JSON.stringify(p);
      },
      'enum': function(v, p) {
        var i,
            len,
            vs;
        if (typeof v === 'object') {
          vs = JSON.stringify(v);
          for (i = 0, len = p.length; i < len; i++)
            if (vs === JSON.stringify(p[i]))
              return true;
        } else {
          for (i = 0, len = p.length; i < len; i++)
            if (v === p[i])
              return true;
        }
        return false;
      }
    };
    var normalizeID = function(id) {
      return id.indexOf("://") === -1 ? id : id.split("#")[0];
    };
    var resolveURI = function(env, schema_stack, uri) {
      var curschema,
          components,
          hash_idx,
          name;
      hash_idx = uri.indexOf('#');
      if (hash_idx === -1) {
        if (!env.schema.hasOwnProperty(uri))
          return null;
        return [env.schema[uri]];
      }
      if (hash_idx > 0) {
        name = uri.substr(0, hash_idx);
        uri = uri.substr(hash_idx + 1);
        if (!env.schema.hasOwnProperty(name)) {
          if (schema_stack && schema_stack[0].id === name)
            schema_stack = [schema_stack[0]];
          else
            return null;
        } else
          schema_stack = [env.schema[name]];
      } else {
        if (!schema_stack)
          return null;
        uri = uri.substr(1);
      }
      if (uri === '')
        return [schema_stack[0]];
      if (uri.charAt(0) === '/') {
        uri = uri.substr(1);
        curschema = schema_stack[0];
        components = uri.split('/');
        while (components.length > 0) {
          if (!curschema.hasOwnProperty(components[0]))
            return null;
          curschema = curschema[components[0]];
          schema_stack.push(curschema);
          components.shift();
        }
        return schema_stack;
      } else
        return null;
    };
    var resolveObjectRef = function(object_stack, uri) {
      var components,
          object,
          last_frame = object_stack.length - 1,
          skip_frames,
          frame,
          m = /^(\d+)/.exec(uri);
      if (m) {
        uri = uri.substr(m[0].length);
        skip_frames = parseInt(m[1], 10);
        if (skip_frames < 0 || skip_frames > last_frame)
          return;
        frame = object_stack[last_frame - skip_frames];
        if (uri === '#')
          return frame.key;
      } else
        frame = object_stack[0];
      object = frame.object[frame.key];
      if (uri === '')
        return object;
      if (uri.charAt(0) === '/') {
        uri = uri.substr(1);
        components = uri.split('/');
        while (components.length > 0) {
          components[0] = components[0].replace(/~1/g, '/').replace(/~0/g, '~');
          if (!object.hasOwnProperty(components[0]))
            return;
          object = object[components[0]];
          components.shift();
        }
        return object;
      } else
        return;
    };
    var checkValidity = function(env, schema_stack, object_stack, options) {
      var i,
          len,
          count,
          hasProp,
          hasPattern;
      var p,
          v,
          malformed = false,
          objerrs = {},
          objerr,
          props,
          matched;
      var sl = schema_stack.length - 1,
          schema = schema_stack[sl],
          new_stack;
      var ol = object_stack.length - 1,
          object = object_stack[ol].object,
          name = object_stack[ol].key,
          prop = object[name];
      var errCount,
          minErrCount;
      if (schema.hasOwnProperty('$ref')) {
        schema_stack = resolveURI(env, schema_stack, schema.$ref);
        if (!schema_stack)
          return {'$ref': schema.$ref};
        else
          return checkValidity(env, schema_stack, object_stack, options);
      }
      if (schema.hasOwnProperty('type')) {
        if (typeof schema.type === 'string') {
          if (options.useCoerce && env.coerceType.hasOwnProperty(schema.type))
            prop = object[name] = env.coerceType[schema.type](prop);
          if (!env.fieldType[schema.type](prop))
            return {'type': schema.type};
        } else {
          malformed = true;
          for (i = 0, len = schema.type.length; i < len && malformed; i++)
            if (env.fieldType[schema.type[i]](prop))
              malformed = false;
          if (malformed)
            return {'type': schema.type};
        }
      }
      if (schema.hasOwnProperty('allOf')) {
        for (i = 0, len = schema.allOf.length; i < len; i++) {
          objerr = checkValidity(env, schema_stack.concat(schema.allOf[i]), object_stack, options);
          if (objerr)
            return objerr;
        }
      }
      if (!options.useCoerce && !options.useDefault && !options.removeAdditional) {
        if (schema.hasOwnProperty('oneOf')) {
          minErrCount = Infinity;
          for (i = 0, len = schema.oneOf.length, count = 0; i < len; i++) {
            objerr = checkValidity(env, schema_stack.concat(schema.oneOf[i]), object_stack, options);
            if (!objerr) {
              count = count + 1;
              if (count > 1)
                break;
            } else {
              errCount = objerr.schema ? Object.keys(objerr.schema).length : 1;
              if (errCount < minErrCount) {
                minErrCount = errCount;
                objerrs = objerr;
              }
            }
          }
          if (count > 1)
            return {'oneOf': true};
          else if (count < 1)
            return objerrs;
          objerrs = {};
        }
        if (schema.hasOwnProperty('anyOf')) {
          objerrs = null;
          minErrCount = Infinity;
          for (i = 0, len = schema.anyOf.length; i < len; i++) {
            objerr = checkValidity(env, schema_stack.concat(schema.anyOf[i]), object_stack, options);
            if (!objerr) {
              objerrs = null;
              break;
            } else {
              errCount = objerr.schema ? Object.keys(objerr.schema).length : 1;
              if (errCount < minErrCount) {
                minErrCount = errCount;
                objerrs = objerr;
              }
            }
          }
          if (objerrs)
            return objerrs;
        }
        if (schema.hasOwnProperty('not')) {
          objerr = checkValidity(env, schema_stack.concat(schema.not), object_stack, options);
          if (!objerr)
            return {'not': true};
        }
      } else {
        if (schema.hasOwnProperty('oneOf')) {
          minErrCount = Infinity;
          for (i = 0, len = schema.oneOf.length, count = 0; i < len; i++) {
            new_stack = clone_stack(object_stack);
            objerr = checkValidity(env, schema_stack.concat(schema.oneOf[i]), new_stack, options);
            if (!objerr) {
              count = count + 1;
              if (count > 1)
                break;
              else
                copy_stack(new_stack, object_stack);
            } else {
              errCount = objerr.schema ? Object.keys(objerr.schema).length : 1;
              if (errCount < minErrCount) {
                minErrCount = errCount;
                objerrs = objerr;
              }
            }
          }
          if (count > 1)
            return {'oneOf': true};
          else if (count < 1)
            return objerrs;
          objerrs = {};
        }
        if (schema.hasOwnProperty('anyOf')) {
          objerrs = null;
          minErrCount = Infinity;
          for (i = 0, len = schema.anyOf.length; i < len; i++) {
            new_stack = clone_stack(object_stack);
            objerr = checkValidity(env, schema_stack.concat(schema.anyOf[i]), new_stack, options);
            if (!objerr) {
              copy_stack(new_stack, object_stack);
              objerrs = null;
              break;
            } else {
              errCount = objerr.schema ? Object.keys(objerr.schema).length : 1;
              if (errCount < minErrCount) {
                minErrCount = errCount;
                objerrs = objerr;
              }
            }
          }
          if (objerrs)
            return objerrs;
        }
        if (schema.hasOwnProperty('not')) {
          new_stack = clone_stack(object_stack);
          objerr = checkValidity(env, schema_stack.concat(schema.not), new_stack, options);
          if (!objerr)
            return {'not': true};
        }
      }
      if (schema.hasOwnProperty('dependencies')) {
        for (p in schema.dependencies)
          if (schema.dependencies.hasOwnProperty(p) && prop.hasOwnProperty(p)) {
            if (Array.isArray(schema.dependencies[p])) {
              for (i = 0, len = schema.dependencies[p].length; i < len; i++)
                if (!prop.hasOwnProperty(schema.dependencies[p][i])) {
                  return {'dependencies': true};
                }
            } else {
              objerr = checkValidity(env, schema_stack.concat(schema.dependencies[p]), object_stack, options);
              if (objerr)
                return objerr;
            }
          }
      }
      if (!Array.isArray(prop)) {
        props = [];
        objerrs = {};
        for (p in prop)
          if (prop.hasOwnProperty(p))
            props.push(p);
        if (options.checkRequired && schema.required) {
          for (i = 0, len = schema.required.length; i < len; i++)
            if (!prop.hasOwnProperty(schema.required[i])) {
              objerrs[schema.required[i]] = {'required': true};
              malformed = true;
            }
        }
        hasProp = schema.hasOwnProperty('properties');
        hasPattern = schema.hasOwnProperty('patternProperties');
        if (hasProp || hasPattern) {
          i = props.length;
          while (i--) {
            matched = false;
            if (hasProp && schema.properties.hasOwnProperty(props[i])) {
              matched = true;
              objerr = checkValidity(env, schema_stack.concat(schema.properties[props[i]]), object_stack.concat({
                object: prop,
                key: props[i]
              }), options);
              if (objerr !== null) {
                objerrs[props[i]] = objerr;
                malformed = true;
              }
            }
            if (hasPattern) {
              for (p in schema.patternProperties)
                if (schema.patternProperties.hasOwnProperty(p) && props[i].match(p)) {
                  matched = true;
                  objerr = checkValidity(env, schema_stack.concat(schema.patternProperties[p]), object_stack.concat({
                    object: prop,
                    key: props[i]
                  }), options);
                  if (objerr !== null) {
                    objerrs[props[i]] = objerr;
                    malformed = true;
                  }
                }
            }
            if (matched)
              props.splice(i, 1);
          }
        }
        if (options.useDefault && hasProp && !malformed) {
          for (p in schema.properties)
            if (schema.properties.hasOwnProperty(p) && !prop.hasOwnProperty(p) && schema.properties[p].hasOwnProperty('default'))
              prop[p] = schema.properties[p]['default'];
        }
        if (options.removeAdditional && hasProp && schema.additionalProperties !== true && typeof schema.additionalProperties !== 'object') {
          for (i = 0, len = props.length; i < len; i++)
            delete prop[props[i]];
        } else {
          if (schema.hasOwnProperty('additionalProperties')) {
            if (typeof schema.additionalProperties === 'boolean') {
              if (!schema.additionalProperties) {
                for (i = 0, len = props.length; i < len; i++) {
                  objerrs[props[i]] = {'additional': true};
                  malformed = true;
                }
              }
            } else {
              for (i = 0, len = props.length; i < len; i++) {
                objerr = checkValidity(env, schema_stack.concat(schema.additionalProperties), object_stack.concat({
                  object: prop,
                  key: props[i]
                }), options);
                if (objerr !== null) {
                  objerrs[props[i]] = objerr;
                  malformed = true;
                }
              }
            }
          }
        }
        if (malformed)
          return {'schema': objerrs};
      } else {
        if (schema.hasOwnProperty('items')) {
          if (Array.isArray(schema.items)) {
            for (i = 0, len = schema.items.length; i < len; i++) {
              objerr = checkValidity(env, schema_stack.concat(schema.items[i]), object_stack.concat({
                object: prop,
                key: i
              }), options);
              if (objerr !== null) {
                objerrs[i] = objerr;
                malformed = true;
              }
            }
            if (prop.length > len && schema.hasOwnProperty('additionalItems')) {
              if (typeof schema.additionalItems === 'boolean') {
                if (!schema.additionalItems)
                  return {'additionalItems': true};
              } else {
                for (i = len, len = prop.length; i < len; i++) {
                  objerr = checkValidity(env, schema_stack.concat(schema.additionalItems), object_stack.concat({
                    object: prop,
                    key: i
                  }), options);
                  if (objerr !== null) {
                    objerrs[i] = objerr;
                    malformed = true;
                  }
                }
              }
            }
          } else {
            for (i = 0, len = prop.length; i < len; i++) {
              objerr = checkValidity(env, schema_stack.concat(schema.items), object_stack.concat({
                object: prop,
                key: i
              }), options);
              if (objerr !== null) {
                objerrs[i] = objerr;
                malformed = true;
              }
            }
          }
        } else if (schema.hasOwnProperty('additionalItems')) {
          if (typeof schema.additionalItems !== 'boolean') {
            for (i = 0, len = prop.length; i < len; i++) {
              objerr = checkValidity(env, schema_stack.concat(schema.additionalItems), object_stack.concat({
                object: prop,
                key: i
              }), options);
              if (objerr !== null) {
                objerrs[i] = objerr;
                malformed = true;
              }
            }
          }
        }
        if (malformed)
          return {'schema': objerrs};
      }
      for (v in schema) {
        if (schema.hasOwnProperty(v) && !handled.hasOwnProperty(v)) {
          if (v === 'format') {
            if (env.fieldFormat.hasOwnProperty(schema[v]) && !env.fieldFormat[schema[v]](prop, schema, object_stack, options)) {
              objerrs[v] = true;
              malformed = true;
            }
          } else {
            if (env.fieldValidate.hasOwnProperty(v) && !env.fieldValidate[v](prop, schema[v].hasOwnProperty('$data') ? resolveObjectRef(object_stack, schema[v].$data) : schema[v], schema, object_stack, options)) {
              objerrs[v] = true;
              malformed = true;
            }
          }
        }
      }
      if (malformed)
        return objerrs;
      else
        return null;
    };
    var defaultOptions = {
      useDefault: false,
      useCoerce: false,
      checkRequired: true,
      removeAdditional: false
    };
    function Environment() {
      if (!(this instanceof Environment))
        return new Environment();
      this.coerceType = {};
      this.fieldType = clone(fieldType);
      this.fieldValidate = clone(fieldValidate);
      this.fieldFormat = clone(fieldFormat);
      this.defaultOptions = clone(defaultOptions);
      this.schema = {};
    }
    Environment.prototype = {
      validate: function(name, object, options) {
        var schema_stack = [name],
            errors = null,
            object_stack = [{
              object: {'__root__': object},
              key: '__root__'
            }];
        if (typeof name === 'string') {
          schema_stack = resolveURI(this, null, name);
          if (!schema_stack)
            throw new Error('jjv: could not find schema \'' + name + '\'.');
        }
        if (!options) {
          options = this.defaultOptions;
        } else {
          for (var p in this.defaultOptions)
            if (this.defaultOptions.hasOwnProperty(p) && !options.hasOwnProperty(p))
              options[p] = this.defaultOptions[p];
        }
        errors = checkValidity(this, schema_stack, object_stack, options);
        if (errors)
          return {validation: errors.hasOwnProperty('schema') ? errors.schema : errors};
        else
          return null;
      },
      resolveRef: function(schema_stack, $ref) {
        return resolveURI(this, schema_stack, $ref);
      },
      addType: function(name, func) {
        this.fieldType[name] = func;
      },
      addTypeCoercion: function(type, func) {
        this.coerceType[type] = func;
      },
      addCheck: function(name, func) {
        this.fieldValidate[name] = func;
      },
      addFormat: function(name, func) {
        this.fieldFormat[name] = func;
      },
      addSchema: function(name, schema) {
        if (!schema && name) {
          schema = name;
          name = undefined;
        }
        if (schema.hasOwnProperty('id') && typeof schema.id === 'string' && schema.id !== name) {
          if (schema.id.charAt(0) === '/')
            throw new Error('jjv: schema id\'s starting with / are invalid.');
          this.schema[normalizeID(schema.id)] = schema;
        } else if (!name) {
          throw new Error('jjv: schema needs either a name or id attribute.');
        }
        if (name)
          this.schema[normalizeID(name)] = schema;
      }
    };
    if (typeof module !== 'undefined' && typeof module.exports !== 'undefined')
      module.exports = Environment;
    else if (typeof define === 'function' && define.amd)
      define(function() {
        return Environment;
      });
    else
      this.jjv = Environment;
  }).call(this);
  global.define = __define;
  return module.exports;
});

System.registerDynamic("npm:jjv@1.0.2/index", ["./lib/jjv"], true, function($__require, exports, module) {
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  module.exports = $__require('./lib/jjv');
  global.define = __define;
  return module.exports;
});

System.registerDynamic("npm:jjv@1.0.2", ["npm:jjv@1.0.2/index"], true, function($__require, exports, module) {
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  module.exports = $__require('npm:jjv@1.0.2/index');
  global.define = __define;
  return module.exports;
});

System.registerDynamic("npm:jjve@0.5.1/jjve", [], true, function($__require, exports, module) {
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  "format cjs";
  (function() {
    'use strict';
    function make(o) {
      var errors = [];
      var keys = Object.keys(o.validation);
      var leaf = keys.every(function(key) {
        return typeof o.validation[key] !== 'object' || isArray(o.validation[key]);
      });
      if (leaf) {
        keys.forEach(function(key) {
          var error,
              properties;
          try {
            switch (key) {
              case 'type':
                var type = typeof o.data;
                if (type === 'number' && ('' + o.data).match(/^\d+$/)) {
                  type = 'integer';
                } else if (type === 'object' && Array.isArray(o.data)) {
                  type = 'array';
                }
                error = {
                  code: 'INVALID_TYPE',
                  message: 'Invalid type: ' + type + ' should be ' + (isArray(o.validation[key]) ? 'one of ' : '') + o.validation[key]
                };
                break;
              case 'required':
                properties = o.ns;
                error = {
                  code: 'OBJECT_REQUIRED',
                  message: 'Missing required property: ' + properties[properties.length - 1]
                };
                break;
              case 'minimum':
                error = {
                  code: 'MINIMUM',
                  message: 'Value ' + o.data + ' is less than minimum ' + o.schema.minimum
                };
                break;
              case 'maximum':
                error = {
                  code: 'MAXIMUM',
                  message: 'Value ' + o.data + ' is greater than maximum ' + o.schema.maximum
                };
                break;
              case 'multipleOf':
                error = {
                  code: 'MULTIPLE_OF',
                  message: 'Value ' + o.data + ' is not a multiple of ' + o.schema.multipleOf
                };
                break;
              case 'pattern':
                error = {
                  code: 'PATTERN',
                  message: 'String does not match pattern: ' + o.schema.pattern
                };
                break;
              case 'minLength':
                error = {
                  code: 'MIN_LENGTH',
                  message: 'String is too short (' + o.data.length + ' chars), ' + 'minimum ' + o.schema.minLength
                };
                break;
              case 'maxLength':
                error = {
                  code: 'MAX_LENGTH',
                  message: 'String is too long (' + o.data.length + ' chars), ' + 'maximum ' + o.schema.maxLength
                };
                break;
              case 'minItems':
                error = {
                  code: 'ARRAY_LENGTH_SHORT',
                  message: 'Array is too short (' + o.data.length + '), ' + 'minimum ' + o.schema.minItems
                };
                break;
              case 'maxItems':
                error = {
                  code: 'ARRAY_LENGTH_LONG',
                  message: 'Array is too long (' + o.data.length + '), maximum ' + o.schema.maxItems
                };
                break;
              case 'uniqueItems':
                error = {
                  code: 'ARRAY_UNIQUE',
                  message: 'Array items are not unique'
                };
                break;
              case 'minProperties':
                error = {
                  code: 'OBJECT_PROPERTIES_MINIMUM',
                  message: 'Too few properties defined (' + Object.keys(o.data).length + '), minimum ' + o.schema.minProperties
                };
                break;
              case 'maxProperties':
                error = {
                  code: 'OBJECT_PROPERTIES_MAXIMUM',
                  message: 'Too many properties defined (' + Object.keys(o.data).length + '), maximum ' + o.schema.maxProperties
                };
                break;
              case 'enum':
                error = {
                  code: 'ENUM_MISMATCH',
                  message: 'No enum match (' + o.data + '), expects: ' + o.schema['enum'].join(', ')
                };
                break;
              case 'not':
                error = {
                  code: 'NOT_PASSED',
                  message: 'Data matches schema from "not"'
                };
                break;
              case 'additional':
                properties = o.ns;
                error = {
                  code: 'ADDITIONAL_PROPERTIES',
                  message: 'Additional properties not allowed: ' + properties[properties.length - 1]
                };
                break;
              case 'format':
                error = {
                  code: 'FORMAT',
                  message: 'Value does not satisfy format: ' + o.schema.format
                };
                break;
            }
          } catch (err) {}
          if (!error) {
            error = {
              code: 'FAILED',
              message: 'Validation error: ' + key
            };
            try {
              if (typeof o.validation[key] !== 'boolean') {
                error.message = ' (' + o.validation[key] + ')';
              }
            } catch (err) {}
          }
          error.code = 'VALIDATION_' + error.code;
          if (o.data !== undefined)
            error.data = o.data;
          error.path = o.ns;
          errors.push(error);
        });
      } else {
        keys.forEach(function(key) {
          var s;
          if (o.schema.$ref) {
            if (o.schema.$ref.match(/#\/definitions\//)) {
              o.schema = o.definitions[o.schema.$ref.slice(14)];
            } else {
              o.schema = o.schema.$ref;
            }
            if (typeof o.schema === 'string') {
              o.schema = o.env.resolveRef(null, o.schema);
              if (o.schema)
                o.schema = o.schema[0];
            }
            if (!o.schema.type)
              o.schema.type = 'object';
          }
          if (o.schema && o.schema.type) {
            if (allowsType(o.schema, 'object')) {
              if (o.schema.properties && o.schema.properties[key]) {
                s = o.schema.properties[key];
              }
              if (!s && o.schema.patternProperties) {
                Object.keys(o.schema.patternProperties).some(function(pkey) {
                  if (key.match(new RegExp(pkey))) {
                    s = o.schema.patternProperties[pkey];
                    return true;
                  }
                });
              }
              if (!s && o.schema.hasOwnProperty('additionalProperties')) {
                if (typeof o.schema.additionalProperties === 'boolean') {
                  s = {};
                } else {
                  s = o.schema.additionalProperties;
                }
              }
            }
            if (allowsType(o.schema, 'array')) {
              s = o.schema.items;
            }
          }
          var opts = {
            env: o.env,
            schema: s || {},
            ns: o.ns.concat(key)
          };
          try {
            opts.data = o.data[key];
          } catch (err) {}
          try {
            opts.validation = o.validation[key].schema ? o.validation[key].schema : o.validation[key];
          } catch (err) {
            opts.validation = {};
          }
          try {
            opts.definitions = s.definitions || o.definitions;
          } catch (err) {
            opts.definitions = o.definitions;
          }
          errors = errors.concat(make(opts));
        });
      }
      return errors;
    }
    function allowsType(schema, type) {
      if (typeof schema.type === 'string') {
        return schema.type === type;
      }
      if (isArray(schema.type)) {
        return schema.type.indexOf(type) !== -1;
      }
      return false;
    }
    function isArray(obj) {
      if (typeof Array.isArray === 'function') {
        return Array.isArray(obj);
      }
      return Object.prototype.toString.call(obj) === '[object Array]';
    }
    function formatPath(options) {
      var root = options.hasOwnProperty('root') ? options.root : '$';
      var sep = options.hasOwnProperty('sep') ? options.sep : '.';
      return function(error) {
        var path = root;
        error.path.forEach(function(key) {
          path += key.match(/^\d+$/) ? '[' + key + ']' : key.match(/^[A-Z_$][0-9A-Z_$]*$/i) ? (sep + key) : ('[' + JSON.stringify(key) + ']');
        });
        error.path = path;
        return error;
      };
    }
    function jjve(env) {
      return function jjve(schema, data, result, options) {
        if (!result || !result.validation)
          return [];
        options = options || {};
        if (typeof schema === 'string') {
          schema = env.schema[schema];
        }
        var errors = make({
          env: env,
          schema: schema,
          data: data,
          validation: result.validation,
          ns: [],
          definitions: schema.definitions || {}
        });
        if (errors.length && options.formatPath !== false) {
          return errors.map(formatPath(options));
        }
        return errors;
      };
    }
    if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
      module.exports = jjve;
    } else if (typeof define === 'function' && define.amd) {
      define(function() {
        return jjve;
      });
    } else {
      this.jjve = jjve;
    }
  }).call(this);
  global.define = __define;
  return module.exports;
});

System.registerDynamic("npm:jjve@0.5.1", ["npm:jjve@0.5.1/jjve"], true, function($__require, exports, module) {
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  module.exports = $__require('npm:jjve@0.5.1/jjve');
  global.define = __define;
  return module.exports;
});

System.register('lib/json/schema.js', ['npm:babel-runtime@5.8.34/core-js/object/keys', '../utilities/object'], function (_export) {var _Object$keys, object;






   function transformV3V4Recursively(schema, parentKey, parentSchema, originalParentSchema) {
      var resultingSchema = {};

      _Object$keys(schema).forEach(function (key) {

         var value = schema[key];

         switch (key) {
            case 'required':
               if (value !== true) {
                  break;}


               if (isNamedProperty(parentKey, originalParentSchema) && !('default' in schema)) {
                  if (!('required' in parentSchema)) {
                     parentSchema.required = [];}

                  parentSchema.required.push(parentKey);}

               break;

            case 'items':
               resultingSchema[key] = transformV3V4Recursively(value, key, resultingSchema, schema);
               break;

            case 'additionalProperties':
               if (typeof value === 'object') {
                  resultingSchema[key] = transformV3V4Recursively(value, key, resultingSchema, schema);} else 

               {
                  resultingSchema[key] = value;}

               break;

            case 'properties':
            case 'patternProperties':
               resultingSchema[key] = {};
               object.forEach(value, function (patternSchema, pattern) {
                  resultingSchema[key][pattern] = 
                  transformV3V4Recursively(patternSchema, pattern, resultingSchema, schema);});

               break;

            default:
               resultingSchema[key] = value;}});





      // LaxarJS specific: transform "not required" to "allow null"
      if (isNamedProperty(parentKey, originalParentSchema) && !schema.required) {
         var propertyType = resultingSchema.type;
         if (typeof propertyType === 'string' && propertyType !== 'null') {
            resultingSchema.type = [propertyType, 'null'];} else 

         if (Array.isArray(propertyType) && propertyType.indexOf('null') === -1) {
            propertyType.push('null');}}



      return resultingSchema;}


   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function prohibitAdditionalPropertiesRecursively(schema) {
      if (('properties' in schema || 'patternProperties' in schema) && 
      !('additionalProperties' in schema)) {
         schema.additionalProperties = false;}


      if ('properties' in schema) {
         _Object$keys(schema.properties).forEach(function (name) {
            prohibitAdditionalPropertiesRecursively(schema.properties[name]);});}



      if ('additionalProperties' in schema && typeof schema.additionalProperties === 'object') {
         prohibitAdditionalPropertiesRecursively(schema.additionalProperties);}


      if ('patternProperties' in schema) {
         _Object$keys(schema.patternProperties).forEach(function (pattern) {
            prohibitAdditionalPropertiesRecursively(schema.patternProperties[pattern]);});}



      if ('items' in schema) {
         prohibitAdditionalPropertiesRecursively(schema.items);}}



   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function isNamedProperty(key, parentSchema) {
      return parentSchema && 
      schemaAllowsType(parentSchema, 'object') && 
      object.path(parentSchema, 'properties.' + key);}


   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function schemaAllowsType(schema, type) {
      var schemaType = schema.type;
      if (typeof schemaType === 'string') {
         return schemaType === type;}

      if (Array.isArray(schemaType)) {
         return schemaType.indexOf(type) !== -1;}


      return true;}


   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function transformV3ToV4(schema) {
      return transformV3V4Recursively(schema);}


   ////////////////////////////////////////////////////////////////////////////////////////////////////////

   function prohibitAdditionalProperties(schema) {
      prohibitAdditionalPropertiesRecursively(schema);}return { setters: [function (_babelRuntimeCoreJsObjectKeys) {_Object$keys = _babelRuntimeCoreJsObjectKeys['default'];}, function (_utilitiesObject) {object = _utilitiesObject;}], execute: function () {/**
                                                                                                                                                                                                                                                                 * Copyright 2015 aixigo AG
                                                                                                                                                                                                                                                                 * Released under the MIT license.
                                                                                                                                                                                                                                                                 * http://laxarjs.org/license
                                                                                                                                                                                                                                                                 */'use strict';_export('transformV3ToV4', transformV3ToV4);_export('prohibitAdditionalProperties', prohibitAdditionalProperties);} };});

System.register('lib/json/validator.js', ['jjv', 'jjve', './schema', '../utilities/object'], function (_export) {/**
                                                                                                                  * Copyright 2015 aixigo AG
                                                                                                                  * Released under the MIT license.
                                                                                                                  * http://laxarjs.org/license
                                                                                                                  */'use strict';var jjv, jjve, schema, objectUtils, 





   JSON_SCHEMA_V4_URI;_export('create', create);

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function transformResult(result, schema, object, env) {
      if (!result) {
         return { 
            errors: [] };}



      var messageGenerator = jjve(env);

      return { 
         errors: messageGenerator(schema, object, result).
         map(function (error) {
            return objectUtils.options({ 
               message: error.message + '. Path: "' + error.path + '".' }, 
            error);}) };}




   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   /**
    * Creates and returns a new JSON validator for schema draft version 4. Minimal conversion from v3 to v4
    * is builtin, but it is strongly advised to create new schemas using the version 4 draft. Version
    * detection for v4 is realized by checking if the `$schema` property of the root schema equals the
    * uri `http://json-schema.org/draft-04/schema#`. If the `$schema` property is missing or has a
    * different value, v3 is assumed.
    * See https://github.com/json-schema/json-schema/wiki/ChangeLog for differences between v3 and v4.
    *
    * @param {Object} jsonSchema
    *    the JSON schema to use when validating
    * @param {Object} [options]
    *    an optional set of options
    * @param {Boolean} options.prohibitAdditionalProperties
    *    sets additionalProperties to false if not defined otherwise for the according object schema
    * @param {Boolean} options.checkRequired
    *    (jjv option) if `true` it reports missing required properties, otherwise it allows missing
    *    required properties. Default is `true`
    * @param {Boolean} options.useDefault
    *    (jjv option) If true it modifies the validated object to have the default values for missing
    *    non-required fields. Default is `false`
    * @param {Boolean} options.useCoerce
    *    (jjv option) if `true` it enables type coercion where defined. Default is `false`
    * @param {Boolean} options.removeAdditional
    *    (jjv option) if `true` it removes all attributes of an object which are not matched by the
    *    schema's specification. Default is `false`
    *
    *
    * @return {Object}
    *    a new instance of JsonValidator
    */
   function create(jsonSchema, options) {
      var env = jjv();
      options = objectUtils.options(options, { 
         prohibitAdditionalProperties: false });

      env.defaultOptions = objectUtils.options(options, env.defaultOptions);

      if (!('$schema' in jsonSchema) || jsonSchema.$schema !== JSON_SCHEMA_V4_URI) {
         // While schema draft v4 is directly supported by the underlying validator, we need to transform
         // older v3 schemas to valid v4 schemas. Furthermore all of our existing schemas are v3 without
         // version info. Thus, whenever we find a schema without version info or a version info that isn't
         // v4, we assume a v3 schema and translate it to v4.
         // Note that only the small subset of v3 features is transformed v4 features that is needed for
         // legacy schemas.
         // Using `this` reference for testability / spying
         jsonSchema = schema.transformV3ToV4(jsonSchema);
         jsonSchema.$schema = JSON_SCHEMA_V4_URI;

         env.addType('any', function (value) {
            return true;});}



      if (options.prohibitAdditionalProperties) {
         schema.prohibitAdditionalProperties(jsonSchema);}


      var origValidate = env.validate;

      env.validate = function (object) {
         var result = origValidate.call(env, jsonSchema, object);
         return transformResult(result, jsonSchema, object, env);};


      return env;}return { setters: [function (_jjv) {jjv = _jjv['default'];}, function (_jjve) {jjve = _jjve['default'];}, function (_schema) {schema = _schema;}, function (_utilitiesObject) {objectUtils = _utilitiesObject;}], execute: function () {JSON_SCHEMA_V4_URI = 'http://json-schema.org/draft-04/schema#';_export('JSON_SCHEMA_V4_URI', 


         JSON_SCHEMA_V4_URI);} };});

System.register('lib/utilities/storage.js', ['./assert', './configuration'], function (_export) {/**
                                                                                                  * Copyright 2015 aixigo AG
                                                                                                  * Released under the MIT license.
                                                                                                  * http://laxarjs.org/license
                                                                                                  */
   /**
    * Provides a convenient api over the browser's `window.localStorage` and `window.sessionStorage` objects. If
    * a browser doesn't support [web storage](http://www.w3.org/TR/webstorage/), a warning is logged to the
    * `console` (if available) and a non-persistent in-memory store will be used instead. Note that this can for
    * example also happen when using Mozilla Firefox with cookies disabled and as such isn't limited to older
    * browsers.
    *
    * Additionally, in contrast to plain *web storage* access, non-string values will be automatically passed
    * through JSON (de-) serialization on storage or retrieval. All keys will be prepended with a combination of
    * an arbitrary and a configured namespace to prevent naming clashes with other web applications running on
    * the same host and port. All {@link StorageApi} accessor methods should then be called without any namespace
    * since adding and removing it, is done automatically.
    *
    * When requiring `laxar`, it is available as `laxar.storage`.
    *
    * @module storage
    */'use strict';var assert, configuration, 



   SESSION, 
   LOCAL, 











































































































































































































































   instance; ///////////////////////////////////////////////////////////////////////////////////////////////////////////
   _export('create', create); ///////////////////////////////////////////////////////////////////////////////////////////////////////////
   /**
    * @param {Object} backend
    *    the K/V store, probably only accepting string values
    * @param {String} namespace
    *    prefix for all keys for namespacing purposes
    *
    * @return {StorageApi}
    *    a storage wrapper to the given backend with `getItem`, `setItem` and `removeItem` methods
    *
    * @private
    */function createStorage(backend, namespace) {/**
                                                   * The api returned by one of the `get*Storage` functions of the *storage* module.
                                                   *
                                                   * @name StorageApi
                                                   * @constructor
                                                   */return { getItem: getItem, setItem: setItem, removeItem: removeItem }; ////////////////////////////////////////////////////////////////////////////////////////////////////////
      /**
       * Retrieves a `value` by `key` from the store. JSON deserialization will automatically be applied.
       *
       * @param {String} key
       *    the key of the item to retrieve (without namespace prefix)
       *
       * @return {*}
       *    the value or `null` if it doesn't exist in the store
       *
       * @memberOf StorageApi
       */function getItem(key) {var item = backend.getItem(namespace + '.' + key);return item ? JSON.parse(item) : item;} ////////////////////////////////////////////////////////////////////////////////////////////////////////
      /**
       * Sets a `value` for a `key`. The value should be JSON serializable. An existing value will be
       * overwritten.
       *
       * @param {String} key
       *    the key of the item to set (without namespace prefix)
       * @param {*} value
       *    the new value to set
       *
       * @memberOf StorageApi
       */function setItem(key, value) {var nsKey = namespace + '.' + key;if (value === undefined) {backend.removeItem(nsKey);} else {backend.setItem(nsKey, JSON.stringify(value));}} ////////////////////////////////////////////////////////////////////////////////////////////////////////
      /**
       * Removes the value associated with `key` from the store.
       *
       * @param {String} key
       *    the key of the item to remove (without namespace prefix)
       *
       * @memberOf StorageApi
       */function removeItem(key) {backend.removeItem(namespace + '.' + key);}} ///////////////////////////////////////////////////////////////////////////////////////////////////////////
   function getOrFakeBackend(webStorageName) {var store = window[webStorageName];if (store.setItem && store.getItem && store.removeItem) {try {var testKey = 'ax.storage.testItem'; // In iOS Safari Private Browsing, this will fail:
            store.setItem(testKey, 1);store.removeItem(testKey);return store;} catch (e) {// setItem failed: must use fake storage
         }}if (window.console) {var method = 'warn' in window.console ? 'warn' : 'log';window.console[method]('window.' + webStorageName + ' not available: Using non-persistent polyfill. \n' + 'Try disabling private browsing or enabling cookies.');}var backend = {};return { getItem: function getItem(key) {return backend[key] || null;}, setItem: function setItem(key, val) {backend[key] = val;}, removeItem: function removeItem(key) {if (key in backend) {delete backend[key];}} };} ///////////////////////////////////////////////////////////////////////////////////////////////////////////
   function generateUniquePrefix() {var prefix = configuration.get('storagePrefix');if (prefix) {return prefix;}var str = configuration.get('name', '');var res = 0; /* jshint bitwise:false */for (var i = str.length - 1; i > 0; --i) {res = (res << 5) - res + str.charCodeAt(i);res |= 0;}return Math.abs(res);} ///////////////////////////////////////////////////////////////////////////////////////////////////////////
   /**
    * Creates a new storage module. In most cases this module will be called without arguments,
    * but having the ability to provide them is useful e.g. for mocking purposes within tests.
    * If the arguments are omitted, an attempt is made to access the native browser WebStorage api.
    * If that fails, storage is only mocked by an in memory map (thus actually unavailable).
    *
    * Developers are free to use polyfills to support cases where local- or session-storage may not be
    * available. Just make sure to initialize the polyfills before this module.
    *
    * @param {Object} [localStorageBackend]
    *    the backend for local storage, Default is `window.localStorage`
    * @param {Object} [sessionStorageBackend]
    *    the backend for session storage, Default is `window.sessionStorage`
    *
    * @return {Object}
    *    a new storage module
    */function create(localStorageBackend, sessionStorageBackend) {var localBackend = localStorageBackend || getOrFakeBackend(LOCAL);var sessionBackend = sessionStorageBackend || getOrFakeBackend(SESSION);var prefix = 'ax.' + generateUniquePrefix() + '.';return { /**
                                                                                                                                                                                                                                                                         * Returns a local storage object for a specific local namespace.
                                                                                                                                                                                                                                                                         *
                                                                                                                                                                                                                                                                         * @param {String} namespace
                                                                                                                                                                                                                                                                         *    the namespace to prepend to keys
                                                                                                                                                                                                                                                                         *
                                                                                                                                                                                                                                                                         * @return {StorageApi}
                                                                                                                                                                                                                                                                         *    the local storage object
                                                                                                                                                                                                                                                                         */getLocalStorage: function getLocalStorage(namespace) {assert(namespace).hasType(String).isNotNull();return createStorage(localBackend, prefix + namespace);}, /////////////////////////////////////////////////////////////////////////////////////////////////////
         /**
          * Returns a session storage object for a specific local namespace.
          *
          * @param {String} namespace
          *    the namespace to prepend to keys
          *
          * @return {StorageApi}
          *    the session storage object
          */getSessionStorage: function getSessionStorage(namespace) {assert(namespace).hasType(String).isNotNull();return createStorage(sessionBackend, prefix + namespace);}, /////////////////////////////////////////////////////////////////////////////////////////////////////
         /**
          * Returns the local storage object for application scoped keys. This is equivalent to
          * `storage.getLocalStorage( 'app' )`.
          *
          * @return {StorageApi}
          *    the application local storage object
          */getApplicationLocalStorage: function getApplicationLocalStorage() {return createStorage(localBackend, prefix + 'app');}, /////////////////////////////////////////////////////////////////////////////////////////////////////
         /**
          * Returns the session storage object for application scoped keys. This is equivalent to
          * `storage.getSessionStorage( 'app' )`.
          *
          * @return {StorageApi}
          *    the application session storage object
          */getApplicationSessionStorage: function getApplicationSessionStorage() {return createStorage(sessionBackend, prefix + 'app');} };}return { setters: [function (_assert) {assert = _assert['default'];}, function (_configuration) {configuration = _configuration;}], execute: function () {SESSION = 'sessionStorage';LOCAL = 'localStorage';instance = create();_export('default', instance);} };});

System.register('lib/utilities/timer.js', ['./object', './storage', '../logging/log'], function (_export) {/**
                                                                                                            * Copyright 2015 aixigo AG
                                                                                                            * Released under the MIT license.
                                                                                                            * http://laxarjs.org/license
                                                                                                            */'use strict';var object, storage, log, 




   idCounter, 
   store;






























































































































   ///////////////////////////////////////////////////////////////////////////////////////////////////////////
   _export('started', started);_export('resumedOrStarted', resumedOrStarted);function Timer(optionalOptions) {this.options_ = object.options(optionalOptions, { label: 'timer' + idCounter++, persistenceKey: null });this.startTime_ = null;this.stopTime_ = null;this.splitTimes_ = [];} ///////////////////////////////////////////////////////////////////////////////////////////////////////////
   ///////////////////////////////////////////////////////////////////////////////////////////////////////////
   function now() {// cannot use window.performance, because timings need to be valid across pages:
      return new Date().getTime();} ///////////////////////////////////////////////////////////////////////////////////////////////////////////
   function saveIfPersistent(timer) {if (timer.options_.persistenceKey) {store.setItem(timer.options_.persistenceKey, { options: timer.options_, startTime: timer.startTime_, stopTime: timer.stopTime_, splitTimes: timer.splitTimes_ });}} ///////////////////////////////////////////////////////////////////////////////////////////////////////////
   function restoreIfPersistent(timer) {if (timer.options_.persistenceKey) {var data = store.getItem(timer.options_.persistenceKey);if (data) {timer.options_ = data.options;timer.startTime_ = data.startTime;timer.stopTime_ = data.stopTime;timer.splitTimes_ = data.splitTimes;return true;}}return false;} ///////////////////////////////////////////////////////////////////////////////////////////////////////////
   function removeIfPersistent(timer) {if (timer.options_.persistenceKey) {store.removeItem(timer.options_.persistenceKey);}} ///////////////////////////////////////////////////////////////////////////////////////////////////////////
   function started(optionalOptions) {var timer = new Timer(optionalOptions);timer.start();return timer;}function resumedOrStarted(optionalOptions) {var timer = new Timer(optionalOptions);if (!restoreIfPersistent(timer)) {timer.start();}return timer;}return { setters: [function (_object) {object = _object;}, function (_storage) {storage = _storage['default'];}, function (_loggingLog) {log = _loggingLog['default'];}], execute: function () {idCounter = 0;store = storage.getSessionStorage('timer');Timer.prototype.getData = function () {return { label: this.options_.label, startTime: this.startTime_, stopTime: this.stopTime_, splitTimes: object.deepClone(this.splitTimes_) };}; ///////////////////////////////////////////////////////////////////////////////////////////////////////////
         Timer.prototype.start = function () {this.startTime_ = now();saveIfPersistent(this);}; ///////////////////////////////////////////////////////////////////////////////////////////////////////////
         Timer.prototype.splitTime = function (optionalLabel) {this.splitTimes_.push({ time: now(), label: optionalLabel || 'split' + this.splitTimes_.length });saveIfPersistent(this);}; ///////////////////////////////////////////////////////////////////////////////////////////////////////////
         Timer.prototype.stop = function () {this.stopTime_ = now();removeIfPersistent(this);}; ///////////////////////////////////////////////////////////////////////////////////////////////////////////
         Timer.prototype.stopAndLog = function (optionalLabel) {this.stop();var startTime = this.startTime_;var endTime = now();var label = optionalLabel || 'Timer Stopped';this.splitTimes_.push({ label: label, time: endTime });var message = [];message.push('Timer "', this.options_.label, '": ');message.push('start at ', new Date(startTime).toISOString(), ' (client), ');message.push(label, ' after ', (endTime - startTime).toFixed(0), 'ms ');message.push('(checkpoints: ');var intervals = [];this.splitTimes_.reduce(function (from, data) {intervals.push('"' + data.label + '"=' + (data.time - from).toFixed(0) + 'ms');return data.time;}, startTime);message.push(intervals.join(', '), ')');log.info(message.join(''));};} };});

System.register("static/schemas/flow.js", [], function (_export) {/**
                                                                   * Copyright 2016 aixigo AG
                                                                   * Released under the MIT license.
                                                                   * http://laxarjs.org/license
                                                                   */"use strict";return { setters: [], execute: function () {_export("default", 
         { 
            "$schema": "http://json-schema.org/draft-04/schema#", 
            "type": "object", 
            "required": ["places"], 
            "properties": { 

               "places": { 
                  "type": "object", 
                  "description": "The places for this flow.", 
                  "patternProperties": { 
                     "[a-z][a-zA-Z0-9_]*": { 
                        "type": "object", 
                        "properties": { 

                           "redirectTo": { 
                              "type": "string", 
                              "description": "The place to redirect to when hitting this place." }, 

                           "page": { 
                              "type": "string", 
                              "description": "The page to render for this place." }, 

                           "targets": { 
                              "type": "object", 
                              "patternProperties": { 
                                 "[a-z][a-zA-Z0-9_]*": { 
                                    "type": "string" } }, 


                              "description": "A map of symbolic targets to places reachable from this place." }, 

                           "entryPoints": { 
                              "type": "object", 
                              "patternProperties": { 
                                 "[a-z][a-zA-Z0-9_]*": { 
                                    "type": "string" } }, 


                              "description": "Entry points defined by this place." }, 

                           "exitPoint": { 
                              "type": "string", 
                              "description": "The exit point to invoke when reaching this place." } }, 



                        "additionalProperties": false } }, 


                  "additionalProperties": false } }, 



            "additionalProperties": false });} };});

System.register('lib/runtime/flow.js', ['angular', 'angular-route', '../logging/log', '../json/validator', '../utilities/object', '../utilities/timer', '../utilities/path', '../loaders/paths', '../../static/schemas/flow'], function (_export) {/**
                                                                                                                                                                                                                                                    * Copyright 2015 aixigo AG
                                                                                                                                                                                                                                                    * Released under the MIT license.
                                                                                                                                                                                                                                                    * http://laxarjs.org/license
                                                                                                                                                                                                                                                    */
   /**
    * The *flow* module is responsible for the handling of all tasks regarding navigation and routing and as such
    * is part of the LaxarJS core. It is your communication partner on the other end of the event bus for
    * `navigateRequest`, `willNavigate` and `didNavigate` events. For application developers it additionally
    * provides the `axFlowService`, which can be used for some flow specific tasks.
    *
    * @module flow
    */'use strict';


   // TODO: should be changed to "import * as log" as soon as default export in log is removed
   var ng, ngRoute, log, jsonValidator, object, timer, path, paths, flowSchema, 







   _module, 



   $routeProvider_, 







   fileResourceProvider_, 
   exitPoints_, 
   entryPoint_, 


















   SESSION_KEY_TIMER, 
   TARGET_SELF, 

   activeTarget_, 
   activePlace_, 
   activeParameters_, 

   places_, 
   previousNavigateRequestSubscription_, 
   navigationInProgress_, 
   navigationTimer_, 

   eventOptions, 
   subscriberOptions, 









































































































































































































































































































































   ROUTE_PARAMS_MATCHER, 

























































   name; ///////////////////////////////////////////////////////////////////////////////////////////////////////////
   function decodeExpectedPlaceParameters(parameters, place) {var result = {};ng.forEach(place.expectedParameters, function (parameterName) {result[parameterName] = decodePlaceParameter(parameters[parameterName]);});return result;} ///////////////////////////////////////////////////////////////////////////////////////////////////////////
   function placeNameForNavigationTarget(targetOrPlaceName, activePlace) {var placeName = object.path(activePlace, 'targets.' + targetOrPlaceName, targetOrPlaceName);if (placeName in places_) {return placeName;}log.error('Unknown target or place "[0]".', targetOrPlaceName);} ///////////////////////////////////////////////////////////////////////////////////////////////////////////
   function encodePlaceParameter(value) {if (value == null) {return '_';}return typeof value === 'string' ? value.replace(/\//g, '%2F') : value;} ///////////////////////////////////////////////////////////////////////////////////////////////////////////
   function decodePlaceParameter(value) {if (value == null || value === '' || value === '_') {return null;}return typeof value === 'string' ? value.replace(/%2F/g, '/') : value;} ///////////////////////////////////////////////////////////////////////////////////////////////////////////
   //
   // Flow Loading tasks
   //
   ///////////////////////////////////////////////////////////////////////////////////////////////////////////
   function loadFlow(flowFile) {return fetchPlaces(flowFile).then(function (places) {places_ = processPlaceParameters(places);object.forEach(places_, function (place, routeName) {assembleRoute(routeName, place);});$routeProvider_.otherwise({ redirectTo: '/entry' });});} ///////////////////////////////////////////////////////////////////////////////////////////////////////////
   function assembleRoute(routeName, _place) {if (_place.redirectTo) {$routeProvider_.when('/' + routeName, { redirectTo: _place.redirectTo });return;}if (_place.entryPoints) {$routeProvider_.when('/' + routeName, { redirectTo: routeByEntryPoint(_place.entryPoints) });return;}if (!_place.page && !_place.exitPoint) {log.warn('flow: invalid empty place: [0]', _place.id);return;}$routeProvider_.when('/' + routeName, { template: '<!---->', controller: 'AxFlowController', resolve: { place: function place() {return _place;} } });} ///////////////////////////////////////////////////////////////////////////////////////////////////////////
   function routeByEntryPoint(possibleEntryPoints) {var entryPoint = entryPoint_ || { target: 'default', parameters: {} };var placeName = possibleEntryPoints[entryPoint.target];if (placeName) {var targetPlace = places_[placeName];var uri = placeName;var parameters = entryPoint.parameters || {};object.forEach(targetPlace.expectedParameters, function (parameterName) {uri += '/' + encodePlaceParameter(parameters[parameterName]);});return uri;}} ///////////////////////////////////////////////////////////////////////////////////////////////////////////
   function processPlaceParameters(places) {var processedRoutes = {};object.forEach(places, function (place, placeName) {place.expectedParameters = [];place.id = placeName;if (!place.targets) {place.targets = {};}if (!place.targets[TARGET_SELF]) {place.targets[TARGET_SELF] = placeName.split(/\/:/)[0];}var matches;while (matches = ROUTE_PARAMS_MATCHER.exec(placeName)) {var routeNameWithoutParams = placeName.substr(0, matches.index);place.expectedParameters.push(matches[1]);processedRoutes[routeNameWithoutParams] = place;}processedRoutes[placeName] = place;});return processedRoutes;} ///////////////////////////////////////////////////////////////////////////////////////////////////////////
   function fetchPlaces(flowFile) {return fileResourceProvider_.provide(flowFile).then(function (flow) {validateFlowJson(flow);return flow.places;}, function (err) {throw new Error('Failed to load "' + flowFile + '". Cause: ' + err);});} ///////////////////////////////////////////////////////////////////////////////////////////////////////////
   function validateFlowJson(flowJson) {var result = jsonValidator.create(flowSchema).validate(flowJson);if (result.errors.length) {result.errors.forEach(function (error) {log.error('[0]', error.message);});throw new Error('Illegal flow.json format');}} ///////////////////////////////////////////////////////////////////////////////////////////////////////////
   return { setters: [function (_angular) {ng = _angular['default'];}, function (_angularRoute) {ngRoute = _angularRoute;}, function (_loggingLog) {log = _loggingLog['default'];}, function (_jsonValidator) {jsonValidator = _jsonValidator;}, function (_utilitiesObject) {object = _utilitiesObject;}, function (_utilitiesTimer) {timer = _utilitiesTimer;}, function (_utilitiesPath) {path = _utilitiesPath;}, function (_loadersPaths) {paths = _loadersPaths;}, function (_staticSchemasFlow) {flowSchema = _staticSchemasFlow['default'];}], execute: function () {_module = ng.module('axFlow', ['ngRoute']); ///////////////////////////////////////////////////////////////////////////////////////////////////////////
         _module.config(['$routeProvider', function ($routeProvider) {$routeProvider_ = $routeProvider;}]); ///////////////////////////////////////////////////////////////////////////////////////////////////////////
         _module.run(['$route', 'axConfiguration', 'axFileResourceProvider', function ($route, configuration, fileResourceProvider) {fileResourceProvider_ = fileResourceProvider;entryPoint_ = configuration.get('flow.entryPoint');exitPoints_ = configuration.get('flow.exitPoints'); // idea for lazy loading routes using $routeProvider and $route.reload() found here:
            // https://groups.google.com/d/msg/angular/mrcy_2BZavQ/Mqte8AvEh0QJ
            loadFlow(path.normalize(paths.FLOW_JSON)).then(function () {return $route.reload();});}]); ///////////////////////////////////////////////////////////////////////////////////////////////////////////
         SESSION_KEY_TIMER = 'navigationTimer';TARGET_SELF = '_self';activeTarget_ = TARGET_SELF;activePlace_ = null;activeParameters_ = {};navigationInProgress_ = false;eventOptions = { sender: 'AxFlowController' };subscriberOptions = { subscriber: 'AxFlowController' }; ///////////////////////////////////////////////////////////////////////////////////////////////////////////
         _module.controller('AxFlowController', ['$window', '$location', '$routeParams', 'place', 'axGlobalEventBus', 'axFlowService', 'axPageService', function FlowController($window, $location, $routeParams, place, eventBus, flowService, pageService) {// The flow controller is instantiated on route change by AngularJS. It then announces the start of
            // navigation ("willNavigate") and initiates loading of the new page. As soon as the new page is
            // loaded, the "didNavigate" event finishes the navigation logic. The flow controller then starts to
            // listen for subsequent navigateRequests.
            if (previousNavigateRequestSubscription_) {eventBus.unsubscribe(previousNavigateRequestSubscription_);previousNavigateRequestSubscription_ = null;}var previousPlace = activePlace_;activePlace_ = place;activeParameters_ = decodeExpectedPlaceParameters($routeParams, place);if (typeof place.exitPoint === 'string') {var exit = place.exitPoint;if (exitPoints_ && typeof exitPoints_[exit] === 'function') {exitPoints_[exit](activeParameters_);return;}throw new Error('Exitpoint "' + exit + '" does not exist.');}navigationInProgress_ = true;var navigateEvent = { target: activeTarget_ };var didNavigateEvent = object.options({ data: {}, place: place.id }, navigateEvent);eventBus.publish('willNavigate.' + activeTarget_, navigateEvent, eventOptions).then(function () {didNavigateEvent.data = activeParameters_;if (place === previousPlace) {return finishNavigation(activeTarget_, didNavigateEvent);}return pageService.controller().tearDownPage().then(function () {navigationTimer_ = timer.resumedOrStarted({ label: ['loadTimer (', place.target ? place.target._self : place.id, ')'].join(''), persistenceKey: SESSION_KEY_TIMER });return pageService.controller().setupPage(place.page);}).then(function () {return finishNavigation(activeTarget_, didNavigateEvent);}).then(function () {navigationTimer_.stopAndLog('didNavigate');});}).then(null, function (error) {log.error(error);}); /////////////////////////////////////////////////////////////////////////////////////////////////////
            function handleNavigateRequest(event, meta) {if (navigationInProgress_) {// make sure that at most one navigate request be handled at the same time
                  return;}navigationInProgress_ = true;activeTarget_ = event.target;var placeName = placeNameForNavigationTarget(activeTarget_, place);var newPlace = places_[placeName];navigationTimer_ = timer.started({ label: ['navigation (', place ? place.targets._self : '', ' -> ', newPlace.targets._self, ')'].join(''), persistenceKey: SESSION_KEY_TIMER });var newPath = flowService.constructPath(event.target, event.data);if (newPath !== $location.path()) {// this will instantiate another flow controller
                  $location.path(newPath);meta.unsubscribe();} else {// nothing to do:
                  navigationInProgress_ = false;}} /////////////////////////////////////////////////////////////////////////////////////////////////////
            function finishNavigation(currentTarget_, didNavigateEvent) {eventBus.subscribe('navigateRequest', handleNavigateRequest, subscriberOptions);log.setTag('PLCE', place.id);if (previousNavigateRequestSubscription_) {eventBus.unsubscribe(previousNavigateRequestSubscription_);}previousNavigateRequestSubscription_ = handleNavigateRequest;navigationInProgress_ = false;return eventBus.publish('didNavigate.' + currentTarget_, didNavigateEvent, eventOptions);}}]); ///////////////////////////////////////////////////////////////////////////////////////////////////////////
         /**
          * A service providing some flow specific tasks that may be useful from within widgets.
          *
          * @name axFlowService
          * @injection
          */_module.factory('axFlowService', ['$location', function ($location) {var flowService = { /**
                                                                                                      * Constructs a path, that is compatible to the expected arguments of `$location.path()` from
                                                                                                      * AngularJS. If a target is given as first argument, this is resolved using the currently active
                                                                                                      * place.
                                                                                                      *
                                                                                                      * @param {String} targetOrPlace
                                                                                                      *    the target or place id to construct the url for
                                                                                                      * @param {Object} [optionalParameters]
                                                                                                      *    optional map of place parameters. Missing parameters are taken from the parameters that were
                                                                                                      *    passed to the currently active place
                                                                                                      *
                                                                                                      * @return {string}
                                                                                                      *    the generated path
                                                                                                      *
                                                                                                      * @memberOf axFlowService
                                                                                                      */constructPath: function constructPath(targetOrPlace, optionalParameters) {var newParameters = object.options(optionalParameters, activeParameters_ || {});var placeName = placeNameForNavigationTarget(targetOrPlace, activePlace_);var place = places_[placeName];var location = '/' + placeName;object.forEach(place.expectedParameters, function (parameterName) {location += '/' + encodePlaceParameter(newParameters[parameterName]);});return location;}, /////////////////////////////////////////////////////////////////////////////////////////////////////
               /**
                * Constructs a path and prepends a `#` to make it directly usable as relative link within an
                * application. If a target is given as first argument, this is resolved using the currently active
                * place.
                *
                * @param {String} targetOrPlace
                *    the target or place id to construct the url for
                * @param {Object} [optionalParameters]
                *    optional map of place parameters. Missing parameters are taken from the parameters that were
                *    passed to the currently active place
                *
                * @return {string}
                *    the generated anchor
                *
                * @memberOf axFlowService
                */constructAnchor: function constructAnchor(targetOrPlace, optionalParameters) {return '#' + flowService.constructPath(targetOrPlace, optionalParameters);}, /////////////////////////////////////////////////////////////////////////////////////////////////////
               /**
                * Constructs an absolute url to the given target or place using the given parameters application. If
                * a target is given as first argument, this is resolved using the currently active place.
                *
                * @param {String} targetOrPlace
                *    the target or place id to construct the url for
                * @param {Object} [optionalParameters]
                *    optional map of place parameters. Missing parameters are taken from the parameters that were
                *    passed to the currently active place
                *
                * @return {string}
                *    the generated url
                *
                * @memberOf axFlowService
                */constructAbsoluteUrl: function constructAbsoluteUrl(targetOrPlace, optionalParameters) {var absUrl = $location.absUrl().split('#')[0];return absUrl + flowService.constructAnchor(targetOrPlace, optionalParameters);}, /////////////////////////////////////////////////////////////////////////////////////////////////////
               /**
                * Returns a copy of the currently active place.
                *
                * @return {Object}
                *    the currently active place
                *
                * @memberOf axFlowService
                */place: function place() {return object.deepClone(activePlace_);} }; ////////////////////////////////////////////////////////////////////////////////////////////////////////
            return flowService;}]);ROUTE_PARAMS_MATCHER = /\/:([^\/]+)/ig;name = _module.name;_export('name', name);_export('default', _module);} };});

System.register('lib/runtime/area_helper.js', ['angular'], function (_export) {/**
                                                                                * Copyright 2015 aixigo AG
                                                                                * Released under the MIT license.
                                                                                * http://laxarjs.org/license
                                                                                */


   /**
    * The area helper manages widget areas, their DOM representation and their nesting structure.
    *
    * It tracks widget area visibility in order to compile widgets and to attach them to their areas when
    * these become visible. It also tells the visibility service when change handlers need to be run. It does
    * not interact with the event bus directly, but is consulted by the visibility manager to determine area
    * nesting for visibility events.
    */'use strict';var ng;_export('create', create);
   function create(q, page, visibilityService) {

      var exports = { 
         setVisibility: setVisibility, 
         areasInArea: areasInArea, 
         areasInWidget: areasInWidget, 
         register: register, 
         exists: exists, 
         attachWidgets: attachWidgets };


      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      // forget about any visibility handlers/state from a previous page
      visibilityService._reset();

      // all initially visible widgets should be attached together, to reduce jitter and unnecessary DOM ops
      var freeToAttach = false;

      // keep the dom element for each area, to attach widgets to
      var areaToElement = {};

      // track widget adapters waiting for their area to become available so that they may attach to its DOM
      var areaToWaitingAdapters = {};

      // the area name for each widget
      var widgetIdToArea = {};
      ng.forEach(page.areas, function (widgets, areaName) {
         widgets.forEach(function (widget) {
            widgetIdToArea[widget.id] = areaName;});});



      // for each widget with children, and each widget area with nested areas, store a list of child names
      var areasInAreaMap = {};
      var areasInWidgetMap = {};
      ng.forEach(page.areas, function (widgetEntries, areaName) {
         var containerName = '';
         if (areaName.indexOf('.') !== -1) {
            var widgetId = areaName.split('.')[0];
            areasInWidgetMap[widgetId] = areasInWidgetMap[widgetId] || [];
            areasInWidgetMap[widgetId].push(areaName);
            containerName = widgetIdToArea[widgetId];}

         areasInAreaMap[containerName] = areasInAreaMap[containerName] || [];
         areasInAreaMap[containerName].push(areaName);});


      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      function setVisibility(areaName, visible) {
         if (visible && freeToAttach) {
            attachWaitingAdapters(areaName);}

         visibilityService._updateState(areaName, visible);}


      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      function areasInArea(containerName) {
         return areasInAreaMap[containerName];}


      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      function areasInWidget(widgetId) {
         return areasInWidgetMap[widgetId];}


      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      /**
       * Register a widget area
       *
       * @param {String} name
       *    the area name as used in the page definition
       * @param {HTMLElement} element
       *    an HTML element representing the widget area
       */
      function register(name, element) {
         if (name in areaToElement) {
            throw new Error('The area "' + name + '" is defined twice in the current layout.');}


         areaToElement[name] = element;
         if (freeToAttach && visibilityService.isVisible(name)) {
            attachWaitingAdapters(name);}

         return function () {
            delete areaToElement[name];};}



      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      function exists(name) {
         return name in areaToElement;}


      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      function attachWidgets(widgetAdapters) {
         freeToAttach = true;
         widgetAdapters.forEach(function (adapterRef) {
            var areaName = widgetIdToArea[adapterRef.id];
            areaToWaitingAdapters[areaName] = areaToWaitingAdapters[areaName] || [];
            areaToWaitingAdapters[areaName].push(adapterRef);});

         ng.forEach(page.areas, function (widgets, areaName) {
            if (visibilityService.isVisible(areaName)) {
               attachWaitingAdapters(areaName);}});}




      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      /** @private */
      function attachWaitingAdapters(areaName) {
         var waitingAdapters = areaToWaitingAdapters[areaName];
         if (!waitingAdapters || !waitingAdapters.length) {return;}
         var element = areaToElement[areaName];
         if (!element) {return;}

         q.all(waitingAdapters.map(function (adapterRef) {
            // Make sure that all assets are available before proceeding, so that DOM update happens en bloc.
            return adapterRef.templatePromise;})).

         then(function (htmlTemplates) {
            // prepare first/last bootstrap classes for appending widgets
            var currentLast = element.lastChild;
            if (currentLast) {ng.element(currentLast).removeClass('last');}
            var currentFirst = element.firstChild;

            waitingAdapters.forEach(function (adapterRef, i) {
               adapterRef.adapter.domAttachTo(element, htmlTemplates[i]);});


            // fix first/last bootstrap classes as needed
            if (!currentFirst) {
               var first = element.firstChild;
               if (first) {first.className += ' first';}}

            var last = element.lastChild;
            if (last) {last.className += ' last';}});


         delete areaToWaitingAdapters[areaName];}


      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      return exports;}return { setters: [function (_angular) {ng = _angular['default'];}], execute: function () {} };});

System.register('lib/runtime/locale_event_manager.js', ['npm:babel-runtime@5.8.34/core-js/object/keys', '../utilities/object'], function (_export) {var _Object$keys, deepClone, 






   senderOptions, 
   subscriberOptions;

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   /**
    * The LocaleManager initializes the locale(s) and implements changes to them.
    *
    * Before publishing the state of all configured locales, it listens to change requests, allowing
    * widgets and activities (such as a LocaleSwitcherWidget) to influence the state of locales before
    * the navigation is complete.
    */
   function create($q, eventBus, configuration) {

      var exports = { 
         initialize: initialize, 
         subscribe: subscribe, 
         unsubscribe: unsubscribe };


      var configLocales_ = configuration.get('i18n.locales', { 'default': 'en' });
      var i18n;
      var initialized;

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      function handleRequest(event) {
         i18n[event.locale] = event.languageTag;
         if (initialized) {
            publish(event.locale);}}



      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      function publish(locale) {
         var event = { locale: locale, languageTag: i18n[locale] };
         return eventBus.publish('didChangeLocale.' + locale, event, senderOptions);}


      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      function initialize() {
         initialized = true;
         return $q.all(_Object$keys(configLocales_).map(publish));}


      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      function unsubscribe() {
         eventBus.unsubscribe(handleRequest);}


      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      function subscribe() {
         i18n = deepClone(configLocales_);
         initialized = false;

         eventBus.subscribe('changeLocaleRequest', handleRequest, subscriberOptions);}


      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      return exports;}return { setters: [function (_babelRuntimeCoreJsObjectKeys) {_Object$keys = _babelRuntimeCoreJsObjectKeys['default'];}, function (_utilitiesObject) {deepClone = _utilitiesObject.deepClone;}], execute: function () {/**
                                                                                                                                                                                                                                             * Copyright 2015 aixigo AG
                                                                                                                                                                                                                                             * Released under the MIT license.
                                                                                                                                                                                                                                             * http://laxarjs.org/license
                                                                                                                                                                                                                                             */'use strict';_export('create', create);senderOptions = { sender: 'AxPageController' };subscriberOptions = { subscriber: 'AxPageController' };} };});

System.register('lib/runtime/visibility_event_manager.js', [], function (_export) {/**
                                                                                    * Copyright 2015 aixigo AG
                                                                                    * Released under the MIT license.
                                                                                    * http://laxarjs.org/license
                                                                                    */'use strict';var 
   senderOptions, 
   subscriberOptions;_export('create', create);

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   /**
    * The visibility event manager initializes and coordinates events for widget area visibility.
    *
    * It subscribes to all visibility changes and propagates them to nested widget areas
    * (if applicable). It is not concerned with the resulting DOM-visibility of individual controls:
    * the `axVisibilityService` takes care of that.
    *
    * @return {{initialize: Function}}
    *    a function to trigger initialization of the manager and initial widget visibility
    */
   function create($q, eventBus) {

      var exports = { 
         initialize: initialize, 
         setAreaHelper: setAreaHelper, 
         unsubscribe: unsubscribe };


      var areaHelper_;
      var ROOT = '';

      function setAreaHelper(areaHelper) {
         areaHelper_ = areaHelper;}


      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      function initialize() {
         // broadcast visibility changes in individual widgets to their nested areas
         eventBus.subscribe('changeWidgetVisibilityRequest', handleChangeWidgetRequest, subscriberOptions);

         // broadcast visibility changes in widget areas to their nested areas
         eventBus.subscribe('changeAreaVisibilityRequest', handleChangeAreaRequest, subscriberOptions);

         return implementAreaChange(ROOT, true);}


      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      function handleChangeWidgetRequest(event) {
         var affectedAreas = areaHelper_.areasInWidget(event.widget);
         var will = ['willChangeWidgetVisibility', event.widget, event.visible].join('.');
         var did = ['didChangeWidgetVisibility', event.widget, event.visible].join('.');

         eventBus.publish(will, event, senderOptions);

         $q.all((affectedAreas || []).map(event.visible ? show : hide)).
         then(function () {
            eventBus.publish(did, event, senderOptions);});}



      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      function handleChangeAreaRequest(event) {
         return initiateAreaChange(event.area, event.visible);}


      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      function show(area) {
         return requestAreaChange(area, true);}


      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      function hide(area) {
         return requestAreaChange(area, false);}


      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      /**
       * First, publish a `changeAreaVisibilityRequest` to ask if some widget would like to manage the
       * given area's visibility.
       * If no widget responds, self-issue a will/did-response to notify interested widgets in the area
       * of their new visibility status.
       * In either case, manage the propagation to nested areas and inform the area helper so that it
       * may compile and attach the templates of any newly visible widgets.
       *
       * @param {String} area
       *    the area whose visibility to update
       * @param {Boolean} visible
       *    the new visibility state of the given area, to the best knowledge of the client
       */
      function requestAreaChange(area, visible) {
         var request = ['changeAreaVisibilityRequest', area].join('.');
         var event = { area: area, visible: visible };
         return eventBus.publishAndGatherReplies(request, event, senderOptions).
         then(function (responses) {
            if (responses.length === 0) {
               // no one took responsibility, so the event manager determines visibility by area nesting
               return initiateAreaChange(area, visible);}

            // assume the first 'did'-response to be authoritative:
            var response = responses[0];
            return implementAreaChange(area, response.event.visible);});}



      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      /**
       * Set the new visibility state for the given area, then issue requests for the child areas.
       * Inform the area helper so that it may compile and attach the templates of any newly visible
       * widgets.
       */
      function initiateAreaChange(area, visible) {
         var will = ['willChangeAreaVisibility', area, visible].join('.');
         var event = { area: area, visible: visible };
         return eventBus.publish(will, event, senderOptions).
         then(function () {
            return implementAreaChange(area, visible);}).

         then(function () {
            var did = ['didChangeAreaVisibility', area, visible].join('.');
            return eventBus.publish(did, event, senderOptions);});}



      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      function implementAreaChange(ofArea, areaVisible) {
         areaHelper_.setVisibility(ofArea, areaVisible);
         var children = areaHelper_.areasInArea(ofArea);
         if (!children) {
            return $q.when();}


         return $q.all(children.map(areaVisible ? show : hide));}


      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      function unsubscribe() {
         eventBus.unsubscribe(handleChangeAreaRequest);
         eventBus.unsubscribe(handleChangeWidgetRequest);}


      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      return exports;}return { setters: [], execute: function () {senderOptions = { sender: 'AxPageController', deliverToSender: false };subscriberOptions = { subscriber: 'AxPageController' };} };});

System.register('lib/runtime/page.js', ['../utilities/assert', 'angular', '../directives/layout/layout', '../loaders/page_loader', '../loaders/widget_loader', '../loaders/paths', './layout_widget_adapter', './flow', './area_helper', './locale_event_manager', './visibility_event_manager'], function (_export) {/**
                                                                                                                                                                                                                                                                                                                       * Copyright 2015 aixigo AG
                                                                                                                                                                                                                                                                                                                       * Released under the MIT license.
                                                                                                                                                                                                                                                                                                                       * http://laxarjs.org/license
                                                                                                                                                                                                                                                                                                                       */'use strict';var codeIsUnreachable, ng, layoutModule, pageLoader, widgetLoader, paths, layoutWidgetAdapter, flowModule, createAreaHelper, createLocaleEventManager, createVisibilityEventManager, 












   _module, 


   WIDGET_ATTACH_DELAY_MS, 



























































































































































































































































































   name;return { setters: [function (_utilitiesAssert) {codeIsUnreachable = _utilitiesAssert.codeIsUnreachable;}, function (_angular) {ng = _angular['default'];}, function (_directivesLayoutLayout) {layoutModule = _directivesLayoutLayout;}, function (_loadersPage_loader) {pageLoader = _loadersPage_loader;}, function (_loadersWidget_loader) {widgetLoader = _loadersWidget_loader;}, function (_loadersPaths) {paths = _loadersPaths;}, function (_layout_widget_adapter) {layoutWidgetAdapter = _layout_widget_adapter;}, function (_flow) {flowModule = _flow;}, function (_area_helper) {createAreaHelper = _area_helper.create;}, function (_locale_event_manager) {createLocaleEventManager = _locale_event_manager.create;}, function (_visibility_event_manager) {createVisibilityEventManager = _visibility_event_manager.create;}], execute: function () {_module = ng.module('axPage', [layoutModule.name, layoutWidgetAdapter.name, flowModule.name]); /** Delay between sending didLifeCycle and attaching widget templates. */WIDGET_ATTACH_DELAY_MS = 5; ///////////////////////////////////////////////////////////////////////////////////////////////////////////
         /**
          * Mediates between the AxFlowController which has no ties to the DOM and the stateful AxPageController
          */_module.service('axPageService', [function () {var pageController;return { controller: function controller() {return pageController;}, registerPageController: function registerPageController(controller) {pageController = controller;return function () {pageController = null;};}, controllerForScope: function controllerForScope(scope) {return pageController;} };}]); ///////////////////////////////////////////////////////////////////////////////////////////////////////////
         /**
          * Manages widget adapters and their DOM for the current page
          */(function () {var pageControllerDependencies = ['$scope', '$q', '$timeout', 'axPageService'];var axServiceDependencies = ['axConfiguration', 'axControls', 'axCssLoader', 'axFileResourceProvider', 'axFlowService', 'axGlobalEventBus', 'axHeartbeat', 'axI18n', 'axLayoutLoader', 'axThemeManager', 'axTimestamp', 'axVisibilityService'];var createPageControllerInjected = pageControllerDependencies.concat(axServiceDependencies).concat(function ($scope, $q, $timeout, pageService) {var axServices = {};var injections = [].slice.call(arguments);axServiceDependencies.forEach(function (name, index) {axServices[name] = injections[pageControllerDependencies.length + index];});var visibilityService = axServices.axVisibilityService;var configuration = axServices.axConfiguration;var layoutLoader = axServices.axLayoutLoader;var eventBus = axServices.axGlobalEventBus;var fileResourceProvider = axServices.axFileResourceProvider;var themeManager = axServices.axThemeManager;var self = this;var pageLoader_ = pageLoader.create($q, null, paths.PAGES, fileResourceProvider);var areaHelper_;var widgetAdapters_ = [];var viewChangeApplyFunctions_ = [];var theme = themeManager.getTheme();var localeManager = createLocaleEventManager($q, eventBus, configuration);var visibilityManager = createVisibilityEventManager($q, eventBus);var lifecycleEvent = { lifecycleId: 'default' };var senderOptions = { sender: 'AxPageController' };var renderLayout = function renderLayout(layoutInfo) {codeIsUnreachable('No renderer for page layout ' + layoutInfo.className);};var cleanup = pageService.registerPageController(this);$scope.$on('$destroy', cleanup); /////////////////////////////////////////////////////////////////////////////////////////////////////
               function widgetsForPage(page) {var widgets = [];ng.forEach(page.areas, function (area, areaName) {area.forEach(function (widget) {widget.area = areaName;widgets.push(widget);});});return widgets;} /////////////////////////////////////////////////////////////////////////////////////////////////////
               function beginLifecycle() {return eventBus.publishAndGatherReplies('beginLifecycleRequest.default', lifecycleEvent, senderOptions);} /////////////////////////////////////////////////////////////////////////////////////////////////////
               function publishTheme() {return eventBus.publish('didChangeTheme.' + theme, { theme: theme }, senderOptions);} /////////////////////////////////////////////////////////////////////////////////////////////////////
               /**
                * Instantiate all widget controllers on this page, and then load their UI.
                *
                * @return {Promise}
                *    A promise that is resolved when all controllers have been instantiated, and when the initial
                *    events have been sent.
                */function setupPage(pageName) {var widgetLoader_ = widgetLoader.create($q, axServices);var layoutDeferred = $q.defer();var pagePromise = pageLoader_.loadPage(pageName).then(function (page) {areaHelper_ = createAreaHelper($q, page, visibilityService);visibilityManager.setAreaHelper(areaHelper_);self.areas = areaHelper_;layoutLoader.load(page.layout).then(layoutDeferred.resolve);localeManager.subscribe(); // instantiate controllers
                     var widgets = widgetsForPage(page);return $q.all(widgets.map(function (widget) {if ('layout' in widget) {return createLayoutWidgetAdapter(widget);}return widgetLoader_.load(widget);}));}).then(function (widgetAdapters) {widgetAdapters.forEach(function (adapter) {if (typeof adapter.applyViewChanges === 'function' && viewChangeApplyFunctions_.indexOf(adapter.applyViewChanges) === -1) {viewChangeApplyFunctions_.push(adapter.applyViewChanges);}});widgetAdapters_ = widgetAdapters;}).then(localeManager.initialize).then(publishTheme).then(beginLifecycle).then(visibilityManager.initialize);var layoutReady = layoutDeferred.promise.then(function (result) {// function wrapper is necessary here to dereference `renderlayout` _after_ the layout is ready
                     renderLayout(result);}); // Give the widgets (a little) time to settle on the event bus before $digesting and painting:
                  var widgetsInitialized = pagePromise.then(function () {return $timeout(function () {}, WIDGET_ATTACH_DELAY_MS, false);});return $q.all([layoutReady, widgetsInitialized]).then(function () {areaHelper_.attachWidgets(widgetAdapters_);});} /////////////////////////////////////////////////////////////////////////////////////////////////////
               function tearDownPage() {visibilityManager.unsubscribe();localeManager.unsubscribe();return eventBus.publishAndGatherReplies('endLifecycleRequest.default', lifecycleEvent, senderOptions).then(function () {widgetAdapters_.forEach(function (adapterRef) {adapterRef.destroy();});widgetAdapters_ = [];viewChangeApplyFunctions_ = [];});} /////////////////////////////////////////////////////////////////////////////////////////////////////
               function registerLayoutRenderer(render) {renderLayout = render;} /////////////////////////////////////////////////////////////////////////////////////////////////////
               function createLayoutWidgetAdapter(widget) {return layoutLoader.load(widget.layout).then(function (layout) {var adapter = layoutWidgetAdapter.create(layout, { area: widget.area, id: widget.id, path: widget.layout });return { id: widget.id, adapter: adapter, destroy: adapter.destroy, templatePromise: $q.when(layout.htmlContent) };});} /////////////////////////////////////////////////////////////////////////////////////////////////////
               function applyViewChanges() {viewChangeApplyFunctions_.forEach(function (applyFunction) {applyFunction();});} /////////////////////////////////////////////////////////////////////////////////////////////////////
               this.applyViewChanges = applyViewChanges;this.setupPage = setupPage;this.tearDownPage = tearDownPage;this.registerLayoutRenderer = registerLayoutRenderer;});_module.controller('AxPageController', createPageControllerInjected);})(); ///////////////////////////////////////////////////////////////////////////////////////////////////////////
         _module.directive('axPage', ['$compile', function ($compile) {var defaultAreas = [{ name: 'activities', hidden: true }, { name: 'popups' }, { name: 'popovers' }];return { restrict: 'A', template: '<div data-ng-class="layoutClass"></div>', replace: true, scope: true, controller: 'AxPageController', link: function link(scope, element, attrs, controller) {controller.registerLayoutRenderer(function (layoutInfo) {scope.layoutClass = layoutInfo.className;element.html(layoutInfo.htmlContent);$compile(element.contents())(scope);var defaultAreaHtml = defaultAreas.reduce(function (html, area) {if (!controller.areas.exists(area.name)) {return html + '<div data-ax-widget-area="' + area.name + '"' + (area.hidden ? ' style="display: none;"' : '') + '></div>';}return html;}, '');if (defaultAreaHtml) {element.append($compile(defaultAreaHtml)(scope));}});} };}]); ///////////////////////////////////////////////////////////////////////////////////////////////////////////
         name = _module.name;_export('name', name);_export('default', _module);} };});

System.register('lib/directives/id/id.js', ['angular', '../../utilities/assert'], function (_export) {/**
                                                                                                       * Copyright 2015 aixigo AG
                                                                                                       * Released under the MIT license.
                                                                                                       * http://laxarjs.org/license
                                                                                                       */
   /**
    * A module for the `axId` and `axFor` directives.
    *
    * @module axId
    */'use strict';var ng, assert, 



   _module, 



   ID_DIRECTIVE_NAME, 































   FOR_DIRECTIVE_NAME, 




























   name;return { setters: [function (_angular) {ng = _angular['default'];}, function (_utilitiesAssert) {assert = _utilitiesAssert['default'];}], execute: function () {_module = ng.module('axId', []); ///////////////////////////////////////////////////////////////////////////////////////////////////////////
         ID_DIRECTIVE_NAME = 'axId'; /**
                                      * This directive should be used within a widget whenever a unique id for a DOM element should be created.
                                      * It's value is evaluated as AngularJS expression and used as a local identifier to generate a distinct,
                                      * unique document wide id.
                                      *
                                      * A common use case is in combination with {@link axFor} for input fields having a label.
                                      *
                                      * Example:
                                      * ```html
                                      * <label ax-for="'userName'">Please enter your name:</label>
                                      * <input ax-id="'userName'" type="text" ng-model="username">
                                      * ```
                                      *
                                      * @name axId
                                      * @directive
                                      */_module.directive(ID_DIRECTIVE_NAME, [function () {return { restrict: 'A', link: function link(scope, element, attrs) {var localId = scope.$eval(attrs[ID_DIRECTIVE_NAME]);assert.state(localId, 'directive axId needs a non-empty local id, e.g. ax-id="\'myLocalId\'".');element.attr('id', scope.id(localId));} };}]); ///////////////////////////////////////////////////////////////////////////////////////////////////////////
         FOR_DIRECTIVE_NAME = 'axFor'; /**
                                        * This directive should be used within a widget whenever an id, generated using the {@link axId} directive,
                                        * should be referenced at a `label` element.
                                        *
                                        * Example:
                                        * ```html
                                        * <label ax-for="'userName'">Please enter your name:</label>
                                        * <input ax-id="'userName'" type="text" ng-model="username">
                                        * ```
                                        *
                                        * @name axFor
                                        * @directive
                                        */_module.directive(FOR_DIRECTIVE_NAME, [function () {return { restrict: 'A', link: function link(scope, element, attrs) {var localId = scope.$eval(attrs[FOR_DIRECTIVE_NAME]);assert.state(localId, 'directive axFor needs a non-empty local id, e.g. ax-for="\'myLocalId\'".');element.attr('for', scope.id(localId));} };}]); ///////////////////////////////////////////////////////////////////////////////////////////////////////////
         name = _module.name;_export('name', name);} };});

System.register('lib/directives/layout/layout.js', ['angular', '../../logging/log'], function (_export) {/**
                                                                                                          * Copyright 2015 aixigo AG
                                                                                                          * Released under the MIT license.
                                                                                                          * http://laxarjs.org/license
                                                                                                          */
   /**
    * A module for the `axLayout` directive.
    *
    * @module axLayout
    */'use strict';var ng, log, 



   _module, 

   DIRECTIVE_NAME, 

































   name;return { setters: [function (_angular) {ng = _angular['default'];}, function (_loggingLog) {log = _loggingLog['default'];}], execute: function () {_module = ng.module('axLayout', []);DIRECTIVE_NAME = 'axLayout'; ///////////////////////////////////////////////////////////////////////////////////////////////////////////
         /**
          * This directive uses the *axLayoutLoader* service to load a given layout and compile it as child to the
          * element the directive is set on. In contrast to *ngInclude* it doesn't watch the provided expression for
          * performance reasons and takes LaxarJS theming into account when loading the assets.
          *
          * @name axLayout
          * @directive
          */_module.directive(DIRECTIVE_NAME, ['axLayoutLoader', '$compile', function (layoutLoader, $compile) {return { restrict: 'A', link: function link(scope, element, attrs) {var layoutName = scope.$eval(attrs[DIRECTIVE_NAME]);layoutLoader.load(layoutName).then(function (layoutInfo) {element.html(layoutInfo.htmlContent);element.addClass(layoutInfo.className);$compile(element.contents())(scope);scope.$emit('axLayoutLoaded', layoutName);}, function (err) {log.error('axLayout: could not load layout [0], error: [1]', layoutName, err);});} };}]); ///////////////////////////////////////////////////////////////////////////////////////////////////////////
         name = _module.name;_export('name', name);} };});

System.register('lib/directives/widget_area/widget_area.js', ['angular', '../../utilities/string'], function (_export) {/**
                                                                                                                         * Copyright 2015 aixigo AG
                                                                                                                         * Released under the MIT license.
                                                                                                                         * http://laxarjs.org/license
                                                                                                                         */
   /**
    * A module for the `axWidgetArea` directive.
    *
    * @module axWidgetArea
    */'use strict';var ng, string, 



   _module, 

   DIRECTIVE_NAME, 




























































   name;return { setters: [function (_angular) {ng = _angular['default'];}, function (_utilitiesString) {string = _utilitiesString['default'];}], execute: function () {_module = ng.module('axWidgetArea', []);DIRECTIVE_NAME = 'axWidgetArea'; ///////////////////////////////////////////////////////////////////////////////////////////////////////////
         /**
          * The *axWidgetArea* directive is used to mark DOM elements as possible containers for widgets. They're
          * most commonly used in layouts using static names. These areas can then be referenced from within page
          * definitions in order to add widgets to them. Additionally it is possible that widgets expose widget
          * areas themselves. In that case the name given within the widget template is prefixed with the id of the
          * widget instance, separated by a dot. If, within a widget, a name is dynamic (i.e. can be configured via
          * feature configuration), the corresponding `ax-widget-area-binding` attribute can be set to bind a name.
          *
          * Example:
          * ```html
          * <div ax-widget-area="myArea"><!-- Here will be widgets --></div>
          * ```
          *
          * Example with binding:
          * ```html
          * <div ax-widget-area
          *      ax-widget-area-binding="features.content.areaName">
          *    <!-- Here will be widgets -->
          * </div>
          * ```
          *
          * @name axWidgetArea
          * @directive
          */_module.directive(DIRECTIVE_NAME, ['axPageService', function (pageService) {return { restrict: 'A', link: function link(scope, element, attrs) {var widgetId = scope.widget && scope.widget.id;var areaName = attrs[DIRECTIVE_NAME];if (!areaName) {if (attrs[DIRECTIVE_NAME + 'Binding']) {areaName = scope.$eval(attrs[DIRECTIVE_NAME + 'Binding']);} else {var message = 'axWidgetArea: area at at [0] has neither a name nor a binding assigned.';var context = widgetId || scope.layoutClass;throw new Error(string.format(message, [context]));}}if (widgetId) {// If a widget is found in a parent scope, this area must be an area contained in that widget.
                     // Therefore the areaName is prefixed with the id of that widget.
                     areaName = widgetId + '.' + areaName;}var areasController = pageService.controllerForScope(scope).areas;var deregister = areasController.register(areaName, element[0]);scope.$on('$destroy', deregister);} };}]); ///////////////////////////////////////////////////////////////////////////////////////////////////////////
         name = _module.name;_export('name', name);} };});

System.register('lib/directives/directives.js', ['./id/id', './layout/layout', './widget_area/widget_area'], function (_export) {/**
                                                                                                                                  * Copyright 2015 aixigo AG
                                                                                                                                  * Released under the MIT license.
                                                                                                                                  * http://laxarjs.org/license
                                                                                                                                  */'use strict';var id, layout, widgetArea;return { setters: [function (_idId) {id = _idId;}, function (_layoutLayout) {layout = _layoutLayout;}, function (_widget_areaWidget_area) {widgetArea = _widget_areaWidget_area;}], execute: function () {_export('id', 




      id);_export('layout', layout);_export('widgetArea', widgetArea);} };});

System.register('lib/profiling/output.js', ['npm:babel-runtime@5.8.34/core-js/object/keys', 'angular'], function (_export) {var _Object$keys, ng, 






   win;

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function logForId(axProfiling, wlKey, id) {
      var profilingData = axProfiling.items;
      var isScopeId = !!id.match(/^[A-Za-z0-9]{3}$/) && id in profilingData;
      var scopeId = id;
      var watchers = [];

      if (isScopeId) {
         watchers = profilingData[id].watchers;} else 

      {
         scopeId = axProfiling.widgetIdToScopeId[id];
         watchers = 
         flatMap(_Object$keys(profilingData).
         map(function (id) {
            return profilingData[id];}).

         filter(function (item) {
            return item.context.widgetId === id;}), 

         function (item) {
            return item.watchers;});}




      var ngContext = [].slice.call(win.document.getElementsByClassName('ng-scope'), 0).
      concat([win.document]).
      map(function (element) {
         return { 
            element: element, 
            scope: ng.element(element).scope() };}).


      filter(function (item) {
         return item.scope.$id === scopeId;})[
      0] || null;

      consoleLog('Showing details for %s with id "%s"', isScopeId ? 'scope' : 'widget', id);

      if (ngContext) {
         consoleLog('Context: Scope: %o, Element %o', ngContext.scope, ngContext.element);}


      var data = watchers.map(function (entry) {
         var result = {};

         if (!wlKey || wlKey === 'watchFn') {
            var w = entry.watchFn;
            result['Watcher'] = w.name;
            result['Watcher ms total'] = toPrecision(w.time, 3);
            result['Watcher ms average'] = toPrecision(average(w.time, w.count), 3);
            result['Watcher # executions'] = w.count;}


         if (!wlKey || wlKey === 'listener') {
            var l = entry.listener;
            result['Listener'] = l.name;
            result['Listener ms total'] = toPrecision(l.time, 3);
            result['Listener ms average'] = toPrecision(average(l.time, l.count), 3);
            result['Listener # executions'] = l.count;}


         return result;});

      logTabularData(data);}


   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function logAll(axProfiling, wlKey) {
      var profilingData = axProfiling.items;
      var data = [];
      var totalWatchFunctions = 0;
      var totalWatchExpressions = 0;
      var totalTime = 0;
      var totalExecutions = 0;

      var dataByWidgetId = {};
      ng.forEach(profilingData, function (item, key) {
         var widgetId = item.context.widgetId;
         if (!widgetId) {
            dataByWidgetId[key] = item;
            return;}


         if (!(widgetId in dataByWidgetId)) {
            dataByWidgetId[widgetId] = { 
               context: item.context, 
               watchers: [] };}



         [].push.apply(dataByWidgetId[widgetId].watchers, item.watchers);});


      ng.forEach(dataByWidgetId, function (item) {
         var time = 0;
         var executions = 0;
         var noOfFunctions = 0;
         var noOfStrings = 0;

         item.watchers.forEach(function (entry) {
            time += entry[wlKey].time;
            executions += entry[wlKey].count;
            noOfFunctions += entry[wlKey].type === 'f' ? 1 : 0;
            noOfStrings += entry[wlKey].type === 's' ? 1 : 0;}, 
         0);

         data.push({ 
            'Widget name': item.context.widgetName || '?', 
            'Widget id': item.context.widgetId || '?', 
            'Scope id': item.context.widgetScopeId || item.context.scopeId, 
            '# functions': noOfFunctions, 
            '# strings': noOfStrings, 
            '# total:': noOfFunctions + noOfStrings, 
            'ms total': toPrecision(time, 3), 
            'ms average': toPrecision(average(time, executions), 3), 
            '# of executions': executions });


         totalWatchFunctions += noOfFunctions;
         totalWatchExpressions += noOfStrings;
         totalTime += time;
         totalExecutions += executions;});


      data.push({ 
         'Widget name': '', 
         'Widget id': '', 
         'Scope id': 'Total:', 
         '# functions': totalWatchFunctions, 
         '# strings': totalWatchExpressions, 
         '# total:': totalWatchFunctions + totalWatchExpressions, 
         'ms total': toPrecision(totalTime, 3), 
         'ms average': toPrecision(average(totalTime, totalExecutions), 3), 
         '# of executions': totalExecutions });


      logTabularData(data);}


   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function average(time, count) {
      return count > 0 ? time / count : 0;}


   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function toPrecision(number, precision) {
      var factor = precision === 0 ? 1 : Math.pow(10, precision);
      return Math.round(number * factor) / factor;}


   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function flatMap(arr, func) {
      return Array.prototype.concat.apply([], arr.map(func));}


   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function consoleLog(msg, arg /*, ... */) {
      if (!win.console || !win.console.log) {
         return;}


      // MSIE8 does not support console.log.apply( ... )
      // The following call is equivalent to: console.log.apply( console, args );
      Function.apply.apply(win.console.log, [win.console, arguments]);}


   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function logTabularData(data) {
      if (win.console.table) {
         win.console.table(data);} else 

      {
         consoleLog(JSON.stringify(data, null, 2));}}



   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function create(windowObject) {
      win = windowObject;

      return { 
         log: consoleLog, 
         logForId: logForId, 
         logAll: logAll };}return { setters: [function (_babelRuntimeCoreJsObjectKeys) {_Object$keys = _babelRuntimeCoreJsObjectKeys['default'];}, function (_angular) {ng = _angular['default'];}], execute: function () {/**
                                                                                                                                                                                                                            * Copyright 2015 aixigo AG
                                                                                                                                                                                                                            * Released under the MIT license.
                                                                                                                                                                                                                            * http://laxarjs.org/license
                                                                                                                                                                                                                            */'use strict';_export('create', create);} };});

System.register('lib/profiling/profiling.js', ['npm:babel-runtime@5.8.34/core-js/object/keys', 'angular', './output'], function (_export) {var _Object$keys, ng, output, 







   _module, 



   config, 
   axProfiling, 
   origWatch, 
   win, 
   out, 













































































































































































   FUNCTION_NAME_REGEXP, 










































   name; ///////////////////////////////////////////////////////////////////////////////////////////////////////////
   function attachProfiling(scope, watchExp, listener, objectEquality) {var watcherIsFunction = typeof watchExp === 'function';var listenerIsFunction = typeof listener === 'function';var items = axProfiling.items;var context = determineContext(scope);if (!(scope.$id in items)) {items[scope.$id] = { context: context, watchers: [] };scope.$on('$destroy', function () {detachProfiling(scope);delete items[scope.$id];});}if (context.widgetScopeId) {if (!(context.widgetId in axProfiling.widgetIdToScopeId)) {axProfiling.widgetIdToScopeId[context.widgetId] = context.widgetScopeId;}}var profilingEntry = { watchFn: { type: watcherIsFunction ? 'f' : 's', name: watcherIsFunction ? functionName(watchExp) + '()' : watchExp, time: 0, count: 0 }, listener: { type: listenerIsFunction ? 'f' : 's', name: listenerIsFunction ? functionName(listener) + '()' : listener, time: 0, count: 0 } };items[scope.$id].watchers.push(profilingEntry);var stopWatching = origWatch.call(scope, watchExp, listener, objectEquality);var watchEntry = scope.$$watchers[0];watchEntry.get = instrumentFunction(watchEntry.get, profilingEntry.watchFn);watchEntry.fn = instrumentFunction(watchEntry.fn, profilingEntry.listener);return function () {stopWatching();detachProfiling(scope);};} ///////////////////////////////////////////////////////////////////////////////////////////////////////////
   function detachProfiling(scope) {delete axProfiling.items[scope.$id];_Object$keys(axProfiling.widgetIdToScopeId).forEach(function (widgetId) {if (axProfiling.widgetIdToScopeId[widgetId] === scope.$id) {delete axProfiling.widgetIdToScopeId[widgetId];}});} ///////////////////////////////////////////////////////////////////////////////////////////////////////////
   function instrumentFunction(func, entry) {return function () {var start = win.performance.now();var result = func.apply(null, arguments);var time = win.performance.now() - start;++entry.count;entry.time += time;return result;};} ///////////////////////////////////////////////////////////////////////////////////////////////////////////
   function determineContext(scope) {var current = scope;while (!current.hasOwnProperty('widget') && current !== current.$root) {current = current.$parent;}var isInWidget = !!current.widget;return { widgetName: isInWidget ? current.widget.path : '', widgetId: isInWidget ? current.widget.id : '', widgetScopeId: isInWidget ? current.$id : null, scopeId: scope.$id };} ///////////////////////////////////////////////////////////////////////////////////////////////////////////
   function functionName(func) {if (func.name && typeof func.name === 'string') {return func.name;}var match = FUNCTION_NAME_REGEXP.exec(func.toString());if (match) {return match[1].trim();}return '[anonymous]';} ///////////////////////////////////////////////////////////////////////////////////////////////////////////
   function printHelp() {out.log('Available commands:\n\n' + ' - help():\n' + '     prints this help\n\n' + ' - log( [scopeOrWidgetId] ):\n' + '     If the argument is omitted this is the same as calling\n' + '     logWatchers() first and logListeners() afterwards.\n' + '     Otherwise all listeners and watchers of the widget or scope\n' + '     with the given id are logged in one table\n\n' + ' - logWatchers( [scopeOrWidgetId] ):\n' + '     If the argument is omitted the watchers of all scopes belonging to\n' + '     a specific widget or of global scopes are logged.\n' + '     Otherwise more detailed data for the watchers of the given scope\n' + '     or widget are logged.\n\n' + ' - logListeners( [scopeOrWidgetId] ):\n' + '     If the argument is omitted the listeners of all scopes belonging to\n' + '     a specific widget or of global scopes are logged.\n' + '     Otherwise more detailed data for the listeners of the given scope\n' + '     or widget are logged.\n\n' + ' - reset():\n' + '     Resets all "# of executions" and millisecond data to zero.');} ///////////////////////////////////////////////////////////////////////////////////////////////////////////
   return { setters: [function (_babelRuntimeCoreJsObjectKeys) {_Object$keys = _babelRuntimeCoreJsObjectKeys['default'];}, function (_angular) {ng = _angular['default'];}, function (_output) {output = _output;}], execute: function () {/**
                                                                                                                                                                                                                                            * Copyright 2015 aixigo AG
                                                                                                                                                                                                                                            * Released under the MIT license.
                                                                                                                                                                                                                                            * http://laxarjs.org/license
                                                                                                                                                                                                                                            */'use strict';_module = ng.module('axProfiling', []); ///////////////////////////////////////////////////////////////////////////////////////////////////////////
         _module.run(['$rootScope', '$window', 'axConfiguration', function ($rootScope, $window, configuration) {win = $window;config = configuration.get('profiling', { enabled: false });out = output.create($window);if (config.enabled !== true) {return;}if (!win.performance || !win.performance.now) {out.log('Performance api is not available. Profiling is disabled.');return;}out.log('%c!!! Profiling enabled. Application performance will suffer !!!', 'font-weight: bold; font-size: 1.2em');out.log('Type "axProfiling.help()" to get a list of available methods');var scopePrototype = $rootScope.constructor.prototype;axProfiling = $window.axProfiling = { items: {}, widgetIdToScopeId: {}, logWatchers: function logWatchers(id) {if (id && typeof id === 'string') {out.logForId(axProfiling, 'watchFn', id);} else {out.logAll(axProfiling, 'watchFn');}}, logListeners: function logListeners(id) {if (id && typeof id === 'string') {out.logForId(axProfiling, 'listener', id);} else {out.logAll(axProfiling, 'listener');}}, log: function log(id) {if (id && typeof id === 'string') {out.logForId(axProfiling, null, id);} else {out.log('All listeners:');out.logAll(axProfiling, 'listener');out.log('All watchers:');out.logAll(axProfiling, 'watchFn');}}, reset: function reset() {_Object$keys(axProfiling.items).forEach(function (key) {axProfiling.items[key].watchers.forEach(function (watcher) {watcher.watchFn.time = 0;watcher.watchFn.count = 0;watcher.listener.time = 0;watcher.listener.count = 0;});});}, help: printHelp };origWatch = scopePrototype.$watch;scopePrototype.$watch = function (watchExp, listener, objectEquality) {return attachProfiling(this, watchExp, listener, objectEquality || false);};}]);FUNCTION_NAME_REGEXP = /^[ ]*function([^\(]*?)\(/;name = _module.name;_export('name', name);_export('default', _module);} };});

System.register('lib/runtime/runtime_dependencies.js', ['angular', 'angular-sanitize', './runtime_services', './flow', './page', '../directives/directives', '../profiling/profiling'], function (_export) {/**
                                                                                                                                                                                                             * Copyright 2015 aixigo AG
                                                                                                                                                                                                             * Released under the MIT license.
                                                                                                                                                                                                             * http://laxarjs.org/license
                                                                                                                                                                                                             */'use strict';var ng, ngSanitizeModule, runtimeServicesModule, flowModule, pageModule, directives, profilingModule, 








   name;return { setters: [function (_angular) {ng = _angular['default'];}, function (_angularSanitize) {ngSanitizeModule = _angularSanitize;}, function (_runtime_services) {runtimeServicesModule = _runtime_services;}, function (_flow) {flowModule = _flow;}, function (_page) {pageModule = _page;}, function (_directivesDirectives) {directives = _directivesDirectives;}, function (_profilingProfiling) {profilingModule = _profilingProfiling;}], execute: function () {name = ng.module('axRuntimeDependencies', [
         'ngSanitize', 

         runtimeServicesModule.name, 
         flowModule.name, 
         pageModule.name, 
         directives.id.name, 
         directives.widgetArea.name, 
         profilingModule.name]).
         name;_export('name', name);} };});

System.register('lib/utilities/string.js', ['npm:babel-runtime@5.8.34/core-js/object/freeze', 'npm:babel-runtime@5.8.34/core-js/object/keys'], function (_export) {var _Object$freeze, _Object$keys, 











   DEFAULT_FORMATTERS, 

















































































































   DEFAULT_FORMATTER, 












































































































































































   BACKSLASH, 
   OPENING_BRACKET, 
   CLOSING_BRACKET, 
   INTEGER_MATCHER; ///////////////////////////////////////////////////////////////////////////////////////////////////////////
   /**
    * Substitutes all unescaped placeholders in the given string for a given indexed or named value.
    * A placeholder is written as a pair of brackets around the key of the placeholder. An example of an
    * indexed placeholder is `[0]` and a named placeholder would look like this `[replaceMe]`. If no
    * replacement for a key exists, the placeholder will simply not be substituted.
    *
    * Some examples:
    * ```javascript
    * string.format( 'Hello [0], how do you like [1]?', [ 'Peter', 'Cheeseburgers' ] );
    * // => 'Hello Peter, how do you like Cheeseburgers?'
    * ```
    * ```javascript
    * string.format( 'Hello [name] and [partner], how do you like [0]?', [ 'Pizza' ], {
    *    name: 'Hans',
    *    partner: 'Roswita'
    * } );
    * // => 'Hello Hans and Roswita, how do you like Pizza?'
    * ```
    * If a pair of brackets should not be treated as a placeholder, the opening bracket can simply be escaped
    * by backslashes (thus to get an actual backslash in a JavaScript string literal, which is then treated as
    * an escape symbol, it needs to be written as double backslash):
    * ```javascript
    * string.format( 'A [something] should eventually only have \\[x].', {
    *    something: 'checklist'
    * } );
    * // => 'A checklist should eventually only have [x].'
    * ```
    * A placeholder key can be any character string besides `[`, `]` and `:` to keep parsing simple and fast.
    * By using `:` as separator it is possible to provide a type specifier for string serialization or other
    * additional mapping functions for the value to insert. Type specifiers always begin with an `%` and end
    * with the specifier type. Builtin specifier types are the following:
    *
    * - `%d` / `%i`: Format the given numeric value as integer. Decimal places are removed.
    * - `%f`: Format the given numeric value as floating point value. This specifier supports precision as
    *   sub-specifier (e.g. `%.2f` for 2 decimal places).
    * - `%s`: use simple string serialization using `toString`.
    * - `%o`: Format complex objects using `JSON.stringify`.
    *
    * When no specifier is provided, by default `%s` is assumed.
    *
    * Example:
    * ```javascript
    * string.format( 'Hello [0:%s], you owe me [1:%.2f] euros.', [ 'Peter', 12.1243 ] );
    * // => 'Hello Peter, you owe me 12.12 euros.'
    * ```
    *
    * Mapping functions should instead consist of simple strings and may not begin with a `%` character. It is
    * advised to use the same naming rules as for simple JavaScript functions. Type specifiers and mapping
    * functions are applied in the order they appear within the placeholder.
    *
    * An example, where we assume that the mapping functions `flip` and `double` where defined by the user
    * when creating the `formatString` function using {@link createFormatter}:
    * ```javascript
    * formatString( 'Hello [0:%s:flip], you owe me [1:double:%.2f] euros.', [ 'Peter', 12 ] );
    * // => 'Hello reteP, you owe me 24.00 euros.'
    * ```
    *
    * Note that there currently exist no builtin mapping functions.
    *
    * If a type specifier is used that doesn't exist, an exception is thrown. In contrast to that the use of
    * an unknown mapping function results in a no-op. This is on purpose to be able to use filter-like
    * functions that, in case they are defined for a formatter, transform a value as needed and in all other
    * cases simply are ignored and don't alter the value.
    *
    * @param {String} string
    *    the string to replace placeholders in
    * @param {Array} [optionalIndexedReplacements]
    *    an optional array of indexed replacements
    * @param {Object} [optionalNamedReplacements]
    *    an optional map of named replacements
    *
    * @return {String}
    *    the string with placeholders substituted for their according replacements
    */function format(string, optionalIndexedReplacements, optionalNamedReplacements) {return DEFAULT_FORMATTER(string, optionalIndexedReplacements, optionalNamedReplacements);} ///////////////////////////////////////////////////////////////////////////////////////////////////////////
   /**
    * Creates a new format function having the same api as {@link format}. If the first argument is
    * omitted or `null`, the default formatters for type specifiers are used. Otherwise only the provided map
    * of specifiers is available to the returned format function. Each key of the map is a specifier character
    * where the `%` is omitted and the value is the formatting function. A formatting function receives the
    * value to format (i.e. serialize) and the sub-specifier (if any) as arguments. For example for the format
    * specifier `%.2f` the sub-specifier would be `.2` where for `%s` it would simply be the empty string.
    *
    * Example:
    * ```javascript
    * var format = string.createFormatter( {
    *    'm': function( value ) {
    *       return value.amount + ' ' + value.currency;
    *    },
    *    'p': function( value, subSpecifier ) {
    *       return Math.pow( value, parseInt( subSpecifier, 10 ) );
    *    }
    * } );
    *
    * format( 'You owe me [0:%m].', [ { amount: 12, currency: 'EUR' } ] );
    * // => 'You owe me 12 EUR.'
    *
    * format( '[0]^3 = [0:%3p]', [ 2 ] );
    * // => '2^3 = 8'
    * ```
    *
    * The second argument is completely additional to the behavior of the default {@link format}
    * function. Here a map from mapping function id to actual mapping function can be passed in. Whenever the
    * id of a mapping function is found within the placeholder, that mapping function is called with the
    * current value and its return value is either passed to the next mapping function or rendered
    * instead of the placeholder if there are no more mapping function ids or type specifiers within the
    * placeholder string.
    *
    * ```javascript
    * var format = string.createFormatter( null, {
    *    flip: function( value ) {
    *       return ( '' + s ).split( '' ).reverse().join( '' );
    *    },
    *    double: function( value ) {
    *       return value * 2;
    *    }
    * } );
    *
    * format( 'Hello [0:%s:flip], you owe me [1:double:%.2f] euros.', [ 'Peter', 12 ] );
    * // => 'Hello reteP, you owe me 24.00 euros.'
    * ```
    *
    * @param {Object} typeFormatters
    *    map from format specifier (single letter without leading `%`) to formatting function
    * @param {Object} [optionalValueMappers]
    *    map from mapping identifier to mapping function
    *
    * @return {Function}
    *    A function having the same api as {@link format}
    */function createFormatter(typeFormatters, optionalValueMappers) {if (!typeFormatters) {typeFormatters = DEFAULT_FORMATTERS;}if (!optionalValueMappers) {optionalValueMappers = {};}function format(string, optionalIndexedReplacements, optionalNamedReplacements) {if (typeof string !== 'string') {return defaultTypeFormatter(typeFormatters)(string);}var indexed = Array.isArray(optionalIndexedReplacements) ? optionalIndexedReplacements : [];var named = {};if (optionalNamedReplacements) {named = optionalNamedReplacements || {};} else if (!Array.isArray(optionalIndexedReplacements)) {named = optionalIndexedReplacements || {};}var chars = string.split('');var output = '';for (var i = 0, len = chars.length; i < len; ++i) {if (chars[i] === BACKSLASH) {if (i + 1 === len) {throw new Error('Unterminated escaping sequence at index ' + i + ' of string: "' + string + '".');}output += chars[++i];} else if (chars[i] === OPENING_BRACKET) {var closingIndex = string.indexOf(CLOSING_BRACKET, i + 1);if (closingIndex === -1) {throw new Error('Unterminated placeholder at index ' + i + ' of string: "' + string + '".');}var key = string.substring(i + 1, closingIndex);output += replacePlaceholder(key, named, indexed, { string: string, index: i });i = closingIndex;} else {output += chars[i];}}return output;} ///////////////////////////////////////////////////////////////////////////////////////////////////////////
      function replacePlaceholder(placeholder, named, indexed, context) {var specifier = '';var subSpecifierString = '';var placeholderParts = placeholder.split(':');var key = placeholderParts[0];var value;if (INTEGER_MATCHER.test(key) && key < indexed.length) {value = indexed[key];} else if (key in named) {value = named[key];} else {return OPENING_BRACKET + placeholder + CLOSING_BRACKET;}if (placeholderParts.length > 1) {if (placeholderParts[1].charAt(0) !== '%') {value = defaultTypeFormatter(typeFormatters)(value);}return placeholderParts.slice(1).reduce(function (value, part) {if (part.indexOf('%') === 0) {var specifierMatch = part.match(/^%(.*)(\w)$/);specifier = specifierMatch ? specifierMatch[2] : '';subSpecifierString = specifierMatch ? specifierMatch[1] : '';if (specifier in typeFormatters) {return typeFormatters[specifier](value, subSpecifierString);} else {var knownSpecifiers = _Object$keys(typeFormatters).filter(function (_) {return _ !== 'default';}).map(function (_) {return '%' + _;}).join(', ');throw new Error('Unknown format specifier "%' + specifier + '" for placeholder' + ' at index ' + context.index + ' of string: "' + context.string + '" (Known specifiers are: ' + knownSpecifiers + ').');}} else if (part in optionalValueMappers) {return optionalValueMappers[part](value);}return value;}, value);}return defaultTypeFormatter(typeFormatters)(value);} ////////////////////////////////////////////////////////////////////////////////////////////////////////
      return format;} ///////////////////////////////////////////////////////////////////////////////////////////////////////////
   function defaultTypeFormatter(typeFormatters) {if ('default' in typeFormatters) {return typeFormatters['default'];}return DEFAULT_FORMATTERS['default'];}return { setters: [function (_babelRuntimeCoreJsObjectFreeze) {_Object$freeze = _babelRuntimeCoreJsObjectFreeze['default'];}, function (_babelRuntimeCoreJsObjectKeys) {_Object$keys = _babelRuntimeCoreJsObjectKeys['default'];}], execute: function () {/**
                                                                                                                                                                                                                                                                                                                                                                                                                       * Copyright 2015 aixigo AG
                                                                                                                                                                                                                                                                                                                                                                                                                       * Released under the MIT license.
                                                                                                                                                                                                                                                                                                                                                                                                                       * http://laxarjs.org/license
                                                                                                                                                                                                                                                                                                                                                                                                                       */ /**
                                                                                                                                                                                                                                                                                                                                                                                                                           * Utilities for dealing with strings.
                                                                                                                                                                                                                                                                                                                                                                                                                           *
                                                                                                                                                                                                                                                                                                                                                                                                                           * When requiring `laxar`, it is available as `laxar.string`.
                                                                                                                                                                                                                                                                                                                                                                                                                           *
                                                                                                                                                                                                                                                                                                                                                                                                                           * @module object
                                                                                                                                                                                                                                                                                                                                                                                                                           */'use strict';_export('format', format);_export('createFormatter', createFormatter);DEFAULT_FORMATTERS = { 's': function s(input) {return '' + input;}, 'd': function d(input) {return input.toFixed(0);}, 'i': function i(input, subSpecifierString) {return DEFAULT_FORMATTERS.d(input, subSpecifierString);}, 'f': function f(input, subSpecifierString) {var precision = subSpecifierString.match(/^\.(\d)$/);if (precision) {return input.toFixed(precision[1]);}return '' + input;}, 'o': function o(input) {return JSON.stringify(input);}, 'default': function _default(input, subSpecifierString) {return DEFAULT_FORMATTERS.s(input, subSpecifierString);} };_export('DEFAULT_FORMATTERS', DEFAULT_FORMATTERS);if (typeof _Object$freeze === 'function') {_Object$freeze(DEFAULT_FORMATTERS);}DEFAULT_FORMATTER = createFormatter(DEFAULT_FORMATTERS);BACKSLASH = '\\';OPENING_BRACKET = '[';CLOSING_BRACKET = ']';INTEGER_MATCHER = /^[0-9]+$/;} };});

System.register('lib/loaders/paths.js', [], function (_export) {/**
                                                                 * Copyright 2015 aixigo AG
                                                                 * Released under the MIT license.
                                                                 * http://laxarjs.org/license
                                                                 */
  // TODO: fix these paths, especially the one for the default theme
  'use strict';var PRODUCT, 
  THEMES, 
  LAYOUTS, 
  CONTROLS, 
  WIDGETS, 
  PAGES, 
  FLOW_JSON, 
  DEFAULT_THEME;return { setters: [], execute: function () {PRODUCT = '';THEMES = 'includes/themes';LAYOUTS = 'application/layouts';CONTROLS = 'includes/controls';WIDGETS = 'includes/widgets';PAGES = 'application/pages';FLOW_JSON = 'application/flow/flow.json';DEFAULT_THEME = 'bower_components/laxar-uikit/dist/themes/default.theme';_export('PRODUCT', 

      PRODUCT);_export('THEMES', THEMES);_export('LAYOUTS', LAYOUTS);_export('CONTROLS', CONTROLS);_export('WIDGETS', WIDGETS);_export('PAGES', PAGES);_export('FLOW_JSON', FLOW_JSON);_export('DEFAULT_THEME', DEFAULT_THEME);_export('default', 
      { PRODUCT: PRODUCT, THEMES: THEMES, LAYOUTS: LAYOUTS, CONTROLS: CONTROLS, WIDGETS: WIDGETS, PAGES: PAGES, FLOW_JSON: FLOW_JSON, DEFAULT_THEME: DEFAULT_THEME });} };});

System.register('lib/runtime/controls_service.js', ['../utilities/path', '../utilities/string', '../loaders/paths'], function (_export) {/**
                                                                                                                                          * Copyright 2015 aixigo AG
                                                                                                                                          * Released under the MIT license.
                                                                                                                                          * http://laxarjs.org/license
                                                                                                                                          */
   /**
    * The controls service helps to lookup control assets and implementations.
    * It should be used via dependency injection as the *axControls* service.
    *
    * @module controls_service
    */'use strict';var path, format, paths;_export('create', create);




   function create(fileResourceProvider) {

      var notDeclaredMessage = 
      'Tried to load control reference [0] without declaration in widget.json.\nDetails: [1]';
      var missingDescriptorMessage = 
      'Cannot use axControls service to load control [0] without descriptor.\nDetails: [1]';
      var errorInfoLink = 
      'https://github.com/LaxarJS/laxar/blob/master/docs/manuals/providing_controls.md#compatibility';

      var descriptors = {};
      var descriptorPromises = {};

      return { 
         load: load, 
         provide: provide, 
         resolve: resolve, 
         descriptor: descriptor };


      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      /**
       * Provides the implementation module of the given control, for manual instantiation by a widget.
       *
       * Because the method must return synchronously, it may only be called for controls that have been
       * loaded before (using `load`)!
       *
       * @param {String} controlRef
       *   a valid control reference as used in the `widget.json`
       * @return {*}
       *   the AMD module for the requested control reference
       */
      function provide(controlRef) {
         var resolvedControlPath = resolve(controlRef);
         var descriptor = descriptors[resolvedControlPath];
         if (!descriptor) {
            fail(notDeclaredMessage);}

         if (descriptor._compatibility_0x) {
            fail(missingDescriptorMessage);}


         var amdControlRef = path.extractScheme(controlRef).ref;
         // TODO: check users of this api, since they receive a promise now
         return System['import'](path.join(amdControlRef, descriptor.name));

         function fail(reason) {
            var message = format('axControls: ' + reason, [controlRef, errorInfoLink]);
            throw new Error(message);}}



      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      /**
       * Fetches the descriptor for a given control reference, and saves it as a side-effect.
       * This is part of the internal API used by the widget loader.
       *
       * This process must be completed before the descriptor or the module for a control can be provided.
       * For this reason, `load` is called by the widget-loader, using information from the `widet.json`.
       *
       * For backward-compatibility, missing descriptors are synthesized.
       *
       * @return {Promise}
       *   A promise for the (fetched or synthesized) control descriptor.
       *
       * @private
       */
      function load(controlRef) {
         // By appending a path now and .json afterwards, 'help' RequireJS to generate the
         // correct descriptor path when loading from a 'package'.
         var resolvedPath = resolve(controlRef);
         if (!descriptorPromises[resolvedPath]) {
            var descriptorUrl = path.join(resolvedPath, 'control.json');
            descriptorPromises[resolvedPath] = fileResourceProvider.
            provide(descriptorUrl)['catch'](
            function () {
               // LaxarJS 0.x style (no control.json): generate descriptor
               return { 
                  _compatibility_0x: true, 
                  name: controlRef.split('/').pop(), 
                  integration: { technology: 'angular' } };}).


            then(function (descriptor) {
               descriptors[resolvedPath] = descriptor;
               return descriptor;});}


         return descriptorPromises[resolvedPath];}


      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      /**
       * Takes a control reference and resolves it to a URL.
       * This is part of the internal API used by the widget loader.
       *
       * @param {String} controlRef
       *   a valid control reference as used in the `widget.json`
       * @return {String}
       *   the url under which the `control.json` should be found
       *
       * @private
       */
      function resolve(controlRef) {
         return path.resolveAssetPath(controlRef, paths.CONTROLS);}


      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      /**
       * Gets the (previously loaded) descriptor for a widget reference.
       * This is part of the internal API used by the widget loader.
       *
       * @param controlRef
       *   a valid control referenceas used in the `widget.json`
       * @return {Object}
       *   The control descriptor.
       *
       * @private
       */
      function descriptor(controlRef) {
         var resolvedControlPath = resolve(controlRef);
         return descriptors[resolvedControlPath];}}return { setters: [function (_utilitiesPath) {path = _utilitiesPath;}, function (_utilitiesString) {format = _utilitiesString.format;}, function (_loadersPaths) {paths = _loadersPaths;}], execute: function () {} };});

System.register('lib/utilities/path.js', ['./assert'], function (_export) {/**
                                                                            * Copyright 2015 aixigo AG
                                                                            * Released under the MIT license.
                                                                            * http://laxarjs.org/license
                                                                            */
   // TODO: this won't work. We need to get rid of amd module references in the frontend
   // import require from 'require';
   'use strict';var assert, 

   PATH_SEPARATOR, 
   PARENT, 
   ABSOLUTE, 


















































































































   schemeLoaders; ///////////////////////////////////////////////////////////////////////////////////////////////////////////
   /**
    * Normalizes a path. Removes multiple consecutive slashes, strips trailing slashes, removes `.`
    * references and resolves `..` references (unless there are no preceding directories).
    *
    * @param {String} path
    *    the path to normalize
    *
    * @return {String}
    *    the normalized path
    */_export('join', join); ///////////////////////////////////////////////////////////////////////////////////////////////////////////
   /**
    * Compute a relative path. Takes two absolute paths and returns a normalized path, relative to
    * the first path.
    * Note that if both paths are URLs they are threated as if they were on the same host. I.e. this function
    * does not complain when called with `http://localhost/path` and `http://example.com/another/path`.
    *
    * @param {String} from
    *    the starting point from which to determine the relative path
    *
    * @param {String} path
    *    the target path
    *
    * @return {String}
    *    the relative path from `from` to `to`
    */_export('normalize', normalize); ///////////////////////////////////////////////////////////////////////////////////////////////////////////
   _export('relative', relative);_export('resolveAssetPath', resolveAssetPath); ///////////////////////////////////////////////////////////////////////////////////////////////////////////
   _export('extractScheme', extractScheme); ///////////////////////////////////////////////////////////////////////////////////////////////////////////
   /**
    * Joins multiple path fragments into one normalized path. Absolute paths (paths starting with a `/`)
    * and URLs will "override" any preceding paths. I.e. joining a URL or an absolute path to _anything_
    * will give the URL or absolute path.
    *
    * @param {...String} fragments
    *    the path fragments to join
    *
    * @return {String}
    *    the joined path
    */function join() /* firstFragment, secondFragment, ... */{var fragments = Array.prototype.slice.call(arguments, 0);if (fragments.length === 0) {return '';}var prefix = '';fragments = fragments.reduce(function (fragments, fragment) {assert(fragment).hasType(String).isNotNull();var matchAbsolute = ABSOLUTE.exec(fragment);if (matchAbsolute) {prefix = matchAbsolute[1];fragment = matchAbsolute[2];return fragment.split(PATH_SEPARATOR);}return fragments.concat(fragment.split(PATH_SEPARATOR));}, []);var pathStack = normalizeFragments(fragments);return prefix + pathStack.join(PATH_SEPARATOR);}function normalize(path) {var prefix = '';var matchAbsolute = ABSOLUTE.exec(path);if (matchAbsolute) {prefix = matchAbsolute[1];path = matchAbsolute[2];}var pathStack = normalizeFragments(path.split(PATH_SEPARATOR));return prefix + pathStack.join(PATH_SEPARATOR);}function relative(from, path) {var matchAbsoluteFrom = ABSOLUTE.exec(from);var matchAbsolutePath = ABSOLUTE.exec(path);assert(matchAbsoluteFrom).isNotNull();assert(matchAbsolutePath).isNotNull();var fromStack = normalizeFragments(matchAbsoluteFrom[2].split(PATH_SEPARATOR));var pathStack = normalizeFragments(matchAbsolutePath[2].split(PATH_SEPARATOR));return fromStack.reduce(function (path, fragment) {if (path[0] === fragment) {path.shift();} else {path.unshift('..');}return path;}, pathStack).join(PATH_SEPARATOR) || '.';}function resolveAssetPath(refWithScheme, defaultAssetDirectory, optionalDefaultScheme) {var info = extractScheme(refWithScheme, optionalDefaultScheme || 'amd');if (typeof schemeLoaders[info.scheme] !== 'function') {throw new Error('Unknown schema type "' + info.scheme + '" in reference "' + refWithScheme + '".');}return normalize(schemeLoaders[info.scheme](info.ref, defaultAssetDirectory));} ///////////////////////////////////////////////////////////////////////////////////////////////////////////
   function extractScheme(ref, defaultScheme) {var parts = ref.split(':');return { scheme: parts.length === 2 ? parts[0] : defaultScheme, ref: parts.length === 2 ? parts[1] : parts[0] };}function normalizeFragments(fragments) {return fragments.reduce(function (pathStack, fragment) {fragment = fragment.replace(/^\/+|\/+$/g, '');if (fragment === '' || fragment === '.') {return pathStack;}if (pathStack.length === 0) {return [fragment];}if (fragment === PARENT && pathStack.length > 0 && pathStack[pathStack.length - 1] !== PARENT) {pathStack.pop();return pathStack;}pathStack.push(fragment);
         return pathStack;}, 
      []);}return { setters: [function (_assert) {assert = _assert['default'];}], execute: function () {PATH_SEPARATOR = '/';PARENT = '..';ABSOLUTE = /^([a-z0-9]+:\/\/[^\/]+\/|\/)(.*)$/;schemeLoaders = { local: function local(ref, defaultAssetDirectory) {return join(defaultAssetDirectory, ref);}, amd: function amd(ref) {// TODO NEEDS FIX A: amd references should already be resolved by the grunt task
               return System.normalizeSync(ref).replace(/\.js$/, '');} };} };});

System.register('lib/runtime/theme_manager.js', ['../utilities/path'], function (_export) {/**
                                                                                            * Copyright 2015 aixigo AG
                                                                                            * Released under the MIT license.
                                                                                            * http://laxarjs.org/license
                                                                                            */
   /**
    * The theme manager simplifies lookup of theme specific assets. It should be used via AngularJS DI as
    * *axThemeManager* service.
    *
    * @module theme_manager
    */


   /**
    * @param {FileResourceProvider} fileResourceProvider
    *    the file resource provider used for theme file lookups
    * @param {$q} q
    *    a `$q` like promise library
    * @param {String} theme
    *    the theme to use
    *
    * @constructor
    */'use strict';var path;_export('create', create);
   function ThemeManager(fileResourceProvider, q, theme) {
      this.q_ = q;
      this.fileResourceProvider_ = fileResourceProvider;
      this.theme_ = theme;}


   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   /**
    * Returns the currently used theme.
    *
    * @return {String}
    *    the currently active theme
    */






































































   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function findExistingPath(self, searchPrefixes, fileName) {
      if (searchPrefixes.length === 0) {
         return self.q_.when(null);}


      return self.fileResourceProvider_.isAvailable(path.join(searchPrefixes[0], fileName)).
      then(function (available) {
         if (available) {
            return self.q_.when(searchPrefixes[0]);}

         return findExistingPath(self, searchPrefixes.slice(1), fileName);});}



   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   /**
    * Creates and returns a new theme manager instance.
    *
    * @param {FileResourceProvider} fileResourceProvider
    *    the file resource provider used for theme file lookup
    * @param {$q} q
    *    a `$q` like promise library
    * @param {String} theme
    *    the theme to use
    *
    * @returns {ThemeManager}
    */
   function create(fileResourceProvider, q, theme) {
      return new ThemeManager(fileResourceProvider, q, theme);}return { setters: [function (_utilitiesPath) {path = _utilitiesPath;}], execute: function () {ThemeManager.prototype.getTheme = function () {return this.theme_;}; ///////////////////////////////////////////////////////////////////////////////////////////////////////////
         /**
          * Returns a URL provider for specific path patterns that are used to lookup themed artifacts. The token
          * `[theme]` will be replaced by the name of the currently active theme (plus `.theme` suffix) or by
          * `default.theme` as a fallback. The `provide` method of the returned object can be called with a list of
          * files for which a themed version should be found. The most specific location is searched first and the
          * default theme last.
          *
          * @param {String} artifactPathPattern
          *    a path pattern for search within the artifact directory itself, based on the current theme
          * @param {String} [themePathPattern]
          *    a path pattern for search within the current theme
          * @param {String[]} [fallbackPathPatterns]
          *    fallback paths, used if all else fails.
          *    Possibly without placeholders, e.g. for loading the default theme itself.
          *
          * @returns {{provide: Function}}
          *    an object with a provide method
          */ThemeManager.prototype.urlProvider = function (artifactPathPattern, themePathPattern, fallbackPathPatterns) {var self = this;return { provide: function provide(fileNames) {var searchPrefixes = [];var themeDirectory = self.theme_ + '.theme';if (self.theme_ && self.theme_ !== 'default') {if (artifactPathPattern) {// highest precedence: artifacts with (multiple) embedded theme styles:
                        searchPrefixes.push(artifactPathPattern.replace('[theme]', themeDirectory));}if (themePathPattern) {// second-highest precedence: themes with embedded artifact styles:
                        searchPrefixes.push(themePathPattern.replace('[theme]', themeDirectory));}}(fallbackPathPatterns || []).forEach(function (pattern) {// additional paths, usually for backward compatibility
                     if (self.theme_ !== 'default' || pattern.indexOf('[theme]') === -1) {searchPrefixes.push(pattern.replace('[theme]', themeDirectory));}});if (artifactPathPattern) {// fall back to default theme provided by the artifact
                     searchPrefixes.push(artifactPathPattern.replace('[theme]', 'default.theme'));}var promises = [];fileNames.forEach(function (fileName) {promises.push(findExistingPath(self, searchPrefixes, fileName));});return self.q_.all(promises).then(function (results) {return results.map(function (result, i) {return result !== null ? path.join(result, fileNames[i]) : null;});});} };};} };});

System.registerDynamic("npm:core-js@1.2.6/library/modules/$", [], true, function($__require, exports, module) {
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  var $Object = Object;
  module.exports = {
    create: $Object.create,
    getProto: $Object.getPrototypeOf,
    isEnum: {}.propertyIsEnumerable,
    getDesc: $Object.getOwnPropertyDescriptor,
    setDesc: $Object.defineProperty,
    setDescs: $Object.defineProperties,
    getKeys: $Object.keys,
    getNames: $Object.getOwnPropertyNames,
    getSymbols: $Object.getOwnPropertySymbols,
    each: [].forEach
  };
  global.define = __define;
  return module.exports;
});

System.registerDynamic("npm:core-js@1.2.6/library/fn/object/define-property", ["../../modules/$"], true, function($__require, exports, module) {
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  var $ = $__require('../../modules/$');
  module.exports = function defineProperty(it, key, desc) {
    return $.setDesc(it, key, desc);
  };
  global.define = __define;
  return module.exports;
});

System.registerDynamic("npm:babel-runtime@5.8.34/core-js/object/define-property", ["core-js/library/fn/object/define-property"], true, function($__require, exports, module) {
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  module.exports = {
    "default": $__require('core-js/library/fn/object/define-property'),
    __esModule: true
  };
  global.define = __define;
  return module.exports;
});

System.registerDynamic("npm:babel-runtime@5.8.34/helpers/define-property", ["../core-js/object/define-property"], true, function($__require, exports, module) {
  "use strict";
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  var _Object$defineProperty = $__require('../core-js/object/define-property')["default"];
  exports["default"] = function(obj, key, value) {
    if (key in obj) {
      _Object$defineProperty(obj, key, {
        value: value,
        enumerable: true,
        configurable: true,
        writable: true
      });
    } else {
      obj[key] = value;
    }
    return obj;
  };
  exports.__esModule = true;
  global.define = __define;
  return module.exports;
});

System.registerDynamic("npm:core-js@1.2.6/library/modules/$.defined", [], true, function($__require, exports, module) {
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  module.exports = function(it) {
    if (it == undefined)
      throw TypeError("Can't call method on  " + it);
    return it;
  };
  global.define = __define;
  return module.exports;
});

System.registerDynamic("npm:core-js@1.2.6/library/modules/$.to-object", ["./$.defined"], true, function($__require, exports, module) {
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  var defined = $__require('./$.defined');
  module.exports = function(it) {
    return Object(defined(it));
  };
  global.define = __define;
  return module.exports;
});

System.registerDynamic("npm:core-js@1.2.6/library/modules/es6.object.keys", ["./$.to-object", "./$.object-sap"], true, function($__require, exports, module) {
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  var toObject = $__require('./$.to-object');
  $__require('./$.object-sap')('keys', function($keys) {
    return function keys(it) {
      return $keys(toObject(it));
    };
  });
  global.define = __define;
  return module.exports;
});

System.registerDynamic("npm:core-js@1.2.6/library/fn/object/keys", ["../../modules/es6.object.keys", "../../modules/$.core"], true, function($__require, exports, module) {
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  $__require('../../modules/es6.object.keys');
  module.exports = $__require('../../modules/$.core').Object.keys;
  global.define = __define;
  return module.exports;
});

System.registerDynamic("npm:babel-runtime@5.8.34/core-js/object/keys", ["core-js/library/fn/object/keys"], true, function($__require, exports, module) {
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  module.exports = {
    "default": $__require('core-js/library/fn/object/keys'),
    __esModule: true
  };
  global.define = __define;
  return module.exports;
});

System.register('lib/widget_adapters/plain_adapter.js', [], function (_export) {/**
                                                                                 * Copyright 2015 aixigo AG
                                                                                 * Released under the MIT license.
                                                                                 * http://laxarjs.org/license
                                                                                 */'use strict';var 
   widgetModules, 

   technology;









   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   /**
    *
    * @param {Object}      environment
    * @param {HTMLElement} environment.anchorElement
    * @param {Object}      environment.context
    * @param {EventBus}    environment.context.eventBus
    * @param {Object}      environment.context.features
    * @param {Function}    environment.context.id
    * @param {Object}      environment.context.widget
    * @param {String}      environment.context.widget.area
    * @param {String}      environment.context.widget.id
    * @param {String}      environment.context.widget.path
    * @param {Object}      environment.specification
    * @param {Object}      services
    *
    * @return {Object}
    */_export('bootstrap', bootstrap);



















































































   ///////////////////////////////////////////////////////////////////////////////////////////////////////////
   _export('create', create);_export('applyViewChanges', applyViewChanges); ///////////////////////////////////////////////////////////////////////////////////////////////////////////
   function bootstrap(modules) {modules.forEach(function (module) {widgetModules[module.name] = module;});}function create(environment, services) {var exports = { createController: createController, domAttachTo: domAttachTo, domDetach: domDetach, destroy: function destroy() {} };var widgetName = environment.specification.name;var moduleName = widgetName.replace(/^./, function (_) {return _.toLowerCase();});var context = environment.context;var controller = null; ////////////////////////////////////////////////////////////////////////////////////////////////////////
      function createController(config) {var module = widgetModules[moduleName];var injector = createInjector();var injections = (module.injections || []).map(function (injection) {return injector.get(injection);});config.onBeforeControllerCreation(environment, injector.get());controller = module.create.apply(module, injections);} ////////////////////////////////////////////////////////////////////////////////////////////////////////
      function domAttachTo(areaElement, htmlTemplate) {if (htmlTemplate === null) {return;}environment.anchorElement.innerHTML = htmlTemplate;areaElement.appendChild(environment.anchorElement);controller.renderTo(environment.anchorElement);} ////////////////////////////////////////////////////////////////////////////////////////////////////////
      function domDetach() {var parent = environment.anchorElement.parentNode;if (parent) {parent.removeChild(environment.anchorElement);}} ////////////////////////////////////////////////////////////////////////////////////////////////////////
      function createInjector() {var map = { axContext: context, axEventBus: context.eventBus, axFeatures: context.features || {} }; /////////////////////////////////////////////////////////////////////////////////////////////////////
         return { get: function get(name) {if (arguments.length === 0) {return map;}if (name in map) {return map[name];}if (name in services) {return services[name];}throw new Error('Unknown dependency "' + name + '".');} };} ////////////////////////////////////////////////////////////////////////////////////////////////////////
      return exports;}function applyViewChanges() {// no-op
   }return { setters: [], execute: function () {widgetModules = {};technology = 'plain';_export('technology', technology);} };});

System.register('lib/utilities/assert.js', [], function (_export) {/**
                                                                    * Copyright 2015 aixigo AG
                                                                    * Released under the MIT license.
                                                                    * http://laxarjs.org/license
                                                                    */
   /**
    * The *assert* module provides some simple assertion methods for type checks, truthyness tests and guards
    * invalid code paths.
    *
    * When requiring `laxar`, it is available as `laxar.assert`.
    *
    * @module assert
    */


   /**
    * Constructor for an Assertion.
    *
    * @param {*} subject
    *    the object assertions are made for
    * @param {String} [optionalDetails]
    *    details that should be printed in case no specific details are given for an assertion method
    *
    * @constructor
    * @private
    */'use strict';var 






























































































   TYPE_TO_CONSTRUCTOR, 
















   FUNCTION_NAME_MATCHER, 

































































   codeIsUnreachable, 
   state;function Assertion(subject, optionalDetails) {this.subject_ = subject;this.details_ = optionalDetails || null;} ///////////////////////////////////////////////////////////////////////////////////////////////////////////
   /**
    * Throws an error if the subject is `null` or `undefined`.
    *
    * @param {String} [optionalDetails]
    *    details to append to the error message
    *
    * @return {Assertion}
    *    this instance
    */ ///////////////////////////////////////////////////////////////////////////////////////////////////////////
   function fail(message, optionalDetails) {if (optionalDetails) {message += ' Details: ' + (typeof optionalDetails === 'object' ? JSON.stringify(optionalDetails) : optionalDetails);}throw new Error('Assertion error: ' + message);} ///////////////////////////////////////////////////////////////////////////////////////////////////////////
   function checkType(subject, type) {if (typeof subject === 'object') {return subject instanceof type;}var actualType = TYPE_TO_CONSTRUCTOR[typeof subject];return actualType === type;} ///////////////////////////////////////////////////////////////////////////////////////////////////////////
   function functionName(func) {var match = FUNCTION_NAME_MATCHER.exec(func.toString().trim());return match[1].length ? match[1] : 'n/a';} ///////////////////////////////////////////////////////////////////////////////////////////////////////////
   /**
    * Creates and returns a new `Assertion` instance for the given `subject`.
    *
    * **Note**: this function is no member of the module, but the module itself. Thus when using `assert` via
    * laxar, `assert` is will be no simple object, but this function having the other functions as
    * properties.
    *
    * Example:
    * ```js
    * define( [ 'laxar' ], function( ax ) {
    *    ax.assert( ax.assert ).hasType( Function );
    *    ax.assert.state( typeof ax.assert.codeIsUnreachable === 'function' );
    * } );
    * ```
    *
    * @param {*} subject
    *    the object assertions are made for
    * @param {String} [optionalDetails]
    *    details that should be printed in case no specific details are given when calling an assertion method
    *
    * @return {Assertion}
    *    the assertion instance
    */function assert(subject, optionalDetails) {return new Assertion(subject, optionalDetails);} ///////////////////////////////////////////////////////////////////////////////////////////////////////////
   /**
    * Marks a code path as erroneous by throwing an error when reached.
    *
    * @param {String} [optionalDetails]
    *    details to append to the error message
    */return { setters: [], execute: function () {Assertion.prototype.isNotNull = function isNotNull(optionalDetails) {if (typeof this.subject_ === 'undefined' || this.subject_ === null) {fail('Expected value to be defined and not null.', optionalDetails || this.details_);}return this;}; ///////////////////////////////////////////////////////////////////////////////////////////////////////////
         /**
          * Throws an error if the subject is not of the given type. No error is thrown for `null` or `undefined`.
          *
          * @param {Function} type
          *    the expected type of the subject
          * @param {String} [optionalDetails]
          *    details to append to the error message
          *
          * @return {Assertion}
          *    this instance
          */Assertion.prototype.hasType = function hasType(type, optionalDetails) {if (typeof this.subject_ === 'undefined' || this.subject_ === null) {return this;}if (typeof type !== 'function') {fail('type must be a constructor function. Got ' + typeof type + '.');}if (!checkType(this.subject_, type)) {var actualString = functionName(this.subject_.constructor);var expectedString = functionName(type);fail('Expected value to be an instance of "' + expectedString + '" but was "' + actualString + '".', optionalDetails || this.details_);}return this;}; ///////////////////////////////////////////////////////////////////////////////////////////////////////////
         /**
          * Throws an error if the subject is no object or the given property is not defined on it.
          *
          * @param {String} property
          *    the property that is expected for the subject
          * @param {String} [optionalDetails]
          *    details to append to the error message
          *
          * @return {Assertion}
          *    this instance
          */Assertion.prototype.hasProperty = function hasProperty(property, optionalDetails) {if (typeof this.subject_ !== 'object') {fail('value must be an object. Got ' + typeof this.subject_ + '.');}if (!(property in this.subject_)) {fail('value is missing mandatory property "' + property + '".', optionalDetails || this.details_);}return this;};TYPE_TO_CONSTRUCTOR = { 'string': String, 'number': Number, 'boolean': Boolean, 'function': Function };FUNCTION_NAME_MATCHER = /^function ([^\(]*)\(/i;assert.codeIsUnreachable = function codeIsUnreachable(optionalDetails) {fail('Code should be unreachable!', optionalDetails);}; ///////////////////////////////////////////////////////////////////////////////////////////////////////////
         /**
          * Throws an error if the given expression is falsy.
          *
          * @param {*} expression
          *    the expression to test for truthyness
          * @param {String} [optionalDetails]
          *    details to append to the error message
          */assert.state = function state(expression, optionalDetails) {if (!expression) {fail('State does not hold.', optionalDetails);}}; ///////////////////////////////////////////////////////////////////////////////////////////////////////////
         _export('default', assert);codeIsUnreachable = assert.codeIsUnreachable;_export('codeIsUnreachable', codeIsUnreachable);state = assert.state;_export('state', state);} };});

System.register('lib/utilities/configuration.js', ['./object'], function (_export) {/**
                                                                                     * Copyright 2015 aixigo AG
                                                                                     * Released under the MIT license.
                                                                                     * http://laxarjs.org/license
                                                                                     */
  /**
   * The *configuration* module provides convenient readonly access to all values configured for this application
   * under `window.laxar`. Most probably this configuration takes place in the JavaScript file
   * `application/application.js` under your project's root directory.
   *
   * When requiring `laxar`, it is available as `laxar.configuration`.
   *
   * @module configuration
   */


  /*jshint evil:true*/
  /**
   * Obtain global object in strict mode: http://stackoverflow.com/questions/3277182/
   *
   * private tag needed for api doc generation. Otherwise the module description becomes messed up.
   *
   * @private
   */'use strict';var path, 
  global;_export('get', get);

  ///////////////////////////////////////////////////////////////////////////////////////////////////////////

  /**
   * Returns the configured value for the specified attribute path or `undefined` in case it wasn't
   * configured. If a default value was passed as second argument this is returned instead of `undefined`.
   *
   * Examples:
   * ```js
   * define( [ 'laxar' ], function( ax ) {
   *    ax.configuration.get( 'logging.threshold' ); // -> 'INFO'
   *    ax.configuration.get( 'iDontExist' ); // -> undefined
   *    ax.configuration.get( 'iDontExist', 42 ); // -> 42
   * } );
   * ```
   *
   * @param {String} key
   *    a  path (using `.` as separator) to the property in the configuration object
   * @param {*} [optionalDefault]
   *    the value to return if no value was set for `key`
   *
   * @return {*}
   *    either the configured value, `undefined` or `optionalDefault`
   */
  function get(key, optionalDefault) {
    return path(global.laxar, key, optionalDefault);}return { setters: [function (_object) {path = _object.path;}], execute: function () {global = new Function('return this')();} };});

System.register('lib/logging/console_channel.js', [], function (_export) {/**
                                                                           * Copyright 2015 aixigo AG
                                                                           * Released under the MIT license.
                                                                           * http://laxarjs.org/license
                                                                           */'use strict';var 
   winConsole;





















   ///////////////////////////////////////////////////////////////////////////////////////////////////////////
   _export('log', log);function log(messageObject) {if (!window.console) {return;}winConsole = window.console;var logMethod = messageObject.level.toLowerCase();if (!(logMethod in winConsole) || logMethod === 'trace') {// In console objects trace doesn't define a valid log level but is used to print stack traces. We
         // thus need to change it something different.
         logMethod = 'log';}if (!(logMethod in winConsole)) {return;}var callArgs = [messageObject.level + ': '];callArgs = callArgs.concat(mergeTextAndReplacements(messageObject.text, messageObject.replacements));callArgs.push('(@ ' + messageObject.sourceInfo.file + ':' + messageObject.sourceInfo.line + ')');callConsole(logMethod, callArgs);}function callConsole(method, messageParts) {// MSIE8 does not support console.log.apply( ... )
      // The following call is equivalent to: console[ method ].apply( console, args );
      Function.apply.apply(winConsole[method], [winConsole, messageParts]);}


   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function mergeTextAndReplacements(text, replacements) {
      var pos = 0;
      var character;
      var buffer = '';
      var parts = [];

      while (pos < text.length) {
         character = text.charAt(pos);

         switch (character) {
            case '\\':
               ++pos;
               if (pos === text.length) {
                  throw new Error('Unterminated string: "' + text + '"');}


               buffer += text.charAt(pos);
               break;

            case '[':
               parts.push(buffer);
               buffer = '';

               var end = text.indexOf(']', pos);
               if (end === -1) {
                  throw new Error('Unterminated replacement at character ' + pos + ': "' + text + '"');}


               var replacementIndex = parseInt(text.substring(pos + 1, end), 10);

               parts.push(replacements[replacementIndex]);
               pos = end;

               break;

            default:
               buffer += character;
               break;}


         ++pos;}


      if (buffer.length > 0) {
         parts.push(buffer);}


      return parts;}return { setters: [], execute: function () {winConsole = undefined;} };});

System.registerDynamic("npm:core-js@1.2.6/library/modules/es6.object.is-frozen", ["./$.is-object", "./$.object-sap"], true, function($__require, exports, module) {
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  var isObject = $__require('./$.is-object');
  $__require('./$.object-sap')('isFrozen', function($isFrozen) {
    return function isFrozen(it) {
      return isObject(it) ? $isFrozen ? $isFrozen(it) : false : true;
    };
  });
  global.define = __define;
  return module.exports;
});

System.registerDynamic("npm:core-js@1.2.6/library/fn/object/is-frozen", ["../../modules/es6.object.is-frozen", "../../modules/$.core"], true, function($__require, exports, module) {
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  $__require('../../modules/es6.object.is-frozen');
  module.exports = $__require('../../modules/$.core').Object.isFrozen;
  global.define = __define;
  return module.exports;
});

System.registerDynamic("npm:babel-runtime@5.8.34/core-js/object/is-frozen", ["core-js/library/fn/object/is-frozen"], true, function($__require, exports, module) {
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  module.exports = {
    "default": $__require('core-js/library/fn/object/is-frozen'),
    __esModule: true
  };
  global.define = __define;
  return module.exports;
});

System.registerDynamic("npm:core-js@1.2.6/library/modules/$.is-object", [], true, function($__require, exports, module) {
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  module.exports = function(it) {
    return typeof it === 'object' ? it !== null : typeof it === 'function';
  };
  global.define = __define;
  return module.exports;
});

System.registerDynamic("npm:core-js@1.2.6/library/modules/$.global", [], true, function($__require, exports, module) {
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  var global = module.exports = typeof window != 'undefined' && window.Math == Math ? window : typeof self != 'undefined' && self.Math == Math ? self : Function('return this')();
  if (typeof __g == 'number')
    __g = global;
  global.define = __define;
  return module.exports;
});

System.registerDynamic("npm:core-js@1.2.6/library/modules/$.a-function", [], true, function($__require, exports, module) {
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  module.exports = function(it) {
    if (typeof it != 'function')
      throw TypeError(it + ' is not a function!');
    return it;
  };
  global.define = __define;
  return module.exports;
});

System.registerDynamic("npm:core-js@1.2.6/library/modules/$.ctx", ["./$.a-function"], true, function($__require, exports, module) {
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  var aFunction = $__require('./$.a-function');
  module.exports = function(fn, that, length) {
    aFunction(fn);
    if (that === undefined)
      return fn;
    switch (length) {
      case 1:
        return function(a) {
          return fn.call(that, a);
        };
      case 2:
        return function(a, b) {
          return fn.call(that, a, b);
        };
      case 3:
        return function(a, b, c) {
          return fn.call(that, a, b, c);
        };
    }
    return function() {
      return fn.apply(that, arguments);
    };
  };
  global.define = __define;
  return module.exports;
});

System.registerDynamic("npm:core-js@1.2.6/library/modules/$.export", ["./$.global", "./$.core", "./$.ctx"], true, function($__require, exports, module) {
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  var global = $__require('./$.global'),
      core = $__require('./$.core'),
      ctx = $__require('./$.ctx'),
      PROTOTYPE = 'prototype';
  var $export = function(type, name, source) {
    var IS_FORCED = type & $export.F,
        IS_GLOBAL = type & $export.G,
        IS_STATIC = type & $export.S,
        IS_PROTO = type & $export.P,
        IS_BIND = type & $export.B,
        IS_WRAP = type & $export.W,
        exports = IS_GLOBAL ? core : core[name] || (core[name] = {}),
        target = IS_GLOBAL ? global : IS_STATIC ? global[name] : (global[name] || {})[PROTOTYPE],
        key,
        own,
        out;
    if (IS_GLOBAL)
      source = name;
    for (key in source) {
      own = !IS_FORCED && target && key in target;
      if (own && key in exports)
        continue;
      out = own ? target[key] : source[key];
      exports[key] = IS_GLOBAL && typeof target[key] != 'function' ? source[key] : IS_BIND && own ? ctx(out, global) : IS_WRAP && target[key] == out ? (function(C) {
        var F = function(param) {
          return this instanceof C ? new C(param) : C(param);
        };
        F[PROTOTYPE] = C[PROTOTYPE];
        return F;
      })(out) : IS_PROTO && typeof out == 'function' ? ctx(Function.call, out) : out;
      if (IS_PROTO)
        (exports[PROTOTYPE] || (exports[PROTOTYPE] = {}))[key] = out;
    }
  };
  $export.F = 1;
  $export.G = 2;
  $export.S = 4;
  $export.P = 8;
  $export.B = 16;
  $export.W = 32;
  module.exports = $export;
  global.define = __define;
  return module.exports;
});

System.registerDynamic("npm:core-js@1.2.6/library/modules/$.fails", [], true, function($__require, exports, module) {
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  module.exports = function(exec) {
    try {
      return !!exec();
    } catch (e) {
      return true;
    }
  };
  global.define = __define;
  return module.exports;
});

System.registerDynamic("npm:core-js@1.2.6/library/modules/$.object-sap", ["./$.export", "./$.core", "./$.fails"], true, function($__require, exports, module) {
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  var $export = $__require('./$.export'),
      core = $__require('./$.core'),
      fails = $__require('./$.fails');
  module.exports = function(KEY, exec) {
    var fn = (core.Object || {})[KEY] || Object[KEY],
        exp = {};
    exp[KEY] = exec(fn);
    $export($export.S + $export.F * fails(function() {
      fn(1);
    }), 'Object', exp);
  };
  global.define = __define;
  return module.exports;
});

System.registerDynamic("npm:core-js@1.2.6/library/modules/es6.object.freeze", ["./$.is-object", "./$.object-sap"], true, function($__require, exports, module) {
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  var isObject = $__require('./$.is-object');
  $__require('./$.object-sap')('freeze', function($freeze) {
    return function freeze(it) {
      return $freeze && isObject(it) ? $freeze(it) : it;
    };
  });
  global.define = __define;
  return module.exports;
});

System.registerDynamic("npm:core-js@1.2.6/library/modules/$.core", [], true, function($__require, exports, module) {
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  var core = module.exports = {version: '1.2.6'};
  if (typeof __e == 'number')
    __e = core;
  global.define = __define;
  return module.exports;
});

System.registerDynamic("npm:core-js@1.2.6/library/fn/object/freeze", ["../../modules/es6.object.freeze", "../../modules/$.core"], true, function($__require, exports, module) {
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  $__require('../../modules/es6.object.freeze');
  module.exports = $__require('../../modules/$.core').Object.freeze;
  global.define = __define;
  return module.exports;
});

System.registerDynamic("npm:babel-runtime@5.8.34/core-js/object/freeze", ["core-js/library/fn/object/freeze"], true, function($__require, exports, module) {
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  module.exports = {
    "default": $__require('core-js/library/fn/object/freeze'),
    __esModule: true
  };
  global.define = __define;
  return module.exports;
});

System.register('lib/utilities/object.js', ['npm:babel-runtime@5.8.34/core-js/object/is-frozen', 'npm:babel-runtime@5.8.34/core-js/object/freeze'], function (_export) {var _Object$isFrozen, _Object$freeze, 











   slice, 


































































































































































































































































































   hasOwnProp; /**
                * Copies the properties from a set of source objects over to the target object. Properties of sources
                * later in the arguments list overwrite existing properties in the target and earlier source objects.
                *
                * @param {Object} target
                *    the target object to modify
                * @param {...Object} sources
                *    the source objects to copy over
                *
                * @return {Object}
                *    the modified target object
                *
                * @type {Function}
                */function extend(target, sources) {return applyForAll(slice.call(arguments, 0), function (target, source, key) {target[key] = source[key];});} ///////////////////////////////////////////////////////////////////////////////////////////////////////////
   /**
    * Returns all properties from `obj` with missing properties completed from `defaults`. If `obj` is `null`
    * or `undefined`, an empty object is automatically created. `obj` and `defaults` are not modified by this
    * function. This is very useful for optional map arguments, resembling some kind of configuration.
    *
    * Example:
    * ```js
    * object.options( { validate: true }, {
    *    validate: false,
    *    highlight: true
    * } );
    * // =>
    * // {
    * //    validate: true,
    * //    highlight: true
    * // }
    * ```
    *
    * @param {Object} obj
    *    the options object to use as source, may be `null` or `undefined`
    * @param {Object} defaults
    *    the defaults to take missing properties from
    *
    * @return {Object}
    *    the completed options object
    */function options(obj, defaults) {return extend({}, defaults, obj);} ///////////////////////////////////////////////////////////////////////////////////////////////////////////
   /**
    * Iterates over the keys of an object and calls the given iterator function for each entry. On each
    * iteration the iterator function is passed the `value`, the `key` and the complete `object` as
    * arguments. If `object` is an array, the native `Array.prototype.forEach` function is called and hence
    * the keys are the numeric indices of the array.
    *
    * @param {Object} object
    *    the object to run the iterator function on
    * @param {Function} iteratorFunction
    *    the iterator function to run on each key-value pair
    */function forEach(object, iteratorFunction) {if (Array.isArray(object)) {object.forEach(iteratorFunction);return;}for (var key in object) {if (hasOwnProperty(object, key)) {iteratorFunction(object[key], key, object);}}} ///////////////////////////////////////////////////////////////////////////////////////////////////////////
   /**
    * Finds a property in a nested object structure by a given path. A path is a string of keys, separated
    * by a dot from each other, used to traverse that object and find the value of interest. An additional
    * default is returned, if otherwise the value would yield `undefined`.
    *
    * Example.
    * ```js
    * object.path( { one: { two: 3 } }, 'one.two' ); // => 3
    * object.path( { one: { two: 3 } }, 'one.three' ); // => undefined
    * object.path( { one: { two: 3 } }, 'one.three', 42 ); // => 42
    *
    * ```
    *
    * @param {Object} obj
    *    the object to traverse
    * @param {String} thePath
    *    the path to search for
    * @param {*} [optionalDefault]
    *    the value to return instead of `undefined` if nothing is found
    *
    * @return {*}
    *    the value at the given path
    */function path(obj, thePath, optionalDefault) {var defaultResult = arguments.length === 3 ? optionalDefault : undefined;var pathArr = thePath.split('.');var node = obj;var key = pathArr.shift();while (key) {if (node && typeof node === 'object' && hasOwnProperty(node, key)) {node = node[key];key = pathArr.shift();} else {return defaultResult;}}return node;} ///////////////////////////////////////////////////////////////////////////////////////////////////////////
   /**
    * Sets a property in a nested object structure at a given path to a given value. A path is a string of
    * keys, separated by a dot from each other, used to traverse that object and find the place where the
    * value should be set. Any missing subtrees along the path are created.
    *
    * Example:
    * ```js
    * object.setPath( {}, 'name.first', 'Peter' ); // => { name: { first: 'Peter' } }
    * object.setPath( {}, 'pets.1', 'Hamster' ); // => { pets: [ null, 'Hamster' ] }
    * ```
    *
    * @param {Object} obj
    *    the object to modify
    * @param {String} path
    *    the path to set a value at
    * @param {*} value
    *    the value to set at the given path
    *
    * @return {*}
    *    the full object (for chaining)
    */function setPath(obj, path, value) {var node = obj;var pathArr = path.split('.');var last = pathArr.pop();pathArr.forEach(function (pathFragment, index) {if (!node[pathFragment] || typeof node[pathFragment] !== 'object') {var lookAheadFragment = pathArr[index + 1] || last;if (lookAheadFragment.match(/^[0-9]+$/)) {node[pathFragment] = [];fillArrayWithNull(node[pathFragment], parseInt(lookAheadFragment, 10));} else {node[pathFragment] = {};}}node = node[pathFragment];});if (Array.isArray(node) && last > node.length) {fillArrayWithNull(node, last);}node[last] = value;return obj;} ///////////////////////////////////////////////////////////////////////////////////////////////////////////
   /**
    * Returns a deep clone of the given object. Note that the current implementation is intended to be used
    * for simple object literals only. There is no guarantee that cloning objects instantiated via
    * constructor function works and cyclic references will lead to endless recursion.
    *
    * @param {*} object
    *    the object to clone
    *
    * @return {*}
    *    the clone
    */function deepClone(object) {if (!object || typeof object !== 'object') {return object;} // Not using underscore here for performance reasons. Plain for-loops are twice as fast as each and map
      // in all common browsers.
      var result;if (Array.isArray(object)) {result = [];for (var i = 0, length = object.length; i < length; ++i) {result[i] = deepClone(object[i]);}} else {result = {};for (var key in object) {if (hasOwnProperty(object, key)) {result[key] = deepClone(object[key]);}}}return result;} ///////////////////////////////////////////////////////////////////////////////////////////////////////////
   /**
    * Freezes an object, optionally recursively, in any browser capable of freezing objects. In any other
    * browser this method simply returns its first value, i.e. is an identity operation.
    *
    * @param {Object} obj
    *    the object to freeze
    * @param {Boolean} [optionalRecursive]
    *    freezes recursively if `true`. Default is `false`
    *
    * @return {Object}
    *    the input (possibly) frozen
    */function deepFreeze(obj, optionalRecursive) {if (_Object$isFrozen(obj)) {return obj;}if (optionalRecursive) {forEach(obj, function (val, key) {if (typeof val === 'object') {obj[key] = deepFreeze(val, true);}});}return _Object$freeze(obj);} ///////////////////////////////////////////////////////////////////////////////////////////////////////////
   /**
    * Sets all entries of the given array to `null`.
    *
    * @private
    */function fillArrayWithNull(arr, toIndex) {for (var i = arr.length; i < toIndex; ++i) {arr[i] = null;}} ///////////////////////////////////////////////////////////////////////////////////////////////////////////
   /**
    * Takes a list of objects where the first entry is treated as target object and all other entries as
    * source objects. The callback then is called for each property of each source object. Finally target is
    * returned.
    *
    * @private
    */function applyForAll(objects, callback) {var target = objects[0];objects.slice(1).forEach(function (source) {if (source) {for (var key in source) {if (hasOwnProperty(source, key)) {callback(target, source, key);}}}});return target;} ///////////////////////////////////////////////////////////////////////////////////////////////////////////
   /**
    *
    * @private
    */function hasOwnProperty(object, property) {return hasOwnProp.call(object, property);}return { setters: [function (_babelRuntimeCoreJsObjectIsFrozen) {_Object$isFrozen = _babelRuntimeCoreJsObjectIsFrozen['default'];}, function (_babelRuntimeCoreJsObjectFreeze) {_Object$freeze = _babelRuntimeCoreJsObjectFreeze['default'];}], execute: function () {/**
                                                                                                                                                                                                                                                                                                                                                                  * Copyright 2015 aixigo AG
                                                                                                                                                                                                                                                                                                                                                                  * Released under the MIT license.
                                                                                                                                                                                                                                                                                                                                                                  * http://laxarjs.org/license
                                                                                                                                                                                                                                                                                                                                                                  */ /**
                                                                                                                                                                                                                                                                                                                                                                      * Utilities for dealing with objects.
                                                                                                                                                                                                                                                                                                                                                                      *
                                                                                                                                                                                                                                                                                                                                                                      * When requiring `laxar`, it is available as `laxar.object`.
                                                                                                                                                                                                                                                                                                                                                                      *
                                                                                                                                                                                                                                                                                                                                                                      * @module object
                                                                                                                                                                                                                                                                                                                                                                      */'use strict';_export('extend', extend);_export('options', options);_export('forEach', forEach);_export('path', path);_export('setPath', setPath);_export('deepClone', deepClone);_export('deepFreeze', deepFreeze);slice = Array.prototype.slice;hasOwnProp = Object.prototype.hasOwnProperty;} };});

System.register('lib/logging/log.js', ['../utilities/assert', '../utilities/configuration', './console_channel', '../utilities/object'], function (_export) {/**
                                                                                                                                                              * Copyright 2015 aixigo AG
                                                                                                                                                              * Released under the MIT license.
                                                                                                                                                              * http://laxarjs.org/license
                                                                                                                                                              */
   /**
    * An interface for logging purposes. At least for permanent logging this should always be used in favor of
    * `console.log` and friends, as it is cross browser secure and allows attaching multiple channels where
    * messages can be routed to (i.e. to send them to a server process for persistence). If available, messages
    * will be logged to the browser's console using a builtin console channel.
    *
    * When requiring `laxar`, an instance of the `Logger` type is available as `laxar.log`.
    *
    * @module log
    */'use strict';var assert, configuration, consoleChannel, options, forEach, 





   slice, 











   level, 





































































































































































































































































































































   CHROME_AND_IE_STACK_MATCHER, 
   FIRE_FOX_STACK_MATCHER, 
   EMPTY_CALL_INFORMATION; ///////////////////////////////////////////////////////////////////////////////////////////////////////////
   /**
    * Constructor for a logger.
    *
    * @constructor
    * @private
    */function Logger() {this.queueSize_ = 100;this.channels_ = [consoleChannel];this.counter_ = 0;this.messageQueue_ = [];this.threshold_ = 0;this.tags_ = {};this.level = options(configuration.get('logging.levels', {}), level);this.levelToName_ = (function (logger, levels) {var result = {};forEach(levels, function (level, levelName) {logger[levelName.toLowerCase()] = function () {var args = [level].concat(slice.call(arguments, 0));return this.log.apply(this, args);};result[level] = levelName;});return result;})(this, this.level);this.setLogThreshold(configuration.get('logging.threshold', 'INFO'));} ///////////////////////////////////////////////////////////////////////////////////////////////////////////
   /**
    * Creates and returns a new logger instance. Intended for testing purposes only.
    *
    * @return {Logger}
    *    a new logger instance
    */function gatherSourceInformation() {var e = new Error();if (!e.stack) {try {// IE >= 10 only generates a stack, if the error object is really thrown
            throw new Error();} catch (err) {e = err;}if (!e.stack) {
            return EMPTY_CALL_INFORMATION;}}



      var rows = e.stack.split(/[\n]/);
      var interpreterFunction;
      if (rows[0] === 'Error') {
         rows.splice(0, 1);
         interpreterFunction = function chromeStackInterpreter(row) {
            var match = CHROME_AND_IE_STACK_MATCHER.exec(row);
            return { 
               file: match ? match[1] : '?', 
               line: match ? match[2] : -1, 
               char: match ? match[3] : -1 };};} else 



      if (rows[0].indexOf('@') !== -1) {
         interpreterFunction = function fireFoxStackInterpreter(row) {
            var match = FIRE_FOX_STACK_MATCHER.exec(row);
            return { 
               file: match ? match[1] : '?', 
               line: match ? match[2] : -1, 
               char: -1 };};} else 



      {
         return EMPTY_CALL_INFORMATION;}


      for (var i = 0; i < rows.length; ++i) {
         var row = interpreterFunction(rows[i]);
         if (row.file.indexOf('/logging/log.js') === -1) {
            return row;}}



      return EMPTY_CALL_INFORMATION;}


   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   // TODO: change default export to named exports. Need to get rid of the prototype stuff for this
   return { setters: [function (_utilitiesAssert) {assert = _utilitiesAssert['default'];}, function (_utilitiesConfiguration) {configuration = _utilitiesConfiguration;}, function (_console_channel) {consoleChannel = _console_channel.log;}, function (_utilitiesObject) {options = _utilitiesObject.options;forEach = _utilitiesObject.forEach;}], execute: function () {slice = Array.prototype.slice; /**
                                                                                                                                                                                                                                                                                                                                                                                                             * By default available log levels, sorted by increasing log level:
                                                                                                                                                                                                                                                                                                                                                                                                             * - TRACE (level 100)
                                                                                                                                                                                                                                                                                                                                                                                                             * - DEBUG (level 200)
                                                                                                                                                                                                                                                                                                                                                                                                             * - INFO (level 300)
                                                                                                                                                                                                                                                                                                                                                                                                             * - WARN (level 400)
                                                                                                                                                                                                                                                                                                                                                                                                             * - ERROR (level 500)
                                                                                                                                                                                                                                                                                                                                                                                                             * - FATAL (level 600)
                                                                                                                                                                                                                                                                                                                                                                                                             *
                                                                                                                                                                                                                                                                                                                                                                                                             * @type {Object}
                                                                                                                                                                                                                                                                                                                                                                                                             */level = { TRACE: 100, DEBUG: 200, INFO: 300, WARN: 400, ERROR: 500, FATAL: 600 };Logger.prototype.create = function () {return new Logger();}; ///////////////////////////////////////////////////////////////////////////////////////////////////////////
         /**
          * Logs a message. A message may contain placeholders in the form `[#]` where `#` resembles the index
          * within the list of `replacements`. `replacements` are incrementally counted starting at `0`. If the
          * log level is below the configured log threshold, the message is simply discarded.
          *
          * It is recommended not to use this method directly, but instead one of the short cut methods for the
          * according log level.
          *
          * @param {Number} level
          *    the level for this message
          * @param {String} message
          *    the message to log
          * @param {...*} replacements
          *    objects that should replace placeholders within the message
          */Logger.prototype.log = function (level, message, replacements) {if (level < this.threshold_) {return;}var messageObject = { id: this.counter_++, level: this.levelToName_[level], text: message, replacements: slice.call(arguments, 2) || [], time: new Date(), tags: this.gatherTags(), sourceInfo: gatherSourceInformation() };this.channels_.forEach(function (channel) {channel(messageObject);});if (this.messageQueue_.length === this.queueSize_) {this.messageQueue_.shift();}this.messageQueue_.push(messageObject);}; ///////////////////////////////////////////////////////////////////////////////////////////////////////////
         /**
          * Logs a message in log level `TRACE`. See {@link Logger#log} for further information.
          *
          * *Important note*: This method is only available, if no custom log levels were defined via
          * configuration or custom log levels include this method as well.
          *
          * @param {String} message
          *    the message to log
          * @param {...*} replacements
          *    objects that should replace placeholders within the message
          */Logger.prototype.trace = function () {}; ///////////////////////////////////////////////////////////////////////////////////////////////////////////
         /**
          * Logs a message in log level `DEBUG`. See {@link Logger#log} for further information.
          *
          * *Important note*: This method is only available, if no custom log levels were defined via
          * configuration or custom log levels include this method as well.
          *
          * @param {String} message
          *    the message to log
          * @param {...*} replacements
          *    objects that should replace placeholders within the message
          */Logger.prototype.debug = function () {}; ///////////////////////////////////////////////////////////////////////////////////////////////////////////
         /**
          * Logs a message in log level `INFO`. See {@link Logger#log} for further information.
          *
          * *Important note*: This method is only available, if no custom log levels were defined via
          * configuration or custom log levels include this method as well.
          *
          * @param {String} message
          *    the message to log
          * @param {...*} replacements
          *    objects that should replace placeholders within the message
          */Logger.prototype.info = function () {}; ///////////////////////////////////////////////////////////////////////////////////////////////////////////
         /**
          * Logs a message in log level `WARN`. See {@link Logger#log} for further information.
          *
          * *Important note*: This method is only available, if no custom log levels were defined via
          * configuration or custom log levels include this method as well.
          *
          * @param {String} message
          *    the message to log
          * @param {...*} replacements
          *    objects that should replace placeholders within the message
          */Logger.prototype.warn = function () {}; ///////////////////////////////////////////////////////////////////////////////////////////////////////////
         /**
          * Logs a message in log level `ERROR`. See {@link Logger#log} for further information.
          *
          * *Important note*: This method is only available, if no custom log levels were defined via
          * configuration or custom log levels include this method as well.
          *
          * @param {String} message
          *    the message to log
          * @param {...*} replacements
          *    objects that should replace placeholders within the message
          */Logger.prototype.error = function () {}; ///////////////////////////////////////////////////////////////////////////////////////////////////////////
         /**
          * Logs a message in log level `FATAL`. See {@link Logger#log} for further information.
          *
          * *Important note*: This method is only available, if no custom log levels were defined via
          * configuration or custom log levels include this method as well.
          *
          * @param {String} message
          *    the message to log
          * @param {...*} replacements
          *    objects that should replace placeholders within the message
          */Logger.prototype.fatal = function () {}; ///////////////////////////////////////////////////////////////////////////////////////////////////////////
         /**
          * Adds a new channel to forward log messages to. A channel is called synchronously for every log message
          * and can do whatever necessary to handle the message according to its task. Note that blocking or
          * performance critical actions within a channel should always take place asynchronously to prevent from
          * blocking the application. Ideally a web worker is used for heavier background tasks.
          *
          * Each message is an object having the following properties:
          * - `id`: the unique, ascending id of the log message
          * - `level`: the log level of the message in string representation
          * - `text`: the actual message that was logged
          * - `replacements`: the raw list of replacements passed along the message
          * - `time`: JavaScript Date instance when the message was logged
          * - `tags`: A map of all log tags currently set for the logger
          * - `sourceInfo`: if supported, a map containing `file`, `line` and `char` where the logging took place
          *
          * @param {Function} channel
          *    the log channel to add
          */Logger.prototype.addLogChannel = function (channel) {this.channels_.push(channel);this.messageQueue_.forEach(function (entry) {channel(entry);});}; ///////////////////////////////////////////////////////////////////////////////////////////////////////////
         /**
          * Removes a log channel and thus stops sending further messages to it.
          *
          * @param {Function} channel
          *    the log channel to remove
          */Logger.prototype.removeLogChannel = function (channel) {var channelIndex = this.channels_.indexOf(channel);if (channelIndex > -1) {this.channels_.splice(channelIndex, 1);}}; ///////////////////////////////////////////////////////////////////////////////////////////////////////////
         /**
          * Adds a value for a log tag. If a tag is already known, the value is appended to the existing one using a
          * `;` as separator. Note that no formatting of the value takes place and a non-string value will just have
          * its appropriate `toString` method called.
          *
          * Log tags can be used to mark a set of log messages with a value giving further information on the
          * current logging context. For example laxar sets a tag `'INST'` with a unique-like identifier for the
          * current browser client. If then for example log messages are persisted on a server, messages belonging
          * to the same client can be accumulated.
          *
          * @param {String} tag
          *    the id of the tag to add a value for
          * @param {String} value
          *    the value to add
          */Logger.prototype.addTag = function (tag, value) {assert(tag).hasType(String).isNotNull();if (!this.tags_[tag]) {this.tags_[tag] = [value];} else {this.tags_[tag].push(value);}}; ///////////////////////////////////////////////////////////////////////////////////////////////////////////
         /**
          * Sets a value for a log tag. If a tag is already known, the value is overwritten by the given one. Note
          * that no formatting of the value takes place and a non-string value will just have its appropriate
          * `toString` method called. For further information on log tags, see {@link Logger#addTag}.
          *
          * @param {String} tag
          *    the id of the tag to set a value for
          * @param {String} value
          *    the value to set
          */Logger.prototype.setTag = function (tag, value) {assert(tag).hasType(String).isNotNull();this.tags_[tag] = [value];}; ///////////////////////////////////////////////////////////////////////////////////////////////////////////
         /**
          * Removes a log tag. For further information on log tags, see {@link Logger#addTag}.
          *
          * @param {String} tag
          *    the id of the tag to set a value for
          */Logger.prototype.removeTag = function (tag) {assert(tag).hasType(String).isNotNull();delete this.tags_[tag];}; ///////////////////////////////////////////////////////////////////////////////////////////////////////////
         /**
          * Returns a map of all tags. If there are multiple values for the same tag, their values are concatenated
          * using a `;` as separator. For further information on log tags, see {@link Logger#addTag}.
          *
          * @return {Object}
          *    a mapping from tag to its value(s)
          */Logger.prototype.gatherTags = function () {var tags = {};forEach(this.tags_, function (values, tag) {tags[tag] = values.join(';');});return tags;}; ///////////////////////////////////////////////////////////////////////////////////////////////////////////
         /**
          * Sets the threshold for log messages. Log messages with a lower level will be discarded upon logging.
          *
          * @param {String|Number} threshold
          *    the numeric or the string value of the log level to use as threshold
          */Logger.prototype.setLogThreshold = function (threshold) {if (typeof threshold === 'string') {assert.state(threshold.toUpperCase() in this.level, 'Unsupported log threshold "' + threshold + '".');threshold = this.level[threshold.toUpperCase()];}assert(threshold).hasType(Number);this.threshold_ = threshold;}; ///////////////////////////////////////////////////////////////////////////////////////////////////////////
         CHROME_AND_IE_STACK_MATCHER = /\(?([^\( ]+)\:(\d+)\:(\d+)\)?$/;FIRE_FOX_STACK_MATCHER = /@(.+)\:(\d+)$/;EMPTY_CALL_INFORMATION = { file: '?', line: -1, char: -1 };_export('default', new Logger());} };});

System.register('lib/widget_adapters/angular_adapter.js', ['angular', '../utilities/assert', '../logging/log'], function (_export) {/**
                                                                                                                                     * Copyright 2015 aixigo AG
                                                                                                                                     * Released under the MIT license.
                                                                                                                                     * http://laxarjs.org/license
                                                                                                                                     */'use strict';var ng, assert, log, 




   $compile, 
   $controller, 
   $rootScope, 

   controllerNames, 

   technology;























   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   /**
    *
    * @param {Object}      environment
    * @param {HTMLElement} environment.anchorElement
    * @param {Object}      environment.context
    * @param {EventBus}    environment.context.eventBus
    * @param {Object}      environment.context.features
    * @param {Function}    environment.context.id
    * @param {Object}      environment.context.widget
    * @param {String}      environment.context.widget.area
    * @param {String}      environment.context.widget.id
    * @param {String}      environment.context.widget.path
    * @param {Object}      environment.specification
    * @param {Object}      services
    *
    * @return {Object}
    */_export('bootstrap', bootstrap);






















































































   ///////////////////////////////////////////////////////////////////////////////////////////////////////////
   _export('create', create);




   ///////////////////////////////////////////////////////////////////////////////////////////////////////////
   _export('applyViewChanges', applyViewChanges); ///////////////////////////////////////////////////////////////////////////////////////////////////////////
   function bootstrap(widgetModules) {var dependencies = (widgetModules || []).map(function (module) {// for lookup, use a normalized module name that can also be derived from the widget.json name:
         var moduleKey = normalize(module.name);controllerNames[moduleKey] = capitalize(module.name) + 'Controller'; // add an additional lookup entry for deprecated "my.category.MyWidget" style module names:
         supportPreviousNaming(module.name);return module.name;});return ng.module('axAngularWidgetAdapter', dependencies).run(['$compile', '$controller', '$rootScope', function (_$compile_, _$controller_, _$rootScope_) {$controller = _$controller_;$compile = _$compile_;$rootScope = _$rootScope_;}]);}function create(environment, services) {// services are not relevant for now, since all LaxarJS services are already available via AngularJS DI.
      var exports = { createController: createController, domAttachTo: domAttachTo, domDetach: domDetach, destroy: destroy };var context = environment.context;var scope_;var injections_; ////////////////////////////////////////////////////////////////////////////////////////////////////////
      function createController(config) {var moduleKey = normalize(environment.specification.name);var controllerName = controllerNames[moduleKey];injections_ = { axContext: context, axEventBus: context.eventBus, axFeatures: context.features || {} };Object.defineProperty(injections_, '$scope', { enumerable: true, get: function get() {if (!scope_) {scope_ = $rootScope.$new();ng.extend(scope_, context);}return scope_;} });config.onBeforeControllerCreation(environment, injections_);$controller(controllerName, injections_);} ////////////////////////////////////////////////////////////////////////////////////////////////////////
      /**
       * Synchronously attach the widget DOM to the given area.
       *
       * @param {HTMLElement} areaElement
       *    The widget area to attach this widget to.
       * @param {String} templateHtml
       *
       */function domAttachTo(areaElement, templateHtml) {if (templateHtml === null) {return;}var element = ng.element(environment.anchorElement);element.html(templateHtml);areaElement.appendChild(environment.anchorElement);$compile(environment.anchorElement)(injections_.$scope);templateHtml = null;} ////////////////////////////////////////////////////////////////////////////////////////////////////////
      function domDetach() {var parent = environment.anchorElement.parentNode;if (parent) {parent.removeChild(environment.anchorElement);}} ////////////////////////////////////////////////////////////////////////////////////////////////////////
      function destroy() {if (scope_) {scope_.$destroy();}} ////////////////////////////////////////////////////////////////////////////////////////////////////////
      return exports;}function applyViewChanges() {$rootScope.$apply();}function capitalize(_) {return _.replace(/^./, function (_) {return _.toUpperCase();});} ///////////////////////////////////////////////////////////////////////////////////////////////////////////
   function normalize(moduleName) {return moduleName.replace(/([a-zA-Z0-9])[-_]([a-zA-Z0-9])/g, function ($_, $1, $2) {return $1 + $2.toUpperCase();}).replace(/^[A-Z]/, function ($_) {return $_.toLowerCase();});} ///////////////////////////////////////////////////////////////////////////////////////////////////////////
   function supportPreviousNaming(moduleName) {if (moduleName.indexOf('.') === -1) {
         return;}


      var lookupName = moduleName.replace(/^.*\.([^.]+)$/, function ($_, $1) {
         return $1.replace(/_(.)/g, function ($_, $1) {return $1.toUpperCase();});});

      controllerNames[lookupName] = controllerNames[moduleName] = moduleName + '.Controller';

      log.warn('Deprecation: AngularJS widget module name "' + moduleName + '" violates naming rules! ' + 
      'Module should be named "' + lookupName + '". ' + 
      'Controller should be named "' + capitalize(lookupName) + 'Controller".');}return { setters: [function (_angular) {ng = _angular['default'];}, function (_utilitiesAssert) {assert = _utilitiesAssert['default'];}, function (_loggingLog) {log = _loggingLog['default'];}], execute: function () {controllerNames = {};technology = 'angular';_export('technology', technology);} };});

System.register('lib/widget_adapters/adapters.js', ['npm:babel-runtime@5.8.34/helpers/define-property', 'npm:babel-runtime@5.8.34/core-js/object/keys', './plain_adapter', './angular_adapter'], function (_export) {var _defineProperty, _Object$keys, plainAdapter, angularAdapter, _adapters, 








   adapters;




   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function getFor(technology) {
      return adapters[technology];}


   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function getSupportedTechnologies() {
      return _Object$keys(adapters);}


   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function addAdapters(additionalAdapters) {
      additionalAdapters.forEach(function (adapter) {
         adapters[adapter.technology] = adapter;});}return { setters: [function (_babelRuntimeHelpersDefineProperty) {_defineProperty = _babelRuntimeHelpersDefineProperty['default'];}, function (_babelRuntimeCoreJsObjectKeys) {_Object$keys = _babelRuntimeCoreJsObjectKeys['default'];}, function (_plain_adapter) {plainAdapter = _plain_adapter;}, function (_angular_adapter) {angularAdapter = _angular_adapter;}], execute: function () {/**
                                                                                                                                                                                                                                                                                                                                                                                                                                                    * Copyright 2015 aixigo AG
                                                                                                                                                                                                                                                                                                                                                                                                                                                    * Released under the MIT license.
                                                                                                                                                                                                                                                                                                                                                                                                                                                    * http://laxarjs.org/license
                                                                                                                                                                                                                                                                                                                                                                                                                                                    */'use strict';_export('getFor', getFor);_export('getSupportedTechnologies', getSupportedTechnologies);_export('addAdapters', addAdapters);adapters = (_adapters = {}, _defineProperty(_adapters, plainAdapter.technology, plainAdapter), _defineProperty(_adapters, angularAdapter.technology, angularAdapter), _adapters);} };});

System.registerDynamic("npm:process@0.11.2/browser", [], true, function($__require, exports, module) {
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  var process = module.exports = {};
  var queue = [];
  var draining = false;
  var currentQueue;
  var queueIndex = -1;
  function cleanUpNextTick() {
    draining = false;
    if (currentQueue.length) {
      queue = currentQueue.concat(queue);
    } else {
      queueIndex = -1;
    }
    if (queue.length) {
      drainQueue();
    }
  }
  function drainQueue() {
    if (draining) {
      return;
    }
    var timeout = setTimeout(cleanUpNextTick);
    draining = true;
    var len = queue.length;
    while (len) {
      currentQueue = queue;
      queue = [];
      while (++queueIndex < len) {
        if (currentQueue) {
          currentQueue[queueIndex].run();
        }
      }
      queueIndex = -1;
      len = queue.length;
    }
    currentQueue = null;
    draining = false;
    clearTimeout(timeout);
  }
  process.nextTick = function(fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
      for (var i = 1; i < arguments.length; i++) {
        args[i - 1] = arguments[i];
      }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
      setTimeout(drainQueue, 0);
    }
  };
  function Item(fun, array) {
    this.fun = fun;
    this.array = array;
  }
  Item.prototype.run = function() {
    this.fun.apply(null, this.array);
  };
  process.title = 'browser';
  process.browser = true;
  process.env = {};
  process.argv = [];
  process.version = '';
  process.versions = {};
  function noop() {}
  process.on = noop;
  process.addListener = noop;
  process.once = noop;
  process.off = noop;
  process.removeListener = noop;
  process.removeAllListeners = noop;
  process.emit = noop;
  process.binding = function(name) {
    throw new Error('process.binding is not supported');
  };
  process.cwd = function() {
    return '/';
  };
  process.chdir = function(dir) {
    throw new Error('process.chdir is not supported');
  };
  process.umask = function() {
    return 0;
  };
  global.define = __define;
  return module.exports;
});

System.registerDynamic("npm:process@0.11.2", ["npm:process@0.11.2/browser"], true, function($__require, exports, module) {
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  module.exports = $__require('npm:process@0.11.2/browser');
  global.define = __define;
  return module.exports;
});

System.registerDynamic("github:jspm/nodelibs-process@0.1.2/index", ["process"], true, function($__require, exports, module) {
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  module.exports = System._nodeRequire ? process : $__require('process');
  global.define = __define;
  return module.exports;
});

System.registerDynamic("github:jspm/nodelibs-process@0.1.2", ["github:jspm/nodelibs-process@0.1.2/index"], true, function($__require, exports, module) {
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  module.exports = $__require('github:jspm/nodelibs-process@0.1.2/index');
  global.define = __define;
  return module.exports;
});

System.registerDynamic("npm:es6-shim@0.34.2/es6-shim", ["process"], true, function($__require, exports, module) {
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  "format cjs";
  (function(process) {
    (function(root, factory) {
      if (typeof define === 'function' && define.amd) {
        define(factory);
      } else if (typeof exports === 'object') {
        module.exports = factory();
      } else {
        root.returnExports = factory();
      }
    }(this, function() {
      'use strict';
      var _apply = Function.call.bind(Function.apply);
      var _call = Function.call.bind(Function.call);
      var isArray = Array.isArray;
      var keys = Object.keys;
      var not = function notThunker(func) {
        return function notThunk() {
          return !_apply(func, this, arguments);
        };
      };
      var throwsError = function(func) {
        try {
          func();
          return false;
        } catch (e) {
          return true;
        }
      };
      var valueOrFalseIfThrows = function valueOrFalseIfThrows(func) {
        try {
          return func();
        } catch (e) {
          return false;
        }
      };
      var isCallableWithoutNew = not(throwsError);
      var arePropertyDescriptorsSupported = function() {
        return !throwsError(function() {
          Object.defineProperty({}, 'x', {get: function() {}});
        });
      };
      var supportsDescriptors = !!Object.defineProperty && arePropertyDescriptorsSupported();
      var functionsHaveNames = (function foo() {}).name === 'foo';
      var _forEach = Function.call.bind(Array.prototype.forEach);
      var _reduce = Function.call.bind(Array.prototype.reduce);
      var _filter = Function.call.bind(Array.prototype.filter);
      var _some = Function.call.bind(Array.prototype.some);
      var defineProperty = function(object, name, value, force) {
        if (!force && name in object) {
          return;
        }
        if (supportsDescriptors) {
          Object.defineProperty(object, name, {
            configurable: true,
            enumerable: false,
            writable: true,
            value: value
          });
        } else {
          object[name] = value;
        }
      };
      var defineProperties = function(object, map, forceOverride) {
        _forEach(keys(map), function(name) {
          var method = map[name];
          defineProperty(object, name, method, !!forceOverride);
        });
      };
      var _toString = Function.call.bind(Object.prototype.toString);
      var isCallable = typeof/abc/ === 'function' ? function IsCallableSlow(x) {
        return typeof x === 'function' && _toString(x) === '[object Function]';
      } : function IsCallableFast(x) {
        return typeof x === 'function';
      };
      var Value = {
        getter: function(object, name, getter) {
          if (!supportsDescriptors) {
            throw new TypeError('getters require true ES5 support');
          }
          Object.defineProperty(object, name, {
            configurable: true,
            enumerable: false,
            get: getter
          });
        },
        proxy: function(originalObject, key, targetObject) {
          if (!supportsDescriptors) {
            throw new TypeError('getters require true ES5 support');
          }
          var originalDescriptor = Object.getOwnPropertyDescriptor(originalObject, key);
          Object.defineProperty(targetObject, key, {
            configurable: originalDescriptor.configurable,
            enumerable: originalDescriptor.enumerable,
            get: function getKey() {
              return originalObject[key];
            },
            set: function setKey(value) {
              originalObject[key] = value;
            }
          });
        },
        redefine: function(object, property, newValue) {
          if (supportsDescriptors) {
            var descriptor = Object.getOwnPropertyDescriptor(object, property);
            descriptor.value = newValue;
            Object.defineProperty(object, property, descriptor);
          } else {
            object[property] = newValue;
          }
        },
        defineByDescriptor: function(object, property, descriptor) {
          if (supportsDescriptors) {
            Object.defineProperty(object, property, descriptor);
          } else if ('value' in descriptor) {
            object[property] = descriptor.value;
          }
        },
        preserveToString: function(target, source) {
          if (source && isCallable(source.toString)) {
            defineProperty(target, 'toString', source.toString.bind(source), true);
          }
        }
      };
      var create = Object.create || function(prototype, properties) {
        var Prototype = function Prototype() {};
        Prototype.prototype = prototype;
        var object = new Prototype();
        if (typeof properties !== 'undefined') {
          keys(properties).forEach(function(key) {
            Value.defineByDescriptor(object, key, properties[key]);
          });
        }
        return object;
      };
      var supportsSubclassing = function(C, f) {
        if (!Object.setPrototypeOf) {
          return false;
        }
        return valueOrFalseIfThrows(function() {
          var Sub = function Subclass(arg) {
            var o = new C(arg);
            Object.setPrototypeOf(o, Subclass.prototype);
            return o;
          };
          Object.setPrototypeOf(Sub, C);
          Sub.prototype = create(C.prototype, {constructor: {value: Sub}});
          return f(Sub);
        });
      };
      var getGlobal = function() {
        if (typeof self !== 'undefined') {
          return self;
        }
        if (typeof window !== 'undefined') {
          return window;
        }
        if (typeof global !== 'undefined') {
          return global;
        }
        throw new Error('unable to locate global object');
      };
      var globals = getGlobal();
      var globalIsFinite = globals.isFinite;
      var _indexOf = Function.call.bind(String.prototype.indexOf);
      var _concat = Function.call.bind(Array.prototype.concat);
      var _sort = Function.call.bind(Array.prototype.sort);
      var _strSlice = Function.call.bind(String.prototype.slice);
      var _push = Function.call.bind(Array.prototype.push);
      var _pushApply = Function.apply.bind(Array.prototype.push);
      var _shift = Function.call.bind(Array.prototype.shift);
      var _max = Math.max;
      var _min = Math.min;
      var _floor = Math.floor;
      var _abs = Math.abs;
      var _log = Math.log;
      var _sqrt = Math.sqrt;
      var _hasOwnProperty = Function.call.bind(Object.prototype.hasOwnProperty);
      var ArrayIterator;
      var noop = function() {};
      var Symbol = globals.Symbol || {};
      var symbolSpecies = Symbol.species || '@@species';
      var numberIsNaN = Number.isNaN || function isNaN(value) {
        return value !== value;
      };
      var numberIsFinite = Number.isFinite || function isFinite(value) {
        return typeof value === 'number' && globalIsFinite(value);
      };
      var isStandardArguments = function isArguments(value) {
        return _toString(value) === '[object Arguments]';
      };
      var isLegacyArguments = function isArguments(value) {
        return value !== null && typeof value === 'object' && typeof value.length === 'number' && value.length >= 0 && _toString(value) !== '[object Array]' && _toString(value.callee) === '[object Function]';
      };
      var isArguments = isStandardArguments(arguments) ? isStandardArguments : isLegacyArguments;
      var Type = {
        primitive: function(x) {
          return x === null || (typeof x !== 'function' && typeof x !== 'object');
        },
        object: function(x) {
          return x !== null && typeof x === 'object';
        },
        string: function(x) {
          return _toString(x) === '[object String]';
        },
        regex: function(x) {
          return _toString(x) === '[object RegExp]';
        },
        symbol: function(x) {
          return typeof globals.Symbol === 'function' && typeof x === 'symbol';
        }
      };
      var overrideNative = function overrideNative(object, property, replacement) {
        var original = object[property];
        defineProperty(object, property, replacement, true);
        Value.preserveToString(object[property], original);
      };
      var hasSymbols = typeof Symbol === 'function' && typeof Symbol['for'] === 'function' && Type.symbol(Symbol());
      var $iterator$ = Type.symbol(Symbol.iterator) ? Symbol.iterator : '_es6-shim iterator_';
      if (globals.Set && typeof new globals.Set()['@@iterator'] === 'function') {
        $iterator$ = '@@iterator';
      }
      if (!globals.Reflect) {
        defineProperty(globals, 'Reflect', {});
      }
      var Reflect = globals.Reflect;
      var $String = String;
      var ES = {
        Call: function Call(F, V) {
          var args = arguments.length > 2 ? arguments[2] : [];
          if (!ES.IsCallable(F)) {
            throw new TypeError(F + ' is not a function');
          }
          return _apply(F, V, args);
        },
        RequireObjectCoercible: function(x, optMessage) {
          if (x == null) {
            throw new TypeError(optMessage || 'Cannot call method on ' + x);
          }
          return x;
        },
        TypeIsObject: function(x) {
          if (x === void 0 || x === null || x === true || x === false) {
            return false;
          }
          return typeof x === 'function' || typeof x === 'object';
        },
        ToObject: function(o, optMessage) {
          return Object(ES.RequireObjectCoercible(o, optMessage));
        },
        IsCallable: isCallable,
        IsConstructor: function(x) {
          return ES.IsCallable(x);
        },
        ToInt32: function(x) {
          return ES.ToNumber(x) >> 0;
        },
        ToUint32: function(x) {
          return ES.ToNumber(x) >>> 0;
        },
        ToNumber: function(value) {
          if (_toString(value) === '[object Symbol]') {
            throw new TypeError('Cannot convert a Symbol value to a number');
          }
          return +value;
        },
        ToInteger: function(value) {
          var number = ES.ToNumber(value);
          if (numberIsNaN(number)) {
            return 0;
          }
          if (number === 0 || !numberIsFinite(number)) {
            return number;
          }
          return (number > 0 ? 1 : -1) * _floor(_abs(number));
        },
        ToLength: function(value) {
          var len = ES.ToInteger(value);
          if (len <= 0) {
            return 0;
          }
          if (len > Number.MAX_SAFE_INTEGER) {
            return Number.MAX_SAFE_INTEGER;
          }
          return len;
        },
        SameValue: function(a, b) {
          if (a === b) {
            if (a === 0) {
              return 1 / a === 1 / b;
            }
            return true;
          }
          return numberIsNaN(a) && numberIsNaN(b);
        },
        SameValueZero: function(a, b) {
          return (a === b) || (numberIsNaN(a) && numberIsNaN(b));
        },
        IsIterable: function(o) {
          return ES.TypeIsObject(o) && (typeof o[$iterator$] !== 'undefined' || isArguments(o));
        },
        GetIterator: function(o) {
          if (isArguments(o)) {
            return new ArrayIterator(o, 'value');
          }
          var itFn = ES.GetMethod(o, $iterator$);
          if (!ES.IsCallable(itFn)) {
            throw new TypeError('value is not an iterable');
          }
          var it = ES.Call(itFn, o);
          if (!ES.TypeIsObject(it)) {
            throw new TypeError('bad iterator');
          }
          return it;
        },
        GetMethod: function(o, p) {
          var func = ES.ToObject(o)[p];
          if (func === void 0 || func === null) {
            return void 0;
          }
          if (!ES.IsCallable(func)) {
            throw new TypeError('Method not callable: ' + p);
          }
          return func;
        },
        IteratorComplete: function(iterResult) {
          return !!(iterResult.done);
        },
        IteratorClose: function(iterator, completionIsThrow) {
          var returnMethod = ES.GetMethod(iterator, 'return');
          if (returnMethod === void 0) {
            return;
          }
          var innerResult,
              innerException;
          try {
            innerResult = ES.Call(returnMethod, iterator);
          } catch (e) {
            innerException = e;
          }
          if (completionIsThrow) {
            return;
          }
          if (innerException) {
            throw innerException;
          }
          if (!ES.TypeIsObject(innerResult)) {
            throw new TypeError("Iterator's return method returned a non-object.");
          }
        },
        IteratorNext: function(it) {
          var result = arguments.length > 1 ? it.next(arguments[1]) : it.next();
          if (!ES.TypeIsObject(result)) {
            throw new TypeError('bad iterator');
          }
          return result;
        },
        IteratorStep: function(it) {
          var result = ES.IteratorNext(it);
          var done = ES.IteratorComplete(result);
          return done ? false : result;
        },
        Construct: function(C, args, newTarget, isES6internal) {
          var target = typeof newTarget === 'undefined' ? C : newTarget;
          if (!isES6internal && Reflect.construct) {
            return Reflect.construct(C, args, target);
          }
          var proto = target.prototype;
          if (!ES.TypeIsObject(proto)) {
            proto = Object.prototype;
          }
          var obj = create(proto);
          var result = ES.Call(C, obj, args);
          return ES.TypeIsObject(result) ? result : obj;
        },
        SpeciesConstructor: function(O, defaultConstructor) {
          var C = O.constructor;
          if (C === void 0) {
            return defaultConstructor;
          }
          if (!ES.TypeIsObject(C)) {
            throw new TypeError('Bad constructor');
          }
          var S = C[symbolSpecies];
          if (S === void 0 || S === null) {
            return defaultConstructor;
          }
          if (!ES.IsConstructor(S)) {
            throw new TypeError('Bad @@species');
          }
          return S;
        },
        CreateHTML: function(string, tag, attribute, value) {
          var S = ES.ToString(string);
          var p1 = '<' + tag;
          if (attribute !== '') {
            var V = ES.ToString(value);
            var escapedV = V.replace(/"/g, '&quot;');
            p1 += ' ' + attribute + '="' + escapedV + '"';
          }
          var p2 = p1 + '>';
          var p3 = p2 + S;
          return p3 + '</' + tag + '>';
        },
        IsRegExp: function IsRegExp(argument) {
          if (!ES.TypeIsObject(argument)) {
            return false;
          }
          var isRegExp = argument[Symbol.match];
          if (typeof isRegExp !== 'undefined') {
            return !!isRegExp;
          }
          return Type.regex(argument);
        },
        ToString: function ToString(string) {
          return $String(string);
        }
      };
      if (supportsDescriptors && hasSymbols) {
        var defineWellKnownSymbol = function defineWellKnownSymbol(name) {
          if (Type.symbol(Symbol[name])) {
            return Symbol[name];
          }
          var sym = Symbol['for']('Symbol.' + name);
          Object.defineProperty(Symbol, name, {
            configurable: false,
            enumerable: false,
            writable: false,
            value: sym
          });
          return sym;
        };
        if (!Type.symbol(Symbol.search)) {
          var symbolSearch = defineWellKnownSymbol('search');
          var originalSearch = String.prototype.search;
          defineProperty(RegExp.prototype, symbolSearch, function search(string) {
            return ES.Call(originalSearch, string, [this]);
          });
          var searchShim = function search(regexp) {
            var O = ES.RequireObjectCoercible(this);
            if (regexp !== null && typeof regexp !== 'undefined') {
              var searcher = ES.GetMethod(regexp, symbolSearch);
              if (typeof searcher !== 'undefined') {
                return ES.Call(searcher, regexp, [O]);
              }
            }
            return ES.Call(originalSearch, O, [ES.ToString(regexp)]);
          };
          overrideNative(String.prototype, 'search', searchShim);
        }
        if (!Type.symbol(Symbol.replace)) {
          var symbolReplace = defineWellKnownSymbol('replace');
          var originalReplace = String.prototype.replace;
          defineProperty(RegExp.prototype, symbolReplace, function replace(string, replaceValue) {
            return ES.Call(originalReplace, string, [this, replaceValue]);
          });
          var replaceShim = function replace(searchValue, replaceValue) {
            var O = ES.RequireObjectCoercible(this);
            if (searchValue !== null && typeof searchValue !== 'undefined') {
              var replacer = ES.GetMethod(searchValue, symbolReplace);
              if (typeof replacer !== 'undefined') {
                return ES.Call(replacer, searchValue, [O, replaceValue]);
              }
            }
            return ES.Call(originalReplace, O, [ES.ToString(searchValue), replaceValue]);
          };
          overrideNative(String.prototype, 'replace', replaceShim);
        }
        if (!Type.symbol(Symbol.split)) {
          var symbolSplit = defineWellKnownSymbol('split');
          var originalSplit = String.prototype.split;
          defineProperty(RegExp.prototype, symbolSplit, function split(string, limit) {
            return ES.Call(originalSplit, string, [this, limit]);
          });
          var splitShim = function split(separator, limit) {
            var O = ES.RequireObjectCoercible(this);
            if (separator !== null && typeof separator !== 'undefined') {
              var splitter = ES.GetMethod(separator, symbolSplit);
              if (typeof splitter !== 'undefined') {
                return ES.Call(splitter, separator, [O, limit]);
              }
            }
            return ES.Call(originalSplit, O, [ES.ToString(separator), limit]);
          };
          overrideNative(String.prototype, 'split', splitShim);
        }
        var symbolMatchExists = Type.symbol(Symbol.match);
        var stringMatchIgnoresSymbolMatch = symbolMatchExists && (function() {
          var o = {};
          o[Symbol.match] = function() {
            return 42;
          };
          return 'a'.match(o) !== 42;
        }());
        if (!symbolMatchExists || stringMatchIgnoresSymbolMatch) {
          var symbolMatch = defineWellKnownSymbol('match');
          var originalMatch = String.prototype.match;
          defineProperty(RegExp.prototype, symbolMatch, function match(string) {
            return ES.Call(originalMatch, string, [this]);
          });
          var matchShim = function match(regexp) {
            var O = ES.RequireObjectCoercible(this);
            if (regexp !== null && typeof regexp !== 'undefined') {
              var matcher = ES.GetMethod(regexp, symbolMatch);
              if (typeof matcher !== 'undefined') {
                return ES.Call(matcher, regexp, [O]);
              }
            }
            return ES.Call(originalMatch, O, [ES.ToString(regexp)]);
          };
          overrideNative(String.prototype, 'match', matchShim);
        }
      }
      var wrapConstructor = function wrapConstructor(original, replacement, keysToSkip) {
        Value.preserveToString(replacement, original);
        if (Object.setPrototypeOf) {
          Object.setPrototypeOf(original, replacement);
        }
        if (supportsDescriptors) {
          _forEach(Object.getOwnPropertyNames(original), function(key) {
            if (key in noop || keysToSkip[key]) {
              return;
            }
            Value.proxy(original, key, replacement);
          });
        } else {
          _forEach(Object.keys(original), function(key) {
            if (key in noop || keysToSkip[key]) {
              return;
            }
            replacement[key] = original[key];
          });
        }
        replacement.prototype = original.prototype;
        Value.redefine(original.prototype, 'constructor', replacement);
      };
      var defaultSpeciesGetter = function() {
        return this;
      };
      var addDefaultSpecies = function(C) {
        if (supportsDescriptors && !_hasOwnProperty(C, symbolSpecies)) {
          Value.getter(C, symbolSpecies, defaultSpeciesGetter);
        }
      };
      var addIterator = function(prototype, impl) {
        var implementation = impl || function iterator() {
          return this;
        };
        defineProperty(prototype, $iterator$, implementation);
        if (!prototype[$iterator$] && Type.symbol($iterator$)) {
          prototype[$iterator$] = implementation;
        }
      };
      var createDataProperty = function createDataProperty(object, name, value) {
        if (supportsDescriptors) {
          Object.defineProperty(object, name, {
            configurable: true,
            enumerable: true,
            writable: true,
            value: value
          });
        } else {
          object[name] = value;
        }
      };
      var createDataPropertyOrThrow = function createDataPropertyOrThrow(object, name, value) {
        createDataProperty(object, name, value);
        if (!ES.SameValue(object[name], value)) {
          throw new TypeError('property is nonconfigurable');
        }
      };
      var emulateES6construct = function(o, defaultNewTarget, defaultProto, slots) {
        if (!ES.TypeIsObject(o)) {
          throw new TypeError('Constructor requires `new`: ' + defaultNewTarget.name);
        }
        var proto = defaultNewTarget.prototype;
        if (!ES.TypeIsObject(proto)) {
          proto = defaultProto;
        }
        var obj = create(proto);
        for (var name in slots) {
          if (_hasOwnProperty(slots, name)) {
            var value = slots[name];
            defineProperty(obj, name, value, true);
          }
        }
        return obj;
      };
      if (String.fromCodePoint && String.fromCodePoint.length !== 1) {
        var originalFromCodePoint = String.fromCodePoint;
        overrideNative(String, 'fromCodePoint', function fromCodePoint(codePoints) {
          return ES.Call(originalFromCodePoint, this, arguments);
        });
      }
      var StringShims = {
        fromCodePoint: function fromCodePoint(codePoints) {
          var result = [];
          var next;
          for (var i = 0,
              length = arguments.length; i < length; i++) {
            next = Number(arguments[i]);
            if (!ES.SameValue(next, ES.ToInteger(next)) || next < 0 || next > 0x10FFFF) {
              throw new RangeError('Invalid code point ' + next);
            }
            if (next < 0x10000) {
              _push(result, String.fromCharCode(next));
            } else {
              next -= 0x10000;
              _push(result, String.fromCharCode((next >> 10) + 0xD800));
              _push(result, String.fromCharCode((next % 0x400) + 0xDC00));
            }
          }
          return result.join('');
        },
        raw: function raw(callSite) {
          var cooked = ES.ToObject(callSite, 'bad callSite');
          var rawString = ES.ToObject(cooked.raw, 'bad raw value');
          var len = rawString.length;
          var literalsegments = ES.ToLength(len);
          if (literalsegments <= 0) {
            return '';
          }
          var stringElements = [];
          var nextIndex = 0;
          var nextKey,
              next,
              nextSeg,
              nextSub;
          while (nextIndex < literalsegments) {
            nextKey = ES.ToString(nextIndex);
            nextSeg = ES.ToString(rawString[nextKey]);
            _push(stringElements, nextSeg);
            if (nextIndex + 1 >= literalsegments) {
              break;
            }
            next = nextIndex + 1 < arguments.length ? arguments[nextIndex + 1] : '';
            nextSub = ES.ToString(next);
            _push(stringElements, nextSub);
            nextIndex += 1;
          }
          return stringElements.join('');
        }
      };
      if (String.raw && String.raw({raw: {
          0: 'x',
          1: 'y',
          length: 2
        }}) !== 'xy') {
        overrideNative(String, 'raw', StringShims.raw);
      }
      defineProperties(String, StringShims);
      var stringRepeat = function repeat(s, times) {
        if (times < 1) {
          return '';
        }
        if (times % 2) {
          return repeat(s, times - 1) + s;
        }
        var half = repeat(s, times / 2);
        return half + half;
      };
      var stringMaxLength = Infinity;
      var StringPrototypeShims = {
        repeat: function repeat(times) {
          var thisStr = ES.ToString(ES.RequireObjectCoercible(this));
          var numTimes = ES.ToInteger(times);
          if (numTimes < 0 || numTimes >= stringMaxLength) {
            throw new RangeError('repeat count must be less than infinity and not overflow maximum string size');
          }
          return stringRepeat(thisStr, numTimes);
        },
        startsWith: function startsWith(searchString) {
          var S = ES.ToString(ES.RequireObjectCoercible(this));
          if (ES.IsRegExp(searchString)) {
            throw new TypeError('Cannot call method "startsWith" with a regex');
          }
          var searchStr = ES.ToString(searchString);
          var position;
          if (arguments.length > 1) {
            position = arguments[1];
          }
          var start = _max(ES.ToInteger(position), 0);
          return _strSlice(S, start, start + searchStr.length) === searchStr;
        },
        endsWith: function endsWith(searchString) {
          var S = ES.ToString(ES.RequireObjectCoercible(this));
          if (ES.IsRegExp(searchString)) {
            throw new TypeError('Cannot call method "endsWith" with a regex');
          }
          var searchStr = ES.ToString(searchString);
          var len = S.length;
          var endPosition;
          if (arguments.length > 1) {
            endPosition = arguments[1];
          }
          var pos = typeof endPosition === 'undefined' ? len : ES.ToInteger(endPosition);
          var end = _min(_max(pos, 0), len);
          return _strSlice(S, end - searchStr.length, end) === searchStr;
        },
        includes: function includes(searchString) {
          if (ES.IsRegExp(searchString)) {
            throw new TypeError('"includes" does not accept a RegExp');
          }
          var searchStr = ES.ToString(searchString);
          var position;
          if (arguments.length > 1) {
            position = arguments[1];
          }
          return _indexOf(this, searchStr, position) !== -1;
        },
        codePointAt: function codePointAt(pos) {
          var thisStr = ES.ToString(ES.RequireObjectCoercible(this));
          var position = ES.ToInteger(pos);
          var length = thisStr.length;
          if (position >= 0 && position < length) {
            var first = thisStr.charCodeAt(position);
            var isEnd = (position + 1 === length);
            if (first < 0xD800 || first > 0xDBFF || isEnd) {
              return first;
            }
            var second = thisStr.charCodeAt(position + 1);
            if (second < 0xDC00 || second > 0xDFFF) {
              return first;
            }
            return ((first - 0xD800) * 1024) + (second - 0xDC00) + 0x10000;
          }
        }
      };
      if (String.prototype.includes && 'a'.includes('a', Infinity) !== false) {
        overrideNative(String.prototype, 'includes', StringPrototypeShims.includes);
      }
      if (String.prototype.startsWith && String.prototype.endsWith) {
        var startsWithRejectsRegex = throwsError(function() {
          '/a/'.startsWith(/a/);
        });
        var startsWithHandlesInfinity = 'abc'.startsWith('a', Infinity) === false;
        if (!startsWithRejectsRegex || !startsWithHandlesInfinity) {
          overrideNative(String.prototype, 'startsWith', StringPrototypeShims.startsWith);
          overrideNative(String.prototype, 'endsWith', StringPrototypeShims.endsWith);
        }
      }
      if (hasSymbols) {
        var startsWithSupportsSymbolMatch = valueOrFalseIfThrows(function() {
          var re = /a/;
          re[Symbol.match] = false;
          return '/a/'.startsWith(re);
        });
        if (!startsWithSupportsSymbolMatch) {
          overrideNative(String.prototype, 'startsWith', StringPrototypeShims.startsWith);
        }
        var endsWithSupportsSymbolMatch = valueOrFalseIfThrows(function() {
          var re = /a/;
          re[Symbol.match] = false;
          return '/a/'.endsWith(re);
        });
        if (!endsWithSupportsSymbolMatch) {
          overrideNative(String.prototype, 'endsWith', StringPrototypeShims.endsWith);
        }
        var includesSupportsSymbolMatch = valueOrFalseIfThrows(function() {
          var re = /a/;
          re[Symbol.match] = false;
          return '/a/'.includes(re);
        });
        if (!includesSupportsSymbolMatch) {
          overrideNative(String.prototype, 'includes', StringPrototypeShims.includes);
        }
      }
      defineProperties(String.prototype, StringPrototypeShims);
      var ws = ['\x09\x0A\x0B\x0C\x0D\x20\xA0\u1680\u180E\u2000\u2001\u2002\u2003', '\u2004\u2005\u2006\u2007\u2008\u2009\u200A\u202F\u205F\u3000\u2028', '\u2029\uFEFF'].join('');
      var trimRegexp = new RegExp('(^[' + ws + ']+)|([' + ws + ']+$)', 'g');
      var trimShim = function trim() {
        return ES.ToString(ES.RequireObjectCoercible(this)).replace(trimRegexp, '');
      };
      var nonWS = ['\u0085', '\u200b', '\ufffe'].join('');
      var nonWSregex = new RegExp('[' + nonWS + ']', 'g');
      var isBadHexRegex = /^[\-+]0x[0-9a-f]+$/i;
      var hasStringTrimBug = nonWS.trim().length !== nonWS.length;
      defineProperty(String.prototype, 'trim', trimShim, hasStringTrimBug);
      var StringIterator = function(s) {
        ES.RequireObjectCoercible(s);
        this._s = ES.ToString(s);
        this._i = 0;
      };
      StringIterator.prototype.next = function() {
        var s = this._s,
            i = this._i;
        if (typeof s === 'undefined' || i >= s.length) {
          this._s = void 0;
          return {
            value: void 0,
            done: true
          };
        }
        var first = s.charCodeAt(i),
            second,
            len;
        if (first < 0xD800 || first > 0xDBFF || (i + 1) === s.length) {
          len = 1;
        } else {
          second = s.charCodeAt(i + 1);
          len = (second < 0xDC00 || second > 0xDFFF) ? 1 : 2;
        }
        this._i = i + len;
        return {
          value: s.substr(i, len),
          done: false
        };
      };
      addIterator(StringIterator.prototype);
      addIterator(String.prototype, function() {
        return new StringIterator(this);
      });
      var ArrayShims = {
        from: function from(items) {
          var C = this;
          var mapFn;
          if (arguments.length > 1) {
            mapFn = arguments[1];
          }
          var mapping,
              T;
          if (typeof mapFn === 'undefined') {
            mapping = false;
          } else {
            if (!ES.IsCallable(mapFn)) {
              throw new TypeError('Array.from: when provided, the second argument must be a function');
            }
            if (arguments.length > 2) {
              T = arguments[2];
            }
            mapping = true;
          }
          var usingIterator = typeof(isArguments(items) || ES.GetMethod(items, $iterator$)) !== 'undefined';
          var length,
              result,
              i;
          if (usingIterator) {
            result = ES.IsConstructor(C) ? Object(new C()) : [];
            var iterator = ES.GetIterator(items);
            var next,
                nextValue;
            i = 0;
            while (true) {
              next = ES.IteratorStep(iterator);
              if (next === false) {
                break;
              }
              nextValue = next.value;
              try {
                if (mapping) {
                  nextValue = typeof T === 'undefined' ? mapFn(nextValue, i) : _call(mapFn, T, nextValue, i);
                }
                result[i] = nextValue;
              } catch (e) {
                ES.IteratorClose(iterator, true);
                throw e;
              }
              i += 1;
            }
            length = i;
          } else {
            var arrayLike = ES.ToObject(items);
            length = ES.ToLength(arrayLike.length);
            result = ES.IsConstructor(C) ? Object(new C(length)) : new Array(length);
            var value;
            for (i = 0; i < length; ++i) {
              value = arrayLike[i];
              if (mapping) {
                value = typeof T === 'undefined' ? mapFn(value, i) : _call(mapFn, T, value, i);
              }
              result[i] = value;
            }
          }
          result.length = length;
          return result;
        },
        of: function of() {
          var len = arguments.length;
          var C = this;
          var A = isArray(C) || !ES.IsCallable(C) ? new Array(len) : ES.Construct(C, [len]);
          for (var k = 0; k < len; ++k) {
            createDataPropertyOrThrow(A, k, arguments[k]);
          }
          A.length = len;
          return A;
        }
      };
      defineProperties(Array, ArrayShims);
      addDefaultSpecies(Array);
      var iteratorResult = function(x) {
        return {
          value: x,
          done: arguments.length === 0
        };
      };
      ArrayIterator = function(array, kind) {
        this.i = 0;
        this.array = array;
        this.kind = kind;
      };
      defineProperties(ArrayIterator.prototype, {next: function() {
          var i = this.i,
              array = this.array;
          if (!(this instanceof ArrayIterator)) {
            throw new TypeError('Not an ArrayIterator');
          }
          if (typeof array !== 'undefined') {
            var len = ES.ToLength(array.length);
            for (; i < len; i++) {
              var kind = this.kind;
              var retval;
              if (kind === 'key') {
                retval = i;
              } else if (kind === 'value') {
                retval = array[i];
              } else if (kind === 'entry') {
                retval = [i, array[i]];
              }
              this.i = i + 1;
              return {
                value: retval,
                done: false
              };
            }
          }
          this.array = void 0;
          return {
            value: void 0,
            done: true
          };
        }});
      addIterator(ArrayIterator.prototype);
      var orderKeys = function orderKeys(a, b) {
        var aNumeric = String(ES.ToInteger(a)) === a;
        var bNumeric = String(ES.ToInteger(b)) === b;
        if (aNumeric && bNumeric) {
          return b - a;
        } else if (aNumeric && !bNumeric) {
          return -1;
        } else if (!aNumeric && bNumeric) {
          return 1;
        } else {
          return a.localeCompare(b);
        }
      };
      var getAllKeys = function getAllKeys(object) {
        var ownKeys = [];
        var keys = [];
        for (var key in object) {
          _push(_hasOwnProperty(object, key) ? ownKeys : keys, key);
        }
        _sort(ownKeys, orderKeys);
        _sort(keys, orderKeys);
        return _concat(ownKeys, keys);
      };
      var ObjectIterator = function(object, kind) {
        defineProperties(this, {
          object: object,
          array: getAllKeys(object),
          kind: kind
        });
      };
      defineProperties(ObjectIterator.prototype, {next: function next() {
          var key;
          var array = this.array;
          if (!(this instanceof ObjectIterator)) {
            throw new TypeError('Not an ObjectIterator');
          }
          while (array.length > 0) {
            key = _shift(array);
            if (!(key in this.object)) {
              continue;
            }
            if (this.kind === 'key') {
              return iteratorResult(key);
            } else if (this.kind === 'value') {
              return iteratorResult(this.object[key]);
            } else {
              return iteratorResult([key, this.object[key]]);
            }
          }
          return iteratorResult();
        }});
      addIterator(ObjectIterator.prototype);
      var arrayOfSupportsSubclassing = Array.of === ArrayShims.of || (function() {
        var Foo = function Foo(len) {
          this.length = len;
        };
        Foo.prototype = [];
        var fooArr = Array.of.apply(Foo, [1, 2]);
        return fooArr instanceof Foo && fooArr.length === 2;
      }());
      if (!arrayOfSupportsSubclassing) {
        overrideNative(Array, 'of', ArrayShims.of);
      }
      var ArrayPrototypeShims = {
        copyWithin: function copyWithin(target, start) {
          var o = ES.ToObject(this);
          var len = ES.ToLength(o.length);
          var relativeTarget = ES.ToInteger(target);
          var relativeStart = ES.ToInteger(start);
          var to = relativeTarget < 0 ? _max(len + relativeTarget, 0) : _min(relativeTarget, len);
          var from = relativeStart < 0 ? _max(len + relativeStart, 0) : _min(relativeStart, len);
          var end;
          if (arguments.length > 2) {
            end = arguments[2];
          }
          var relativeEnd = typeof end === 'undefined' ? len : ES.ToInteger(end);
          var finalItem = relativeEnd < 0 ? _max(len + relativeEnd, 0) : _min(relativeEnd, len);
          var count = _min(finalItem - from, len - to);
          var direction = 1;
          if (from < to && to < (from + count)) {
            direction = -1;
            from += count - 1;
            to += count - 1;
          }
          while (count > 0) {
            if (from in o) {
              o[to] = o[from];
            } else {
              delete o[to];
            }
            from += direction;
            to += direction;
            count -= 1;
          }
          return o;
        },
        fill: function fill(value) {
          var start;
          if (arguments.length > 1) {
            start = arguments[1];
          }
          var end;
          if (arguments.length > 2) {
            end = arguments[2];
          }
          var O = ES.ToObject(this);
          var len = ES.ToLength(O.length);
          start = ES.ToInteger(typeof start === 'undefined' ? 0 : start);
          end = ES.ToInteger(typeof end === 'undefined' ? len : end);
          var relativeStart = start < 0 ? _max(len + start, 0) : _min(start, len);
          var relativeEnd = end < 0 ? len + end : end;
          for (var i = relativeStart; i < len && i < relativeEnd; ++i) {
            O[i] = value;
          }
          return O;
        },
        find: function find(predicate) {
          var list = ES.ToObject(this);
          var length = ES.ToLength(list.length);
          if (!ES.IsCallable(predicate)) {
            throw new TypeError('Array#find: predicate must be a function');
          }
          var thisArg = arguments.length > 1 ? arguments[1] : null;
          for (var i = 0,
              value; i < length; i++) {
            value = list[i];
            if (thisArg) {
              if (_call(predicate, thisArg, value, i, list)) {
                return value;
              }
            } else if (predicate(value, i, list)) {
              return value;
            }
          }
        },
        findIndex: function findIndex(predicate) {
          var list = ES.ToObject(this);
          var length = ES.ToLength(list.length);
          if (!ES.IsCallable(predicate)) {
            throw new TypeError('Array#findIndex: predicate must be a function');
          }
          var thisArg = arguments.length > 1 ? arguments[1] : null;
          for (var i = 0; i < length; i++) {
            if (thisArg) {
              if (_call(predicate, thisArg, list[i], i, list)) {
                return i;
              }
            } else if (predicate(list[i], i, list)) {
              return i;
            }
          }
          return -1;
        },
        keys: function keys() {
          return new ArrayIterator(this, 'key');
        },
        values: function values() {
          return new ArrayIterator(this, 'value');
        },
        entries: function entries() {
          return new ArrayIterator(this, 'entry');
        }
      };
      if (Array.prototype.keys && !ES.IsCallable([1].keys().next)) {
        delete Array.prototype.keys;
      }
      if (Array.prototype.entries && !ES.IsCallable([1].entries().next)) {
        delete Array.prototype.entries;
      }
      if (Array.prototype.keys && Array.prototype.entries && !Array.prototype.values && Array.prototype[$iterator$]) {
        defineProperties(Array.prototype, {values: Array.prototype[$iterator$]});
        if (Type.symbol(Symbol.unscopables)) {
          Array.prototype[Symbol.unscopables].values = true;
        }
      }
      if (functionsHaveNames && Array.prototype.values && Array.prototype.values.name !== 'values') {
        var originalArrayPrototypeValues = Array.prototype.values;
        overrideNative(Array.prototype, 'values', function values() {
          return ES.Call(originalArrayPrototypeValues, this, arguments);
        });
        defineProperty(Array.prototype, $iterator$, Array.prototype.values, true);
      }
      defineProperties(Array.prototype, ArrayPrototypeShims);
      addIterator(Array.prototype, function() {
        return this.values();
      });
      if (Object.getPrototypeOf) {
        addIterator(Object.getPrototypeOf([].values()));
      }
      var arrayFromSwallowsNegativeLengths = (function() {
        return valueOrFalseIfThrows(function() {
          return Array.from({length: -1}).length === 0;
        });
      }());
      var arrayFromHandlesIterables = (function() {
        var arr = Array.from([0].entries());
        return arr.length === 1 && isArray(arr[0]) && arr[0][0] === 0 && arr[0][1] === 0;
      }());
      if (!arrayFromSwallowsNegativeLengths || !arrayFromHandlesIterables) {
        overrideNative(Array, 'from', ArrayShims.from);
      }
      var arrayFromHandlesUndefinedMapFunction = (function() {
        return valueOrFalseIfThrows(function() {
          return Array.from([0], void 0);
        });
      }());
      if (!arrayFromHandlesUndefinedMapFunction) {
        var origArrayFrom = Array.from;
        overrideNative(Array, 'from', function from(items) {
          if (arguments.length > 1 && typeof arguments[1] !== 'undefined') {
            return ES.Call(origArrayFrom, this, arguments);
          } else {
            return _call(origArrayFrom, this, items);
          }
        });
      }
      var int32sAsOne = -(Math.pow(2, 32) - 1);
      var toLengthsCorrectly = function(method, reversed) {
        var obj = {length: int32sAsOne};
        obj[reversed ? ((obj.length >>> 0) - 1) : 0] = true;
        return valueOrFalseIfThrows(function() {
          _call(method, obj, function() {
            throw new RangeError('should not reach here');
          }, []);
          return true;
        });
      };
      if (!toLengthsCorrectly(Array.prototype.forEach)) {
        var originalForEach = Array.prototype.forEach;
        overrideNative(Array.prototype, 'forEach', function forEach(callbackFn) {
          return ES.Call(originalForEach, this.length >= 0 ? this : [], arguments);
        }, true);
      }
      if (!toLengthsCorrectly(Array.prototype.map)) {
        var originalMap = Array.prototype.map;
        overrideNative(Array.prototype, 'map', function map(callbackFn) {
          return ES.Call(originalMap, this.length >= 0 ? this : [], arguments);
        }, true);
      }
      if (!toLengthsCorrectly(Array.prototype.filter)) {
        var originalFilter = Array.prototype.filter;
        overrideNative(Array.prototype, 'filter', function filter(callbackFn) {
          return ES.Call(originalFilter, this.length >= 0 ? this : [], arguments);
        }, true);
      }
      if (!toLengthsCorrectly(Array.prototype.some)) {
        var originalSome = Array.prototype.some;
        overrideNative(Array.prototype, 'some', function some(callbackFn) {
          return ES.Call(originalSome, this.length >= 0 ? this : [], arguments);
        }, true);
      }
      if (!toLengthsCorrectly(Array.prototype.every)) {
        var originalEvery = Array.prototype.every;
        overrideNative(Array.prototype, 'every', function every(callbackFn) {
          return ES.Call(originalEvery, this.length >= 0 ? this : [], arguments);
        }, true);
      }
      if (!toLengthsCorrectly(Array.prototype.reduce)) {
        var originalReduce = Array.prototype.reduce;
        overrideNative(Array.prototype, 'reduce', function reduce(callbackFn) {
          return ES.Call(originalReduce, this.length >= 0 ? this : [], arguments);
        }, true);
      }
      if (!toLengthsCorrectly(Array.prototype.reduceRight, true)) {
        var originalReduceRight = Array.prototype.reduceRight;
        overrideNative(Array.prototype, 'reduceRight', function reduceRight(callbackFn) {
          return ES.Call(originalReduceRight, this.length >= 0 ? this : [], arguments);
        }, true);
      }
      var lacksOctalSupport = Number('0o10') !== 8;
      var lacksBinarySupport = Number('0b10') !== 2;
      var trimsNonWhitespace = _some(nonWS, function(c) {
        return Number(c + 0 + c) === 0;
      });
      if (lacksOctalSupport || lacksBinarySupport || trimsNonWhitespace) {
        var OrigNumber = Number;
        var binaryRegex = /^0b[01]+$/i;
        var octalRegex = /^0o[0-7]+$/i;
        var isBinary = binaryRegex.test.bind(binaryRegex);
        var isOctal = octalRegex.test.bind(octalRegex);
        var toPrimitive = function(O) {
          var result;
          if (typeof O.valueOf === 'function') {
            result = O.valueOf();
            if (Type.primitive(result)) {
              return result;
            }
          }
          if (typeof O.toString === 'function') {
            result = O.toString();
            if (Type.primitive(result)) {
              return result;
            }
          }
          throw new TypeError('No default value');
        };
        var hasNonWS = nonWSregex.test.bind(nonWSregex);
        var isBadHex = isBadHexRegex.test.bind(isBadHexRegex);
        var NumberShim = (function() {
          var NumberShim = function Number(value) {
            var primValue;
            if (arguments.length > 0) {
              primValue = Type.primitive(value) ? value : toPrimitive(value, 'number');
            } else {
              primValue = 0;
            }
            if (typeof primValue === 'string') {
              primValue = ES.Call(trimShim, primValue);
              if (isBinary(primValue)) {
                primValue = parseInt(_strSlice(primValue, 2), 2);
              } else if (isOctal(primValue)) {
                primValue = parseInt(_strSlice(primValue, 2), 8);
              } else if (hasNonWS(primValue) || isBadHex(primValue)) {
                primValue = NaN;
              }
            }
            var receiver = this;
            var valueOfSucceeds = valueOrFalseIfThrows(function() {
              OrigNumber.prototype.valueOf.call(receiver);
              return true;
            });
            if (receiver instanceof NumberShim && !valueOfSucceeds) {
              return new OrigNumber(primValue);
            }
            return OrigNumber(primValue);
          };
          return NumberShim;
        }());
        wrapConstructor(OrigNumber, NumberShim, {});
        Number = NumberShim;
        Value.redefine(globals, 'Number', NumberShim);
      }
      var maxSafeInteger = Math.pow(2, 53) - 1;
      defineProperties(Number, {
        MAX_SAFE_INTEGER: maxSafeInteger,
        MIN_SAFE_INTEGER: -maxSafeInteger,
        EPSILON: 2.220446049250313e-16,
        parseInt: globals.parseInt,
        parseFloat: globals.parseFloat,
        isFinite: numberIsFinite,
        isInteger: function isInteger(value) {
          return numberIsFinite(value) && ES.ToInteger(value) === value;
        },
        isSafeInteger: function isSafeInteger(value) {
          return Number.isInteger(value) && _abs(value) <= Number.MAX_SAFE_INTEGER;
        },
        isNaN: numberIsNaN
      });
      defineProperty(Number, 'parseInt', globals.parseInt, Number.parseInt !== globals.parseInt);
      if (![, 1].find(function(item, idx) {
        return idx === 0;
      })) {
        overrideNative(Array.prototype, 'find', ArrayPrototypeShims.find);
      }
      if ([, 1].findIndex(function(item, idx) {
        return idx === 0;
      }) !== 0) {
        overrideNative(Array.prototype, 'findIndex', ArrayPrototypeShims.findIndex);
      }
      var isEnumerableOn = Function.bind.call(Function.bind, Object.prototype.propertyIsEnumerable);
      var ensureEnumerable = function ensureEnumerable(obj, prop) {
        if (supportsDescriptors && isEnumerableOn(obj, prop)) {
          Object.defineProperty(obj, prop, {enumerable: false});
        }
      };
      var sliceArgs = function sliceArgs() {
        var initial = Number(this);
        var len = arguments.length;
        var desiredArgCount = len - initial;
        var args = new Array(desiredArgCount < 0 ? 0 : desiredArgCount);
        for (var i = initial; i < len; ++i) {
          args[i - initial] = arguments[i];
        }
        return args;
      };
      var assignTo = function assignTo(source) {
        return function assignToSource(target, key) {
          target[key] = source[key];
          return target;
        };
      };
      var assignReducer = function(target, source) {
        var sourceKeys = keys(Object(source));
        var symbols;
        if (ES.IsCallable(Object.getOwnPropertySymbols)) {
          symbols = _filter(Object.getOwnPropertySymbols(Object(source)), isEnumerableOn(source));
        }
        return _reduce(_concat(sourceKeys, symbols || []), assignTo(source), target);
      };
      var ObjectShims = {
        assign: function(target, source) {
          var to = ES.ToObject(target, 'Cannot convert undefined or null to object');
          return _reduce(ES.Call(sliceArgs, 1, arguments), assignReducer, to);
        },
        is: function is(a, b) {
          return ES.SameValue(a, b);
        }
      };
      var assignHasPendingExceptions = Object.assign && Object.preventExtensions && (function() {
        var thrower = Object.preventExtensions({1: 2});
        try {
          Object.assign(thrower, 'xy');
        } catch (e) {
          return thrower[1] === 'y';
        }
      }());
      if (assignHasPendingExceptions) {
        overrideNative(Object, 'assign', ObjectShims.assign);
      }
      defineProperties(Object, ObjectShims);
      if (supportsDescriptors) {
        var ES5ObjectShims = {setPrototypeOf: (function(Object, magic) {
            var set;
            var checkArgs = function(O, proto) {
              if (!ES.TypeIsObject(O)) {
                throw new TypeError('cannot set prototype on a non-object');
              }
              if (!(proto === null || ES.TypeIsObject(proto))) {
                throw new TypeError('can only set prototype to an object or null' + proto);
              }
            };
            var setPrototypeOf = function(O, proto) {
              checkArgs(O, proto);
              _call(set, O, proto);
              return O;
            };
            try {
              set = Object.getOwnPropertyDescriptor(Object.prototype, magic).set;
              _call(set, {}, null);
            } catch (e) {
              if (Object.prototype !== {}[magic]) {
                return;
              }
              set = function(proto) {
                this[magic] = proto;
              };
              setPrototypeOf.polyfill = setPrototypeOf(setPrototypeOf({}, null), Object.prototype) instanceof Object;
            }
            return setPrototypeOf;
          }(Object, '__proto__'))};
        defineProperties(Object, ES5ObjectShims);
      }
      if (Object.setPrototypeOf && Object.getPrototypeOf && Object.getPrototypeOf(Object.setPrototypeOf({}, null)) !== null && Object.getPrototypeOf(Object.create(null)) === null) {
        (function() {
          var FAKENULL = Object.create(null);
          var gpo = Object.getPrototypeOf,
              spo = Object.setPrototypeOf;
          Object.getPrototypeOf = function(o) {
            var result = gpo(o);
            return result === FAKENULL ? null : result;
          };
          Object.setPrototypeOf = function(o, p) {
            var proto = p === null ? FAKENULL : p;
            return spo(o, proto);
          };
          Object.setPrototypeOf.polyfill = false;
        }());
      }
      var objectKeysAcceptsPrimitives = !throwsError(function() {
        Object.keys('foo');
      });
      if (!objectKeysAcceptsPrimitives) {
        var originalObjectKeys = Object.keys;
        overrideNative(Object, 'keys', function keys(value) {
          return originalObjectKeys(ES.ToObject(value));
        });
        keys = Object.keys;
      }
      if (Object.getOwnPropertyNames) {
        var objectGOPNAcceptsPrimitives = !throwsError(function() {
          Object.getOwnPropertyNames('foo');
        });
        if (!objectGOPNAcceptsPrimitives) {
          var cachedWindowNames = typeof window === 'object' ? Object.getOwnPropertyNames(window) : [];
          var originalObjectGetOwnPropertyNames = Object.getOwnPropertyNames;
          overrideNative(Object, 'getOwnPropertyNames', function getOwnPropertyNames(value) {
            var val = ES.ToObject(value);
            if (_toString(val) === '[object Window]') {
              try {
                return originalObjectGetOwnPropertyNames(val);
              } catch (e) {
                return _concat([], cachedWindowNames);
              }
            }
            return originalObjectGetOwnPropertyNames(val);
          });
        }
      }
      if (Object.getOwnPropertyDescriptor) {
        var objectGOPDAcceptsPrimitives = !throwsError(function() {
          Object.getOwnPropertyDescriptor('foo', 'bar');
        });
        if (!objectGOPDAcceptsPrimitives) {
          var originalObjectGetOwnPropertyDescriptor = Object.getOwnPropertyDescriptor;
          overrideNative(Object, 'getOwnPropertyDescriptor', function getOwnPropertyDescriptor(value, property) {
            return originalObjectGetOwnPropertyDescriptor(ES.ToObject(value), property);
          });
        }
      }
      if (Object.seal) {
        var objectSealAcceptsPrimitives = !throwsError(function() {
          Object.seal('foo');
        });
        if (!objectSealAcceptsPrimitives) {
          var originalObjectSeal = Object.seal;
          overrideNative(Object, 'seal', function seal(value) {
            if (!Type.object(value)) {
              return value;
            }
            return originalObjectSeal(value);
          });
        }
      }
      if (Object.isSealed) {
        var objectIsSealedAcceptsPrimitives = !throwsError(function() {
          Object.isSealed('foo');
        });
        if (!objectIsSealedAcceptsPrimitives) {
          var originalObjectIsSealed = Object.isSealed;
          overrideNative(Object, 'isSealed', function isSealed(value) {
            if (!Type.object(value)) {
              return true;
            }
            return originalObjectIsSealed(value);
          });
        }
      }
      if (Object.freeze) {
        var objectFreezeAcceptsPrimitives = !throwsError(function() {
          Object.freeze('foo');
        });
        if (!objectFreezeAcceptsPrimitives) {
          var originalObjectFreeze = Object.freeze;
          overrideNative(Object, 'freeze', function freeze(value) {
            if (!Type.object(value)) {
              return value;
            }
            return originalObjectFreeze(value);
          });
        }
      }
      if (Object.isFrozen) {
        var objectIsFrozenAcceptsPrimitives = !throwsError(function() {
          Object.isFrozen('foo');
        });
        if (!objectIsFrozenAcceptsPrimitives) {
          var originalObjectIsFrozen = Object.isFrozen;
          overrideNative(Object, 'isFrozen', function isFrozen(value) {
            if (!Type.object(value)) {
              return true;
            }
            return originalObjectIsFrozen(value);
          });
        }
      }
      if (Object.preventExtensions) {
        var objectPreventExtensionsAcceptsPrimitives = !throwsError(function() {
          Object.preventExtensions('foo');
        });
        if (!objectPreventExtensionsAcceptsPrimitives) {
          var originalObjectPreventExtensions = Object.preventExtensions;
          overrideNative(Object, 'preventExtensions', function preventExtensions(value) {
            if (!Type.object(value)) {
              return value;
            }
            return originalObjectPreventExtensions(value);
          });
        }
      }
      if (Object.isExtensible) {
        var objectIsExtensibleAcceptsPrimitives = !throwsError(function() {
          Object.isExtensible('foo');
        });
        if (!objectIsExtensibleAcceptsPrimitives) {
          var originalObjectIsExtensible = Object.isExtensible;
          overrideNative(Object, 'isExtensible', function isExtensible(value) {
            if (!Type.object(value)) {
              return false;
            }
            return originalObjectIsExtensible(value);
          });
        }
      }
      if (Object.getPrototypeOf) {
        var objectGetProtoAcceptsPrimitives = !throwsError(function() {
          Object.getPrototypeOf('foo');
        });
        if (!objectGetProtoAcceptsPrimitives) {
          var originalGetProto = Object.getPrototypeOf;
          overrideNative(Object, 'getPrototypeOf', function getPrototypeOf(value) {
            return originalGetProto(ES.ToObject(value));
          });
        }
      }
      var hasFlags = supportsDescriptors && (function() {
        var desc = Object.getOwnPropertyDescriptor(RegExp.prototype, 'flags');
        return desc && ES.IsCallable(desc.get);
      }());
      if (supportsDescriptors && !hasFlags) {
        var regExpFlagsGetter = function flags() {
          if (!ES.TypeIsObject(this)) {
            throw new TypeError('Method called on incompatible type: must be an object.');
          }
          var result = '';
          if (this.global) {
            result += 'g';
          }
          if (this.ignoreCase) {
            result += 'i';
          }
          if (this.multiline) {
            result += 'm';
          }
          if (this.unicode) {
            result += 'u';
          }
          if (this.sticky) {
            result += 'y';
          }
          return result;
        };
        Value.getter(RegExp.prototype, 'flags', regExpFlagsGetter);
      }
      var regExpSupportsFlagsWithRegex = supportsDescriptors && valueOrFalseIfThrows(function() {
        return String(new RegExp(/a/g, 'i')) === '/a/i';
      });
      var regExpNeedsToSupportSymbolMatch = hasSymbols && supportsDescriptors && (function() {
        var regex = /./;
        regex[Symbol.match] = false;
        return RegExp(regex) === regex;
      }());
      if (supportsDescriptors && (!regExpSupportsFlagsWithRegex || regExpNeedsToSupportSymbolMatch)) {
        var flagsGetter = Object.getOwnPropertyDescriptor(RegExp.prototype, 'flags').get;
        var sourceDesc = Object.getOwnPropertyDescriptor(RegExp.prototype, 'source') || {};
        var legacySourceGetter = function() {
          return this.source;
        };
        var sourceGetter = ES.IsCallable(sourceDesc.get) ? sourceDesc.get : legacySourceGetter;
        var OrigRegExp = RegExp;
        var RegExpShim = (function() {
          return function RegExp(pattern, flags) {
            var patternIsRegExp = ES.IsRegExp(pattern);
            var calledWithNew = this instanceof RegExp;
            if (!calledWithNew && patternIsRegExp && typeof flags === 'undefined' && pattern.constructor === RegExp) {
              return pattern;
            }
            var P = pattern;
            var F = flags;
            if (Type.regex(pattern)) {
              P = ES.Call(sourceGetter, pattern);
              F = typeof flags === 'undefined' ? ES.Call(flagsGetter, pattern) : flags;
              return new RegExp(P, F);
            } else if (patternIsRegExp) {
              P = pattern.source;
              F = typeof flags === 'undefined' ? pattern.flags : flags;
            }
            return new OrigRegExp(pattern, flags);
          };
        }());
        wrapConstructor(OrigRegExp, RegExpShim, {$input: true});
        RegExp = RegExpShim;
        Value.redefine(globals, 'RegExp', RegExpShim);
      }
      if (supportsDescriptors) {
        var regexGlobals = {
          input: '$_',
          lastMatch: '$&',
          lastParen: '$+',
          leftContext: '$`',
          rightContext: '$\''
        };
        _forEach(keys(regexGlobals), function(prop) {
          if (prop in RegExp && !(regexGlobals[prop] in RegExp)) {
            Value.getter(RegExp, regexGlobals[prop], function get() {
              return RegExp[prop];
            });
          }
        });
      }
      addDefaultSpecies(RegExp);
      var inverseEpsilon = 1 / Number.EPSILON;
      var roundTiesToEven = function roundTiesToEven(n) {
        return (n + inverseEpsilon) - inverseEpsilon;
      };
      var BINARY_32_EPSILON = Math.pow(2, -23);
      var BINARY_32_MAX_VALUE = Math.pow(2, 127) * (2 - BINARY_32_EPSILON);
      var BINARY_32_MIN_VALUE = Math.pow(2, -126);
      var numberCLZ = Number.prototype.clz;
      delete Number.prototype.clz;
      var MathShims = {
        acosh: function acosh(value) {
          var x = Number(value);
          if (Number.isNaN(x) || value < 1) {
            return NaN;
          }
          if (x === 1) {
            return 0;
          }
          if (x === Infinity) {
            return x;
          }
          return _log(x / Math.E + _sqrt(x + 1) * _sqrt(x - 1) / Math.E) + 1;
        },
        asinh: function asinh(value) {
          var x = Number(value);
          if (x === 0 || !globalIsFinite(x)) {
            return x;
          }
          return x < 0 ? -Math.asinh(-x) : _log(x + _sqrt(x * x + 1));
        },
        atanh: function atanh(value) {
          var x = Number(value);
          if (Number.isNaN(x) || x < -1 || x > 1) {
            return NaN;
          }
          if (x === -1) {
            return -Infinity;
          }
          if (x === 1) {
            return Infinity;
          }
          if (x === 0) {
            return x;
          }
          return 0.5 * _log((1 + x) / (1 - x));
        },
        cbrt: function cbrt(value) {
          var x = Number(value);
          if (x === 0) {
            return x;
          }
          var negate = x < 0,
              result;
          if (negate) {
            x = -x;
          }
          if (x === Infinity) {
            result = Infinity;
          } else {
            result = Math.exp(_log(x) / 3);
            result = (x / (result * result) + (2 * result)) / 3;
          }
          return negate ? -result : result;
        },
        clz32: function clz32(value) {
          var x = Number(value);
          var number = ES.ToUint32(x);
          if (number === 0) {
            return 32;
          }
          return numberCLZ ? ES.Call(numberCLZ, number) : 31 - _floor(_log(number + 0.5) * Math.LOG2E);
        },
        cosh: function cosh(value) {
          var x = Number(value);
          if (x === 0) {
            return 1;
          }
          if (Number.isNaN(x)) {
            return NaN;
          }
          if (!globalIsFinite(x)) {
            return Infinity;
          }
          if (x < 0) {
            x = -x;
          }
          if (x > 21) {
            return Math.exp(x) / 2;
          }
          return (Math.exp(x) + Math.exp(-x)) / 2;
        },
        expm1: function expm1(value) {
          var x = Number(value);
          if (x === -Infinity) {
            return -1;
          }
          if (!globalIsFinite(x) || x === 0) {
            return x;
          }
          if (_abs(x) > 0.5) {
            return Math.exp(x) - 1;
          }
          var t = x;
          var sum = 0;
          var n = 1;
          while (sum + t !== sum) {
            sum += t;
            n += 1;
            t *= x / n;
          }
          return sum;
        },
        hypot: function hypot(x, y) {
          var result = 0;
          var largest = 0;
          for (var i = 0; i < arguments.length; ++i) {
            var value = _abs(Number(arguments[i]));
            if (largest < value) {
              result *= (largest / value) * (largest / value);
              result += 1;
              largest = value;
            } else {
              result += (value > 0 ? (value / largest) * (value / largest) : value);
            }
          }
          return largest === Infinity ? Infinity : largest * _sqrt(result);
        },
        log2: function log2(value) {
          return _log(value) * Math.LOG2E;
        },
        log10: function log10(value) {
          return _log(value) * Math.LOG10E;
        },
        log1p: function log1p(value) {
          var x = Number(value);
          if (x < -1 || Number.isNaN(x)) {
            return NaN;
          }
          if (x === 0 || x === Infinity) {
            return x;
          }
          if (x === -1) {
            return -Infinity;
          }
          return (1 + x) - 1 === 0 ? x : x * (_log(1 + x) / ((1 + x) - 1));
        },
        sign: function sign(value) {
          var number = Number(value);
          if (number === 0) {
            return number;
          }
          if (Number.isNaN(number)) {
            return number;
          }
          return number < 0 ? -1 : 1;
        },
        sinh: function sinh(value) {
          var x = Number(value);
          if (!globalIsFinite(x) || x === 0) {
            return x;
          }
          if (_abs(x) < 1) {
            return (Math.expm1(x) - Math.expm1(-x)) / 2;
          }
          return (Math.exp(x - 1) - Math.exp(-x - 1)) * Math.E / 2;
        },
        tanh: function tanh(value) {
          var x = Number(value);
          if (Number.isNaN(x) || x === 0) {
            return x;
          }
          if (x === Infinity) {
            return 1;
          }
          if (x === -Infinity) {
            return -1;
          }
          var a = Math.expm1(x);
          var b = Math.expm1(-x);
          if (a === Infinity) {
            return 1;
          }
          if (b === Infinity) {
            return -1;
          }
          return (a - b) / (Math.exp(x) + Math.exp(-x));
        },
        trunc: function trunc(value) {
          var x = Number(value);
          return x < 0 ? -_floor(-x) : _floor(x);
        },
        imul: function imul(x, y) {
          var a = ES.ToUint32(x);
          var b = ES.ToUint32(y);
          var ah = (a >>> 16) & 0xffff;
          var al = a & 0xffff;
          var bh = (b >>> 16) & 0xffff;
          var bl = b & 0xffff;
          return ((al * bl) + (((ah * bl + al * bh) << 16) >>> 0) | 0);
        },
        fround: function fround(x) {
          var v = Number(x);
          if (v === 0 || v === Infinity || v === -Infinity || numberIsNaN(v)) {
            return v;
          }
          var sign = Math.sign(v);
          var abs = _abs(v);
          if (abs < BINARY_32_MIN_VALUE) {
            return sign * roundTiesToEven(abs / BINARY_32_MIN_VALUE / BINARY_32_EPSILON) * BINARY_32_MIN_VALUE * BINARY_32_EPSILON;
          }
          var a = (1 + BINARY_32_EPSILON / Number.EPSILON) * abs;
          var result = a - (a - abs);
          if (result > BINARY_32_MAX_VALUE || numberIsNaN(result)) {
            return sign * Infinity;
          }
          return sign * result;
        }
      };
      defineProperties(Math, MathShims);
      defineProperty(Math, 'log1p', MathShims.log1p, Math.log1p(-1e-17) !== -1e-17);
      defineProperty(Math, 'asinh', MathShims.asinh, Math.asinh(-1e7) !== -Math.asinh(1e7));
      defineProperty(Math, 'tanh', MathShims.tanh, Math.tanh(-2e-17) !== -2e-17);
      defineProperty(Math, 'acosh', MathShims.acosh, Math.acosh(Number.MAX_VALUE) === Infinity);
      defineProperty(Math, 'cbrt', MathShims.cbrt, Math.abs(1 - Math.cbrt(1e-300) / 1e-100) / Number.EPSILON > 8);
      defineProperty(Math, 'sinh', MathShims.sinh, Math.sinh(-2e-17) !== -2e-17);
      var expm1OfTen = Math.expm1(10);
      defineProperty(Math, 'expm1', MathShims.expm1, expm1OfTen > 22025.465794806719 || expm1OfTen < 22025.4657948067165168);
      var origMathRound = Math.round;
      var roundHandlesBoundaryConditions = Math.round(0.5 - Number.EPSILON / 4) === 0 && Math.round(-0.5 + Number.EPSILON / 3.99) === 1;
      var smallestPositiveNumberWhereRoundBreaks = inverseEpsilon + 1;
      var largestPositiveNumberWhereRoundBreaks = 2 * inverseEpsilon - 1;
      var roundDoesNotIncreaseIntegers = [smallestPositiveNumberWhereRoundBreaks, largestPositiveNumberWhereRoundBreaks].every(function(num) {
        return Math.round(num) === num;
      });
      defineProperty(Math, 'round', function round(x) {
        var floor = _floor(x);
        var ceil = floor === -1 ? -0 : floor + 1;
        return x - floor < 0.5 ? floor : ceil;
      }, !roundHandlesBoundaryConditions || !roundDoesNotIncreaseIntegers);
      Value.preserveToString(Math.round, origMathRound);
      var origImul = Math.imul;
      if (Math.imul(0xffffffff, 5) !== -5) {
        Math.imul = MathShims.imul;
        Value.preserveToString(Math.imul, origImul);
      }
      if (Math.imul.length !== 2) {
        overrideNative(Math, 'imul', function imul(x, y) {
          return ES.Call(origImul, Math, arguments);
        });
      }
      var PromiseShim = (function() {
        var setTimeout = globals.setTimeout;
        if (typeof setTimeout !== 'function' && typeof setTimeout !== 'object') {
          return;
        }
        ES.IsPromise = function(promise) {
          if (!ES.TypeIsObject(promise)) {
            return false;
          }
          if (typeof promise._promise === 'undefined') {
            return false;
          }
          return true;
        };
        var PromiseCapability = function(C) {
          if (!ES.IsConstructor(C)) {
            throw new TypeError('Bad promise constructor');
          }
          var capability = this;
          var resolver = function(resolve, reject) {
            if (capability.resolve !== void 0 || capability.reject !== void 0) {
              throw new TypeError('Bad Promise implementation!');
            }
            capability.resolve = resolve;
            capability.reject = reject;
          };
          capability.resolve = void 0;
          capability.reject = void 0;
          capability.promise = new C(resolver);
          if (!(ES.IsCallable(capability.resolve) && ES.IsCallable(capability.reject))) {
            throw new TypeError('Bad promise constructor');
          }
        };
        var makeZeroTimeout;
        if (typeof window !== 'undefined' && ES.IsCallable(window.postMessage)) {
          makeZeroTimeout = function() {
            var timeouts = [];
            var messageName = 'zero-timeout-message';
            var setZeroTimeout = function(fn) {
              _push(timeouts, fn);
              window.postMessage(messageName, '*');
            };
            var handleMessage = function(event) {
              if (event.source === window && event.data === messageName) {
                event.stopPropagation();
                if (timeouts.length === 0) {
                  return;
                }
                var fn = _shift(timeouts);
                fn();
              }
            };
            window.addEventListener('message', handleMessage, true);
            return setZeroTimeout;
          };
        }
        var makePromiseAsap = function() {
          var P = globals.Promise;
          var pr = P && P.resolve && P.resolve();
          return pr && function(task) {
            return pr.then(task);
          };
        };
        var enqueue = ES.IsCallable(globals.setImmediate) ? globals.setImmediate : typeof process === 'object' && process.nextTick ? process.nextTick : makePromiseAsap() || (ES.IsCallable(makeZeroTimeout) ? makeZeroTimeout() : function(task) {
          setTimeout(task, 0);
        });
        var PROMISE_IDENTITY = function(x) {
          return x;
        };
        var PROMISE_THROWER = function(e) {
          throw e;
        };
        var PROMISE_PENDING = 0;
        var PROMISE_FULFILLED = 1;
        var PROMISE_REJECTED = 2;
        var PROMISE_FULFILL_OFFSET = 0;
        var PROMISE_REJECT_OFFSET = 1;
        var PROMISE_CAPABILITY_OFFSET = 2;
        var PROMISE_FAKE_CAPABILITY = {};
        var enqueuePromiseReactionJob = function(handler, capability, argument) {
          enqueue(function() {
            promiseReactionJob(handler, capability, argument);
          });
        };
        var promiseReactionJob = function(handler, promiseCapability, argument) {
          var handlerResult,
              f;
          if (promiseCapability === PROMISE_FAKE_CAPABILITY) {
            return handler(argument);
          }
          try {
            handlerResult = handler(argument);
            f = promiseCapability.resolve;
          } catch (e) {
            handlerResult = e;
            f = promiseCapability.reject;
          }
          f(handlerResult);
        };
        var fulfillPromise = function(promise, value) {
          var _promise = promise._promise;
          var length = _promise.reactionLength;
          if (length > 0) {
            enqueuePromiseReactionJob(_promise.fulfillReactionHandler0, _promise.reactionCapability0, value);
            _promise.fulfillReactionHandler0 = void 0;
            _promise.rejectReactions0 = void 0;
            _promise.reactionCapability0 = void 0;
            if (length > 1) {
              for (var i = 1,
                  idx = 0; i < length; i++, idx += 3) {
                enqueuePromiseReactionJob(_promise[idx + PROMISE_FULFILL_OFFSET], _promise[idx + PROMISE_CAPABILITY_OFFSET], value);
                promise[idx + PROMISE_FULFILL_OFFSET] = void 0;
                promise[idx + PROMISE_REJECT_OFFSET] = void 0;
                promise[idx + PROMISE_CAPABILITY_OFFSET] = void 0;
              }
            }
          }
          _promise.result = value;
          _promise.state = PROMISE_FULFILLED;
          _promise.reactionLength = 0;
        };
        var rejectPromise = function(promise, reason) {
          var _promise = promise._promise;
          var length = _promise.reactionLength;
          if (length > 0) {
            enqueuePromiseReactionJob(_promise.rejectReactionHandler0, _promise.reactionCapability0, reason);
            _promise.fulfillReactionHandler0 = void 0;
            _promise.rejectReactions0 = void 0;
            _promise.reactionCapability0 = void 0;
            if (length > 1) {
              for (var i = 1,
                  idx = 0; i < length; i++, idx += 3) {
                enqueuePromiseReactionJob(_promise[idx + PROMISE_REJECT_OFFSET], _promise[idx + PROMISE_CAPABILITY_OFFSET], reason);
                promise[idx + PROMISE_FULFILL_OFFSET] = void 0;
                promise[idx + PROMISE_REJECT_OFFSET] = void 0;
                promise[idx + PROMISE_CAPABILITY_OFFSET] = void 0;
              }
            }
          }
          _promise.result = reason;
          _promise.state = PROMISE_REJECTED;
          _promise.reactionLength = 0;
        };
        var createResolvingFunctions = function(promise) {
          var alreadyResolved = false;
          var resolve = function(resolution) {
            var then;
            if (alreadyResolved) {
              return;
            }
            alreadyResolved = true;
            if (resolution === promise) {
              return rejectPromise(promise, new TypeError('Self resolution'));
            }
            if (!ES.TypeIsObject(resolution)) {
              return fulfillPromise(promise, resolution);
            }
            try {
              then = resolution.then;
            } catch (e) {
              return rejectPromise(promise, e);
            }
            if (!ES.IsCallable(then)) {
              return fulfillPromise(promise, resolution);
            }
            enqueue(function() {
              promiseResolveThenableJob(promise, resolution, then);
            });
          };
          var reject = function(reason) {
            if (alreadyResolved) {
              return;
            }
            alreadyResolved = true;
            return rejectPromise(promise, reason);
          };
          return {
            resolve: resolve,
            reject: reject
          };
        };
        var optimizedThen = function(then, thenable, resolve, reject) {
          if (then === Promise$prototype$then) {
            _call(then, thenable, resolve, reject, PROMISE_FAKE_CAPABILITY);
          } else {
            _call(then, thenable, resolve, reject);
          }
        };
        var promiseResolveThenableJob = function(promise, thenable, then) {
          var resolvingFunctions = createResolvingFunctions(promise);
          var resolve = resolvingFunctions.resolve;
          var reject = resolvingFunctions.reject;
          try {
            optimizedThen(then, thenable, resolve, reject);
          } catch (e) {
            reject(e);
          }
        };
        var Promise$prototype,
            Promise$prototype$then;
        var Promise = (function() {
          var PromiseShim = function Promise(resolver) {
            if (!(this instanceof PromiseShim)) {
              throw new TypeError('Constructor Promise requires "new"');
            }
            if (this && this._promise) {
              throw new TypeError('Bad construction');
            }
            if (!ES.IsCallable(resolver)) {
              throw new TypeError('not a valid resolver');
            }
            var promise = emulateES6construct(this, PromiseShim, Promise$prototype, {_promise: {
                result: void 0,
                state: PROMISE_PENDING,
                reactionLength: 0,
                fulfillReactionHandler0: void 0,
                rejectReactionHandler0: void 0,
                reactionCapability0: void 0
              }});
            var resolvingFunctions = createResolvingFunctions(promise);
            var reject = resolvingFunctions.reject;
            try {
              resolver(resolvingFunctions.resolve, reject);
            } catch (e) {
              reject(e);
            }
            return promise;
          };
          return PromiseShim;
        }());
        Promise$prototype = Promise.prototype;
        var _promiseAllResolver = function(index, values, capability, remaining) {
          var alreadyCalled = false;
          return function(x) {
            if (alreadyCalled) {
              return;
            }
            alreadyCalled = true;
            values[index] = x;
            if ((--remaining.count) === 0) {
              var resolve = capability.resolve;
              resolve(values);
            }
          };
        };
        var performPromiseAll = function(iteratorRecord, C, resultCapability) {
          var it = iteratorRecord.iterator;
          var values = [],
              remaining = {count: 1},
              next,
              nextValue;
          var index = 0;
          while (true) {
            try {
              next = ES.IteratorStep(it);
              if (next === false) {
                iteratorRecord.done = true;
                break;
              }
              nextValue = next.value;
            } catch (e) {
              iteratorRecord.done = true;
              throw e;
            }
            values[index] = void 0;
            var nextPromise = C.resolve(nextValue);
            var resolveElement = _promiseAllResolver(index, values, resultCapability, remaining);
            remaining.count += 1;
            optimizedThen(nextPromise.then, nextPromise, resolveElement, resultCapability.reject);
            index += 1;
          }
          if ((--remaining.count) === 0) {
            var resolve = resultCapability.resolve;
            resolve(values);
          }
          return resultCapability.promise;
        };
        var performPromiseRace = function(iteratorRecord, C, resultCapability) {
          var it = iteratorRecord.iterator,
              next,
              nextValue,
              nextPromise;
          while (true) {
            try {
              next = ES.IteratorStep(it);
              if (next === false) {
                iteratorRecord.done = true;
                break;
              }
              nextValue = next.value;
            } catch (e) {
              iteratorRecord.done = true;
              throw e;
            }
            nextPromise = C.resolve(nextValue);
            optimizedThen(nextPromise.then, nextPromise, resultCapability.resolve, resultCapability.reject);
          }
          return resultCapability.promise;
        };
        defineProperties(Promise, {
          all: function all(iterable) {
            var C = this;
            if (!ES.TypeIsObject(C)) {
              throw new TypeError('Promise is not object');
            }
            var capability = new PromiseCapability(C);
            var iterator,
                iteratorRecord;
            try {
              iterator = ES.GetIterator(iterable);
              iteratorRecord = {
                iterator: iterator,
                done: false
              };
              return performPromiseAll(iteratorRecord, C, capability);
            } catch (e) {
              var exception = e;
              if (iteratorRecord && !iteratorRecord.done) {
                try {
                  ES.IteratorClose(iterator, true);
                } catch (ee) {
                  exception = ee;
                }
              }
              var reject = capability.reject;
              reject(exception);
              return capability.promise;
            }
          },
          race: function race(iterable) {
            var C = this;
            if (!ES.TypeIsObject(C)) {
              throw new TypeError('Promise is not object');
            }
            var capability = new PromiseCapability(C);
            var iterator,
                iteratorRecord;
            try {
              iterator = ES.GetIterator(iterable);
              iteratorRecord = {
                iterator: iterator,
                done: false
              };
              return performPromiseRace(iteratorRecord, C, capability);
            } catch (e) {
              var exception = e;
              if (iteratorRecord && !iteratorRecord.done) {
                try {
                  ES.IteratorClose(iterator, true);
                } catch (ee) {
                  exception = ee;
                }
              }
              var reject = capability.reject;
              reject(exception);
              return capability.promise;
            }
          },
          reject: function reject(reason) {
            var C = this;
            if (!ES.TypeIsObject(C)) {
              throw new TypeError('Bad promise constructor');
            }
            var capability = new PromiseCapability(C);
            var rejectFunc = capability.reject;
            rejectFunc(reason);
            return capability.promise;
          },
          resolve: function resolve(v) {
            var C = this;
            if (!ES.TypeIsObject(C)) {
              throw new TypeError('Bad promise constructor');
            }
            if (ES.IsPromise(v)) {
              var constructor = v.constructor;
              if (constructor === C) {
                return v;
              }
            }
            var capability = new PromiseCapability(C);
            var resolveFunc = capability.resolve;
            resolveFunc(v);
            return capability.promise;
          }
        });
        defineProperties(Promise$prototype, {
          'catch': function(onRejected) {
            return this.then(null, onRejected);
          },
          then: function then(onFulfilled, onRejected) {
            var promise = this;
            if (!ES.IsPromise(promise)) {
              throw new TypeError('not a promise');
            }
            var C = ES.SpeciesConstructor(promise, Promise);
            var resultCapability;
            var returnValueIsIgnored = arguments.length > 2 && arguments[2] === PROMISE_FAKE_CAPABILITY;
            if (returnValueIsIgnored && C === Promise) {
              resultCapability = PROMISE_FAKE_CAPABILITY;
            } else {
              resultCapability = new PromiseCapability(C);
            }
            var fulfillReactionHandler = ES.IsCallable(onFulfilled) ? onFulfilled : PROMISE_IDENTITY;
            var rejectReactionHandler = ES.IsCallable(onRejected) ? onRejected : PROMISE_THROWER;
            var _promise = promise._promise;
            var value;
            if (_promise.state === PROMISE_PENDING) {
              if (_promise.reactionLength === 0) {
                _promise.fulfillReactionHandler0 = fulfillReactionHandler;
                _promise.rejectReactionHandler0 = rejectReactionHandler;
                _promise.reactionCapability0 = resultCapability;
              } else {
                var idx = 3 * (_promise.reactionLength - 1);
                _promise[idx + PROMISE_FULFILL_OFFSET] = fulfillReactionHandler;
                _promise[idx + PROMISE_REJECT_OFFSET] = rejectReactionHandler;
                _promise[idx + PROMISE_CAPABILITY_OFFSET] = resultCapability;
              }
              _promise.reactionLength += 1;
            } else if (_promise.state === PROMISE_FULFILLED) {
              value = _promise.result;
              enqueuePromiseReactionJob(fulfillReactionHandler, resultCapability, value);
            } else if (_promise.state === PROMISE_REJECTED) {
              value = _promise.result;
              enqueuePromiseReactionJob(rejectReactionHandler, resultCapability, value);
            } else {
              throw new TypeError('unexpected Promise state');
            }
            return resultCapability.promise;
          }
        });
        PROMISE_FAKE_CAPABILITY = new PromiseCapability(Promise);
        Promise$prototype$then = Promise$prototype.then;
        return Promise;
      }());
      if (globals.Promise) {
        delete globals.Promise.accept;
        delete globals.Promise.defer;
        delete globals.Promise.prototype.chain;
      }
      if (typeof PromiseShim === 'function') {
        defineProperties(globals, {Promise: PromiseShim});
        var promiseSupportsSubclassing = supportsSubclassing(globals.Promise, function(S) {
          return S.resolve(42).then(function() {}) instanceof S;
        });
        var promiseIgnoresNonFunctionThenCallbacks = !throwsError(function() {
          globals.Promise.reject(42).then(null, 5).then(null, noop);
        });
        var promiseRequiresObjectContext = throwsError(function() {
          globals.Promise.call(3, noop);
        });
        var promiseResolveBroken = (function(Promise) {
          var p = Promise.resolve(5);
          p.constructor = {};
          var p2 = Promise.resolve(p);
          return (p === p2);
        }(globals.Promise));
        var getsThenSynchronously = supportsDescriptors && (function() {
          var count = 0;
          var thenable = Object.defineProperty({}, 'then', {get: function() {
              count += 1;
            }});
          Promise.resolve(thenable);
          return count === 1;
        }());
        var BadResolverPromise = function BadResolverPromise(executor) {
          var p = new Promise(executor);
          executor(3, function() {});
          this.then = p.then;
          this.constructor = BadResolverPromise;
        };
        BadResolverPromise.prototype = Promise.prototype;
        BadResolverPromise.all = Promise.all;
        var hasBadResolverPromise = valueOrFalseIfThrows(function() {
          return !!BadResolverPromise.all([1, 2]);
        });
        if (!promiseSupportsSubclassing || !promiseIgnoresNonFunctionThenCallbacks || !promiseRequiresObjectContext || promiseResolveBroken || !getsThenSynchronously || hasBadResolverPromise) {
          Promise = PromiseShim;
          overrideNative(globals, 'Promise', PromiseShim);
        }
        if (Promise.all.length !== 1) {
          var origAll = Promise.all;
          overrideNative(Promise, 'all', function all(iterable) {
            return ES.Call(origAll, this, arguments);
          });
        }
        if (Promise.race.length !== 1) {
          var origRace = Promise.race;
          overrideNative(Promise, 'race', function race(iterable) {
            return ES.Call(origRace, this, arguments);
          });
        }
        if (Promise.resolve.length !== 1) {
          var origResolve = Promise.resolve;
          overrideNative(Promise, 'resolve', function resolve(x) {
            return ES.Call(origResolve, this, arguments);
          });
        }
        if (Promise.reject.length !== 1) {
          var origReject = Promise.reject;
          overrideNative(Promise, 'reject', function reject(r) {
            return ES.Call(origReject, this, arguments);
          });
        }
        ensureEnumerable(Promise, 'all');
        ensureEnumerable(Promise, 'race');
        ensureEnumerable(Promise, 'resolve');
        ensureEnumerable(Promise, 'reject');
        addDefaultSpecies(Promise);
      }
      var testOrder = function(a) {
        var b = keys(_reduce(a, function(o, k) {
          o[k] = true;
          return o;
        }, {}));
        return a.join(':') === b.join(':');
      };
      var preservesInsertionOrder = testOrder(['z', 'a', 'bb']);
      var preservesNumericInsertionOrder = testOrder(['z', 1, 'a', '3', 2]);
      if (supportsDescriptors) {
        var fastkey = function fastkey(key) {
          if (!preservesInsertionOrder) {
            return null;
          }
          if (typeof key === 'undefined' || key === null) {
            return '^' + ES.ToString(key);
          } else if (typeof key === 'string') {
            return '$' + key;
          } else if (typeof key === 'number') {
            if (!preservesNumericInsertionOrder) {
              return 'n' + key;
            }
            return key;
          } else if (typeof key === 'boolean') {
            return 'b' + key;
          }
          return null;
        };
        var emptyObject = function emptyObject() {
          return Object.create ? Object.create(null) : {};
        };
        var addIterableToMap = function addIterableToMap(MapConstructor, map, iterable) {
          if (isArray(iterable) || Type.string(iterable)) {
            _forEach(iterable, function(entry) {
              if (!ES.TypeIsObject(entry)) {
                throw new TypeError('Iterator value ' + entry + ' is not an entry object');
              }
              map.set(entry[0], entry[1]);
            });
          } else if (iterable instanceof MapConstructor) {
            _call(MapConstructor.prototype.forEach, iterable, function(value, key) {
              map.set(key, value);
            });
          } else {
            var iter,
                adder;
            if (iterable !== null && typeof iterable !== 'undefined') {
              adder = map.set;
              if (!ES.IsCallable(adder)) {
                throw new TypeError('bad map');
              }
              iter = ES.GetIterator(iterable);
            }
            if (typeof iter !== 'undefined') {
              while (true) {
                var next = ES.IteratorStep(iter);
                if (next === false) {
                  break;
                }
                var nextItem = next.value;
                try {
                  if (!ES.TypeIsObject(nextItem)) {
                    throw new TypeError('Iterator value ' + nextItem + ' is not an entry object');
                  }
                  _call(adder, map, nextItem[0], nextItem[1]);
                } catch (e) {
                  ES.IteratorClose(iter, true);
                  throw e;
                }
              }
            }
          }
        };
        var addIterableToSet = function addIterableToSet(SetConstructor, set, iterable) {
          if (isArray(iterable) || Type.string(iterable)) {
            _forEach(iterable, function(value) {
              set.add(value);
            });
          } else if (iterable instanceof SetConstructor) {
            _call(SetConstructor.prototype.forEach, iterable, function(value) {
              set.add(value);
            });
          } else {
            var iter,
                adder;
            if (iterable !== null && typeof iterable !== 'undefined') {
              adder = set.add;
              if (!ES.IsCallable(adder)) {
                throw new TypeError('bad set');
              }
              iter = ES.GetIterator(iterable);
            }
            if (typeof iter !== 'undefined') {
              while (true) {
                var next = ES.IteratorStep(iter);
                if (next === false) {
                  break;
                }
                var nextValue = next.value;
                try {
                  _call(adder, set, nextValue);
                } catch (e) {
                  ES.IteratorClose(iter, true);
                  throw e;
                }
              }
            }
          }
        };
        var collectionShims = {
          Map: (function() {
            var empty = {};
            var MapEntry = function MapEntry(key, value) {
              this.key = key;
              this.value = value;
              this.next = null;
              this.prev = null;
            };
            MapEntry.prototype.isRemoved = function isRemoved() {
              return this.key === empty;
            };
            var isMap = function isMap(map) {
              return !!map._es6map;
            };
            var requireMapSlot = function requireMapSlot(map, method) {
              if (!ES.TypeIsObject(map) || !isMap(map)) {
                throw new TypeError('Method Map.prototype.' + method + ' called on incompatible receiver ' + ES.ToString(map));
              }
            };
            var MapIterator = function MapIterator(map, kind) {
              requireMapSlot(map, '[[MapIterator]]');
              this.head = map._head;
              this.i = this.head;
              this.kind = kind;
            };
            MapIterator.prototype = {next: function next() {
                var i = this.i,
                    kind = this.kind,
                    head = this.head,
                    result;
                if (typeof this.i === 'undefined') {
                  return {
                    value: void 0,
                    done: true
                  };
                }
                while (i.isRemoved() && i !== head) {
                  i = i.prev;
                }
                while (i.next !== head) {
                  i = i.next;
                  if (!i.isRemoved()) {
                    if (kind === 'key') {
                      result = i.key;
                    } else if (kind === 'value') {
                      result = i.value;
                    } else {
                      result = [i.key, i.value];
                    }
                    this.i = i;
                    return {
                      value: result,
                      done: false
                    };
                  }
                }
                this.i = void 0;
                return {
                  value: void 0,
                  done: true
                };
              }};
            addIterator(MapIterator.prototype);
            var Map$prototype;
            var MapShim = function Map() {
              if (!(this instanceof Map)) {
                throw new TypeError('Constructor Map requires "new"');
              }
              if (this && this._es6map) {
                throw new TypeError('Bad construction');
              }
              var map = emulateES6construct(this, Map, Map$prototype, {
                _es6map: true,
                _head: null,
                _storage: emptyObject(),
                _size: 0
              });
              var head = new MapEntry(null, null);
              head.next = head.prev = head;
              map._head = head;
              if (arguments.length > 0) {
                addIterableToMap(Map, map, arguments[0]);
              }
              return map;
            };
            Map$prototype = MapShim.prototype;
            Value.getter(Map$prototype, 'size', function() {
              if (typeof this._size === 'undefined') {
                throw new TypeError('size method called on incompatible Map');
              }
              return this._size;
            });
            defineProperties(Map$prototype, {
              get: function get(key) {
                requireMapSlot(this, 'get');
                var fkey = fastkey(key);
                if (fkey !== null) {
                  var entry = this._storage[fkey];
                  if (entry) {
                    return entry.value;
                  } else {
                    return;
                  }
                }
                var head = this._head,
                    i = head;
                while ((i = i.next) !== head) {
                  if (ES.SameValueZero(i.key, key)) {
                    return i.value;
                  }
                }
              },
              has: function has(key) {
                requireMapSlot(this, 'has');
                var fkey = fastkey(key);
                if (fkey !== null) {
                  return typeof this._storage[fkey] !== 'undefined';
                }
                var head = this._head,
                    i = head;
                while ((i = i.next) !== head) {
                  if (ES.SameValueZero(i.key, key)) {
                    return true;
                  }
                }
                return false;
              },
              set: function set(key, value) {
                requireMapSlot(this, 'set');
                var head = this._head,
                    i = head,
                    entry;
                var fkey = fastkey(key);
                if (fkey !== null) {
                  if (typeof this._storage[fkey] !== 'undefined') {
                    this._storage[fkey].value = value;
                    return this;
                  } else {
                    entry = this._storage[fkey] = new MapEntry(key, value);
                    i = head.prev;
                  }
                }
                while ((i = i.next) !== head) {
                  if (ES.SameValueZero(i.key, key)) {
                    i.value = value;
                    return this;
                  }
                }
                entry = entry || new MapEntry(key, value);
                if (ES.SameValue(-0, key)) {
                  entry.key = +0;
                }
                entry.next = this._head;
                entry.prev = this._head.prev;
                entry.prev.next = entry;
                entry.next.prev = entry;
                this._size += 1;
                return this;
              },
              'delete': function(key) {
                requireMapSlot(this, 'delete');
                var head = this._head,
                    i = head;
                var fkey = fastkey(key);
                if (fkey !== null) {
                  if (typeof this._storage[fkey] === 'undefined') {
                    return false;
                  }
                  i = this._storage[fkey].prev;
                  delete this._storage[fkey];
                }
                while ((i = i.next) !== head) {
                  if (ES.SameValueZero(i.key, key)) {
                    i.key = i.value = empty;
                    i.prev.next = i.next;
                    i.next.prev = i.prev;
                    this._size -= 1;
                    return true;
                  }
                }
                return false;
              },
              clear: function clear() {
                requireMapSlot(this, 'clear');
                this._size = 0;
                this._storage = emptyObject();
                var head = this._head,
                    i = head,
                    p = i.next;
                while ((i = p) !== head) {
                  i.key = i.value = empty;
                  p = i.next;
                  i.next = i.prev = head;
                }
                head.next = head.prev = head;
              },
              keys: function keys() {
                requireMapSlot(this, 'keys');
                return new MapIterator(this, 'key');
              },
              values: function values() {
                requireMapSlot(this, 'values');
                return new MapIterator(this, 'value');
              },
              entries: function entries() {
                requireMapSlot(this, 'entries');
                return new MapIterator(this, 'key+value');
              },
              forEach: function forEach(callback) {
                requireMapSlot(this, 'forEach');
                var context = arguments.length > 1 ? arguments[1] : null;
                var it = this.entries();
                for (var entry = it.next(); !entry.done; entry = it.next()) {
                  if (context) {
                    _call(callback, context, entry.value[1], entry.value[0], this);
                  } else {
                    callback(entry.value[1], entry.value[0], this);
                  }
                }
              }
            });
            addIterator(Map$prototype, Map$prototype.entries);
            return MapShim;
          }()),
          Set: (function() {
            var isSet = function isSet(set) {
              return set._es6set && typeof set._storage !== 'undefined';
            };
            var requireSetSlot = function requireSetSlot(set, method) {
              if (!ES.TypeIsObject(set) || !isSet(set)) {
                throw new TypeError('Set.prototype.' + method + ' called on incompatible receiver ' + ES.ToString(set));
              }
            };
            var Set$prototype;
            var SetShim = function Set() {
              if (!(this instanceof Set)) {
                throw new TypeError('Constructor Set requires "new"');
              }
              if (this && this._es6set) {
                throw new TypeError('Bad construction');
              }
              var set = emulateES6construct(this, Set, Set$prototype, {
                _es6set: true,
                '[[SetData]]': null,
                _storage: emptyObject()
              });
              if (!set._es6set) {
                throw new TypeError('bad set');
              }
              if (arguments.length > 0) {
                addIterableToSet(Set, set, arguments[0]);
              }
              return set;
            };
            Set$prototype = SetShim.prototype;
            var decodeKey = function(key) {
              var k = key;
              if (k === '^null') {
                return null;
              } else if (k === '^undefined') {
                return void 0;
              } else {
                var first = k.charAt(0);
                if (first === '$') {
                  return _strSlice(k, 1);
                } else if (first === 'n') {
                  return +_strSlice(k, 1);
                } else if (first === 'b') {
                  return k === 'btrue';
                }
              }
              return +k;
            };
            var ensureMap = function ensureMap(set) {
              if (!set['[[SetData]]']) {
                var m = set['[[SetData]]'] = new collectionShims.Map();
                _forEach(keys(set._storage), function(key) {
                  var k = decodeKey(key);
                  m.set(k, k);
                });
                set['[[SetData]]'] = m;
              }
              set._storage = null;
            };
            Value.getter(SetShim.prototype, 'size', function() {
              requireSetSlot(this, 'size');
              if (this._storage) {
                return keys(this._storage).length;
              }
              ensureMap(this);
              return this['[[SetData]]'].size;
            });
            defineProperties(SetShim.prototype, {
              has: function has(key) {
                requireSetSlot(this, 'has');
                var fkey;
                if (this._storage && (fkey = fastkey(key)) !== null) {
                  return !!this._storage[fkey];
                }
                ensureMap(this);
                return this['[[SetData]]'].has(key);
              },
              add: function add(key) {
                requireSetSlot(this, 'add');
                var fkey;
                if (this._storage && (fkey = fastkey(key)) !== null) {
                  this._storage[fkey] = true;
                  return this;
                }
                ensureMap(this);
                this['[[SetData]]'].set(key, key);
                return this;
              },
              'delete': function(key) {
                requireSetSlot(this, 'delete');
                var fkey;
                if (this._storage && (fkey = fastkey(key)) !== null) {
                  var hasFKey = _hasOwnProperty(this._storage, fkey);
                  return (delete this._storage[fkey]) && hasFKey;
                }
                ensureMap(this);
                return this['[[SetData]]']['delete'](key);
              },
              clear: function clear() {
                requireSetSlot(this, 'clear');
                if (this._storage) {
                  this._storage = emptyObject();
                }
                if (this['[[SetData]]']) {
                  this['[[SetData]]'].clear();
                }
              },
              values: function values() {
                requireSetSlot(this, 'values');
                ensureMap(this);
                return this['[[SetData]]'].values();
              },
              entries: function entries() {
                requireSetSlot(this, 'entries');
                ensureMap(this);
                return this['[[SetData]]'].entries();
              },
              forEach: function forEach(callback) {
                requireSetSlot(this, 'forEach');
                var context = arguments.length > 1 ? arguments[1] : null;
                var entireSet = this;
                ensureMap(entireSet);
                this['[[SetData]]'].forEach(function(value, key) {
                  if (context) {
                    _call(callback, context, key, key, entireSet);
                  } else {
                    callback(key, key, entireSet);
                  }
                });
              }
            });
            defineProperty(SetShim.prototype, 'keys', SetShim.prototype.values, true);
            addIterator(SetShim.prototype, SetShim.prototype.values);
            return SetShim;
          }())
        };
        if (globals.Map || globals.Set) {
          var mapAcceptsArguments = valueOrFalseIfThrows(function() {
            return new Map([[1, 2]]).get(1) === 2;
          });
          if (!mapAcceptsArguments) {
            var OrigMapNoArgs = globals.Map;
            globals.Map = function Map() {
              if (!(this instanceof Map)) {
                throw new TypeError('Constructor Map requires "new"');
              }
              var m = new OrigMapNoArgs();
              if (arguments.length > 0) {
                addIterableToMap(Map, m, arguments[0]);
              }
              delete m.constructor;
              Object.setPrototypeOf(m, globals.Map.prototype);
              return m;
            };
            globals.Map.prototype = create(OrigMapNoArgs.prototype);
            defineProperty(globals.Map.prototype, 'constructor', globals.Map, true);
            Value.preserveToString(globals.Map, OrigMapNoArgs);
          }
          var testMap = new Map();
          var mapUsesSameValueZero = (function() {
            var m = new Map([[1, 0], [2, 0], [3, 0], [4, 0]]);
            m.set(-0, m);
            return m.get(0) === m && m.get(-0) === m && m.has(0) && m.has(-0);
          }());
          var mapSupportsChaining = testMap.set(1, 2) === testMap;
          if (!mapUsesSameValueZero || !mapSupportsChaining) {
            var origMapSet = Map.prototype.set;
            overrideNative(Map.prototype, 'set', function set(k, v) {
              _call(origMapSet, this, k === 0 ? 0 : k, v);
              return this;
            });
          }
          if (!mapUsesSameValueZero) {
            var origMapGet = Map.prototype.get;
            var origMapHas = Map.prototype.has;
            defineProperties(Map.prototype, {
              get: function get(k) {
                return _call(origMapGet, this, k === 0 ? 0 : k);
              },
              has: function has(k) {
                return _call(origMapHas, this, k === 0 ? 0 : k);
              }
            }, true);
            Value.preserveToString(Map.prototype.get, origMapGet);
            Value.preserveToString(Map.prototype.has, origMapHas);
          }
          var testSet = new Set();
          var setUsesSameValueZero = (function(s) {
            s['delete'](0);
            s.add(-0);
            return !s.has(0);
          }(testSet));
          var setSupportsChaining = testSet.add(1) === testSet;
          if (!setUsesSameValueZero || !setSupportsChaining) {
            var origSetAdd = Set.prototype.add;
            Set.prototype.add = function add(v) {
              _call(origSetAdd, this, v === 0 ? 0 : v);
              return this;
            };
            Value.preserveToString(Set.prototype.add, origSetAdd);
          }
          if (!setUsesSameValueZero) {
            var origSetHas = Set.prototype.has;
            Set.prototype.has = function has(v) {
              return _call(origSetHas, this, v === 0 ? 0 : v);
            };
            Value.preserveToString(Set.prototype.has, origSetHas);
            var origSetDel = Set.prototype['delete'];
            Set.prototype['delete'] = function SetDelete(v) {
              return _call(origSetDel, this, v === 0 ? 0 : v);
            };
            Value.preserveToString(Set.prototype['delete'], origSetDel);
          }
          var mapSupportsSubclassing = supportsSubclassing(globals.Map, function(M) {
            var m = new M([]);
            m.set(42, 42);
            return m instanceof M;
          });
          var mapFailsToSupportSubclassing = Object.setPrototypeOf && !mapSupportsSubclassing;
          var mapRequiresNew = (function() {
            try {
              return !(globals.Map() instanceof globals.Map);
            } catch (e) {
              return e instanceof TypeError;
            }
          }());
          if (globals.Map.length !== 0 || mapFailsToSupportSubclassing || !mapRequiresNew) {
            var OrigMap = globals.Map;
            globals.Map = function Map() {
              if (!(this instanceof Map)) {
                throw new TypeError('Constructor Map requires "new"');
              }
              var m = new OrigMap();
              if (arguments.length > 0) {
                addIterableToMap(Map, m, arguments[0]);
              }
              delete m.constructor;
              Object.setPrototypeOf(m, Map.prototype);
              return m;
            };
            globals.Map.prototype = OrigMap.prototype;
            defineProperty(globals.Map.prototype, 'constructor', globals.Map, true);
            Value.preserveToString(globals.Map, OrigMap);
          }
          var setSupportsSubclassing = supportsSubclassing(globals.Set, function(S) {
            var s = new S([]);
            s.add(42, 42);
            return s instanceof S;
          });
          var setFailsToSupportSubclassing = Object.setPrototypeOf && !setSupportsSubclassing;
          var setRequiresNew = (function() {
            try {
              return !(globals.Set() instanceof globals.Set);
            } catch (e) {
              return e instanceof TypeError;
            }
          }());
          if (globals.Set.length !== 0 || setFailsToSupportSubclassing || !setRequiresNew) {
            var OrigSet = globals.Set;
            globals.Set = function Set() {
              if (!(this instanceof Set)) {
                throw new TypeError('Constructor Set requires "new"');
              }
              var s = new OrigSet();
              if (arguments.length > 0) {
                addIterableToSet(Set, s, arguments[0]);
              }
              delete s.constructor;
              Object.setPrototypeOf(s, Set.prototype);
              return s;
            };
            globals.Set.prototype = OrigSet.prototype;
            defineProperty(globals.Set.prototype, 'constructor', globals.Set, true);
            Value.preserveToString(globals.Set, OrigSet);
          }
          var mapIterationThrowsStopIterator = !valueOrFalseIfThrows(function() {
            return (new Map()).keys().next().done;
          });
          if (typeof globals.Map.prototype.clear !== 'function' || new globals.Set().size !== 0 || new globals.Map().size !== 0 || typeof globals.Map.prototype.keys !== 'function' || typeof globals.Set.prototype.keys !== 'function' || typeof globals.Map.prototype.forEach !== 'function' || typeof globals.Set.prototype.forEach !== 'function' || isCallableWithoutNew(globals.Map) || isCallableWithoutNew(globals.Set) || typeof(new globals.Map().keys().next) !== 'function' || mapIterationThrowsStopIterator || !mapSupportsSubclassing) {
            defineProperties(globals, {
              Map: collectionShims.Map,
              Set: collectionShims.Set
            }, true);
          }
          if (globals.Set.prototype.keys !== globals.Set.prototype.values) {
            defineProperty(globals.Set.prototype, 'keys', globals.Set.prototype.values, true);
          }
          addIterator(Object.getPrototypeOf((new globals.Map()).keys()));
          addIterator(Object.getPrototypeOf((new globals.Set()).keys()));
          if (functionsHaveNames && globals.Set.prototype.has.name !== 'has') {
            var anonymousSetHas = globals.Set.prototype.has;
            overrideNative(globals.Set.prototype, 'has', function has(key) {
              return _call(anonymousSetHas, this, key);
            });
          }
        }
        defineProperties(globals, collectionShims);
        addDefaultSpecies(globals.Map);
        addDefaultSpecies(globals.Set);
      }
      var throwUnlessTargetIsObject = function throwUnlessTargetIsObject(target) {
        if (!ES.TypeIsObject(target)) {
          throw new TypeError('target must be an object');
        }
      };
      var ReflectShims = {
        apply: function apply() {
          return ES.Call(ES.Call, null, arguments);
        },
        construct: function construct(constructor, args) {
          if (!ES.IsConstructor(constructor)) {
            throw new TypeError('First argument must be a constructor.');
          }
          var newTarget = arguments.length > 2 ? arguments[2] : constructor;
          if (!ES.IsConstructor(newTarget)) {
            throw new TypeError('new.target must be a constructor.');
          }
          return ES.Construct(constructor, args, newTarget, 'internal');
        },
        deleteProperty: function deleteProperty(target, key) {
          throwUnlessTargetIsObject(target);
          if (supportsDescriptors) {
            var desc = Object.getOwnPropertyDescriptor(target, key);
            if (desc && !desc.configurable) {
              return false;
            }
          }
          return delete target[key];
        },
        enumerate: function enumerate(target) {
          throwUnlessTargetIsObject(target);
          return new ObjectIterator(target, 'key');
        },
        has: function has(target, key) {
          throwUnlessTargetIsObject(target);
          return key in target;
        }
      };
      if (Object.getOwnPropertyNames) {
        Object.assign(ReflectShims, {ownKeys: function ownKeys(target) {
            throwUnlessTargetIsObject(target);
            var keys = Object.getOwnPropertyNames(target);
            if (ES.IsCallable(Object.getOwnPropertySymbols)) {
              _pushApply(keys, Object.getOwnPropertySymbols(target));
            }
            return keys;
          }});
      }
      var callAndCatchException = function ConvertExceptionToBoolean(func) {
        return !throwsError(func);
      };
      if (Object.preventExtensions) {
        Object.assign(ReflectShims, {
          isExtensible: function isExtensible(target) {
            throwUnlessTargetIsObject(target);
            return Object.isExtensible(target);
          },
          preventExtensions: function preventExtensions(target) {
            throwUnlessTargetIsObject(target);
            return callAndCatchException(function() {
              Object.preventExtensions(target);
            });
          }
        });
      }
      if (supportsDescriptors) {
        var internalGet = function get(target, key, receiver) {
          var desc = Object.getOwnPropertyDescriptor(target, key);
          if (!desc) {
            var parent = Object.getPrototypeOf(target);
            if (parent === null) {
              return void 0;
            }
            return internalGet(parent, key, receiver);
          }
          if ('value' in desc) {
            return desc.value;
          }
          if (desc.get) {
            return ES.Call(desc.get, receiver);
          }
          return void 0;
        };
        var internalSet = function set(target, key, value, receiver) {
          var desc = Object.getOwnPropertyDescriptor(target, key);
          if (!desc) {
            var parent = Object.getPrototypeOf(target);
            if (parent !== null) {
              return internalSet(parent, key, value, receiver);
            }
            desc = {
              value: void 0,
              writable: true,
              enumerable: true,
              configurable: true
            };
          }
          if ('value' in desc) {
            if (!desc.writable) {
              return false;
            }
            if (!ES.TypeIsObject(receiver)) {
              return false;
            }
            var existingDesc = Object.getOwnPropertyDescriptor(receiver, key);
            if (existingDesc) {
              return Reflect.defineProperty(receiver, key, {value: value});
            } else {
              return Reflect.defineProperty(receiver, key, {
                value: value,
                writable: true,
                enumerable: true,
                configurable: true
              });
            }
          }
          if (desc.set) {
            _call(desc.set, receiver, value);
            return true;
          }
          return false;
        };
        Object.assign(ReflectShims, {
          defineProperty: function defineProperty(target, propertyKey, attributes) {
            throwUnlessTargetIsObject(target);
            return callAndCatchException(function() {
              Object.defineProperty(target, propertyKey, attributes);
            });
          },
          getOwnPropertyDescriptor: function getOwnPropertyDescriptor(target, propertyKey) {
            throwUnlessTargetIsObject(target);
            return Object.getOwnPropertyDescriptor(target, propertyKey);
          },
          get: function get(target, key) {
            throwUnlessTargetIsObject(target);
            var receiver = arguments.length > 2 ? arguments[2] : target;
            return internalGet(target, key, receiver);
          },
          set: function set(target, key, value) {
            throwUnlessTargetIsObject(target);
            var receiver = arguments.length > 3 ? arguments[3] : target;
            return internalSet(target, key, value, receiver);
          }
        });
      }
      if (Object.getPrototypeOf) {
        var objectDotGetPrototypeOf = Object.getPrototypeOf;
        ReflectShims.getPrototypeOf = function getPrototypeOf(target) {
          throwUnlessTargetIsObject(target);
          return objectDotGetPrototypeOf(target);
        };
      }
      if (Object.setPrototypeOf && ReflectShims.getPrototypeOf) {
        var willCreateCircularPrototype = function(object, lastProto) {
          var proto = lastProto;
          while (proto) {
            if (object === proto) {
              return true;
            }
            proto = ReflectShims.getPrototypeOf(proto);
          }
          return false;
        };
        Object.assign(ReflectShims, {setPrototypeOf: function setPrototypeOf(object, proto) {
            throwUnlessTargetIsObject(object);
            if (proto !== null && !ES.TypeIsObject(proto)) {
              throw new TypeError('proto must be an object or null');
            }
            if (proto === Reflect.getPrototypeOf(object)) {
              return true;
            }
            if (Reflect.isExtensible && !Reflect.isExtensible(object)) {
              return false;
            }
            if (willCreateCircularPrototype(object, proto)) {
              return false;
            }
            Object.setPrototypeOf(object, proto);
            return true;
          }});
      }
      var defineOrOverrideReflectProperty = function(key, shim) {
        if (!ES.IsCallable(globals.Reflect[key])) {
          defineProperty(globals.Reflect, key, shim);
        } else {
          var acceptsPrimitives = valueOrFalseIfThrows(function() {
            globals.Reflect[key](1);
            globals.Reflect[key](NaN);
            globals.Reflect[key](true);
            return true;
          });
          if (acceptsPrimitives) {
            overrideNative(globals.Reflect, key, shim);
          }
        }
      };
      Object.keys(ReflectShims).forEach(function(key) {
        defineOrOverrideReflectProperty(key, ReflectShims[key]);
      });
      if (functionsHaveNames && globals.Reflect.getPrototypeOf.name !== 'getPrototypeOf') {
        var originalReflectGetProto = globals.Reflect.getPrototypeOf;
        overrideNative(globals.Reflect, 'getPrototypeOf', function getPrototypeOf(target) {
          return _call(originalReflectGetProto, globals.Reflect, target);
        });
      }
      if (globals.Reflect.setPrototypeOf) {
        if (valueOrFalseIfThrows(function() {
          globals.Reflect.setPrototypeOf(1, {});
          return true;
        })) {
          overrideNative(globals.Reflect, 'setPrototypeOf', ReflectShims.setPrototypeOf);
        }
      }
      if (globals.Reflect.defineProperty) {
        if (!valueOrFalseIfThrows(function() {
          var basic = !globals.Reflect.defineProperty(1, 'test', {value: 1});
          var extensible = typeof Object.preventExtensions !== 'function' || !globals.Reflect.defineProperty(Object.preventExtensions({}), 'test', {});
          return basic && extensible;
        })) {
          overrideNative(globals.Reflect, 'defineProperty', ReflectShims.defineProperty);
        }
      }
      if (globals.Reflect.construct) {
        if (!valueOrFalseIfThrows(function() {
          var F = function F() {};
          return globals.Reflect.construct(function() {}, [], F) instanceof F;
        })) {
          overrideNative(globals.Reflect, 'construct', ReflectShims.construct);
        }
      }
      if (String(new Date(NaN)) !== 'Invalid Date') {
        var dateToString = Date.prototype.toString;
        var shimmedDateToString = function toString() {
          var valueOf = +this;
          if (valueOf !== valueOf) {
            return 'Invalid Date';
          }
          return ES.Call(dateToString, this);
        };
        overrideNative(Date.prototype, 'toString', shimmedDateToString);
      }
      var stringHTMLshims = {
        anchor: function anchor(name) {
          return ES.CreateHTML(this, 'a', 'name', name);
        },
        big: function big() {
          return ES.CreateHTML(this, 'big', '', '');
        },
        blink: function blink() {
          return ES.CreateHTML(this, 'blink', '', '');
        },
        bold: function bold() {
          return ES.CreateHTML(this, 'b', '', '');
        },
        fixed: function fixed() {
          return ES.CreateHTML(this, 'tt', '', '');
        },
        fontcolor: function fontcolor(color) {
          return ES.CreateHTML(this, 'font', 'color', color);
        },
        fontsize: function fontsize(size) {
          return ES.CreateHTML(this, 'font', 'size', size);
        },
        italics: function italics() {
          return ES.CreateHTML(this, 'i', '', '');
        },
        link: function link(url) {
          return ES.CreateHTML(this, 'a', 'href', url);
        },
        small: function small() {
          return ES.CreateHTML(this, 'small', '', '');
        },
        strike: function strike() {
          return ES.CreateHTML(this, 'strike', '', '');
        },
        sub: function sub() {
          return ES.CreateHTML(this, 'sub', '', '');
        },
        sup: function sub() {
          return ES.CreateHTML(this, 'sup', '', '');
        }
      };
      _forEach(Object.keys(stringHTMLshims), function(key) {
        var method = String.prototype[key];
        var shouldOverwrite = false;
        if (ES.IsCallable(method)) {
          var output = _call(method, '', ' " ');
          var quotesCount = _concat([], output.match(/"/g)).length;
          shouldOverwrite = output !== output.toLowerCase() || quotesCount > 2;
        } else {
          shouldOverwrite = true;
        }
        if (shouldOverwrite) {
          overrideNative(String.prototype, key, stringHTMLshims[key]);
        }
      });
      var JSONstringifiesSymbols = (function() {
        if (!hasSymbols) {
          return false;
        }
        var stringify = typeof JSON === 'object' && typeof JSON.stringify === 'function' ? JSON.stringify : null;
        if (!stringify) {
          return false;
        }
        if (typeof stringify(Symbol()) !== 'undefined') {
          return true;
        }
        if (stringify([Symbol()]) !== '[null]') {
          return true;
        }
        var obj = {a: Symbol()};
        obj[Symbol()] = true;
        if (stringify(obj) !== '{}') {
          return true;
        }
        return false;
      }());
      var JSONstringifyAcceptsObjectSymbol = valueOrFalseIfThrows(function() {
        if (!hasSymbols) {
          return true;
        }
        return JSON.stringify(Object(Symbol())) === '{}' && JSON.stringify([Object(Symbol())]) === '[{}]';
      });
      if (JSONstringifiesSymbols || !JSONstringifyAcceptsObjectSymbol) {
        var origStringify = JSON.stringify;
        overrideNative(JSON, 'stringify', function stringify(value) {
          if (typeof value === 'symbol') {
            return;
          }
          var replacer;
          if (arguments.length > 1) {
            replacer = arguments[1];
          }
          var args = [value];
          if (!isArray(replacer)) {
            var replaceFn = ES.IsCallable(replacer) ? replacer : null;
            var wrappedReplacer = function(key, val) {
              var parsedValue = replaceFn ? _call(replaceFn, this, key, val) : val;
              if (typeof parsedValue !== 'symbol') {
                if (Type.symbol(parsedValue)) {
                  return assignTo({})(parsedValue);
                } else {
                  return parsedValue;
                }
              }
            };
            args.push(wrappedReplacer);
          } else {
            args.push(replacer);
          }
          if (arguments.length > 2) {
            args.push(arguments[2]);
          }
          return origStringify.apply(this, args);
        });
      }
      return globals;
    }));
  })($__require('process'));
  global.define = __define;
  return module.exports;
});

System.registerDynamic("npm:es6-shim@0.34.2", ["npm:es6-shim@0.34.2/es6-shim"], true, function($__require, exports, module) {
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  module.exports = $__require('npm:es6-shim@0.34.2/es6-shim');
  global.define = __define;
  return module.exports;
});

System.register('laxar', ['npm:babel-runtime@5.8.34/core-js/object/keys', 'angular', './lib/logging/log', './lib/directives/directives', './lib/event_bus/event_bus', './lib/file_resource_provider/file_resource_provider', './lib/i18n/i18n', './lib/loaders/widget_loader', './lib/utilities/assert', './lib/utilities/configuration', './lib/utilities/fn', './lib/utilities/object', './lib/utilities/path', './lib/utilities/storage', './lib/utilities/string', './lib/runtime/runtime', './lib/runtime/runtime_dependencies', './lib/runtime/controls_service', './lib/runtime/theme_manager', './lib/widget_adapters/adapters'], function (_export) {var _Object$keys, ng, log, directives, eventBus, fileResourceProvider, i18n, widgetLoader, assert, configuration, fn, object, path, storage, string, runtime, runtimeDependencies, controlsService, themeManager, adapters, 























































































































   _tooling; /**
              * Bootstraps AngularJS on the current `window.document` and sets up the LaxarJS runtime. All AngularJS
              * module names of widgets that are passed to this method will be passed to `angular.bootstrap` as initial
              * dependencies, along with internal laxar modules. This is needed because AngularJS currently doesn't
              * support lazy loading of modules. The `portal_angular_dependencies` grunt task of LaxarJS will collect
              * all widgets reachable for the given `flow.json`, define them as dependencies of an amd module, that will
              * return the names of their respective AngularJS modules. This list of module names can simply be passed
              * to the `boostrap` method.
              *
              * @memberOf laxar
              *
              * @param {String[]} widgetModules
              *    all AngularJS modules that should instantly be loaded (most probably the widgets)
              * @param {{create: Function}[]} optionalWidgetAdapters
              *    an optional array of user-defined widget adapter modules
              */function bootstrap(widgetModules, optionalWidgetAdapters) {setInstanceIdLogTag();findAndLogDeprecatedSettings();log.trace('Bootstrapping LaxarJS...');if (optionalWidgetAdapters && Array.isArray(optionalWidgetAdapters)) {adapters.addAdapters(optionalWidgetAdapters);}var dependencies = [runtime.module.name, runtimeDependencies.name];_Object$keys(widgetModules).forEach(function (technology) {var adapter = adapters.getFor(technology);if (!adapter) {log.error('Unknown widget technology: [0]', technology);return;}var module = adapter.bootstrap(widgetModules[technology]);if (module && module.name) {dependencies.push(module.name);}});ng.element(document).ready(function bootstrap() {ng.bootstrap(document, dependencies);});} ///////////////////////////////////////////////////////////////////////////////////////////////////////////
   function findAndLogDeprecatedSettings() {var deprecatedConfiguration = { 'event_bus.timeout_ms': 'eventBusTimeoutMs', 'file_resource_provider.listings': 'fileListings', 'file_resource_provider.fileListings': 'fileListings', 'file_resource_provider.useEmbedded': 'useEmbeddedFileListings', 'portal.useMergedCss': 'useMergedCss', 'portal.theme': 'theme', 'portal.flow.entryPoint': 'flow.entryPoint', 'portal.flow.exitPoints': 'flow.exitPoints' }; // Obtain global object in strict mode: http://stackoverflow.com/questions/3277182/
      /*jshint evil:true*/var global = new Function('return this')();ng.forEach(deprecatedConfiguration, function (newLocation, oldLocation) {var oldValue = object.path(global.laxar, oldLocation);if (oldValue !== undefined) {log.warn('Found deprecated configuration key "[0]". Use "[1]" instead.', oldLocation, newLocation);var newValue = object.path(global.laxar, newLocation);if (newValue === undefined) {object.setPath(global.laxar, newLocation, oldValue);}}});} ///////////////////////////////////////////////////////////////////////////////////////////////////////////
   function setInstanceIdLogTag() {var instanceIdStorageKey = 'axLogTags.INST';var store = storage.getApplicationSessionStorage();var instanceId = store.getItem(instanceIdStorageKey);if (!instanceId) {instanceId = '' + new Date().getTime() + Math.floor(Math.random() * 100);store.setItem(instanceIdStorageKey, instanceId);}log.addTag('INST', instanceId);} // API to leverage tooling support.
   // Not for direct use by widgets/activities!
   //  - laxar-mocks needs this for widget tests
   //  - laxar-patterns needs this to have the same (mocked) q version as the event bus
   return { setters: [function (_babelRuntimeCoreJsObjectKeys) {_Object$keys = _babelRuntimeCoreJsObjectKeys['default'];}, function (_angular) {ng = _angular['default'];}, function (_libLoggingLog) {log = _libLoggingLog['default'];}, function (_libDirectivesDirectives) {directives = _libDirectivesDirectives;}, function (_libEvent_busEvent_bus) {eventBus = _libEvent_busEvent_bus;}, function (_libFile_resource_providerFile_resource_provider) {fileResourceProvider = _libFile_resource_providerFile_resource_provider;}, function (_libI18nI18n) {i18n = _libI18nI18n;}, function (_libLoadersWidget_loader) {widgetLoader = _libLoadersWidget_loader;}, function (_libUtilitiesAssert) {assert = _libUtilitiesAssert['default'];}, function (_libUtilitiesConfiguration) {configuration = _libUtilitiesConfiguration;}, function (_libUtilitiesFn) {fn = _libUtilitiesFn['default'];}, function (_libUtilitiesObject) {object = _libUtilitiesObject;}, function (_libUtilitiesPath) {path = _libUtilitiesPath;}, function (_libUtilitiesStorage) {storage = _libUtilitiesStorage['default'];}, function (_libUtilitiesString) {string = _libUtilitiesString;}, function (_libRuntimeRuntime) {runtime = _libRuntimeRuntime['default'];}, function (_libRuntimeRuntime_dependencies) {runtimeDependencies = _libRuntimeRuntime_dependencies;}, function (_libRuntimeControls_service) {controlsService = _libRuntimeControls_service;}, function (_libRuntimeTheme_manager) {themeManager = _libRuntimeTheme_manager;}, function (_libWidget_adaptersAdapters) {adapters = _libWidget_adaptersAdapters;}], execute: function () {/**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 * Copyright 2015 aixigo AG
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 * Released under the MIT license.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 * http://laxarjs.org/license
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 */'use strict';_tooling = { controlsService: controlsService, eventBus: eventBus, fileResourceProvider: fileResourceProvider, path: path, themeManager: themeManager, widgetAdapters: adapters, widgetLoader: widgetLoader, runtimeDependenciesModule: runtimeDependencies, provideQ: function provideQ() {return runtime.api.provideQ();} }; ///////////////////////////////////////////////////////////////////////////////////////////////////////////
         _export('assert', assert);_export('bootstrap', bootstrap);_export('configuration', configuration);_export('directives', directives);_export('fn', fn);_export('i18n', i18n);_export('log', log);_export('object', object);_export('storage', storage);_export('string', string);_export('_tooling', _tooling);} };});
