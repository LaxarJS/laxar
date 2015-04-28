/**
 * Copyright 2014 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
define( [
   './console_channel',
   '../utilities/assert',
   '../utilities/object',
   '../runtime/configuration'
], function( consoleChannel, assert, object, configuration ) {
   'use strict';


   var slice = Array.prototype.slice;
   var level = {
      TRACE: 100,
      DEBUG: 200,
      INFO: 300,
      WARN: 400,
      ERROR: 500,
      FATAL: 600
   };

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   /**
    * Constructor for a logger.
    *
    * @constructor
    */
   function Logger() {
      this.queueSize_ = 100;
      this.channels_ = [ consoleChannel ];
      this.counter_ = 0;
      this.messageQueue_ = [];
      this.threshold_ = 0;
      this.tags_ = {};

      this.level = object.options( configuration.get( 'logging.levels', {} ), level );
      this.levelToName_ = ( function( logger, levels ) {
         var result = {};
         object.forEach( levels, function( level, levelName ) {
            logger[ levelName.toLowerCase() ] = function() {
               var args = [ level ].concat( slice.call( arguments, 0 ) );
               return this.log.apply( this, args );
            };
            result[ level ] = levelName;
         } );
         return result;
      } )( this, this.level );

      this.setLogThreshold( configuration.get( 'logging.threshold', 'INFO' ) );
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   /**
    * Creates and returns a new logger instance.
    * Intended for testing purposes.
    *
    * @return {Logger}
    */
   Logger.prototype.create = function() {
      return new Logger();
   };

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   /**
    * Logs a message. A message may contain placeholders in the form `[#]` where `#` resembles the index
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
         level: this.levelToName_[ level ],
         text: message,
         replacements: slice.call( arguments, 2 ) || [],
         time: new Date(),
         tags: this.gatherTags(),
         sourceInfo: gatherSourceInformation()
      };
      this.channels_.forEach( function( channel ) {
         channel( messageObject );
      } );

      if( this.messageQueue_.length === this.queueSize_ ) {
         this.messageQueue_.shift();
      }
      this.messageQueue_.push( messageObject );
   };

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   /**
    * Logs a message in log level `TRACE`. See {@link #log} for further information.
    *
    * @param {String} message
    *    the message to log
    * @param {...*} replacements
    *    objects that should replace placeholders within the message
    */
   Logger.prototype.trace = function() {};

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   /**
    * Logs a message in log level `DEBUG`. See {@link #log} for further information.
    *
    * @param {String} message
    *    the message to log
    * @param {...*} replacements
    *    objects that should replace placeholders within the message
    */
   Logger.prototype.debug = function() {};

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   /**
    * Logs a message in log level `INFO`. See {@link #log} for further information.
    *
    * @param {String} message
    *    the message to log
    * @param {...*} replacements
    *    objects that should replace placeholders within the message
    */
   Logger.prototype.info = function() {};

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   /**
    * Logs a message in log level `WARN`. See {@link #log} for further information.
    *
    * @param {String} message
    *    the message to log
    * @param {...*} replacements
    *    objects that should replace placeholders within the message
    */
   Logger.prototype.warn = function() {};

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   /**
    * Logs a message in log level `ERROR`. See {@link #log} for further information.
    *
    * @param {String} message
    *    the message to log
    * @param {...*} replacements
    *    objects that should replace placeholders within the message
    */
   Logger.prototype.error = function() {};

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   /**
    * Logs a message in log level `FATAL`. See {@link #log} for further information.
    *
    * @param {String} message
    *    the message to log
    * @param {...*} replacements
    *    objects that should replace placeholders within the message
    */
   Logger.prototype.fatal = function() {};

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
    * Adds a value for a log tag. If a tag is already known, the value is appended to the existing one using a
    * `;` as separator. Note that no formatting of the value takes place and a non-string value will just have
    * its appropriate `toString` method called.
    *
    * @param {String} tag
    *    the id of the tag to add a value for
    * @param {String} value
    *    the value to add
    */
   Logger.prototype.addTag = function( tag, value ) {
      assert( tag ).hasType( String ).isNotNull();

      if( !this.tags_[ tag ] ) {
         this.tags_[ tag ] = [ value ];
      }
      else {
         this.tags_[ tag ].push( value );
      }
   };

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   /**
    * Sets a value for a log tag. If a tag is already known, the value is overwritten by the given one. Note
    * that no formatting of the value takes place and a non-string value will just have its appropriate
    * `toString` method called.
    *
    * @param {String} tag
    *    the id of the tag to set a value for
    * @param {String} value
    *    the value to set
    */
   Logger.prototype.setTag = function( tag, value ) {
      assert( tag ).hasType( String ).isNotNull();

      this.tags_[ tag ] = [ value ];
   };

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   /**
    * Sets a value for a log tag. If a tag is already known, the value is overwritten by the given one. Note
    * that no formatting of the value takes place and a non-string value will just have its appropriate
    * `toString` method called.
    *
    * @param {String} tag
    *    the id of the tag to set a value for
    */
   Logger.prototype.removeTag = function( tag ) {
      assert( tag ).hasType( String ).isNotNull();

      delete this.tags_[ tag ];
   };

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   /**
    * Returns a map of all tags. If there are multiple values for the same tag, their values are concatenated
    * using a `;` as separator.
    *
    * @return {Object}
    *    a mapping from tag to its value(s)
    */
   Logger.prototype.gatherTags = function() {
      var tags = {};
      object.forEach( this.tags_, function( values, tag ) {
         tags[ tag ] = values.join( ';' );
      } );
      return tags;
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
         assert.state( threshold.toUpperCase() in this.level, 'Unsupported log threshold "' + threshold + '".' );

         threshold = this.level[ threshold.toUpperCase() ];
      }

      assert( threshold ).hasType( Number );

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
         if( row.file.indexOf( '/logging/log.js' ) === -1 ) {
            return row;
         }
      }

      return EMPTY_CALL_INFORMATION;
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   return new Logger();

} );
