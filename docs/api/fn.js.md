
# fn

Utilities for dealing with functions.

When requiring `laxar`, it is available as `laxar.fn`.

## Contents

**Module Members**
- [debounce](#debounce)
- [later](#later)
- [_nowMilliseconds](#_nowMilliseconds)
- [_setTimeout](#_setTimeout)

## Module Members
#### <a name="debounce"></a>debounce( f, waitMs, immediate )
[Underscore `debounce`](http://underscorejs.org/#debounce) with the following modifications:
 - automatically mocked when accessed through `laxar/laxar_testing`
 - the generated function provides a `cancel()` method

See [http://underscorejs.org/#debounce](http://underscorejs.org/#debounce) for detailed
documentation on the original version.

### Note on testing:

You can set `laxar.fn._nowMilliseconds` and `laxar.fn._setTimout` to mock-functions in order to
help testing components that use `laxar.fn` or to test `laxar.fn` itself.

##### Parameters
| Property | Type | Description |
| -------- | ---- | ----------- |
| f | `Function` |  the function to return a debounced version of |
| waitMs | `Number` |  milliseconds to debounce before invoking `f` |
| immediate | `Boolean` |  if `true` `f` is invoked prior to start waiting `waitMs` milliseconds. Otherwise `f` is invoked after the given debounce duration has passed. Default is `false` |

##### Returns
| Type | Description |
| ---- | ----------- |
| `Function` |  a debounced wrapper around the argument function f, with an additional method `cancel()`: After `cancel()` has been called, f will not be invoked anymore, no matter how often the wrapper\ is called. |

#### <a name="later"></a>later( _force )
Check if the debounced function is ready for execution, and do so if it is.

##### Parameters
| Property | Type | Description |
| -------- | ---- | ----------- |
| _force | `Boolean` |  This is only relevant when mocking `fn._setTimeout` to implement a force/flush for tests. If the parameter is passed as `true`, no timing checks are performed prior to execution. |

#### <a name="_nowMilliseconds"></a>_nowMilliseconds()
Get the current time in milliseconds.
This API is intended to be used from tests only.

##### Returns
| Type | Description |
| ---- | ----------- |
| `Number` |  the current time in milliseconds (`Date.now()`). Ovewrride this from tests for reproducible results. |

#### <a name="_setTimeout"></a>_setTimeout()
By default, invoke window.setTimeout with the given arguments.
