[« return to the manuals](index.md)

Preliminary readings:

* [LaxarJS Core Concepts](../concepts.md)
* [Widgets and Activities](widgets_and_activities.md)
* [Events and Publish/Subscribe](events.md)
* [Writing Pages](writing_pages.md)


# Working with Visibility Events

> Visibility events help to improve performance by allowing widgets to determine if they are visible to the user or if they currently reside in the background.

Note that while this manual is rather longish, there is a [TL;DR](#summary-tldr) at the bottom.

## Why Visibility Events?

Some widgets perform *expensive* operations such as:

  - loading and/or display of large amounts of data
  - loading and/or rendering large images and/or movies
  - using expensive controls for things like charts, animations etc.
  - measuring DOM-elements for parameterizing animations
  - providing *widget areas* which may in turn host expensive widgets.

If a widget does one or more expensive thing, it should only do so while the widget itself is *visible* to the user.
Frequently, widgets are *hidden* from the user, on page entry or afterwards, due to being nested:

  - within an invisible (closed) popup/popover
  - within an invisible accordion area
  - within an invisible tab area
  - within an invisible show/hide-area.

The so-called *visibility events* help widgets to determine whether their contents may be seen by the user.

If a visibility event tells a widget that it is *hidden*, the widget may stop performing any expensive operations.
If another visibility event tells a widget that it is *visible* (again), that widget may not necessarily be within the visible portion of the page at that time, but might be scrolled into view at any moment.


### Caveat

As with all performance optimizations, be careful not to optimize overly eagerly.
First, LaxarJS performs several optimizations automatically as outlined below.
Also, visibility events may complicate your widget implementations unnecessarily, especially in small applications.

However, unfortunately optimization often *is* necessary: client side web-applications sometimes tend to be slow to load or to feel sluggish, especially on mobile devices.
If you are not satisfied with your application's performance, try to identify the heavy hitting widgets in you application and to control their behavior first.
Also, make sure that visibility event handling can actually help you:
If there are activities on your page causing tons of REST-requests, chances are that optimizing based on visibility may not help at all.


## Handling Visibility Events

An initial set of visibility events is published on page entry by the LaxarJS runtime, after *beginLifecycleRequest* but before *didNavigate*. Widgets may subsequently publish their own visibility events to signal changes to areas that they provide.
These changes are then propagated to nested widget areas by the runtime.

The following section will explain how widgets can access and utilize visibility information.
Afterwards, details follow on *controlling* visibility through events.


### Automatic Handling

The LaxarJS runtime maintains a internal visibility status flag for each widget and for each area.
Even for the widgets that do not care about visibility at all (the majority), the runtime uses this information to determine when the widget DOM is prepared and added to the page DOM, since this may be an expensive process itself.
With AngularJS for example, widget HTML must be compiled and linked, creating all nested directive instances.

Note that widget DOM is *not destroyed* again after the initial attach, until the page is left by the user.
If a widget uses a template with a large number of bindings, it may be beneficial to *cut off* these bindings when invisible, for example by using `ngIf` in an AngularJS widget (next section).


### Manual Handling in Controllers & Templates

Widget controllers can subscribe to `didChangeAreaVisibility.{area}.{visible}` events.

  * Instead of `area`, the name of the surrounding widget area should be used.
    The event payload contains the area name as well, under an attribute `.area`.
    For subscribing, this name available from the `axContext` injection (AngularJS: `$scope`) as attribute `.widget.area`.

  * The `visible` value (`true` or `false`) confers the new visibility status of the area and is usually not pre-selected when subscribing.
    The event payload contains this status as well , under a boolean attribute `.visible`.

To simplify handling, the [visibility handler](https://github.com/LaxarJS/laxar-patterns/blob/master/docs/api/visibility.js.md) in the utility library [LaxarJS Patterns](https://github.com/LaxarJS/laxar-patterns#laxarjs-patterns-) may be used.
Here is an example for an AngularJS widget:

```js
define( [ 'angular', 'laxar-patterns' ], function( ng, patterns ) {
   Controller.$inject = [ '$scope' ];
   function Controller( $scope ) {
      patterns.visibility.handlerFor( $scope, {
         onShow: startExpensiveStuff,
         onHide: stopExpensiveStuff
      } );
   }
   // ...
} );
```

In the *HTML-template*, `ng-if="isVisible"` may be used to toggle (portions of) the template based on visibility.
Not that this is not useful to speed up initial rendering, due to the automatic DOM handling described above.
The scope-property `isVisible` is maintained by the visibility handler as well, so make sure to have the controller instantiate it.


### Manual Handling in Directives

AngularJS directives get special support through the `axVisibilityService` injection.
Usually, controls (such as directives) should not interact with the event bus directly:
because their lifetime is coupled to the DOM, they might not receive arbitrary events.
So, usually the widget controller should pass visibility information to controls using some kind of binding.

However, AngularJS directives may also use the visibility service provided by the runtime, to handle visibility themselves.
For example, imagine a clock directive that renders an animated, analogue clock.
Naturally, the clock animation should pause while the widget containing the clock is invisible:

```js
module.directive( 'myClockControl', [
   'axVisibilityService',
   function( visibilityService ) {
      return {
         link: function( scope ) {
            var handler = visibilityService.handlerFor( scope )
               .onShow( startClockAnimation )
               .onHide( stopClockAnimation );
            if( handler.isVisible() ) {
               startClockAnimation();
            }
            // ...
         }
      };
   }
] );
```

Another example: the [laxar-show-hide-widget](https://github.com/LaxarJS/ax-show-hide-widget/) contains a directive that measures the contents of an embedded area in order to control an animation.
Only while the widget is visible should measurement and animation be used, simply switching states at other times.
For this, the visibility service is used as well.


## Controlling Visibility through Events

Most widgets just need to *react* to visibility changes.
Other widgets *provide* areas themselves, directly (like the [laxar-accordion-widget](https://github.com/LaxarJS/ax-accordion-widget)) or through embedded layouts (like the [laxar-popup-widget](https://github.com/LaxarJS/ax-popup-widget)).

Controlling visibility of embedded areas from a widget includes two tasks:

  * responding two visibility requests for the provided widget areas

  * trigger visibility requests to inform the runtime and other widgets after actively changing an area's visibility.

Let us have a detailed look into both tasks.


### Responding to Visibility Requests

Initially the LaxarJS runtime publishes `changeAreaVisibility.{area}.{visible}` events for all areas directly within top-level areas, asking them to publish a visibility status for any areas provided by them.

  * again, `area` is the name of the widget area of interest

  * `visible` is the visibility state of the surrounding area, (`true` for all regular top-level areas, but `false` for the generated `popups` and `popovers` areas).

Widgets that want to control their area's visibility may now respond with `didChangeAreaVisibility.{area}.{visible}` events containing the actual new visibility state.
If there is no reply for a widget area (for example because the providing widget does not know or care about visibility events), the runtime publishes the `didChangeVisibility` event itself, using the default `visible` value from the request.
Next, all directly nested areas are processed in the same manner, until "bottom" is reached.

This process is also used to implement visibility changes that happen later during the lifetime of the page.
For example, a *laxar-accordion-widget* embedded within the contents of a *laxar-popup-widget* will be queried for the visibility of its areas when the popup is opened or closed.

The visibility handler of *laxar-patterns* offers help in responding to visibility requests:

```js
define( [ 'angular', 'laxar-patterns' ], function( ng, patterns ) {
   Controller.$inject = [ '$scope' ];
   function Controller( $scope ) {
      patterns.visibility.handlerFor( $scope )
         .onAnyAreaRequest( function( name ) {
            // something like:
            return $scope.isVisible &&
                name === model.myCurrentArea;
         } );
   }
   // ...
} );
```

The property `$scope.isVisible` maintained by the visibility handler is used to quickly access the current visibility state of the surrounding area.
The value `model.myCurrentArea` might be use by the widget to e.g. store the name of the area that was selected by the user, such as the current tab content in a tab-navigation widget.


### Changing Visibility of Provided Areas

After a widget has modified the visibility of its provided areas, it must publish corresponding `changeAreaVisibilityRequest`-Events.
The `visible`-parameter of these events must be set to the new target value, taking into account the visibility of the surrounding area.

Again, an example using laxar-patterns:

```js
define( [ 'angular', 'laxar-patterns' ], function( ng, patterns ) {
   Controller.$inject = [ '$scope' ];
   function Controller( $scope ) {
      var publisher =
         patterns.visibility.requestPublisherForArea(
            $scope, $scope.widget.id + '.myArea' );
      $scope.onAreaClicked = function() {
         publisher( true );
      }
   }
   // ...
} );
```

Note that the widget may very well respond to its own visibility requests.

The basic principle of this pattern is similar to that of `takeActionRequest` events:
Even though the controlling widget knows that it is going to handle the request itself, it still starts the visibility modification with a request.
This informs other widgets and especially the runtime of the visibility change.


### Changing Visibility of a Directly Embedded Layout

Some widgets such as the *laxar-popup-widget* directly load *layouts* which in turn provide widget areas.
For these widgets, requesting a visibility change for individual areas is not possible, because the name of the areas is not known.

To trigger re-evaluation of these areas, containing widgets may trigger `changeWidgetVisibilityRequest.{widget-id}.{visible}` events.
The ID can be read from the `$scope` (or `axContext` respectively) as `.widget.id`.

The runtime then automatically triggers visibility requests for the embedded areas.


## Summary (TL;DR)

  * Visibility events help to improve render times and to reduce CPU- and memory-use.

  * Widgets may *react* to visibility changes by processing `didChangeAreaVisibility` events, directly or through the laxar-patterns visibility handler.

  * The runtime publishes `didChangeAreaVisibility` events before`didNavigate`.

  * AngularJS directives can use the `axVisibilityService` for simplified handling without help from their containing widget.

  * Widgets that provide areas and that influence the visibility of those areas *should control* visibility by responding to `changeAreaVisibilityRequest` events. They should also trigger such requests after initiating a visibility change to any of their provided areas.
