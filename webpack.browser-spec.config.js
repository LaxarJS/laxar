/**
 * Copyright 2016 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */

/**
 * Webpack configuration for *interactive in-browser testing*.
 * Generates a `spec-runner.html` file and a JS bundle with sourcemaps for each `spec-runner.js`.
 *
 * The HTML spec-runner is generated by the custom `JasmineHtmlRunnerWebpackPlugin`, and also uses
 * sourcemapped-stacktrace to look up source positions at runtime.
 */

 /* global module require __dirname */
const path = require( 'path' );
const glob = require('glob');
const webpack = require( 'webpack' );

const baseConfig = require( './webpack.base.config' );
const config =  Object.assign( {}, baseConfig );

const specPattern = './lib/*/spec/spec-runner.js';
const regexPattern = specPattern.replace( '*', '(.*)' );

config.entry = glob.sync( specPattern ).reduce( ( acc, path ) => {
   const match = path.match( regexPattern );
   if( !match ) {
      return acc;
   }
   const name = match[ 1 ];
   acc[ name + '/spec-runner' ] = path;
   return acc;
}, {} );

config.entry.polyfills = baseConfig.entry.polyfills;

config.output = {
   path: path.resolve( path.join( __dirname, 'spec-output' ) ),
   publicPath: '/spec-output/',
   filename: '[name].bundle.js'
};

config.plugins = [
   new webpack.SourceMapDevToolPlugin( {
      filename: '[name].bundle.js.map'
   } ),
   new JasmineHtmlRunnerWebpackPlugin( {} )
];

module.exports = config;


function JasmineHtmlRunnerWebpackPlugin( optionalOptions ) {
   const options = Object.assign( {
      jasminePath: '../../node_modules/jasmine-core/lib/jasmine-core',
      sourceMappedStackTracePath: '../../node_modules/sourcemapped-stacktrace/dist',
      pattern: /(.*)\bspec-runner/
   }, optionalOptions || {} );

   this.apply = function( compiler ) {
      compiler.plugin('emit', ( compilation, done ) => {
         compilation.chunks
            .filter( chunk => options.pattern.test( chunk.name ) )
            .forEach( ( chunk ) => {
               const context = Object.assign( {}, {
                  title: `${chunk.name} Spec ${options.title||''}`,
                  host: 'localhost',
                  port: 8201,
                  polyfills: options.polyfills
               }, options );
               const source = expand( context );
               compilation.assets[ chunk.name + '.html' ] = {
                  source: () => source,
                  size: () => source.length
               };
            } );
         done();
      } );
   };

   function expand( ctx ) {
      return `<!doctype html>
         <html>
           <head>
              <meta charset="utf-8">
              <meta http-equiv="X-UA-Compatible" content="IE=edge">
              <title>${ctx.title}</title>
              <link type="text/css" rel="stylesheet" href="${ctx.jasminePath}/jasmine.css">
              <script type="text/javascript" src="../polyfills.bundle.js"></script>
              <script type="text/javascript" src="${ctx.jasminePath}/jasmine.js"></script>
              <script type="text/javascript" src="${ctx.jasminePath}/jasmine-html.js"></script>
              <script type="text/javascript" src="${ctx.jasminePath}/boot.js"></script>

              <script type="text/javascript" src="${ctx.sourceMappedStackTracePath}/sourcemapped-stacktrace.js"></script>
              <script type="text/javascript">
               // Fixup stack traces, using this approach: https://gist.github.com/guncha/f45ceef6d483c384290a
               jasmine.getEnv().addReporter( {
                  jasmineDone: function() {
                     try {
                        var traces = document.querySelectorAll( '.jasmine-stack-trace' );
                        [].slice.call( traces ).forEach( function( node ) {
                           sourceMappedStackTrace.mapStackTrace( node.textContent, function( stack ) {
                              node.textContent = node.previousSibling.textContent + "\\n" + stack.join( "\\n" );
                           } );
                        } );
                     }
                     catch(e) { /* ok, just an unsupported browser */ }
                  }
               } );
               </script>
           </head>
           <body>
             <script type="text/javascript" src="http://${ctx.host}:${ctx.port}/webpack-dev-server.js"></script>
             <script type="text/javascript" src="spec-runner.bundle.js"></script>
           </body>
         </html>
      `;
   }
}
