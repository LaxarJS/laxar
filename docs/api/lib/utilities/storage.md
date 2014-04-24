# Documentation

## Storage( backend, namespace )
Wrapper for `window.localStorage` or `window.sessionStorage` providing a more convenient api. In fact it
provides a K/V store where values can be any "JSON-stringifyable" object and stores them in a `backend`
only supporting strings as values.

### Parameters
- **backend {Object}**: the K/V store, probably only accepting string values

- **namespace {String}**: prefix for all keys for namespacing purposes



## Storage#getItem( key )
Retrieves an item by key from the store. Note that the namespace the store was created with is prepended
automatically to the key.

### Parameters
- **key {String}**: the key of the item to retrieve


### Returns
- **{*}**: the value or `null` if it doesn't exist in the store


## Storage#setItem( key, value )
Sets a value for a key. An existing value will be overwritten Note that the namespace the store was
created with is prepended automatically to the key.

### Parameters
- **key {String}**: the key of the item to set

- **value {*}**: the new value to set


## Storage#removeItem( key )
Removes the value associated with `key` from the store. Note that the namespace the store was created
with is prepended automatically to the key.

### Parameters
- **key {String}**: the key of the item to remove
