require.config({
   baseUrl: './',
   deps: ['es5-shim'],
   shim: {
      angular: {
         deps: [
            'jquery'
         ],
         exports: 'angular'
      },
      jquery: {
         exports: 'jQuery'
      }
   },
   paths: {
      angular: 'bower_components/angular/angular',
      'es5-shim': 'bower_components/es5-shim/es5-shim',
      jquery: 'bower_components/jquery/dist/jquery',
      json: 'bower_components/json/json2',
      requirejs: 'bower_components/requirejs/require'
   }
});
