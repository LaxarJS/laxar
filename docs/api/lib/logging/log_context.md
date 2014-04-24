# Documentation

## LogContext()
A context for a logger instance. Each context manages a stack of scopes where each scope can hold a
different set of log tags. Initially a context already has one scope on its stack, that cannot be left.
Trying to do so will lead to an error. Thus each party entering a scope is also responsible for leaving
that scope again.


## LogContext#enterScope()
Enters a new scope by pushing a scope object with an empty set of tags onto the stack.

## LogContext#leaveScope()
Leaves the current scope and thus discards all tags set on this scope. An error is raised if an attempt
to remove the root scope is made.

## LogContext#addTag( tag, value )
Adds a value for a log tag to the scope entered last, i.e. the one on the top of the stack. If a tag
is already known for the current scope, the value is appended to the existing one using a `;` as
separator. Note that no formatting of the value takes place and a non-string value will just have its
appropriate `toString` method called.

### Parameters
- **tag {String}**: the id of the tag to add a value for

- **value {String}**: the value to add


## LogContext#gatherTags()
Returns a map of all tags gathered from all scopes. If there are multiple values for the same tag across
different scopes, their values are concatenated using a `;` as separator.

### Returns
- **{Object}**: a mapping from tag to its value(s)
