# LaxarJS Concepts

In order to get productive with LaxarJS, a basic understanding of a few core concepts is helpful.


## A LaxarJS Application

To the visitor running a web browser, an _application_ is a set of URLs and associated pages which are loaded by the browser to provide some information or functionality.
An application may access web services or connect to database programs, which are not considered part of the LaxarJS application itself.

From a developer point of view, an application primarily consists of:

* a set of LaxarJS _widgets_ and _activities_ providing the functionality
* the _pages_ and _layouts_ assembling these widgets and activities
* a _flow_ that connects the individual pages
* one or more _themes_ to define the look and feel of the application.

In order to run the application, there are additional secondary resources:

* the _LaxarJS runtime_ loads flow and pages, sets up the widgets and connects them through an _event bus_
* _controls_ which are used by the widgets to provide advanced user interface functionality, such as those provided by _LaxarJS UiKit_
* _libraries_ used by widgets and activities, such as _moment.js_, _jQuery_, and _LaxarJS Patterns_.

The following two sections first explain the primary application components, and then the underlying secondary components.


## Primary Application Parts

### Widgets

A _LaxarJS widget_ is a rectangular part of the browser viewport which _allows the user to perform some task_.
It usually consists of several HTML elements, but could in some cases use only a single element, for example a `canvas` to provide a painting surface.

The important distinction between a LaxarJS widget and a plain HTML control (such as a `select` box or an `input` field) is that a widget is written with a specific _user-goal_ in mind, whereas a control is general-purpose and its role in the application is up to the developer.
For example, while a control might allow a user to input some text (such as a name, or a password), a widget could combine several input controls to a dialogue allowing the same user to _log in_ to the application, and another widget might allow the user to _register_ a new account.
So, both widgets and controls are parts of the user interface, but on different levels of abstraction.

To illustrate this with further examples, possible widgets _with their specific goals_ include:

* a to-do list, _to check and plan what is to do_
* a shopping cart, _to review and edit purchase items_
* a route planner displayed as a map, _to plan a journey_
* a calendar displaying various events, _to schedule and check appointments_
* the details editor for a specific event, _to reschedule or cancel an appointment_
* a social buttons bar, _to share content_.

In contrast, these are controls:

* an input field, _to display/edit any text_
* a date picker, _to display/edit any date_
* a select box, _to choose from any list of options_
* an accordion control or a tab control, _to navigate any set of contents_.

Another way to think of it is that _widgets are made of controls_, and  _controls are HTML elements_ — which *may* be user-defined, for example by using HTML web components or AngularJS directives.
The program logic of an individual widget is implemented in JavaScript, while the presentation is defined by using an HTML template, optionally accompanied by CSS styling information.

An important property of widgets is that they always can be _loaded and tested in isolation_:
A widget instance may be put onto any page, regardless of what other widgets (even of the same type) may already be there.
To simplify the creation of widgets, LaxarJS directly supports several modern UI technologies, including Angular, React and Vue.

### Activities

A _LaxarJS activity_ is a widget without a visual representation, performing a task for the user _behind the scenes_.
To build upon the previous example, a _login widget_ might talk to an authentication service itself, but it might also delegate this task to an _authentication activity_ using the event bus.
When the authentication mechanism changes (e.g. from a plain HTTPS authentication to OAuth) only the activity needs to be exchanged, while the widget remains untouched.
In contrast to regular libraries, activities participate in the lifecycle of the page and are attached to the event bus, which allows them to communicate with other widgets using publish/subscribe.

Another possible example would be a _web search widget_ offering a search box with a list of web search results.
Instead of hard-wiring the widget to a specific search engine, one could implement multiple engine-specific activities and choose depending on user preference.
Because the search widget does not know any of the activities (it just _subscribes_ to the search results) one could even define a "proxy" activity to combine results from multiple searches without touching the widget or any of the search engine implementations.


#### Widgets vs. Activities

_Widgets assume that they are displayed in the browser, while activities can run in any JavaScript environment_.
In contrast to the visual widgets, activities do not have HTML templates nor CSS styles.
To sum it up, widgets support direct user-interaction, while activities perform tasks behind the scenes, such as talking to (REST) services or coordinating different widgets.


### Pages

A _LaxarJS page_ is a piece of configuration data that combines and configures widgets and activities that are used together at the same place in the application.
For visual arrangement, the page anchors them within an HTML skeleton called _layout_.
When navigated to, the runtime loads the page and puts the widgets referenced by the page into the associated layout to display them.
The page also defines the publish/subscribe topics that the widget instance use to communicate resource state and user actions.

An individual widget is still somewhat generic in that it allows to perform a specific task _in any context_:
For example, a social buttons bar allows to share _any content_, and the specific list of social sites to share on might be _configurable_.
The page establishes this context, for example _by placing_ the social buttons below a news article (rendered from markdown by another widget), and _by configuring_ that twitter and tumblr should be offered, but not LinkedIn.
This does not mean that all widgets must be broadly reusable: a widget to manage the inventory in a video game would probably not be useful anywhere else.
Still, reuse is supported for those widgets where it makes sense.


#### Collaboration Patterns and Compositions

