/////////////////////////////////////////////////////////////////////////////////////////////////////////////
//
//  Copyright (C) 2000-2014
//    by aixigo AG, Aachen, Germany.
//
//  All rights reserved. This material is confidential and proprietary to AIXIGO AG and no part of this
//  material should be reproduced, published in any form by any means, electronic or mechanical including
//  photocopy or any information storage or retrieval system nor should the material be disclosed to third
//  parties without the express written authorization of AIXIGO AG.
//
//  aixigo AG
//  http://www.aixigo.de
//  Aachen, Germany
//
define( [
   '../json_patch_compatibility'
], function( jsonPatchCompatibility ) {
   'use strict';

   describe( 'JsonPatchCompatibility', function() {

      var patches;
      var updates;

      beforeEach( function() {
         patches = [
            { op: 'add', path: '/add/it/here', value: 120 },
            { op: 'remove', path: '/remove/this/0' },
            { op: 'replace', path: '/change/this/to', value: 'cat' }
         ];
         updates = {
            'add.it.here': 120,
            'remove.this.0': null,
            'change.this.to': 'cat'
         };
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      describe( 'jsonPatchToUpdatesMap', function() {

         it( 'transforms patches in json patch syntax to didUpdate updates', function() {
            expect( jsonPatchCompatibility.jsonPatchToUpdatesMap( patches ) ).toEqual( updates );
         } );

      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      describe( 'updatesMapToJsonPatch', function() {

         it( 'transforms didUpdate updates to patches in json patch syntax', function() {
            // "updates" doesn't differentiate between add and replace. To be safe, we just take replace, as
            // we know that the implementation of jsonpatch doesn't check the preconditions.
            patches[0].op = 'replace';
            expect( jsonPatchCompatibility.updatesMapToJsonPatch( updates ) ).toEqual( patches );
         } );

      } );

   } );



} );
