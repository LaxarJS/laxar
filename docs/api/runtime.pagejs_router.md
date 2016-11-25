

## Contents

**Types**

- [pagejs_router](#pagejs_router)
- [PagejsRouter](#PagejsRouter)
  - [PagejsRouter.registerRoutes()](#PagejsRouter.registerRoutes)
  - [PagejsRouter.navigateTo()](#PagejsRouter.navigateTo)
  - [PagejsRouter.constructAbsoluteUrl()](#PagejsRouter.constructAbsoluteUrl)

## Types

### <a id="pagejs_router"></a>pagejs_router

Module providing the page.js router factory.

### <a id="PagejsRouter"></a>PagejsRouter

Router implementation based on [page.js](https://visionmedia.github.io/page.js/).

This router allows to register flow patterns in page.js syntax so that their handler is activated when
the corresponding URL is entered in the browser. While that alone does not add much to the
functionality built into page.js, this router also allows to construct URLs based on a pattern and
corresponding substitution parameters. Finally, users can trigger navigation directly.

Note that the router supports various configuration options:

 - `router.pagejs`: configuration object that is directly passed to page.js (such as `click`,
   `popstate`, `dispatch`, `hashbang`). The application is responsible for specifying the required
   options, as LaxarJS does not touch the page.js defaults otherwise. Consult the page.js documentation
   for more information
 - `router.query.enabled`: if `true`, query parameters are automatically transformed into additional
   place parameters and vice versa. The default is `false`
 - `router.base`: The base path under which to perform routing. If omitted, the document base href is
   used

Note that this router encodes/decodes certain parameters in a way that is different from page.js:

 - when the value `null` is encoded into a URL path segment, it is encoded as `_`
 - the value `/` is double-encoded

#### <a id="PagejsRouter.registerRoutes"></a>PagejsRouter.registerRoutes( routeMap, fallbackHandler )

Register all routes defined in the given route map, as well as a fallback route that should be used
when none of the other routes match. Also causes the initial route to be triggered.

##### Parameters

| Property | Type | Description |
| -------- | ---- | ----------- |
| routeMap | `Object.<String, Function>` |  a map of routing patterns in page.js syntax to the corresponding handler functions. When invoked, the handler functions will receive the decoded parameter values for their pattern and (if configured) from the query string, as a map from string parameter name to string value |
| fallbackHandler | `Function` |  a handler that is invoked when none of the configured routes match. It receives the failed path as a string argument |

#### <a id="PagejsRouter.navigateTo"></a>PagejsRouter.navigateTo( patterns, parameters, replaceHistory=true )

Change the browser location to a different routable URL, from pattern and parameters. This is also
called reverse-routing.

##### Parameters

| Property | Type | Description |
| -------- | ---- | ----------- |
| patterns | `Array.<String>` |  a list of patterns to choose from. This allows the router to pick the "best" pattern, such as the pattern containing the largest number of given parameters. This router always picks the first pattern for now. |
| parameters | `Object` |  parameter values to substitute into the pattern to generate a URL |
| _replaceHistory=true_ | `Boolean` |  if `true`, the current history entry is replaced with the new one, otherwise a new entry is pushed. Useful to express redirects |

#### <a id="PagejsRouter.constructAbsoluteUrl"></a>PagejsRouter.constructAbsoluteUrl( patterns, parameters, parameterDefaults )

Create a routable URL, from pattern and parameters. This allows to create link-hrefs without repeating
URL patterns throughout the code base.

##### Parameters

| Property | Type | Description |
| -------- | ---- | ----------- |
| patterns | `Array.<String>` |  a list of patterns to choose from. This allows the router to pick the "best" pattern, such as the pattern containing the largest number of given parameters. This router always picks the first pattern for now. |
| parameters | `Object` |  parameter values to substitute into the pattern to generate a URL |
| parameterDefaults | `Object` |  only applicable if query strings are enabled by configuration: before a parameter is encoded into the query string, it is checked against the default. Only values that are different from their default are kept |

##### Returns

| Type | Description |
| ---- | ----------- |
| `String` |  the resulting URL, including schema and host |
