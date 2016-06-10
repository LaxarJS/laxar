/* eslint-env node */

const path = require( 'path' );

module.exports = {
   entry: './laxar.js',
   output: {
      path: path.resolve( __dirname ),
      filename: 'laxar-dist.js',
      library: 'laxar',
      libraryTarget: 'umd',
      umdNamedDefine: true
   },
   plugins: [
      // new webpack.SourceMapDevToolPlugin( {
      //    filename: 'app.bundle.js.map'
      // } ),
      // new webpack.optimize.UglifyJsPlugin( {
      //    compress: {
      //       warnings: false
      //    },
      //    sourceMap: true
      // } )
   ],
   module: {
      noParse: /bower_components\/page\/page\.js/,
      loaders: [
         {
            test: /\.js$/,
            exclude: /(node_modules|bower_components|spec)/,
            loader: 'babel-loader'
         },
         {
            test: /\.json$/,
            exclude: /(node_modules|bower_components|spec)/,
            loader: 'json-loader'
         }
      ]
   },
   resolve: {
      root: [
         path.resolve( './bower_components' )
      ],
      alias: {
         'page': path.resolve( './bower_components/page/page' ),
         // 'laxar-application': path.resolve( __dirname ),
         // 'laxar-application-dependencies': './var/flows/main/dependencies',
      }
   }
};
