# LaxarJS [![Build Status](https://travis-ci.org/LaxarJS/laxar.svg?branch=master)](https://travis-ci.org/LaxarJS/laxar)

> _Middleware for your web client:_ Create maintainable applications from small, isolated parts.


## Why LaxarJS?

Find out [why](docs/why_laxar.md) you would use LaxarJS and if it's the right tool for you.
Then, explore the [core concepts](docs/concepts.md) and browse the [manuals](docs/manuals/index.md) in the [documentation](docs).
Also, there is a [glossary](docs/glossary.md) where you can lookup individual concepts, and a [troubleshooting guide](docs/troubleshooting.md) there for you if you need it.

Have a look at the [LaxarJS website](http://laxarjs.org) for demos and more information.
<span class="laxar-external-documentation-hint">
   Take a look at the <a href="http://www.laxarjs.org/docs/laxar-latest">documentation site</a> to browse documentation for all releases.
</span>


## Getting Started

Here are the basic instructions to get started.


### Requirements

On your _development machine_, make sure that you have Node.js v6 or above (v4 might work, but there is no support).

Users of your application will need to have the following _browser capabilities:_

 - native ES5 support (no polyfills: MSIE < 9 is *not* supported)
 - Support for the following ES6 features (native or polyfilled):
   + Promise, Fetch
   + Array.from, Array.prototype.includes
   + Object.assign

Modern browsers have support for all of these, but polyfills for the listed ES6 features can be obtained by simply loading the LaxarJS polyfills bundle (`dist/polyfills.js`) using a script tag, before loading anything else.
When using the generator (next step), your project will be setup for use with polyfills automatically.


### Using the Generator

Use the  [generator-laxarjs2](https://laxarjs.org/docs/generator-laxarjs2-latest/ for the [Yeoman](http://yeoman.io/) scaffolding tool to get started:

```console
npm install -g yo generator-laxarjs2
mkdir my-app
cd my-app
yo laxarjs2
```

This will guide you through a couple of prompts in order to create your first application.
There is a [step-by-step tutorial](https://github.com/LaxarJS/shop-demo/blob/master-2.x/docs/tutorials/01_getting_started.md#getting-started) containing more detailed instructions.


## Manual Setup

Using the generator is the recommended way of creating a LaxarJS application.
However, knowledge about the _manual_ setup process is useful for a better understanding of LaxarJS and may help in some advanced use cases, such as [migrating](./docs/manuals/upgrade_guide.md) a project from a previous major version.

There are detailed [instructions to create a project from scratch](./docs/manuals/project_from_scratch.md).


### Hacking LaxarJS itself

Instead of using the compiled library within a project, you can also clone this repository:

```console
git clone https://github.com/LaxarJS/laxar.git
cd laxar
npm install
```

To see changes in your application, either configure your project to work with the sources (e.g. by configuring a webpack alias), or _rebuild the bundles_:

```console
npm run dist
```

To run the _automated tests_:

```console
npm test
```

To generate HTML test runners for opening in your web browser, so that you can e.g. use the browser's developer tools for diagnostics:

```console
npm run browser-spec
```

Now you can select a spec-runner by browsing to http://localhost:8080/spec-output/.
