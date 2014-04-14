/**
 * Copyright 2014 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
define( [
   './lib/logging/log',
   './lib/logging/channels/console_logger',
   './lib/directives/directives',
   './lib/text/text',
   './lib/i18n/i18n',
   './lib/utilities/assert',
   './lib/utilities/array',
   './lib/utilities/object',
   './lib/utilities/storage',
   './lib/utilities/string',
   './lib/portal/configuration',
   './lib/portal/portal', // no arg
   './lib/portal/portal_dependencies' // no arg
], function(
   log,
   consoleLogger,
   directives,
   text,
   i18n,
   assert,
   array,
   object,
   storage,
   string,
   configuration
) {
   'use strict';

   var laxar = {
      log: log,
      configuration: configuration,
      directives: directives,
      text: text,
      i18n: i18n,
      assert: assert,
      array: array,
      object: object,
      storage: storage,
      string: string
   };

   return laxar;
   
} );
