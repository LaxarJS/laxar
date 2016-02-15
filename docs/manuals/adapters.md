[« return to the manuals](index.md)

Preliminary readings:

* [Widgets and Activities](widgets_and_activities.md)
* [Infrastructure and Tools](infrastructure_and_tools.md)


# Creating an Adapter for a new Widget Technology

LaxarJS widgets do not have to be written using AngularJS.
While [our own widgets](http://laxarjs.github.io/widget-browser) are usually written in AngularJS, this should not prevent you from using an (MVC) framework of your choice, such as [Backbone.js](http://backbonejs.org), [Knockout](http://knockoutjs.com/) or [React](https://facebook.github.io/react/).
Because widgets communicate through the event bus only, you could rewrite any widget within your application in any framework you like, and none of the other widgets would be any the wiser.
This is a great way to upgrade step-by-step from an older technology to newer tools, because only a single widget at a time is at risk, not your entire application.

Of course, to achieve a great user experience, you do not want to include an excessive number of frameworks and libraries into your application:
As you add libraries, page load times will increase and with it user satisfaction will suffer.
However, LaxarJS does not want you to be locked into using any specific implementation technology for your widgets.
If used appropriately, _custom widget adapters_ can make it easier by leaps and bounds to integrate with legacy code or third-party widgets, simply helping you to be more productive.

Even if you are not interested in writing your own widget adapter, lecture of this manual is a good way to gain an in-depth understanding on the LaxarJS widget lifecycle.


## The Role of Widget Adapters

The [Infrastructure and Tools](infrastructure_and_tools.md) manual explains how the page controller sets up widgets and activities when entering a page.
Since that is a somewhat simplified explanation, let us look into it in more detail:

* The _page controller_ uses the _page loader_ to expand compositions and to obtain a single static model of all areas on a page, and for each area, a model of its configured widgets.
At this point, the composition parameter names have been substituted by their values and unique widget IDs have been generated, but default values for the widget features have not been applied yet.

* For each configured widget instance, the page controller asks the _widget loader_ to provide it with a widget adapter for that instance, to control widget lifecycle.
The widget controller written in JavaScript has already been loaded as an AMD module when entering the application.
The loader fetches the _widget.json_, and knows how to get the widget template and CSS style sheet, if applicable.
Of course, all assets are loaded only once, even if a widget is instantiated several times during the lifetime of an application or even on the same page.
All widgets are loaded asynchronously and in parallel, so there is no unnecessary delay.
In production mode, all assets are served from the configured file listings, so that this process may happen very quickly.

* As soon as the widget loader has loaded the _widget.json_ for a widget instance, it validates the feature configuration and fills in missing default values.
Next, it sets up an event-bus wrapper for the widget, that always fills in the _sender_ (on publish) and _subscriber_ (on subscribe) with the widget id.
This wrapper also ensures that the widget is unsubscribed from all events when the page is teared down later on.

* Now all that is left to do is kicking off the widget controller with the augmented feature configuration, and loading and instantiating the widget template.
Both of these steps are specific to the implementation technology of the widget.
For AngularJS, a new _scope_ is created for the controller, and the controller class is instantiated using the AngularJS `$controller` service.
As soon as the widget becomes visible (usually right away, but possibly only after its containing popup/tab/panel/... is shown), the template is compiled, linked to the new scope, and inserted into the page DOM.
These tasks are performed by the _widget adapter_, selected based on the integration technology that is declared in the _widget.json._
LaxarJS ships with adapters for two integration technologies: _angular_ and _plain_.
The _plain_ adapter requires no additional dependencies, and is meant for widgets that directly access the browser DOM for their rendering.


## The Integration Technology API

Each widget integration technology is implemented as an AMD module with these properties:

* The `technology` is a string that identifies the widget adapter.
  It is compared to the `integration.technology` field of each _widget.json_ to determine which adapter must be used for each widget in the application.

* The method `bootstrap` is called once during application startup to initialize support for the integration technology.
  It receives an array of AMD-modules, one for each matching widget module used by the application.
  The API of the widget modules depends on the integration technology, but usually there is at least a `name` to associate the modules to their _widget.json,_ a method to instantiate a controller for a given widget instance, and possibly a method to set up a view.
  For the _angular_ integration, the widget module simply yields the corresponding AngularJS module, so that controllers can be instantiated by using the AngularJS `$controller` service.
  For the _plain_ integration, the widget module must have a method `create` to instantiate the controller, and optionally an array `injections` to specify services required by the widget, such as the event bus.
  These injections are used as arguments to `create` in the order that they are listed in `injections`.

* The method `create` is a factory that actually creates the widget adapter for a given widget instance.
  Each widget instance has its own adapter instance, so that the adapter is free to maintain state information specific to the current widget instance, as may be required by the integration technology.
  For each widget to be instantiated, `create` is called with an _environment_ object containing the instance configuration and other context information for the widget controller, chiefly the instance's handle to the event bus.

* Optionally an adapter may provide a method called `applyViewChanges`.
  Whenever the _LaxarJS_ runtime carried out some task that may have tampered with the model of one or more widgets, like the asynchronous delivery of event bus events, this method gets called.
  It should then do whatever necessary to achieve consistency again.
  In case of _AngularJS_ this is a call to `$rootScope.$apply()`, while the plain adapter simply does nothing.

Before going into details on the widget adapter API, let us have a look at the environment that is used to create widget adapters.


### The Widget Loader Environment

Before creating an adapter, the widget loader collects all required information and bundles it into an _environment_ object.
The environment has the following properties:

* The `context` object contains information that may be of use to the widget controller:

  * `eventBus`: a handle to the event bus instance for this widget

  * `features`: the complete feature configuration for this instance, with defaults filled in from the widget configuration schema.

  * `id`: a function that takes a string and returns a unique ID that may be given to a DOM-element of this widget instance.
    This is mainly intended to associate form controls with their labels (using the HTML attributes `id` and `for`), without breaking multiple widget instances on a single page.

  * `widget`: only rarely needed, this object provides additional meta information about the widget.
    There is the containing `area` name, the instance `id` as a string and the `path` that was used to instantiate the widget.

  Adapters are supposed to make the context available to widget controllers, preferably through an injection `axContext`.
  The _angular_ adapter provides this injection as a lightweight alternative to the `$scope` injection, which has the same properties.

* The `anchorElement` is a standard HTMLElement meant to contain all widget view UI.
  If the adapter uses a templating system, the instantiated template should be appended to this anchor.
  It automatically gets assigned an ID matching the widget ID, which is useful to identify a widget within the DOM, and a CSS class which should be used to restrict styles to the widget.
  If necessary, Widgets may manipulate DOM outside of their anchor, for example to show an overlay.
  But if they do, they are responsible for cleanup, and they should never modify the DOM of other widgets.

* The `specification` contains the widget meta information from the _widget.json._
  This information is not intended to be passed through to the widget controller.
  Instead, it may help the widget adapter to determine the widget name, and if the current widget is a regular widget or an activity.
  Depending on the integration technology, different fields from the specification may be useful.

Having been created from an environment, all widget adapter instances expose the same set of methods which are called by their widget loader to control widget setup and teardown.


### The Widget Adapter API

All widget adapters must implement the following four methods, to support creation and destruction of controller and view:

* `createController`: called to instantiate the widget controller.
  The argument is a config map, currently only having an `onBeforeControllerCreation` function as single property.
  This function acts as integration point for widget tests and should be called by the adapter just before the controller is instantiated.
  It expects the `environment` as first and all readily prepared injections for the widget as second argument.

  When instantiating the widget controller, the adapter must provide it with the `context` from the widget loader environment.
  Because the view has not been setup at this point in time, the adapter should not yet manipulate the anchor element, nor make it available to the widget controller.

* `domAttachTo`: called with a widget area as the first argument, and an optional (template) HTML string as the second argument.
  The adapter is supposed to instantiate the template based on its implementation technology, and to associate it to the widget controller.
  Depending on the technology, this may happen through binding, for example through the shared _scope_ created by the _angular_ adapter.
  Alternatively, the adapter may call some technology-specific API of the controller and hand over the template.
  The instantiated template should be appended to the anchor element, which in turn should be appended to the widget area element.
  If there is no template, as is usually the case with activities or sometimes with very simple widgets that only need CSS, the value `null` is passed as the second parameter.
  In this case, it is up to the widget adapter to decide if the anchor should be added to the DOM anyway, usually based on whether the type is _widget_ or _activity_.

* `domDetach`: the counterpart to `domAttachTo`, this method is used to remove the view from the containing widget area, temporarily or permanently.
  The widget adapter may teardown the template completely, or keep it "warm" for reattachment.
  LaxarJS may ask widget adapters to detach their DOM and later to attach it again, for example to suspend the widget views within a popup window.

* `destroy`: called only once when a widget instance is removed, usually because the user is navigating away from a page.
  It is not guaranteed that _any_ of the other methods has been called at this point in time, but _destroy_ is supposed to tidy up everything that has been done at this point in time.

For a simple example of a user-defined widget adapter, have a look at this [Backbone.js adapter](https://github.com/alex3683/laxar-backbone-adapter).


## Using a Custom Adapter in a Project

To use a custom integration technology, the corresponding AMD-module must be passed to the LaxarJS `bootstrap` method.
This means that when working on a project that was created by the [LaxarJS Yeoman generator](//github.com/LaxarJS/generator-laxarjs), the `init.js` must `require` the corresponding module, wrap it in an array and pass that array to `ax.bootstrap`.
Of course, the widgets written for this integration technology must state so in their _widget.json._
