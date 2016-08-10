/**
 * Copyright 2016 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */

import { tabulate } from '../utilities/object';

export function create() {

   const mockTimer = tabulate(
      method => jasmine.createSpy( `mockTimer.${method}` ),
      [ 'stop', 'stopAndLog', 'splitTime' ]
   );

   return {
      started: jasmine.createSpy( 'timer.started' ).and.callFake( () => mockTimer ),
      _mockTimer: mockTimer
   };

}
