/**
 * Copyright 2016 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
export default {
   places: {
      entry: {
         redirectTo: 'editor',
         redirectParameters: {
            dataId: null
         }
      },
      backdoor: {
         redirectTo: 'editor'
      },
      cologne: {
         redirectTo: 'editor',
         redirectParameters: {
            dataId: 4711
         }
      },
      welcome: {
         page: 'welcome',
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
         queryParameters: {
            'optionA': 'aDefault',
            'param-b': null,
            'c&d': 'some stuff'
         }
      }
   }
};
