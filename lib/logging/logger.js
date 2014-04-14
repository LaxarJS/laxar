/**
 * Copyright 2014 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
define( [
   './level',
   './log_context',
   '../utilities/assert',
   '../utilities/object'
], function( level, logContext, assert, object ) {
   'use strict';

   var slice = Array.prototype.slice;
   var levelToName = [];

   Object.keys( level ).forEach( function( levelName ) {
      levelToName[ level[ levelName ] ] = levelName;
   } );

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   /**
    * @param {Object} options
    * @constructor
    */
   function Logger( options ) {
      this.options_ = options;
      this.channels_ = [];
      this.counter_ = 0;
      this.messageQueue_ = [];
      this.threshold_ = 0;

      /**
       * The log context of this logger.
       *
       * @public
       * @type {LogContext}
       */
      this.context = logContext.create();
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   /**
    * Logs a message. A message may contain placeholders in the form `[#]` where `#` ressembles the index
    * within the list of `replacements`. `replacements` are incrementally counted starting at `0`. If the
    * log level is below the configured log level the message simply is discarded.
    *
    * @param {Number} level
    *    the level for this message
    * @param {String} message
    *    the message to log
    * @param {...*} replacements
    *    objects that should replace placeholders within the message
    */
   Logger.prototype.log = function( level, message, replacements ) {
      if( level < this.threshold_ ) {
          return;
      }

      var messageObject = {
         id: this.counter_++,
         level: levelToName[ level ],
         text: message,
         replacements: slice.call( arguments, 2 ) || [],
         time: new Date(),
         tags: this.context.gatherTags(),
         sourceInfo: gatherSourceInformation()
      };
      this.channels_.forEach( function( channel ) {
         channel( messageObject );
      } );

      if( this.messageQueue_.length === this.options_.queueSize ) {
         this.messageQueue_.shift();
      }
      this.messageQueue_.push( messageObject );
   };

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   /**
    * Logs a message in log level `DEVELOP`. See {@link #log} for further information.
    *
    * @param {String} message
    *    the message to log
    * @param {...*} replacements
    *    objects that should replace placeholders within the message
    *
    * @name Logger#develop
    */
   /**
    * Logs a message in log level `DATA`. See {@link #log} for further information.
    *
    * @param {String} message
    *    the message to log
    * @param {...*} replacements
    *    objects that should replace placeholders within the message
    *
    * @name Logger#data
    */
   /**
    * Logs a message in log level `TRACE`. See {@link #log} for further information.
    *
    * @param {String} message
    *    the message to log
    * @param {...*} replacements
    *    objects that should replace placeholders within the message
    *
    * @name Logger#trace
    */
   /**
    * Logs a message in log level `DEBUG`. See {@link #log} for further information.
    *
    * @param {String} message
    *    the message to log
    * @param {...*} replacements
    *    objects that should replace placeholders within the message
    *
    * @name Logger#debug
    */
   /**
    * Logs a message in log level `INFO`. See {@link #log} for further information.
    *
    * @param {String} message
    *    the message to log
    * @param {...*} replacements
    *    objects that should replace placeholders within the message
    *
    * @name Logger#info
    */
   /**
    * Logs a message in log level `WARN`. See {@link #log} for further information.
    *
    * @param {String} message
    *    the message to log
    * @param {...*} replacements
    *    objects that should replace placeholders within the message
    *
    * @name Logger#warn
    */
   /**
    * Logs a message in log level `ERROR`. See {@link #log} for further information.
    *
    * @param {String} message
    *    the message to log
    * @param {...*} replacements
    *    objects that should replace placeholders within the message
    *
    * @name Logger#error
    */
   /**
    * Logs a message in log level `FATAL`. See {@link #log} for further information.
    *
    * @param {String} message
    *    the message to log
    * @param {...*} replacements
    *    objects that should replace placeholders within the message
    *
    * @name Logger#fatal
    */
   /**
    * Logs a message in log level `STATISTICS`. See {@link #log} for further information.
    *
    * @param {String} message
    *    the message to log
    * @param {...*} replacements
    *    objects that should replace placeholders within the message
    *
    * @name Logger#statistics
    */
   /**
    * Logs a message in log level `ACCOUNT`. See {@link #log} for further information.
    *
    * @param {String} message
    *    the message to log
    * @param {...*} replacements
    *    objects that should replace placeholders within the message
    *
    * @name Logger#account
    */
   /**
    * Logs a message in log level `AUDIT`. See {@link #log} for further information.
    *
    * @param {String} message
    *    the message to log
    * @param {...*} replacements
    *    objects that should replace placeholders within the message
    *
    * @name Logger#audit
    */

   Object.keys( level ).forEach( function( levelName ) {
      Logger.prototype[ levelName.toLowerCase() ] = function() {
         var args = [ level[ levelName ] ].concat( slice.call( arguments, 0 ) );
         return this.log.apply( this, args );
      };
   } );

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   /**
    * Adds a new channel to forward log messages to. A channel is called synchronously for every log message
    * and is responsible to trigger something asynchronously itself if necessary. Each message is an object
    * having the following properties:
    * - `id`: a unique, incremented id of the log message
    * - `level`: the log level of the message in string representation
    * - `text`: the actual message that was logged
    * - `replacements`: the raw list of replacements passed along the message
    * - `time`: JavaScript Date instance when the message was logged
    * - `tags`: A map of all log tags currently set on the logger's scope
    * - `sourceInfo`: if supported, a map containing `file`, `line` and `char` where the logging took place
    *
    * @param {Function} channel
    *    the log channel to add
    */
   Logger.prototype.addLogChannel = function( channel ) {
      this.channels_.push( channel );
      this.messageQueue_.forEach( function( entry ) {
         channel( entry );
      } );
   };

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   /**
    * Removes a log channel and thus stops sending further messages to it.
    *
    * @param {Function} channel
    *    the log channel to remove
    */
   Logger.prototype.removeLogChannel = function( channel ) {
      var channelIndex = this.channels_.indexOf( channel );
      if( channelIndex > -1 ) {
         this.channels_.splice( channelIndex, 1 );
      }
   };

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   /**
    * Sets the threshold for log messages. Log messages with a lower level will be discarded upon logging.
    *
    * @param {String|Number} threshold
    *    the numeric or the string value of the log level to use as threshold
    */
   Logger.prototype.setLogThreshold = function( threshold ) {
      if( typeof threshold === 'string' ) {
         assert.state( threshold.toUpperCase() in level, 'Unsupported log threshold "' + threshold + '".' );

         threshold = level[ threshold.toUpperCase() ];
      }

      assert.state( threshold > -1 && threshold < Object.keys( level ).length,
                    'Unsupported log threshold ' + threshold + '.' );

      this.threshold_ = threshold;
   };

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   var CHROME_STACK_MATCHER = /\(?([^\( ]+\.js)\:(\d+)\:(\d+)\)?$/;
   var FIRE_FOX_STACK_MATCHER = /@(.+)\:(\d+)$/;
   var EMPTY_CALL_INFORMATION = { file: '?', line: -1, char: -1 };

   function gatherSourceInformation() {
      var e = new Error();

      if( !e.stack ) {
         return EMPTY_CALL_INFORMATION;
      }

      var rows = e.stack.split( /[\n]/ );
      var interpreterFunction;
      if( rows[0] === 'Error' ) {
         rows.splice( 0, 1 );
         interpreterFunction = function chromeStackInterpreter( row ) {
            var match = CHROME_STACK_MATCHER.exec( row );
            return {
               file: match ? match[1] : '?',
               line: match ? match[2] : -1,
               char: match ? match[3] : -1
            };
         };
      }
      else if( rows[0].indexOf( '@' ) !== -1 ) {
         interpreterFunction = function fireFoxStackInterpreter( row ) {
            var match = FIRE_FOX_STACK_MATCHER.exec( row );
            return {
               file: match ? match[1] : '?',
               line: match ? match[2] : -1,
               char: -1
            };
         };
      }
      else {
         return EMPTY_CALL_INFORMATION;
      }

      for( var i = 0; i < rows.length; ++i ) {
         var row = interpreterFunction( rows[ i ] );
         if( row.file.indexOf( '/logging/logger.js' ) === -1 ) {
            return row;
         }
      }

      return EMPTY_CALL_INFORMATION;
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   return {

      /**
       * Creates and returns a new logger instance.
       *
       * @param {Object=} optionalOptions
       *    optional map of options for the logger instance
       * @param {Number} optionalOptions.queueSize
       *    number of messages to queue for log channels that are added after messages were already logged
       *
       * @return {Logger}
       */
      create: function( optionalOptions ) {
         return new Logger( object.options( optionalOptions, {
            queueSize: 100
         } ) );
      }

   };

} );