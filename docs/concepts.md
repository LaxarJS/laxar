# LaxarJS Concepts

In order to get productive with LaxarJS, a basic understanding of a few core concepts is helpful.


## A LaxarJS Application

To the visitor running a web browser, an _application_ is a set of URLs and associated resources which are run in the browser to provide some information or functionality.
It may access web services or connect to database programs, which are not considered part of the LaxarJS application itself.

From a developer point of view, an application primarily consists of:

  * a set of LaxarJS _widgets_ and _activities_ providing the functionality
  * the _pages_ and _layouts_ assembling these widgets and activities
  * a _flow_ that connects the individual pages
  * one or more _themes_ to define the look and feel of the application.

In order to run the application, there are additional secondary resources:

  * the _LaxarJS Core runtime_ which loads flow and pages, sets up the correct widgets and connects them through an _event bus_
  * _controls_ which are used by the widgets to provide advanced user interface functionality, some of which are provided by _LaxarJS UiKit_
  * _libraries_ used by widgets and activities, such as _moment.js_, _jQuery_, and _LaxarJS patterns_.

The following two sections first explain the primary application components, and than the underlying secondary components.


## Primary Application Parts


### Widgets

A LaxarJS _widget_ is a rectangular part of the browser viewport, which _allows the user to perform some task_.
It is usually represented by several HTML elements, but might in some cases be a single element, for example a `canvas` to provide a painting surface.

The important distinction between a LaxarJS widget and a plain HTML control (such as a `select` box or an `input` field) is that a widget is written with a specific _user-goal_ in mind, whereas a control is general-purpose and its purpose in the application is up to the developer.
For example, while a control might allow a user to input some text (such as a user name, or a password), a widget might combine input controls in a box to allow the same user to _log in_ to the application, and another widget might allow the user to _register_ a new account.
So, both widgets and controls are parts of the user interface, but on different levels of abstraction.

To illustrate this with further examples, possible widgets _with their specific goals_ include:

  * a ToDo list, _to check and plan what is to do_
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

Another way to think of it is that _widgets are made of controls_, and  _controls are HTML elements_ which may be user-defined (for example through AngularJS directives).
The program logic of an individual widget is implemented in JavaScript (as an AngularJS controller) while the presentation is defined as an (AngularJS) HTML template, optionally accompanied by CSS styling information.
Another important property of widgets is that they always can be _loaded and tested in isolation_.
A widget instance may be put onto any page, regardless of what other widgets (even of the same type) might already be there.


### Activities

A LaxarJS _activity_ is a widget without a visual representation, performing a task for the user _behind the scenes_.
For example, a _login widget_ might talk to an authentication service itself, but it might also delegate this task to an _authentication activity_ using the event bus.
When the authentication mechanism changes (e.g. from a plain HTTPS login to OAuth) only the activity needs to be exchanged, while the widget might remain untouched.
In contrast to libraries and regular AngularJS services, Activities participate in the lifecycle of the page and are attached to the event bus, which allows them to communicate with other widgets using publish/subscribe. 

Another possible example would be a web search widget offering a search box with a list of web search results.
Instead of hard-wiring the widget to a specific search engine, one could implement multiple engine-specific activities and choose depending on user preference.
Because the search widget does not know any of the activities (it just _subscribes_ to the search results) one could even define a "proxy" activity to combine results from multiple searches without touching any of the other implementation.

Another way to think of it is that _widgets have to run in the browser, while activities might run in any JavaScript environment_.
In contrast to visual widgets, activities do not have HTML templates nor CSS styles.
To sum it up, widgets support direct user-interaction, while activities always perform tasks behind the scenes, such as talking to (REST) services or coordinating different widgets.


### Pages

A LaxarJS _page_ combines and configures widgets and activities that should be displayed together by embedding them in an HTML skeleton (the layout).
When navigated to, the runtime loads the page and puts the widgets referenced by the page into the associated layout to display them.
The page also defines the publish/subscribe topics that the widget instance use to communicate resource state and user actions. 

