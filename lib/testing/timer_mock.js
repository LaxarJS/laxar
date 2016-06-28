import { tabulate } from  '../utilities/object';

export function create() {

   const mockTimer = tabulate(
      method => jasmine.createSpy( `mockTimer.${method}` ),
      [ 'stop', 'stopAndLog', 'splitTime' ]
   );

   return {
      started: jasmine.createSpy( 'timer.started' ).and.callFake( () => mockTimer ),
      startedOrResumed: jasmine.createSpy( 'timer.startedOrResumed' ).and.callFake( () => mockTimer ),
      _mockTimer: mockTimer
   };

};
