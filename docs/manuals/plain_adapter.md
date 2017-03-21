# The `"plain"` Integration Technology

[« return to the manuals](index.md)

While LaxarJS allows you to adapt external MVC frameworks for writing widgets, sometimes that is not actually needed.
Especially when creating activities, often there is no reason to use something like Angular or Vue.js.
on to understand the inner workings of a LaxarJS application.
The `"plain`" technology is for widgets that simply rely on what the browser has to offer.

Preliminary readings:

* [LaxarJS Core Concepts](../concepts.md)
* [Widgets and Activities](widgets_and_activities.md)
* [Widgets Services](widgets_services.md)


## When to Use the `"plain"` Technology?

The `"plain"` integration technology is supported by LaxarJS out-of-the-box without having to add any adapter to a project.
This minimizes the _footprint_ of widgets, especially if you intend them to be used from within projects that are created using various different integration technologies.
Also, a reduced number of dependencies will likely improve _compatibility._
For example, if a widget relies on `"angular2"`, it might not work within projects that use upcoming major versions of Angular.

Also, `"plain"` is a great choice for _activities:_
These do not benefit as much from MVC frameworks, except from utility services (such as `$http` in `"angular"`).

Finally, using `"plain"` may be the best option if you are interfacing with the DOM directly instead of going through a templating abstraction, e.g. if

   - you would like to mainly use `canvas`, `video` or even _WebGL_ for your UI,
   - you would like to manipulate the DOM heavily, using custom animations or maybe `D3` charts.

In these use cases, even well-designed view frameworks sometimes just get in the way.


### When to Avoid the `"plain"` Technology?

When _development speed_ of your project is of more concern than raw download or execution speed, you may want to refrain from using the `"plain"` adapter.
This is especially true for widgets containing _complex business UI_ with a lot of form controls, tables, show/hide animations and so on -- these view frameworks exist for a reason.

Also, if you are sure that all of your projects will be created with, say, Vue.JS in the near future, it may be much simpler to just stick with it.

Finally, if you are adding some functionality to an existing project, you should probably simply use whatever most of the project is using, even more so if that functionality is not intended for reuse.


## Creating a `"plain"` Activity

To keep things simple, let us create an activity that simply logs a message as soon as it receives the `beginLifecycleRequest` event.

For an activity, you just need two files:

   - the `widget.json` descriptor,
   - the controller implementation module.

In the widget descriptor, make sure to set `integration.technology` to `"plain"` and `integration.type` to `"widget"`.
Also, pick a `name`; we will use `"my-activity"` for this example `widget.json`:

```json
{
   "name": "my-activity",
   "integration": {
      "type": "activity",
      "technology": "plain"
   }
}
```

You can also add a `features` configuration schema, which we will skip here, as it is not specific to the integration technology that is used.

Next, create your implementation module `my-activity.js`:

```js
export const injections = [ 'axEventBus', 'axLog' ];
export function create( eventBus, log ) {
   eventBus.subscribe( 'beginLifecycleRequest', () => {
      log.warn( 'OK, now what?!' );
   } );
}
```

And that's it: activity modules just need to export their named `injections`, and a `create` function with a matching signature.


## Creating a `"plain"` Widget

Let us now explain how to create widget by using a simple text containing a counter.
For some reason, we would like to increment the counter anytime the user clicks on the page.

It is not far from activity to widget:
Change the `name` and `integration.type` of the `widget.json` descriptor.
This time, let us throw in a feature configuration schema just for show:

```json
{
   "name": "my-widget",

   "integration": {
      "type": "widget",
      "technology": "plain"
   },

   "features": {
      "$schema": "http://json-schema.org/draft-04/schema#",
      "type": "object",
      "properties": {
         "label": {
            "type": "object",
            "properties": {
               "text": { "type": "string", "default": "Click Me!" }
            }
         }
      }
   }

}
```


### The HTML Template

Put your template under `default.theme/my-widget.html`, just like you would for, say, AngularJS:

```html
<h1>My Widget says <span class="my-widget-label"></span></h1>
```

