
# <a id="storage"></a>storage

Module providing the StorageApi factory.

Widgets and activities can access their StorageApi instance by requesting the injection
[`axStorage`](runtime.widget_services.md#axStorage), or use
[`axGlobalStorage`](runtime.widget_services.md#axGlobalStorage) for shared items.

As such, in most cases only the [`StorageApi`](runtime.storage.md) documentation is relevant.

## Contents

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

## Types

### <a id="StorageApi"></a>StorageApi

Provides a convenient API over the browser's `window.localStorage` and `window.sessionStorage` objects.
If a browser doesn't support [web storage](http://www.w3.org/TR/webstorage/), a warning is logged to the
`console` (if available) and a non-persistent in-memory store will be used instead. Note that this can
for example also happen when using Mozilla Firefox with cookies disabled and as such isn't limited to
older browsers.

Additionally, in contrast to plain *web storage* access, non-string values will be automatically passed
through JSON (de-) serialization on storage or retrieval. All keys will be prepended with a combination
of a fixed (`ax.`) and an application-specific namespace (configured using `storagePrefix` with fallback
to `name`) to avoid naming clashes with other (LaxarJS) web applications running on the same host and
port. All [`StorageApi`](runtime.storage.md) accessor methods should be called without any namespace as it is
prepended automatically.

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

The API returned by the module's `create` function.

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
