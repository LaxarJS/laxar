/**
 * Copyright 2015 aixigo AG
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
            browsers: [ 'Chrome', 'PhantomJS' ],
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
      // karma: {
      //    options: {
      //       browsers: [ 'Chrome' ],
      //       plugins: [
      //          'karma-systemjs',
      //          'karma-es6-shim',
      //          'karma-jasmine',
      //          'karma-coverage',
      //          'karma-junit-reporter',
      //          'karma-phantomjs-launcher',
      //          'karma-chrome-launcher'
      //       ],
      //       reporters: [ 'progress', 'coverage', 'junit' ],
      //       preprocessors: {
      //          'lib/**/!(*_spec).js': [ 'coverage' ]
      //       },
      //       junitReporter: {
      //          outputDir: 'karma-output/'
      //       },
      //       coverageReporter: {
      //          type : 'lcov',
      //          dir : 'karma-output/',
      //          instrumenters: { isparta: require( 'isparta' ) },
      //          instrumenter: {
      //             '**/*.js': 'isparta'
      //          },
      //          instrumenterOptions: {
      //             isparta: { babel: { presets: 'es2015' } }
      //          }
      //       },
      //       frameworks: [ 'systemjs', 'es6-shim', 'jasmine' ],
      //       systemjs: {
      //          configFile: 'system.config.js',
      //          serveFiles: [
      //             'lib/**/*.js',
      //             'static/**/*.js',
      //             'jspm_packages/**/*.js',
      //          ],
      //          config: {
      //             transpiler: 'babel',
      //             paths: {
      //                'babel': 'babel', // makes karma-systemjs use the babel version installed and configured by jspm
      //                'es6-module-loader': 'node_modules/es6-module-loader/dist/es6-module-loader.js',
      //                'phantomjs-polyfill': 'node_modules/phantomjs-polyfill/bind-polyfill.js',
      //                'systemjs': 'node_modules/systemjs/dist/system.js',
      //                'system-polyfills': 'node_modules/systemjs/dist/system-polyfills.js',
      //             }
      //          }
      //       }
      //    },
      //    unit: {
      //       singleRun: true,
      //       files: [ {
      //          src: 'lib/**/spec/*_spec.js',
      //          src: 'lib/loaders/spec/page_loader_spec.js',
      //       } ]
      //    }
      // },
      eslint: {
         options: {
            config: '.eslintrc'
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
                  'lib/directives/*/*.js',
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
