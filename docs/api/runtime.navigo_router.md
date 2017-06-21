
# <a id="navigo_router"></a>navigo_router

Module providing the Navigo router factory.

## Contents

**Types**

- [NavigoRouter](#NavigoRouter)
  - [NavigoRouter.registerRoutes()](#NavigoRouter.registerRoutes)
  - [NavigoRouter.navigateTo()](#NavigoRouter.navigateTo)
  - [NavigoRouter.navigateToPath()](#NavigoRouter.navigateToPath)
  - [NavigoRouter.constructAbsoluteUrl()](#NavigoRouter.constructAbsoluteUrl)

## Types

### <a id="NavigoRouter"></a>NavigoRouter

Router implementation based on [Navigo](https://github.com/krasimir/navigo).

This router allows to register flow patterns in Navigo syntax so that their handler is activated when
the corresponding URL is entered in the browser. While that alone does not add much to the
functionality built into Navigo, this router also allows to construct URLs based on a pattern and
corresponding substitution parameters. Finally, users can trigger navigation directly.

Note that the router supports various configuration options:

 - `router.navigo`: configuration object that is directly passed to Navigo (such as `useHash`). The
   application is responsible for specifying the required options, as LaxarJS does not touch the Navigo
   defaults otherwise. Consult the Navigo documentation for more information
 - `router.query.enabled`: if `true`, query parameters are automatically transformed into additional
   place parameters and vice versa. The default is `false`
 - `router.base`: The base path under which to perform routing. If omitted, the document base href is
   used

Note that this router encodes/decodes certain parameters in a way that is different from Navigo:

 - when the value `null` is encoded into a URL path segment, it is encoded as `_`
 - the value `/` is double-encoded

#### <a id="NavigoRouter.registerRoutes"></a>NavigoRouter.registerRoutes( routeMap, fallbackHandler )

Registers all routes defined in the given route map, as well as a fallback route that should be used
when none of the other routes match. Also causes the initial route to be triggered.

##### Parameters

| Property | Type | Description |
| -------- | ---- | ----------- |
| routeMap | `Object.<String, Function>` |  a map of routing patterns in Navigo syntax to the corresponding handler functions. When invoked, the handler functions will receive the decoded parameter values for their pattern and (if configured) from the query string, as a map from string parameter name to string value |
| fallbackHandler | `Function` |  a handler that is invoked when none of the configured routes match. It receives the failed location href as a string argument |

#### <a id="NavigoRouter.navigateTo"></a>NavigoRouter.navigateTo( patterns, parameters, options )

Change the browser location to a different routable URL, from pattern and parameters. This is also
called reverse-routing.

##### Parameters

| Property | Type | Description |
| -------- | ---- | ----------- |
| patterns | `Array.<String>` |  a list of patterns to choose from. This allows the router to pick the "best" pattern, such as the pattern containing the largest number of given parameters. This router always picks the first pattern for now |
| parameters | `Object` |  parameter values to substitute into the pattern to generate a URL |
| _options_ | `Object` |  additional options to influence navigation |
| _options.replaceHistory=false_ | `Boolean` |  if `true`, the current history entry is replaced with the new one, otherwise a new entry is pushed. Useful to express redirects |
| _options.fragment=null_ | `String` |  if set, the given fragment is appended to the URL (after a `#`). Useful with pushState based routing |

#### <a id="NavigoRouter.navigateToPath"></a>NavigoRouter.navigateToPath( path, options )

Change the browser location to a different routable URL, from a complete path. This is also
called reverse-routing.

##### Parameters

| Property | Type | Description |
| -------- | ---- | ----------- |
| path | `String` |  the complete path to navigate to. This includes values for all relevant parameters |
| _options_ | `Object` |  additional options to influence navigation |
| _options.replaceHistory=false_ | `Boolean` |  if `true`, the current history entry is replaced with the new one, otherwise a new entry is pushed. Useful to express redirects |

#### <a id="NavigoRouter.constructAbsoluteUrl"></a>NavigoRouter.constructAbsoluteUrl( patterns, parameters, fragment )

Create a routable URL, from pattern and parameters. This allows to create link-hrefs without repeating
URL patterns throughout the code base.

##### Parameters

| Property | Type | Description |
| -------- | ---- | ----------- |
| patterns | `Array.<String>` |  a list of patterns to choose from. This allows the router to pick the "best" pattern, such as the pattern containing the largest number of given parameters. This router always picks the first pattern for now |
| parameters | `Object` |  parameter values to substitute into the pattern to generate a URL |
| _fragment_ | `String` |  optional String fragment to append to the generated URL |

##### Returns

| Type | Description |
| ---- | ----------- |
| `String` |  the resulting URL, including schema and host |
