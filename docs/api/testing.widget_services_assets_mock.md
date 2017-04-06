
# <a id="widget_services_assets_mock"></a>widget_services_assets_mock

Allows instantiate a mock implementations of [`AxAssets`](runtime.widget_services.md), compatible to the "axAssets" injection.

## Contents

**Module Members**

- [create()](#create)

**Types**

- [AxAssetsMock](#AxAssetsMock)
  - [AxAssetsMock.mock()](#AxAssetsMock.mock)
  - [AxAssetsMock.mockUrl()](#AxAssetsMock.mockUrl)
  - [AxAssetsMock.mockForTheme()](#AxAssetsMock.mockForTheme)
  - [AxAssetsMock.mockUrlForTheme()](#AxAssetsMock.mockUrlForTheme)

## Module Members

#### <a id="create"></a>create( artifactAssets={}, artifactName='mock-widget' )

Creates a mock for the "axAssets" injection of a widget.

Usually the mock is created from a complete, generated assets entry, as described for the [`AxAssets`](runtime.widget_services.md)
service.

```js
const artifactAssets = {
   'myMessages.json': { content: '{"yo":42}' },
   'default.theme': {
       'some.png': { url: '/path/to/some.png' }
   }
};
```

Assets are usually retrieved by the widget under test through the `axAssets` injection, or
programmatically like this:

```js
import { createAxAssetsMock } from 'laxar/laxar-widget-service-mocks';
const axAssetsMock = createAxAssetsMock( artifactAssets, 'other.theme' );
console.log( JSON.parse( axAssetsMock( 'myMessages.json' ) ) );  // output: { yo: 42 }
console.log( assetsMock.urlForTheme( 'some.png' ) );  // output: "/path/to/some.png"
```

From the test, the mock may be inspected using jasmine:

```js
import { createAxAssetsMock } from 'laxar/laxar-widget-service-mocks';
const axAssetsMock = createAxAssetsMock( artifactAssets );
// ...
expect( axAssetsMock ).toHaveBeenCalledWith( 'myMessages.json' );
expect( axAssetsMock.url ).toHaveBeenCalledWith( '/some/url' );
```

The specified assets/themedAssets may be replaced afterwards using the `.mock...` methods.
Instead of a complete entry, a user-defined entry containing just `assets` and/or `themedAssets` may be
used instead. Also, instead of the "default.theme", a custom theme may be passed. In this case, make sure
that the mock entry passed to `create` reflects this. Or use the mock

```js
import { createAxAssetsMock } from 'laxar/laxar-widget-service-mocks';
const axAssetsMock = createAxAssetsMock( artifactAssets, 'other.theme' );
console.log( assetsMock.urlForTheme( 'some.png' ) );  // output: null
axAssetsMock.mock( 'myMessages.json', '{"yo": 7}' );
axAssetsMock.mockUrlForTheme( 'some.png', "/path/to/some/other.png" );
console.log( JSON.parse( axAssetsMock( 'myMessages.json' ) ) );  // output: { yo: 7 }
console.log( assetsMock.urlForTheme( 'some.png' ) );  // output: "/path/to/some/other.png"
```

##### Parameters

| Property | Type | Description |
| -------- | ---- | ----------- |
| _artifactAssets={}_ | `Object` |  the assets entry to base the mock on |
| _theme='default.theme'_ | `String` |  the theme name to use. For portability, keeping the default is recommended. |
| _artifactName='mock-widget'_ | `String` |  the artifact name, only relevant for error messages |

##### Returns

| Type | Description |
| ---- | ----------- |
| [`AxAssetsMock`](#AxAssetsMock) |  a mock of `axAssets` that can be spied and/or mocked with additional assets |

## Types

### <a id="AxAssetsMock"></a>AxAssetsMock

> extends [`AxAssets`](runtime.widget_services.md#AxAssets)

An AxAssets-compatible mock.

See [`#create`](#create) for usage details.

#### <a id="AxAssetsMock.mock"></a>AxAssetsMock.mock( path, content )

Mock a regular asset.

##### Parameters

| Property | Type | Description |
| -------- | ---- | ----------- |
| path | `String` |  the asset path to mock |
| content | `String` |  the asset contents that the mock should provide. Omit to discard the asset content. |

#### <a id="AxAssetsMock.mockUrl"></a>AxAssetsMock.mockUrl( path, url )

Mock a regular asset URL.

##### Parameters

| Property | Type | Description |
| -------- | ---- | ----------- |
| path | `String` |  the asset path to mock |
| _url_ | `String` |  the asset URL to provide. Omit to discard the asset URL. |

#### <a id="AxAssetsMock.mockForTheme"></a>AxAssetsMock.mockForTheme( path, content )

Mock an asset for the current theme.

##### Parameters

| Property | Type | Description |
| -------- | ---- | ----------- |
| path | `String` |  the theme-dependent asset path to mock |
| _content_ | `String` |  the asset content to provide. Omit to discard the asset content. |

#### <a id="AxAssetsMock.mockUrlForTheme"></a>AxAssetsMock.mockUrlForTheme( path, url )

Mock an asset URL for the current theme.

##### Parameters

| Property | Type | Description |
| -------- | ---- | ----------- |
| path | `String` |  the theme-dependent asset path to mock |
| _url_ | `String` |  the asset URL to provide. Omit to discard the asset URL. |
