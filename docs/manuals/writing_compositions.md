# Writing Compositions

[« return to the manuals](index.md)

Although inheritance brings a bit of organization into pages, for bigger applications with many widgets on a page this may  not be sufficient. *Compositions* are here to help you.

Preliminary readings:

* [LaxarJS Core Concepts](../concepts.md)
* [Writing Pages](writing_pages.md)

Very often most of a base page fits for all pages but some small things need to be adjusted for some of the pages that could otherwise be reused throughout the application.
Another use case is to enable the reuse of a bundle of widgets multiple times within one page, each time only with some different configuration.

All of this can be achieved by using compositions.
The idea behind compositions is, that they provide a widget like interface regarding their addition to a page (or another composition) and the internals of a page fragment, bundling some widgets and other compositions.
A composition thus has two basic properties: `areas`, like a page and `features` like a widget.
A third more advanced property, namely `mergedFeatures`, will be explained later.

Instead we will start with the simple `popup_composition` we referenced above:

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
                     "type": "string",
                     "format": "topic",
                     "axRole": "inlet"
                  }
               }
            }
         }
      }
   },
   "areas": {
      ".": [
         {
            "widget": "amd:laxar-popup-widget",
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
            "widget": "amd:laxar-headline-widget",
            "features": {
               "headline": {
                  "i18nHtmlText": "Say hi to the popup",
                  "level": 4
               }
            }
         },
         {
            "widget": "amd:laxar-command-bar-widget",
            "features": {
               "close": {
                  "finish": true,
                  "action": "${topic:closeAction}"
               }
            }
         }
      ]
   }
}
```

This example already shows some of the additional characteristics that go beyond the two properties `features` and `areas`.
Let us start from the beginning:

First there is the `features` object, that for simple cases looks just like a feature specification of a widget.
Here you can define all the features that your composition needs to be configurable from the outside.
In this example we simply let the consumer of our composition define the action that will be used to open the popup.

Secondly there is the `areas` map and here there is already something noteworthy: The first area is simply named `.`.
All widgets and compositions within this special area will replace the reference of the composition within the area of the page including the composition.
So if we take the [last example](#example_4) of the chapter [Layouts and Areas](#layouts_and_areas), this will be the area named `content`.

Furthermore the two strings `"${features.openPopup.onActions}"` and `"${topic:closeAction}"` are worth noticing as they demonstrate another main feature of the composition concept.
Those strings are expressions that will be evaluated by the page loader when assembling the complete page from its parts and are replaced by actual values as follows:
The `"${features.openPopup.onActions}"` expression is a reference to a feature defined within the `features` object and will hold the value configured in the page including the composition.
Thus applied to the [example of the writing pages manual](#example_4), this will result in the array `[ "next" ]`.
On the other hand the `"${topic:closeAction}"` expression generates a page wide unique event topic compatible string based on the local identifier `closeAction`.
The result could thus be something like `"popupComposition-id0+closeAction"`, which is in fact the id generated for the composition itself, plus the local identifier.
These *topic expressions* prevent naming collisions with topics of the page, other compositions or multiple usages of the same composition within the same page.
They should always be used when there is the need to have an identifier that is only used within the scope of a composition.

Notice that these expressions are only written as a string to be JSON compatible and that no string interpolation takes place.
Thus something like `"myPrefix${topic:closeAction}"` would *not* be interpreted when assembling the page and simply be used as is.

The assembled page thus looks similar to this:

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
            "widget": "amd:laxar-popup-widget",
            "id": "popupComposition-id0-popup",
            "features": {
               "open": {
                  "onActions": [ "next" ]
               },
               "close": {
                  "onActions": [ "popupComposition-id0+CloseAction" ]
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
      ],
      "popupComposition-id0-popup.content": [
         {
            "widget": "amd:laxar-headline-widget",
            "features": {
               "headline": {
                  "i18nHtmlText": "Say hi to the popup",
                  "level": 4
               }
            }
         },
         {
            "widget": "amd:laxar-command-bar-widget",
            "features": {
               "close": {
                  "enabled": true,
                  "action": "popupComposition-id0+CloseAction"
               }
            }
         }
      ]
   }
}
```
Note how also the id of the exported area was automatically adjusted to `"popupComposition-id0-popup.content"` to prevent naming clashes.

In our example it is currently only possible to close the *laxar-popup-widget* from within itself via an action event published by the *laxar-command-bar-widget*.
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
                     "type": "string",
                     "format": "topic",
                     "axRole": "inlet"
                  }
               }
            }
         },
         "closePopup": {
            "type": "object",
            "properties": {
               "onActions": {
                  "type": "array",
                  "default": [],
                  "items": {
                     "type": "string",
                     "format": "topic",
                     "axRole": "inlet"
                  }
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
            "widget": "amd:laxar-popup-widget",
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
            "widget": "amd:laxar-headline-widget",
            "features": {
               "headline": {
                  "i18nHtmlText": "Say hi to the popup",
                  "level": 4
               }
            }
         },
         {
            "widget": "amd:laxar-command-bar-widget",
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

Here we added the possibility to configured close actions for the *laxar-popup-widget* as feature `closePopup.onActions`.
For this we then added an entry in the `mergedFeatures` map whose value is an array that has the internal generated topic as only item.
This enables us to now reference this feature when configuring the *laxar-popup-widget*.
Instead of creating the array with the generated topic here, we can simply reference the feature directly as it is the case for the `openPopup.onActions` feature.
For the configuration of the *laxar-command-bar-widget* nothing changed.
When using the composition it is now possible to provide additional close actions, but since we defined an empty array as default for the feature, this is not mandatory.

# Appendix:

## Exemplary page from [writing pages](writing_pages.md) manual

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
            "widget": "amd:laxar-html-display-bar-widget",
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
