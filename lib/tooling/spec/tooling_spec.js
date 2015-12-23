/**
 * Copyright 2015 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
define( [
   '../pages'
], function( pageTooling ) {
   'use strict';

   describe( 'The page tooling API', function() {

      beforeEach( function() {
         pageTooling.setPageDefinition( 'p', { name: 'my page' }, pageTooling.FLAT );
         pageTooling.setPageDefinition( 'x', { name: 'x' }, pageTooling.FLAT );
         pageTooling.setWidgetDescriptor( 'w', { name: 'w' } );
         pageTooling.setCurrentPage( 'p' );
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'allows to access page definitions by reference', function() {
         expect( pageTooling.current().pageDefinitions.p[ pageTooling.FLAT ] ).toEqual( { name: 'my page' } );
            expect( pageTooling.current().pageDefinitions.x[ pageTooling.FLAT ] ).toEqual( { name: 'x' } );
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'allows to access widget descriptors by reference', function() {
         expect( pageTooling.current().widgetDescriptors.w ).toEqual( { name: 'w' } );
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'allows to access the current page reference', function() {
         expect( pageTooling.current().pageReference ).toEqual( 'p' );
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      describe( 'with registered listeners', function() {

         var observedPageInfo_;

         beforeEach( function() {
            pageTooling.addListener( function( pageInfo ) {
               observedPageInfo_ = pageInfo;
            } );
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'notifies listeners about page changes', function() {
            pageTooling.setCurrentPage( 'x' );
            expect( observedPageInfo_ ).toBeDefined();
            expect( observedPageInfo_.pageReference ).toEqual( 'x' );
         } );

      } );

   } );

} );
