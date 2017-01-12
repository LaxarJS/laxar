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
  *   an object with a `widget.id`.
  *
  * @return {AxVisibilityMock}
  *   an `axVisibility`-compatible mock object
  */
export function create( context ) {

   return {
      isVisible: jasmine.createSpy( 'areaHelper.isVisible' ).and.returnValue( false ),
      register: jasmine.createSpy( 'areaHelper.register' ),
      fullName( localName ) {
         return `${context.widget.id}.${localName}`;
      },
      localName( fullName ) {
         return fullName.substring( context.widget.id.length + 1 );
      },
      release: jasmine.createSpy( 'areaHelper.release' )
   };

}