An individual widget is still somewhat generic in that it allows to perform a specific task _in any context_.
For example, a social buttons bar might allow to share _any content_, and the specific list of social sites to share on might be _configurable_.
The page establishes this context, for example _by placing_ the social buttons below the article (rendered from markdown by another widget), and _by configuring_ that twitter and tumblr should be offered, but not LinkedIn.
This does not mean that all widgets must be broadly reusable: a widget to manage the inventory in a video game would probably not be useful anywhere else.
But it means that reuse is supported for those widgets where it makes sense.

While widgets and activities are implemented in JavaScript and HTML, pages are written using JSON in a declarative fashion.
This reflects on the fact that pages do not contain application logic, but merely assemble and configure a set of widgets.


### Layouts

Layouts are skeleton HTML documents, which contain placeholders (_widget areas_) within which widget instances can be placed.
Each page specifies a layout that the LaxarJS runtime should use for it.
A layout can contain all the scaffolding markup of your application (such as copyright footers and navigation), but you may also choose to implement these areas as widgets to allow for re-use and configuration.

For each _widget areas_, the layout defines a width in grid columns, and widgets within these areas may not exceed their available number of columns.
The LaxarJS UiKit ships with _Bootstrap_ to implement the grid layout in CSS.
Like widgets, layouts are accompanied by CSS styles, for example to define a background color.

You might think of layouts as the opposite of activities: While activities are just widgets without a user interface, layouts are similar to widgets without the logic part – just HTML templates and CSS.


### The Flow

The flow defines _URL patterns_ that may be used to navigate to the pages of an application, and _relations between pages_.
It is comparable to the routing mechanisms found in many MVC web frameworks.
Also, it defines semantic relations between pages, such as what is considered the _next_ page for a given page in the application.


### Themes

Widgets and their controls may be styled using CSS.
For widgets with a broad applicability (such as a calendar, or a route planner) it can be very useful to adapt the visual appearance to various circumstances.
This is achieved by overriding parts of the vanilla bootstrap CSS classes (shipping with LaxarJS UiKit) with user defined CSS styles.
A theme may specify styles for any control and for any widget that it wants to modify.
Where nothing else is specified, plain bootstrap is used.

The LaxarJS UiKit is based on Compass/SCSS to simplify the generation of user defined themes, but any way to generate Bootstrap-like CSS styles would be a valid way to create a theme.


## Secondary Application Parts – Under the Hood

### The LaxarJS Runtime

The _runtime_ handles URL routing and loads the template associated with the current page definition.
It instantiates all required widgets and activities, and tells them when everyone else is ready to receive their publish/subscribe-events.
It also loads the corresponding templates and CSS files, or provides these assets from an optimized bundle in production.


### The LaxarJS Event Bus

The _event bus_ allows widgets to talk about common topics, without knowing _anything_ about each other (not even a service name, interface or super-class).
Widgets may request actions (such as a navigation or saving the page state), and other widgets might be there to respond to these actions.
Likewise, widgets might provide resources (JSON structures), or expect resources to be provided for them.
Because each widget uses its own isolated copy of the relevant resources which is synchronized over the event bus at well defined instances, race conditions are effectively avoided.


## Controls

_Controls_ are (user-defined) HTML elements and attributes, integrated as AngularJS directives.
They are available to widgets as reusable UI components, and are styled using [Bootstrap 3.2](http://getbootstrap.com/) for interoperability and theme support.
A useful set of controls to get started is provided by the [Angular UI Bootstrap](http://angular-ui.github.io/bootstrap/) project.


## Libraries

Widgets may use _libraries_ such as _jQuery_ or _moment.js_ just like in any JavaScript web application.
LaxarJS currently provides a development workflow based on [grunt](http://gruntjs.com/), [bower](http://bower.io/), and [RequireJS](http://requirejs.org/) in order to install and load widgets with their assets as well as libraries, but other tool-chains are not out of the question.

To establish a useful common base vocabulary for the LaxarJS event bus, the [LaxarJS Patterns](https://github.com/LaxarJS/laxar_patterns) library is provided.
It contains helpers that make it very easy for widgets to talk about user actions, common (REST) resources and boolean flags.
