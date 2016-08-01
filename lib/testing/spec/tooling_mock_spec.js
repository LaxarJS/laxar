/**
 * Copyright 2016 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
import { tabulate } from '../../utilities/object';
import {
   createCollectors as createToolingCollectorsMock,
   createProviders as createToolingProvidersMock
} from '../tooling_mock';

describe( 'A tooling mock', () => {

   let toolingCollectorsMock;
   let toolingProvidersMock;

   beforeEach( () => {
      toolingCollectorsMock = createToolingCollectorsMock();
      toolingProvidersMock = createToolingProvidersMock();
   } );

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   it( 'spies on page-info collectors', () => {
      expect( toolingCollectorsMock.pages ).toEqual( tabulate(
         () => jasmine.any( Function ), [
            'collectWidgetDescriptor', 'collectPageDefinition', 'collectCompositionDefinition',
            'collectCurrentPage', 'enable', 'disable', 'addListener', 'removeListener', 'current'
         ]
      ) );
   } );

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   it( 'spies on page-info providers', () => {
      expect( toolingProvidersMock.pages ).toEqual( tabulate(
         () => jasmine.any( Function ), [
            'enable', 'disable', 'addListener', 'removeListener', 'current'
         ]
      ) );
   } );

} );
