/**
 * Copyright 2016 aixigo AG
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
import ng from 'angular';
import { create as createEventBus } from '../event_bus/event_bus';
import { create as createFrp } from '../file_resource_provider/file_resource_provider';
import * as i18n from '../i18n/i18n';
// TODO: should be changed to "import * as log" as soon as default export in log is removed
import log from '../logging/log';
import * as object from '../utilities/object';
import * as path from '../utilities/path';
import * as layoutLoader from '../loaders/layout_loader';
import * as paths from '../loaders/paths';
import * as configuration from '../utilities/configuration';
import * as controlsService from './controls_service';
import * as themeManager from './theme_manager';

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
 */
module.factory( 'axHeartbeat', [
   '$window', '$rootScope', 'axPageService',
   function( $window, $rootScope, pageService ) {
      var nextQueue = [];
      var beatRequested = false;

      var rootScopeDigested = false;
      $rootScope.$watch( function() {
         rootScopeDigested = true;
      } );

      /**
       * Schedules a function for the next heartbeat. If no heartbeat was triggered yet, it will be
       * requested now.
       *
       * @param {Function} func
       *    a function to schedule for the next tick
       *
       * @memberOf axHeartbeat
       */
      function onNext( func ) {
         if( !beatRequested ) {
            beatRequested = true;
            $window.setTimeout( function() {
               while( beforeQueue.length ) { beforeQueue.shift()(); }
               // The outer loop handles events published from apply-callbacks (watchers, promises).
               do {
                  while( nextQueue.length ) { nextQueue.shift()(); }

                  rootScopeDigested = false;
                  var pageController = pageService.controller();
                  if( pageController ) {
                     pageController.applyViewChanges();
                  }
                  // Since LaxarJS itself still heavily depends on AngularJS and its digest cycle concept,
                  // we need to make sure that a digest cycle is triggered, even if there is no widget
                  // based on angular technology requesting it. This can be removed as soon as
                  // https://github.com/LaxarJS/laxar/issues/216 is fixed
                  if( !rootScopeDigested ) {
                     $rootScope.$apply();
                  }
               }
               while( nextQueue.length );
               while( afterQueue.length ) { afterQueue.shift()(); }
               beatRequested = false;
            }, 0 );
         }
         nextQueue.push( func );
      }

      var beforeQueue = [];

      /**
       * Schedules a function to be called before the next heartbeat occurs. Note that `func` may never be
       * called, if there is no next heartbeat.
       *
       * @param {Function} func
       *    a function to call before the next heartbeat
       *
       * @memberOf axHeartbeat
       */
      function onBeforeNext( func ) {
         beforeQueue.push( func );
      }

      var afterQueue = [];

      /**
       * Schedules a function to be called after the next heartbeat occured. Note that `func` may never be
       * called, if there is no next heartbeat.
       *
       * @param {Function} func
       *    a function to call after the next heartbeat
       *
       * @memberOf axHeartbeat
       */
      function onAfterNext( func ) {
         afterQueue.push( func );
      }

      return {
         onBeforeNext: onBeforeNext,
         onNext: onNext,
         onAfterNext: onAfterNext
      };
   }
] );

///////////////////////////////////////////////////////////////////////////////////////////////////////////

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
 */
module.factory( 'axTimestamp', function() {
   return function() {
      return new Date().getTime();
   };
} );

///////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Provides access to the control-implementation-modules used by a widget.
 * Further documentation on the api can be found at the *controls_service* module api doc.
 *
 * @name axControls
 * @injection
 */
module.factory( 'axControls', [ 'axFileResourceProvider', function( fileResourceProvider ) {
   return controlsService.create( fileResourceProvider );
} ] );

///////////////////////////////////////////////////////////////////////////////////////////////////////////

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
 */
module.factory( 'axGlobalEventBus', [
   '$injector', '$window', 'axHeartbeat', 'axConfiguration',
   function( $injector, $window, heartbeat, configuration ) {
      // LaxarJS/laxar#48: Use event bus ticks instead of $apply to run promise callbacks
      const $q = $injector.invoke( $qProvider_.$get, $qProvider_, {
         $rootScope: {
            $evalAsync: heartbeat.onNext
         }
      } );

      const eventBus = createEventBus( $q, heartbeat.onNext, ( f, t ) => {
         // MSIE Bug, we have to wrap set timeout to pass assertion
         $window.setTimeout( f, t );
      }, {
         pendingDidTimeout: configuration.get( 'eventBusTimeoutMs', 120*1000 )
      } );
      eventBus.setErrorHandler( eventBusErrorHandler );

      return eventBus;
} ] );

///////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Provides access to the global configuration, otherwise accessible via the *configuration* module.
 * Further documentation can be found there.
 *
 * @name axConfiguration
 * @injection
 */
module.factory( 'axConfiguration', [ function() {
   return configuration;
} ] );

///////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Provides access to the i18n api, otherwise accessible via the *i18n* module. Further documentation can
 * be found there.
 *
 * @name axI18n
 * @injection
 */
module.factory( 'axI18n', [ function() {
   return i18n;
} ] );

///////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * A global, pre-configured file resource provider instance. Further documentation on the api can
 * be found at the *file_resource_provider* module api doc.
 *
 * This service has already all the file listings configured under `window.laxar.fileListings`. These can
 * either be uris to listing JSON files or already embedded JSON objects of the directory tree.
 *
 * @name axFileResourceProvider
 * @injection
 */
module.factory( 'axFileResourceProvider', [
   '$q', '$http', 'axConfiguration',
   function( $q, $http, configuration ) {
      const provider = createFrp( $q, $http, paths.PRODUCT );
      const listings = configuration.get( 'fileListings' );
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

/**
 * Provides access to the configured theme and theme relevant assets via a theme manager instance. Further
 * documentation on the api can be found at the *theme_manager* module api doc.
 *
 * @name axThemeManager
 * @injection
 */
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
 */
module.factory( 'axLayoutLoader', [
   '$templateCache', 'axCssLoader', 'axThemeManager', 'axFileResourceProvider',
   function( $templateCache, cssLoader, themeManager, fileResourceProvider ) {
      return layoutLoader.create(
         paths.LAYOUTS, paths.THEMES, cssLoader, themeManager, fileResourceProvider, $templateCache
      );
   }
] );

///////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * A service to load css files on demand during development. If a merged release css file has already been
 * loaded (marked with a `data-ax-merged-css` html attribute at the according `link` tag) or `useMergedCss`
 * is configured as `true`, the `load` method will simply be a noop. In the latter case the merged css file
 * will be loaded once by this service.
 *
 * @name axCssLoader
 * @injection
 */
module.factory( 'axCssLoader', [ 'axConfiguration', 'axThemeManager', function( configuration, themeManager ) {
   var mergedCssFileLoaded = [].some.call( document.getElementsByTagName( 'link' ), function( link ) {
      return link.hasAttribute( 'data-ax-merged-css' );
   } );

   if( mergedCssFileLoaded ) {
      return { load: function() {} };
   }

   var loadedFiles = [];
   var loader = {
      /**
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
       */
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

/**
 * Overrides the default `$exceptionHandler` service of AngularJS, using the LaxarJS logger for output.
 *
 * @name $exceptionHandler
 * @injection
 * @private
 */
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

export const name = module.name;
export default module;
