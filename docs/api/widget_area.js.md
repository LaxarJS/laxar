
# axWidgetArea

A module for the `axWidgetArea` directive.

## Contents

**AngularJS Directives**
- [axWidgetArea](#axWidgetArea)

## AngularJS Directives
### <a name="axWidgetArea"></a>axWidgetArea
The *axWidgetArea* directive is used to mark DOM elements as possible containers for widgets. They're
most commonly used in layouts using static names. These areas can then be referenced from within page
definitions in order to add widgets to them. Additionally it is possible that widgets expose widget
areas themselves. In that case the name given within the widget template is prefixed with the id of the
widget instance, separated by a dot. If, within a widget, a name is dynamic (i.e. can be configured via
feature configuration), the corresponding `ax-widget-area-binding` attribute can be set to bind a name.

Example:
```html
<div ax-widget-area="myArea"><!-- Here will be widgets --></div>
```

Example with binding:
```html
<div ax-widget-area
     ax-widget-area-binding="features.content.areaName">
   <!-- Here will be widgets -->
</div>
```
