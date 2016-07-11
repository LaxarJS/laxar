/**
 * Copyright 2016 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
export default {
   sourceData: {
      places: {
         entry: {
            entryPoints: {
               myEntry1: 'editor',
               myEntry2: 'evaluation'
            }
         },
         backdoor: {
            redirectTo: 'editor'
         },
         welcome: {
            page: 'welcome',
            targets: {
               home: 'entry',
               next: 'editor'
            }
         },
         'editor/:dataId': {
            page: 'editor',
            targets: {
               home: 'entry',
               back: 'welcome',
               next: 'evaluation'
            }
         },
         'evaluation/:dataId/:method': {
            page: 'evaluation',
            targets: {
               home: 'entry',
               back: 'editor',
               next: 'exit'
            }
         },
         'exit/:dataId/:method': {
            exitPoint: 'save'
         }
      }
   },
   processed: {
      entryPlace: {
         entryPoints: {
            myEntry1: 'editor',
            myEntry2: 'evaluation'
         },
         expectedParameters: [],
         id: 'entry',
         targets: {
            _self: 'entry'
         }
      },
      backdoorPlace: {
         redirectTo: 'editor',
         expectedParameters: [],
         id: 'backdoor',
         targets: {
            _self: 'backdoor'
         }
      },
      welcomePlace: {
         page: 'welcome',
         expectedParameters: [],
         id: 'welcome',
         targets: {
            _self: 'welcome',
            home: 'entry',
            next: 'editor'
         }
      },
      editorPlace: {
         page: 'editor',
         expectedParameters: [ 'dataId' ],
         id: 'editor/:dataId',
         targets: {
            _self: 'editor',
            home: 'entry',
            back: 'welcome',
            next: 'evaluation'
         }
      },
      evaluationPlace: {
         page: 'evaluation',
         expectedParameters: [ 'dataId', 'method' ],
         id: 'evaluation/:dataId/:method',
         targets: {
            _self: 'evaluation',
            home: 'entry',
            back: 'editor',
            next: 'exit'
         }
      },
      exitPlace: {
         exitPoint: 'save',
         expectedParameters: [ 'dataId', 'method' ],
         id: 'exit/:dataId/:method'
      }
   }

};
