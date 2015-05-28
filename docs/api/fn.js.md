
# fn

Utilities for dealing with functions.

When requiring `laxar`, it is available as `laxar.fn`.

## Contents

**Module Members**
- [debounce](#debounce)

## Module Members
#### <a name="debounce"></a>debounce( f, waitMs, immediate )
[Underscore `debounce`](http://underscorejs.org/#debounce), but with LaxarJS offering mocking in
tests. See [http://underscorejs.org/#debounce](http://underscorejs.org/#debounce) for detailed
documentation.

##### Parameters
| Property | Type | Description |
| -------- | ---- | ----------- |
| f | `Function` | the function to return a debounced version of |
| waitMs | `Number` | milliseconds to debounce before invoking `f` |
| immediate | `Boolean` | if `true` `f` is invoked prior to start waiting `waitMs` milliseconds. Otherwise `f` is invoked after the given debounce duration has passed. Default is `false` |

##### Returns
| Type | Description |
| ---- | ----------- |
| `Function` | the debounced function |
