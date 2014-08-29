/**
 * Copyright 2014 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
define( [
   'require',
   'jquery',
   'angular-mocks',
   '../utilities/fn',
   '../utilities/object',
   '../utilities/string',
   '../event_bus/event_bus',
   '../logging/log',
   '../logging/channels/console_logger',
   '../portal/portal_assembler/widget_adapters/angular_adapter',
   '../portal/portal_assembler/widget_loader',
   '../portal/portal_assembler/features_provider',
   '../portal/modules/theme_manager',
   './portal_mocks'
], function( require, $, angularMocks, fn, object, string, eventBusModule, log, consoleChannel, angularWidgetAdapter, widgetLoaderModule, featuresProvider, themeManager, portalMocks ) {
   'use strict';

   var TICK_CONSTANT = 101;

   log.setLogThreshold( 'DEVELOP' );
   log.addLogChannel( consoleChannel );

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
    * @param {String} moduleName
    *    the name of the module the controller belongs to
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
   function createControllerTestBed( moduleName, controllerName ) {
      jasmine.Clock.useMock();
      mockDebounce();

      var testBed = {
         moduleName: moduleName,
         controllerName: controllerName || 'Controller',
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

      testBed.usingWidgetJson = false;
      /** @deprecated This should always be enabled */
      testBed.useWidgetJson = function() {
         testBed.usingWidgetJson = true;
      };

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      testBed.setup = function( optionalOptions ) {

         var options = testBed.options = object.options( optionalOptions, {
            defaultLanguageTag: 'en',
            simulatePortalEvents: false,
            theme: 'default'
         } );

         testBed.eventBusMock = createEventBusMock( testBed );

         var widget = moduleName.replace( /^widgets\./, '' ).replace( /\./g, '/' );
         var widgetConfiguration = {
            id: 'testWidgetId',
            widget: widget,
            area: 'testArea',
            features: object.deepClone( testBed.featuresMock )
         };

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
    * Publish the following portal events, which would normally be published by the portal.
    *  - `didChangeAreaVisibility.testArea.true`
    *  - `didChangeLocale.default` (only if a defaultLanguageTag was given to `testBed.setup`)
    *  - `didChangeTheme.default`
    *  - `beginLifecycleRequest.default`
    *  - `didNavigate.default` with place `testPlace`
    */
   function simulatePortalEvents( testBed, options ) {
      var eventOptions = { sender: 'FlowController' };
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
      return function $timeoutMock( callback, timeout ) {
         mockTick( function() { scope.$apply( callback ); }, timeout  );
      };
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
            if( !testBed.usingWidgetJson && string.endsWith( url, 'widget.json' ) ) {
               var mock = object.deepClone( testBed.widgetMock.specification );
               return q.when( mock );
            }
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

      return widgetLoaderModule.create( q, fileResourceProvider, testBed.eventBusMock, {
         theme: 'default',
         adapters: {
            angular: portalMocksAngularAdapter( testBed )
         }
      } );
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

      function create( q, fileResourceProvider, specification, features, widgetConfiguration, anchorElement ) {

         if( !testBed._moduleCreated ) {
            angularMocks.module( testBed.moduleName, function( _$provide_ ) {
               $provide = _$provide_;
               $provide.service( 'EventBus', function() { return testBed.eventBusMock; } );
            } );
            angularMocks.inject( function( _$rootScope_, _$controller_ ) {
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

         function createController( widgetServices, configuration ) {
            testBed.scope = $rootScope.$new();
            var injections = object.options( testBed.injections, {
               $scope: testBed.scope,
               $q: mockQ( testBed.scope ),
               $timeout: mockAngularTimeout( testBed.scope )
            } );

            testBed.scope.features = features;
            testBed.scope.id = widgetServices.idGenerator;
            testBed.scope.widget = {
               area: widgetConfiguration.area,
               id: testBed.widgetMock.id
            };

            var eventBus = widgetServices.eventBus;
            spyOn( eventBus, 'subscribe' ).andCallThrough();
            spyOn( eventBus, 'publish' ).andCallThrough();
            spyOn( eventBus, 'publishAndGatherReplies' ).andCallThrough();

            testBed.scope.eventBus = eventBus;
            testBed.controller = $controller( testBed.moduleName + '.' + testBed.controllerName, injections );

            testBed.scope.$digest();
         }

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         return {
            createController: createController
         };
      }

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      return {
         create: create
      };
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   return {
      addMatchersTo: portalMocks.addMatchersTo,
      any: portalMocks.any,
      anyRemaining: portalMocks.anyRemaining,
      mockTick: portalMocks.mockTick,
      mockHttp: portalMocks.mockHttp,

      mockVisibilityService: mockVisibilityService,
      createControllerTestBed: createControllerTestBed,
      mockDebounce: mockDebounce,
      mockQ: mockQ
   };

} );
