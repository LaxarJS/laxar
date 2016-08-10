# LaxarJS [![Build Status](https://travis-ci.org/LaxarJS/laxar.svg?branch=master)](https://travis-ci.org/LaxarJS/laxar)

> _Middleware for your web client:_ Create maintainable applications from small, isolated parts.


## Why LaxarJS?

Find out [why](docs/why_laxar.md) you would use LaxarJS and if it's the right tool for you.
Then, explore the [core concepts](docs/concepts.md) and browse the [manuals](docs/manuals/index.md) in the [documentation](docs).

Have a look at the [LaxarJS homepage](http://laxarjs.org) for demos and more information.


## Getting Started

*Warning:* This is the LaxarJS *development branch.*
You may want to browse the [LaxarJS release documentation](http://laxarjs.org/docs/laxar-latest/).


### Requirements

LaxarJS v2 can be loaded without installing additional dependencies:

The release bundle `laxar/dist/laxar.with-deps.js` contains LaxarJS itself as well as its dependencies ([jjv](https://github.com/acornejo/jjv), [jjve](https://github.com/silas/jjve) and [page.js](https://visionmedia.github.io/page.js/)).

However, the following browser capabilities are required:

 - native ES5 support (MSIE < 9 is *not* supported)
 - Support for the following ES6 features (native or polyfilled):
   + Promise
   + Fetch
   + Array.from

These polyfills can simply be obtained by loading `dist/polyfills.js` through a script tag.


### Hacking LaxarJS itself

Instead of using a compiled library within a project, you can also clone this repository:

```sh
git clone https://github.com/LaxarJS/laxar.git
cd laxar
npm install
```

To see changes in your application, either configure your project to work with the sources (e.g. by using webpack), or rebuild the webpack bundles by running `npm run optimize`.

To run the automated karma tests:

```sh
npm test
```

To generate HTML spec runners for opening in your web browser, so that you can e.g. use the browser's developer tools:

```sh
npm run browser-spec
```

Now you can select a spec-runner by surfing to http://localhost:8081/spec-output/.
