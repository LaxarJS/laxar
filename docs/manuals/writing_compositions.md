# Writing Compositions

[« return to the manuals](index.md)

Although inheritance brings a bit of organization into pages, for bigger applications with many widgets on a page this may not be sufficient. *Compositions* are here to help you.

Preliminary readings:

* [LaxarJS Core Concepts](../concepts.md)
* [Writing Pages](writing_pages.md)


## When to Use Compositions

Often, a base page *almost works* for all extending pages but some small things need to be adjusted per page, in order to be reused throughout the application.
Another scenario is reusing a set of widgets multiple times on a single page, each time with slightly different configuration.


## Composition Basics

All of this can be achieved by using compositions.
The idea behind compositions is that they combine a *widget-like interface* on the outside with the internals of a *page definition*.
The widget-like interface, including a feature configuration schema, allows compositions to be embedded and parameterized by regular pages, or even by other compositions.
The page-like internal structure allows compositions to bundle and pre-configure several widgets and even other compositions.
A composition definition thus has two basic properties: `features` (like a widget) and `areas` (like a page).
A third more advanced property, namely `mergedFeatures`, will be explained later.

Let us start with a simple `popup_composition`:

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
            "widget": "laxar-popup-widget",
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
            "widget": "laxar-headline-widget",
            "features": {
               "headline": {
                  "i18nHtmlText": "Say hi to the popup",
                  "level": 4
               }
            }
         },
         {
            "widget": "laxar-command-bar-widget",
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

The syntax of the example should be familiar to authors of widgets and pages, but also exhibits some composition-specific characteristics.
If you do not know the `axRole` and `format` meta data keywords, you may ignore them, as they are not related to the compositions feature, but only used by development tools.


### Composition Features

First there is the `features` object that looks just like a features specification from a widget descriptor.
Here you can define all the features that your composition needs to be configurable by the embedding page.
In this example we simply let the consumer of our composition define the action that will be used to open the popup.


### Composition Expansion

Secondly there is the `areas` map and here there is already something noteworthy: The first area is simply named `.`.
All widgets and compositions within this special area will be _expanded in place of each composition instance_, within all pages embedding the composition.
So if we apply the composition above to the [example](#example_4) previously used in the [manual on pages](./writing_pages.md), the second item in the area named `content` will be expanded to a configured instance of the laxar-popup-widget.

Other non-prefixed areas (say, `"footer"`) are simply added to each embedding page, concatenating widget lists where page and composition define areas of the same name.


### Feature References and Topic Expressions

The two strings `"${features.openPopup.onActions}"` and `"${topic:closeAction}"` demonstrate two important features of the composition concept.
Those strings are expressions, and evaluated by the laxar-loader at build-time, while assembling the complete page from its parts.
They are replaced with actual values as follows:

The `"${features.openPopup.onActions}"` expression is a _reference to a feature_ defined within the `features` object and will be replaced with the value configured by the embedding page.
Applied to the [example](#example_4), this reference will be replaced with the array value `[ "next" ]`.

On the other hand the `"${topic:closeAction}"` expression generates a _page-wide unique event topic_, a string based on the local identifier `closeAction`.
The result could be something like `"popupComposition-id0+closeAction"`, which is in fact the ID generated for the composition itself, plus the local identifier.

These *topic expressions* prevent naming collisions with topics of the embedding page, other compositions or multiple instances of the same composition within the same page.
They should always be used when there is the need to have a topic identifier that is only used within the scope of a composition.
In fact, it is considered a best practice for compositions to _only use_ either feature references or topic expressions for event topics, to avoid unintended effects and invisible side-channels on the event-bus, caused by sharing regular string topics with the embedding page, or with other compositions.

Notice that these expressions must be written inside of string literals to be valid JSON.
Their replacement takes place only _after_ the JSON structure was evaluated by the laxar-loader, and always based on the full string.
Thus something like `"myPrefix${topic:closeAction}"` would *not* be expanded when assembling the page and simply be used as is, probably violating some widget schema.

The assembled page thus looks similar to this:

```JSON
{
   "layout": "popups/layout_one",
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
            "widget": "laxar-popup-widget",
            "id": "popupComposition-id0-popup",
            "features": {
               "open": {
                  "onActions": [ "next" ]
               },
               "close": {
                  "onActions": [ "popupComposition-id0+closeAction" ]
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
      ],
      "popupComposition-id0-popup.content": [
         {
            "widget": "laxar-headline-widget",
            "features": {
               "headline": {
                  "i18nHtmlText": "Say hi to the popup",
                  "level": 4
               }
            }
         },
         {
            "widget": "laxar-command-bar-widget",
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


### Merged Features

In our example it is currently only possible to close the *laxar-popup-widget* from within itself via an action event published by the *laxar-command-bar-widget*.
What if we additionally would like to close the popup using another action _from outside_?
This is where the concept of *merged features* comes into play.
Merged features allow us to concatenate feature values from two arrays, where one array is defined as a feature for the composition and the second array is defined in the `mergedFeatures` object.
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
            "widget": "laxar-popup-widget",
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
            "widget": "laxar-headline-widget",
            "features": {
               "headline": {
                  "i18nHtmlText": "Say hi to the popup",
                  "level": 4
               }
            }
         },
         {
            "widget": "laxar-command-bar-widget",
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
