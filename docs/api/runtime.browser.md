
# <a id="browser"></a>browser

Module providing the Browser factory.

Provides abstractions for browser APIs used internally by LaxarJS, which might need a different
implementation in a server-side environment, or for testing.
This service is internal to LaxarJS and not available to widgets and activities.

## Contents

**Types**

- [Browser](#Browser)
  - [Browser.resolve()](#Browser.resolve)
  - [Browser.location()](#Browser.location)
  - [Browser.fetch()](#Browser.fetch)
  - [Browser.console()](#Browser.console)

## Types

### <a id="Browser"></a>Browser

A browser mostly abstracts over the location-related DOM window APIs, and provides a console wrapper.
Since it is internal to LaxarJS, only relevant APIs are included.

#### <a id="Browser.resolve"></a>Browser.resolve( url, baseUrl )

Calculates an absolute URL from a (relative) URL, and an optional base URL.

If no base URL is given, the `document.baseURI` is used instead. The given base URL may also be
relative, in which case it is resolved against the `document.baseURI` before resolving the first URL.

For browser environments that do not support the `new URL( url, baseUrl )` constructor for resolving
URLs or that do not support `document.baseURI`, fallback mechanisms are used.

##### Parameters

| Property | Type | Description |
| -------- | ---- | ----------- |
| url | `String` |  the URL to resolve |
| baseUrl | `String` |  the base to resolve from |

##### Returns

| Type | Description |
| ---- | ----------- |
| `String` |  an absolute URL based on the given URL |

#### <a id="Browser.location"></a>Browser.location()

Provides easily mocked access to `window.location`

##### Returns

| Type | Description |
| ---- | ----------- |
| `Location` |  the current (window's) DOM location |

#### <a id="Browser.fetch"></a>Browser.fetch( input, init )

Provides easily mocked access to `window.fetch` or a suitable polyfill:

##### Parameters

| Property | Type | Description |
| -------- | ---- | ----------- |
| input | `String`, `Request` |  the URL to fetch or the request to perform |
| _init_ | `Object` |  additional options, described here in more detail: https://developer.mozilla.org/en-US/docs/Web/API/Globalfetch/fetch#Parameters |

##### Returns

| Type | Description |
| ---- | ----------- |
| `Promise.<Response>` |  the resulting promise |

#### <a id="Browser.console"></a>Browser.console()

Provides easily mocked access to `window.console`:

##### Returns

| Type | Description |
| ---- | ----------- |
| `Console` |  the browser console promise |
