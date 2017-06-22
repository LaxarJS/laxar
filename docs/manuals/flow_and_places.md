# Flow and Places

[« return to the manuals](index.md)

Every application that has more than one page needs a concept for navigating between these pages.
In LaxarJS this is achieved by a *flow* that determines which page is rendered based on a given URL, and how other pages are *related* to the current location.

Preliminary readings:

- [LaxarJS Core Concepts](../concepts.md)
- [Configuration](configuration.md)
- [Writing Pages](writing_pages.md)


## The Flow

The flow is the top-level artifact that ties together all parts of a LaxarJS application:
it defines what pages are reachable, which in turn determines the set of widgets and controls that are loaded as part of an application.
Before bootstrapping your application, you must specify _which_ flow to use in your application.
The default flow configured by the Yeoman generator is called `"main"`.
Adding more flows allows you to create several "perspectives" onto your application, automatically picking pages and widgets from your project as needed.
For example, you could have a flow to present to new visitors, a second flow for registered users, and a third flow to implement a back-office tool.

Each flow is specified using a *flow definition file* in JSON format, and it primarily consists of a set of named *places*.


## Places

Each _place_ is either associated with a specific *[page](./writing_pages.md)* to be rendered when entering that place, or it is a redirect to another place.

To determine which place is active when navigating to an application, the browser URL is matched against each place's *patterns* until a match is found.
This process is called _routing_.
These patterns are also used to *generate URLs* to create link between pages, and to update the browser URL when performing event-based navigation.

