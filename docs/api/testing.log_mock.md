
# <a id="log_mock"></a>log_mock

Allows to create mock implementations of [`Log`](-unknown-), compatible to the "axLog" and "axGlobalLog"
injections.

## Contents

**Module Members**

- [create()](#create)

## Module Members

#### <a id="create"></a>create()

Creates a log mock that does not actually log anywhere, but can be spied upon.

##### Returns

| Type | Description |
| ---- | ----------- |
| `AxLog` |  a fresh mock instance |
