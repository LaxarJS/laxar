import { tabulate } from '../utilities/object';
import { create as createLogMock } from './log_mock';
import { create as createConfigurationMock } from './configuration_mock';

// since they are side-effect-free, we can use the original collectors for simulation
import {
   createCollectors as createToolingCollectors,
   createProviders as createToolingProviders
} from '../tooling/tooling';


export function createCollectors() {
   const collectors = actualCollectors();
   return {
      pages: mockPagesCollector()
   };

   function mockPagesCollector() {
      return tabulate(
         method => spyOn( collectors.pages, method ).and.callThrough(),
         Object.keys( collectors.pages )
      );
   }
}

export function createProviders() {
   const providers = createToolingProviders( actualCollectors() );
   return {
      pages: mockPagesProvider()
   };

   function mockPagesProvider() {
      return tabulate(
         method => spyOn( providers.pages, method ).and.callThrough(),
         Object.keys( providers.pages )
      );
   }
}

function actualCollectors() {
   return createToolingCollectors( createConfigurationMock(), createLogMock() );
}
