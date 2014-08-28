/**
 * Copyright 2014 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
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
