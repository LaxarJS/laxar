# LaxarJS Troubleshooting

By its nature, LaxarJS tries to be forgiving and not impose a lot of restrictions on application developers.
The publish/subscribe model ensures loose coupling and prevents failure of individual components from propagating throughout an application.

However, precisely because LaxarJS applications are loosely coupled and forgiving, in some cases problems are not noticed right away.
And in some circumstances, misconfigurations may be hard to detect.
This guide serves as a quick checklist to avoid known "gotchas".


## General Development Tips

First, here are a couple of development tips that hopefully help you avoid having to ever use the troubleshooting section below.


### Yeoman Generators

Using the [LaxarJS Yeoman Generators](http://laxarjs.org/docs/generator-laxarjs-latest/) is a simple way to get started with a working application.
Making incremental changes from there will help you to pinpoint any problems to their cause.
In fact, it is a good practice to create a commit in Git (or a VCS of choice) right after finishing the application generator, to establish a working baseline.


### Log Level

During development of your application, set the LaxarJS logging level to "DEBUG" or "TRACE".
The default level is "INFO", which is appropriate for production.
LaxarJS itself logs its lifecycle messages in "TRACE", so make sure to enable it if you have problems with the overall setup of your application.
To enable "TRACE" logging, set `logging: { level: 'TRACE' }` in the configuration option that you pass to `laxar.bootstrap`, usually in your `init.js`.


### Use the Developer Tools Extension

For Google Chrome, there is a [developer tools extension](https://chrome.google.com/webstore/detail/laxarjs-developer-tools/leidhppnemgdhcjfagmjdkfjpejibinp) that helps to inspect the setup of your pages and to verify that your widgets are connected correctly.
It also allows to inspect event bus events with their payload.


### Write JSON Schemas for Widget Features

With LaxarJS v2 it is optional to add a JSON schema to your widget feature configuration.
However, once you are confident that your widget configuration interface is somewhat stable, take a moment to create a JSON schema, both as documentation and for improved reliability.


## Troubleshooting

Sometimes you follow all the best practices and still run into problems.
Here are a few pointers to follow if things are going wrong:


### There are no errors, just a blank Page

This is most commonly a problem with the routing setup.
First, make sure that you specified the flow to use for your application in the bootstrap configuration options (e.g. by adding `flow: { name: "main" }` if the file `flows/main.json` contains your flow definition).

Next, ensure that the router actually matches against the browser location.
For example, if you are using hash-based-URLs for routing, set `router: { navigo: { useHash: true } }`.
