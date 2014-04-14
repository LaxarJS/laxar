/**
 * Copyright 2014 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
/*jshint node: true*/
module.exports = function (grunt) {
   'use strict';

   var pkg = grunt.file.readJSON('package.json');
   var bwr = grunt.file.readJSON('bower.json');
   var src = {
      gruntfile: 'Gruntfile.js',
      require: 'require_config.js',
      laxar: [pkg.name + '.js', 'lib/**/*.js', '!lib/**/spec/**/*.js'],
      specs: ['lib/**/spec/**/*.js'],
      docs: ['docs/**/*.md']
   };

   function karma(lib) {
      var options = {
         files: [
            { pattern: 'bower_components/**', included: false },
            { pattern: 'static/**', included: false},
            { pattern: 'lib/**', included: false },
            { pattern: '*.js', included: false }
         ],
         laxar: {
            specRunner: 'lib/' + lib + '/spec/spec_runner.js',
            requireConfig: src.require
         },
         junitReporter: {
            outputFile: 'lib/' + lib + '/junit.xml'
         }
      };

      return { options: options };
   }

   grunt.initConfig({
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
            reporters: ['junit', 'progress'],
            browsers: ['PhantomJS'],
            singleRun: true
         },
         event_bus: karma('event_bus'),
         'directives-layout': karma('directives/layout'),
         'directives-widget_area': karma('directives/widget_area'),
         file_resource_provider: karma('file_resource_provider'),
         i18n: karma('i18n'),
         json: karma('json'),
         language: karma('language'),
         logging: karma('logging'),
         'portal-modules': karma('portal/modules'),
         'portal-assembler': karma('portal/portal_assembler'),
         testing: karma('testing'),
         text: karma('text'),
         utilities: karma('utilities')
      },
      markdown: {
         docs: {
            files: [ {
               expand: true,
               src: src.docs,
               dest: 'dist/',
               ext: '.html',
               rename: function (dest, src) {
                  return dest + src.replace(/\/README\.html$/, '/index.html');
               }
            } ]
         }
      },
      bower: {
         laxar: {
            rjsConfig: src.require,
            options: {
               baseUrl: './'
            }
         }
      },
      watch: {
         gruntfile: {
            files: src.gruntfile,
            tasks: ['jshint:gruntfile']
         },
         laxar: {
            files: src.laxar,
            tasks: ['jshint:laxar', 'karma']
         },
         specs: {
            files: src.specs,
            tasks: ['jshint:specs', 'karma']
         },
         docs: {
            files: src.docs,
            tasks: ['markdown']
         }
      }
   });

   grunt.loadNpmTasks('grunt-contrib-jshint');
   grunt.loadNpmTasks('grunt-contrib-requirejs');
   grunt.loadNpmTasks('grunt-contrib-watch');
   grunt.loadNpmTasks('grunt-bower-requirejs');
   grunt.loadNpmTasks('grunt-karma');
   grunt.loadNpmTasks('grunt-markdown');

   grunt.registerTask('build', []);
   grunt.registerTask('test', ['karma', 'jshint']);
   grunt.registerTask('default', ['build', 'test']);
};
