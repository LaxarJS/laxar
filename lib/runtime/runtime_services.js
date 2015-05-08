/**
 * Copyright 2014 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
define( [
   'angular',
   '../event_bus/event_bus',
   '../i18n/i18n',
   '../file_resource_provider/file_resource_provider',
   '../logging/log',
   '../utilities/object',
   '../utilities/path',
   '../loaders/layout_loader',
   '../loaders/paths',
   '../utilities/configuration',
   './theme_manager'
], function(
   ng,
   eventBus,
   i18n,
   fileResourceProvider,
   log,
   object,
   path,
   layoutLoader,
   paths,
   configuration,
   themeManager
) {
   'use strict';

   var module = ng.module( 'axRuntimeServices', [] );

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   var $qProvider_;
   module.config( [ '$qProvider', '$httpProvider', function( $qProvider, $httpProvider ) {
      $qProvider_ = $qProvider;
      if( configuration.get( CONFIG_KEY_HTTP_LOGGING_HEADER ) ) {
         $httpProvider.interceptors.push( 'axLogHttpInterceptor' );
      }
   } ] );

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   module.factory( 'axHeartbeat', [ '$window', '$rootScope', function( $window, $rootScope ) {
      var nextQueue = [];
      var beatRequested = false;
      function onNext( f ) {
         if( !beatRequested ) {
            beatRequested = true;
            $window.setTimeout( function() {
               while( beforeQueue.length ) { beforeQueue.shift()(); }
               // The outer loop handles events published from apply-callbacks (watchers, promises).
               do {
                  while( nextQueue.length ) { nextQueue.shift()(); }
                  $rootScope.$apply();
               }
               while( nextQueue.length );
               while( afterQueue.length ) { afterQueue.shift()(); }
               beatRequested = false;
            }, 0 );
         }
         nextQueue.push( f );
      }

      var beforeQueue = [];
      function onBeforeNext( f ) {
         beforeQueue.push( f );
      }

      var afterQueue = [];
      function onAfterNext( f ) {
         afterQueue.push( f );
      }

      return {
         onBeforeNext: onBeforeNext,
         onNext: onNext,
         onAfterNext: onAfterNext
      };
   } ] );

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   /**
    * A timestamp function, provided as a service to support the jasmine mock clock during testing.
    * The mock-free implementation simply uses `new Date().getTime()`.
    */
   module.factory( 'axTimestamp', function() {
      return function() {
         return new Date().getTime();
      };
   } );

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   module.factory( 'axGlobalEventBus', [
      '$injector', '$window', 'axHeartbeat', 'axConfiguration',
      function( $injector, $window, heartbeat, configuration ) {
         // LaxarJS/laxar#48: Use event bus ticks instead of $apply to run promise callbacks
         var $q = $injector.invoke( $qProvider_.$get, $qProvider_, {
            $rootScope: {
               $evalAsync: heartbeat.onNext
            }
         } );

         eventBus.init( $q, heartbeat.onNext, function( f, t ) {
            // MSIE Bug, we have to wrap set timeout to pass assertion
            $window.setTimeout( f, t );
         } );

         var bus = eventBus.create( {
            pendingDidTimeout: configuration.get( 'eventBusTimeoutMs', 120*1000 )
         } );
         bus.setErrorHandler( eventBusErrorHandler );

         return bus;
   } ] );

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   module.factory( 'axConfiguration', [ function() {
      return configuration;
   } ] );

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   module.factory( 'axI18n', [ function() {
      return i18n;
   } ] );

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   module.factory( 'axFileResourceProvider', [ '$q', '$http', 'axConfiguration',
      function( $q, $http, configuration ) {
         fileResourceProvider.init( $q, $http );

         var provider = fileResourceProvider.create( paths.PRODUCT );
         var listings = configuration.get( 'fileListings' );
         if( listings ) {
            ng.forEach( listings, function( value, key ) {
               if( typeof value === 'string' ) {
                  provider.setFileListingUri( key, value );
               }
               else {
                  provider.setFileListingContents( key, value );
               }
            } );
         }

         return provider;
      }
   ] );

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   module.factory( 'axThemeManager', [
      '$q', 'axConfiguration', 'axFileResourceProvider',

      function( $q, configuration, fileResourceProvider ) {
         var theme = configuration.get( 'theme' );
         var manager = themeManager.create( fileResourceProvider, $q, theme );

         return {
            getTheme: manager.getTheme.bind( manager ),
            urlProvider: manager.urlProvider.bind( manager )
         };
      }
   ] );

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   module.factory( 'axLayoutLoader', [ '$templateCache', 'axCssLoader', 'axThemeManager', 'axFileResourceProvider',
      function( $templateCache, cssLoader, themeManager, fileResourceProvider ) {
         return layoutLoader.create(
            paths.LAYOUTS, paths.THEMES, cssLoader, themeManager, fileResourceProvider, $templateCache
         );
      }
   ] );

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   module.factory( 'axCssLoader', [ 'axConfiguration', 'axThemeManager', function( configuration, themeManager ) {
      var mergedCssFileLoaded = [].some.call( document.getElementsByTagName( 'link' ), function( link ) {
         return link.hasAttribute( 'data-ax-merged-css' );
      } );

      if( mergedCssFileLoaded ) {
         return { load: function() {} };
      }

      var loadedFiles = [];
      var loader = {
         load: function( url ) {

            if( loadedFiles.indexOf( url ) === -1 ) {
               if( hasStyleSheetLimit() ) {
                  // Here we most probably have an Internet Explorer having the limit of at most 31 stylesheets
                  // per page. As a workaround we use style tags with import statements. Each style tag may
                  // have 31 import statement. This gives us 31 * 31 = 961 possible stylesheets to include ...
                  // Link to the problem on microsoft.com: http://support.microsoft.com/kb/262161
                  // Solution based on ideas found here: http://john.albin.net/css/ie-stylesheets-not-loading

                  var styleManagerId = 'cssLoaderStyleSheet' + Math.floor( loadedFiles.length / 30 );
                  if( !document.getElementById( styleManagerId ) ) {
                     addHeadElement( 'style', {
                        type: 'text/css',
                        id: styleManagerId
                     } );
                  }

                  document.getElementById( styleManagerId ).styleSheet.addImport( url );
               }
               else {
                  addHeadElement( 'link', {
                     type: 'text/css',
                     id: 'cssLoaderStyleSheet' + loadedFiles.length,
                     rel: 'stylesheet',
                     href: url
                  } );
               }

               loadedFiles.push( url );
            }
         }
      };

      if( configuration.get( 'useMergedCss', false ) ) {
         loader.load( path.join( paths.PRODUCT, 'var/static/css', themeManager.getTheme() + '.theme.css' ) );
         return { load: function() {} };
      }

      return loader;

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      function hasStyleSheetLimit() {
         if( typeof hasStyleSheetLimit.result !== 'boolean' ) {
            hasStyleSheetLimit.result = false;
            if( document.createStyleSheet ) {
               var uaMatch = navigator.userAgent.match( /MSIE ?(\d+(\.\d+)?)[^\d]/i );
               if( !uaMatch || parseFloat( uaMatch[1] ) < 10 ) {
                  // There is no feature test for this problem without running into it. We therefore test
                  // for a browser knowing document.createStyleSheet (should only be IE) and afterwards check,
                  // if it is a version prior to 10 as the problem is fixed since that version. In any other
                  // case we assume the worst case and trigger the hack for limited browsers.
                  hasStyleSheetLimit.result = true;
               }
            }
         }
         return hasStyleSheetLimit.result;
      }

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      function addHeadElement( elementName, attributes ) {
         var element = document.createElement( elementName );
         ng.forEach( attributes, function( val, key ) {
            element[ key ] = val;
         } );
         document.getElementsByTagName( 'head' )[0].appendChild( element );
      }
   } ] );

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   /**
    * Directives should use this service to stay informed about visibility changes to their widget.
    * They should not attempt to determine their visibility from the EventBus (no DOM information),
    * nor to poll it from the browser (too expensive).
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
    */
   module.factory( 'axVisibilityService', [ 'axHeartbeat', function( heartbeat, $rootScope ) {

      /**
       * Create a DOM visibility handler for the given scope.
       *
       * @param {Object} scope
       *    The scope from which to infer visibility. Must be a widget scope or nested in a widget scope.
       * @returns {{isVisible: Function, onChange: Function, clear: Function, onShow: Function, onHide: Function}}
       */
      function handlerFor( scope ) {
         var handlerId = scope.$id;
         scope.$on( '$destroy', clear );

         // Find the widget scope among the ancestors:
         var widgetScope = scope;
         while( widgetScope !== $rootScope && !(widgetScope.widget && widgetScope.widget.area) ) {
            widgetScope = widgetScope.$parent;
         }

         var areaName = widgetScope.widget && widgetScope.widget.area;
         if( !areaName ) {
            throw new Error( 'axVisibilityService: could not determine widget area for scope: ' + handlerId );
         }

         var api = {
            /**
             * Determine if the governing widget scope's DOM is visible right now.
             * @return {Boolean}
             *    `true` if the widget associated with this handler is visible right now, else `false`.
             */
            isVisible: function() {
               return isVisible( areaName );
            },
            /**
             * Schedule a handler to be called with the new DOM visibility on any DOM visibility change
             * @param {Function<Boolean>} handler
             *    the callback to process visibility changes
             * @return {Object}
             *    this visibility handler (for chaining)
             */
            onChange: function( handler ) {
               addHandler( handlerId, areaName, handler, true );
               addHandler( handlerId, areaName, handler, false );
               return api;
            },
            /**
             * Schedule a handler to be called with the new DOM visibility when it has changed to `true`
             * @param {Function<Boolean>} handler
             *    the callback to process visibility changes
             * @return {Object}
             *    this visibility handler (for chaining)
             */
            onShow: function( handler ) {
               addHandler( handlerId, areaName, handler, true );
               return api;
            },
            /**
             * Schedule a handler to be called with the new DOM visibility when it has changed to `false`
             * @param {Function<Boolean>} handler
             *    the callback to process visibility changes
             * @return {Object}
             *    this visibility handler (for chaining)
             */
            onHide: function( handler ) {
               addHandler( handlerId, areaName, handler, false );
               return api;
            },
            clear: clear
         };

         return api;

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         function clear() {
            clearHandlers( handlerId );
            return api;
         }

      }

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      // track state to inform handlers that register after visibility for a given area was initialized
      var knownState;

      // store the registered show/hide-handlers by governing widget area
      var showHandlers;
      var hideHandlers;

      // secondary lookup-table to track removal, avoiding O(n^2) cost for deleting n handlers in a row
      var handlersById;

      return {
         isVisible: isVisible,
         handlerFor: handlerFor,
         // runtime-internal api for use by the page controller
         _updateState: updateState,
         _reset: reset
      };

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      function reset() {
         knownState = {};
         showHandlers = {};
         hideHandlers = {};
         handlersById = {};
      }

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      /**
       * Determine if the given area's content DOM is visible right now.
       * @param {String} area
       *    the full name of the widget area to query
       * @returns {Boolean}
       *    `true` if the area is visible right now, else `false`.
       */
      function isVisible( area ) {
         return knownState[ area ] || false;
      }

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      /**
       * Run all handlers registered for the given area and target state after the next heartbeat.
       * Also remove any handlers that have been cleared since the last run.
       * @private
       */
      function updateState( area, targetState ) {
         if( knownState[ area ] === targetState ) {
            return;
         }
         knownState[ area ] = targetState;
         heartbeat.onAfterNext( function() {
            var areaHandlers = ( targetState ? showHandlers : hideHandlers )[ area ];
            if( !areaHandlers ) { return; }
            for( var i = areaHandlers.length - 1; i >= 0; --i ) {
               var handlerRef = areaHandlers[ i ];
               if( handlerRef.handler === null ) {
                  areaHandlers.splice( i, 1 );
               }
               else {
                  handlerRef.handler( targetState );
               }
            }
         } );
      }

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      /**
       * Add a show/hide-handler for a given area and visibility state. Execute the handler right away if the
       * state is already known.
       * @private
       */
      function addHandler( id, area, handler, targetState ) {
         var handlerRef = { handler: handler };
         handlersById[ id ] = handlersById[ id ] || [];
         handlersById[ id ].push( handlerRef );

         var areaHandlers = targetState ? showHandlers : hideHandlers;
         areaHandlers[ area ] = areaHandlers[ area ] || [];
         areaHandlers[ area ].push( handlerRef );

         // State already known? In that case, initialize:
         if( area in knownState && knownState[ area ] === targetState ) {
            handler( targetState );
         }
      }

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      function clearHandlers( id ) {
         if( handlersById[ id ] ) {
            handlersById[ id ].forEach( function( matchingHandlerRef ) {
               matchingHandlerRef.handler = null;
            } );
         }
      }

   } ] );

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   module.factory( 'axLogHttpInterceptor', [ 'axConfiguration', function( configuration ) {
      var headerKey = configuration.get( CONFIG_KEY_HTTP_LOGGING_HEADER, null );
      return headerKey ? {
         request: function( config ) {
            var headerValue = '';
            ng.forEach( log.gatherTags(), function( tagValue, tagName ) {
               headerValue += '[' + tagName + ':' + tagValue + ']';
            } );

            if( headerValue ) {
               if( config.headers[ headerKey ] ) {
                  log.warn( 'axLogHttpInterceptor: Overwriting existing header "[0]"', headerKey );
               }
               config.headers[ headerKey ] = headerValue;
            }
            return config;
         }
      } : {};
   } ] );

   var CONFIG_KEY_HTTP_LOGGING_HEADER = 'logging.http.header';

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   module.provider( '$exceptionHandler', function() {
      var handler = function( exception, cause ) {
         var msg = exception.message || exception;
         log.error( 'There was an exception: ' + msg + ', \nstack: ' );
         log.error( exception.stack + ', \n' );
         log.error( '  Cause: ' + cause );
      };

      this.$get = [ function() {
         return handler;
      } ];
   } );

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   var sensitiveData = [ 'Published event' ];
   function eventBusErrorHandler( message, optionalErrorInformation ) {
      log.error( 'EventBus: ' + message );

      if( optionalErrorInformation ) {
         ng.forEach( optionalErrorInformation, function( info, title ) {
            var formatString = '   - [0]: [1:%o]';
            if( sensitiveData.indexOf( title ) !== -1 ) {
               formatString = '   - [0]: [1:%o:anonymize]';
            }

            log.error( formatString, title, info );

            if( info instanceof Error && info.stack ) {
               log.error( '   - Stacktrace: ' + info.stack );
            }
         } );
      }
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   return module;

} );
