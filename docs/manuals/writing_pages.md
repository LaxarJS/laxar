[« return to the manuals](index.md)

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
If for example the desired layout is located at `popups/layout_one`, the corresponding page (without any widgets so far) would look like this:

<a name="example_1"></a>
```JSON
{
   "layout": "popups/layout_one"
}
```

Now let us assume the HTML file of `popups/layout_one` looks like this:

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
This can be useful for debugging and is mandatory in case a widget provides one or more embedded areas, such as those created by the [laxar-popup-widget](https://github.com/LaxarJS/ax-popup-widget).
Finally it is possible to provide the configuration for features of a widget or a composition under the key `features`.

Here is the example with some simple, exemplary content:

<a name="example_4"></a>
```JSON
{
   "layout": "popups/layout_one",
   "areas": {
      "header": [
         {
            "widget": "amd:laxar-headline-widget",
            "features": {
               "headline": {
                  "i18nHtmlText": "Welcome!",
                  "level": 3
               }
            }
         }
      ],
      "content": [
         {
            "widget": "amd:laxar-command-bar-widget",
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
            "widget": "amd:laxar-html-display-widget",
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


## <a name="embeddedLayouts"></a>Embedded Layouts

There are use cases where it is not sufficient to reference one single page layout and place all widgets of a page within that layout, but where more flexibility is needed.
Especially when trying to reuse existing layouts, it may be necessary to embedded another layout within the area of a global page layout.

To support this hassle-free, layouts are first-class citizens just as widgets or [compositions](#compositions) within areas.

```JSON
{
   "layout": "popups/layout_one",
   "areas": {
      "content": [
         {
            "layout": "other_layouts/small_columns",
            "id": "embedded"
         },
         {
            "widget": "amd:laxar-command-bar-widget",
            "features": {
               "next": {
                  "enabled": true
               }
            }
         }
      ],
      "embedded.left": [
         {
            "widget": "amd:laxar-html-display-widget",
            "features": {
               "content": {
                  "resource": "someResource"
               }
            }
         }
      ]
   }
}
```

As seen in the example from above simply the key `layout` should be used instead of `widget`.
Its value is - just like the main `layout` property of a page - the path of a specific layout directory within the layout folder of the application.
Providing an `id` is obligatory since otherwise it would be impossible to reference a widget area defined within the layout.
Under the assumption that the layout `other_layouts/small_columns` exports a widget area named `left`, we can now insert widgets into it using the area name `embedded.left` for it.

Note that providing `features` to a layout entry does not lead to an error, but simply is ignored.

## <a name="inheritance"></a>Inheritance

The most simple way to reuse parts of a page specification is by inheritance.
Due to the intentional lack of complex additional inheritance features it is also the most limited way of specification reuse.
Nevertheless it has its valid use cases as in every user interface there are some elements that never change across pages.
These should be extracted into one or more base pages, that define no layout and can be reused by all other pages defining the layout necessary to display their contents.

Valid candidate widgets for base pages are application headlines, informational notes in a footer area or activities providing common tasks for all pages.
Let us apply this to our example from above and extract the *laxar-headline-widget* into a base page called `base_page.json`.

```JSON
{
   "areas": {
      "header": [
         {
            "widget": "amd:laxar-headline-widget",
            "features": {
               "headline": {
                  "i18nHtmlText": "Welcome!",
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
            "widget": "amd:laxar-command-bar-widget",
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
            "widget": "amd:laxar-html-display-widget",
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

It is also possible to add widgets to an area, that is already filled with one or more widgets in the base page.
Those widgets in the extending page will be appended to the according area and thus appear after the base widgets in the DOM.
If a widget of the extending page should explicitly be added before another widget of a base page, this can be achieved using the keyword `insertBeforeId`.
Note that for this to work it's necessary to provide an `id` property for the according widget in the base page.

Let us assume we wanted to add another additional headline in one extending page.
We therefore change the base page first and add an id to the existing headline:

```JSON
{
   "areas": {
      "header": [
         {
            "widget": "amd:laxar-headline-widget",
            "id": "mainHeadline",
            "features": {
               "headline": {
                  "i18nHtmlText": "Welcome!",
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
            "widget": "amd:laxar-headline-widget",
            "insertBeforeId": "mainHeadline",
            "features": {
                "headline": {
                   "i18nHtmlText": "You just won one billion dollar!"
                }
            }
         }
      ],
      "content": [ " ... some widgets ... " ],
      "footer": [ " ... some widgets ... " ]
   }
}
```

This is all one needs to build basic pages for LaxarJS.
It might become necessary to split pages into smaller, possibly reusable chunks, which is the task compositions where designed for.
So if the need arises, read on in the manual for [writing compositions](writing_compositions.md).
