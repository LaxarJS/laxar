var require = {
   baseUrl: './',
   deps: [],
   packages: [
      {
         name: 'laxar',
         location: '.',
         main: 'laxar'
      }
   ],
   paths: {
      angular: 'bower_components/angular/angular',
      'angular-mocks': 'bower_components/angular-mocks/angular-mocks',
      'angular-route': 'bower_components/angular-route/angular-route',
      'angular-sanitize': 'bower_components/angular-sanitize/angular-sanitize',
      jjv: 'bower_components/jjv/lib/jjv',
      jjve: 'bower_components/jjve/jjve',
      json: 'bower_components/requirejs-plugins/src/json',
      requirejs: 'bower_components/requirejs/require',
      text: 'bower_components/requirejs-plugins/lib/text',

      // testing-specific paths:
      'laxar-application': 'static/testing/application',
      jasmine: 'bower_components/jasmine/lib/jasmine-core/jasmine',
      q_mock: 'bower_components/q_mock/q',
      jquery: 'bower_components/jquery/dist/jquery'
   },
   shim: {
      angular: {
         deps: [],
         exports: 'angular'
      },
      'angular-mocks': {
         deps: [ 'angular' ],
         init: function ( angular ) {
            'use strict';
            return angular.mock;
         }
      },
      'angular-route': {
         deps: [ 'angular' ],
         init: function ( angular ) {
            'use strict';
            return angular.route;
         }
      },
      'angular-sanitize': {
         deps: [ 'angular' ],
         init: function ( angular ) {
            'use strict';
            return angular;
         }
      }
   }
};
