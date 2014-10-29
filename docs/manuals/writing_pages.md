[<< return to the manuals](index.md)

Preliminary readings:

* [LaxarJS Core Concepts](../concepts.md)
* [Widgets and Activities](widgets_and_activities.md)


# Writing Pages

Pages are written in a declarative fashion using the JSON format.
Starting point is a simple object and some specific properties that will be explained in this document.


## <a name="layouts_and_areas"></a>Layouts and Areas

First of all a page should specify the layout which defines the available widget areas and how they are arranged visually when rendered by the web browser.
If a page is intended to be used as a base page for [inheritance](#inheritance), the layout property should be omitted.
This is because only one page in an extension chain may define a layout and this most probably will be one at the bottom of the hierarchy.

Configuring the layout is done via the `layout` property of the page object.
Its value is the name of the layout which is in turn a relative path within the layout folder to where the specific layout's assets are located.
If for example the desired layout is located at `popups/layout_one`, the according page (without any widgets yet) would look like this:

<a name="example_1"></a>
```JSON
{
   "layout": "popups/layout_one"
}
```

Now let's assume the html file of `popups/layout_one` looks like this:

<a name="example_2"></a>
```HTML
<div>
   <div ax-widget-area="header"></div>
   <div ax-widget-area="content"></div>
   <div ax-widget-area="footer"></div>
</div>
```

Obviously there are three areas available, that can be occupied by widgets on the page.
To do so, we add another top-level key `areas` parallel to`layout`.
Its value is a map, where each key is the name of a widget area defined in the layout and the values are arrays, that will later list the widgets to render.
Without any widgets yet, We thus get the following page file:

<a name="example_3"></a>
```JSON
{
   "layout": "popups/layout_one",
   "areas": {
      "header": [],
      "content": [],
      "footer": []
   }
}
```

When adding widgets to an area, the order is important, as this is the order in which the widgets will be rendered in the DOM.
Each entry in the array is an object that can either reference a widget or a [composition](#compositions).
It thus needs to specify either `widget` or `composition` as key.
Additionally a page wide unique (even over inheritance) `id` property can be provided.
This can be useful for debugging and is mandatory in case a widget provides one or more embedded areas (like e.g. a popover widget), which is explained in detail in [TODO](TODO).
Finally it is possible to provide the configuration for features of a widget or a composition under the key `features`.

Here is the example with some simple, exemplary content:

<a name="example_4"></a>
```JSON
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

The object under `features` needs to satisfy the schema defined for the features of the according widget in the file `widget.json`.
When loading a page and its widgets, LaxarJS will actually validate the configuration provided in the page against the widget's schema and throw an error in case one or more constraints are violated.


## <a name="inheritance"></a>Inheritance

The most simple way to reuse parts of a page specification is by inheritance.
Due to the intentional lack of complex additional inheritance features it is also the most limited way of specification reuse.
Nevertheless it has its valid use cases as in every user interface there are some elements that never change across pages.
These should be extracted into one or more base pages, that define no layout and can be reused by all other pages defining the layout necessary to display their contents.

Valid candidate widgets for base pages are application headlines, informational notes in a footer area or activities providing common tasks for all pages.
Let's apply this to our example from above and extract the *HeadlineWidget* into a base page called `base_page.json`.

```JSON
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

We now can modify our original page using the keyword `extends` that references the base page relatively to the root path for all pages.
The parts already provided by the base page can then be deleted:

```JSON
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

It's also possible to add widgets to an area, that is already filled with one or more widgets in the base page.
Those widgets in the extending page will be appended to the according area and thus appear after the base widgets in the DOM.
If a widget of the extending page should explicitly be added before another widget of a base page, this can be achieved using the keyword `insertBeforeId`.
Note that for this to work it's necessary to provide an `id` property for the according widget in the base page.

Let's assume we wanted to add another additional headline in one extending page.
We therefore change the base page first and add an id to the existing headline:

```JSON
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

Hence the page that has the need to add content can reference the given id using `insertBeforeId` like this:

```JSON
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

This is all one needs to know to build basic pages for LaxarJS.
It might become necessary to split pages into smaller, possibly reusable chunks, which is the task compositions where designed for.
So if the need arises, read on in the manual for [writing compositions](writing_compositions.md).
