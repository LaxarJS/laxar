# Widget Services

[« return to the manuals](index.md)

In order to make developing widgets even easier, a common set of services is offered to each widget instance, regardless of its implementation technology.
Some of these services are mere adapters to internal APIs and are mostly relevant for tooling, while others are specifically tailored to the respective widget instance, sparing the widget developer to provide context information by himself.
A widget adapter may offer additional services specific to its implementation technology.
For example the AngularJS adapter allows to inject all available AngularJS services and the widget's `$scope` object.

Preliminary readings:

- [Widgets and Activities](widgets_and_activities.md)


## Available Services

For a list of all widget services, consult the [widget services API documentation](../api/runtime.widget_services.md).

To help you get started, the most important widget services are:

- [`axContext`](../api/runtime.widget_services.md#axContext) for passing essential instance information to libraries such as [LaxarJS Patterns](https://laxarjs.org/docs/laxar-patterns-v2-latest/), also available as `$scope` to AngularJS widgets,

- [`axConfiguration`](../api/runtime.widget_services.md#axConfiguration) for application configuration,

- [`axEventBus`](../api/runtime.widget_services.md#axEventBus) to communicate using publish/subscribe,

- [`axFeatures`](../api/runtime.widget_services.md) to access instance feature configuration,

- [`axFlowService`](../api/runtime.widget_services.md) to generate link URLs,

- [`axLog`](../api/runtime.widget_services.md) for logging.


## Mocking Widget Services from Tests

One of the advantages that providing all widget services as injection is improved testability.
The [LaxarJS Mocks](https://laxarjs.org/docs/laxar-mocks-v2-latest/) library replaces all widget services with mock versions that do not affect the browser state and that are reset completely between test cases.

The [widget service mocks API](../api/laxar-widget-service-mocks.md) is defined by LaxarJS Core, and should simplify writing non-trivial tests.
You can configure service mocks just before a widget controller is instantiated by passing a callback to `axMocks.widget.whenServicesAvailable`.
The [LaxarJS Mocks API docs](https://laxarjs.org/docs/laxar-mocks-v2-latest/api/) contain more detailed information.
