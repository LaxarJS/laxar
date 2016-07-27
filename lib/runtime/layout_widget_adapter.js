/**
 * Copyright 2016 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
import { findWidgetAreas } from './area_helper';

export function create( areaHelper, className, widget ) {

   const exports = {
      createController,
      domAttachTo,
      domDetach,
      destroy
   };
   let layoutNode;
   let deregister = () => {};

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function createController() {
      // noop
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function domAttachTo( areaElement, htmlTemplate ) {
      if( layoutNode ) {
         areaElement.appendChild( layoutNode );
         return;
      }

      layoutNode = document.createElement( 'div' );
      layoutNode.id = widget.id;
      layoutNode.className = className;
      layoutNode.innerHTML = htmlTemplate;

      const areas = findWidgetAreas( layoutNode );
      const deregisterFuncs = Object.keys( areas )
         .map( areaName => areaHelper.register( `${widget.id}.${areaName}`, areas[ areaName ] ) );
      deregister = () => deregisterFuncs.forEach( func => func() );

      areaElement.appendChild( layoutNode );
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function domDetach() {
      if( layoutNode.parentNode ) {
         layoutNode.parentNode.removeChild( layoutNode );
      }
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function destroy() {
      deregister();
      layoutNode = null;
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   return exports;

}
