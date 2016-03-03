/*eslint no-var:0*/
/*global require*/
var Builder = require('systemjs-builder');

// optional constructor options
// sets the baseURL and loads the configuration file
var builder = new Builder('.', 'system.config.js');

builder.config({});

builder
   .bundle('laxar', 'laxar-dist.js')
   .then(function () {
      console.log('Build complete');
   })
   .catch(function (err) {
      console.log('Build error');
      console.log(err);
   });