While widgets and activities are implemented in JavaScript and HTML, pages are written using *JSON* in a declarative fashion.
This reflects on the fact that pages do not contain application logic, but merely assemble and configure a set of widgets.
Of course, often the widgets on a page are supposed to be collaborating, by sharing resources or by accessing each other's functionality in some way.
Pages enable this by connecting widgets through shared event bus topics.
The widgets in turn participate in standard _event patterns_ for collaboration.

Usually, each page occupies its own "screen" in your application, but there is a _composition_ mechanism to divide pages into reusable fragments and re-assemble them in various contexts.


### Layouts

_LaxarJS layouts_ are skeleton HTML documents, which contain placeholders (called _widget areas_) within which widget instances can be placed.
Each page specifies a layout that the LaxarJS runtime should use for it.
You can use one or several layouts for all of the scaffolding markup of your application (such as copyright footers and navigation), but you may also choose to implement these areas as widgets to allow for re-use and configuration.

By default, LaxarJS applications use _Bootstrap CSS_ to implement a grid layout in CSS, and to ensure that widgets are compatible with respect to their CSS, however you are free to deviate from this in your application.
For each _widget area_, the layout can define a width in Bootstrap grid columns, and widgets within these areas may not exceed their available number of columns.
Like widgets, layouts may be accompanied by their own CSS styles, for example to define a background color.

You may think of layouts as the opposite of activities: While activities are just widgets without a user interface, layouts are similar to widgets without the logic part – just HTML templates and CSS.


### The Flow

The flow defines _URL patterns_ that may be used to navigate to the pages of an application, and _relations between pages_.
It is comparable to the routing mechanisms found in many MVC web frameworks.
Also, the flow defines semantic relations between pages, such as what is considered the _next_ page from a given page in the application.


### Themes

Widgets and their controls may be styled using CSS.
For widgets with a broad applicability (such as a calendar, or a route planner) it can be very useful to adapt the visual appearance to various circumstances.
This is achieved by overriding parts of the vanilla bootstrap CSS classes (shipping with LaxarJS UiKit) with user defined CSS styles.
A theme may specify styles for any control and for any widget that it wants to modify.
Where nothing else is specified, plain bootstrap is used.

The LaxarJS UiKit is based on SCSS to simplify the generation of user-defined themes. However, any way to generate Bootstrap-like CSS styles is a valid way to create a standard LaxarJS theme.


## Secondary Application Parts – Under the Hood

### The LaxarJS Runtime

The _runtime_ handles URL routing and loads the template associated with the current page definition.
It instantiates all required widgets and activities, and tells them when everyone else is ready to receive their publish/subscribe-events.
It also loads the corresponding templates and CSS files, or provides these assets from an optimized bundle in production.
Once everything is set up, the runtime gets out of the way: it lets the widgets perform their tasks and communicate through the event bus as needed.


### The LaxarJS Event Bus

The _event bus_ allows widgets to talk about common topics, without knowing _anything_ about each other (not even a service name, interface or super-class).
Widgets may request actions (such as a navigation or saving the page state), and other widgets might be there to respond to these actions.
Likewise, widgets might provide resources (JSON structures), or await resources to be provided for them.
Because each widget uses its own isolated copy of the relevant resources which is synchronized over the event bus at well defined instances, race conditions are effectively avoided.


### Controls

_Controls_ are (user-defined) HTML elements and attributes.
They can be implemented using standard web technologies, or by relying on an MVC framework such as Angular or React, effectively restricting their use to widgets created in the same technology.
Controls are available to widgets as reusable UI components, and are usually styled using [Bootstrap 3](http://getbootstrap.com/) for interoperability and theme support.

Sometimes, multiple widgets use the same or very similar UI of significant size and/or complexity.
In some cases, the common UI actually represents a standalone use case and should be extracted into a widget.
More often however, the UI part should be reused as a "dumb" control, with widgets providing the application data from the outside.


### Libraries

Widgets may use _libraries_ such as _jQuery_ or _moment.js_ just like in any JavaScript web application.

Since version 2, LaxarJS, provides a development workflow based on [npm](http://npmjs.com/) and [webpack](https://webpack.js.org/) in order to install and load widgets with their asset and library dependencies, but as there are no runtime dependencies to these tools, adapting a different tool chain for use with LaxarJS should not be too hard.

To establish a useful common base vocabulary for use with the event bus, the [LaxarJS Patterns](https://github.com/LaxarJS/laxar-patterns) library is provided.
It contains helpers that make it easy for widgets to talk about user actions, common (REST) resources and Boolean flags.


#### LaxarJS and UI Frameworks

Although intended for web applications, LaxarJS is not a UI (User-Interface) framework.
For non-trivial applications, it should be used together with a dedicated UI framework:
In the past, LaxarJS was integrated with AngularJS v1, making it the framework of choice for the view layer of LaxarJS applications.

Starting with LaxarJS v2, several *adapters* allow to integrate with various UI technologies.
Besides AngularJS v1, there are adapters for Angular v2, React and Vue.
Currently, we particularly like Vue for its simplicity (like React) combined with the ability to use plain old HTML templates (like AngularJS).


## Next Steps

After this quick tour through the building blocks of a LaxarJS application, have a look at the [manuals](manuals/index.md) for in-depth information on individual topics.
