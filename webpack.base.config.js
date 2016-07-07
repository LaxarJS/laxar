/**
 * Copyright 2016 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
/* eslint-env node */

const path = require( 'path' );

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
            exclude: /(node_modules|bower_components)/,
            loader: 'babel-loader'
         },
         {
            test: /\.json$/,
            exclude: /(node_modules|bower_components)/,
            loader: 'json-loader'
         }
      ]
   },
   resolve: {
      root: [
         path.resolve( './node_modules' )
      ],
      alias: {
         'page': path.resolve( './node_modules/page/page' )
      }
   }
};
