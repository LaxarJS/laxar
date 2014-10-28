[<< return to the manuals](index.md)

Preliminary readings:

* [LaxarJS Core Concepts](concepts.md)
* [Creating Layouts](creating_layouts.md)
* [Widgets and Activities](widgets_and_activities.md)

# Writing Pages

Pages are written in a declarative fashion using the JSON format.
Starting point is a simple object and some specific properties that will be explained in this document.

## <a name="layouts_and_areas"></a>Layouts and Areas

First of all a page should specify the layout which defines the available widget areas and how they are arranged visually when rendered by the web browser.
If a page is intended to be used as a base page for [inheritance](#inheritance), the layout property should be omitted.
This is because only one page in an extension chain may define a layout and this most probably will be one at the bottom of the hierarchy.

Configuring the layout is done via the `layout` property of the page object.
Its value is the name of the layout which is in turn a relative path within the layout folder to where the specific layout's assets are located (see [Creating Layouts](creating_layouts.md) for further information).
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

## <a name="compositions"></a>Compositions

Although inheritance brings a bit of organization into the pages, for bigger applications with many widgets on a page this isn't sufficient.
Very often most of a base page fits for all pages but some small things need to be adjusted for some of the pages that could otherwise be reused throughout the application.
Another use case is to enable the reuse of a bundle of widgets multiple times within one page, each time only with some different configuration.

All of this can be achieved by using compositions.
The idea behind compositions is, that they provide a widget like interface regarding their addition to a page (or another composition) and the internals of a page fragment, bundling some widgets and other compositions.
A composition thus has two basic properties: `areas`, like a page and `features` like a widget.
A third more advanced property, namely `mergedFeatures`, will be explained later.

Instead we'll start with the simple `popup_composition` we referenced above:

```JSON
{
   "features": {
      "$schema": "http://json-schema.org/draft-04/schema#",
      "type": "object",
      "properties": {
         "openPopup": {
            "type": "object",
            "properties": {
               "onActions": {
                  "type": "array",
                  "items": {
                     "type": "string"
                  }
               }
            }
         }
      }
   },
   "areas": {
      ".": [
         {
            "widget": "portal/popup_widget",
            "id": "popup",
            "features": {
               "open": {
                  "onActions": "${features.openPopup.onActions}"
               },
               "close": {
                  "onActions": [ "${topic:closeAction}" ]
               }
            }
         }
      ],
      "popup.content": [
         {
            "widget": "portal/headline_widget",
            "features": {
               "headline": {
                  "htmlText": "Say hi to the popup",
                  "level": 4
               }
            }
         },
         {
            "widget": "portal/command_bar_widget",
            "features": {
               "close": {
                  "enabled": true,
                  "action": "${topic:closeAction}"
               }
            }
         }
      ]
   }
}
```

This example already shows some of the additional characteristics that go beyond the two properties `features` and `areas`.
Let's start from the beginning:

First there is the `features` object, that for simple cases looks just like a feature specification of a widget.
Here you can define all the features that your composition needs to be configurable from the outside.
In this example we simply let the consumer of our composition define the action that will be used to open the popup.

Secondly there is the `areas` map and here there is already something noteworthy: The first area is simply named `.`.
All widgets and compositions within this special area will replace the reference of the composition within the area of the page including the composition.
So if we take the [last example](#example_4) of the chapter [Layouts and Areas](#layouts_and_areas), this will be the area named `content`.

Furthermore the two strings `"${features.openPopup.onActions}"` and `"${topic:closeAction}"` are worth noticing as they demonstrate another main feature of the composition concept.
Those strings are expressions that will be evaluated by the page loader when assembling the complete page from its parts and are replaced by actual values as follows:
The `"${features.openPopup.onActions}"` expression is a reference to a feature defined within the `features` object and will hold the value configured in the page including the composition.
Thus applied to the [same example](#example_4) as mentioned before this will result in the array `[ "next" ]`.
On the other hand the `"${topic:closeAction}"` expression generates a page wide unique event topic compatible string based on the local identifier `closeAction`.
The result could thus be something like `"popupCompositionId0CloseAction"` which in fact is the id generated for the composition plus the local identifier.
These topic expressions should always be used when there is the need to have an identifier that is only used within the scope of a composition to prevent naming collisions with topics of the page, other compositions or multiple usages of this composition within the same page.

Notice that these expressions are only written as a string to be JSON compatible and that no string interpolation takes place.
Thus something like `"myPrefix${topic:closeAction}"`would not be interpreted when assembling the page and simply be used as is.

The assembled page thus looks similar to this:

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
            "widget": "portal/popup_widget",
            "id": "popupCompositionId0Popup",
            "features": {
               "open": {
                  "onActions": [ "next" ]
               },
               "close": {
                  "onActions": [ "popupCompositionId0CloseAction" ]
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
      ],
      "popupCompositionId0Popup.content": [
         {
            "widget": "portal/headline_widget",
            "features": {
               "headline": {
                  "htmlText": "Say hi to the popup",
                  "level": 4
               }
            }
         },
         {
            "widget": "portal/command_bar_widget",
            "features": {
               "close": {
                  "enabled": true,
                  "action": "popupCompositionId0CloseAction"
               }
            }
         }
      ]
   }
}
```
Note how also the id of the exported area was automatically adjusted to `"popupCompositionId0Popup.content"` to prevent naming clashes.

In our example it's currently only possible to close the *PopupWidget* from within itself via an action event published by the *CommandBarWidget*.
What if we additionally would like to close the popup on demand from outside based on another action?
This is where the concept of *merged features* comes into play.
*Merged features* allow us to merge or better concatenate two arrays, where one array is defined as a feature for the composition and the second array is defined in the `mergedFeatures` object.
Syntactically this is achieved via a map under the key `mergedFeatures` where the key of each entry is the path to the array in the features and the value is the array to merge this value with.

This should become clear when looking at our adjusted example:

```JSON
{
   "features": {
      "$schema": "http://json-schema.org/draft-04/schema#",
      "type": "object",
      "properties": {
         "openPopup": {
            "type": "object",
            "properties": {
               "onActions": {
                  "type": "array",
                  "items": {
                     "type": "string"
                  }
               }
            }
         },
         "closePopup": {
            "type": "object",
            "properties": {
               "onActions": {
                  "type": "array",
                  "items": {
                     "type": "string"
                  },
                  "default": []
               }
            }
         }
      }
   },
   "mergedFeatures": {
      "closePopup.onActions": [ "${topic:closeAction}" ]
   },
   "areas": {
      ".": [
         {
            "widget": "portal/popup_widget",
            "id": "popup",
            "features": {
               "open": {
                  "onActions": "${features.openPopup.onActions}"
               },
               "close": {
                  "onActions": "${features.closePopup.onActions}"
               }
            }
         }
      ],
      "popup.content": [
         {
            "widget": "portal/headline_widget",
            "features": {
               "headline": {
                  "htmlText": "Say hi to the popup",
                  "level": 4
               }
            }
         },
         {
            "widget": "portal/command_bar_widget",
            "features": {
               "close": {
                  "enabled": true,
                  "action": "${topic:closeAction}"
               }
            }
         }
      ]
   }
}
```

Here we added the possibility to configured close actions for the *PopupWidget* as feature `closePopup.onActions`.
For this we then added an entry in the `mergedFeatures` map whose value is an array that has the internal generated topic as only item.
This enables us to now reference this feature when configuring the *PopupWidget*.
Instead of creating the array with the generated topic here, we can simply reference the feature directly as it is the case for the `openPopup.onActions` feature.
For the configuration of the *CommandBarWidget* nothing changed.
When using the composition it is now possible to provide additional close actions, but since we defined an empty array as default for the feature, this isn't mandatory.
