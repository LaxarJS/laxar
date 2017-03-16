# Manuals

Before starting with the manuals, make sure that you know [what LaxarJS is about](../why_laxar.md), and that you are familiar with the [core concepts](../concepts.md).
If you're already developing your first widgets and want to know which programmatic APIs are provided by LaxarJS, have a look at the [API docs](../api).


## Basic Manuals

* [Widgets and Activities](widgets_and_activities.md)

   Learn about the central building blocks of a LaxarJS application, and the basics on _integration technologies_.

* [Writing Pages](writing_pages.md)

   A step-by-step introduction to writing layouts and pages for a LaxarJS application.

* [Installing Third Party Widgets](installing_widgets.md)

   Learn how to integrate and leverage existing widgets and activities.

* [Flow and Places](flow_and_places.md)

   Creating a flow through the pages and make the addressable as places.

* [Widget Services](widget_service.md)

   Services that are offered as injections to all widgets regardless of their technology.

* [Events](events.md)

   How to communicate between widgets using topics on the event bus.

* [Creating Themes](creating_themes.md)

   How to create a custom, pluggable style for your widgets and applications.

* [Providing Controls](providing_controls.md)

   How to create reusable, interactive elements that support themes.

* [Infrastructure and Tools](infrastructure_and_tools.md)

   What happens when a LaxarJS application starts, and how its assets are prepared.


## Advanced Manuals

* [Asset Lookup and the Artifacts Bundle](asset_lookup.md)

   How CSS, HTML and other static assets are resolved and loaded.

* [Writing Compositions](writing_compositions.md)

   When simple pages are not enough.

* [Configuring RequireJS for widgets and controls](configuring_requirejs.md)

   How to configure RequireJS for widgets and controls with extraordinary needs.

* [Configuration](configuration.md)

   Documents the LaxarJS configuration API which can be used to configure widgets, and the built-in configuration options.

* [Internationalization (i18n)](i18n.md)

   Explains how to leverage the LaxarJS event bus and APIs when writing internationalized applications.

* [Visibility Events](visibility_events.md)

   Introduces visibility events for improving performance by allowing widgets to determine if they are visible to the user or if they currently reside in the background.

* [Creating an Adapter for a new Widget Technology](adapters.md)

   Tired of writing widgets in AngularJS? Learn how to adapt any MVC technology for creating LaxarJS widgets.
