/* global require */
// script-loader works for MSIE (in contrast to the core-js loader)
require('script!promise-polyfill/promise');
require('./node_modules/whatwg-fetch/fetch.js');
require('./lib/polyfills/array_from.js');
require('./lib/polyfills/array_includes.js');
require('./lib/polyfills/object_assign.js');
