/**
 * Copyright 2014 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
define( {
   'themes': {
      'green.theme': {
         'widgets': {
            'portal': {
               'super_green_widget': {
                  'super_green_widget.html': 'file',
                  'css': {
                     'super_green_widget.css': 'file'
                  }
               },
               'mixed_widget': {
                  'css': {
                     'mixed_widget.css': 'file'
                  }
               }
            }
         }
      }
   },
   'widgets': {
      'portal': {
         'super_default_widget': {
            'widget.json': 'file',
            'package.json': 'file',
            'super_default_widget.js': 'file',
            'default.theme': {
               'super_default_widget.html': 'file',
               'css': {
                  'super_default_widget.css': 'file'
               }
            }
         },
         'super_green_widget': {
            'widget.json': 'file',
            'package.json': 'file',
            'super_green_widget.js': 'file',
            'default.theme': {
               'super_green_widget.html': 'file',
               'css': {
                  'super_green_widget.css': 'file'
               }
            }
         },
         'mixed_widget': {
            'widget.json': 'file',
            'package.json': 'file',
            'mixed_widget.js': 'file',
            'default.theme': {
               'mixed_widget.html': 'file',
               'css': {
                  'mixed_widget.css': 'file'
               }
            }
         },
         'super_activity': {
            'widget.json': 'file',
            'package.json': 'file',
            'super_activity.js': 'file'
         }
      }
   }
} );
