# API Documentation

This API documentation serves as a reference to the public APIs exposed by LaxarJS.
If you are new to LaxarJS, you might wish to check out the [manuals](../manuals/index.md) first.

Here are the most important starting points for LaxarJS API documentation:

- [The `laxar` module API](laxar.md) - The small portion of LaxarJS that is actually exposed through module exports, including `create()`.

- [The _Widget Services_](runtime.widget_services.md) - Named injections available to widgets: `axEventBus`, `axFeatures`, …

- [The _Widget Service Mocks_](laxar-widget-service-mocks.md) - Factory functions to create configurable mocks for widget services.
  In tests, use these rather than the actual widget services.
  Automatically used when testing widgets with [LaxarJS Mocks](laxarjs.org/docs/laxar-mocks-v2-latest/).
