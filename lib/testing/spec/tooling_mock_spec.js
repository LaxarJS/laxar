/**
 * Copyright 2016 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
import { tabulate } from '../../utilities/object';
import { create as createEventBusMock } from '../event_bus_mock';
import { create as createToolingMock } from '../tooling_mock';

describe( 'A tooling mock', () => {

   let debugEventBusMock;
   let toolingMock;

   beforeEach( () => {
      debugEventBusMock = createEventBusMock();
      toolingMock = createToolingMock( debugEventBusMock );
   } );

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   it( 'spies on page-info providers', () => {
      expect( toolingMock.pages ).toEqual( tabulate(
         () => jasmine.any( Function ), [
            'enable', 'disable', 'addListener', 'removeListener', 'current'
         ]
      ) );
   } );

} );
