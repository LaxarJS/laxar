
# storage

Provides a convenient api over the browser's `window.localStorage` and `window.sessionStorage` objects. If
a browser doesn't support [web storage](http://www.w3.org/TR/webstorage/), a warning is logged to the
`console` (if available) and a non-persistent in-memory store will be used instead. Note that this can for
example also happen when using Mozilla Firefox with cookies disabled and as such isn't limited to older
browsers.

Additionally, in contrast to plain *web storage* access, non-string values will be automatically passed
through JSON (de-) serialization on storage or retrieval. All keys will be prepended with a combination of
an arbitrary and a configured namespace to prevent naming clashes with other web applications running on
the same host and port. All [StorageApi](#StorageApi) accessor methods should then be called without any namespace
since adding and removing it, is done automatically.

When requiring `laxar`, it is available as `laxar.storage`.

## Contents

**Module Members**
- [create](#create)
- [getLocalStorage](#getLocalStorage)
- [getSessionStorage](#getSessionStorage)
- [getApplicationLocalStorage](#getApplicationLocalStorage)
- [getApplicationSessionStorage](#getApplicationSessionStorage)

**Types**
- [StorageApi](#StorageApi)
  - [StorageApi#getItem](#StorageApi#getItem)
  - [StorageApi#setItem](#StorageApi#setItem)
  - [StorageApi#for](#StorageApi#for)

## Module Members
#### <a name="create"></a>create( localStorageBackend, sessionStorageBackend )
Creates a new storage module. In most cases this module will be called without arguments,
but having the ability to provide them is useful e.g. for mocking purposes within tests.
If the arguments are omitted, an attempt is made to access the native browser WebStorage api.
If that fails, storage is only mocked by an in memory map (thus actually unavailable).

Developers are free to use polyfills to support cases where local- or session-storage may not be
available. Just make sure to initialize the polyfills before this module.

##### Parameters
| Property | Type | Description |
| -------- | ---- | ----------- |
| _localStorageBackend_ | `Object` | the backend for local storage, Default is `window.localStorage` |
| _sessionStorageBackend_ | `Object` | the backend for session storage, Default is `window.sessionStorage` |

##### Returns
| Type | Description |
| ---- | ----------- |
| `Object` | a new storage module |

#### <a name="getLocalStorage"></a>getLocalStorage( namespace )
Returns a local storage object for a specific local namespace.

##### Parameters
| Property | Type | Description |
| -------- | ---- | ----------- |
| namespace | `String` | the namespace to prepend to keys |

##### Returns
| Type | Description |
| ---- | ----------- |
| `StorageApi` | the local storage object |

#### <a name="getSessionStorage"></a>getSessionStorage( namespace )
Returns a session storage object for a specific local namespace.

##### Parameters
| Property | Type | Description |
| -------- | ---- | ----------- |
| namespace | `String` | the namespace to prepend to keys |

##### Returns
| Type | Description |
| ---- | ----------- |
| `StorageApi` | the session storage object |

#### <a name="getApplicationLocalStorage"></a>getApplicationLocalStorage()
Returns the local storage object for application scoped keys. This is equivalent to
`storage.getLocalStorage( 'app' )`.

##### Returns
| Type | Description |
| ---- | ----------- |
| `StorageApi` | the application local storage object |

#### <a name="getApplicationSessionStorage"></a>getApplicationSessionStorage()
Returns the session storage object for application scoped keys. This is equivalent to
`storage.getSessionStorage( 'app' )`.

##### Returns
| Type | Description |
| ---- | ----------- |
| `StorageApi` | the application session storage object |

## Types
### <a name="StorageApi"></a>StorageApi
The api returned by one of the `get*Storage` functions of the *storage* module.

#### <a name="StorageApi#getItem"></a>StorageApi#getItem( key )
Retrieves a `value` by `key` from the store. JSON deserialization will automatically be applied.

##### Parameters
| Property | Type | Description |
| -------- | ---- | ----------- |
| key | `String` | the key of the item to retrieve (without namespace prefix) |

##### Returns
| Type | Description |
| ---- | ----------- |
| `*` | the value or `null` if it doesn't exist in the store |

#### <a name="StorageApi#setItem"></a>StorageApi#setItem( key, value )
Sets a `value` for a `key`. The value should be JSON serializable. An existing value will be
overwritten.

##### Parameters
| Property | Type | Description |
| -------- | ---- | ----------- |
| key | `String` | the key of the item to set (without namespace prefix) |
| value | `*` | the new value to set |

#### <a name="StorageApi#for"></a>StorageApi#for( key )
Removes the value associated with `key` from the store.

##### Parameters
| Property | Type | Description |
| -------- | ---- | ----------- |
| key | `String` | the key of the item to remove (without namespace prefix) |
