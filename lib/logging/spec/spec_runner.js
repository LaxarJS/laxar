/**
 * Copyright 2014 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
(function( global ) {
   'use strict';
   global.laxarSpec = {
      title: 'Logging Specification',
      tests: [
         './console_logger_spec',
         './level_spec',
         './log_context_spec',
         './logger_spec'
      ],
      requireConfig: {}
   };
})( this );
