/**
 * Copyright 2017 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
/* eslint-env node */

const path = require( 'path' );
const webpack = require( 'webpack' );

const nodeEnv = process.env.NODE_ENV;
const isProduction = nodeEnv === 'production';
const isBrowserSpec = nodeEnv === 'browser-spec';

//////////////////////////////////////////////////////////////////////////////////////////////////////////////

const baseConfig = {
   entry: {
      laxar: './laxar.js',
      polyfills: './polyfills.js'
   },
   module: {
      noParse: /node_modules\/page\/page\.js/,
      rules: [
         {
            test: /\.js$/,
            exclude: /node_modules/,
            loader: 'babel-loader'
         }
      ]
   },
   resolve: {
      descriptionFiles: [ 'package.json' ],
      modules: [
         path.resolve( './lib' ),
         path.resolve( './node_modules' )
      ],
      extensions: [ '.js', '.jsx', '.ts', '.tsx' ]
   }
};

const config = isProduction ? distConfig() : baseConfig;

if( isBrowserSpec ) {
   const WebpackJasmineHtmlRunnerPlugin = require( 'webpack-jasmine-html-runner-plugin' );
   config.entry = Object.assign(
      WebpackJasmineHtmlRunnerPlugin.entry( './lib/*/spec/spec-runner.js' ),
      { polyfills: baseConfig.entry.polyfills }
   );
   config.plugins = [
      new WebpackJasmineHtmlRunnerPlugin()
   ];
   config.output = {
      path: path.resolve( path.join( process.cwd(), 'spec-output' ) ),
      publicPath: '/spec-output/',
      filename: '[name].bundle.js'
   };
}

module.exports = config;

//////////////////////////////////////////////////////////////////////////////////////////////////////////////

function distConfig() {

   return [
      distConfigItem( './laxar.js', 'laxar.js' ),
      distConfigItem( './laxar.js', 'laxar.min.js', { minify: true } ),
      distConfigItem( './laxar.js', 'laxar.with-deps.js', { externals: {} } ),
      distConfigItem( './laxar.js', 'laxar.with-deps.min.js', { minify: true, externals: {} } ),
      distConfigItem(
         './laxar-compatibility.js',
         'laxar-compatibility.with-deps.js',
         { externals: {} }
      ),
      distConfigItem(
         './laxar-widget-service-mocks.js',
         'laxar-widget-service-mocks.js',
         { externals: { laxar: 'laxar' } }
      ),
      distConfigItem( './polyfills.js', 'polyfills.js', { externals: {} } )
   ];

   function distConfigItem( entry, output, optionalOptions ) {
      const options = Object.assign( {
         minify: false,
         externals: { 'page': 'page' }
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

}
