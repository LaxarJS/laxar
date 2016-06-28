/* eslint-env node */

const path = require( 'path' );

module.exports = {
   entry: {
      laxar: './laxar.js',
      polyfills: './karma.polyfills.js'
   },
   module: {
      noParse: /bower_components\/page\/page\.js/,
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
         path.resolve( './bower_components' )
      ],
      alias: {
         'page': path.resolve( './bower_components/page/page' )
      }
   }
};
