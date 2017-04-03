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
      forItem: spyOn( tooling, 'forItem' ).and.callThrough(),
      onChange: spyOn( tooling, 'onChange' ).and.callThrough(),
      whenDebugInfoAvailable: spyOn( tooling, 'whenDebugInfoAvailable' ).and.callThrough(),
      registerDebugInfo: spyOn( tooling, 'registerDebugInfo' ).and.callThrough(),
      registerItem: spyOn( tooling, 'registerItem' ).and.callThrough(),
      pages: mockPagesProvider()
   };

   function mockPagesProvider() {
      return tabulate(
         method => spyOn( tooling.pages, method ).and.callThrough(),
         Object.keys( tooling.pages )
      );
   }
}
