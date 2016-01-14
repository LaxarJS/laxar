/**
 * Copyright 2016 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
import * as object from '../utilities/object';

export function prohibitAdditionalProperties( schema ) {
   prohibitAdditionalPropertiesRecursively( schema );
}

function prohibitAdditionalPropertiesRecursively( schema ) {
   if( ( 'properties' in schema || 'patternProperties' in schema ) &&
      !( 'additionalProperties' in schema ) ) {
      schema.additionalProperties = false;
   }

   if( 'properties' in schema ) {
      Object.keys( schema.properties ).forEach( function( name ) {
         prohibitAdditionalPropertiesRecursively( schema.properties[ name ] );
      } );
   }

   if( 'additionalProperties' in schema && typeof schema.additionalProperties === 'object' ) {
      prohibitAdditionalPropertiesRecursively( schema.additionalProperties );
   }

   if( 'patternProperties' in schema ) {
      Object.keys( schema.patternProperties ).forEach( function( pattern ) {
         prohibitAdditionalPropertiesRecursively( schema.patternProperties[ pattern ] );
      } );
   }

   if( 'items' in schema ) {
      prohibitAdditionalPropertiesRecursively( schema.items );
   }
}
