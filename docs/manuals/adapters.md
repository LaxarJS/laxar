# Creating an Adapter for a new Widget Technology

[« return to the manuals](index.md)

LaxarJS widgets can be created in various integration technologies:
While [our own widgets](http://laxarjs.github.io/widget-browser) are often written in [AngularJS](https://angularjs.org), this should not prevent you from using an (MVC) framework of your choice, such as [React](https://facebook.github.io/react/), [Vue.JS](https://vuejs.org/), [Angular 2](https://angular.io/) or maybe even [Knockout](http://knockoutjs.com/).

Preliminary readings:

* [Widgets and Activities](widgets_and_activities.md)
* [Widget Services](widget_services.md)
* [Infrastructure and Tools](infrastructure_and_tools.md)


## Combining Integration Technologies

Because widgets communicate through the event bus only, you could rewrite any widget within your application in any framework you like, and none of the other widgets would be any the wiser.
This is a great way to upgrade step-by-step from an older technology to newer tools, because only a single widget at a time is at risk, not your entire application.

Of course, to achieve a great user experience, you do not want to include an excessive number of frameworks and libraries into your application:
As you add libraries, page load times will increase and with it user satisfaction will suffer.
However, LaxarJS does not want you to be locked into using any specific implementation technology for your widgets.
If used appropriately, _custom widget adapters_ can make it easier by leaps and bounds to integrate with legacy code or third-party widgets, simply helping you to be more productive.

Even if you are not interested in writing your own widget adapter, reading this manual is a good way to gain an in-depth understanding of the LaxarJS widget life cycle.


## The Role of Widget Adapters

The [Infrastructure and Tools](infrastructure_and_tools.md) manual explains how the page controller sets up widgets and activities when entering a page.
Since that is a somewhat simplified explanation, let us look into it in more detail:

* After entering a page, the _page controller_ has a single static model of all areas on a page, and for each area, a model of its configured widgets.
The composition parameter names have long been substituted by their values, feature configuration has been expanded, defaults have been applied, and unique widget IDs have been generated.

* For each configured widget instance, the page controller asks the _widget loader_ to provide it with a widget adapter for that instance, in order to manage the widget throughout its life cycle.
The widget's descriptor (the _widget.json_), its assets (HTML/CSS) and the JavaScript controller module (AMD, CommonJS or ES6) have already been loaded as part of the artifacts bundle, when entering the application.

* Now, the widget loader provides [*widget services*](./widget_services.md) for injection into the widget controller.
This includes the widget-specific event bus instance, which automatically sets the _sender_ on publish, and which automatically removes subscriptions when the page containing a widget is destroyed.
Widget services are instantiated lazily using ECMAScript 5 dynamic properties, so that they will only be created when they are actually injected.

* Now all that is left to do is kicking off the widget controller with the injections, and then loading and instantiating the widget template.
Both of these steps are performed by the adapter, and specific to the implementation technology of the widget.
For example, the `"angular"` adapter for AngularJS v1, creates a new _Scope_ and adds it to the widget services, then instantiates the controller using the AngularJS `$controller` service, so that regular AngularJS injections are available as well.

* As soon as the widget becomes visible (usually right away, but possibly only after its containing popup/tab/panel/... is shown), the template is retrieved.
For `"angular"`, it is linked to the new scope, and inserted into the page DOM.
Other adapters may perform their own value binding magic, or simply use a technology-specific API for passing the template HTML to the widget controller.


## The Integration Technology API

Each widget integration technology is implemented as a module with these properties:

* The module field `technology` is a string that identifies the widget adapter technology, such as `"angular"` or `"react"`.
  It is compared to the `integration.technology` field of each widget descriptor to determine which adapter must be used for each widget in the application.

* The module method `bootstrap` prepares the adapter for an entire LaxarJS bootstrap instance.
  The method receives an object with one array property for `widgets` and one for `controls`.
  Each entry of these arrays has a `descriptor` (the contents of `widget.json` and `control.json` respectively), and a `module` containing the technology-dependent implementation code.
  As a second argument, `bootstrap` receives selected *services* from the LaxarJS runtime, only some of which may be required to implement an individual adapter:

   - `globalEventBus` is the application-wide [`AxEventBus`](../api/runtime.event_bus.md) instance, which is the same as the `axGlobalEventBus` widget service injection,

   - `configuration` is the application-wide [`AxConfiguration`](../api/runtime.configuration.md) instance,

   - `heartbeat` is the application-wide [`AxHeartbeat`](../api/runtime.heartbeat.md) instance,

   - `log` is the application-wide [`AxLog`](../api/runtime.log.md) instance which is the same as the `axGlobalEventBus` widget service injection,

   - `storage` is the application-wide [`AxStorage`](../api/runtime.storage.md) instance, which is the same as the `axGlobalStorage` widget service injection.

  The `bootstrap` method returns an *adapter factory* object which is used to create individual adapter instances for the live widgets. The adapter factory is an object with two methods:

   - `create`: the actual factory method to create an adapter for a given widget instance. Each widget instance has its own adapter instance, so that the adapter is free to maintain state information specific to its widget, as may be required by the integration technology.
   For each widget to be instantiated, `create` is called with an _environment_ containing the `widgetName`, the containing DOM `anchorElement`, the widget `services`, and a `provideService` callback.
   Details [on the environment](#the-widget-loader-environment) are given below.

   - `serviceDecorators` (optional): Usually, services passed to `create` can be used *as-is*, without technology-specific changes. However, some technologies may need to modify individual services. For these cases, adapter factories may specify so-called *service decorators* by returning a map of service names to decorator functions from this method. Each decorator will be called with the original injection (such as `axContext`, `axId` etc.) when its injection is requested. Decorators may then decide to return a modified injection or a completely new object.

  The API of the widget modules themselves depends on the integration technology, but usually there is a method to instantiate a controller for a given widget instance, and possibly a list of injections and/or a method to set up a view. Here are some examples:

   - For the `"plain"` integration, the widget module must have a method `create` to instantiate the controller, and optionally an array  `injections` to specify services required by the widget, such as `"axEventBus"`.
   These injections are used as arguments to `create` in the order that they are listed in `injections`.

   - For the [`"angular"` integration](https://laxarjs.org/docs/laxar-angular-adapter-v2-latest/), the widget module simply exports the name of the AngularJS module for the widget, so that controllers can be instantiated by using the AngularJS `$controller` service.

  All "global" state of the adapter should be encapsulated in the return value of the `bootstrap` method, so that multiple LaxarJS applications may coexist in the same JavaScript environment, each with their own adapter factories, without hurting each other.

Before going into details on API returned by `create`, let us have a look at the environment that is provided by the widget loader.


### The Widget Loader Environment

Before creating an adapter for an individual widget instance, the widget loader collects all required information and bundles it into an _environment_ object.
The environment has the following properties:

* The `widgetName` is the name of the widget to instantiate, exactly as it is written in the `name` property of the widget descriptor.
  The widget adapter can use this to lookup the widget's descriptor and module among the modules it was bootstrapped with.

* The `anchorElement` is a standard `HTMLElement` meant to receive all of the widget's user interface.
  If the adapter uses a templating system, the instantiated HTML template should be appended to this anchor.
  Before passing the element to the adapter, the widget loader sets the ID-attribute to the widget ID, which is useful to identify a widget instance within the DOM.
  The widget loader also adds a CSS class which should be used by the widget's stylesheet to restrict style definitions to the widget.
  If necessary, widgets or adapters may manipulate DOM outside of their anchor, for example to show an popup-like overlay.
  If they do, they are responsible for cleanup, and they should _never_ modify the DOM of other widgets.

* The `services` object contains all services that may be injected into a widget.
  It offers access to global APIs, but also services specifically adapted for individual widget instances.
  Since the list is rather long and mostly relevant for widget authors, the services are described in their own [document](./widget_services.md).

* Finally, `provideAvailable` is a callback function that the widget adapter *must call right before instantiating* the widget controller.
  It is required for tests using [LaxarJS Mocks](https://laxarjs.org/docs/laxar-mocks-v2-latest/) to get access to the final set of widget services, which is dependent on the widget instance as well as on the technology.
  The services should be passed as an object:
  its keys are the injection names requested by the widget, and the values are the corresponding service properties.

  The object is allowed to contain additional services that were not actually requested by the widget, but the adapter should take care not to evaluate their properties.
  For example, if a widget does not actually use `axVisibility`, it probably does not wish to create event bus subscriptions for visibility changes, as accessing axVisibility entails.

  An adapter that does not need to add custom injections can simply pass the `services` object from the environment.
  For hints on the correct implementation, have a look at the [existing adapter implementations](#existing-adapter-implementations) listed below,.

  Note that because the _view_ has not been setup at this point in time, the adapter should not yet manipulate the anchor element, nor make it available to the widget controller.

Created from this environment, the new widget adapter instance prepares additional technology-specific injections as needed, calls the `provideServices` hook, and instantiates the widget controller.
Then it returns an API that allows for further manipulation by the widget loader.


### The Widget Adapter API

All widget adapter instances produced by `create` must implement the following three methods, to support creation and destruction of controller and view:

* `domAttachTo`: called with a widget area as the first argument, and an optional (template) HTML string as the second argument.
  The adapter is supposed to instantiate the template in a manner appropriate for the implementation technology, and to associate it with the widget controller.
  Depending on the technology, this may happen through binding, for example through the _$scope_ injection created by the adapter for `"angular"`.
  Alternatively, the adapter may call some technology-specific API of the controller and pass the instantiated widget DOM.
  The instantiated template should be appended to the anchor element, which in turn should be appended to the widget area element.
  If there is no template, as is usually the case with activities or sometimes with very simple widgets that only need CSS, the value `null` is passed as the second parameter.
  In this case, it is up to the widget adapter to decide if the anchor should be added to the DOM anyway, usually based on whether the type is _widget_ or _activity_.

* `domDetach`: the counterpart to `domAttachTo`, this method is used to remove the view from the containing widget area, temporarily or permanently.
  The widget adapter may tear down the template completely, or keep it "warm" for reattachment.
  LaxarJS may ask widget adapters to detach their DOM and later to attach it again, for example to suspend the widget views within a "popup" layer while that layer is closed.
  If an adapter cannot reliably destroy and rebuild its view, it should do nothing, and simply ignore subsequent calls to `domAttachTo`.

* `destroy`: called only once when a widget instance is removed, usually because the user is navigating away from a page.
  It is not guaranteed that _any_ of the other methods has been called at this point in time, but _destroy_ is supposed to tidy up everything that has been done so far.
  The adapter can assume that the other methods will not be called after this.
  Adapters that do not need to perform cleanup work may omit this property.


### Existing Adapter Implementations

For practical examples of user-defined widget adapters, have a look at the following adapter implementations.
The adapters are sorted by their implementation complexity, from simple to complex.

  - [React adapter](https://github.com/LaxarJS/laxar-react-adapter) for the `"react"` technology
  - [Vue.JS adapter](https://github.com/LaxarJS/laxar-vue-adapter) for the `"vue"` technology
  - [AngularJS v1 adapter](https://github.com/LaxarJS/laxar-angular-adapter) for the `"angular"` technology
  - [Angular v2 adapter](https://github.com/LaxarJS/laxar-angular2-adapter) for the `"angular2"` technology

Also, there is the adapter for `'plain'`, which is part of the LaxarJS Core code base:

  - [plain adapter](https://github.com/LaxarJS/laxar/blob/master/lib/runtime/plain_adapter.js) for the `"plain"` technology


## Using a Custom Adapter in a Project

To use any integration technology other than "plain", the corresponding adapter module must be passed to the LaxarJS `bootstrap` method.
This means that when working on a project that was created by the [LaxarJS Yeoman generator](//github.com/LaxarJS/generator-laxarjs), the `init.js` must load the corresponding module, wrap it in an array and pass that array as the `widgetAdapters` option to `bootstrap`.
Finally, the widgets written for this integration technology must state so in their _widget.json_ descriptor.
