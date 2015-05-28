
# axRuntimeServices

This module provides some services for AngularJS DI. Although it is fine to use these services in widgets,
most of them are primarily intended to be used internally by LaxarJS. Documentation is nevertheless of use
when e.g. they need to be mocked during tests.

## Contents

**Injectable Services**
- [axHeartbeat](#axHeartbeat)
  - [axHeartbeat#onNext](#axHeartbeat#onNext)
  - [axHeartbeat#onBeforeNext](#axHeartbeat#onBeforeNext)
  - [axHeartbeat#onAfterNext](#axHeartbeat#onAfterNext)
- [axTimestamp](#axTimestamp)
- [axGlobalEventBus](#axGlobalEventBus)
- [axConfiguration](#axConfiguration)
- [axI18n](#axI18n)
- [axFileResourceProvider](#axFileResourceProvider)
- [axThemeManager](#axThemeManager)
- [axLayoutLoader](#axLayoutLoader)
- [axCssLoader](#axCssLoader)
  - [axCssLoader#load](#axCssLoader#load)
- [axVisibilityService](#axVisibilityService)
  - [axVisibilityService#handlerFor](#axVisibilityService#handlerFor)
  - [axVisibilityService#isVisible](#axVisibilityService#isVisible)

**Types**
- [axVisibilityServiceHandler](#axVisibilityServiceHandler)
  - [axVisibilityServiceHandler#isVisible](#axVisibilityServiceHandler#isVisible)
  - [axVisibilityServiceHandler#onChange](#axVisibilityServiceHandler#onChange)
  - [axVisibilityServiceHandler#onShow](#axVisibilityServiceHandler#onShow)
  - [axVisibilityServiceHandler#onHide](#axVisibilityServiceHandler#onHide)
  - [axVisibilityServiceHandler#clear](#axVisibilityServiceHandler#clear)

## Injectable Services
### <a name="axHeartbeat"></a>axHeartbeat
This is a scheduler for asynchronous tasks (like nodejs' `process.nextTick`)  trimmed for performance.
It is intended for use cases where many tasks are scheduled in succession within one JavaScript event
loop. It integrates into the AngularJS *$digest* cycle, while trying to minimize the amount of full
*$digest* cycles.

For example in LaxarJS the global event bus instance ([axGlobalEventBus](#axGlobalEventBus)) uses this service.

#### <a name="axHeartbeat#onNext"></a>axHeartbeat#onNext( func )
Schedules a function for the next heartbeat. If no heartbeat was triggered yet, it will be requested
now.

##### Parameters
| Property | Type | Description |
| -------- | ---- | ----------- |
| func | `Function` | a function to schedule for the next tick |

#### <a name="axHeartbeat#onBeforeNext"></a>axHeartbeat#onBeforeNext( func )
Schedules a function to be called before the next heartbeat occurs. Note that `func` may never be
called, if there is no next heartbeat.

##### Parameters
| Property | Type | Description |
| -------- | ---- | ----------- |
| func | `Function` | a function to call before the next heartbeat |

#### <a name="axHeartbeat#onAfterNext"></a>axHeartbeat#onAfterNext( func )
Schedules a function to be called after the next heartbeat occured. Note that `func` may never be
called, if there is no next heartbeat.

##### Parameters
| Property | Type | Description |
| -------- | ---- | ----------- |
| func | `Function` | a function to call after the next heartbeat |

### <a name="axTimestamp"></a>axTimestamp
A timestamp function, provided as a service to support the jasmine mock clock during testing. The
mock-free implementation simply uses `new Date().getTime()`. Whenever a simple timestamp is needed in a
widget, this service can be used to allow for hassle-free testing.

Example:
```js
Controller.$inject = [ 'axTimestamp' ];
function Controller( axTimestamp ) {
   var currentTimestamp = axTimestamp();
};
```

### <a name="axGlobalEventBus"></a>axGlobalEventBus
The global event bus instance provided by the LaxarJS runtime. Widgets **should never** use this, as
subscriptions won't be removed when a widget is destroyed. Instead widgets should always either use the
`eventBus` property on their local `$scope` object or the service `axEventBus`. These take care of all
subscriptions on widget destructions and thus prevent from leaking memory and other side effects.

This service instead can be used by other services, that live throughout the whole lifetime of an
application or take care of unsubscribing from events themselves. Further documentation on the api can
be found at the *event_bus* module api doc.

### <a name="axConfiguration"></a>axConfiguration
Provides access to the global configuration, otherwise accessible via the *configuration* module.
Further documentation can be found there.

### <a name="axI18n"></a>axI18n
Provides access to the i18n api, otherwise accessible via the *i18n* module. Further documentation can
be found there.

### <a name="axFileResourceProvider"></a>axFileResourceProvider
A global, pre-configured file resource provider instance. Further documentation on the api can
be found at the *file_resource_provider* module api doc.

This service has already all the file listings configured under `window.laxar.fileListings`. These can
either be uris to listing JSON files or already embedded JSON objects of the directory tree.

### <a name="axThemeManager"></a>axThemeManager
Provides access to the configured theme and theme relevant assets via a theme manager instance. Further
documentation on the api can be found at the *theme_manager* module api doc.

### <a name="axLayoutLoader"></a>axLayoutLoader
Loads a layout relative to the path `laxar-path-root` configured via RequireJS (by default
`/application/layouts`), taking the configured theme into account. If a CSS file is found, it will
directly be loaded into the page. A HTML template will instead get returned for manual insertion at the
correct DOM location. For this service there is also the companion directive *axLayout* available.

Example:
```js
myNgModule.directive( [ 'axLayoutLoader', function( axLayoutLoader ) {
   return {
      link: function( scope, element, attrs ) {
         axLayoutLoader.load( 'myLayout' )
            .then( function( layoutInfo ) {
               element.html( layoutInfo.html );
            } );
      }
   };
} ] );
```

### <a name="axCssLoader"></a>axCssLoader
A service to load css files on demand during development. If a merged release css file has already been
loaded (marked with a `data-ax-merged-css` html attribute at the according `link` tag) or `useMergedCss`
is configured as `true`, the `load` method will simply be a noop. In the latter case the merged css file
will be loaded once by this service.

#### <a name="axCssLoader#load"></a>axCssLoader#load( url )
If not already loaded, loads the given file into the current page by appending a `link` element to
the document's `head` element.

Additionally it works around a
[style sheet limit](http://support.microsoft.com/kb/262161) in older Internet Explorers
(version < 10). The workaround is based on
[this test](http://john.albin.net/ie-css-limits/993-style-test.html).

##### Parameters
| Property | Type | Description |
| -------- | ---- | ----------- |
| url | `String` | the url of the css file to load |

### <a name="axVisibilityService"></a>axVisibilityService
Directives should use this service to stay informed about visibility changes to their widget.
They should not attempt to determine their visibility from the event bus (no DOM information),
nor poll it from the browser (too expensive).

In contrast to the visibility events received over the event bus, these handlers will fire _after_ the
visibility change has been implemented in the DOM, at which point in time the actual browser rendering
state should correspond to the information conveyed in the event.

The visibility service allows to register for onShow/onHide/onChange. When cleared, all handlers for
the given scope will be cleared. Handlers are automatically cleared as soon as the given scope is
destroyed. Handlers will be called whenever the given scope's visibility changes due to the widget
becoming visible/invisible. Handlers will _not_ be called on state changes originating _from within_ the
widget such as those caused by `ngShow`.

If a widget becomes visible at all, the corresponding handlers for onChange and onShow are guaranteed
to be called at least once.

#### <a name="axVisibilityService#handlerFor"></a>axVisibilityService#handlerFor( scope )
Create a DOM visibility handler for the given scope.

##### Parameters
| Property | Type | Description |
| -------- | ---- | ----------- |
| scope | `Object` | the scope from which to infer visibility. Must be a widget scope or nested in a widget scope |

##### Returns
| Type | Description |
| ---- | ----------- |
| `axVisibilityServiceHandler` | a visibility handler for the given scope |

#### <a name="axVisibilityService#isVisible"></a>axVisibilityService#isVisible( area )
Determine if the given area's content DOM is visible right now.

##### Parameters
| Property | Type | Description |
| -------- | ---- | ----------- |
| area | `String` | the full name of the widget area to query |

##### Returns
| Type | Description |
| ---- | ----------- |
| `Boolean` | `true` if the area is visible right now, else `false`. |

## Types
### <a name="axVisibilityServiceHandler"></a>axVisibilityServiceHandler
A scope bound visibility handler.

#### <a name="axVisibilityServiceHandler#isVisible"></a>axVisibilityServiceHandler#isVisible()
Determine if the governing widget scope's DOM is visible right now.

##### Returns
| Type | Description |
| ---- | ----------- |
| `Boolean` | `true` if the widget associated with this handler is visible right now, else `false` |

#### <a name="axVisibilityServiceHandler#onChange"></a>axVisibilityServiceHandler#onChange( handler )
Schedule a handler to be called with the new DOM visibility on any DOM visibility change.

##### Parameters
| Property | Type | Description |
| -------- | ---- | ----------- |
| handler | `Function.<Boolean>` | the callback to process visibility changes |

##### Returns
| Type | Description |
| ---- | ----------- |
| `axVisibilityServiceHandler` | this visibility handler (for chaining) |

#### <a name="axVisibilityServiceHandler#onShow"></a>axVisibilityServiceHandler#onShow( handler )
Schedule a handler to be called with the new DOM visibility when it has changed to `true`.

##### Parameters
| Property | Type | Description |
| -------- | ---- | ----------- |
| handler | `Function.<Boolean>` | the callback to process visibility changes |

##### Returns
| Type | Description |
| ---- | ----------- |
| `axVisibilityServiceHandler` | this visibility handler (for chaining) |

#### <a name="axVisibilityServiceHandler#onHide"></a>axVisibilityServiceHandler#onHide( handler )
Schedule a handler to be called with the new DOM visibility when it has changed to `false`.

##### Parameters
| Property | Type | Description |
| -------- | ---- | ----------- |
| handler | `Function.<Boolean>` | the callback to process visibility changes |

##### Returns
| Type | Description |
| ---- | ----------- |
| `axVisibilityServiceHandler` | this visibility handler (for chaining) |

#### <a name="axVisibilityServiceHandler#clear"></a>axVisibilityServiceHandler#clear()
Removes all visibility handlers.

##### Returns
| Type | Description |
| ---- | ----------- |
| `axVisibilityServiceHandler` | this visibility handler (for chaining) |
