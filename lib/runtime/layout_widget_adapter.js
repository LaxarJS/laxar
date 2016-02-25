/**
 * Copyright 2016 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
import { findWidgetAreas } from './area_helper';

export function create( pageService, layout, widget ) {

   const exports = {
      createController: createController,
      domAttachTo: domAttachTo,
      domDetach: domDetach,
      destroy: destroy
   };
   let layoutNode;
   let scope;
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
      layoutNode.className = layout.className;
      layoutNode.innerHTML = htmlTemplate;

      const areasController = pageService.controllerForScope(  ).areas;
      const areas = findWidgetAreas( layoutNode );
      const deregisterFuncs = Object.keys( areas )
         .map( areaName => areasController.register( `${widget.id}.${areaName}`, areas[ areaName ] ) );
      deregister = () => deregisterFuncs.forEach( func => func() );

      areaElement.appendChild( layoutNode );
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function domDetach() {
      layoutNode.remove();
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function destroy() {
      if( scope ){
         scope.$destroy();
      }
      deregister();
      layoutNode = null;
      scope = null;
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   return exports;

}
