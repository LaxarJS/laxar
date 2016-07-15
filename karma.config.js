// Karma configuration for LaxarJS core
/* eslint-env node */

const webpackConfig = Object.assign( {}, require('./webpack.base.config' ) );
delete webpackConfig.entry.laxar;
delete webpackConfig.plugins;
webpackConfig.devtool = 'inline-source-map';

module.exports = function(config) {
   const browsers = [ 'PhantomJS', 'Firefox' ].concat( [
      process.env.TRAVIS ? 'ChromeTravisCi' : 'Chrome'
   ] );

   config.set( {
      frameworks: [ 'jasmine' ],
      files: [
         'polyfills.js',
         'lib/*/spec/spec-runner.js'
      ],
      preprocessors: {
         'polyfills.js': [ 'webpack', 'sourcemap' ],
         'lib/*/spec/spec-runner.js': [ 'webpack', 'sourcemap' ]
      },
      webpack: webpackConfig,

      reporters: [ 'progress', 'junit' ],
      junitReporter: {
         outputDir: 'karma-output/'
      },
      port: 9876,
      browsers,
      customLaunchers: {
         ChromeTravisCi: {
            base: 'Chrome',
            flags: [ '--no-sandbox' ]
         }
      },
      browserNoActivityTimeout: 100000,
      singleRun: true,
      autoWatch: false,
      concurrency: Infinity
   } );
};
