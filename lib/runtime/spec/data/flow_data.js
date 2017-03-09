/**
 * Copyright 2016 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
export default {
   places: {
      entry: {
         redirectTo: 'editor'
      },
      backdoor: {
         redirectToPath: '/evaluation/123/method/sum'
      },
      welcome: {
         page: 'dir/welcome',
         targets: {
            home: 'entry',
            next: 'editor'
         }
      },
      editor: {
         patterns: [ '/editor/:dataId' ],
         page: 'editor',
         targets: {
            home: 'entry',
            back: 'welcome',
            next: 'evaluation'
         }
      },
      evaluation: {
         patterns: [ '/evaluation/:dataId/method/:method', '/evaluation/:dataId' ],
         page: 'evaluation',
         targets: {
            home: 'entry',
            back: 'editor',
            next: 'welcome'
         }
      },
      'step-with-options': {
         patterns: [ '/step-with-options/:taskId' ],
         page: 'steps/step2',
         targets: {
            'back': 'welcome'
         },
         defaultParameters: {
            'optionA': 'aDefault',
            'param-b': null,
            'c&d': 'some stuff'
         }
      }
   }
};
