// script-loader works for MSIE (in contrast to the core-js loader)
require('script!phantomjs-polyfill/bind-polyfill.js');
require('script!promise-polyfill/promise');
require('array.from').shim();
require('./node_modules/whatwg-fetch/fetch.js');
