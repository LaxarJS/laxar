
# <a id="widget_services_storage_mock"></a>widget_services_storage_mock

Allows to instantiate a mock implementations of [`AxStorage`](runtime.widget_services.md), compatible to the "axStorage" injection.

## Contents

**Module Members**

- [create()](#create)

**Types**

- [AxStorageMock](#AxStorageMock)
  - [AxStorageMock.mockBackends](#AxStorageMock.mockBackends)

## Module Members

#### <a id="create"></a>create()

Creates a mock for the `axStorage` injection of a widget.

##### Returns

| Type | Description |
| ---- | ----------- |
| [`AxStorageMock`](#AxStorageMock) |  a mock of `axStorage` that can be spied and/or mocked with additional items |

## Types

### <a id="AxStorageMock"></a>AxStorageMock

> extends [`AxStorage`](runtime.widget_services.md#AxStorage)

The AxStorageMock provides the same API as AxStorage, with the additional property
[`#mockBackends`](#mockBackends) to inspect and/or simulate mock values in the storage backend.

#### <a id="AxStorageMock.mockBackends"></a>AxStorageMock.mockBackends `undefined`

Provides access to the backing stores for `local` and `session` storage.

Contains `local` and `session` store properties. The stores are plain objects whose properties
reflect any setItem/removeItem operations. When properties are set on a store, they are observed
by `getItem` calls on the corresponding axStorage API.
