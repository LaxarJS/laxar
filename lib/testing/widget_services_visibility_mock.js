/**
 * Copyright 2016 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */

/**
 * Allows to instantiate a mock implementations of {@link AxVisibility}, compatible to the "axVisibility"
 * injection.
 *
 * @module widget_services_assets_mock
 */

import assert from '../utilities/assert';
import { create as createWidgetServicesVisibility } from '../runtime/widget_services_visibility';

/**
 * Creates a mock for the widget-specific "axVisibility" injection.
 *
 * @param {AxContext} context
 *   an object with an `eventBus` and a `widget.area`.
 *
 * @return {AxVisibilityMock}
 *   an `axVisibility`-compatible mock object
 */
export function create( context ) {
   const { eventBus, widget: { area } } = context;
   assert( eventBus ).hasType( Object ).isNotNull();
   assert( area ).hasType( String ).isNotNull();

   /**
    * A mock version of {@link AxVisibility}, the widget-specific "axVisibility" injection.
    *
    * The mock:
    * - spies on the regular methods,
    * - turns the update-methods into no-ops (but you can still inspect their spies),
    * - offers additional `mockShow` and `mockHide` methods, which internally use the context (mock) event bus
    *   to allow testing features that involve `track/onShow/onHide/onChange/unsubscribe`.
    *   If the (mock) event bus has a flush method, using `mockShow` and `mockHide` will automatically flush.
    *
    * @name AxVisibilityMock
    * @constructor
    * @extends AxMock
    */
   const visibility = createWidgetServicesVisibility( context );
   Object.keys( visibility ).forEach( method => {
      if( [ 'updateAreaVisibility', 'updateWidgetVisibility' ].includes( method ) ) {
         spyOn( visibility, method ).and.callFake( () => Promise.resolve() );
      }
      else {
         spyOn( visibility, method ).and.callThrough();
      }
   } );

   /**
    * Simulates the widget's containing area becoming visible.
    * Flushes the underlying event bus mock as a side-effect.
    *
    * @memberof AxVisibilityMock
    * @type {Function}
    */
   visibility.mockShow = mockPublish( true );

   /**
    * Simulates the widget's containing area becoming hidden.
    * Flushes the underlying event bus mock as a side-effect.
    *
    * @memberof AxVisibilityMock
    * @type {Function}
    */
   visibility.mockHide = mockPublish( false );
   return visibility;

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function mockPublish( visible ) {
      return () => {
         eventBus.publish(
            `didChangeAreaVisibility.${area}.${visible}`,
            { area, visible }
         );
         if( eventBus.flush ) {
            eventBus.flush();
         }
      };
   }

}
