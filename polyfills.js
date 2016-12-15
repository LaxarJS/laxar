/* global require */
// script-loader works for MSIE (in contrast to the core-js loader)
import 'script!promise-polyfill/promise';
import 'whatwg-fetch/fetch.js';
import './lib/polyfills/array_from.js';
import './lib/polyfills/array_includes.js';
import './lib/polyfills/object_assign.js';
