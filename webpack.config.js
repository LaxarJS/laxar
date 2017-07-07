/**
 * Copyright 2017 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
/* eslint-env node */

const path = require( 'path' );
const webpack = require( 'webpack' );

const entries = [ 'polyfills', 'laxar', 'laxar-compatibility', 'laxar-widget-service-mocks' ];
const libs = [ 'loaders', 'runtime', 'testing', 'tooling', 'utilities' ];

const webpackInfrastructure = require( 'laxar-infrastructure' ).webpack( {
   context: __dirname,
   plugins: [ new webpack.optimize.ModuleConcatenationPlugin() ],
   module: {
      rules: [
         {
            test: /\.js$/,
            include: [ path.resolve( __dirname, 'lib/' ) ]
               .concat( entries.map( entry => path.resolve( __dirname, `${entry}.js` ) ) ),
            loader: 'babel-loader'
         }
      ]
   }
} );

module.exports = entries
   .map( entry => Object.assign(
      {}, webpackInfrastructure.library(), { entry: { [ entry ]: `./${entry}.js` } }
   ) )
   .concat( [
      webpackInfrastructure.browserSpec( libs.map( lib => `./lib/${lib}/spec/spec-runner.js` ) )
   ] );
