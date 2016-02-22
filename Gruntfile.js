/**
 * Copyright 2016 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
/*jshint node: true*/
module.exports = function (grunt) {
   'use strict';

   var pkg = grunt.file.readJSON( 'package.json' );

   grunt.initConfig( {
      pkg: pkg,
      pkgFile: 'package.json',
      karma: {
         options: {
            basePath: '',
            browsers: [ 'PhantomJS' ],
            browserNoActivityTimeout: 100000,
            plugins: [
               'karma-jspm',
               'karma-jasmine',
               'karma-junit-reporter',
               'karma-phantomjs-launcher',
               'karma-chrome-launcher'
            ],
            reporters: [ 'progress', 'junit' ],
            junitReporter: {
               outputDir: 'karma-output/'
            },
            frameworks: [ 'jspm', 'jasmine' ],
            proxies: {
               '/lib/': '/base/lib/',
               '/static/': '/base/static/',
               '/jspm_packages/': '/base/jspm_packages/'
            },
            jspm: {
               config: 'system.config.js',
               loadFiles: [
                  'lib/**/*_spec.js',
               ],
               serveFiles: [
                  'lib/**/!(*_spec).js',
                  'static/**/*.js',
                  'jspm_packages/**/*.js',
               ]
            }
         },
         unit: {
            singleRun: true,
         }
      },
      eslint: {
         options: {
            config: '.eslintrc.json'
         },
         src: [ 'lib/**/*.js' ]
      },
      clean: {
         apidoc: {
            src: [ 'docs/api/*.js.md' ]
         }
      },
      laxar_dox: {
         default: {
            files: [ {
               src: [
                  'lib/event_bus/event_bus.js',
                  'lib/file_resource_provider/file_resource_provider.js',
                  'lib/i18n/i18n.js',
                  'lib/logging/log.js',
                  'lib/runtime/{controls_service,flow,runtime_services,theme_manager}.js',
                  'lib/utilities/!(timer|path).js'
               ],
               dest: 'docs/api/'
            } ]
         }
      }
   } );

   grunt.loadNpmTasks( 'grunt-contrib-clean' );
   grunt.loadNpmTasks( 'grunt-karma' );
   grunt.loadNpmTasks( 'gruntify-eslint' );

   grunt.registerTask( 'test', [ 'eslint', 'karma' ] );
   grunt.registerTask( 'apidoc', [ 'clean:apidoc', 'laxar_dox' ] );

   grunt.registerTask( 'default', [ 'test', 'apidoc' ] );
};
