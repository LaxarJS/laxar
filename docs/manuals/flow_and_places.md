# Flow and Places

[« return to the manuals](index.md)

Every application consisting of more than one page needs a concept for navigating between these pages.
In LaxarJS this is achieved by a *flow* defining a set of *places* in a declarative fashion.

Preliminary readings:

* [LaxarJS Core Concepts](../concepts.md)
* [Configuration](configuration.md)
* [Writing Pages](writing_pages.md)

Each place corresponds to a single page that should be rendered, or some other content displayed to the user.
Currently the definition of one single flow file is possible, which can by default be found within the application at the path `application/flow/flow.json`.
This can be adjusted as `laxar-path-flow` in the *require configuration* of your application.


Let us start with an example for a simple `flow.json` file:

```JSON
{
   "places": {
      "entry": {
         "redirectTo": "pageOne"
      },

      "pageOne/:userId": {
         "page": "first_page"
      }
   }
}
```

A flow definition is always a JSON object having the root property `places`, which in turn is a map.
Each entry of that map consists of the place's URL template as key and a definition of what should happen when reaching that place as value.
For LaxarJS an URL template always starts with a constant prefix, possibly consisting of multiple segments separated by slashes, containing optional *parameters*.
The syntax is taken from AngularJS, where variable parts of a URL are always prefixed by a colon.
Within the flow, the constant prefix of a place is interpreted as its *identifier*.
Thus the second place in the example has the identifier *pageOne* and one parameter, called *userId*.

The identifier *entry* of the first place is always interpreted as the default place to navigate to if either no place was provided or if the requested place was not found within the flow.
Most commonly it will just redirect to another existing place, that for example handles user login or application startup.
Just as in plain AngularJS, routing a redirect is configured using the `redirectTo` keyword and naming the place identifier to navigate to.
In this example we simply navigate without providing a value for the *userId* parameter to the place *pageOne*.
Any place that simply redirects to another place cannot do any meaningful in addition to that.
Control is directly passed on to the redirection target.

In contrast to that, the place *pageOne* specifies a page that should be loaded by using the key `page` in its definition.
By default all pages are searched in the `application/pages/` directory with the `.json` suffix automatically appended when omitted.
Just like the path to the flow file, this can also be reconfigured in the *require configuration* of your application as `laxar-path-pages`.
So whenever this place is visited, the according page with all of its configured widgets is loaded and displayed.

## Places

As said before the syntax for places is based on the URL template syntax from AngularJS and in fact AngularJS' routing is used internally.
Within the flow, those URL templates have some additional meaning as they are being used as an identifier for places.
Thus a few strict rules are added to the basic AngularJS URL template rules:

* A URL always consists of one or more segments separated by slashes `/`.
* Each segment can either be a constant alphanumeric character string or a parameter, which is an alphanumeric character string prefixed by colon.
* A URL always starts with a unique non empty list of constant segments, which can optionally be followed by a list of parameters.
Parameters and constant segments may not appear interleaved.
* Wildcards are not supported

Examples of valid places thus are the following:
* `userListing`
* `user/:userId`
* `cars/vans/:manufacturer/:model`

In contrast these places would all be considered invalid:
* `:userId`: A place *must* start with a non-empty constant segment
* `user/:userId/car`: As soon as there is a parameter, no more constant segments may appear
* `user/:names*` or `user/:names?`: Wildcards are *not* supported

These rules may seem very restrictive but they enable LaxarJS to make some assumptions and optimizations based on the URL template.
Additionally a URL should not encode too much sensitive information directly, as this might lead to security issues and bulky URLs.
Instead only some domain information should be passed on between pages, that enables the widgets of the next place to fulfill their specific tasks.


## Targets

