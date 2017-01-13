/**
 * Allows to instantiate a mock implementations of {@link AxAreaHelper}, compatible to the "axAreaHelper"
 * widget service injection.
 *
 * @module widget_services_area_helper_mock
 */

 /**
  * Creates a mock for the widget-specific "axAreaHelper" injection.
  *
  * @param {AxContext} context
  *    an object with a `widget.id` property
  *
  * @return {AxVisibilityMock}
  *    an `axVisibility`-compatible mock object
  */
export function create( context ) {

   return {
      isVisible: jasmine.createSpy( 'areaHelper.isVisible' ).and.returnValue( false ),
      register: jasmine.createSpy( 'areaHelper.register' ),
      fullName: jasmine.createSpy( 'areaHelper.fullName' ).and
         .callFake( localName => `${context.widget.id}.${localName}` ),
      localName: jasmine.createSpy( 'areaHelper.localName' ).and
         .callFake( fullName => fullName.substring( context.widget.id.length + 1 ) ),
      release: jasmine.createSpy( 'areaHelper.release' )
   };

}
