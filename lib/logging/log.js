/**
 * Copyright 2016 aixigo AG
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
 */
import assert from '../utilities/assert';
import { forEach } from '../utilities/object';
import { create as createConsoleChannel } from './console_channel';

/**
 * By default available log levels, sorted by increasing log level:
 * - TRACE (level 100)
 * - DEBUG (level 200)
 * - INFO (level 300)
 * - WARN (level 400)
 * - ERROR (level 500)
 * - FATAL (level 600)
 *
 * @type {Object}
 * @name level
 */
export const level = {
   TRACE: 100,
   DEBUG: 200,
   INFO: 300,
   WARN: 400,
   ERROR: 500,
   FATAL: 600
};

//////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Pass this as an additional replacement parameter to a log-method to blackbox your logging call.
 * Blackboxed callers are ignored when logging the source information (file, line).
 *
 * @type {Object}
 * @name BLACKBOX
 */
export const BLACKBOX = {};

//////////////////////////////////////////////////////////////////////////////////////////////////////////////

export function create( configuration, optionalBrowser ) {
   const startChannels = optionalBrowser ? [ createConsoleChannel( optionalBrowser ) ] : [];
   return new Logger( configuration, startChannels );
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////////

// eslint-disable-next-line valid-jsdoc
/**
 * Constructor for a logger.
 *
 * @constructor
 * @private
 */
function Logger( configuration, channels = [] ) {
   this.level = { ...level, ...configuration.get( 'logging.levels' ) };

   this.queueSize_ = 100;
   this.channels_ = channels;
   this.counter_ = 0;
   this.messageQueue_ = [];
   this.threshold_ = 0;
   this.tags_ = {};

   this.levelToName_ = ( levels => {
      const result = {};
      forEach( levels, ( level, levelName ) => {
         this[ levelName.toLowerCase() ] = ( ...args ) => {
            this.log( level, ...args, BLACKBOX );
         };
         result[ level ] = levelName;
      } );
      return result;
   } )( this.level );

   this.setLogThreshold( configuration.ensure( 'logging.threshold' ) );
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////////

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
 */
Logger.prototype.log = function( level, message, ...replacements ) {
   if( level < this.threshold_ ) {
      return;
   }

   let blackboxDepth = 0;
   while( replacements[ replacements.length - 1 ] === BLACKBOX ) {
      ++blackboxDepth;
      replacements.pop();
   }

   const messageObject = {
      id: this.counter_++,
      level: this.levelToName_[ level ],
      text: message,
      replacements,
      time: new Date(),
      tags: this.gatherTags(),
      sourceInfo: gatherSourceInformation( blackboxDepth + 1 ) // add 1 depth to exclude this function
   };

   this.channels_.forEach( channel => {
      channel( messageObject );
   } );

   if( this.messageQueue_.length === this.queueSize_ ) {
      this.messageQueue_.shift();
   }
   this.messageQueue_.push( messageObject );
};

//////////////////////////////////////////////////////////////////////////////////////////////////////////////

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
 */
Logger.prototype.trace = function() {};

//////////////////////////////////////////////////////////////////////////////////////////////////////////////

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
 */
Logger.prototype.debug = function() {};

//////////////////////////////////////////////////////////////////////////////////////////////////////////////

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
 */
Logger.prototype.info = function() {};

//////////////////////////////////////////////////////////////////////////////////////////////////////////////

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
 */
Logger.prototype.warn = function() {};

//////////////////////////////////////////////////////////////////////////////////////////////////////////////

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
 */
Logger.prototype.error = function() {};

//////////////////////////////////////////////////////////////////////////////////////////////////////////////

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
 */
Logger.prototype.fatal = function() {};

//////////////////////////////////////////////////////////////////////////////////////////////////////////////

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
 */
Logger.prototype.addLogChannel = function( channel ) {
   this.channels_.push( channel );
   this.messageQueue_.forEach( entry => {
      channel( entry );
   } );
};

//////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Removes a log channel and thus stops sending further messages to it.
 *
 * @param {Function} channel
 *    the log channel to remove
 */
Logger.prototype.removeLogChannel = function( channel ) {
   const channelIndex = this.channels_.indexOf( channel );
   if( channelIndex > -1 ) {
      this.channels_.splice( channelIndex, 1 );
   }
};

//////////////////////////////////////////////////////////////////////////////////////////////////////////////

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

//////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Sets a value for a log tag. If a tag is already known, the value is overwritten by the given one. Note
 * that no formatting of the value takes place and a non-string value will just have its appropriate
 * `toString` method called. For further information on log tags, see {@link Logger#addTag}.
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

//////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Removes a log tag. For further information on log tags, see {@link Logger#addTag}.
 *
 * @param {String} tag
 *    the id of the tag to set a value for
 */
Logger.prototype.removeTag = function( tag ) {
   assert( tag ).hasType( String ).isNotNull();

   delete this.tags_[ tag ];
};

//////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Returns a map of all tags. If there are multiple values for the same tag, their values are concatenated
 * using a `;` as separator. For further information on log tags, see {@link Logger#addTag}.
 *
 * @return {Object}
 *    a mapping from tag to its value(s)
 */
Logger.prototype.gatherTags = function() {
   const tags = {};
   forEach( this.tags_, ( values, tag ) => {
      tags[ tag ] = values.join( ';' );
   } );
   return tags;
};

//////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Sets the threshold for log messages. Log messages with a lower level will be discarded upon logging.
 *
 * @param {String|Number} threshold
 *    the numeric or the string value of the log level to use as threshold
 */
Logger.prototype.setLogThreshold = function( threshold ) {
   if( typeof threshold === 'string' ) {
      assert.state( threshold.toUpperCase() in this.level, `Unsupported log threshold "${threshold}".` );
      this.threshold_ = this.level[ threshold.toUpperCase() ];
   }
   else {
      assert( threshold ).hasType( Number );
      this.threshold_ = threshold;
   }
};

//////////////////////////////////////////////////////////////////////////////////////////////////////////////

const EMPTY_CALL_INFORMATION = { file: '?', line: -1, char: -1 };

function gatherSourceInformation( blackboxDepth ) {
   let e = new Error();

   if( !e.stack ) {
      try {
         // IE >= 10 only generates a stack if the error object is really thrown
         throw new Error();
      }
      catch( err ) {
         e = err;
      }
      if( !e.stack ) {
         return EMPTY_CALL_INFORMATION;
      }
   }

   const rows = e.stack.split( /[\n]/ );
   let interpret;
   if( rows[ 0 ] === 'Error' ) {
      rows.shift();
      interpret = chromeStackInterpreter;
   }
   else if( rows[ 0 ].indexOf( '@' ) !== -1 ) {
      interpret = firefoxStackInterpreter;
   }
   else {
      return EMPTY_CALL_INFORMATION;
   }

   const row = rows[ blackboxDepth + 1 ]; // add 1 depth to exclude this function
   return row ? interpret( row ) : EMPTY_CALL_INFORMATION;
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////////

const CHROME_AND_IE_STACK_MATCHER = /\(?([^\( ]+):(\d+):(\d+)\)?$/;

function chromeStackInterpreter( row ) {
   const match = CHROME_AND_IE_STACK_MATCHER.exec( row );
   return {
      file: match ? match[ 1 ] : '?',
      line: match ? match[ 2 ] : -1,
      char: match ? match[ 3 ] : -1
   };
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////////

const FIREFOX_STACK_MATCHER = /@(.+):(\d+)$/;

function firefoxStackInterpreter( row ) {
   const match = FIREFOX_STACK_MATCHER.exec( row );
   return {
      file: match ? match[ 1 ] : '?',
      line: match ? match[ 2 ] : -1,
      char: -1
   };
}
