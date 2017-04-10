/**
 * Copyright 2016 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */

import { tabulate } from '../utilities/object';

// since they are side-effect-free, we can use the original collectors for simulation
import { create as createTooling } from '../tooling/tooling';

export function create( debugEventBus ) {
   const tooling = createTooling( debugEventBus );

   return {
      pages: mockPagesProvider( tooling ),

      forItem: spyOn( tooling, 'forItem' ).and.callFake( (...args) => {
         return mockToolingApi( tooling.forItem( ...args ) );
      } ),
      ...mockToolingApi( tooling ),

      registerDebugInfo: spyOn( tooling, 'registerDebugInfo' ).and.callThrough(),
      registerItem: spyOn( tooling, 'registerItem' ).and.callThrough()
   };

   function mockToolingApi( tooling ) {
      return {
         onChange: spyOn( tooling, 'onChange' ).and.callThrough(),
         unsubscribe: spyOn( tooling, 'unsubscribe' ).and.callThrough()
      };
   }

   function mockPagesProvider( tooling ) {
      return tabulate(
         method => spyOn( tooling.pages, method ).and.callThrough(),
         Object.keys( tooling.pages )
      );
   }
}
