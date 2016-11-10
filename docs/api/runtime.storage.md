
# <a id="storage"></a>storage

Provides a convenient API over the browser's `window.localStorage` and `window.sessionStorage` objects. If
a browser doesn't support [web storage](http://www.w3.org/TR/webstorage/), a warning is logged to the
`console` (if available) and a non-persistent in-memory store will be used instead. Note that this can for
example also happen when using Mozilla Firefox with cookies disabled and as such isn't limited to older
browsers.

Additionally, in contrast to plain *web storage* access, non-string values will be automatically passed
through JSON (de-) serialization on storage or retrieval. All keys will be prepended with a combination of
a fixed (`ax.`) and an application-specific namespace (configured using `storagePrefix` with fallback to
`name`) to avoid naming clashes with other (LaxarJS) web applications running on the same host and port.
All [`StorageApi`](runtime.storage.md) accessor methods should then be called without any namespace as it is prepended
automatically.

Widgets and activities can access storage through the `axStorage` or `axGlobalStorage` injections.
As such in most cases only the [`StorageApi`](runtime.storage.md) documentation is relevant.

## Contents

**Module Members**

- [create()](#create)

**Types**

- [StorageApi](#StorageApi)
  - [StorageApi.getItem()](#StorageApi.getItem)
  - [StorageApi.setItem()](#StorageApi.setItem)
  - [StorageApi.removeItem()](#StorageApi.removeItem)
- [StorageFactory](#StorageFactory)
  - [StorageFactory.getLocalStorage()](#StorageFactory.getLocalStorage)
  - [StorageFactory.getSessionStorage()](#StorageFactory.getSessionStorage)
  - [StorageFactory.getApplicationLocalStorage()](#StorageFactory.getApplicationLocalStorage)
  - [StorageFactory.getApplicationSessionStorage()](#StorageFactory.getApplicationSessionStorage)

## Module Members

#### <a id="create"></a>create( configuration, browser, localStorageBackend, sessionStorageBackend )

Creates a new storage factory. In most cases this module will be called without arguments,
but having the ability to provide them is useful e.g. for mocking purposes within tests.
If the arguments are omitted, an attempt is made to access the native browser WebStorage api.
If that fails, storage is only mocked by an in memory map (thus actually unavailable).
^
Developers are free to use polyfills to support cases where local- or session-storage may not be
available. Just make sure to initialize the polyfills before this module.

##### Parameters

| Property | Type | Description |
| -------- | ---- | ----------- |
| configuration | `Object` |  a configuration service instance, to determine a storage prefix based on the configured name |
| browser | `Object` |  the browser api adapter |
| _localStorageBackend_ | `Object` |  the backend for local storage. Default is `window.localStorage` |
| _sessionStorageBackend_ | `Object` |  the backend for session storage. Default is `window.sessionStorage` |

##### Returns

| Type | Description |
| ---- | ----------- |
| [`StorageFactory`](#StorageFactory) |  a new storage factory |

## Types

### <a id="StorageApi"></a>StorageApi

The api returned by one of the `get*Storage` functions of the [`#StorageFactory`](#StorageFactory).

#### <a id="StorageApi.getItem"></a>StorageApi.getItem( key )

Retrieves a `value` by `key` from the store. JSON deserialization will automatically be applied.

##### Parameters

| Property | Type | Description |
| -------- | ---- | ----------- |
| key | `String` |  the key of the item to retrieve (without namespace prefix) |

##### Returns

| Type | Description |
| ---- | ----------- |
| `*` |  the value or `null` if it doesn't exist in the store |

#### <a id="StorageApi.setItem"></a>StorageApi.setItem( key, value )

Sets a `value` for a `key`. The value must be JSON serializable. An existing value will be overwritten.

##### Parameters

| Property | Type | Description |
| -------- | ---- | ----------- |
| key | `String` |  the key of the item to set (without namespace prefix) |
| value | `*` |  the new value to set |

#### <a id="StorageApi.removeItem"></a>StorageApi.removeItem( key )

Removes the value associated with `key` from the store.

##### Parameters

| Property | Type | Description |
| -------- | ---- | ----------- |
| key | `String` |  the key of the item to remove (without namespace prefix) |

### <a id="StorageFactory"></a>StorageFactory

The api returned by the module's `create` function.

#### <a id="StorageFactory.getLocalStorage"></a>StorageFactory.getLocalStorage( namespace )

Returns a local storage object for a specific local namespace.

##### Parameters

| Property | Type | Description |
| -------- | ---- | ----------- |
| namespace | `String` |  the namespace to prepend to keys |

##### Returns

| Type | Description |
| ---- | ----------- |
| [`StorageApi`](#StorageApi) |  the local storage object |

#### <a id="StorageFactory.getSessionStorage"></a>StorageFactory.getSessionStorage( namespace )

Returns a session storage object for a specific local namespace.

##### Parameters

| Property | Type | Description |
| -------- | ---- | ----------- |
| namespace | `String` |  the namespace to prepend to keys |

##### Returns

| Type | Description |
| ---- | ----------- |
| [`StorageApi`](#StorageApi) |  the session storage object |

#### <a id="StorageFactory.getApplicationLocalStorage"></a>StorageFactory.getApplicationLocalStorage()

Returns the local storage object for application scoped keys. This is equivalent to
`storage.getLocalStorage( 'app' )`.

##### Returns

| Type | Description |
| ---- | ----------- |
| [`StorageApi`](#StorageApi) |  the application local storage object |

#### <a id="StorageFactory.getApplicationSessionStorage"></a>StorageFactory.getApplicationSessionStorage()

Returns the session storage object for application scoped keys. This is equivalent to
`storage.getSessionStorage( 'app' )`.

##### Returns

| Type | Description |
| ---- | ----------- |
| [`StorageApi`](#StorageApi) |  the application session storage object |
