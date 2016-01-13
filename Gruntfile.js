/**
 * Copyright 2016 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
/*jshint node: true*/
module.exports = function (grunt) {
   'use strict';

   var pkg = grunt.file.readJSON( 'package.json' );
   var src = {
      gruntfile: 'Gruntfile.js',
      require: 'require_config.js',
      laxar: [ pkg.name + '.js', 'lib/**/*.js', '!lib/**/spec/**/*.js' ],
      specs: [ 'lib/**/spec/**/*.js' ]
   };

   function karma(lib) {
      var options = {
         laxar: {
            specRunner: 'lib/' + lib + '/spec/spec_runner.js',
            requireConfig: src.require
         },
         junitReporter: {
            outputFile: 'lib/' + lib + '/spec/test-results.xml'
         },
         coverageReporter: {
            type: 'lcovonly',
            dir: 'lib/' + lib + '/spec',
            file: 'lcov.info'
         }
      };

      return { options: options };
   }

   grunt.initConfig( {
      jshint: {
         options: {
            jshintrc: '.jshintrc'
         },
         gruntfile: {
            options: { node: true },
            src: src.gruntfile
         },
         laxar: { src: src.laxar },
         specs: { src: src.specs }
      },
      karma: {
         options: {
            basePath: '.',
            frameworks: ['laxar'],
            reporters: ['junit', 'coverage', 'progress'],
            browsers: ['PhantomJS'],
            singleRun: true,
            preprocessors: {
               'lib/**/*.js': 'coverage'
            },
            proxies: {},
            files: [
               { pattern: 'bower_components/**', included: false },
               { pattern: 'static/**', included: false},
               { pattern: 'lib/**', included: false },
               { pattern: '*.js', included: false }
            ]
         },
         'directives-id': karma( 'directives/id' ),
         'directives-layout': karma( 'directives/layout' ),
         'directives-widget_area': karma( 'directives/widget_area' ),
         event_bus: karma( 'event_bus' ),
         file_resource_provider: karma( 'file_resource_provider' ),
         i18n: karma( 'i18n' ),
         json: karma( 'json' ),
         loaders: karma( 'loaders' ),
         logging: karma( 'logging' ),
         profiling: karma( 'profiling' ),
         runtime: karma( 'runtime' ),
         testing: karma( 'testing' ),
         utilities: karma( 'utilities' ),
         widget_adapters: karma( 'widget_adapters' )
      },
      test_results_merger: {
         laxar: {
            src: [ 'lib/**/spec/test-results.xml' ],
            dest: 'test-results.xml'
         }
      },
      lcov_info_merger: {
         laxar: {
            src: [ 'lib/**/spec/*/lcov.info' ],
            dest: 'lcov.info'
         }
      },
      watch: {
         gruntfile: {
            files: src.gruntfile,
            tasks: [ 'jshint:gruntfile' ]
         },
         laxar: {
            files: src.laxar,
            tasks: [ 'jshint:laxar', 'karma' ]
         },
         specs: {
            files: src.specs,
            tasks: [ 'jshint:specs', 'karma' ]
         }
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
   grunt.loadNpmTasks( 'grunt-contrib-jshint' );
   grunt.loadNpmTasks( 'grunt-contrib-watch' );
   grunt.loadNpmTasks( 'grunt-laxar' );

   grunt.registerTask( 'test', [ 'karma', 'test_results_merger', 'lcov_info_merger', 'jshint' ] );
   grunt.registerTask( 'apidoc', [ 'clean:apidoc', 'laxar_dox' ] );

   grunt.registerTask( 'default', [ 'test', 'apidoc' ] );
};
