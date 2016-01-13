/**
 * Copyright 2016 aixigo AG
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
   var resourceCache = {};
   var resourceChacheMisses = {};

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
    * For historical reasons, a variety of invocations has to be supported:
    *
    * - preferred: directly pass the contents of the widget.json descriptor
    *              this is the only clean way, which incidentally also works for AMD-installable widgets,
    *              as they cannot rely on a category folder
    * - supported: pass the file reference for this widget:
    *              this is the path to the widget folder, relative to the RequireJS path laxar-path-widgets
    * - deprecated: pass the old-style AngularJS module name (widget.category.SomeWidget)
    *               from which the path is then guessed.
    *
    * @param {String} descriptorPathOrModule
    *    The contents of the widget.json descriptor.
    *    Alternatively (not recommended), the file reference to load this widget into a page
    *    (e.g. 'ax-some-widget', 'laxar/my_widget').
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
   function createControllerTestBed( descriptorPathOrModule, controllerName ) {
      jasmine.Clock.useMock();
      mockDebounce();

      var descriptor;
      var widgetPath;
      var moduleName;
      var fullControllerName;
      if( descriptorPathOrModule.name ) {
         // preferred call style (pass descriptor):
         descriptor = descriptorPathOrModule;
         moduleName = normalize( descriptor.name );
         widgetPath = '/' + descriptor.name;
         resourceCache[ widgetPath + '/widget.json' ] = descriptor;
         resourceChacheMisses[ widgetPath + '/default.theme/' + descriptor.name + '.html' ] = true;
         resourceChacheMisses[ widgetPath + '/default.theme/css/' + descriptor.name + '.css' ] = true;
         fullControllerName = inferControllerName( moduleName );
      }
      else if( descriptorPathOrModule.indexOf( 'widgets.' ) === 0 ) {
         // old style module name (pre LaxarJS/laxar#153)
         moduleName = descriptorPathOrModule;
         widgetPath = moduleName.replace( /^widgets\./, '' ).replace( /\./g, '/' );
         fullControllerName = moduleName + '.' + ( controllerName || 'Controller' );
      }
      else {
         // early 1.0.x style: use (local) widget reference
         widgetPath = descriptorPathOrModule;
         // derive the module from the directory name
         var widgetName = widgetPath.replace( /(.*[/])?([^/]*)/, '$2' );
         moduleName = normalize( widgetName );
         fullControllerName = inferControllerName( moduleName );
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
    * Install an `laxar.fn.debounce`-compatible debounce-mock function that supports the mock-clock.
    * The debounce-mock offers a `debounce.force` method, to process all debounced callbacks on demand.
    * Additionally, there is a `debounce.waiting` array, to inspect waiting calls.
    */
   function mockDebounce() {

      fn.debounce.force = force;
      fn.debounce.waiting = [];

      fn._nowMilliseconds = function() {
         return jasmine.Clock.installed.nowMillis;
      };

      fn._setTimeout = function( f, interval ) {
         var timeout;
         var run = function( force ) {
            if( timeout === null ) { return; }
            removeWaiting( timeout );
            window.clearTimeout( timeout );
            timeout = null;
            f( force );
         };

         timeout = window.setTimeout( run, interval );
         fn.debounce.waiting.push( run );
         run.timeout = timeout;
         return timeout;
      };

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      function force() {
         fn.debounce.waiting.forEach( function( run ) {
            run( true );
         } );
         fn.debounce.waiting.splice( 0 );
      }

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      function removeWaiting( timeout ) {
         fn.debounce.waiting = fn.debounce.waiting.filter( function( waiting ) {
            return waiting.timeout !== timeout;
         } );
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

   function getWidgetLoader( testBed ) {
      var q = portalMocks.mockQ();
      var fileResourceProvider = {
         provide: function( url ) {
            var deferred = q.defer();
            if( resourceCache[ url ] ) {
               deferred.resolve( object.deepClone( resourceCache[ url ] ) );
            }
            else if( resourceChacheMisses[ url ] ) {
               deferred.reject( resourceChacheMisses[ url ] );
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
                     resourceCache[ url ] = object.deepClone( data );
                     deferred.resolve( data );
                  },
                  error: function( xhr, status, err ) {
                     resourceChacheMisses[ url ] = err;
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
         .create( q, {
            axControls: portalMocks.mockControlsService(),
            axFileResourceProvider: fileResourceProvider,
            axThemeManager: themeManager.create( fileResourceProvider, q, 'default' ),
            axCssLoader: { load: function() {} },
            axGlobalEventBus: testBed.eventBusMock
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
               axControls: portalMocks.mockControlsService(),
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

   function normalize( widgetName ) {
      return widgetName.replace( /([a-zA-Z0-9])[-_]([a-zA-Z0-9])/g, function( $_, $1, $2 ) {
         return $1 + $2.toUpperCase();
      } ).replace( /^[A-Z]/, function( $_ ) {
         return $_.toLowerCase();
      } );
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function inferControllerName( moduleName ) {
      var upperCaseModuleName = moduleName.charAt( 0 ).toUpperCase() + moduleName.slice( 1 );
      return upperCaseModuleName + 'Controller';
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