Navigation is triggered from within a widget by issuing a *navigateRequest* event expressing the desired next location within the application and providing values for place parameters.
How that works in practice can be read in the separate manual covering [events](events.md).
Using these events it is possible to always navigate directly from place to place.
Nevertheless this would instantly lead to a tight coupling between the widget triggering navigation events and the definition of places within the flow.
Instead a widget or a page (by means of the feature configuration for a widget) should only know about semantic navigation targets reachable from their current location (roughly comparable to *relations* in [REST](http://en.wikipedia.org/wiki/Representational_state_transfer)).

In LaxarJS this is achieved by the concept of *targets*:
Each place can define a mapping from semantic target identifier valid only for this place to the identifier of another place within the flow.

An example (for brevity the `entry` place is omitted):

```JSON
{
   "places": {
      "introduction/:userId": {
         "page": "introduction",
         "targets": {
            "next": "interests"
         }
      },

      "interests/:userId": {
         "page": "interests",
         "targets": {
            "previous": "introduction",
            "next": "profession",
            "help": "professionHelp"
         }
      },

      "profession/:userId": {
         "page": "profession",
         "targets": {
            "previous": "interests",
            "help": "professionHelp"
         }
      },

      "interestsHelp/:userId": {
         "page": "interests_help",
         "targets": {
            "back": "interests"
         }
      },

      "professionHelp/:userId": {
         "page": "profession_help",
         "targets": {
            "back": "profession"
         }
      }
   }
}
```

This flow is typical for a wizard-like application, as it allows a forward and backward navigation, but only sparsely jumping in between pages.
The first place in the example is called *introduction*, which simply displays a page and just lets the user navigate to the *next* target, which would be resolved to the place *interests*.
Here a page is displayed where the user can input his interests, e.g. his hobbies or music taste.
As we are in the middle of a wizard, there is a *previous* target reachable now in addition to the *next* and *help* targets.
Unsurprisingly the *previous* target references the place *introduction* again.
The *next* target instead leads us to another new place with identifier *profession*.
The *profession* place may only lead us back to the *interests* place via the *previous* target.

May be some pages have some tricky input components or there are some advices for which things to share.
This is where the *help* targets come into play.
Both, the *interests* and the *profession* page, have such a target.
Nevertheless the places behind these targets are different depending on the source page.
This makes understanding of navigation concepts simple and provides contextual semantics.
Returning from the help pages works in a similar way via the *back* targets leading to the respective places.


## Entry Points

The previous sections covered the concepts of navigation within the scope of one LaxarJS application.
Additionally it is also often necessary to integrate a use case implemented as a LaxarJS application within the context of another external application.
For example the process of collecting data on interests and profession could be part of a larger application creating a personal profile of a person.
The host application might have been be implemented in a totally different technology, like [Ruby on Rails](http://rubyonrails.org/) or [JSP](http://en.wikipedia.org/wiki/JavaServer_Pages).
There should be some way for this application to give control to the LaxarJS application and pass in some parameters.

This is achieved by the concept of *entry points*.
Entry points define possible ways for how to enter an application and which place to navigate to once this entry point is selected.
Let us add entry points to our example:

```JSON
{
   "places": {

      "entry": {
         "entryPoints": {
            "enterInterests": "interests",
            "enterProfession": "profession"
         }
      },

      "introduction/:userId": {
         ...
      },

      "interests/:userId": {
         ...
      },

      "profession/:userId": {
         ...
      },

      ...
   }
}
```

Apart from the key `entryPoints` this is very similar to the definition of targets within the `flow.json`.
The difference mainly comes from their usage when passing control from the external application to this application:
An entry point is selected by configuring it in the global `window.laxar` [configuration object](configuration.md) as `window.laxar.flow.entryPoint` property.
This property is an object with key `target` denoting the name of the entry point to select and an optional map under the `parameters` with the values for the possible place parameters.

So let us assume a JSP renders the bootstrapping code for the LaxarJS application, selects the `enterInterests` entry point and passes the user ID to the JavaScript frontend:

```html
<!DOCTYPE html>
<html>
   <head><!-- contents omitted --></head>
   <body>
      <div data-ng-view style="display: none"></div>
      <div data-ax-page></div>

      <script src="application/application.js"></script>
      <script src="require_config.js"></script>
      <script>
         window.laxar.flow = {
            entryPoint: {
               target: 'enterInterests',
               parameters: {
                  userId: '<%= currentUserId %>'
               }
            }
         };
      </script>
      <script data-main="../init.js" src="bower_components/requirejs/require.js"></script>
   </body>
</html>
```

By using this mechanism the external application, in this example a simple JSP, is in control of how our application is entered.


## Exit Points

*Exit points* work the other way around:
Here the external application may define a map of different exit points, which in fact are simple JavaScript functions, and the LaxarJS application selects which one to call when navigating to a specific target.
Configuration of possible exit points also takes place in the global `window.laxar` [configuration object](configuration.md)  as `window.laxar.flow.exitPoints` property.

Here we added two possible exit points to our example:

```html
<!DOCTYPE html>
<html>
   <head><!-- contents omitted --></head>
   <body>
      <div data-ng-view style="display: none"></div>
      <div data-ax-page></div>

      <script src="application/application.js"></script>
      <script src="require_config.js"></script>
      <script>
         window.laxar.flow = {
            entryPoint: {
               target: 'enterInterests',
               parameters: {
                  userId: '<%= currentUserId %>'
               }
            },
            exitPoints: {
               saveProfile: function( parameters ) {
                  // Do whatever is necessary here to pass control back to the JSP application ...
               },
               cancelProcess: function( parameters ) {
                  // Do whatever is necessary here to pass control back to the JSP application ...
               }
            }
         };
      </script>
      <script data-main="../init.js" src="bower_components/requirejs/require.js"></script>
   </body>
</html>
```

All arguments passed to the target referencing an exit point during navigation will be forwarded as map to the according function in the `exitPoints` map.

For this example two targets using the new exit points are defined (irrelevant places omitted for brevity):

```JSON
{
   "places": {

      "profession/:userId": {
         "page": "profession",
         "targets": {
            "previous": "interests",
            "help": "professionHelp",
            "cancel": "cancel",
            "save": "save"
         }
      },

      "save/:userId/:profession": {
         "exitPoint": "saveProfile"
      },

      "cancel/:userId/:reasonForCancellation": {
         "exitPoint": "cancelProcess"
      }

   }
}
```

If the user decides to save his information by navigating to the target *save*, the exit point *saveProfile* with values for the parameters *userId* and *profession* will be called.
On the other hand, if the user cancels the process by navigating to the target *cancel*, the exit point *cancelProcess* with values for the parameters *userId* and *reasonForCancellation* will get invoked.

Using the simple mechanisms introduced here, most integration scenarios into external applications should be possible.
To learn how to trigger navigation from within widgets and activities, you should go on reading the [events documentation](events.md) and learn about the *navigateRequest* and *didNavigate* events.
