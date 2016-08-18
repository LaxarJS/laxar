# Writing Widget Controllers

[« return to the manuals](index.md)

The basic layout and properties of a widget controller and its module depend on the underlying integration technology.

Preliminary readings:

* [LaxarJS Core Concepts](../concepts.md)
* [Widgets and Activities](widgets_and_activities.md)

As soon as the controller has been instantiated, communication mostly takes place over the event bus using common [events](events.md), and all functionality is written in the style specific to the corresponding technology.
Additionally some libraries may be used to simplify recurring tasks, like e.g. [LaxarJS Patterns](https://github.com/LaxarJS/laxar-patterns/) for common event bus interaction patterns.

The purpose of this manual is to describe how a basic setup for a widget using one of the built-in technologies is established.



## Selecting an Integration Technology

The selection of an integration technology takes place in the `widget.json` of each widget.

For example:

```json
{
   "name": "my-plain-widget",
   "integration": {
      "type": "widget",
      "technology": "plain"
   },
   "features": { ... }
}
```

For now this is limited to `angular`, `react` and `plain`.
In case you developed [your own widget adapter](adapters.md), this is of course available as well under the name the adapter exports as `technology` property.

## Available Integration Technologies

Out of the box LaxarJS currently supports two different integration technologies:
Plain Javascript widgets and widgets defining an *AngularJS* module and controller.
In the following both technologies are described.

If you want to develop a widget with *React* you can use our [laxar-react-adapter](https://github.com/LaxarJS/laxar-react-adapter).

Note that for the time being all widgets have to be defined as [AMD module](https://github.com/amdjs/amdjs-api/wiki/AMD), since this is the way LaxarJS bootstraps them.


### Plain JavaScript Widgets

Plain JavaScript widgets are bootstrapped without any specific library or framework.
This allows the implementation of a widget in pure vanilla JavaScript, or the direct usage of smaller, non-invasive libraries for rendering and controller implementation.
For example a chart widget can be implemented using just [D3.js](http://d3js.org/) directly, to render a chart into an SVG element.
Even more obviously activities can be implemented using the *plain* integration technology, because there is no need at all for a UI rendering library.

When implementing a plain widget, its AMD module must simply return an object with three properties, where two are mandatory:

* `name`: this is the name of the widget's module and **must** equal the `name` property from the `widget.json`.
 Note that this is different from AngularJS widgets, where *camelCased* names are used).

* `create`: this is the bootstrapping function for a controller instance.

  In case of an activity (which has no HTML template) there is no need to return anything in here.
  If on the other hand a widget should have its UI rendered as child of the area it was added to, this function **must** return an object with a `renderTo` function as single property.
  This function will be called as soon as the widget instance is attached to the DOM.
  It receives the wrapper `div` element created by the widget adapter as single argument.
  When this function is called, the contents of the HTML template have already been added to this element as `innerHTML`.

  The parameters of the `create` function must correspond to the optional `injections`, explained in the following.

* `injections`: an optional listing of services to inject into the `create` function.
  Each item is the name of a service to inject into a new controller instance.
  The order in this list determines the order the services are passed into the `create` function.

  [Available injections](#available-injections) are listed below.

An example of a simple plain widget, called `my-plain-widget`:

```js
define( [ 'laxar-patterns' ], function( patterns ) {

   return {
      name: 'my-plain-widget',
      injections: [ 'axContext' ],
      create: function( context ) {
         // LaxarJS Patterns works great with plain widgets.
         // The configured resource will be managed on `context.resources.myResource`
         patterns.resources.handlerFor( context )
            .registerResourceFromFeature( 'myResource' );

         if( context.features.fancyFeature.something ) {
            // do something fancy if the feature is set
         }

         return {
            renderTo: function( element ) {
               // The widget has been attached to the DOM and initialize its DOM representation:
               element.querySelector( '.output' ).innerHTML = 'Hello World';
            }
         };

      }
   };

} );
```

Note that this widget is using the [laxar-patterns](https://github.com/LaxarJS/laxar-patterns) library to manage resource events.
Of course, using this library is completely optional.


Assume this as the accompanying template:

```html
<h1>My Plain Widget</h1>
<span class="output"></span>
```

When the LaxarJS runtime calls `renderTo` with the anchor element, the `h1` and `span` elements are already appended to it.
Hence, the call to `querySelector` will successfully return the `span` with class `output`, and its HTML content is set to "Hello World".
Anything else, like including and using external libraries for example, is left to the user.


### AngularJS (1.x) Widgets

In contrast to plain widgets, AngularJS widgets are defined by using standard AngularJS modules:

The AMD module must return an AngularJS module as its sole export, following the AngularJS naming scheme, where the module name **must** equal the `name` property in the `widget.json` in camel-case notation with lower-case first letter.
The widget controller must use the module name as well, but with "Controller" appended and an upper-case first letter (taken from [John Papa's style guide](https://github.com/johnpapa/angular-styleguide#controller-names), which is referenced from [the official AngularJS blog](http://angularjs.blogspot.de/2014/02/an-angularjs-style-guide-and-best.html)).
If for example the widget is called *my-first-angular-widget*, the module would be named *myFirstAngularWidget* and the controller *MyFirstAngularWidgetController* in consequence.

Just like with plain widgets, the template will be wrapped in a `div` element and automatically appended to the DOM subtree of the corresponding widget area.
Additionally, after compilation the template is linked to an AngularJS Scope, which can be injected into the controller as `$scope`.
All injections mentioned for plain widgets are also available via default AngularJS DI mechanisms, in addition to those offered by AngularJS out of the box.
It is also possible to define widget-specific directives, filters and services directly on the widget module.
There are no artificial restrictions for AngularJS widgets, but when creating a directive or service that might be of use to other widget authors, consider extracting it into a separate [control](providing_controls.md).

Here is an example using AngularJS as technology to achieve the same as with the plain widget above (only that we'll call it `my-angular-widget` here):

```js
define( [ 'angular', 'laxar-patterns' ], function( ng, patterns ) {

   // We always use named injections to be save when applying minification.
   // We chose this rather strange syntax utilizing function hoisting, to prevent from
   // too many array brackets and nevertheless have the names next to the actual
   // controller arguments. Feel free to write this anyway you like and feel
   // comfortable with when defining controllers in AngularJS.
   Controller.$inject( '$scope' );

   function Controller( $scope ) {

      // In AngularJS we set scope properties and never manipulate the DOM directly
      // from within a controller.
      $scope.myString = 'Hello World';

      // Notice how we can use $scope instead of axContext here, as both provide the
      // same relevant properties for the patterns library.
      patterns.resources.handlerFor( $scope )
         .registerResourceFromFeature( 'myResource' );

      if( context.features.fancyFeature.something ) {
         // do something fancy if the feature is set
      }
   }

   // Finally, we return the module with our controller.
   return ng.module( 'myAngularWidget' )
      .controller( 'MyAngularWidgetController', Controller );

} );
```

The template then looks like this:

```html
<h1>My Angular Widget</h1>
<span class="output">{{ myString }}</span>
```


## Available Injections

For all integration types the same basic set of injectable services or objects is available.
In case of AngularJS widgets it is of course possible to add more services to the list via standard dependency injection mechanisms.
On the other hand the `$scope` is not available for plain widgets, but `axContext` should provide all the useful parts.
But out of the box these are the injections provided by LaxarJS:

* `axEventBus`: the [event bus](../api/event_bus.js.md) instance for this widget.

* `axFeatures`: the features configured for this widget by the containing page (more on [configuration options](widgets_and_activities.md#configuration-options) and [writing pages](writing_pages.md)).

* `axContext`: this is a complete object containing all configuration and API specifically available to this widget instance and has mostly the same properties as the `$scope` injection  of an AngularJS widget.
  The `axEventBus` and `axFeatures` injections explained before are available as `eventBus` and `features` properties of `axContext`.
  In addition the context provides an `id` function to generate globally unique ids using a short, local reference, and a `widget` object providing some more details of the widget instance.
  While the `id` function should always be used when creating ids within a widget, the `widget` property should simply be ignored.

* `axFlowService`: a service offering help in working with the application flow, to e.g. create links for navigation to a place or target.
  So if for example you don't want navigation to happen only through events, but would like to use accessible `a` elements, you can find the right tools there.
  Have a look at the [flow API](../api/flow.js.md) for further information.

* [Runtime Services](../api/runtime_services.js.md): all injectable services defined in the runtime services of LaxarJS.
  For detailed information on the available services have a look at the [runtime services API](../api/runtime_services.js.md).

  **Important note**: The `axGlobalEventBus` from the runtime services should **never** be used directly in a widget implementation, unless you know exactly what you are doing.
  Firstly, the sender information will not automatically be set for you when publishing events through the global event bus, and secondly subscriptions won't get removed when the widget instance is destroyed due to navigation.
  Especially the latter can have a severe impact, as this introduces a memory leak, possibly over the full function scope of the widget controller.
  In this situation, the memory would only get released when navigating away from the LaxarJS application or refreshing the page via browser refresh.


## BYOA (Bring Your Own Adapter)

If the existing integration technologies don't satisfy your needs and you need to implement your own adapter, just have a look at the [manual on adapters](adapters.md).
The built-in adapters are a good reference to start with.
