/**
 * Copyright 2016 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */

/**
 * Webpack configuration for the standalone laxar dist bundle.
 * A source map is generated, but the bundle is not minified.
 */

/* eslint-env node */

const path = require( 'path' );
const webpack = require( 'webpack' );

const baseConfig = require( './webpack.base.config' );

module.exports = [
   polyfillsConfig(),
   distConfig(),
   distMinConfig(),
   distWithDepsConfig(),
   distWithDepsMinConfig()
];

//////////////////////////////////////////////////////////////////////////////////////////////////////////////

function polyfillsConfig() {

   const config = Object.assign( {}, baseConfig );

   config.output = {
      path: path.resolve( __dirname ),
      filename: 'dist/polyfills.js'
   };

   config.externals = {};

   config.plugins = [
      new webpack.SourceMapDevToolPlugin( {
         filename: 'dist/polyfills.js.map'
      } )
   ];
   return config;
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////////

function distConfig() {

   const config = Object.assign( {}, baseConfig );

   config.output = {
      path: path.resolve( __dirname ),
      filename: 'dist/laxar.js',
      library: 'laxar',
      libraryTarget: 'umd',
      umdNamedDefine: true
   };

   config.externals = {
      'page': 'page',
      'jjv': 'jjv',
      'jjve': 'jjve'
   };

   config.plugins = [
      new webpack.SourceMapDevToolPlugin( {
         filename: 'dist/laxar.js.map'
      } )
   ];

   return config;
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////////

function distMinConfig() {

   const config = Object.assign( {}, distConfig() );

   config.output = Object.assign( {}, config.output, {
      filename: 'dist/laxar.min.js'
   } );

   config.plugins = [
      new webpack.SourceMapDevToolPlugin( {
         filename: 'dist/laxar.min.js.map'
      } ),
      new webpack.optimize.UglifyJsPlugin( {
         compress: {
            warnings: false
         },
         sourceMap: true
      } )
   ];

   return config;
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////////

function distWithDepsConfig() {

   const config = Object.assign( {}, distConfig() );

   config.output = Object.assign( {}, config.output, {
      filename: 'dist/laxar.with-deps.js'
   } );

   config.externals = {};

   config.plugins = [
      new webpack.SourceMapDevToolPlugin( {
         filename: 'dist/laxar.with-deps.js.map'
      } )
   ];

   return config;
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////////

function distWithDepsMinConfig() {

   const config = Object.assign( {}, distConfig() );

   config.output = Object.assign( {}, config.output, {
      filename: 'dist/laxar.with-deps.min.js'
   } );

   config.externals = {};

   config.plugins = [
      new webpack.SourceMapDevToolPlugin( {
         filename: 'dist/laxar.with-deps.min.js.map'
      } ),
      new webpack.optimize.UglifyJsPlugin( {
         compress: {
            warnings: false
         },
         sourceMap: true
      } )
   ];

   return config;
}
