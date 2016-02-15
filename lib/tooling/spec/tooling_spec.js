/**
 * Copyright 2016 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
define( [
   '../pages'
], function( pageTooling ) {
   'use strict';

   describe( 'The page tooling API', function() {

      beforeEach( function() {
         pageTooling.enable();
         pageTooling.setPageDefinition( 'p', { name: 'my page' }, pageTooling.FLAT );
         pageTooling.setWidgetDescriptor( 'w', { name: 'w' } );
         pageTooling.setCurrentPage( 'p' );
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'allows to access page definitions by reference', function() {
         expect( pageTooling.current().pageDefinitions.p[ pageTooling.FLAT ] ).toEqual( { name: 'my page' } );
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

      describe( 'with registered listeners, on page change', function() {

         var observedPageInfo_;

         beforeEach( function() {
            pageTooling.addListener( function( pageInfo ) {
               observedPageInfo_ = pageInfo;
            } );
            pageTooling.setPageDefinition( 'x', { name: 'x' }, pageTooling.FLAT );
            pageTooling.setCurrentPage( 'x' );
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'notifies listeners', function() {
            expect( observedPageInfo_ ).toBeDefined();
            expect( observedPageInfo_.pageReference ).toEqual( 'x' );
         } );

         it( 'cleans up data of previous pages', function() {
            expect( pageTooling.current().pageDefinitions.p ).not.toBeDefined();
         } );

      } );

   } );

} );
