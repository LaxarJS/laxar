# Writing Pages

[« return to the manuals](index.md)

Pages are written in a declarative fashion using the JSON format.
They are defined using JSON objects whose properties will be explained in this document.

Preliminary readings:

* [LaxarJS Core Concepts](../concepts.md)
* [Widgets and Activities](widgets_and_activities.md)


## <a name="layouts_and_areas"></a>Layouts and Areas

First of all, a page should specify the _layout_ which defines the available _widget areas_ and how they are arranged visually when rendered by the web browser.
If a page is intended to be used as a base page for [inheritance](#inheritance), the layout property should be omitted, as it is specified by the inheriting pages.
Only one page in an extension chain may define a layout, and deferring this choice to the bottom of the hierarchy increases flexibility.

For each layout, a _descriptor_ containing its canonical name is required:

```js
// application/layouts/popups/layout-one/layout.json
{
   "name": "layout-one"
}
```

Now let us use the following layout HTML:

<a name="example_layout_html"></a>
```html
<!-- application/layouts/popups/layout-one/default.theme/layout-one.html -->
<div>
   <div ax-widget-area="header"></div>
   <div ax-widget-area="content"></div>
   <div ax-widget-area="footer"></div>
</div>
```

This layout defines three _widget areas_ that can be occupied by widgets on the page.

Configuring the layout is done via the `layout` property of the page definition.
Its value is a relative path within the layouts root (usually `application/layouts`).
To fill the available areas, we add another top-level key `areas` parallel to `layout`.
Its value is a map, where each key is the name of a widget area defined in the layout and the values are arrays, that will later contain the widgets to render.
Having not added any layouts so far, we thus get the following page file:

<a name="example_empty_page"></a>
```json
{
   "layout": "popups/layout-one",
   "areas": {
      "header": [],
      "content": [],
      "footer": []
   }
}
```

When adding widgets to an area, their order determines the order in which the widgets will be rendered in the DOM.
Each entry in the array is an object that can either reference a widget or a [composition](#compositions).
It thus needs to specify either `widget` or `composition` as key.
Additionally an `id` property can be provided, which may be useful for debugging and is actually required for widgets providing embedded widget areas such as the  [laxar-details-layer-widget](https://www.npmjs.com/package/laxar-details-layer-widget).
If specifying an ID, make sure that it is unique page-wide (even taking into account inheritance).
Finally it is possible to provide the configuration for features of a widget or a composition under the key `features`.

Here is the example with a few basic widgets

<a name="example_basic_page"></a>
```js
// application/pages/my-page.json
{
   "layout": "popups/layout-one",
   "areas": {
      "header": [
         {
            "widget": "laxar-headline-widget",
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
            "widget": "laxar-command-bar-widget",
            "features": {
               "next": {
                  "enabled": true
               }
            }
         },
         {
            "composition": "popup-composition",
            "features": {
               "openPopup": {
                  "onActions": [ "next" ]
               }
            }
         }
      ],
      "footer": [
         {
            "widget": "laxar-html-display-widget",
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

The object under `features` needs to match the schema of the corresponding widget's `widget.json` descriptor.
Before loading a page and its widgets, LaxarJS will validate the configuration provided in the page against the widget's schema and throw an error in case one or more constraints are violated.
LaxarJS will also fill in defaults specified by the schema.


## <a name="embeddedLayouts"></a>Embedded Layouts

There are use cases where it is not sufficient to reference one single-page layout and place all widgets of a page within that layout.
Sometimes more flexibility is needed.
For example, when trying to reuse existing layouts, it may be necessary to embedded another layout within the area of the top-level page layout.

To support this in a hassle-free manner, layouts are first-class citizens within areas, just like widgets or [compositions](#compositions).

```json
{
   "layout": "popups/layout-one",
   "areas": {
      "content": [
         {
            "layout": "other_layouts/small_columns",
            "id": "embedded"
         },
         {
            "widget": "laxar-command-bar-widget",
            "features": {
               "next": {
                  "enabled": true
               }
            }
         }
      ],
      "embedded.left": [
         {
            "widget": "laxar-html-display-widget",
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

As seen in the example above, the key `layout` should be used instead of `widget`.
Its value is - just like with the main `layout` property of a page - the path of a specific layout directory relative to the layouts-root of the application.
Providing an `id` is obligatory for layouts, as it is needed to reference the widget areas defined by the layout.
Under the assumption that the layout `other_layouts/small_columns` exports a widget area named `left`, we can now insert widgets into it using the area name `embedded.left` for it.

Note that providing `features` to a layout entry does not lead to an error, but is simply ignored.


## <a name="inheritance"></a>Inheritance

In every user interface there are some elements that never change across pages.
The easiest way to reuse these parts of a page definition is by _inheritance._
Common widgets can be extracted into one or more base pages that have no layout.
The base pages can then be _extended_ by concrete pages, defining the layout necessary to display their contents.

Valid candidate widgets to put into base pages are application headlines, informational notes in a footer area or activities that provide common tasks for all pages.
Let us apply this to our example from above and extract the *laxar-headline-widget* into a base page called `base-page.json`.

```json
// // application/pages/base-page.json
{
   "areas": {
      "header": [
         {
            "widget": "laxar-headline-widget",
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

We now can modify our original page using the keyword `extends` that references the base page relatively to the pages-root (usually `application/pages`).
The parts already provided by the base page can then be deleted from the extending page:

```JSON
{
   "layout": "popups/layout-one",
   "extends": "base-page",
   "areas": {
      "content": [
         {
            "widget": "laxar-command-bar-widget",
            "features": {
               "next": {
                  "enabled": true
               }
            }
         },
         {
            "composition": "popup-composition",
            "features": {
               "openPopup": {
                  "onActions": [ "next" ]
               }
            }
         }
      ],
      "footer": [
         {
            "widget": "laxar-html-display-widget",
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

Also, an extending page can add widgets to an area that already contains widgets from the base page.
Widgets added by the extending page will be appended to the corresponding area and thus appear in the DOM after the widgets from the base page.
If a widget of the extending page needs to appear precisely before a specific widget of the base page, this can be achieved using the keyword `insertBeforeId`.
For this to work, it is of course necessary to specify an `id` property for the widget in the base page.

Let us assume that we would like to add another additional headline in one extending page.
We therefore change the base page first and add an ID to the existing headline:

```JSON
{
   "areas": {
      "header": [
         {
            "widget": "laxar-headline-widget",
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

Hence the page that has the need to add content can reference the given ID using `insertBeforeId` like this:

```JSON
{
   "layout": "popups/layout-one",
   "extends": "base-page",
   "areas": {
      "header": [
         {
            "widget": "laxar-headline-widget",
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

Due to the intentional simplicity, inheritance is a somewhat limited way to reuse page definitions.
It might become necessary to split pages into smaller, possibly reusable chunks, which is the task compositions where designed for.
So if the need arises, read on in the manual for [writing compositions](writing_compositions.md).
