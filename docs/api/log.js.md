
# log

An interface for logging purposes. At least for permanent logging this should always be used in favor of
`console.log` and friends, as it is cross browser secure and allows attaching multiple channels where
messages can be routed to (i.e. to send them to a server process for persistence). If available, messages
will be logged to the browser's console using a builtin console channel.

When requiring `laxar`, an instance of the `Logger` type is available as `laxar.log`.

## Contents

**Module Members**
- [- unknown -](#- unknown -)

**Types**
- [Logger](#Logger)
  - [Logger#log](#Logger#log)
  - [Logger#trace](#Logger#trace)
  - [Logger#debug](#Logger#debug)
  - [Logger#info](#Logger#info)
  - [Logger#warn](#Logger#warn)
  - [Logger#error](#Logger#error)
  - [Logger#fatal](#Logger#fatal)
  - [Logger#addLogChannel](#Logger#addLogChannel)
  - [Logger#removeLogChannel](#Logger#removeLogChannel)
  - [Logger#addTag](#Logger#addTag)
  - [Logger#setTag](#Logger#setTag)
  - [Logger#removeTag](#Logger#removeTag)
  - [Logger#gatherTags](#Logger#gatherTags)
  - [Logger#setLogThreshold](#Logger#setLogThreshold)

## Module Members
#### <a name="- unknown -"></a>- unknown -()
By default available log levels, sorted by increasing log level:
- TRACE (level 100)
- DEBUG (level 200)
- INFO (level 300)
- WARN (level 400)
- ERROR (level 500)
- FATAL (level 600)

## Types
### <a name="Logger"></a>Logger

#### <a name="Logger#log"></a>Logger#log( level, message, replacements )
Logs a message. A message may contain placeholders in the form `[#]` where `#` resembles the index
within the list of `replacements`. `replacements` are incrementally counted starting at `0`. If the
log level is below the configured log threshold, the message is simply discarded.

It is recommended not to use this method directly, but instead one of the short cut methods for the
according log level.

##### Parameters
| Property | Type | Description |
| -------- | ---- | ----------- |
| level | `Number` |  the level for this message |
| message | `String` |  the message to log |
| replacements... | `*` |  objects that should replace placeholders within the message |

#### <a name="Logger#trace"></a>Logger#trace( message, replacements )
Logs a message in log level `TRACE`. See [Logger#log](#Logger#log) for further information.

*Important note*: This method is only available, if no custom log levels were defined via
configuration or custom log levels include this method as well.

##### Parameters
| Property | Type | Description |
| -------- | ---- | ----------- |
| message | `String` |  the message to log |
| replacements... | `*` |  objects that should replace placeholders within the message |

#### <a name="Logger#debug"></a>Logger#debug( message, replacements )
Logs a message in log level `DEBUG`. See [Logger#log](#Logger#log) for further information.

*Important note*: This method is only available, if no custom log levels were defined via
configuration or custom log levels include this method as well.

##### Parameters
| Property | Type | Description |
| -------- | ---- | ----------- |
| message | `String` |  the message to log |
| replacements... | `*` |  objects that should replace placeholders within the message |

#### <a name="Logger#info"></a>Logger#info( message, replacements )
Logs a message in log level `INFO`. See [Logger#log](#Logger#log) for further information.

*Important note*: This method is only available, if no custom log levels were defined via
configuration or custom log levels include this method as well.

##### Parameters
| Property | Type | Description |
| -------- | ---- | ----------- |
| message | `String` |  the message to log |
| replacements... | `*` |  objects that should replace placeholders within the message |

#### <a name="Logger#warn"></a>Logger#warn( message, replacements )
Logs a message in log level `WARN`. See [Logger#log](#Logger#log) for further information.

*Important note*: This method is only available, if no custom log levels were defined via
configuration or custom log levels include this method as well.

##### Parameters
| Property | Type | Description |
| -------- | ---- | ----------- |
| message | `String` |  the message to log |
| replacements... | `*` |  objects that should replace placeholders within the message |

#### <a name="Logger#error"></a>Logger#error( message, replacements )
Logs a message in log level `ERROR`. See [Logger#log](#Logger#log) for further information.

*Important note*: This method is only available, if no custom log levels were defined via
configuration or custom log levels include this method as well.

##### Parameters
| Property | Type | Description |
| -------- | ---- | ----------- |
| message | `String` |  the message to log |
| replacements... | `*` |  objects that should replace placeholders within the message |

#### <a name="Logger#fatal"></a>Logger#fatal( message, replacements )
Logs a message in log level `FATAL`. See [Logger#log](#Logger#log) for further information.

*Important note*: This method is only available, if no custom log levels were defined via
configuration or custom log levels include this method as well.

##### Parameters
| Property | Type | Description |
| -------- | ---- | ----------- |
| message | `String` |  the message to log |
| replacements... | `*` |  objects that should replace placeholders within the message |

#### <a name="Logger#addLogChannel"></a>Logger#addLogChannel( channel )
Adds a new channel to forward log messages to. A channel is called synchronously for every log message
and can do whatever necessary to handle the message according to its task. Note that blocking or
performance critical actions within a channel should always take place asynchronously to prevent from
blocking the application. Ideally a web worker is used for heavier background tasks.

Each message is an object having the following properties:
- `id`: the unique, ascending id of the log message
- `level`: the log level of the message in string representation
- `text`: the actual message that was logged
- `replacements`: the raw list of replacements passed along the message
- `time`: JavaScript Date instance when the message was logged
- `tags`: A map of all log tags currently set for the logger
- `sourceInfo`: if supported, a map containing `file`, `line` and `char` where the logging took place

##### Parameters
| Property | Type | Description |
| -------- | ---- | ----------- |
| channel | `Function` |  the log channel to add |

#### <a name="Logger#removeLogChannel"></a>Logger#removeLogChannel( channel )
Removes a log channel and thus stops sending further messages to it.

##### Parameters
| Property | Type | Description |
| -------- | ---- | ----------- |
| channel | `Function` |  the log channel to remove |

#### <a name="Logger#addTag"></a>Logger#addTag( tag, value )
Adds a value for a log tag. If a tag is already known, the value is appended to the existing one using a
`;` as separator. Note that no formatting of the value takes place and a non-string value will just have
its appropriate `toString` method called.

Log tags can be used to mark a set of log messages with a value giving further information on the
current logging context. For example laxar sets a tag `'INST'` with a unique-like identifier for the
current browser client. If then for example log messages are persisted on a server, messages belonging
to the same client can be accumulated.

##### Parameters
| Property | Type | Description |
| -------- | ---- | ----------- |
| tag | `String` |  the id of the tag to add a value for |
| value | `String` |  the value to add |

#### <a name="Logger#setTag"></a>Logger#setTag( tag, value )
Sets a value for a log tag. If a tag is already known, the value is overwritten by the given one. Note
that no formatting of the value takes place and a non-string value will just have its appropriate
`toString` method called. For further information on log tags, see [Logger#addTag](#Logger#addTag).

##### Parameters
| Property | Type | Description |
| -------- | ---- | ----------- |
| tag | `String` |  the id of the tag to set a value for |
| value | `String` |  the value to set |

#### <a name="Logger#removeTag"></a>Logger#removeTag( tag )
Removes a log tag. For further information on log tags, see [Logger#addTag](#Logger#addTag).

##### Parameters
| Property | Type | Description |
| -------- | ---- | ----------- |
| tag | `String` |  the id of the tag to set a value for |

#### <a name="Logger#gatherTags"></a>Logger#gatherTags()
Returns a map of all tags. If there are multiple values for the same tag, their values are concatenated
using a `;` as separator. For further information on log tags, see [Logger#addTag](#Logger#addTag).

##### Returns
| Type | Description |
| ---- | ----------- |
| `Object` |  a mapping from tag to its value(s) |

#### <a name="Logger#setLogThreshold"></a>Logger#setLogThreshold( threshold )
Sets the threshold for log messages. Log messages with a lower level will be discarded upon logging.

##### Parameters
| Property | Type | Description |
| -------- | ---- | ----------- |
| threshold | `String`, `Number` |  the numeric or the string value of the log level to use as threshold |
