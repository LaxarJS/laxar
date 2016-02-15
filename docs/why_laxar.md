# Why LaxarJS?

It is difficult to build large applications using AngularJS.
Even the creators [tell you](http://briantford.com/blog/huuuuuge-angular-apps) not to do that.
Unfortunately your customer has not read that article and now you are trying to manage twenty controllers on the same page.
We therefore developed LaxarJS as a way to handle this complexity by splitting your application into isolated, manageable components that may be reused in different contexts.
Because LaxarJS allows components to collaborate without prior knowledge of each other by using publish/subscribe, you may think of it as the missing _middleware for the web client_.


## Why is it Difficult to Use AngularJS in Large Applications?

AngularJS already tries to address some of the issues arising with larger applications such as end-to-end testability, encapsulation through directives and controller/view-separation.
Also there already exist [best practices](http://cliffmeyers.com/blog/2013/4/21/code-organization-angularjs-javascript) on the organization of larger applications.
However it is not obvious how to isolate and possibly even reuse larger blocks of functionality as perceived by the application user.
AngularJS offers many ways to _couple_ your components, but only few ways to reliably _decouple_ them:

* binding to shared scope properties harms stability due to side effects
* shared state via services may quickly lead to similar problems
* bindings to directive controllers introduce dependencies to (usually synchronous) APIs
* `$broadcast` and `$emit` improve on the hard dependencies, but still enforce a specific DOM structure and may lead to timing issues during instantiation.

How can we continue to leverage the benefits of AngularJS and offer better decoupling of (large) components?


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
Note that LaxarJS is also not limited to AngularJS: Widgets can be written in pretty much any technology (including React, or plain DOM), but AngularJS is currently supported best.

Individual pages are interrelated through a *flow definition* which tells the runtime how to handle URLs and how to navigate between pages.
Like pages, flows are written in a simple JSON format.


## The Best of Both Worlds

Building upon the thriving ecosystem of Web Standards and (AngularJS) web components, LaxarJS tries to simplify organizing, re-using and even sharing the larger building blocks of your applications.

If this draws your interest, learn more about the LaxarJS [key concepts](concepts.md) or jump in at the deep end by writing your first [LaxarJS](http://github.com/LaxarJS/laxar#getting-started) application.
