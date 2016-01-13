/**
 * Copyright 2016 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
(function( global ) {
   'use strict';
   global.laxarSpec = {
      title: 'Logging Specification',
      tests: [
         './console_channel_spec',
         './log_spec'
      ],
      requireConfig: {},
      widgetJson: false
   };
})( this );
