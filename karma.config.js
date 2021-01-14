// Karma configuration for LaxarJS core
/* eslint-env node */
const laxarInfrastructure = require( 'laxar-infrastructure' );

module.exports = function( config ) {
   config.set( karmaConfig() );
};

function karmaConfig() {
   const tests = [ 'loaders', 'runtime', 'testing', 'tooling', 'utilities' ]
      .map( module => `./lib/${module}/spec/spec-runner.js` );
   const files = [ './polyfills.js' ].concat( tests );
   const preprocessors = files.reduce( (acc, t) => {
      acc[ t ] = [ 'webpack', 'sourcemap' ];
      return acc;
   }, {} );

   const webpackBaseConfig = require( './webpack.config' )[ 0 ];
   return Object.assign( {}, laxarInfrastructure.karma( files, {
      context: __dirname,
      module: webpackBaseConfig.module
   } ), {
      files,
      preprocessors,
      singleRun: true,
      watch: false,
      browsers: [ 'ChromeHeadless' ]
   } );
}
