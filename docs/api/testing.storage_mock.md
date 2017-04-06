
# <a id="storage_mock"></a>storage_mock

Allows to instantiate a mock implementations of [`Storage`](-unknown-), compatible to the "axGlobalStorage"
injection. For the widget-specific "axStorage" injection, refer to the [`widget_services_storage_mock`](testing.widget_services_storage_mock.md)
module.

## Contents

**Module Members**

- [create()](#create)

**Types**

- [StorageMock](#StorageMock)
- [{StorageMock}](#{StorageMock})
  - [{StorageMock}.- unknown -](#{StorageMock}.- unknown -)

## Module Members

#### <a id="create"></a>create()

Creates a storage mock that does not actually change the browser's local- or session-storage.

##### Returns

| Type | Description |
| ---- | ----------- |
| [`StorageMock`](#StorageMock) |  a fresh mock instance |

## Types

### <a id="StorageMock"></a>StorageMock

> extends `{Storage}`

A mock for [`Storage`](-unknown-) that does not actually change the browser's local- or session-storage.
Instances of this mock are compatible to the "axGlobalStorage" injection.

Do not confuse this with the {@AxStorageMock}, which is compatible to the "axStorage" injection offered
by the widget services.

Note that the mock does perform JSON transformations of the value objects, just like the actual Storage.

### <a id="{StorageMock}"></a>{StorageMock}

#### <a id="{StorageMock}.- unknown -"></a>{StorageMock}.- unknown - `Object`

Provides access to the backing stores of the storage mock.

Has a `local` and a `session` property, each of which has spies for `getItem`/`setItem`/`removeItem`.
The `local` and `session` properties also provide direct access to their respective backing `store`
objects, accessible in this manner:

```js
import { createAxGlobalStorageMock } from 'laxar/laxar-widget-service-mocks';
const storageMock = createAxGlobalStorageMock();
storageMock.getLocalStorage( 'myNs' ).setItem( 'k', 'v' );
expect( storageMock.mockBackends.local.myNs.k ).toEqual( '"v"' );  // note the JSON transform
```
