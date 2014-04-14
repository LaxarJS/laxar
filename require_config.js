var require = {
   baseUrl: './',
   deps: [
      'bower_components/es5-shim/es5-shim',
      'bower_components/modernizr/modernizr'
   ],
   shim: {
      angular: {
         deps: [
            'jquery'
         ],
         exports: 'angular'
      },
      'angular-mocks': {
         deps: [
            'angular'
         ],
         init: function ( angular ) {
            'use strict';
            return angular.mock;
         }
      },
      'angular-route': {
         deps: [
            'angular'
         ],
         init: function ( angular ) {
            'use strict';
            return angular.route;
         }
      },
      'angular-sanitize': {
         deps: [
            'angular'
         ],
         init: function ( angular ) {
            'use strict';
            return angular;
         }
      },
      underscore: {
         exports: '_',
         init: function () {
            'use strict';
            return this._.noConflict();
         }
      }
   },
   packages: [
      {
         name: 'laxar',
         location: '.',
         main: 'laxar'
      }
   ],
   paths: {
      underscore: 'bower_components/underscore/underscore',
      text: 'bower_components/requirejs-plugins/lib/text',
      requirejs: 'bower_components/requirejs/require',
      q_mock: 'bower_components/q_mock/q',
      json: 'bower_components/requirejs-plugins/src/json',
      jquery: 'bower_components/jquery/dist/jquery',
      'angular-mocks': 'bower_components/angular-mocks/angular-mocks',
      'angular-route': 'bower_components/angular-route/angular-route',
      'angular-sanitize': 'bower_components/angular-sanitize/angular-sanitize',
      angular: 'bower_components/angular/angular',
      jasmine: 'bower_components/jasmine/lib/jasmine-core/jasmine',

      'laxar-application': 'static/testing/application'
   }
};
