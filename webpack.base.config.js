/**
 * Copyright 2016 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
/* eslint-env node */

module.exports = {
   entry: {
      laxar: './laxar.js',
      polyfills: './polyfills.js'
   },
   module: {
      noParse: /node_modules\/page\/page\.js/,
      loaders: [
         {
            test: /\.js$/,
            exclude: /node_modules/,
            loader: 'babel-loader'
         },
         {
            test: /\.json$/,
            exclude: /node_modules/,
            loader: 'json-loader'
         }
      ]
   },
   resolve: {}
};
