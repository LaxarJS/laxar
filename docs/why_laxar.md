# Why LaxarJS?

LaxarJS started out to address problems when trying to create [huge applications](http://briantford.com/blog/huuuuuge-angular-apps) in AngularJS, spanning teams or organizations.
While the situation was somewhat improved with Angular v2 and with components for AngularJS v1, we found that it actually makes a lot of sense to decouple your application components independent from the UI technology that you may be using today.

Using the event bus together with small adapter plugins allows to *bridge into various view technologies* such as Angular, React or Vue. LaxarJS helps you split your application into isolated, manageable components that may be reused in different contexts.
Because LaxarJS allows components to collaborate without prior knowledge of each other by using publish/subscribe, you may think of it as the missing _middleware for the web client_.


## How LaxarJS Addresses the Complexity Issue

At its core, LaxarJS is built around the publish/subscribe-pattern:
It provides an *event bus* that allows components (called *widgets*) to communicate without knowing each other.


### The Event Bus Decouples Widgets

Widgets may *publish* application resources and *subscribe* to changes of those resources without knowing about their mutual state.
For example, in a web shop one widget might represent the shopping cart while another widget resembling the catalog would add articles to the shopping cart by publishing the respective events.
Each of the two widgets has its own view of the *same* shopping cart resource synchronizing state by way of events.
Both widgets would still be able to perform their respective function without the other being on the same page.

After a user interaction, widgets may publish the need for some other widget to take an action, if that is outside of their own responsibility.
Applied to the previous example, a shopping cart widget would provide a *check out* button.
On click of that button, the widget would simply publish a request for action as an event, because it is not responsible for the actual ordering process, which might involve navigation, calling a (RESTful) web service and so on.
A separate component would then *react* to the event and later publish its own event to indicate that the action was performed successfully.

There is no need to decide upfront which widgets talk about the same resources and actions.
Widgets may be developed and tested completely in isolation, *relaxing* the tight constraints and dependencies imposed by traditional programmatic APIs.


### The Runtime Composes Widgets

In the application, widgets are connected to each other in a declarative fashion using JSON *page definitions*.
The *LaxarJS runtime* is responsible for loading and instantiating all widgets configured on the current page and to orchestrate them throughout the page lifecycle.
Additionally, it performs the task of loading static assets such as HTML and CSS.

Individual pages are interrelated through a *flow definition* which tells the runtime how to handle URLs and how to navigate between pages.
Like pages, flows are written in a simple JSON format.


### LaxarJS and Unidirectional Flow

To address the complexity problem from the perspective of view frameworks, people came up with state management patterns such as _flux_ and _redux_.
These patterns are modeled around the concept of a unidirectional flow: *state* (application data) flows "down" from business components (stores) to UI components, forming the only source of truth for rendering.
Actions triggered by the user on the other hand flow "up" from the view to the stores where they trigger state modifications, ultimately leading to another render cycle.

This architecture actually works really well for LaxarJS applications, where activities serve as natural state containers while widgets assume the role of the view components.
The event bus is then used to transport resources (state) from activities to widgets, and actions in the other direction, using standard LaxarJS event patterns.

However, since widgets and activities form isolated silos within your application, you don't have to adopt a flux-style data flow everywhere at once.
Most of the time, these application slices are small enough that any straightforward approach to render a user interface using a modern view framework will work well.


## The Best of Many Worlds

Building upon the thriving ecosystem of web standards and view technologies, LaxarJS tries to simplify organizing, re-using and even sharing the larger building blocks of your applications.

If this draws your interest, learn more about the LaxarJS [key concepts](concepts.md) or jump in at the deep end by writing your first [LaxarJS](http://github.com/LaxarJS/laxar#getting-started) application.
