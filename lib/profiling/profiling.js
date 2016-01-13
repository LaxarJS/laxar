/**
 * Copyright 2016 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
define( [
   'angular',
   './output'
], function( ng, output ) {
   'use strict';

   var module = ng.module( 'axProfiling', [] );

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   var config;
   var axProfiling;
   var origWatch;
   var win;
   var out;

   module.run( [ '$rootScope', '$window', 'axConfiguration', function( $rootScope, $window, configuration ) {
      win = $window;
      config = configuration.get( 'profiling', { enabled: false } );
      out = output.create( $window );

      if( config.enabled !== true ) {
         return;
      }

      if( !win.performance || !win.performance.now ) {
         out.log( 'Performance api is not available. Profiling is disabled.' );
         return;
      }

      out.log( '%c!!! Profiling enabled. Application performance will suffer !!!',
                  'font-weight: bold; font-size: 1.2em' );
      out.log( 'Type "axProfiling.help()" to get a list of available methods' );

      var scopePrototype = $rootScope.constructor.prototype;

      axProfiling = $window.axProfiling = {
         items: {},
         widgetIdToScopeId: {},
         logWatchers: function( id ) {
            if( id && typeof id === 'string' ) {
               out.logForId( axProfiling, 'watchFn', id );
            }
            else {
               out.logAll( axProfiling, 'watchFn' );
            }
         },
         logListeners:  function( id ) {
            if( id && typeof id === 'string' ) {
               out.logForId( axProfiling, 'listener', id );
            }
            else {
               out.logAll( axProfiling, 'listener' );
            }
         },
         log:  function( id ) {
            if( id && typeof id === 'string' ) {
               out.logForId( axProfiling, null, id );
            }
            else {
               out.log( 'All listeners:' );
               out.logAll( axProfiling, 'listener' );
               out.log( 'All watchers:' );
               out.logAll( axProfiling, 'watchFn' );
            }
         },
         reset: function() {
            Object.keys( axProfiling.items )
               .forEach( function( key ) {
                  axProfiling.items[ key ].watchers
                     .forEach( function( watcher ) {
                        watcher.watchFn.time = 0;
                        watcher.watchFn.count = 0;
                        watcher.listener.time = 0;
                        watcher.listener.count = 0;
                     } );
               } );
         },
         help: printHelp
      };

      origWatch = scopePrototype.$watch;
      scopePrototype.$watch = function( watchExp, listener, objectEquality ) {
         return attachProfiling( this, watchExp, listener, objectEquality || false );
      };
   } ] );

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function attachProfiling( scope, watchExp, listener, objectEquality ) {
      var watcherIsFunction = typeof watchExp === 'function';
      var listenerIsFunction = typeof listener === 'function';

      var items = axProfiling.items;
      var context = determineContext( scope );
      if( !( scope.$id in items ) ) {
         items[ scope.$id ] = {
            context: context,
            watchers: []
         };

         scope.$on( '$destroy', function() {
            detachProfiling( scope );
            delete items[ scope.$id ];
         } );
      }


      if( context.widgetScopeId ) {
         if( !( context.widgetId in axProfiling.widgetIdToScopeId ) ) {
            axProfiling.widgetIdToScopeId[ context.widgetId ] = context.widgetScopeId;
         }
      }

      var profilingEntry = {
         watchFn: {
            type: watcherIsFunction ? 'f' : 's',
            name: watcherIsFunction ? functionName( watchExp ) + '()' : watchExp,
            time: 0,
            count: 0
         },
         listener: {
            type: listenerIsFunction ? 'f' : 's',
            name: listenerIsFunction ? functionName( listener ) + '()' : listener,
            time: 0,
            count: 0
         }
      };
      items[ scope.$id ].watchers.push( profilingEntry );

      var stopWatching = origWatch.call( scope, watchExp, listener, objectEquality );

      var watchEntry = scope.$$watchers[0];
      watchEntry.get = instrumentFunction( watchEntry.get, profilingEntry.watchFn );
      watchEntry.fn = instrumentFunction( watchEntry.fn, profilingEntry.listener );

      return function() {
         stopWatching();
         detachProfiling( scope );
      };
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function detachProfiling( scope ) {
      delete axProfiling.items[ scope.$id ];
      Object.keys( axProfiling.widgetIdToScopeId ).forEach( function( widgetId ) {
         if( axProfiling.widgetIdToScopeId[ widgetId ] === scope.$id ) {
            delete axProfiling.widgetIdToScopeId[ widgetId ];
         }
      } );
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function instrumentFunction( func, entry ) {
      return function() {
         var start = win.performance.now();
         var result = func.apply( null, arguments );
         var time = win.performance.now() - start;

         ++entry.count;
         entry.time += time;

         return result;
      };
   }

    ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function determineContext( scope ) {
      var current = scope;
      while( !current.hasOwnProperty( 'widget' ) && current !== current.$root ) {
         current = current.$parent;
      }

      var isInWidget = !!current.widget;

      return {
         widgetName: isInWidget ? current.widget.path : '',
         widgetId: isInWidget ? current.widget.id : '',
         widgetScopeId: isInWidget ? current.$id : null,
         scopeId: scope.$id
      };
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   var FUNCTION_NAME_REGEXP = /^[ ]*function([^\(]*?)\(/;
   function functionName( func ) {
      if( func.name && typeof func.name === 'string' ) {
         return func.name;
      }

      var match = FUNCTION_NAME_REGEXP.exec( func.toString() );
      if( match ) {
         return match[1].trim();
      }

      return '[anonymous]';
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function printHelp() {
      out.log(
         'Available commands:\n\n' +
         ' - help():\n' +
         '     prints this help\n\n' +
         ' - log( [scopeOrWidgetId] ):\n' +
         '     If the argument is omitted this is the same as calling\n' +
         '     logWatchers() first and logListeners() afterwards.\n' +
         '     Otherwise all listeners and watchers of the widget or scope\n' +
         '     with the given id are logged in one table\n\n' +
         ' - logWatchers( [scopeOrWidgetId] ):\n' +
         '     If the argument is omitted the watchers of all scopes belonging to\n' +
         '     a specific widget or of global scopes are logged.\n' +
         '     Otherwise more detailed data for the watchers of the given scope\n' +
         '     or widget are logged.\n\n' +
         ' - logListeners( [scopeOrWidgetId] ):\n' +
         '     If the argument is omitted the listeners of all scopes belonging to\n' +
         '     a specific widget or of global scopes are logged.\n' +
         '     Otherwise more detailed data for the listeners of the given scope\n' +
         '     or widget are logged.\n\n'+
         ' - reset():\n' +
         '     Resets all "# of executions" and millisecond data to zero.'
      );
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   return module;

} );
