/**
 * Copyright 2014 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
define( [
   'jquery',
   'angular-mocks',
   '../utilities/fn',
   '../utilities/object',
   '../utilities/string',
   '../event_bus/event_bus',
   '../logging/log',
   '../widget_adapters/adapters',
   '../loaders/widget_loader',
   '../runtime/theme_manager',
   './portal_mocks'
], function( $, angularMocks, fn, object, string, eventBusModule, log, adapters, widgetLoaderModule, themeManager, portalMocks ) {
   'use strict';

   var TICK_CONSTANT = 101;

   log.setLogThreshold( log.level.TRACE );

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   /** @deprecated: this should be removed in the future */
   function createWidgetConfigurationMock() {
      return {
         id: 'testWidgetId',
         specification: {
            name: 'test/test_widget',
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
         }
      };
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   /**
    * Creates a test bed for widget controller tests.
    *
    * @param {String} widgetPathOrModule
    *    The path that can be used to load this widget into a page (e.g. 'ax-some-widget', 'laxar/my_widget').
    *    For backwards-compatibility, an old-style widget module name starting with 'widgets.' may be given
    *    instead (See LaxarJS/laxar#153).
    * @param {String} [controllerName]
    *    the name of the controller. If omitted, "Controller" will be used
    *
    * @return {Object}
    *    A controller test bed having the following properties:
    *
    *    @property {Object}   featureMock  The configured widget features
    *    @property {Object}   eventBusMock The message bus
    *    @property {Object}   injections   Services to inject into the controller
    *    @property {Object}   scope        The controller scope
    *    @property {Function} controller   The controller
    *    @property {Object}   widgetMock   The widget specification @deprecated
    */
   function createControllerTestBed( widgetPathOrModule, controllerName ) {
      jasmine.Clock.useMock();
      mockDebounce();

      var widgetPath;
      var moduleName;
      var fullControllerName;
      if( widgetPathOrModule.indexOf( 'widgets.' ) === 0 ) {
         // old style module name (pre LaxarJS/laxar#153)
         moduleName = widgetPathOrModule;
         widgetPath = moduleName.replace( /^widgets\./, '' ).replace( /\./g, '/' );
         fullControllerName = moduleName + '.' + ( controllerName || 'Controller' );
      }
      else {
         widgetPath = widgetPathOrModule;
         var widget = widgetPath.replace( /(.*[/])?([^/]*)/, '$2' );
         // derive the module from the directory name
         moduleName = widget.replace( /(.)[_-]([a-z])/g, function( _, $1, $2 ) {
            return $1 + $2.toUpperCase();
         } );
         var upperCaseModuleName = moduleName.charAt( 0 ).toUpperCase() + moduleName.slice( 1 );
         fullControllerName = upperCaseModuleName + 'Controller';
      }

      var testBed = {
         moduleName: moduleName,
         controllerName: fullControllerName,
         widgetMock: createWidgetConfigurationMock(),
         tick: function( milliseconds ) {
            jasmine.Clock.tick( milliseconds || 0 );
         },
         nextTick: function() {
            testBed.tick( TICK_CONSTANT );
         },
         // copy of jquery, so that spying on $ methods in widget tests has no effect on the test bed
         $: $.extend( {}, $ )
      };

      initTestBed( testBed );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      /** @deprecated widget.json is always used */
      testBed.useWidgetJson = function() {};

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      testBed.setup = function( optionalOptions ) {

         var options = testBed.options = object.options( optionalOptions, {
            defaultLanguageTag: 'en',
            simulatePortalEvents: false,
            theme: 'default',
            onBeforeControllerCreation: null
         } );

         testBed.eventBusMock = createEventBusMock( testBed );

         var widgetConfiguration = {
            id: testBed.widgetMock.id,
            widget: widgetPath,
            area: 'testArea',
            features: object.deepClone( testBed.featuresMock )
         };

         testBed.onBeforeControllerCreation =
            options.onBeforeControllerCreation || testBed.onBeforeControllerCreation || function() {};

         getWidgetLoader( testBed ).load( widgetConfiguration )
            .then( function() {
               testBed.validationFailed = false;
            }, function( err ) {
               testBed.validationFailed = err;
            } );

         jasmine.Clock.tick( 0 );
         if( testBed.validationFailed ) {
            throw testBed.validationFailed;
         }

         if( options.simulatePortalEvents ) {
            simulatePortalEvents( testBed, options );
         }

      };

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      testBed.tearDown = function() {
         if( testBed.scope && testBed.scope.$destroy ) {
            testBed.scope.$destroy();
         }

         initTestBed( testBed );
         eventBusModule.init( null, null, null );
      };

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      return testBed;
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   /**
    * Publish the following events, which would normally be published by the runtime.
    *  - `didChangeAreaVisibility.testArea.true`
    *  - `didChangeLocale.default` (only if a defaultLanguageTag was given to `testBed.setup`)
    *  - `didChangeTheme.default`
    *  - `beginLifecycleRequest.default`
    *  - `didNavigate.default` with place `testPlace`
    */
   function simulatePortalEvents( testBed, options ) {
      var eventOptions = { sender: 'AxFlowController' };
      var next = mockQ().when();
      next = next.then( function() {
         var visibilityEvent = [ 'didChangeAreaVisibility', 'testArea', 'true' ].join( '.' );
         testBed.eventBusMock.publish( visibilityEvent, {
            area: 'testArea',
            visible: true
         }, { sender: 'VisibilityManager' } );
      } );
      if( options.defaultLanguageTag ) {
         next = next.then( function() {
            return testBed.eventBusMock.publish( 'didChangeLocale.default', {
               locale: 'default',
               languageTag: options.defaultLanguageTag
            }, eventOptions );
         } );
      }
      next.then( function() {
         return testBed.eventBusMock.publish( 'didChangeTheme.default', {
            theme: 'default'
         }, eventOptions );
      } ).then( function() {
         return testBed.eventBusMock.publishAndGatherReplies( 'beginLifecycleRequest.default', {
            lifecycleId: 'default'
         }, eventOptions );
      } ).then( function() {
         return testBed.eventBusMock.publish( 'didNavigate.default', {
            target: 'default',
            place: 'testPlace',
            data: {}
         }, eventOptions );
      } );
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   /**
    * Creates a mock implementation of the Q API.
    * @see https://github.com/kriskowal/q
    *
    * @return {Object} A Q mock implementation.
    */
   function mockQ( scope ) {
      return scope ? wrapQ( portalMocks.mockQ(), scope ) : portalMocks.mockQ();
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function mockAngularTimeout( scope ) {
      var mockTick = portalMocks.mockTick();
      var $timeoutMock = function( callback, timeout ) {
         var cancelled = false;
         mockTick( function() {
            if( !cancelled ) {
               scope.$apply( callback );
            }
         }, timeout );

         return {
            cancel: function() { cancelled = true; }
         };
      };
      return $timeoutMock;
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   /**
    * Install an underscore-compatible debounce-mock function that supports the mock-clock.
    * The debounce-mock offers a `debounce.force` method, to process all debounced callbacks on demand.
    * Additionally, there is a `debounce.waiting` array, to inspect waiting calls with their args.
    */
   function mockDebounce() {

      fn.debounce = debounceMock;
      fn.debounce.force = forceAll;

      fn.debounce.waiting = [];
      function forceAll() {
         fn.debounce.waiting.forEach( function( waiting ) { waiting.force(); } );
         fn.debounce.waiting = [];
      }

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      function putWaiting( f, context, args, timeout ) {
         var waiting = { force: null, args: args, timeout: timeout };
         waiting.force = function() {
            f.apply( context, args );
            window.clearTimeout( timeout );
            // force should be idempotent
            waiting.force = function() {};
         };
         fn.debounce.waiting.push( waiting );
      }

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      function removeWaiting( timeout ) {
         fn.debounce.waiting = fn.debounce.waiting.filter( function( waiting ) {
            return waiting.timeout !== timeout;
         } );
      }

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      /**
       * An underscore-compatible debounce that uses the jasmine mock clock.
       *
       * @param {Function} func
       *    The function to debounce
       * @param {Number} wait
       *    How long to wait for calls to settle (in mock milliseconds) before calling through.
       * @param immediate
       *    `true` if the function should be called through immediately, but not after its last invocation
       *
       * @returns {Function}
       *    a debounced proxy to `func`
       */
      function debounceMock( func, wait, immediate ) {
         var timeout, result;
         return function debounceMockProxy() {
            var context = this;
            var args = arguments;
            var timestamp = jasmine.Clock.installed.nowMillis;
            var later = function() {
               var last = jasmine.Clock.installed.nowMillis - timestamp;
               if( last < wait ) {
                  timeout = window.setTimeout( later, wait - last );
                  putWaiting( func, context, args, timeout );
               }
               else {
                  removeWaiting( timeout );
                  timeout = null;
                  if( !immediate ) {
                     result = func.apply(context, args);
                  }
               }
            };

            var callNow = immediate && !timeout;
            if( !timeout ) {
               timeout = window.setTimeout( later, wait );
               putWaiting( func, context, args, timeout );
            }
            if( callNow ) {
               if( timeout ) { removeWaiting( timeout ); }
               result = func.apply( context, args );
            }
            return result;
         };
      }

   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function wrapQ( q, scope ) {
      var wrapper = object.options( {}, q );
      var originalDefer = wrapper.defer;

      wrapper.defer = function() {
         var deferred = originalDefer.apply( wrapper, arguments );
         var originalResolve = deferred.resolve;

         deferred.resolve = function() {
            var resolved = originalResolve.apply( deferred, arguments );
            if( scope.$$phase === null ) {
               scope.$digest();
            }

            return resolved;
         };

         return deferred;
      };

      return wrapper;
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function initTestBed( testBed ) {
      testBed.featuresMock = {};
      testBed.injections = {};

      delete testBed.scope;
      delete testBed.controller;

      return testBed;
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function createEventBusMock( testBed ) {
      var timeoutFunction = function( cb, timeout ) {
         setTimeout( function() {
            cb();
            if( !testBed.scope.$$phase ) {
               testBed.scope.$digest();
            }
         }, timeout || 0 );
      };
      eventBusModule.init( portalMocks.mockQ(), timeoutFunction, timeoutFunction );

      var eventBusMock = eventBusModule.create();

      spyOn( eventBusMock, 'subscribe' ).andCallThrough();
      spyOn( eventBusMock, 'publish' ).andCallThrough();
      spyOn( eventBusMock, 'publishAndGatherReplies' ).andCallThrough();

      return eventBusMock;
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   var cache = {};
   var misses = {};
   function getWidgetLoader( testBed ) {
      var q = portalMocks.mockQ();
      var fileResourceProvider = {
         provide: function( url ) {
            var deferred = q.defer();
            if( cache[ url ] ) {
               deferred.resolve( object.deepClone( cache[ url ] ) );
            }
            else if( misses[ url ] ) {
               deferred.reject( misses[ url ] );
            }
            else {
               // Support for very old servers: undefined by default to infer type from response header.
               var dataTypeGuess;
               if( url.indexOf( '.json' ) === url.length - 5 ) {
                  dataTypeGuess = 'json';
               }
               testBed.$.support.cors = true;
               testBed.$.ajax( {
                  url: url,
                  dataType: dataTypeGuess,
                  async: false,
                  success: function( data ) {
                     cache[ url ] = object.deepClone( data );
                     deferred.resolve( data );
                  },
                  error: function( xhr, status, err ) {
                     misses[ url ] = err;
                     deferred.reject( err );
                  }
               } );
            }

            return deferred.promise;
         },
         isAvailable: function( url ) {
            return fileResourceProvider.provide( url )
               .then( function() {
                  return true;
               }, function() {
                  return false;
               } );
         }
      };

      adapters.addAdapters( [ portalMocksAngularAdapter( testBed ) ] );

      return widgetLoaderModule
         .create( q, fileResourceProvider, themeManager.create( fileResourceProvider, q, 'default' ), { load: function() {} }, testBed.eventBusMock );
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function mockVisibilityService() {
      var mockVisibility = false;
      var showHandler = function( visible ) {};
      var hideHandler = function( visible ) {};
      var changeHandler = function( visible ) {};

      var mock = {
         handlerFor: function() {
            var handlerMock = {
               onShow: function( f ) { showHandler = f; },
               onHide: function( f ) { hideHandler = f; },
               onChange: function( f ) { changeHandler = f; },
               isVisible: function() { return mockVisibility; }
            };
            spyOn( handlerMock, 'onShow' ).andCallThrough();
            spyOn( handlerMock, 'onHide' ).andCallThrough();
            spyOn( handlerMock, 'onChange' ).andCallThrough();
            spyOn( handlerMock, 'isVisible' ).andCallThrough();
            return handlerMock;
         },
         _setMockVisibility: function( newValue ) {
            if( newValue === mockVisibility ) {
               return;
            }
            mockVisibility = newValue;
            if( newValue ) {
               showHandler( true );
               changeHandler( true );
            }
            else {
               hideHandler( false );
               changeHandler( false );
            }

         }
      };

      spyOn( mock, 'handlerFor' ).andCallThrough();

      return mock;
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   var $rootScope = null;
   var $provide;
   var $controller;

   function portalMocksAngularAdapter( testBed ) {

      function create( environment ) {

         if( !testBed._moduleCreated ) {
            angularMocks.module( testBed.moduleName, function( _$provide_ ) {
               $provide = _$provide_;
               $provide.service( 'axGlobalEventBus', function() { return testBed.eventBusMock; } );
            } );
            angularMocks.inject( function( _$rootScope_, _$controller_ ) {
               angularMocks.inject( testBed.onBeforeControllerCreation );
               $rootScope = _$rootScope_;
               // Initialize i18n for i18n controls in non-i18n widgets
               $rootScope.i18n = {
                  locale: 'default',
                  tags: {
                     'default': testBed.options.defaultLanguageTag
                  }
               };
               $controller = _$controller_;
            } );
            testBed._moduleCreated = true;
         }

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         function createController() {
            var scope = testBed.scope = $rootScope.$new();
            var eventBus = testBed.scope.eventBus = environment.context.eventBus;

            var injections = object.options( testBed.injections, {
               $scope: scope,
               $q: mockQ( scope ),
               $timeout: mockAngularTimeout( scope ),
               axTimestamp: portalMocks.mockTimestamp,
               axContext: environment.context,
               axEventBus: eventBus
            } );

            scope.features = environment.context.features;
            scope.id = environment.context.id;
            scope.widget = environment.context.widget;

            spyOn( eventBus, 'subscribe' ).andCallThrough();
            spyOn( eventBus, 'publish' ).andCallThrough();
            spyOn( eventBus, 'publishAndGatherReplies' ).andCallThrough();

            testBed.controller = $controller( testBed.controllerName, injections );
            scope.$digest();
         }

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         return {
            createController: createController
         };
      }

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      return {
         create: create,
         technology: 'angular'
      };
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   return {
      addMatchersTo: portalMocks.addMatchersTo,
      any: portalMocks.any,
      anyRemaining: portalMocks.anyRemaining,
      mockTick: portalMocks.mockTick,
      mockHttp: portalMocks.mockHttp,
      mockTimestamp: portalMocks.mockTimestamp,

      mockVisibilityService: mockVisibilityService,
      createControllerTestBed: createControllerTestBed,
      mockDebounce: mockDebounce,
      mockQ: mockQ
   };

} );
