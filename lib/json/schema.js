/**
 * Copyright 2016 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */

export function prohibitAdditionalProperties( schema ) {
   if( ( 'properties' in schema || 'patternProperties' in schema ) &&
      !( 'additionalProperties' in schema ) ) {
      schema.additionalProperties = false;
   }

   if( 'properties' in schema ) {
      Object.keys( schema.properties ).forEach( name => {
         prohibitAdditionalProperties( schema.properties[ name ] );
      } );
   }

   if( 'additionalProperties' in schema && typeof schema.additionalProperties === 'object' ) {
      prohibitAdditionalProperties( schema.additionalProperties );
   }

   if( 'patternProperties' in schema ) {
      Object.keys( schema.patternProperties ).forEach( pattern => {
         prohibitAdditionalProperties( schema.patternProperties[ pattern ] );
      } );
   }

   if( 'items' in schema ) {
      prohibitAdditionalProperties( schema.items );
   }
}
