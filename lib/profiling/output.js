/**
 * Copyright 2016 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
import ng from 'angular';

var win;

///////////////////////////////////////////////////////////////////////////////////////////////////////////

function logForId( axProfiling, wlKey, id ) {
   var profilingData = axProfiling.items;
   var isScopeId = !!id.match( /^[A-Za-z0-9]{3}$/ ) && id in profilingData;
   var scopeId = id;
   var watchers = [];

   if( isScopeId ) {
      watchers = profilingData[ id ].watchers;
   }
   else {
      scopeId = axProfiling.widgetIdToScopeId[ id ];
      watchers =
         flatMap( Object.keys( profilingData )
            .map( function( id ) {
               return profilingData[ id ];
            } )
            .filter( function( item ) {
               return item.context.widgetId === id;
            } ),
            function( item ) {
               return item.watchers;
            }
         );
   }

   var ngContext = [].slice.call( win.document.getElementsByClassName( 'ng-scope' ), 0 )
      .concat( [ win.document ] )
      .map( function( element ) {
         return {
            element: element,
            scope: ng.element( element ).scope()
         };
      } )
      .filter( function( item ) {
         return item.scope.$id === scopeId;
      } )[ 0 ] || null;

   consoleLog( 'Showing details for %s with id "%s"', isScopeId ? 'scope' : 'widget', id );

   if( ngContext ) {
      consoleLog( 'Context: Scope: %o, Element %o', ngContext.scope, ngContext.element );
   }

   var data = watchers.map( function( entry ) {
      var result = {};

      if( !wlKey || wlKey === 'watchFn' ) {
         var w = entry.watchFn;
         result[ 'Watcher' ] = w.name;
         result[ 'Watcher ms total' ] = toPrecision( w.time, 3 );
         result[ 'Watcher ms average' ] = toPrecision( average( w.time, w.count ), 3 );
         result[ 'Watcher # executions' ] = w.count;
      }

      if( !wlKey || wlKey === 'listener' ) {
         var l = entry.listener;
         result[ 'Listener' ] = l.name;
         result[ 'Listener ms total' ] = toPrecision( l.time, 3 );
         result[ 'Listener ms average' ] = toPrecision( average( l.time, l.count ), 3 );
         result[ 'Listener # executions' ] = l.count;
      }

      return result;
   } );
   logTabularData( data );
}

///////////////////////////////////////////////////////////////////////////////////////////////////////////

function logAll( axProfiling, wlKey ) {
   var profilingData = axProfiling.items;
   var data = [];
   var totalWatchFunctions = 0;
   var totalWatchExpressions = 0;
   var totalTime = 0;
   var totalExecutions = 0;

   var dataByWidgetId = {};
   ng.forEach( profilingData, function( item, key ) {
      var widgetId = item.context.widgetId;
      if( !widgetId ) {
         dataByWidgetId[ key ] = item;
         return;
      }

      if( !( widgetId in dataByWidgetId ) ) {
         dataByWidgetId[ widgetId ] = {
            context: item.context,
            watchers: []
         };
      }

      [].push.apply( dataByWidgetId[ widgetId ].watchers, item.watchers );
   } );

   ng.forEach( dataByWidgetId, function( item ) {
      var time = 0;
      var executions = 0;
      var noOfFunctions = 0;
      var noOfStrings = 0;

      item.watchers.forEach( function( entry ) {
         time += entry[ wlKey ].time;
         executions += entry[ wlKey ].count;
         noOfFunctions += entry[ wlKey ].type === 'f' ? 1 : 0;
         noOfStrings += entry[ wlKey ].type === 's' ? 1 : 0;
      }, 0 );

      data.push( {
         'Widget name': item.context.widgetName || '?',
         'Widget id': item.context.widgetId || '?',
         'Scope id': item.context.widgetScopeId || item.context.scopeId,
         '# functions': noOfFunctions,
         '# strings': noOfStrings,
         '# total:': noOfFunctions + noOfStrings,
         'ms total': toPrecision( time, 3 ),
         'ms average': toPrecision( average( time, executions ), 3 ),
         '# of executions': executions
      } );

      totalWatchFunctions += noOfFunctions;
      totalWatchExpressions += noOfStrings;
      totalTime += time;
      totalExecutions += executions;
   } );

   data.push( {
      'Widget name': '',
      'Widget id': '',
      'Scope id': 'Total:',
      '# functions': totalWatchFunctions,
      '# strings': totalWatchExpressions,
      '# total:': totalWatchFunctions + totalWatchExpressions,
      'ms total': toPrecision( totalTime, 3 ),
      'ms average': toPrecision( average( totalTime, totalExecutions ), 3 ),
      '# of executions': totalExecutions
   } );

   logTabularData( data );
}

///////////////////////////////////////////////////////////////////////////////////////////////////////////

function average( time, count ) {
   return count > 0 ? time / count : 0;
}

///////////////////////////////////////////////////////////////////////////////////////////////////////////

function toPrecision( number, precision ) {
   var factor = precision === 0 ? 1 : Math.pow( 10, precision );
   return Math.round( number * factor ) / factor;
}

///////////////////////////////////////////////////////////////////////////////////////////////////////////

function flatMap( arr, func ) {
   return Array.prototype.concat.apply( [], arr.map( func ) );
}

///////////////////////////////////////////////////////////////////////////////////////////////////////////

function consoleLog( msg, arg /*, ... */ ) {
   if( !win.console || !win.console.log ) {
      return;
   }

   // MSIE8 does not support console.log.apply( ... )
   // The following call is equivalent to: console.log.apply( console, args );
   Function.apply.apply( win.console.log, [ win.console, arguments ] );
}

///////////////////////////////////////////////////////////////////////////////////////////////////////////

function logTabularData( data ) {
   if( win.console.table ) {
      win.console.table( data );
   }
   else {
      consoleLog( JSON.stringify( data, null, 2 ) );
   }
}

///////////////////////////////////////////////////////////////////////////////////////////////////////////

export function create( windowObject ) {
   win = windowObject;

   return {
      log: consoleLog,
      logForId: logForId,
      logAll: logAll
   };
}
