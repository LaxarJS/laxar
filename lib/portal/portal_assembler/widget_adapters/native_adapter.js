/**
 * Copyright 2014 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
define( [ '../../../utilities/assert' ], function( assert ) {
   'use strict';

   function create( q, fileResourceProvider, specification, features, widgetConfiguration, anchorElement ) {
      assert.codeIsUnreachable( 'The native widget adapter has not been implemented yet.' );
   }

   return {
      create: create
   };

} );