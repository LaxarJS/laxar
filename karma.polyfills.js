// works in MSIE (in contrast to the core-js loader)
require('script!promise-polyfill/promise');
require('array.from').shim();
require('./node_modules/whatwg-fetch/fetch.js');