For the actual pattern matching and routing, LaxarJS uses with the micro-library [Navigo](https://github.com/krasimir/navigo) and its routing pattern syntax, which should be familiar to users of frameworks such as AngularJS or React and their routing solutions.

Let us start with an example for a simple flow definition file that we call `main.json`:

```JSON
{
   "places": {
      "index": {
         "patterns": [ "/" ],
         "redirectTo": "details"
      },

      "details": {
         "patterns": [ "/details/:item", "/details" ],
         "page": "first_page"
      },

      "team": {
         "patterns": [ "/team" ],
         "redirectToPath": "/details/team"
      }
   }
}
```

A flow definition is always a JSON object with the top-level property `places`, which in turn is a map.
Each entry of that map consists of the place's *ID* as key and a *place definition* as value.

The ID is a non-empty alphanumeric string that identifies a place within an application.
It is used to reference places when creating links or to perform event-based navigation.


### Place Patterns

Each place definition has a non-empty list of URL-patterns, specified under the key `patterns`.
In the example, the place *index* has a single pattern (`/`), while the place *details* has two patterns: `/details/:item` with the named parameter *item* filled in by the router, and `/details` which will not set the *item* parameter when navigated to.
If no patterns are specified, a place with ID `$some-id` will automatically be assigned the patterns list `[ "/$some-id" ]`, which will only match a slash followed by the exact place ID.

The syntax for URL patterns ultimately depends on what the router (Navigo) deems valid.
It is *strongly recommended* to always start patterns with a *leading slash*, as relative paths will quickly break down in most setups.
Also note that each list of patterns should start with a *reversible* pattern, as explained in the next section.
Note that regular-expression patterns, while in principle supported by Navigo, are currently not available for use in a LaxarJS flow definition, both because they are not reversible, and because there is no JSON notation for them.

Apart from its patterns, a place has either a `page` entry, a `redirectTo` or a `redirectToPath` entry.
The first determines that the corresponding page will be looked up relative to the pages directory of your application and instantiated when entering the place, while the latter makes it a redirect to another place specified by ID or full path, respectively.
In the example, the place *index* specifies a redirect to the place *details*, while the place *team* specifies a direct redirect to the path `/details/team`.
You can use redirects to support legacy URLs in your application and to forward them to actual pages, or provide shortcuts for otherwise complex paths.

Application may also enable *query-strings* using the configuration key `router.query.enabled`.
Query parameters are never used for routing, but carry *optional parameter values* that may be useful to widgets on a page.
Because query parameters are optional, each place may specify an object containing `defaultParameters`, that are published with navigation events if no matching query parameter was passed.
Note that regular place parameters always override query parameters of the same name.


### Reverse Routing

The declarative routing configuration used by LaxarJS is a bit more restrictive than free-form programmatic routing.
On the other hand, this notation allows applications to automatically generate URLs to any place, just from an ID and possibly a set of named parameters.
The widgets and activities within your application do not need to know about the URL patterns associated with their respective place, which makes them portable across pages and even application.

To make use of reverse routing, it is important that the first pattern for each place is *reversible*.
Specifically, any wildcard parts of the URL pattern must be *named*, so that they can be substituted for the actual parameter names by the router.
The pattern `*` that matches any path is not reversible, for example.
Also, Navigo regular expression patterns are not reversible, because JavaScript does not support named capturing groups in regular expressions.
However, their syntax is not supported by the JSON flow definition anyway, so applications cannot use them by mistake.
The following pattern styles are known to work well with reverse routing:

- verbatim: `/some/path`
- named parameter segments `/some/:param/:other-param`

If query parameters are enabled, any additional parameters that are not part of the pattern to reverse will be encoded into query parameters, except if the parameter value to be encoded equals the default value of the target place.


### Initiating navigation

To initiate navigation, widgets have two options:

Widgets may render regular HTML links and use the method *constructAbsoluteUrl* of the [axFlowService](./widget_services.md#axFlowService) to calculate the URLs of each link based on place ID and parameters.

Alternatively, widgets may initiate navigation by issuing a *navigateRequest* event expressing the desired new location within the application and providing values for place parameters.
How event-based navigation works in detail can be read in the separate manual covering [events](events.md).

In [HTTP/REST](http://en.wikipedia.org/wiki/Representational_state_transfer)) terms, event-based navigation is used to express POST-like semantics, where an URL change is associated with an effectful user action (save, sign up, purchase, etc.), while links should always follow GET semantics so that the user can safely switch back and forth between URLs.

Even better, neither widgets nor pages need to deal with specific place IDs, and can instead use semantic *targets* to initiate navigation or to construct links, as explained in the next section.


## Targets

Using both events and links, it is possible to always navigate directly from place to place, simply by specifying the ID of the target place.
However, this approach causes a tight coupling between the widget triggering navigation on one hand and the flow definition on the other hand, hurting reuse.
Even more, this would smear knowledge about the navigational structure throughout the application,  making it more difficult to later change this structure.

Instead, a widget or a page (via the feature configuration of its widgets) should specify semantic navigation *targets* such as *"next", "previous", "details"*, which are then resolved based on the current place and its definition in the application flow.
The idea is roughly comparable to *relations* in REST style architectures.
In LaxarJS, each place can define its own mapping from semantic target identifiers to the IDs of other places within the application flow.

An example:

```JSON
{
   "places": {
      "introduction": {
         "patterns": [ "/introduction/:userId" ],
         "page": "introduction",
         "targets": {
            "next": "interests"
         }
      },

      "interests": {
         "patterns": [ "/interests/:userId" ],
         "page": "interests",
         "targets": {
            "previous": "introduction",
            "next": "profession",
            "help": "interestsHelp"
         }
      },

      "profession": {
         "patterns": [ "/profession/:userId" ],
         "page": "profession",
         "targets": {
            "previous": "interests",
            "help": "professionHelp"
         }
      },

      "interestsHelp": {
         "patterns": [ "/interests-help/:userId" ],
         "page": "interests_help",
         "targets": {
            "back": "interests"
         }
      },

      "professionHelp": {
         "patterns": [ "/profession-help/:userId" ],
         "page": "profession_help",
         "targets": {
            "back": "profession"
         }
      }
   }
}
```

This flow is typical for a wizard-like application, as it allows forward and backward navigation, but only sparsely jumping in between pages.
The first place in the example is called *introduction*, which simply displays a page and just lets the user navigate to the *next* target, which would be resolved to the place *interests*.
Here a page is displayed where the user can input his interests, such as hobbies or taste in music.
As we are in the middle of the wizard now, a *previous* target is reachable in addition to the *next* and *help* targets.
Unsurprisingly the *previous* target references the first place, *introduction*.
The *next* target instead leads us to another new place with identifier *profession*.
The *profession* place may only lead us back to the *interests* place via the *previous* target.

Let us assume that our pages contain tricky input components, on which we would like to assist the user.
This is where the *help* target comes into play.
Both the *interests* and the *profession* page use this target, but the places behind these targets are different depending on the source page.
This allows you to provide contextual semantics to standard navigation controls, such as a row of back/forward/help buttons.
Returning from the help pages is familiar, via the *back* target leading to the respective places.

Using the mechanisms introduced here, most navigation scenarios as well as integration into external applications should be possible.
To find out how to construct links between pages, refer to the [axFlowService API](../api/runtime.flow_service.md).
To learn how to trigger event-based navigation from within widgets and activities, you should go on reading the [events documentation](events.md) and learn about the *navigateRequest* and *didNavigate* events.
