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
   distConfig( './laxar.js', 'laxar.js' ),
   distConfig( './laxar.js', 'laxar.min.js', { minify: true } ),
   distConfig( './laxar.js', 'laxar.with-deps.js', { externals: {} } ),
   distConfig( './laxar.js', 'laxar.with-deps.min.js', { minify: true, externals: {} } ),

   distConfig(
      './laxar-compatibility.js',
      'laxar-compatibility.with-deps.js',
      { externals: {} }
   ),

   distConfig(
      './laxar-widget-service-mocks.js',
      'laxar-widget-service-mocks.js',
      { externals: { laxar: 'laxar' } }
   ),

   distConfig( './polyfills.js', 'polyfills.js', { externals: {} } )
];

//////////////////////////////////////////////////////////////////////////////////////////////////////////////

function distConfig( entry, output, optionalOptions ) {
   const options = Object.assign( {
      minify: false,
      externals: {
         'page': 'page',
         'jjv': 'jjv',
         'jjve': 'jjve'
      }
   }, optionalOptions || {} );

   const config = Object.assign( {}, baseConfig );

   config.entry = entry;

   config.output = {
      path: path.resolve( __dirname ),
      filename: `dist/${output}`,
      library: 'laxar',
      libraryTarget: 'umd',
      umdNamedDefine: true
   };

   config.externals = options.externals;

   config.plugins = [
      new webpack.SourceMapDevToolPlugin( {
         filename: `dist/${output}.map`
      } )
   ];

   if( options.minify ) {
      config.plugins.push(
         new webpack.optimize.UglifyJsPlugin( {
            compress: { warnings: false },
            sourceMap: true
         } )
      );
   }

   return config;
}
