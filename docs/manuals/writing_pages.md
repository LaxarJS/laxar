[<< return to the manuals](index.md)

Preliminary readings:

* [Creating Layouts](creating_layouts.md)
* [Widgets and Activities](widgets_and_activities.md)

Writing Pages
=============

Pages are written in a declarative fashion using the JSON format. Starting point is a simple object and some specific properties that will be explained in this document.

Layouts and Areas
-----------------

First of all a page should specify the layout which defines the available widget areas and how they are arranged visually when rendered by the web browser. If a page is intended to be used as a base page for inheritance (see chapter [Inheritance](#inheritance) for more information), the layout property should be omitted as for the time being only one page in an extension chain may define a layout.

Configuring the layout is done via the `layout` property of the page object. Its value is the name of the layout which is in turn a relative path to where the specific layout's assets are located (see [Creating Layouts](creating_layouts.md) for further information). If for example the desired layout is located at `popups/layout_one`, the according page (without any widgets yet) would look like this:
```
{
   "layout": "popups/layout_one"
}
```
Now let's assume the html file of `popups/layout_one` looks like this:
```
<div>
   <div ax-widget-area="header"></div>
   <div ax-widget-area="content"></div>
   <div ax-widget-area="footer"></div>
</div>
```
Hence there are three areas available, that can be occupied by widgets on the page. To do so, we add another top-level key `areas` parallel to`layout`. Its value is a map, where each key is the name of a widget area defined in the layout and the values are arrays, that will later receive the widgets. The order of the areas in the map doesn't matter, as the layout decides where each area will later be displayed. Nevertheless it is advised to keep the order, as it simplifies matters. We thus get the following page file:
```
{
   "layout": "popups/layout_one",
   "areas": {
      "header": [],
      "content": [],
      "footer": []
   }
}
```
The arrays can now be filled with the widgets to render within each area. In contrast to the area map order is important here, as this is the order in which the widgets will be rendered in the DOM.

Each entry in the array is an object that can either reference a widget or a [composition](#compositions). It thus needs to specify either `widget` or `composition` as key. Additionally a page wide unique (even over inheritance) `id` property can be provided. This can be useful for debugging and is mandatory in case a widget provides one or more embedded areas (like e.g. the popover widget). The latter case is explained in detail later in [TODO](TODO). Finally it is possible to provide configuration for a widget or a composition under the key `features`.

Our example with some simple exemplary content:
```
{
   "layout": "popups/layout_one",
   "areas": {
      "header": [
         {
            "widget": "portal/headline_widget",
            "features": {
               "headline": {
                  "htmlText": "Welcome!",
                  "level": 3
               }
            }
         }
      ],
      "content": [
         {
            "widget": "portal/command_bar_widget",
            "features": {
               "next": {
                  "enabled": true
               }
            }
         },
         {
            "composition": "popup_composition",
            "features": {
               "openPopup": {
                  "onActions": [ "next" ]
               }
            }
         }
      ],
      "footer": [
         {
            "widget": "portal/html_display_widget",
            "features": {
               "content": {
                  "resource": "footerTextResource"
               }
            }
         }
      ]
   }
}
```

<a name="inheritance"></a>Inheritance
=====================================

The most simple way to reuse parts of a page specification is by inheritance. Due to the intentional lack of complex additional inheritance features it is also the most limited way of specification reuse. Nevertheless it has its valid use cases as in every user interface there are some elements that never change across pages. These should be extracted into a base page which defines no layout and than reused by all other pages defining the layout necessary to display their contents.

Valid candidate widgets for base pages are application headlines, informational notes in a footer area or activities providing common tasks for all pages. Let's apply this to our example from above and extract the HeadlineWidget into a base page called `base_page.json`.

```
{
   "areas": {
      "header": [
         {
            "widget": "portal/headline_widget",
            "features": {
               "headline": {
                  "htmlText": "Welcome!",
                  "level": 3
               }
            }
         }
      ]
   }
}
```

We now can modify our original page using the keyword `extends` that references the base page. The parts already provided by the base page can then be deleted:

```
{
   "layout": "popups/layout_one",
   "extends": "base_page",
   "areas": {
      "content": [
         {
            "widget": "portal/command_bar_widget",
            "features": {
               "next": {
                  "enabled": true
               }
            }
         },
         {
            "composition": "popup_composition",
            "features": {
               "openPopup": {
                  "onActions": [ "next" ]
               }
            }
         }
      ],
      "footer": [
         {
            "widget": "portal/html_display_widget",
            "features": {
               "content": {
                  "resource": "footerTextResource"
               }
            }
         }
      ]
   }
}
```

It is also possible to add widgets to an area, that is already filled with one or more widgets in the base page. Those widgets in the extending page will be appended to the according area and thus appear after the base widgets in the DOM. If a widget should explicitly be added before another widget, this can be achieved using the keyword `insertBeforeId`. Note that for this to work it's necessary to provide an `id` property at the according widget in the base page.

Let's assume we wanted to add another additional headline in one extending page. We therefore change the base page first and add an id to the existing headline:

```
{
   "areas": {
      "header": [
         {
            "widget": "portal/headline_widget",
            "id": "mainHeadline",
            "features": {
               "headline": {
                  "htmlText": "Welcome!",
                  "level": 3
               }
            }
         }
      ]
   }
}
```

The page that has the need to add content thus looks something like this:

```
{
   "layout": "popups/layout_one",
   "extends": "base_page",
   "areas": {
      "header": [
         {
            "widget": "portal/headline_widget",
            "insertBeforeId": "mainHeadline",
            "features": {
                "headline": {
                   "htmlText": "You just won one billion dollar!"
                }
            }
         }
      ],
      "content": [ " ... some widgets ... " ],
      "footer": [ " ... some widgets ... " ]
   }
}
```

That is all inheritance can do for you. Compositions are the way to got for sophisticated reuse of partial specifications. So read on!

<a name="compositions"></a>Compositions
=======================================

In short compositions are a mixture of page and widget definition: They fill areas with widgets, specify which features are configurable and are used within another page (or composition) like a normal widget.