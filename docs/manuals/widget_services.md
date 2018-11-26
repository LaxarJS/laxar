# Widget Services

[« return to the manuals](index.md)

In order to make developing widgets even easier, a common set of services is offered to each widget instance, regardless of its implementation technology.
Some of these services are mere adapters to internal APIs and are mostly relevant for tooling, while others are specifically tailored to the respective widget instance, sparing the widget developer to provide context information by himself.
A widget adapter may offer additional services specific to its implementation technology.
For example the AngularJS adapter allows to inject all available AngularJS services and the widget's `$scope` object.

Preliminary readings:

- [Widgets and Activities](widgets_and_activities.md)


## Available Services

For a list of all widget services, consult the [widget services API documentation](../api/runtime.widget_services.md).

To help you get started, the most important widget services are:

- [`axContext`](../api/runtime.widget_services.md#axContext) for passing essential instance information to libraries such as [LaxarJS Patterns](https://laxarjs.org/docs/laxar-patterns-v2-latest/), also available as `$scope` to AngularJS widgets,

- [`axConfiguration`](../api/runtime.widget_services.md#axConfiguration) for application configuration,

- [`axEventBus`](../api/runtime.widget_services.md#axEventBus) to communicate using publish/subscribe,

- [`axFeatures`](../api/runtime.widget_services.md) to access instance feature configuration,

- [`axFlowService`](../api/runtime.widget_services.md) to generate link URLs,

- [`axLog`](../api/runtime.widget_services.md) for logging.


## Mocking Widget Services from Tests

One of the advantages that providing all widget services as injection is improved testability.
The [LaxarJS Mocks](https://laxarjs.org/docs/laxar-mocks-v2-latest/) library replaces all builtin widget services with mock versions that do not affect the browser state and that are reset completely between test cases.

The [widget service mocks API](../api/laxar-widget-service-mocks.md) is defined by LaxarJS Core, and should simplify writing non-trivial tests.
You can configure service mocks just before a widget controller is instantiated by passing a callback to `axMocks.widget.whenServicesAvailable`.
The [LaxarJS Mocks API docs](https://laxarjs.org/docs/laxar-mocks-v2-latest/api/) contain more detailed information.


## Application-Defined Services

Custom widget services may be defined using the [LaxarJS Configuration](./configuration.md).

You can use this feature to create your own injections.


### Creating Application-Defined Services

Here is a simplistic example that shows how to inject a custom [fetch](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API) wrapper that always parses responses as JSON:

```js
// init.js

const configuration = {
   applicationServices: {
      fetchJson() {
         return ( url, init ) => fetch( url, init )
            .then( response => response.json() );
      }
   }
};

// ... laxar.create( …, …, configuration ).….bootstrap();
```

An activity (or widget) can now use instances of the `fetchJson` service:

```js
// my-activity.js

export const injections = [ 'axEventBus', 'fetchJson' ];
export function create( eventBus, fetchJson ) {
   fetchJson( 'http://example.com' ).then( json => {
      eventBus.publish( 'didReplace.my-topic', json );
   } );
};
```

Note that names of application-defined services *must not* begin with the string "ax", as it is reserved by LaxarJS.


### Sharing Data among Service Instances

You can also use this functionality to share objects among widgets/activities.
However, your factory method is called once for each widget instance that uses your injection!
So in order to share a value, that value must live outside of the factory closure:

Here is an example for a computation that uses a shared cache:

```js
function calculateExpensiveResult( input ) { /* ... */ }
const cache = {};
const compute = input => {
   if( !( input in cache ) ) {
      cache[ input ] = calculateExpensiveResult( input );
   }
   return cache[ input ];
}

const configuration = {
   applicationServices: {
      sharedComputation() {
         return compute;
      }
   }
};

// ... laxar.create( …, …, configuration ).….bootstrap();
```

However, at most times you will want to share data over the event-bus instead!


### Dependencies of Application-Defined Services

Finally, you can actually use _injections for your injections_.
For example, you may want to add the ID of the origin widget/activity as a header to your REST API requests.
To do this, define your service using an object with a _create_ method and an _injections_ list:

```js
// init.js
const customFetch = {
   injections: [ 'axContext' ],
   create( context ) {
      return ( url, init ) => {
         const headers = {
            ...init.headers,
            'X-Sent-By-Widget': context.widget.id
         };
         return fetch( url, { ...init, headers } );
      };
   }
};

const configuration = {
   applicationServices: { customFetch }
};

// ... laxar.create( …, …, configuration ).….bootstrap();
```

The previous examples (`fetchJson`, `sharedComputation`) could have easily been implemented using regular JavaScript modules instead.
However, application-defined services have the following main advantages:

* it is much less boilerplate to specify injections compared to creating instances everywhere,

* when your services need additional injections later on, you can simply add those to their service definition

* you can control the instantiation, sharing and reuse of service objects from your factory.

This second advantage means that you do not need to modify all widgets/activities that access your services, only to provide them with an additional dependency.


### Releasing Application-Defined Services

Using the object-based form, you can also specify a `release` method which is called when your instance is destroyed.

This can be used to free unused resources, or to implement pools of resources that may be expensive to create repeatedly:

```js
const instancePool = [];
function createExpensiveDbConnection() { /* ... */ }

const dbConnection = {
   create() {
      return instancePool.length ?
         instancePool.pop() :
         createExpensiveDbConnection();
   },
   release( instance ) {
      instancePool.push( instance );
   }
}


const configuration = {
   applicationServices: { dbConnection }
};
```

