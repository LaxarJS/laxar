/**
 * Copyright 2014 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
define( [
   './level',
   './logger',
   './channels/console_logger'
], function( level, loggerFactory, consoleLogger ) {
   'use strict';

   var logger = loggerFactory.create();

   // Additional convenience properties
   logger.level = level;
   logger.channels = {
      console: consoleLogger
   };

   return logger;

} );