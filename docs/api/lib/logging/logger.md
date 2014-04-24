# Documentation

## Logger()
@param {Object} options

## function Object() { [native code] }#context {LogContext}
The log context of this logger.


## Logger#log( level, message, replacements )
Logs a message. A message may contain placeholders in the form `[#]` where `#` ressembles the index
within the list of `replacements`. `replacements` are incrementally counted starting at `0`. If the
log level is below the configured log level the message simply is discarded.

### Parameters
- **level {Number}**: the level for this message

- **message {String}**: the message to log

- **replacements {...*}**: objects that should replace placeholders within the message


## Logger#addLogChannel( channel )
Adds a new channel to forward log messages to. A channel is called synchronously for every log message
and is responsible to trigger something asynchronously itself if necessary. Each message is an object
having the following properties:
- `id`: a unique, incremented id of the log message
- `level`: the log level of the message in string representation
- `text`: the actual message that was logged
- `replacements`: the raw list of replacements passed along the message
- `time`: JavaScript Date instance when the message was logged
- `tags`: A map of all log tags currently set on the logger's scope
- `sourceInfo`: if supported, a map containing `file`, `line` and `char` where the logging took place

### Parameters
- **channel {Function}**: the log channel to add


## Logger#removeLogChannel( channel )
Removes a log channel and thus stops sending further messages to it.

### Parameters
- **channel {Function}**: the log channel to remove


## Logger#setLogThreshold( threshold )
Sets the threshold for log messages. Log messages with a lower level will be discarded upon logging.

### Parameters
- **threshold {String|Number}**: the numeric or the string value of the log level to use as threshold
