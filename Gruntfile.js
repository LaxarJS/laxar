/**
 * Copyright 2016 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
/* eslint-env node */
/* eslint-disable no-var, object-shorthand */
module.exports = function( grunt ) {
   'use strict';

   var pkg = grunt.file.readJSON( 'package.json' );

   grunt.initConfig( {
      pkg: pkg,
      pkgFile: 'package.json',
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
                  'lib/runtime/services.js'
               ],
               dest: 'docs/api/'
            } ]
         }
      }
   } );

   grunt.loadNpmTasks( 'grunt-contrib-clean' );
   grunt.loadNpmTasks( 'grunt-laxar' );

   grunt.registerTask( 'apidoc', [ 'clean:apidoc', 'laxar_dox' ] );
   grunt.registerTask( 'default', [ 'apidoc' ] );
};
