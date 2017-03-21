# Controls and Libraries

[« return to the manuals](index.md)

In LaxarJS, any non-trivial HTML element, [HTML5 Web Component](http://webcomponents.org/) or [AngularJS directive](https://docs.angularjs.org/guide/directive) is considered a _control_.
While widgets and activities deal with business logic, controls handle the technical details of user interaction.

Preliminary readings:

* [LaxarJS Core Concepts](../concepts.md)
* [Widgets and Activities](./widgets_and_activities.md)

To provide their business logic, widgets and activities often depend on _libraries,_ which might be created by third parties or simply be used to share common functionality. Examples of libraries commonly used by LaxarJS widgets include:

  * [moment.js](https://momentjs.com/)
  * [LaxarJS Patterns](https://laxarjs.org/docs/laxar-patterns-latest/)
  * [jQuery](https://jquery.com/)

On the other hand, here are some examples of controls:

  * a select box
  * a tab control
  * a [date picker](https://www.npmjs.com/package/laxar-date-picker-control)
  * an [accordion control](https://www.npmjs.com/package/laxar-accordion-control)

LaxarJS helps when developing a custom control by managing and loading its JavaScript implementation module, as well as its theme-dependent CSS stylesheet for you.
If (and only if) you _use_ a control in one or more widgets, LaxarJS will load its CSS according to the current [theme](./creating_themes.md), just like with widgets and layouts.
When you remove the control from your widget, or the widget from your page, its code and assets will no longer increase your application footprint.
This allows you to create and distribute large libraries of controls without fear of application bloat.


## Creating or Integrating a Control

The exact structure of a control depends on the integration technology that is used to create the control and to integrate it into the application.
Throughout this manual, we use the `"angular"` integration technology for our examples.
Note that controls can only be used by widgets that use the same integration technology.
The only exception is the built-in integration technology `"plain"`, which can be used by any widget, but may be difficult to use correctly from some widget integration technologies.
The [plain adapter documentation](plain_adapter.md) explains how these controls are used.


### Creating an `angular` Control using a Directive

LaxarJS does not care whether your control is installed through NPM or Bower, or if it is located somewhere else within your project, as long as its `control.json` descriptor can be found by the laxar loader (for webpack).
Let us try to create a control _my-clock-control_ that displays a digital clock to the user.


#### Controls Directory

First, choose a location for your control within your application, such as `application/controls/my-clock`.
The path `application/controls/` is the _controls-root_, and can be overwritten by creating a `laxar.config.js` with `paths.controls` export.


#### The Control Descriptor

Just like widgets, controls have a small JSON descriptor _(control.json)_ which instructs the runtime on how to load the control, and where to look for styles.
Here is the descriptor for our clock control:

```json
{
   "name": "my-clock-control",
   "integration": {
      "technology": "angular"
   }
}
```

To ensure compatibility between each widget and its controls, both must use the same _integration technology_.
The technology `"plain"` is supported for controls out-of-the-box, and other technologies can be added through *adapters*, such as the [laxar-angular-adapter](laxarjs.org/docs/laxar-angular-adapter-v2-latest/).
The _name_ allows the LaxarJS runtime to load the correct implementation module and the right CSS styles.
So even if using a folder of a different name, or a control installed from NPM, the runtime would still be able to load the control.


#### AngularJS Directive

Now let us create the AngularJS module for the control, in `application/controls/my-clock-control/my-clock-control.js`:

```JS
define( [ 'angular', 'text!./my-clock-control.html' ], function( ng, clockTemplate ) {
   'use strict';

   var module = ng.module( 'myClockControl', [] );

   module.filter( 'myClockDigits', function() {
      return function( number ) {
         return ( number < 10 ? '0' : '' ) + number;
      }
   } );

   return module.directive( 'myClock', [ '$timeout', function( $timeout ) {
      return {
         restrict: 'E',
         template: clockTemplate,
         link: function( $scope ) {
            tick();
            function tick() {
               $scope.date = new Date();
               $timeout( tick, 1000 );
            }
         }
      };

   } ] );

} );
```

We use a prefix _(my)_ for the control and for the filter- and directive-names to avoid collisions with other controls and directives, as well as future HTML elements.


#### AngularJS Template

Let us create a simple template at `application/controls/my-clock-control/my-clock-control.html`.

```HTML
<span class="my-clock">
   {{ date.getHours() | myClockDigits }}:{{ date.getMinutes() | myClockDigits }}:{{ date.getSeconds() | myClockDigits }}
</span>
```

It is recommended to use the control name as a prefix for any custom CSS classes as shown here, to avoid collision with other controls and libraries.



#### The CSS Style Sheet

To automatically load your CSS depending on the theme, it has to be placed into a sub-directory `default.theme/css` of your require path and its file name must correspond to the control descriptor.
In case of the clock control, the correct path would be `application/controls/my-clock-control/default.theme/my-clock-control.css`.

```CSS
.my-clock {
   font-family: 'Times New Roman', serif;
   font-weight: bold;
   font-size: 36px;
   border: 3px double black;
   padding: 3px;
}
```

Not that for controls, _theme folders_ are only used for stylesheets, not for templates.


### Using a Control from a Widget

Any widget that uses our clock should declare its dependency using `controls` entry in its `widget.json`:

```JSON
"controls": [ "my-clock-control" ],
```

This allows the runtime to load control module and to register the AngularJS module during bootstrapping.
Additionally this causes the control CSS to be loaded from the correct theme, and to be bundled when creating a release-version of your application.

To actually get the control onto the screen, you have to reference it from your widget's HTML template:

```HTML
<h3>My Widget, now with 100% more 24h-clock!</h3>
<my-clock></my-clock>
```

After adding your widget to a page, you may inspect your timepiece in the browser:

![my-clock-control in action](providing_controls/my_clock.png)


## Creating or Integrating a Library

Adding custom libraries is even simpler than adding controls, because usually they do not need to load theme-specific CSS or to have their AngularJS modules managed by the [laxar-angular-adapter](http://laxarjs.org/docs/laxar-angular-adapter-v2-latest/) -- if they do, try turning them into controls or activities respectively.
Just put the library somewhere within your project (preferably using NPM) and make sure that it can be resolved and loaded by webpack.