Note that since this is a plain widget, _no preprocessing_ or interpolation of values takes place.


### The CSS stylesheet

Unless you use a custom theme for your new widget, LaxarJS will be looking for styles in `default.theme/css/my-widget.css`:

```css
.my-widget h1 {
   font-style: italic;
}
```

Styles work exactly as they do for other integration technologies, including the ability to namespace by the widget name, as shown here.
If your widget does not need custom styles, simply omit the file.


### The Widget Controller

What is missing now is connecting feature configuration and widget template happens in the implementation module `my-widget.js`:

```js
export const injections = [ 'axWithDom', 'axFeatures', 'axEventBus' ];
export function create( withDom, features, eventBus ) {
   let view;
   let numClicks = 0;

   function render() {
      withDom( () => {
         container.querySelector( '.label' ).textContent = numClicks === 0 ?
            features.label.text :
            `Clicked ${numClicks} times`;
      } );
   }

   return {
      onDomAvailable( dom ) {
         view = dom;
         document.body.addEventListener( 'click', handleClick );
         eventBus.subscribe( 'endLifecycleRequest', () => {
            document.body.removeEventListener( 'click', handleClick );
         } );
         render();

         function handleClick() {
            ++numClicks;
            render();
         }
      }
   };

}
```

The controller looks similar to that of an activity, except for the additional return statement and for the injection `axWithDom` that the `"plain"` technology adapter makes available for widgets only.

   - the `onDomAvailable` method returned by the widget's `create` function will be called as soon as the widget DOM was inserted into the page for the first time.
     If your widget is part of an initially hidden widget area such as a popup window, `onDomAvailable` may be called much later than `create`, or never.

   - the `axWithDom` hook guards its callback against the DOM being unavailable while a widget's container area is hidden.
     It will only be executed if the widget DOM is actually attached to the page.

If `render` was run only during `onDomAvailable`, the `axWithDom` injection would not be needed.
However, `render` may be run anytime the user clicks anywhere within the document body.
Guarding `render` in this way ensures that we do not run into `null`-reference problems in case our containing widget area is hidden.


## Creating a `"plain"` Control

While controls for other technologies directly integrate with their respective component model, using a plain control offers little over directly using `import` (or `require`) to add a UI library such as the [Drop Tooltip](http://github.hubspot.com/drop/) or the [Velocity Animations Engine](http://velocityjs.org/) to your widget.

Still, using `"plain"` controls has two beneficial implications:

   - LaxarJS will _automatically load their CSS stylesheet_ depending on the theme used by the application,
   - controls for `"plain"` can be used by widgets written in _any integration technologies_.

This makes it worthwhile to create controls _just for styling_, effectively giving you _CSS components_ that are loaded as needed by the widgets within your application, and can be overwritten per theme.

So, whenever you create or integrate a non-trivial piece of UI, consider wrapping it as a _plain_ control, in particular if there are associated CSS styles.


### The Control Descriptor

Like widgets, controls need a `control.json` descriptor containing their `name` and `integration.technology`.


### The Control Implementation Module

LaxarJS does not impose restrictions on control implementation modules, except that they must be named as determined by the descriptor.
Whatever you `export` from your control module will be accessible from widgets using your control.
Usually, you should export some kind of constructor or a `create` function that widget authors should invoke with a DOM node and/or customization options.


### The Control Stylesheet

LaxarJS will automatically bundle CSS styles for controls _if_ they are located in the right place.
Using the `default.theme`, styles for a control `my-control` would be read from the control folder under `default.theme/css/my-control.css`.
Note that controls do not receive themed HTML.
However, they can use `import` or `require` to load HTML through the `raw-loader` provided by webpack.


### Accessing a Control from a Widget

Widgets of any implementation technology can use the `axControls` injections to obtain their control implementation modules.
Using `axControls.provide( name )`, they can obtain the modules by `name`, as in the `controls` section of their widget descriptor.

More Information

   - [API: `axControls` widget service](../api/runtime.widget_services.md#axControls)
   - [Manual: Providing Controls](providing_controls.md)
