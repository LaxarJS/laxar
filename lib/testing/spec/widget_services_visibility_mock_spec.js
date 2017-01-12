/**
 * Copyright 2016 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
import { create as createWidgetServicesVisibilityMock } from '../widget_services_visibility_mock';
import { create as createEventBusMock } from '../event_bus_mock';

describe( 'An axVisibility mock', () => {

   let eventBusMock;
   let contextMock;
   let visibilityMock;

   describe( 'created from a minimal context', () => {

      beforeEach( () => {
         eventBusMock = createEventBusMock();
         contextMock = {
            eventBus: eventBusMock,
            widget: { area: 'the-area' }
         };
         visibilityMock = createWidgetServicesVisibilityMock( contextMock );
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'provides methods to observe widget mock-visibility', () => {
         expect( visibilityMock.onShow ).toBeDefined();
         expect( visibilityMock.onHide ).toBeDefined();
         expect( visibilityMock.onChange ).toBeDefined();
         expect( visibilityMock.track ).toBeDefined();
         expect( visibilityMock.unsubscribe ).toBeDefined();
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'provides a method to directly query mock-visibility', () => {
         expect( visibilityMock.isVisible ).toBeDefined();
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'initially returns false when asked for visibility', () => {
         expect( visibilityMock.isVisible() ).toBe( false );
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      describe( 'when the mock status was changed', () => {

         beforeEach( () => {
            visibilityMock.mockShow();
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'reflects the mock status when asked for visibility', () => {
            expect( visibilityMock.isVisible() ).toBe( true );
         } );

      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'provides spies to control area visibility', () => {
         expect( visibilityMock.updateAreaVisibility ).toBeDefined();
         expect( visibilityMock.updateAreaVisibility.calls ).toBeDefined();
         expect( visibilityMock.updateWidgetVisibility ).toBeDefined();
         expect( visibilityMock.updateWidgetVisibility.calls ).toBeDefined();
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'provides methods to trigger mock-visibility-changes', () => {
         expect( visibilityMock.mockShow ).toBeDefined();
         expect( visibilityMock.mockHide ).toBeDefined();
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      describe( 'which is being used to track visibility', () => {

         let showSpy;

         beforeEach( () => {
            showSpy = jasmine.createSpy( 'showSpy' );
            visibilityMock.track();
            visibilityMock.onShow( showSpy );
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'initializes like the actual visibility service', () => {
            expect( showSpy ).not.toHaveBeenCalled();
            expect( contextMock.isVisible ).toEqual( false );
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'reflects mock visibility changes', () => {
            visibilityMock.mockShow();
            expect( showSpy ).toHaveBeenCalled();
            expect( contextMock.isVisible ).toEqual( true );
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'allows to unsubscribe change listeners', () => {
            visibilityMock.track( false );
            visibilityMock.unsubscribe( showSpy );
            visibilityMock.mockShow();
            expect( showSpy ).not.toHaveBeenCalled();
            expect( contextMock.isVisible ).toEqual( false );
         } );

      } );

   } );

} );
