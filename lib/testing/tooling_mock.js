/**
 * Copyright 2016 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
import { tabulate } from '../utilities/object';
import { create as createLogMock } from './log_mock';
import { create as createTooling } from '../tooling/tooling';

export const DEFAULT_ITEM_META = { instance: 'test-instance', item: 'test-item-id0' };

export function create(
   debugEventBus,
   logMock = createLogMock()
) {
   const tooling = createTooling( debugEventBus, logMock );
   const forItem = tooling.forItem;
   const registerItem = tooling.registerItem;

   return {
      pages: mockPagesProvider( tooling ),

      forItem: spyOn( tooling, 'forItem' ).and.callFake( itemMeta => {
         if( !itemMeta ) {
            registerItem( DEFAULT_ITEM_META );
         }
         return mockToolingApi( forItem( itemMeta || DEFAULT_ITEM_META ) );
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
