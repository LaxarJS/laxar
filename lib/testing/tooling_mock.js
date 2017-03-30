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
      pages: mockPagesProvider()
   };

   function mockPagesProvider() {
      return tabulate(
         method => spyOn( tooling.pages, method ).and.callThrough(),
         Object.keys( tooling.pages )
      );
   }
}
