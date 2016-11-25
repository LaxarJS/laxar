
# <a id="configuration_mock"></a>configuration_mock

Allows to create mock implementations of [`Configuration`](runtime.configuration.md), compatible to the "axConfiguration"
injection.

## Contents

**Module Members**

- [create()](#create)

## Module Members

#### <a id="create"></a>create( configByPath )

Creates a mock [`Configuration`](runtime.configuration.md), compatible to the "axConfiguration" injection of a widget.

The accessor methods `get` and `ensure` are spied.

The mock behaves just like the actual configuration, except that configuration values may be initialized
from paths, not just regular nested JSON objects. This simplifies mocking of nested configuration such as
`logging.threshold`. Usage of this feature is optional, nested objects work just as well.

##### Parameters

| Property | Type | Description |
| -------- | ---- | ----------- |
| configByPath | `Object` |  path-to-value mappings for the mock |

##### Returns

| Type | Description |
| ---- | ----------- |
| [`Configuration`](runtime.configuration.md#Configuration) |  a fresh mock instance |
