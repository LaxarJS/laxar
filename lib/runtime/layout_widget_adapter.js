/**
 * Copyright 2016 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
import ng from 'angular';
import { findWidgetAreas } from './area_helper';

let $rootScope;
const module = ng.module( 'axLayoutWidgetAdapter', [] )
   .run( [ '$rootScope', function( _$rootScope_ ) {
      $rootScope = _$rootScope_;
   } ] );

//////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const name = module.name;
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

      scope = $rootScope.$new();
      scope.widget = widget;

      layoutNode = document.createElement( 'div' );
      layoutNode.id = widget.id;
      layoutNode.className = layout.className;
      layoutNode.innerHTML = htmlTemplate;

      const areasController = pageService.controllerForScope( scope ).areas;
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
