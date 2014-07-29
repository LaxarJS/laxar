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
define( [], function() {
   'use strict';

   function jsonPatchToUpdatesMap( patches ) {
      var updates = {};
      patches.forEach( function( patch ) {
         var path = patch.path.substr( 1 ).replace( /\//g, '.' );
         switch( patch.op ) {
            case 'add': // fall through
            case 'replace':
               updates[ path ] = patch.value;
               break;

            case 'remove':
               updates[ path ] = null;
               break;

            default:
               throw new Error( 'Unsupported operation "' + patch.op + '".' );
         }
      } );
      return updates;
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function updatesMapToJsonPatch( updates ) {
      return Object.keys( updates ).map( function( key ) {
         var path = '/' + key.replace( /\./g, '/' );
         if( updates[ key ] === null ) {
            return { op: 'remove', path: path };
         }
         else {
            return { op: 'replace', path: path, value: updates[ key ] };
         }
      } );
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   return {
      jsonPatchToUpdatesMap: jsonPatchToUpdatesMap,
      updatesMapToJsonPatch: updatesMapToJsonPatch
   };

} );
